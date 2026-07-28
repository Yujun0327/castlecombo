import { describe, expect, it } from 'vitest'
import { cardById, CARDS } from '../src/data'
import {
  applyMove,
  allocatePurses,
  computeResult,
  effectiveCost,
  legalCells,
  legalMoves,
  normalize,
  publicHash,
  scoreBreakdown,
  createGame,
  FACEDOWN_GOLD,
  FACEDOWN_KEYS,
  KINGDOM_CARDS,
  START_GOLD,
  START_KEYS,
} from '../src/engine'
import type { GameState, Move, Placement, PlayerState } from '../src/engine'
import { makeConfig, newGame } from './helpers'

/* ------------------------------------------------------------------ */
/* fixtures                                                            */
/* ------------------------------------------------------------------ */

const byName = (name: string) => CARDS.find((c) => c.name === name)!

function player(overrides: Partial<PlayerState> = {}): PlayerState {
  return { gold: START_GOLD, keys: START_KEYS, placed: [], ...overrides }
}

/** A minimal hand-built state for reducer edge cases. */
function fixture(overrides: Partial<GameState> = {}): GameState {
  return {
    players: [player(), player()],
    turn: 0,
    startingSeat: 0,
    decks: { castle: [10, 11], village: [110, 111] },
    rows: { castle: [0, 1, 2], village: [100, 101, 102] },
    discard: { castle: [], village: [] },
    messenger: 'village',
    keyUsedThisTurn: false,
    rngState: 12345,
    result: null,
    ...overrides,
  }
}

function up(card: number, x: number, y: number): Placement {
  return { card, x, y, faceDown: false, purseGold: 0 }
}

/* ------------------------------------------------------------------ */

describe('setup', () => {
  it('is deterministic per seed and differs across seeds', () => {
    expect(publicHash(newGame(3, 7))).toBe(publicHash(newGame(3, 7)))
    expect(publicHash(newGame(3, 7))).not.toBe(publicHash(newGame(3, 8)))
  })

  it('deals 3 cards per row from the right decks', () => {
    const g = newGame(2)
    expect(g.rows.castle).toHaveLength(3)
    expect(g.rows.village).toHaveLength(3)
    for (const id of g.rows.castle) expect(cardById.get(id!)!.deck).toBe('castle')
    for (const id of g.rows.village) expect(cardById.get(id!)!.deck).toBe('village')
  })

  it('starts players with 15 gold, 2 keys and the messenger at the village row (RL-6)', () => {
    const g = newGame(4)
    expect(g.players).toHaveLength(4)
    for (const p of g.players) {
      expect(p.gold).toBe(START_GOLD)
      expect(p.keys).toBe(START_KEYS)
      expect(p.placed).toEqual([])
    }
    expect(g.messenger).toBe('village')
  })
})

describe('grid legality', () => {
  it('first card goes anywhere (canonically the origin)', () => {
    expect(legalCells([])).toEqual([{ x: 0, y: 0 }])
  })

  it('later cards need orthogonal adjacency', () => {
    const cells = legalCells([up(0, 0, 0)])
    expect(cells).toHaveLength(4)
    expect(cells).toContainEqual({ x: 1, y: 0 })
    expect(cells).not.toContainEqual({ x: 1, y: 1 })
  })

  it('never lets the bounding box exceed 3×3', () => {
    // a full horizontal stripe: x ∈ {0,1,2} — no cell at x=-1 or x=3
    const stripe = [up(0, 0, 0), up(1, 1, 0), up(2, 2, 0)]
    const cells = legalCells(stripe)
    expect(cells.every((c) => c.x >= 0 && c.x <= 2)).toBe(true)
    expect(cells).toContainEqual({ x: 0, y: 1 })
    // grown to two stripes, y is then also pinned to the 3-band
    const two = [...stripe, up(3, 0, 1), up(4, 1, 1), up(5, 2, 1)]
    expect(legalCells(two).every((c) => c.y >= -1 && c.y <= 2)).toBe(true)
  })

  it('negative coordinates are fine — the window slides (R4.1)', () => {
    const cells = legalCells([up(0, 0, 0)])
    expect(cells).toContainEqual({ x: -1, y: 0 })
  })

  it('a full kingdom offers no cells', () => {
    const full = Array.from({ length: KINGDOM_CARDS }, (_, i) => up(i, i % 3, Math.floor(i / 3)))
    expect(legalCells(full)).toEqual([])
  })
})

describe('key grammar', () => {
  it('switch flips the messenger and consumes the key once', () => {
    const g = fixture()
    const s1 = applyMove(g, 0, { type: 'useKey', action: 'switch' })
    expect(s1.messenger).toBe('castle')
    expect(s1.players[0].keys).toBe(START_KEYS - 1)
    expect(s1.keyUsedThisTurn).toBe(true)
    expect(() => applyMove(s1, 0, { type: 'useKey', action: 'switch' })).toThrow(/already/)
  })

  it('refresh discards the active row and redraws deterministically', () => {
    const g = fixture()
    const a = applyMove(g, 0, { type: 'useKey', action: 'refresh' })
    const b = applyMove(g, 0, { type: 'useKey', action: 'refresh' })
    expect(publicHash(a)).toBe(publicHash(b))
    // deck held [110, 111] (top = end): two clean reveals, then the deck is
    // dry and the just-discarded row shuffles straight back in for the third
    expect(a.rows.village[0]).toBe(111)
    expect(a.rows.village[1]).toBe(110)
    expect([100, 101, 102]).toContain(a.rows.village[2])
    const everywhere = [
      ...a.rows.village.filter((c): c is number => c !== null),
      ...a.decks.village,
      ...a.discard.village,
    ]
    expect(new Set(everywhere)).toEqual(new Set([100, 101, 102, 110, 111]))
  })

  it('refresh reshuffles the discard when the deck runs dry (RL-5)', () => {
    const g = fixture({
      decks: { castle: [10, 11], village: [] },
      discard: { castle: [], village: [120, 121, 122, 123] },
    })
    const s = applyMove(g, 0, { type: 'useKey', action: 'refresh' })
    // old row (100,101,102) discarded, then the pool reshuffles and 3 reveal
    const everywhere = [
      ...s.rows.village.filter((c): c is number => c !== null),
      ...s.decks.village,
      ...s.discard.village,
    ]
    expect(new Set(everywhere)).toEqual(new Set([100, 101, 102, 120, 121, 122, 123]))
    expect(s.rows.village.every((c) => c !== null)).toBe(true)
  })

  it('requires a key and forbids switching to a dead row', () => {
    const broke = fixture({ players: [player({ keys: 0 }), player()] })
    expect(() => applyMove(broke, 0, { type: 'useKey', action: 'switch' })).toThrow(/no key/)
    const dead = fixture({
      rows: { castle: [null, null, null], village: [100, 101, 102] },
      decks: { castle: [], village: [] },
    })
    expect(() => applyMove(dead, 0, { type: 'useKey', action: 'switch' })).toThrow(/dead/)
  })

  it('the key gate resets when the turn advances', () => {
    const g = fixture()
    const s1 = applyMove(g, 0, { type: 'useKey', action: 'switch' })
    const s2 = applyMove(s1, 0, { type: 'buy', slot: 0, x: 0, y: 0 })
    expect(s2.keyUsedThisTurn).toBe(false)
    expect(s2.turn).toBe(1)
  })
})

describe('buy and take-face-down', () => {
  it('buying pays the cost and places the card', () => {
    const g = fixture()
    const id = g.rows.village[0]!
    const s = applyMove(g, 0, { type: 'buy', slot: 0, x: 0, y: 0 })
    const cost = cardById.get(id)!.cost
    // onBuy effects may add gold back; assert placement + lower bound
    expect(s.players[0].placed).toContainEqual(up(id, 0, 0))
    expect(s.players[0].gold).toBeGreaterThanOrEqual(START_GOLD - cost)
    expect(s.turn).toBe(1)
  })

  it('face-down grants +6 gold +2 keys and a scoreless card (RL-2)', () => {
    const g = fixture()
    const s = applyMove(g, 0, { type: 'takeFacedown', slot: 1, x: 0, y: 0 })
    expect(s.players[0].gold).toBe(START_GOLD + FACEDOWN_GOLD)
    expect(s.players[0].keys).toBe(START_KEYS + FACEDOWN_KEYS)
    expect(s.players[0].placed[0].faceDown).toBe(true)
  })

  it('refills the emptied slot from the same deck', () => {
    const g = fixture()
    const s = applyMove(g, 0, { type: 'takeFacedown', slot: 0, x: 0, y: 0 })
    expect(s.rows.village[0]).toBe(111) // deck top = end of array
    expect(s.decks.village).toEqual([110])
  })

  it('rejects illegal cells, empty slots, unaffordable buys, and the wrong seat', () => {
    const g = fixture()
    expect(() => applyMove(g, 0, { type: 'buy', slot: 0, x: 5, y: 5 })).toThrow(/cell/)
    const gap = fixture({ rows: { castle: [0, 1, 2], village: [null, 101, 102] } })
    expect(() => applyMove(gap, 0, { type: 'takeFacedown', slot: 0, x: 0, y: 0 })).toThrow(/empty/)
    const broke = fixture({ players: [player({ gold: 0 }), player()] })
    expect(cardById.get(broke.rows.village[2]!)!.cost).toBeGreaterThan(0)
    expect(() => applyMove(broke, 0, { type: 'buy', slot: 2, x: 0, y: 0 })).toThrow(/afford/)
    expect(() => applyMove(g, 1, { type: 'buy', slot: 0, x: 0, y: 0 })).toThrow(/turn/)
  })

  it('messenger icon moves the pawn — also on face-down takes (RL-8, RL-12)', () => {
    const fisherman = byName('Fisherman') // confirmed messenger icon: pawn toggles rows
    const g = fixture({ rows: { castle: [0, 1, 2], village: [fisherman.id, 101, 102] } })
    expect(applyMove(g, 0, { type: 'buy', slot: 0, x: 0, y: 0 }).messenger).toBe('castle')
    expect(applyMove(g, 0, { type: 'takeFacedown', slot: 0, x: 0, y: 0 }).messenger).toBe('castle')
  })
})

describe('discounts and effects', () => {
  it('discount banners are cumulative, scope-aware, future-only, floored at 0 (RL-4)', () => {
    const squire = byName('Squire') // banner: all
    const stonemason = byName('Stonemason') // banner: village
    const philosopher = byName('Philosopher') // banner: castle
    const nun = byName('Nun') // village, cost 3
    const duchess = byName('Duchess') // castle, cost 5
    expect(effectiveCost([], nun.id)).toBe(3)
    const banners = [up(squire.id, 0, 0), up(stonemason.id, 1, 0), up(philosopher.id, 2, 0)]
    expect(effectiveCost(banners, nun.id)).toBe(1) // all + village apply, castle does not
    expect(effectiveCost(banners, duchess.id)).toBe(3) // all + castle apply
    // a banner never discounts its own purchase, and cost floors at 0
    expect(effectiveCost([up(squire.id, 0, 0)], squire.id)).toBe(0) // cost 0 anyway
    const cheap = [up(squire.id, 0, 0), up(squire.id, 1, 0), up(stonemason.id, 2, 0), up(stonemason.id, 0, 1)]
    expect(effectiveCost(cheap, nun.id)).toBe(0)
  })

  it('a per-shield immediate effect counts the just-placed card itself (RL-4)', () => {
    const jester = byName('Jester') // +2 gold per noble shield, carries one itself
    const g = fixture({ rows: { castle: [jester.id, 1, 2], village: [100, 101, 102] }, messenger: 'castle' })
    const s = applyMove(g, 0, { type: 'buy', slot: 0, x: 0, y: 0 })
    expect(s.players[0].gold).toBe(START_GOLD - jester.cost + 2)
  })

  it('all-opponents effects settle deterministically', () => {
    const majesty = byName('His Majesty') // every opponent gains 1 gold
    const g = fixture({
      players: [player(), player({ gold: 0 }), player()],
      rows: { castle: [majesty.id, 1, 2], village: [100, 101, 102] },
      messenger: 'castle',
    })
    const s = applyMove(g, 0, { type: 'buy', slot: 0, x: 0, y: 0 })
    expect(s.players[1].gold).toBe(1)
    expect(s.players[2].gold).toBe(START_GOLD + 1)
    expect(s.players[0].gold).toBe(START_GOLD - majesty.cost)
  })

  it('either/or effects follow the choice carried on the move (RL-9)', () => {
    const barbarian = byName('Barbarian') // gold per opposing scholar OR 2 keys
    const scholarCard = byName('Inventor') // 1 scholar shield
    const g = fixture({
      players: [player(), player({ placed: [up(scholarCard.id, 0, 0), up(scholarCard.id, 1, 0)] })],
      rows: { castle: [0, 1, 2], village: [barbarian.id, 101, 102] },
    })
    const a = applyMove(g, 0, { type: 'buy', slot: 0, x: 0, y: 0, choice: 'a' })
    expect(a.players[0].gold).toBe(START_GOLD - barbarian.cost + 2) // 2 scholars next door
    const b = applyMove(g, 0, { type: 'buy', slot: 0, x: 0, y: 0, choice: 'b' })
    expect(b.players[0].keys).toBe(START_KEYS + 2)
    expect(() => applyMove(g, 0, { type: 'buy', slot: 0, x: 0, y: 0 })).toThrow(/choice/)
  })

  it('discard-row effects pay the printed cost and refill the gap', () => {
    const executioner = byName('Executioner') // discard from the castle row, gain its cost
    const g = fixture({ rows: { castle: [0, 1, 2], village: [executioner.id, 101, 102] } })
    const victimCost = cardById.get(g.rows.castle[1]!)!.cost
    const s = applyMove(g, 0, { type: 'buy', slot: 0, x: 0, y: 0, discardSlot: 1 })
    expect(s.players[0].gold).toBe(START_GOLD - executioner.cost + victimCost)
    expect(s.discard.castle).toContain(1)
    expect(s.rows.castle[1]).not.toBeNull()
    expect(() => applyMove(g, 0, { type: 'buy', slot: 0, x: 0, y: 0 })).toThrow(/discardSlot/)
  })
})

describe('scoring', () => {
  it('normalizes a slid window back to 0..2', () => {
    const placed = [up(0, -2, -1), up(1, -1, -1), up(2, -2, 0)]
    const pos = normalize(placed)
    expect(pos.get(0)).toEqual({ x: 0, y: 0 })
    expect(pos.get(1)).toEqual({ x: 1, y: 0 })
  })

  it('position scoring reads the normalized grid (R6.4)', () => {
    const spy = byName('Spy') // 6 pts in the middle column
    // spy at raw (-1,-2) inside a full 3×3 spanning (-2..0)²: middle column
    const placed: Placement[] = []
    for (let y = -2; y <= 0; y++) {
      for (let x = -2; x <= 0; x++) {
        placed.push(up(x === -1 && y === -2 ? spy.id : 101, x, y))
      }
    }
    const p = player({ placed, keys: 0, gold: 0 })
    const line = scoreBreakdown(p).cards.find((c) => c.card === spy.id)!
    expect(line.points).toBe(6)
  })

  it('fills purses greedily by rate and keeps the leftover as tiebreak gold (RL-3, RL-10, RL-11)', () => {
    const inn = byName('Innkeeper') // purse @ 2 pts/gold
    const banker = byName('Banker') // purse @ 1 pt/gold-anywhere (goldOnPurses)
    const p = player({ gold: 8, keys: 0, placed: [up(inn.id, 0, 0), up(banker.id, 1, 0)] })
    const { finalPlaced, leftover } = allocatePurses(p)
    expect(finalPlaced[0].purseGold).toBe(5) // best rate filled to PURSE_CAP first
    expect(finalPlaced[1].purseGold).toBe(3) // banker's purse pays via its own scroll
    expect(leftover).toBe(0)
    const rich = player({ gold: 20, keys: 0, placed: [up(inn.id, 0, 0)] })
    expect(allocatePurses(rich).leftover).toBe(15)
    // and the scroll actually pays: 2/coin on the innkeeper, 1/coin-anywhere on the banker
    const b = scoreBreakdown(p)
    expect(b.cards[0].points).toBe(2 * 5)
    expect(b.cards[1].points).toBe(1 * 8)
  })

  it('keys score 1 each; face-down cards score 0', () => {
    const p = player({ keys: 3, gold: 0, placed: [{ card: 0, x: 0, y: 0, faceDown: true, purseGold: 0 }] })
    const b = scoreBreakdown(p)
    expect(b.keyPoints).toBe(3)
    expect(b.cards[0].points).toBe(0)
    expect(b.total).toBe(3)
  })

  it('game ends when all kingdoms hold 9; tiebreak is leftover gold', () => {
    const nine = (base: number) =>
      Array.from({ length: 9 }, (_, i) => ({
        card: base,
        x: i % 3,
        y: Math.floor(i / 3),
        faceDown: true,
        purseGold: 0,
      }))
    const g = fixture({
      players: [
        player({ placed: nine(0).slice(0, 8), gold: 2, keys: 0 }),
        player({ placed: nine(100), gold: 7, keys: 0 }),
      ],
    })
    const s = applyMove(g, 0, { type: 'takeFacedown', slot: 0, x: 2, y: 2 })
    expect(s.result).not.toBeNull()
    // all-face-down kingdoms → 0 card points for both; gold decides
    const r = computeResult(s)
    expect(r.winners).toEqual([0]) // seat 0 took face-down: 2+6=8 gold beats 7
  })
})

describe('legalMoves', () => {
  it('enumerates keys, buys and face-down takes for the acting seat only', () => {
    const g = newGame(2)
    expect(legalMoves(g, 1)).toEqual([])
    const moves = legalMoves(g, 0)
    expect(moves.some((m) => m.type === 'useKey' && m.action === 'switch')).toBe(true)
    expect(moves.some((m) => m.type === 'useKey' && m.action === 'refresh')).toBe(true)
    expect(moves.some((m) => m.type === 'takeFacedown')).toBe(true)
    // every enumerated move is accepted by the reducer
    for (const m of moves) expect(() => applyMove(g, 0, m)).not.toThrow()
  })

  it('offers no second key spend and no moves after the game ends', () => {
    const g = fixture()
    const s = applyMove(g, 0, { type: 'useKey', action: 'switch' })
    expect(legalMoves(s, 0).every((m) => m.type !== 'useKey')).toBe(true)
    const over = fixture({ result: { ranking: [0, 1], winners: [0], breakdown: [] } })
    expect(legalMoves(over, 0)).toEqual([])
  })
})

describe('replay', () => {
  it('a recorded move log folds to the identical state', () => {
    const cfg = makeConfig(2, 99)
    let s = createGame(cfg)
    const log: { actor: number; move: Move }[] = []
    const pick = (n: number) => Math.abs(Math.floor(Math.sin(log.length * 999.1) * 1e6)) % n
    while (!s.result) {
      const moves = legalMoves(s, s.turn)
      expect(moves.length).toBeGreaterThan(0)
      const move = moves[pick(moves.length)]
      log.push({ actor: s.turn, move })
      s = applyMove(s, s.turn, move)
    }
    let replayed = createGame(cfg)
    for (const { actor, move } of log) replayed = applyMove(replayed, actor, move)
    expect(publicHash(replayed)).toBe(publicHash(s))
  })
})

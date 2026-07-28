import { describe, expect, it } from 'vitest'
import { CARDS, NOBLES, SCALING } from '../src/data'
import {
  applyMove,
  autoPayment,
  createGame,
  emptyTokenBag,
  GEMS,
  legalMoves,
  prestige,
  publicHash,
} from '../src/engine'
import type { GameState, Gem, Move } from '../src/engine'
import { makeConfig, newGame } from './helpers'

/** Ids of `count` cards of `gem` (cheapest tiers first) for engineering discounts. */
function cardsOf(gem: Gem, count: number): number[] {
  return CARDS.filter((c) => c.gem === gem)
    .slice(0, count)
    .map((c) => c.id)
}

describe('setup', () => {
  it('scales bank and nobles by player count', () => {
    for (const n of [2, 3, 4] as const) {
      const s = newGame(n)
      for (const g of GEMS) expect(s.bank[g]).toBe(SCALING[n].tokens)
      expect(s.bank.gold).toBe(5)
      expect(s.nobles.length).toBe(n + 1)
      expect(s.players.length).toBe(n)
    }
  })

  it('reveals 4 cards per tier and leaves 36/26/16 in the decks', () => {
    const s = newGame(3)
    expect(s.market.map((row) => row.length)).toEqual([4, 4, 4])
    expect(s.market.flat().every((id) => id !== null)).toBe(true)
    expect(s.decks.map((d) => d.length)).toEqual([36, 26, 16])
  })

  it('is deterministic from the config', () => {
    expect(publicHash(newGame(4, 7))).toBe(publicHash(newGame(4, 7)))
    expect(publicHash(newGame(4, 7))).not.toBe(publicHash(newGame(4, 8)))
  })
})

describe('take', () => {
  it('takes 3 distinct gems', () => {
    const s = applyMove(newGame(2), 0, { type: 'take', gems: ['diamond', 'ruby', 'onyx'] })
    expect(s.players[0].tokens.diamond).toBe(1)
    expect(s.bank.diamond).toBe(3)
    expect(s.turn).toBe(1)
  })

  it('rejects duplicate colors in a 3-take', () => {
    expect(() =>
      applyMove(newGame(2), 0, { type: 'take', gems: ['ruby', 'ruby', 'onyx'] }),
    ).toThrow()
  })

  it('allows 2-of-a-kind only from a stack of at least 4', () => {
    const s = newGame(2) // 2P: stacks of exactly 4
    const after = applyMove(s, 0, { type: 'take', gems: ['ruby', 'ruby'] })
    expect(after.players[0].tokens.ruby).toBe(2)

    const low = newGame(2)
    low.bank.ruby = 3
    expect(() => applyMove(low, 0, { type: 'take', gems: ['ruby', 'ruby'] })).toThrow()
  })

  it('forces short takes when fewer than 3 stacks remain', () => {
    const s = newGame(2)
    s.bank.diamond = 0
    s.bank.sapphire = 0
    s.bank.emerald = 0
    // only ruby and onyx left: a 2-distinct take is legal, a lone take is not
    const takes = legalMoves(s, 0).filter((m): m is Move & { type: 'take' } => m.type === 'take')
    expect(takes.some((m) => m.gems.length === 2 && m.gems[0] !== m.gems[1])).toBe(true)
    expect(takes.some((m) => m.gems.length === 1)).toBe(false)
    expect(() => applyMove(s, 0, { type: 'take', gems: ['ruby'] })).toThrow()
    const after = applyMove(s, 0, { type: 'take', gems: ['ruby', 'onyx'] })
    expect(after.players[0].tokens.ruby).toBe(1)
  })
})

describe('reserve', () => {
  it('reserves a market card, grants gold, and refills the slot', () => {
    const s = newGame(2)
    const id = s.market[0][0]!
    const deckTop = s.decks[0][s.decks[0].length - 1]
    const after = applyMove(s, 0, { type: 'reserve', from: { tier: 1, slot: 0 } })
    expect(after.players[0].reserved).toEqual([{ card: id, blind: false }])
    expect(after.players[0].tokens.gold).toBe(1)
    expect(after.bank.gold).toBe(4)
    expect(after.market[0][0]).toBe(deckTop)
  })

  it('reserves blind from a deck top', () => {
    const s = newGame(2)
    const deckTop = s.decks[2][s.decks[2].length - 1]
    const after = applyMove(s, 0, { type: 'reserve', from: { deck: 3 } })
    expect(after.players[0].reserved).toEqual([{ card: deckTop, blind: true }])
    expect(after.decks[2].length).toBe(15)
  })

  it('is still legal with no gold left, just grants none', () => {
    const s = newGame(2)
    s.bank.gold = 0
    const after = applyMove(s, 0, { type: 'reserve', from: { tier: 1, slot: 0 } })
    expect(after.players[0].tokens.gold).toBe(0)
  })

  it('rejects a 4th reserve and reserving from an empty deck', () => {
    const s = newGame(2)
    s.players[0].reserved = [
      { card: 0, blind: false },
      { card: 1, blind: false },
      { card: 2, blind: false },
    ]
    expect(() => applyMove(s, 0, { type: 'reserve', from: { deck: 1 } })).toThrow()

    const t = newGame(2)
    t.decks[0] = []
    expect(() => applyMove(t, 0, { type: 'reserve', from: { deck: 1 } })).toThrow()
    expect(legalMoves(t, 0).some((m) => m.type === 'reserve' && 'deck' in m.from && m.from.deck === 1)).toBe(false)
  })

  it('leaves the market slot empty when the deck is exhausted', () => {
    const s = newGame(2)
    s.decks[0] = []
    const after = applyMove(s, 0, { type: 'reserve', from: { tier: 1, slot: 2 } })
    expect(after.market[0][2]).toBe(null)
  })
})

describe('purchase', () => {
  it('pays cost minus discounts, colored tokens first', () => {
    const s = newGame(2)
    // card 6: onyx, cost emerald 3
    s.market[0][0] = 6
    s.players[0].tokens.emerald = 2
    s.players[0].cards = cardsOf('emerald', 1) // 1 emerald discount
    const payment = autoPayment(s.players[0], CARDS[6])!
    expect(payment.emerald).toBe(2)
    expect(payment.gold).toBe(0)
    const after = applyMove(s, 0, { type: 'purchase', from: 'market', card: 6, payment })
    expect(after.players[0].cards).toContain(6)
    expect(after.players[0].tokens.emerald).toBe(0)
    expect(after.bank.emerald).toBe(s.bank.emerald + 2)
  })

  it('covers shortfall with gold and accepts voluntary gold substitution', () => {
    const s = newGame(2)
    s.market[0][0] = 6 // cost: emerald 3
    s.players[0].tokens.emerald = 2
    s.players[0].tokens.gold = 2
    const auto = autoPayment(s.players[0], CARDS[6])!
    expect(auto).toMatchObject({ emerald: 2, gold: 1 })
    // voluntary: keep an emerald, spend an extra gold instead
    const custom = { ...emptyTokenBag(), emerald: 1, gold: 2 }
    const after = applyMove(s, 0, { type: 'purchase', from: 'market', card: 6, payment: custom })
    expect(after.players[0].tokens).toMatchObject({ emerald: 1, gold: 0 })
  })

  it('rejects overpay and short pay', () => {
    const s = newGame(2)
    s.market[0][0] = 6 // cost: emerald 3
    s.players[0].tokens.emerald = 5
    expect(() =>
      applyMove(s, 0, {
        type: 'purchase',
        from: 'market',
        card: 6,
        payment: { ...emptyTokenBag(), emerald: 4 },
      }),
    ).toThrow()
    expect(() =>
      applyMove(s, 0, {
        type: 'purchase',
        from: 'market',
        card: 6,
        payment: { ...emptyTokenBag(), emerald: 2 },
      }),
    ).toThrow()
  })

  it('purchases a blind-reserved card', () => {
    const s = newGame(2)
    s.players[0].reserved = [{ card: 6, blind: true }]
    s.players[0].tokens.emerald = 3
    const after = applyMove(s, 0, {
      type: 'purchase',
      from: 'reserved',
      card: 6,
      payment: { ...emptyTokenBag(), emerald: 3 },
    })
    expect(after.players[0].reserved).toEqual([])
    expect(after.players[0].cards).toContain(6)
  })
})

describe('token cap', () => {
  function overCap(): GameState {
    const s = newGame(4) // 7-token stacks
    s.players[0].tokens = { ...emptyTokenBag(), diamond: 4, sapphire: 4, gold: 1 } // 9 held
    s.bank.diamond -= 4
    s.bank.sapphire -= 4
    s.bank.gold -= 1
    return applyMove(s, 0, { type: 'take', gems: ['emerald', 'ruby', 'onyx'] }) // now 12
  }

  it('demands the exact excess back before the turn ends', () => {
    const s = overCap()
    expect(s.pending).toMatchObject({ kind: 'returnTokens', actor: 0, excess: 2 })
    expect(s.turn).toBe(0) // turn has not advanced
    expect(() =>
      applyMove(s, 0, { type: 'return', tokens: { ...emptyTokenBag(), diamond: 1 } }),
    ).toThrow()
    const after = applyMove(s, 0, {
      type: 'return',
      tokens: { ...emptyTokenBag(), diamond: 1, gold: 1 }, // gold is returnable too
    })
    expect(after.pending).toBe(null)
    expect(after.turn).toBe(1)
    expect(after.players[0].tokens.gold).toBe(0)
  })

  it('only offers return moves while pending', () => {
    const s = overCap()
    const moves = legalMoves(s, 0)
    expect(moves.length).toBeGreaterThan(0)
    expect(moves.every((m) => m.type === 'return')).toBe(true)
    expect(legalMoves(s, 1)).toEqual([])
  })
})

describe('nobles', () => {
  it('auto-awards a single qualifying noble at end of turn', () => {
    const s = newGame(2)
    s.nobles = [7] // emerald 4 + ruby 4
    s.players[0].cards = [...cardsOf('emerald', 4), ...cardsOf('ruby', 4)]
    const after = applyMove(s, 0, { type: 'take', gems: ['diamond', 'sapphire', 'onyx'] })
    expect(after.players[0].nobles).toEqual([7])
    expect(after.nobles).toEqual([])
  })

  it('asks the player to choose when several nobles qualify', () => {
    const s = newGame(2)
    s.nobles = [7, 8] // emerald4+ruby4, ruby4+onyx4
    s.players[0].cards = [...cardsOf('emerald', 4), ...cardsOf('ruby', 4), ...cardsOf('onyx', 4)]
    const after = applyMove(s, 0, { type: 'take', gems: ['diamond', 'sapphire', 'onyx'] })
    expect(after.pending).toMatchObject({ kind: 'chooseNoble', actor: 0, options: [7, 8] })
    const chosen = applyMove(after, 0, { type: 'chooseNoble', noble: 8 })
    expect(chosen.players[0].nobles).toEqual([8])
    expect(chosen.nobles).toEqual([7]) // the other stays on display
    expect(chosen.turn).toBe(1)
  })
})

describe('final round and result', () => {
  /** 15+ points of tier-3 ruby cards (4+4+5 = 13… use 3 cards ≥15: 3+4+4+5 ids). */
  function bigCards(): number[] {
    return CARDS.filter((c) => c.tier === 3 && c.gem === 'ruby').map((c) => c.id) // 3+4+4+5 = 16 pts
  }

  it('finishes the round so every player gets equal turns', () => {
    const s = newGame(3) // seats 0,1,2 — starting seat 0
    s.players[1].cards = bigCards() // seat 1 already at 16 prestige
    // seat 0 acts: no final round triggered by someone else's cards
    let cur = applyMove(s, 0, { type: 'take', gems: ['diamond', 'sapphire', 'emerald'] })
    expect(cur.finalRound).toBe(false)
    // seat 1 ends a turn at ≥15: final round begins
    cur = applyMove(cur, 1, { type: 'take', gems: ['diamond', 'sapphire', 'emerald'] })
    expect(cur.finalRound).toBe(true)
    expect(cur.result).toBe(null) // seat 2 still gets a turn
    cur = applyMove(cur, 2, { type: 'take', gems: ['diamond', 'sapphire', 'emerald'] })
    expect(cur.result).not.toBe(null)
    expect(cur.result!.winners).toEqual([1])
  })

  it('lets a later seat overtake during the final round', () => {
    const s = newGame(2)
    s.nobles = []
    s.players[0].cards = bigCards() // 16 pts
    // seat 1: 11 pts of cards + a noble = 14, with a 5-pointer within reach
    s.players[1].cards = CARDS.filter((c) => c.tier === 3 && c.gem === 'emerald')
      .map((c) => c.id)
      .slice(0, 3) // pts 3+4+4 = 11
    s.players[1].nobles = [0]
    s.players[1].tokens = { ...emptyTokenBag(), sapphire: 4, gold: 3 } // 2P bank only holds 4 sapphire
    s.bank.sapphire -= 4
    s.bank.gold -= 3
    const big = CARDS.find((c) => c.tier === 3 && c.gem === 'emerald' && c.points === 5)! // u7 g3
    s.market[2][0] = big.id
    let cur = applyMove(s, 0, { type: 'take', gems: ['diamond', 'emerald', 'ruby'] })
    expect(cur.finalRound).toBe(true)
    cur = applyMove(cur, 1, {
      type: 'purchase',
      from: 'market',
      card: big.id,
      payment: autoPayment(cur.players[1], big)!, // emerald owed covered by 3 discounts
    })
    expect(cur.result).not.toBe(null)
    expect(prestige(cur.players[1])).toBe(19)
    expect(cur.result!.winners).toEqual([1])
  })

  it('breaks prestige ties by fewest development cards', () => {
    const s = newGame(2)
    s.nobles = []
    s.players[0].cards = bigCards() // 16 pts, 4 cards
    s.players[1].cards = [
      ...CARDS.filter((c) => c.tier === 3 && c.gem === 'emerald' && c.points >= 4).map((c) => c.id), // 4+4+5=13
    ]
    s.players[1].nobles = [0] // +3 → 16 pts, 3 cards
    let cur = applyMove(s, 0, { type: 'take', gems: ['diamond', 'sapphire', 'emerald'] })
    cur = applyMove(cur, 1, { type: 'take', gems: ['diamond', 'sapphire', 'emerald'] })
    expect(cur.result!.winners).toEqual([1]) // same 16 pts, fewer cards
  })
})

describe('pass', () => {
  it('is legal only when nothing else is', () => {
    const s = newGame(2)
    expect(() => applyMove(s, 0, { type: 'pass' })).toThrow()

    const stuck = newGame(2)
    stuck.bank = emptyTokenBag() // nothing to take, no gold
    stuck.market = [[null, null, null, null], [null, null, null, null], [null, null, null, null]]
    stuck.decks = [[], [], []]
    const moves = legalMoves(stuck, 0)
    expect(moves).toEqual([{ type: 'pass' }])
    const after = applyMove(stuck, 0, { type: 'pass' })
    expect(after.turn).toBe(1)
  })
})

describe('config plumbing', () => {
  it('starts at the configured seat', () => {
    const s = createGame(makeConfig(3, 42, 2))
    expect(s.turn).toBe(2)
    expect(s.startingSeat).toBe(2)
  })
})

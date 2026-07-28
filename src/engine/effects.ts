import { cardById } from '../data'
import { draw, refill } from './market'
import { PURSE_CAP, SHIELDS } from './types'
import type { Countable, Deck, Effect, GameState, Move, Placement, Seat, Where } from './types'

/**
 * The one countable resolver, shared by immediate effects and scroll
 * scoring so every path agrees on what a scope contains.
 *
 * `at` anchors row/col/adjacent scopes and is itself part of its own
 * row/col/grid. Row/col membership compares raw coords — normalization
 * shifts every card equally, so the relation is invariant; only
 * positional scoring needs the normalized grid.
 *
 * Purse gold is read from the placements themselves — pass a view with
 * topped-up values for end-game scoring (see scoring.ts).
 */
export function countMatches(
  placed: readonly Placement[],
  at: Placement,
  what: Countable,
  where: Where,
  ctx?: { keys?: number },
): number {
  if (what.count === 'keys') return ctx?.keys ?? 0
  if (what.count === 'goldOnThisPurse') return at.purseGold
  if (what.count === 'emptySpaces') return 9 - placed.length

  const scope = placed.filter((p) => {
    switch (where) {
      case 'grid':
        return true
      case 'row':
        return p.y === at.y
      case 'col':
        return p.x === at.x
      case 'rowcol':
        return p.y === at.y || p.x === at.x
      case 'adjacent':
        return Math.abs(p.x - at.x) + Math.abs(p.y - at.y) === 1
    }
  })
  const faceUp = scope.filter((p) => !p.faceDown)

  const shieldCount = (types: readonly string[]) => {
    let n = 0
    for (const p of faceUp) {
      for (const s of cardById.get(p.card)!.shields) if (types.includes(s)) n++
    }
    return n
  }

  switch (what.count) {
    case 'shields':
      return shieldCount(what.shields)
    case 'cards':
      return scope.filter((p) => {
        if (what.faceDown !== undefined && p.faceDown !== what.faceDown) return false
        // a card back is countable as a card, invisible as a character (RL-2)
        if (p.faceDown) {
          return (
            what.deck === undefined &&
            what.cost === undefined &&
            what.costAtLeast === undefined &&
            what.shieldCount === undefined &&
            what.hasBanner === undefined &&
            what.hasPurse === undefined
          )
        }
        const def = cardById.get(p.card)!
        if (what.deck !== undefined && def.deck !== what.deck) return false
        if (what.cost !== undefined && def.cost !== what.cost) return false
        if (what.costAtLeast !== undefined && def.cost < what.costAtLeast) return false
        if (what.shieldCount !== undefined && def.shields.length !== what.shieldCount) return false
        if (what.hasBanner !== undefined && (def.banner !== undefined) !== what.hasBanner) return false
        if (what.hasPurse !== undefined && (def.purse ?? false) !== what.hasPurse) return false
        return true
      }).length
    case 'goldOnPurses':
      return faceUp.reduce((sum, p) => sum + p.purseGold, 0)
    case 'shieldTypes':
      return SHIELDS.filter((s) => shieldCount([s]) > 0).length
    case 'missingShieldTypes':
      return SHIELDS.length - SHIELDS.filter((s) => shieldCount([s]) > 0).length
    case 'sets':
      return Math.min(...what.shields.map((s) => shieldCount([s])))
    case 'sameShieldTriplets':
      return SHIELDS.reduce((sum, s) => sum + Math.floor(shieldCount([s]) / 3), 0)
    case 'deckPairs':
      return Math.min(
        faceUp.filter((p) => cardById.get(p.card)!.deck === 'castle').length,
        faceUp.filter((p) => cardById.get(p.card)!.deck === 'village').length,
      )
  }
}

/**
 * Cost after cumulative "-1" discount banners already in the kingdom.
 * Banners apply only to FUTURE purchases (RL-4), so the bought card's own
 * banner never discounts itself. Floor 0.
 */
export function effectiveCost(placed: readonly Placement[], cardId: number): number {
  const def = cardById.get(cardId)!
  let off = 0
  for (const p of placed) {
    if (p.faceDown) continue
    const banner = cardById.get(p.card)!.banner
    if (banner === 'all' || banner === def.deck) off++
  }
  return Math.max(0, def.cost - off)
}

/** Points-per-gold rate of a purse card's scroll (0 when it has none). */
export function purseRate(cardId: number): number {
  for (const s of cardById.get(cardId)!.scroll ?? []) {
    if (s.kind === 'per' && s.what.count === 'goldOnThisPurse') return s.points
  }
  return 0
}

/**
 * Resolve a bought card's immediate effects in printed order. Mutates
 * `state` (called on the reducer's clone). The just-placed card is already
 * in `placed`, so per-shield gains count it. Player decisions arrive on
 * the move (`choice`, `discardSlot`).
 */
export function resolveEffects(
  state: GameState,
  actor: Seat,
  at: Placement,
  effects: readonly Effect[],
  move: Move & { type: 'buy' },
): void {
  const player = state.players[actor]
  const count = (what: Countable, where: Where) =>
    countMatches(player.placed, at, what, where, { keys: player.keys })

  /** The better neighbouring opponent's count (RL-9: taking the max is always optimal). */
  const neighborCount = (what: Countable): number => {
    const n = state.players.length
    const sides = [...new Set([(actor + 1) % n, (actor + n - 1) % n])].filter((s) => s !== actor)
    const anchor: Placement = { card: at.card, x: NaN, y: NaN, faceDown: false, purseGold: 0 }
    return Math.max(0, ...sides.map((s) => countMatches(state.players[s].placed, anchor, what, 'grid')))
  }

  const ownPurses = () =>
    player.placed.filter((p) => !p.faceDown && cardById.get(p.card)!.purse)

  for (const fx of effects) {
    switch (fx.kind) {
      case 'gold':
        player.gold += fx.amount
        break
      case 'keys':
        player.keys += fx.amount
        break
      case 'goldPer':
        player.gold += fx.amount * count(fx.what, fx.where)
        break
      case 'keysPer':
        player.keys += fx.amount * count(fx.what, fx.where)
        break
      case 'oppGoldPer':
        player.gold += fx.amount * neighborCount(fx.what)
        break
      case 'oppKeysPer':
        player.keys += fx.amount * neighborCount(fx.what)
        break
      case 'eachOpponentGold':
        state.players.forEach((p, s) => {
          if (s !== actor) p.gold = Math.max(0, p.gold + fx.amount)
        })
        break
      case 'eachOpponentKeys':
        state.players.forEach((p, s) => {
          if (s !== actor) p.keys = Math.max(0, p.keys + fx.amount)
        })
        break
      case 'choice': {
        if (move.choice === undefined) throw new Error('choice required')
        resolveEffects(state, actor, at, move.choice === 'a' ? fx.a : fx.b, move)
        break
      }
      case 'fillPurses':
        for (const p of ownPurses()) p.purseGold += Math.min(fx.amount, PURSE_CAP - p.purseGold)
        break
      case 'fillTwoPurses': {
        const best = ownPurses()
          .sort((a, b) => purseRate(b.card) - purseRate(a.card))
          .slice(0, 2)
        for (const p of best) p.purseGold = PURSE_CAP
        break
      }
      case 'discardRow': {
        const slot = move.discardSlot
        const available = state.rows[fx.row].some((c) => c !== null)
        if (!available) break // nothing to discard: the effect fizzles
        if (slot === undefined) throw new Error('discardSlot required')
        const victim = state.rows[fx.row][slot]
        if (victim === null || victim === undefined) throw new Error('empty discard slot')
        state.discard[fx.row].push(victim)
        state.rows[fx.row][slot] = null
        refill(state, fx.row, slot)
        const value = cardById.get(victim)!.cost
        if (fx.gain === 'gold') player.gold += value
        else player.keys += value
        break
      }
    }
  }
  if (player.gold < 0 || player.keys < 0) throw new Error('resource underflow')
}

/** Move-shape requirements a card's effects impose on the buy move. */
export function buyRequirements(cardId: number): { choice: boolean; discardRow: Deck | null } {
  const effects = cardById.get(cardId)!.onBuy ?? []
  let choice = false
  let discardRow: Deck | null = null
  const walk = (list: readonly Effect[]) => {
    for (const fx of list) {
      if (fx.kind === 'choice') {
        choice = true
        walk(fx.a)
        walk(fx.b)
      }
      if (fx.kind === 'discardRow') discardRow = fx.row
    }
  }
  walk(effects)
  return { choice, discardRow }
}

export { draw, refill }

import { cardById } from '../data'
import { SHIELDS } from './types'
import type { Countable, Effect, GameState, Placement, Seat, Where } from './types'

/**
 * The one countable resolver, shared by discounts, immediate effects and
 * scroll scoring so every path agrees on what a scope contains.
 *
 * `at` anchors row/col/adjacent scopes. Row/col membership compares raw
 * coords — normalization shifts every card equally, so the relation is
 * invariant and only positional scoring needs the normalized grid.
 */
export function countMatches(
  placed: readonly Placement[],
  at: Placement,
  what: Countable,
  where: Where,
  ctx?: { keys?: number; purseGold?: number },
): number {
  if (what.count === 'keys') return ctx?.keys ?? 0
  if (what.count === 'goldOnThisPurse') return ctx?.purseGold ?? 0

  const scope = placed.filter((p) => {
    switch (where) {
      case 'grid':
        return true
      case 'row':
        return p.y === at.y
      case 'col':
        return p.x === at.x
      case 'adjacent':
        return Math.abs(p.x - at.x) + Math.abs(p.y - at.y) === 1
    }
  })

  switch (what.count) {
    case 'shields': {
      let n = 0
      for (const p of scope) {
        if (p.faceDown) continue // RL-2: card backs carry no shields
        for (const s of cardById.get(p.card)!.shields) {
          if (what.shields.includes(s)) n++
        }
      }
      return n
    }
    case 'cards':
      return scope.filter((p) => {
        if (what.faceDown !== undefined && p.faceDown !== what.faceDown) return false
        if (p.faceDown) return what.deck === undefined && what.hasPurse === undefined && what.costAtLeast === undefined
        const def = cardById.get(p.card)!
        if (what.deck !== undefined && def.deck !== what.deck) return false
        if (what.hasPurse !== undefined && (def.purse !== undefined) !== what.hasPurse) return false
        if (what.costAtLeast !== undefined && def.cost < what.costAtLeast) return false
        return true
      }).length
    case 'shieldSets': {
      const perType = SHIELDS.map((s) =>
        countMatches(placed, at, { count: 'shields', shields: [s] }, where),
      )
      return Math.min(...perType)
    }
  }
}

/**
 * Cost after the card's printed discount, evaluated against the kingdom
 * BEFORE placement (RL-4). Floor 0.
 */
export function effectiveCost(placed: readonly Placement[], cardId: number): number {
  const def = cardById.get(cardId)!
  if (!def.discount) return def.cost
  // anchor outside the grid: row/col discounts would be meaningless pre-placement,
  // so discounts are expected to use the 'grid' scope (data tests enforce this)
  const anchor: Placement = { card: cardId, x: NaN, y: NaN, faceDown: false }
  const off = def.discount.amount * countMatches(placed, anchor, def.discount.what, def.discount.where)
  return Math.max(0, def.cost - off)
}

/**
 * Resolve a bought card's immediate effects in printed order (R5.1–R5.4).
 * Mutates `state` (called from inside the reducer's cloned state). The
 * just-placed card is already in `placed`, so per-shield gains count it.
 */
export function resolveEffects(state: GameState, actor: Seat, at: Placement, effects: readonly Effect[]): void {
  const player = state.players[actor]
  for (const fx of effects) {
    switch (fx.kind) {
      case 'gold':
        player.gold += fx.amount
        break
      case 'keys':
        player.keys += fx.amount
        break
      case 'goldPer':
        player.gold +=
          fx.amount * countMatches(player.placed, at, fx.what, fx.where, { keys: player.keys })
        break
      case 'eachOpponentGold':
        state.players.forEach((p, s) => {
          if (s !== actor) p.gold = Math.max(0, p.gold + fx.amount)
        })
        break
      case 'goldPerOpponent':
        player.gold += fx.amount * (state.players.length - 1)
        break
    }
  }
  // effects can push gold negative only through bugs, never rules; assert cheaply
  if (player.gold < 0 || player.keys < 0) throw new Error('resource underflow')
}

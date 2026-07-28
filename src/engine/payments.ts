import { cardById } from '../data'
import { NOBLE_POINTS, emptyGemBag, emptyTokenBag, GEMS } from './types'
import type { CardDef, GemBag, PlayerState, TokenBag } from './types'

/** Permanent discounts: one per purchased card of each gem color. */
export function discounts(player: PlayerState): GemBag {
  const bag = emptyGemBag()
  for (const id of player.cards) bag[cardById.get(id)!.gem]++
  return bag
}

export function prestige(player: PlayerState): number {
  let pts = player.nobles.length * NOBLE_POINTS
  for (const id of player.cards) pts += cardById.get(id)!.points
  return pts
}

/** Cost still owed on `card` after discounts (never negative). */
export function effectiveCost(player: PlayerState, card: CardDef): GemBag {
  const disc = discounts(player)
  const owed = emptyGemBag()
  for (const g of GEMS) owed[g] = Math.max(0, (card.cost[g] ?? 0) - disc[g])
  return owed
}

/**
 * Default payment: colored tokens first, gold only to cover the shortfall.
 * Null if the player cannot afford the card.
 */
export function autoPayment(player: PlayerState, card: CardDef): TokenBag | null {
  const owed = effectiveCost(player, card)
  const payment = emptyTokenBag()
  let goldNeeded = 0
  for (const g of GEMS) {
    payment[g] = Math.min(owed[g], player.tokens[g])
    goldNeeded += owed[g] - payment[g]
  }
  if (goldNeeded > player.tokens.gold) return null
  payment.gold = goldNeeded
  return payment
}

/**
 * Any payment is valid when: no color is overpaid, every token is owned, and
 * gold exactly covers the total shortfall. (Players may substitute gold for
 * colored tokens they own — the engine accepts more payments than the
 * auto-payment legalMoves emits.)
 */
export function validatePayment(player: PlayerState, card: CardDef, payment: TokenBag): string | null {
  const owed = effectiveCost(player, card)
  let shortfall = 0
  for (const g of GEMS) {
    if (payment[g] < 0 || payment[g] > player.tokens[g]) return `bad ${g} payment`
    if (payment[g] > owed[g]) return `overpaid ${g}`
    shortfall += owed[g] - payment[g]
  }
  if (payment.gold < 0 || payment.gold > player.tokens.gold) return 'bad gold payment'
  if (payment.gold !== shortfall) return 'gold must exactly cover the shortfall'
  return null
}

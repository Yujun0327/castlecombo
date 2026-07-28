import type { CardDef, NobleDef, Tier } from '../engine/types'
import { CARDS } from './cards'
import { NOBLES } from './nobles'

export { CARDS, NOBLES }

/** Gem tokens per color and nobles in play, by player count. Gold is always 5. */
export const SCALING: Record<2 | 3 | 4, { tokens: number; nobles: number }> = {
  2: { tokens: 4, nobles: 3 },
  3: { tokens: 5, nobles: 4 },
  4: { tokens: 7, nobles: 5 },
}

export const GOLD_COUNT = 5

export const cardById: ReadonlyMap<number, CardDef> = new Map(CARDS.map((c) => [c.id, c]))
export const nobleById: ReadonlyMap<number, NobleDef> = new Map(NOBLES.map((n) => [n.id, n]))

export function cardsOfTier(tier: Tier): CardDef[] {
  return CARDS.filter((c) => c.tier === tier)
}

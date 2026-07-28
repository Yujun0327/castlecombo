import type { CardDef, Deck } from '../engine/types'
import { CARDS, CARDS_PROVISIONAL } from './cards'

export { CARDS, CARDS_PROVISIONAL }

export const cardById: ReadonlyMap<number, CardDef> = new Map(CARDS.map((c) => [c.id, c]))

export function cardsOfDeck(deck: Deck): CardDef[] {
  return CARDS.filter((c) => c.deck === deck)
}

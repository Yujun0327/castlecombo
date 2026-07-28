import { mulberry32, seededShuffle } from './rng'
import { otherDeck } from './types'
import type { Deck, GameState } from './types'

/** Pop from a deck, deterministically reshuffling its discard first if needed (RL-5). */
export function draw(state: GameState, d: Deck): number | null {
  if (state.decks[d].length === 0 && state.discard[d].length > 0) {
    state.rngState = (Math.imul(state.rngState, 1664525) + 1013904223) >>> 0
    state.decks[d] = seededShuffle(state.discard[d], mulberry32(state.rngState))
    state.discard[d] = []
  }
  return state.decks[d].pop() ?? null
}

export function refill(state: GameState, d: Deck, slot: number): void {
  state.rows[d][slot] = draw(state, d)
  // a fully dead row pins the messenger to the surviving one (RL-5)
  if (
    state.messenger === d &&
    !state.rows[d].some((c) => c !== null) &&
    state.rows[otherDeck(d)].some((c) => c !== null)
  ) {
    state.messenger = otherDeck(d)
  }
}

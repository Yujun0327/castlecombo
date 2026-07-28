import { cardsOfDeck } from '../data'
import { mulberry32, seededShuffle } from './rng'
import { ROW_SLOTS, START_GOLD, START_KEYS } from './types'
import type { Deck, GameConfig, GameState, PlayerState } from './types'

function emptyPlayer(): PlayerState {
  return { gold: START_GOLD, keys: START_KEYS, placed: [] }
}

/**
 * Deterministic: the same config produces the identical state on every
 * client (both decks and rows flow from one seeded rng in a fixed draw
 * order — castle first, then village; never reorder these calls), which
 * is what makes log replay and resync work.
 */
export function createGame(cfg: GameConfig): GameState {
  const rng = mulberry32(cfg.sharedSeed)

  const decks = {} as Record<Deck, number[]>
  const rows = {} as Record<Deck, (number | null)[]>
  for (const d of ['castle', 'village'] as const) {
    decks[d] = seededShuffle(cardsOfDeck(d).map((c) => c.id), rng)
    rows[d] = Array.from({ length: ROW_SLOTS }, () => decks[d].pop() ?? null)
  }

  return {
    players: Array.from({ length: cfg.playerCount }, emptyPlayer),
    turn: cfg.startingSeat,
    startingSeat: cfg.startingSeat,
    decks,
    rows,
    discard: { castle: [], village: [] },
    // the messenger starts beside the village row (ruling RL-6)
    messenger: 'village',
    keyUsedThisTurn: false,
    // reshuffle stream seeded apart from the deal so future draws stay stable
    rngState: (cfg.sharedSeed ^ 0x9e3779b9) >>> 0,
    result: null,
  }
}

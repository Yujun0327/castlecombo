import { cardsOfTier, GOLD_COUNT, NOBLES, SCALING } from '../data'
import { mulberry32, seededShuffle } from './rng'
import { emptyTokenBag, GEMS } from './types'
import type { GameConfig, GameState, PlayerState, Tier } from './types'

const MARKET_SLOTS = 4

function emptyPlayer(): PlayerState {
  return { tokens: emptyTokenBag(), cards: [], reserved: [], nobles: [] }
}

/**
 * Deterministic: the same config produces the identical state on every
 * client (decks, market and noble reveal all flow from one seeded rng in a
 * fixed draw order), which is what makes log replay and resync work.
 */
export function createGame(cfg: GameConfig): GameState {
  const rng = mulberry32(cfg.sharedSeed)

  const decks = [1, 2, 3].map((t) =>
    seededShuffle(cardsOfTier(t as Tier).map((c) => c.id), rng),
  ) as [number[], number[], number[]]
  const market = decks.map((deck) =>
    Array.from({ length: MARKET_SLOTS }, () => deck.pop() ?? null),
  )
  const nobles = seededShuffle(NOBLES.map((n) => n.id), rng).slice(0, cfg.playerCount + 1)

  const bank = emptyTokenBag()
  for (const g of GEMS) bank[g] = SCALING[cfg.playerCount].tokens
  bank.gold = GOLD_COUNT

  return {
    players: Array.from({ length: cfg.playerCount }, emptyPlayer),
    turn: cfg.startingSeat,
    startingSeat: cfg.startingSeat,
    bank,
    decks,
    market,
    nobles,
    pending: null,
    finalRound: false,
    result: null,
  }
}

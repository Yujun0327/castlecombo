/** The two card decks; the messenger pawn marks which row is buyable. */
export type Deck = 'castle' | 'village'
export const DECKS: readonly Deck[] = ['castle', 'village']

/** Seat index, 0..playerCount-1. Turn order is seat order. */
export type Seat = number

/**
 * Heraldic shield (coat-of-arms) types. Placeholder tincture names until the
 * roster transcription pins the real set (rulings RL-1).
 */
export type Shield = 'gules' | 'azure' | 'vert' | 'or' | 'sable' | 'argent'
export const SHIELDS: readonly Shield[] = ['gules', 'azure', 'vert', 'or', 'sable', 'argent']

export const START_GOLD = 15
export const START_KEYS = 2
/** Taking a market card face-down yields this instead of the card's face. */
export const FACEDOWN_GOLD = 6
export const FACEDOWN_KEYS = 2
/** Kingdom bounding box side and total cards per player (a full 3×3). */
export const GRID_SIDE = 3
export const KINGDOM_CARDS = GRID_SIDE * GRID_SIDE
/** Face-up market slots per row. */
export const ROW_SLOTS = 3
/** Each leftover key scores this at game end. */
export const KEY_POINTS = 1

/* ------------------------------------------------------------------ */
/* card definition DSL                                                 */
/* ------------------------------------------------------------------ */

/** Scope a countable is evaluated over, relative to the scoring/bought card. */
export type Where = 'grid' | 'row' | 'col' | 'adjacent'

export type Countable =
  /** Matching shields on face-up cards in scope. */
  | { count: 'shields'; shields: readonly Shield[] }
  /** Cards in scope passing every given filter (face-down cards match unless excluded — RL-2). */
  | { count: 'cards'; deck?: Deck; faceDown?: boolean; hasPurse?: boolean; costAtLeast?: number }
  /** The owner's current keys. */
  | { count: 'keys' }
  /** Gold assigned to this card's purse at end-game scoring. */
  | { count: 'goldOnThisPurse' }
  /** Complete sets of all shield types in scope (min count across types). */
  | { count: 'shieldSets' }

/** Immediate effects, resolved on buy in printed order. No player choices (R5.4). */
export type Effect =
  | { kind: 'gold'; amount: number }
  | { kind: 'keys'; amount: number }
  | { kind: 'goldPer'; amount: number; what: Countable; where: Where }
  /** Every opponent gains (or, negative, loses — floored at 0) gold. */
  | { kind: 'eachOpponentGold'; amount: number }
  | { kind: 'goldPerOpponent'; amount: number }

/** End-game scroll conditions, summed per card. */
export type Scoring =
  | { kind: 'flat'; points: number }
  | { kind: 'per'; points: number; what: Countable; where: Where; cap?: number }
  /** Evaluated on the normalized 3×3 grid (R6.4). */
  | { kind: 'position'; at: 'center' | 'corner' | 'edge'; points: number }
  | { kind: 'threshold'; what: Countable; where: Where; atLeast: number; points: number }

export interface CardDef {
  id: number
  name: string
  deck: Deck
  cost: number
  shields: readonly Shield[]
  /** After this card is taken (even face-down, RL-8), the messenger moves here. */
  messenger?: Deck
  /** End-game gold capacity; scored via a goldOnThisPurse scroll entry. */
  purse?: number
  /** Printed discount: cost is reduced by amount per match already in the kingdom (RL-4). */
  discount?: { amount: number; what: Countable; where: Where }
  onBuy?: readonly Effect[]
  scroll?: readonly Scoring[]
}

/* ------------------------------------------------------------------ */
/* game state                                                          */
/* ------------------------------------------------------------------ */

/** A card in a kingdom. Coords are unbounded ints; first card at (0,0). */
export interface Placement {
  card: number
  x: number
  y: number
  faceDown: boolean
}

export interface PlayerState {
  gold: number
  keys: number
  /** In placement order (drives replay and UI). */
  placed: Placement[]
}

export interface ScoreCardLine {
  card: number
  points: number
  /** Gold assigned to this card's purse (RL-3). */
  purseGold: number
}

export interface ScoreBreakdown {
  cards: ScoreCardLine[]
  keyPoints: number
  /** Gold left after purse filling — the tiebreaker (RL-10). */
  leftoverGold: number
  total: number
}

export interface GameState {
  players: PlayerState[]
  turn: Seat
  startingSeat: Seat
  /** The deck top is the END of the array. */
  decks: Record<Deck, number[]>
  /** Face-up rows, 3 slots each; null = slot empty and that deck exhausted (RL-5). */
  rows: Record<Deck, (number | null)[]>
  discard: Record<Deck, number[]>
  messenger: Deck
  /** One key spend per turn (R3.5); reset when the turn advances. */
  keyUsedThisTurn: boolean
  /** PRNG word for mid-game discard reshuffles only (RL-5) — advances deterministically. */
  rngState: number
  result: { ranking: Seat[]; winners: Seat[]; breakdown: ScoreBreakdown[] } | null
}

export interface GameConfig {
  playerCount: 2 | 3 | 4
  sharedSeed: number
  startingSeat: Seat
  names: string[]
  rulesVersion: string
}

export type Move =
  /** Optional, max once per turn, before the take (R3.1). */
  | { type: 'useKey'; action: 'switch' | 'refresh' }
  /** Buy the card in the messenger row's slot and place it at (x,y). */
  | { type: 'buy'; slot: number; x: number; y: number }
  /** Take that card face-down instead: +6 gold +2 keys, scores nothing. */
  | { type: 'takeFacedown'; slot: number; x: number; y: number }

export function otherDeck(d: Deck): Deck {
  return d === 'castle' ? 'village' : 'castle'
}

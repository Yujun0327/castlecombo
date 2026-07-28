/** The two card decks; the messenger pawn marks which row is buyable. */
export type Deck = 'castle' | 'village'
export const DECKS: readonly Deck[] = ['castle', 'village']

/** Seat index, 0..playerCount-1. Turn order is seat order. */
export type Seat = number

/** The six heraldic shield types of the real game (RL-1 transcription). */
export type Shield = 'noble' | 'faith' | 'scholar' | 'crafts' | 'peasant' | 'military'
export const SHIELDS: readonly Shield[] = ['noble', 'faith', 'scholar', 'crafts', 'peasant', 'military']

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
/** Provisional uniform purse capacity (ruling RL-11). */
export const PURSE_CAP = 5

/* ------------------------------------------------------------------ */
/* card definition DSL                                                 */
/* ------------------------------------------------------------------ */

/** Scope a countable is evaluated over, relative to the scoring/bought card. */
export type Where = 'grid' | 'row' | 'col' | 'rowcol' | 'adjacent'

export type Countable =
  /** Matching shields on face-up cards in scope. */
  | { count: 'shields'; shields: readonly Shield[] }
  /** Cards in scope passing every given filter (face-down cards match only bare/faceDown filters — RL-2). */
  | {
      count: 'cards'
      deck?: Deck
      faceDown?: boolean
      cost?: number
      costAtLeast?: number
      shieldCount?: 1 | 2
      hasBanner?: boolean
      hasPurse?: boolean
    }
  /** The owner's current keys. */
  | { count: 'keys' }
  /** Gold sitting on this card's purse. */
  | { count: 'goldOnThisPurse' }
  /** Gold sitting on every purse in scope. */
  | { count: 'goldOnPurses' }
  /** Distinct shield types present in scope. */
  | { count: 'shieldTypes' }
  /** Shield types absent from scope (of the 6). */
  | { count: 'missingShieldTypes' }
  /** Complete sets across the listed types: min over each type's count. */
  | { count: 'sets'; shields: readonly Shield[] }
  /** Sets of 3 of the same shield: sum over types of floor(count/3). */
  | { count: 'sameShieldTriplets' }
  /** Pairs of one castle + one village card: min of the two counts. */
  | { count: 'deckPairs' }
  /** Empty kingdom cells after this placement (9 − cards placed). */
  | { count: 'emptySpaces' }

/**
 * Immediate effects, resolved on buy in printed order. Player decisions are
 * carried on the buy move itself (`choice`, `discardSlot`) — the reducer
 * stays choice-free and log-replayable.
 */
export type Effect =
  | { kind: 'gold'; amount: number }
  | { kind: 'keys'; amount: number }
  | { kind: 'goldPer'; amount: number; what: Countable; where: Where }
  | { kind: 'keysPer'; amount: number; what: Countable; where: Where }
  /** Counted over a neighbouring opponent's kingdom — the better one (RL-9). */
  | { kind: 'oppGoldPer'; amount: number; what: Countable }
  | { kind: 'oppKeysPer'; amount: number; what: Countable }
  | { kind: 'eachOpponentGold'; amount: number }
  | { kind: 'eachOpponentKeys'; amount: number }
  /** Either/or printed choice; `move.choice` picks the branch. */
  | { kind: 'choice'; a: readonly Effect[]; b: readonly Effect[] }
  /** Add up to N gold from the supply onto each of your purses with room. */
  | { kind: 'fillPurses'; amount: number }
  /** Fill your two best purses to capacity from the supply. */
  | { kind: 'fillTwoPurses' }
  /** Discard the card at `move.discardSlot` from the given row; gain its printed cost. */
  | { kind: 'discardRow'; row: Deck; gain: 'gold' | 'keys' }

/** End-game scroll conditions, summed per card. */
export type Scoring =
  | { kind: 'flat'; points: number }
  /** points × ⌊count / each⌋ (each defaults to 1), capped after grouping. */
  | { kind: 'per'; points: number; what: Countable; where: Where; cap?: number; each?: number }
  /** Evaluated on the normalized 3×3 grid (R6.4). */
  | {
      kind: 'position'
      at: 'top' | 'bottom' | 'left' | 'right' | 'middleRow' | 'middleCol' | 'corner' | 'edge' | 'center'
      points: number
    }
  | { kind: 'threshold'; what: Countable; where: Where; atLeast: number; points: number }
  /** All-or-nothing: points only when the countable is zero in scope. */
  | { kind: 'absent'; what: Countable; where: Where; points: number }

export interface CardDef {
  id: number
  name: string
  deck: Deck
  cost: number
  shields: readonly Shield[]
  /** Moves the messenger to the OTHER row when taken — even face-down (RL-8, RL-12). */
  messenger?: boolean
  /** Carries a purse (gold stored here scores; capacity PURSE_CAP — RL-11). */
  purse?: boolean
  /** Cumulative "-1" discount banner for future purchases of the given scope (RL-4). */
  banner?: 'all' | Deck
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
  /** Gold locked on this card's purse during play (unspendable). */
  purseGold: number
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
  /** Total gold on this card's purse after the end-game top-up (RL-3). */
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
  /**
   * Buy the card in the messenger row's slot and place it at (x,y).
   * `choice` answers an either/or effect; `discardSlot` answers a
   * discard-a-row-card effect. Present exactly when the card demands them.
   */
  | { type: 'buy'; slot: number; x: number; y: number; choice?: 'a' | 'b'; discardSlot?: number }
  /** Take that card face-down instead: +6 gold +2 keys, scores nothing. */
  | { type: 'takeFacedown'; slot: number; x: number; y: number }

export function otherDeck(d: Deck): Deck {
  return d === 'castle' ? 'village' : 'castle'
}

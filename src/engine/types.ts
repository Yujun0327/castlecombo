/** The five gem colors of development cards and tokens. */
export type Gem = 'diamond' | 'sapphire' | 'emerald' | 'ruby' | 'onyx'
/** Token colors: the five gems plus gold jokers. */
export type TokenColor = Gem | 'gold'

export const GEMS: readonly Gem[] = ['diamond', 'sapphire', 'emerald', 'ruby', 'onyx']
export const TOKEN_COLORS: readonly TokenColor[] = [...GEMS, 'gold']

/** A count per gem color (costs, discounts, noble requirements). */
export type GemBag = Record<Gem, number>
/** A count per token color, gold included. */
export type TokenBag = Record<TokenColor, number>

/** Seat index, 0..playerCount-1. Turn order is seat order. */
export type Seat = number

export type Tier = 1 | 2 | 3

export interface CardDef {
  id: number
  tier: Tier
  /** The gem this card produces: a permanent 1-token discount of this color. */
  gem: Gem
  points: number
  cost: Partial<GemBag>
}

export interface NobleDef {
  id: number
  req: Partial<GemBag>
}

/** Every noble is worth this much prestige. */
export const NOBLE_POINTS = 3
/** A player holding more than this many tokens at end of turn must return the excess. */
export const TOKEN_CAP = 10
/** Reaching this much prestige triggers the final round. */
export const WIN_POINTS = 15
/** Maximum reserved cards per player. */
export const RESERVE_CAP = 3

export interface PlayerState {
  tokens: TokenBag
  /** Purchased development card ids. */
  cards: number[]
  /** blind = reserved face-down from a deck top; hidden from other players. */
  reserved: { card: number; blind: boolean }[]
  nobles: number[]
}

export type Pending =
  | { kind: 'returnTokens'; actor: Seat; excess: number }
  | { kind: 'chooseNoble'; actor: Seat; options: number[] }

export interface GameState {
  players: PlayerState[]
  turn: Seat
  startingSeat: Seat
  bank: TokenBag
  /** Remaining card ids per tier (index tier-1); the deck top is the END of the array. */
  decks: [number[], number[], number[]]
  /** Face-up cards, [tier-1][slot 0..3]; null = slot empty and its deck exhausted. */
  market: (number | null)[][]
  /** Noble ids still on display. */
  nobles: number[]
  pending: Pending | null
  finalRound: boolean
  result: { ranking: Seat[]; winners: Seat[] } | null
}

export interface GameConfig {
  playerCount: 2 | 3 | 4
  sharedSeed: number
  startingSeat: Seat
  names: string[]
  rulesVersion: string
}

export type Move =
  /** 3 distinct gems, [g,g] when the bank stack has >=4, or fewer when stacks are short. */
  | { type: 'take'; gems: Gem[] }
  | { type: 'reserve'; from: { tier: Tier; slot: number } | { deck: Tier } }
  | { type: 'purchase'; from: 'market' | 'reserved'; card: number; payment: TokenBag }
  /** Answers a returnTokens pending. */
  | { type: 'return'; tokens: TokenBag }
  /** Answers a chooseNoble pending. */
  | { type: 'chooseNoble'; noble: number }
  /** Legal only when no other move is (empty bank, nothing affordable, reserve full). */
  | { type: 'pass' }

/* ------------------------------------------------------------------ */
/* bag helpers                                                         */
/* ------------------------------------------------------------------ */

export function emptyGemBag(): GemBag {
  return { diamond: 0, sapphire: 0, emerald: 0, ruby: 0, onyx: 0 }
}

export function emptyTokenBag(): TokenBag {
  return { ...emptyGemBag(), gold: 0 }
}

export function bagTotal(bag: Partial<Record<TokenColor, number>>): number {
  let sum = 0
  for (const c of TOKEN_COLORS) sum += bag[c] ?? 0
  return sum
}

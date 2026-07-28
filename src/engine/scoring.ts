import { cardById } from '../data'
import { countMatches } from './effects'
import { KEY_POINTS } from './types'
import type {
  GameState,
  Placement,
  PlayerState,
  ScoreBreakdown,
  ScoreCardLine,
  Scoring,
  Seat,
} from './types'

/** Shift a finished kingdom's bounding box to rows/cols 0..2 (R6.4). */
export function normalize(placed: readonly Placement[]): Map<number, { x: number; y: number }> {
  const minX = Math.min(...placed.map((p) => p.x))
  const minY = Math.min(...placed.map((p) => p.y))
  return new Map(placed.map((p, i) => [i, { x: p.x - minX, y: p.y - minY }]))
}

/** Points-per-gold rate of a purse card's scroll (0 when it has none). */
function purseRate(cardId: number): number {
  const scroll = cardById.get(cardId)!.scroll ?? []
  for (const s of scroll) {
    if (s.kind === 'per' && s.what.count === 'goldOnThisPurse') return s.points
  }
  return 0
}

/**
 * RL-3: leftover gold fills purses automatically in the optimal assignment.
 * With linear per-gold rates, greedy by descending rate is optimal.
 * Returns gold per placement index and the gold that found no purse.
 */
export function allocatePurses(player: PlayerState): { purseGold: Map<number, number>; leftover: number } {
  const purseGold = new Map<number, number>()
  const purses = player.placed
    .map((p, i) => ({ i, p }))
    .filter(({ p }) => !p.faceDown && cardById.get(p.card)!.purse !== undefined)
    .sort((a, b) => purseRate(b.p.card) - purseRate(a.p.card) || a.i - b.i)

  let gold = player.gold
  for (const { i, p } of purses) {
    const take = Math.min(gold, cardById.get(p.card)!.purse!)
    if (take > 0) purseGold.set(i, take)
    gold -= take
  }
  return { purseGold, leftover: gold }
}

function scoreScroll(
  player: PlayerState,
  at: Placement,
  pos: { x: number; y: number },
  entry: Scoring,
  purseGold: number,
): number {
  const ctx = { keys: player.keys, purseGold }
  switch (entry.kind) {
    case 'flat':
      return entry.points
    case 'per': {
      const n = countMatches(player.placed, at, entry.what, entry.where, ctx)
      return entry.points * Math.min(n, entry.cap ?? Infinity)
    }
    case 'position': {
      const corner = (pos.x === 0 || pos.x === 2) && (pos.y === 0 || pos.y === 2)
      const center = pos.x === 1 && pos.y === 1
      const hit =
        entry.at === 'center' ? center : entry.at === 'corner' ? corner : !center && !corner
      return hit ? entry.points : 0
    }
    case 'threshold':
      return countMatches(player.placed, at, entry.what, entry.where, ctx) >= entry.atLeast
        ? entry.points
        : 0
  }
}

export function scoreBreakdown(player: PlayerState): ScoreBreakdown {
  const { purseGold, leftover } = allocatePurses(player)
  const positions = normalize(player.placed)

  const cards: ScoreCardLine[] = player.placed.map((p, i) => {
    if (p.faceDown) return { card: p.card, points: 0, purseGold: 0 } // RL-2
    const scroll = cardById.get(p.card)!.scroll ?? []
    const gold = purseGold.get(i) ?? 0
    const points = scroll.reduce(
      (sum, entry) => sum + scoreScroll(player, p, positions.get(i)!, entry, gold),
      0,
    )
    return { card: p.card, points, purseGold: gold }
  })

  const keyPoints = player.keys * KEY_POINTS
  return {
    cards,
    keyPoints,
    leftoverGold: leftover,
    total: cards.reduce((s, c) => s + c.points, 0) + keyPoints,
  }
}

export function computeResult(state: GameState): NonNullable<GameState['result']> {
  const breakdown = state.players.map(scoreBreakdown)
  const seats = state.players.map((_, i) => i)
  const total = (s: Seat) => breakdown[s].total
  const gold = (s: Seat) => breakdown[s].leftoverGold
  // tiebreak: most leftover (unpursed) gold — RL-10; then seat for determinism
  const ranking = [...seats].sort((a, b) => total(b) - total(a) || gold(b) - gold(a) || a - b)
  const best = ranking[0]
  const winners = ranking.filter((s) => total(s) === total(best) && gold(s) === gold(best))
  return { ranking, winners, breakdown }
}

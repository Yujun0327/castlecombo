import { cardById } from '../data'
import { countMatches, purseRate } from './effects'
import { KEY_POINTS, PURSE_CAP } from './types'
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

/**
 * RL-3: at game end, loose gold tops up purses with room automatically in
 * the optimal assignment (greedy by descending per-gold rate — optimal for
 * linear rates). Returns a VIEW of the placements with final purse gold,
 * plus the gold that found no purse (the tiebreaker, RL-10).
 */
export function allocatePurses(player: PlayerState): { finalPlaced: Placement[]; leftover: number } {
  const finalPlaced = player.placed.map((p) => ({ ...p }))

  // "per coin in ANY purse" scrolls (Banker) raise every purse's value equally
  let bonus = 0
  for (const p of finalPlaced) {
    if (p.faceDown) continue
    for (const s of cardById.get(p.card)!.scroll ?? []) {
      if (s.kind === 'per' && s.what.count === 'goldOnPurses') bonus += s.points
    }
  }

  const purses = finalPlaced
    .filter((p) => !p.faceDown && cardById.get(p.card)!.purse)
    .sort((a, b) => purseRate(b.card) - purseRate(a.card))

  let gold = player.gold
  for (const p of purses) {
    if (purseRate(p.card) + bonus <= 0) break // a worthless purse beats losing tiebreak gold
    const take = Math.min(gold, PURSE_CAP - p.purseGold)
    p.purseGold += take
    gold -= take
  }
  return { finalPlaced, leftover: gold }
}

function scoreScroll(
  finalPlaced: readonly Placement[],
  keys: number,
  at: Placement,
  pos: { x: number; y: number },
  entry: Scoring,
): number {
  const ctx = { keys }
  switch (entry.kind) {
    case 'flat':
      return entry.points
    case 'per': {
      const n = countMatches(finalPlaced, at, entry.what, entry.where, ctx)
      const groups = Math.floor(n / (entry.each ?? 1))
      return entry.points * Math.min(groups, entry.cap ?? Infinity)
    }
    case 'position': {
      const corner = (pos.x === 0 || pos.x === 2) && (pos.y === 0 || pos.y === 2)
      const center = pos.x === 1 && pos.y === 1
      switch (entry.at) {
        case 'top': return pos.y === 0 ? entry.points : 0
        case 'bottom': return pos.y === 2 ? entry.points : 0
        case 'left': return pos.x === 0 ? entry.points : 0
        case 'right': return pos.x === 2 ? entry.points : 0
        case 'middleRow': return pos.y === 1 ? entry.points : 0
        case 'middleCol': return pos.x === 1 ? entry.points : 0
        case 'corner': return corner ? entry.points : 0
        case 'edge': return !corner && !center ? entry.points : 0
        case 'center': return center ? entry.points : 0
      }
      break
    }
    case 'threshold':
      return countMatches(finalPlaced, at, entry.what, entry.where, ctx) >= entry.atLeast
        ? entry.points
        : 0
    case 'absent':
      return countMatches(finalPlaced, at, entry.what, entry.where, ctx) === 0 ? entry.points : 0
  }
  return 0
}

export function scoreBreakdown(player: PlayerState): ScoreBreakdown {
  const { finalPlaced, leftover } = allocatePurses(player)
  const positions = normalize(finalPlaced)

  const cards: ScoreCardLine[] = finalPlaced.map((p, i) => {
    if (p.faceDown) return { card: p.card, points: 0, purseGold: 0 } // RL-2
    const scroll = cardById.get(p.card)!.scroll ?? []
    const points = scroll.reduce(
      (sum, entry) => sum + scoreScroll(finalPlaced, player.keys, p, positions.get(i)!, entry),
      0,
    )
    return { card: p.card, points, purseGold: p.purseGold }
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

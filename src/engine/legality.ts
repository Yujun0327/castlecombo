import { buyRequirements, effectiveCost } from './effects'
import { GRID_SIDE, KINGDOM_CARDS, otherDeck } from './types'
import type { GameState, Move, Placement, Seat } from './types'

/**
 * Every move the given seat may legally make. The UI renders only these.
 * A turn is 0-or-1 `useKey` moves followed by exactly one buy/takeFacedown
 * (R3.1–R3.2); `keyUsedThisTurn` gates the key. Cards whose effects demand
 * a decision fan out into one move per option (choice / discardSlot).
 */
export function legalMoves(state: GameState, seat: Seat): Move[] {
  if (state.result) return []
  if (seat !== state.turn) return []

  const moves: Move[] = []
  const player = state.players[seat]

  if (!state.keyUsedThisTurn && player.keys > 0) {
    const other = otherDeck(state.messenger)
    // switching to a dead row (all slots gone) is pointless and illegal (RL-5)
    if (state.rows[other].some((c) => c !== null)) moves.push({ type: 'useKey', action: 'switch' })
    // a redraw needs at least one card to reveal (RL-7)
    const m = state.messenger
    if (state.decks[m].length + state.discard[m].length > 0) {
      moves.push({ type: 'useKey', action: 'refresh' })
    }
  }

  const cells = legalCells(player.placed)
  state.rows[state.messenger].forEach((card, slot) => {
    if (card === null) return
    const affordable = effectiveCost(player.placed, card) <= player.gold

    // decision fan-out: either/or branches × discardable slots
    const req = buyRequirements(card)
    const choices: ('a' | 'b' | undefined)[] = req.choice ? ['a', 'b'] : [undefined]
    let discards: (number | undefined)[] = [undefined]
    if (req.discardRow) {
      const open = state.rows[req.discardRow]
        .map((c, i) => (c !== null ? i : null))
        .filter((i): i is number => i !== null)
      if (open.length > 0) discards = open
    }

    for (const { x, y } of cells) {
      if (affordable) {
        for (const choice of choices) {
          for (const discardSlot of discards) {
            moves.push({
              type: 'buy',
              slot,
              x,
              y,
              ...(choice !== undefined ? { choice } : {}),
              ...(discardSlot !== undefined ? { discardSlot } : {}),
            })
          }
        }
      }
      moves.push({ type: 'takeFacedown', slot, x, y })
    }
  })

  return moves
}

/**
 * Cells a new card may occupy: any spot for the first card, then empty
 * cells orthogonally adjacent to a placement that keep the bounding box
 * within 3×3 (R4.1–R4.3).
 */
export function legalCells(placed: readonly Placement[]): { x: number; y: number }[] {
  if (placed.length === 0) return [{ x: 0, y: 0 }]
  if (placed.length >= KINGDOM_CARDS) return []

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  const occupied = new Set<string>()
  for (const p of placed) {
    occupied.add(`${p.x},${p.y}`)
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y)
  }

  const out: { x: number; y: number }[] = []
  const seen = new Set<string>()
  for (const p of placed) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const x = p.x + dx, y = p.y + dy
      const key = `${x},${y}`
      if (occupied.has(key) || seen.has(key)) continue
      seen.add(key)
      const w = Math.max(maxX, x) - Math.min(minX, x) + 1
      const h = Math.max(maxY, y) - Math.min(minY, y) + 1
      if (w <= GRID_SIDE && h <= GRID_SIDE) out.push({ x, y })
    }
  }
  return out
}

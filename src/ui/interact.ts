import type { Move } from '../engine'

/**
 * Buy-flow selection: tap a market card (sheet opens) → choose Recruit or
 * Take-face-down (placing starts) → tap a highlighted cell (move dispatches).
 * Pure functions, zero DOM coupling.
 */
export type Selection =
  | { kind: 'none' }
  | { kind: 'sheet'; slot: number }
  | { kind: 'placing'; slot: number; mode: 'buy' | 'takeFacedown' }

export const NO_SELECTION: Selection = { kind: 'none' }

/** Cells the current selection may be placed on, from the legal-move list. */
export function targetCells(sel: Selection, moves: readonly Move[]): { x: number; y: number }[] {
  if (sel.kind !== 'placing') return []
  return moves
    .filter((m) => m.type === sel.mode && m.slot === sel.slot)
    .map((m) => ({ x: (m as Move & { x: number }).x, y: (m as Move & { y: number }).y }))
}

/** The dispatchable move for tapping (x,y) under the current selection, if legal. */
export function cellMove(sel: Selection, x: number, y: number, moves: readonly Move[]): Move | null {
  if (sel.kind !== 'placing') return null
  return (
    moves.find((m) => m.type === sel.mode && m.slot === sel.slot && m.x === x && m.y === y) ?? null
  )
}

/** May the sheet offer "Recruit" (i.e. is a buy of this slot affordable)? */
export function canBuy(slot: number, moves: readonly Move[]): boolean {
  return moves.some((m) => m.type === 'buy' && m.slot === slot)
}

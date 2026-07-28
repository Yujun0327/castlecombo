import type { Gem, Move, Tier } from '../engine'

/** What the card action sheet was opened on. */
export type SheetTarget =
  | { kind: 'market'; tier: Tier; slot: number; card: number }
  | { kind: 'reserved'; card: number }
  | { kind: 'deck'; tier: Tier }

/** Multiset containment: every element of `sub` fits inside `sup`. */
function subMultiset(sub: readonly Gem[], sup: readonly Gem[]): boolean {
  const counts = new Map<Gem, number>()
  for (const g of sup) counts.set(g, (counts.get(g) ?? 0) + 1)
  for (const g of sub) {
    const left = (counts.get(g) ?? 0) - 1
    if (left < 0) return false
    counts.set(g, left)
  }
  return true
}

function sameMultiset(a: readonly Gem[], b: readonly Gem[]): boolean {
  return a.length === b.length && subMultiset(a, b)
}

function takeMoves(moves: readonly Move[]): Gem[][] {
  return moves.filter((m) => m.type === 'take').map((m) => m.gems)
}

/** Could tapping `gem` grow the current selection toward a legal take? */
export function canAddGem(selection: readonly Gem[], gem: Gem, moves: readonly Move[]): boolean {
  const next = [...selection, gem]
  return takeMoves(moves).some((t) => subMultiset(next, t))
}

/**
 * Selection state machine for tapping bank chips:
 * tap an unselected gem → add it (if any legal take allows);
 * tap the sole selected gem → grow to the 2-of-a-kind take if legal, else clear;
 * tap an already-selected gem otherwise → remove one of it.
 */
export function tapGem(selection: readonly Gem[], gem: Gem, moves: readonly Move[]): Gem[] {
  if (selection.includes(gem)) {
    if (selection.length === 1 && canAddGem(selection, gem, moves)) return [gem, gem]
    const idx = selection.lastIndexOf(gem)
    return selection.filter((_, i) => i !== idx)
  }
  if (canAddGem(selection, gem, moves)) return [...selection, gem]
  return [...selection]
}

/** The legal take move exactly matching the selection, if any. */
export function selectionMove(selection: readonly Gem[], moves: readonly Move[]): Move | null {
  if (selection.length === 0) return null
  return (
    moves.find((m) => m.type === 'take' && sameMultiset(selection, m.gems)) ?? null
  )
}

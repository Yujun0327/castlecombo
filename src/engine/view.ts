import type { GameState, Seat } from './types'

/**
 * Redaction seam kept for session-layer symmetry with the sibling games.
 * Castle Combo is fully open information — market, kingdoms, gold and keys
 * are all public — so the view is the state itself.
 */
export function redact(state: GameState, _viewer: Seat | null): GameState {
  return state
}

import { deepClone } from './clone'
import type { GameState, Seat } from './types'

/** Sentinel card id for a blind-reserved card the viewer may not see. */
export const HIDDEN_CARD = -1

/**
 * Display-layer redaction only: Castle Combo is open information except for
 * cards reserved face-down from a deck top, which only their owner may see.
 * Viewer null = spectator (sees no blind reserves).
 */
export function redact(state: GameState, viewer: Seat | null): GameState {
  const view = deepClone(state)
  view.players.forEach((p, seat) => {
    if (seat === viewer) return
    for (const r of p.reserved) {
      if (r.blind) r.card = HIDDEN_CARD
    }
  })
  return view
}

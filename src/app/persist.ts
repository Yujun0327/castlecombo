import type { GameConfig, Seat } from '../engine'
import type { WireMove } from '../transport/types'

/**
 * Persistent identity: a UUID in localStorage. Reconnecting with the same
 * key reclaims the same seat, whatever the new WebRTC peer id is.
 */
export function playerKey(): string {
  const KEY = 'castlecombo:player-key'
  let key = localStorage.getItem(KEY)
  if (!key) {
    key = crypto.randomUUID()
    localStorage.setItem(KEY, key)
  }
  return key
}

export function loadPlayerName(): string {
  return localStorage.getItem('castlecombo:player-name') ?? ''
}

export function savePlayerName(name: string): void {
  localStorage.setItem('castlecombo:player-name', name)
}

export interface SavedGame {
  gameId: string
  cfg: GameConfig
  seatOf: Record<string, Seat>
  log: WireMove[]
}

// keyed by room AND player so parallel test sessions in one origin stay isolated
const roomKey = (room: string, key: string) => `castlecombo:room:${room.toUpperCase()}:${key}`

export function saveGame(room: string, key: string, data: SavedGame): void {
  try {
    localStorage.setItem(roomKey(room, key), JSON.stringify(data))
  } catch {
    /* storage full or blocked — resync will recover instead */
  }
}

export function loadGame(room: string, key: string): SavedGame | null {
  try {
    const raw = localStorage.getItem(roomKey(room, key))
    return raw ? (JSON.parse(raw) as SavedGame) : null
  } catch {
    return null
  }
}

export function clearGame(room: string, key: string): void {
  localStorage.removeItem(roomKey(room, key))
}

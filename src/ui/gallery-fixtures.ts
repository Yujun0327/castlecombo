import { legalCells, scoreBreakdown } from '../engine'
import type { Placement, PlayerState, ScoreBreakdown } from '../engine'

/**
 * Dev-only fixtures for the #gallery route. Card ids are the stable data
 * ids (castle 0.., village 100..).
 */

/** Five turns in: a banner, a purse with locked gold, and a face-down take. */
export const midGamePlaced: Placement[] = [
  { card: 0, x: 0, y: 0, faceDown: false, purseGold: 0 }, // Alchemist
  { card: 101, x: 1, y: 0, faceDown: false, purseGold: 0 }, // Baker
  { card: 31, x: -1, y: 0, faceDown: false, purseGold: 3 }, // Queen Mother (purse)
  { card: 105, x: 0, y: 1, faceDown: true, purseGold: 0 }, // face-down take
  { card: 22, x: 0, y: -1, faceDown: false, purseGold: 0 }, // Monk
]

/** The cells that mid-game kingdom could legally grow into. */
export const midGameTargets = legalCells(midGamePlaced)

/** A finished 9-card kingdom for the score-sheet fixture. */
export const finishedPlayer: PlayerState = {
  gold: 9,
  keys: 3,
  placed: [
    { card: 0, x: 0, y: 0, faceDown: false, purseGold: 0 }, // Alchemist
    { card: 31, x: 1, y: 0, faceDown: false, purseGold: 4 }, // Queen Mother
    { card: 12, x: 2, y: 0, faceDown: false, purseGold: 0 }, // Duchess
    { card: 101, x: 0, y: 1, faceDown: false, purseGold: 0 }, // Baker
    { card: 114, x: 1, y: 1, faceDown: true, purseGold: 0 }, // face-down
    { card: 104, x: 2, y: 1, faceDown: false, purseGold: 0 }, // Beggar
    { card: 29, x: 0, y: 2, faceDown: false, purseGold: 0 }, // Princess
    { card: 103, x: 1, y: 2, faceDown: false, purseGold: 2 }, // Beekeeper
    { card: 112, x: 2, y: 2, faceDown: false, purseGold: 0 }, // Farmer
  ],
}

export const finishedBreakdown: ScoreBreakdown = scoreBreakdown(finishedPlayer)

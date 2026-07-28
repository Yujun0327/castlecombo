import { describe, expect, it } from 'vitest'
import { CARDS } from '../src/data'
import { applyMove, createGame, legalMoves, mulberry32, publicHash, KINGDOM_CARDS } from '../src/engine'
import type { GameState, Move } from '../src/engine'
import { makeConfig } from './helpers'

/**
 * Random playouts: the game always terminates, the turn holder always has a
 * legal move, the log replays identically, and cards are conserved.
 */

function conservation(state: GameState): number {
  return (
    state.decks.castle.length +
    state.decks.village.length +
    state.discard.castle.length +
    state.discard.village.length +
    state.rows.castle.filter((c) => c !== null).length +
    state.rows.village.filter((c) => c !== null).length +
    state.players.reduce((n, p) => n + p.placed.length, 0)
  )
}

describe('random playouts', () => {
  for (const playerCount of [2, 3, 4] as const) {
    for (const seed of [1, 2, 3, 4]) {
      it(`${playerCount}P seed ${seed}: terminates, stays legal, replays, conserves cards`, () => {
        const cfg = makeConfig(playerCount, seed * 1000 + playerCount)
        const rng = mulberry32(seed)
        let state = createGame(cfg)
        const log: { actor: number; move: Move }[] = []
        // ≤2 moves per turn (key + take), 9 turns per player, plus slack
        const maxSteps = 2 * KINGDOM_CARDS * playerCount + 8

        let steps = 0
        while (!state.result) {
          expect(steps++).toBeLessThan(maxSteps)
          const moves = legalMoves(state, state.turn)
          expect(moves.length).toBeGreaterThan(0)
          const move = moves[Math.floor(rng() * moves.length)]
          log.push({ actor: state.turn, move })
          state = applyMove(state, state.turn, move)

          expect(conservation(state)).toBe(CARDS.length)
          for (const p of state.players) {
            expect(p.gold).toBeGreaterThanOrEqual(0)
            expect(p.keys).toBeGreaterThanOrEqual(0)
            expect(p.placed.length).toBeLessThanOrEqual(KINGDOM_CARDS)
          }
        }

        // equal turns: every kingdom is exactly full
        for (const p of state.players) expect(p.placed.length).toBe(KINGDOM_CARDS)
        expect(state.result!.ranking).toHaveLength(playerCount)
        expect(state.result!.breakdown).toHaveLength(playerCount)

        // the log folds back to the identical state on a fresh client
        let replayed = createGame(cfg)
        for (const { actor, move } of log) replayed = applyMove(replayed, actor, move)
        expect(publicHash(replayed)).toBe(publicHash(state))
      })
    }
  }
})

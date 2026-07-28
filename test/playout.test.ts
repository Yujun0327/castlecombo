import { describe, expect, it } from 'vitest'
import { GOLD_COUNT, SCALING } from '../src/data'
import {
  applyMove,
  bagTotal,
  createGame,
  GEMS,
  legalMoves,
  mulberry32,
  publicHash,
  TOKEN_CAP,
} from '../src/engine'
import type { GameState, Move, Seat } from '../src/engine'
import { makeConfig } from './helpers'

const MOVE_CAP = 4000

function assertInvariants(state: GameState, playerCount: 2 | 3 | 4): void {
  // token conservation, per color
  for (const g of GEMS) {
    const total = state.bank[g] + state.players.reduce((s, p) => s + p.tokens[g], 0)
    expect(total).toBe(SCALING[playerCount].tokens)
  }
  const gold = state.bank.gold + state.players.reduce((s, p) => s + p.tokens.gold, 0)
  expect(gold).toBe(GOLD_COUNT)

  // card conservation: every one of the 90 ids in exactly one place
  const ids = [
    ...state.decks.flat(),
    ...state.market.flat().filter((id): id is number => id !== null),
    ...state.players.flatMap((p) => [...p.reserved.map((r) => r.card), ...p.cards]),
  ]
  expect(ids.length).toBe(90)
  expect(new Set(ids).size).toBe(90)

  for (const p of state.players) {
    expect(p.reserved.length).toBeLessThanOrEqual(3)
    if (state.pending?.kind !== 'returnTokens') {
      expect(bagTotal(p.tokens)).toBeLessThanOrEqual(TOKEN_CAP)
    }
  }
}

/** Random but purchase-biased policy so games actually reach 15 prestige. */
function pickMove(moves: Move[], rng: () => number): Move {
  const purchases = moves.filter((m) => m.type === 'purchase')
  const pool = purchases.length > 0 && rng() < 0.7 ? purchases : moves
  return pool[Math.floor(rng() * pool.length)]
}

describe('random playouts', () => {
  for (const playerCount of [2, 3, 4] as const) {
    for (const seed of [1, 2, 3, 4, 5]) {
      it(`${playerCount}P seed ${seed}: invariants hold, game ends, log replays to the same hash`, () => {
        const cfg = makeConfig(playerCount, seed)
        const rng = mulberry32(seed * 7919)
        let state = createGame(cfg)
        const log: { actor: Seat; move: Move }[] = []

        for (let i = 0; i < MOVE_CAP && !state.result; i++) {
          const actor = state.pending?.actor ?? state.turn
          const moves = legalMoves(state, actor)
          expect(moves.length).toBeGreaterThan(0) // never soft-locked
          const move = pickMove(moves, rng)
          state = applyMove(state, actor, move)
          log.push({ actor, move })
          assertInvariants(state, playerCount)
        }

        expect(state.result).not.toBe(null) // terminated under the cap
        expect(state.result!.ranking.length).toBe(playerCount)
        expect(state.result!.winners.length).toBeGreaterThan(0)

        // replaying the log from the config reproduces the identical state
        let replayed = createGame(cfg)
        for (const { actor, move } of log) replayed = applyMove(replayed, actor, move)
        expect(publicHash(replayed)).toBe(publicHash(state))
      })
    }
  }
})

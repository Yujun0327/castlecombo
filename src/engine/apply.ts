import { cardById } from '../data'
import { deepClone } from './clone'
import { buyRequirements, effectiveCost, resolveEffects } from './effects'
import { legalCells } from './legality'
import { draw, refill } from './market'
import { computeResult } from './scoring'
import { FACEDOWN_GOLD, FACEDOWN_KEYS, KINGDOM_CARDS, otherDeck, ROW_SLOTS } from './types'
import type { GameState, Move, Placement, Seat } from './types'

/**
 * The single pure reducer. Throws on any illegal move; never mutates `prev`.
 * Every branch depends only on the state and the move itself, so all clients
 * fold the same move log into the identical state.
 */
export function applyMove(prev: GameState, actor: Seat, move: Move): GameState {
  if (prev.result) throw new Error('game is over')
  if (actor !== prev.turn) throw new Error('not your turn')

  const state = deepClone(prev)
  const player = state.players[actor]

  switch (move.type) {
    case 'useKey': {
      if (state.keyUsedThisTurn) throw new Error('key already spent this turn')
      if (player.keys < 1) throw new Error('no key')
      if (move.action === 'switch') {
        const other = otherDeck(state.messenger)
        if (!state.rows[other].some((c) => c !== null)) throw new Error('other row is dead')
        state.messenger = other
      } else {
        const d = state.messenger
        if (state.decks[d].length + state.discard[d].length === 0) throw new Error('nothing to redraw')
        // discard the row FIRST, then reveal — the discards may shuffle right back (RL-7)
        for (let s = 0; s < ROW_SLOTS; s++) {
          const c = state.rows[d][s]
          if (c !== null) state.discard[d].push(c)
          state.rows[d][s] = null
        }
        for (let s = 0; s < ROW_SLOTS; s++) state.rows[d][s] = draw(state, d)
      }
      player.keys--
      state.keyUsedThisTurn = true
      return state
    }

    case 'buy':
    case 'takeFacedown': {
      const card = state.rows[state.messenger][move.slot]
      if (card === null || card === undefined) throw new Error('empty slot')
      if (player.placed.length >= KINGDOM_CARDS) throw new Error('kingdom is full')
      if (!legalCells(player.placed).some((c) => c.x === move.x && c.y === move.y)) {
        throw new Error('illegal cell')
      }

      const placement: Placement = {
        card,
        x: move.x,
        y: move.y,
        faceDown: move.type === 'takeFacedown',
        purseGold: 0,
      }

      if (move.type === 'buy') {
        const cost = effectiveCost(player.placed, card)
        if (cost > player.gold) throw new Error('cannot afford')
        player.gold -= cost
        player.placed.push(placement)
        resolveEffects(state, actor, placement, cardById.get(card)!.onBuy ?? [], move)
      } else {
        player.gold += FACEDOWN_GOLD
        player.keys += FACEDOWN_KEYS
        player.placed.push(placement)
      }

      refill(state, state.messenger, move.slot)
      // the messenger icon is public on the market card, so it moves the pawn
      // even for face-down takes (RL-8); the icon sends it to the other row (RL-12)
      if (cardById.get(card)!.messenger) {
        const target = otherDeck(state.messenger)
        if (state.rows[target].some((c) => c !== null)) state.messenger = target
      }
      advanceTurn(state)
      return state
    }
  }
}

function advanceTurn(state: GameState): void {
  state.keyUsedThisTurn = false
  state.turn = (state.turn + 1) % state.players.length
  // equal turns by construction: the game ends exactly when all kingdoms hold 9
  if (state.players.every((p) => p.placed.length >= KINGDOM_CARDS)) {
    state.result = computeResult(state)
  }
}

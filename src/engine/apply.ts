import { cardById, nobleById } from '../data'
import { deepClone } from './clone'
import { legalMoves } from './legality'
import { discounts, prestige, validatePayment } from './payments'
import { bagTotal, GEMS, RESERVE_CAP, TOKEN_CAP, TOKEN_COLORS, WIN_POINTS } from './types'
import type { GameState, Gem, Move, Seat, Tier } from './types'

/**
 * The single pure reducer. Throws on any illegal move; never mutates `prev`.
 * Every branch depends only on the state and the move itself, so all clients
 * fold the same move log into the identical state.
 */
export function applyMove(prev: GameState, actor: Seat, move: Move): GameState {
  if (prev.result) throw new Error('game is over')
  const expected = prev.pending?.actor ?? prev.turn
  if (actor !== expected) throw new Error('not your turn')

  const state = deepClone(prev)
  const player = state.players[actor]

  switch (move.type) {
    case 'take': {
      validateTake(state, move.gems)
      for (const g of move.gems) {
        state.bank[g]--
        player.tokens[g]++
      }
      finishAction(state, actor)
      break
    }

    case 'reserve': {
      if (player.reserved.length >= RESERVE_CAP) throw new Error('reserve is full')
      if ('deck' in move.from) {
        const deck = state.decks[move.from.deck - 1]
        const card = deck.pop()
        if (card === undefined) throw new Error('deck is empty')
        player.reserved.push({ card, blind: true })
      } else {
        const { tier, slot } = move.from
        const card = state.market[tier - 1]?.[slot]
        if (card === null || card === undefined) throw new Error('empty market slot')
        player.reserved.push({ card, blind: false })
        refill(state, tier, slot)
      }
      if (state.bank.gold > 0) {
        state.bank.gold--
        player.tokens.gold++
      }
      finishAction(state, actor)
      break
    }

    case 'purchase': {
      const def = cardById.get(move.card)
      if (!def) throw new Error('unknown card')
      if (move.from === 'market') {
        const tier = def.tier
        const slot = state.market[tier - 1].indexOf(move.card)
        if (slot === -1) throw new Error('card not in market')
        const err = validatePayment(player, def, move.payment)
        if (err) throw new Error(err)
        refill(state, tier, slot)
      } else {
        const idx = player.reserved.findIndex((r) => r.card === move.card)
        if (idx === -1) throw new Error('card not reserved')
        const err = validatePayment(player, def, move.payment)
        if (err) throw new Error(err)
        player.reserved.splice(idx, 1)
      }
      for (const c of TOKEN_COLORS) {
        player.tokens[c] -= move.payment[c]
        state.bank[c] += move.payment[c]
      }
      player.cards.push(move.card)
      finishAction(state, actor)
      break
    }

    case 'return': {
      if (state.pending?.kind !== 'returnTokens') throw new Error('no return pending')
      if (bagTotal(move.tokens) !== state.pending.excess) throw new Error('wrong return count')
      for (const c of TOKEN_COLORS) {
        if (move.tokens[c] < 0 || move.tokens[c] > player.tokens[c]) throw new Error(`bad ${c} return`)
      }
      for (const c of TOKEN_COLORS) {
        player.tokens[c] -= move.tokens[c]
        state.bank[c] += move.tokens[c]
      }
      state.pending = null
      checkNobles(state, actor)
      break
    }

    case 'chooseNoble': {
      if (state.pending?.kind !== 'chooseNoble') throw new Error('no noble pending')
      if (!state.pending.options.includes(move.noble)) throw new Error('noble not offered')
      awardNoble(state, actor, move.noble)
      state.pending = null
      advanceTurn(state, actor)
      break
    }

    case 'pass': {
      const legal = legalMoves(prev, actor)
      if (!(legal.length === 1 && legal[0].type === 'pass')) throw new Error('pass not allowed')
      advanceTurn(state, actor)
      break
    }
  }

  return state
}

function validateTake(state: GameState, gems: readonly Gem[]): void {
  if (gems.length === 2 && gems[0] === gems[1]) {
    // two of a kind: only from a stack of 4 or more
    if (state.bank[gems[0]] < 4) throw new Error('need 4 in the stack to take 2')
    return
  }
  if (new Set(gems).size !== gems.length) throw new Error('duplicate colors')
  for (const g of gems) {
    if (state.bank[g] < 1) throw new Error(`no ${g} in the bank`)
  }
  // must take as many distinct colors as the bank allows, up to 3
  const nonEmpty = GEMS.filter((g) => state.bank[g] > 0).length
  if (gems.length !== Math.min(3, nonEmpty)) throw new Error('must take the maximum available colors')
}

function refill(state: GameState, tier: Tier, slot: number): void {
  state.market[tier - 1][slot] = state.decks[tier - 1].pop() ?? null
}

/** After the main action: token cap first, then nobles, then next turn. */
function finishAction(state: GameState, actor: Seat): void {
  const total = bagTotal(state.players[actor].tokens)
  if (total > TOKEN_CAP) {
    state.pending = { kind: 'returnTokens', actor, excess: total - TOKEN_CAP }
    return
  }
  checkNobles(state, actor)
}

function checkNobles(state: GameState, actor: Seat): void {
  const disc = discounts(state.players[actor])
  const qualifying = state.nobles.filter((id) => {
    const req = nobleById.get(id)!.req
    return GEMS.every((g) => disc[g] >= (req[g] ?? 0))
  })
  if (qualifying.length >= 2) {
    state.pending = { kind: 'chooseNoble', actor, options: qualifying }
    return
  }
  if (qualifying.length === 1) awardNoble(state, actor, qualifying[0])
  advanceTurn(state, actor)
}

function awardNoble(state: GameState, actor: Seat, noble: number): void {
  state.nobles = state.nobles.filter((id) => id !== noble)
  state.players[actor].nobles.push(noble)
}

function advanceTurn(state: GameState, actor: Seat): void {
  if (prestige(state.players[actor]) >= WIN_POINTS) state.finalRound = true
  state.turn = (state.turn + 1) % state.players.length
  // the final round is over once the turn wraps back to the starting seat:
  // every player has then had the same number of turns
  if (state.finalRound && state.turn === state.startingSeat) {
    state.result = computeResult(state)
  }
}

function computeResult(state: GameState): NonNullable<GameState['result']> {
  const seats = state.players.map((_, i) => i)
  const score = (s: Seat) => prestige(state.players[s])
  const cardCount = (s: Seat) => state.players[s].cards.length
  const ranking = [...seats].sort(
    (a, b) => score(b) - score(a) || cardCount(a) - cardCount(b) || a - b,
  )
  const best = ranking[0]
  const winners = ranking.filter(
    (s) => score(s) === score(best) && cardCount(s) === cardCount(best),
  )
  return { ranking, winners }
}

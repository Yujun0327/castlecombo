import { cardById } from '../data'
import { autoPayment } from './payments'
import { GEMS, RESERVE_CAP, TOKEN_COLORS } from './types'
import type { GameState, Gem, Move, Seat, Tier, TokenBag, TokenColor } from './types'

/**
 * Every move the given seat may legally make. The UI renders only these.
 * Purchases carry the auto-payment; applyMove additionally accepts any
 * valid explicit payment (gold substitution) not enumerated here.
 */
export function legalMoves(state: GameState, seat: Seat): Move[] {
  if (state.result) return []
  const actor = state.pending?.actor ?? state.turn
  if (seat !== actor) return []

  if (state.pending?.kind === 'returnTokens') {
    return returnCombos(state.players[seat].tokens, state.pending.excess).map((tokens) => ({
      type: 'return',
      tokens,
    }))
  }
  if (state.pending?.kind === 'chooseNoble') {
    return state.pending.options.map((noble) => ({ type: 'chooseNoble', noble }))
  }

  const moves: Move[] = []
  const player = state.players[seat]

  // take tokens
  const nonEmpty = GEMS.filter((g) => state.bank[g] > 0)
  const takeSize = Math.min(3, nonEmpty.length)
  if (takeSize > 0) {
    for (const gems of combinations(nonEmpty, takeSize)) moves.push({ type: 'take', gems })
  }
  for (const g of GEMS) {
    if (state.bank[g] >= 4) moves.push({ type: 'take', gems: [g, g] })
  }

  // reserve
  if (player.reserved.length < RESERVE_CAP) {
    for (let t = 0; t < 3; t++) {
      for (let s = 0; s < state.market[t].length; s++) {
        if (state.market[t][s] !== null) {
          moves.push({ type: 'reserve', from: { tier: (t + 1) as Tier, slot: s } })
        }
      }
      if (state.decks[t].length > 0) {
        moves.push({ type: 'reserve', from: { deck: (t + 1) as Tier } })
      }
    }
  }

  // purchase (face-up market cards and own reserved cards)
  for (const row of state.market) {
    for (const id of row) {
      if (id === null) continue
      const payment = autoPayment(player, cardById.get(id)!)
      if (payment) moves.push({ type: 'purchase', from: 'market', card: id, payment })
    }
  }
  for (const r of player.reserved) {
    const payment = autoPayment(player, cardById.get(r.card)!)
    if (payment) moves.push({ type: 'purchase', from: 'reserved', card: r.card, payment })
  }

  // pass is the anti-softlock escape hatch: legal only when nothing else is
  if (moves.length === 0) moves.push({ type: 'pass' })
  return moves
}

function combinations(items: readonly Gem[], size: number): Gem[][] {
  if (size === 0) return [[]]
  const out: Gem[][] = []
  items.forEach((item, i) => {
    for (const rest of combinations(items.slice(i + 1), size - 1)) out.push([item, ...rest])
  })
  return out
}

/** All distinct bags of exactly `count` tokens drawn from `owned`. */
export function returnCombos(owned: TokenBag, count: number): TokenBag[] {
  const out: TokenBag[] = []
  const bag: Partial<Record<TokenColor, number>> = {}
  const walk = (colorIdx: number, remaining: number) => {
    if (remaining === 0) {
      const full = { diamond: 0, sapphire: 0, emerald: 0, ruby: 0, onyx: 0, gold: 0, ...bag }
      out.push(full)
      return
    }
    if (colorIdx >= TOKEN_COLORS.length) return
    const c = TOKEN_COLORS[colorIdx]
    const max = Math.min(owned[c], remaining)
    for (let n = max; n >= 0; n--) {
      if (n > 0) bag[c] = n
      else delete bag[c]
      walk(colorIdx + 1, remaining - n)
    }
    delete bag[c]
  }
  walk(0, count)
  return out
}

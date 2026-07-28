import { describe, expect, it } from 'vitest'
import { legalMoves } from '../src/engine'
import { canBuy, cellMove, NO_SELECTION, targetCells } from '../src/ui/interact'
import type { Selection } from '../src/ui/interact'
import { newGame } from './helpers'

describe('buy-flow selection', () => {
  const g = newGame(2)
  const moves = legalMoves(g, 0)

  it('no selection targets nothing', () => {
    expect(targetCells(NO_SELECTION, moves)).toEqual([])
    expect(cellMove(NO_SELECTION, 0, 0, moves)).toBeNull()
  })

  it('placing a first card targets the origin only', () => {
    const sel: Selection = { kind: 'placing', slot: 0, mode: 'takeFacedown' }
    expect(targetCells(sel, moves)).toEqual([{ x: 0, y: 0 }])
    const move = cellMove(sel, 0, 0, moves)
    expect(move).toMatchObject({ type: 'takeFacedown', slot: 0, x: 0, y: 0 })
    expect(cellMove(sel, 1, 0, moves)).toBeNull()
  })

  it('canBuy mirrors affordability from the legal-move list', () => {
    for (let slot = 0; slot < 3; slot++) {
      expect(canBuy(slot, moves)).toBe(moves.some((m) => m.type === 'buy' && m.slot === slot))
    }
    expect(canBuy(0, [])).toBe(false)
  })

  it('an opened sheet is not yet a placement', () => {
    const sel: Selection = { kind: 'sheet', slot: 1 }
    expect(targetCells(sel, moves)).toEqual([])
  })
})

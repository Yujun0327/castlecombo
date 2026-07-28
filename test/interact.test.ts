import { describe, expect, it } from 'vitest'
import { legalMoves } from '../src/engine'
import type { Gem } from '../src/engine'
import { canAddGem, selectionMove, tapGem } from '../src/ui/interact'
import { newGame } from './helpers'

describe('token selection state machine', () => {
  it('builds a 3-distinct take tap by tap', () => {
    const s = newGame(2)
    const moves = legalMoves(s, 0)
    let sel: Gem[] = []
    sel = tapGem(sel, 'ruby', moves)
    expect(sel).toEqual(['ruby'])
    expect(selectionMove(sel, moves)).toBe(null) // incomplete: must take 3
    sel = tapGem(sel, 'onyx', moves)
    sel = tapGem(sel, 'diamond', moves)
    expect(selectionMove(sel, moves)).toMatchObject({ type: 'take' })
  })

  it('grows a lone gem into a pair when the stack allows, then shrinks it', () => {
    const s = newGame(2) // stacks of 4: pair is legal
    const moves = legalMoves(s, 0)
    let sel = tapGem([], 'emerald', moves)
    sel = tapGem(sel, 'emerald', moves)
    expect(sel).toEqual(['emerald', 'emerald'])
    expect(selectionMove(sel, moves)).toMatchObject({ type: 'take', gems: ['emerald', 'emerald'] })
    sel = tapGem(sel, 'emerald', moves)
    expect(sel).toEqual(['emerald'])
  })

  it('clears a lone gem on second tap when the pair is illegal', () => {
    const s = newGame(2)
    s.bank.emerald = 3 // below the 4 needed for a pair
    const moves = legalMoves(s, 0)
    let sel = tapGem([], 'emerald', moves)
    sel = tapGem(sel, 'emerald', moves)
    expect(sel).toEqual([])
  })

  it('blocks additions that no legal take extends', () => {
    const s = newGame(2)
    s.bank.diamond = 0
    const moves = legalMoves(s, 0)
    expect(canAddGem([], 'diamond', moves)).toBe(false)
    expect(tapGem([], 'diamond', moves)).toEqual([])
    // pair mixing is never legal
    expect(canAddGem(['ruby', 'ruby'], 'onyx', moves)).toBe(false)
    // a fourth distinct gem is never legal
    expect(canAddGem(['ruby', 'onyx', 'emerald'], 'sapphire', moves)).toBe(false)
  })

  it('matches short takes when the bank is nearly empty', () => {
    const s = newGame(2)
    s.bank.diamond = 0
    s.bank.sapphire = 0
    s.bank.emerald = 0
    const moves = legalMoves(s, 0)
    let sel = tapGem([], 'ruby', moves)
    expect(selectionMove(sel, moves)).toBe(null) // could still add onyx
    sel = tapGem(sel, 'onyx', moves)
    expect(selectionMove(sel, moves)).toMatchObject({ type: 'take', gems: ['ruby', 'onyx'] })
  })
})

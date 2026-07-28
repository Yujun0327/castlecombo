import { describe, expect, it } from 'vitest'
import { CARDS, NOBLES } from '../src/data'
import { GEMS } from '../src/engine'
import type { Gem } from '../src/engine'

describe('card data', () => {
  it('has 90 cards with stable unique ids', () => {
    expect(CARDS.length).toBe(90)
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(90)
    CARDS.forEach((c, i) => expect(c.id).toBe(i))
  })

  it('has the official tier distribution 40/30/20', () => {
    expect(CARDS.filter((c) => c.tier === 1).length).toBe(40)
    expect(CARDS.filter((c) => c.tier === 2).length).toBe(30)
    expect(CARDS.filter((c) => c.tier === 3).length).toBe(20)
  })

  it('has 8/6/4 cards per gem per tier', () => {
    for (const gem of GEMS) {
      expect(CARDS.filter((c) => c.tier === 1 && c.gem === gem).length).toBe(8)
      expect(CARDS.filter((c) => c.tier === 2 && c.gem === gem).length).toBe(6)
      expect(CARDS.filter((c) => c.tier === 3 && c.gem === gem).length).toBe(4)
    }
  })

  it('keeps points inside the official per-tier ranges', () => {
    const range = { 1: [0, 1], 2: [1, 3], 3: [3, 5] } as const
    for (const c of CARDS) {
      expect(c.points).toBeGreaterThanOrEqual(range[c.tier][0])
      expect(c.points).toBeLessThanOrEqual(range[c.tier][1])
    }
  })

  it('matches the official per-tier point totals', () => {
    const total = (tier: number) =>
      CARDS.filter((c) => c.tier === tier).reduce((s, c) => s + c.points, 0)
    expect(total(1)).toBe(5)
    expect(total(2)).toBe(55)
    expect(total(3)).toBe(80)
  })

  it('has sane costs: 1..7 per color, at least one color', () => {
    for (const c of CARDS) {
      const entries = Object.entries(c.cost)
      expect(entries.length).toBeGreaterThan(0)
      for (const [, n] of entries) {
        expect(n).toBeGreaterThanOrEqual(1)
        expect(n).toBeLessThanOrEqual(7)
      }
    }
  })
})

describe('noble data', () => {
  it('has 10 nobles with unique ids', () => {
    expect(NOBLES.length).toBe(10)
    expect(new Set(NOBLES.map((n) => n.id)).size).toBe(10)
  })

  it('follows the official pattern: five 3+3+3 and five 4+4', () => {
    const triple = NOBLES.filter((n) => Object.values(n.req).every((v) => v === 3))
    const pair = NOBLES.filter((n) => Object.values(n.req).every((v) => v === 4))
    expect(triple.length).toBe(5)
    expect(pair.length).toBe(5)
    for (const n of triple) expect(Object.keys(n.req).length).toBe(3)
    for (const n of pair) expect(Object.keys(n.req).length).toBe(2)
  })

  it('covers every gem evenly (17 required tokens per color overall)', () => {
    for (const gem of GEMS) {
      const total = NOBLES.reduce((s, n) => s + (n.req[gem as Gem] ?? 0), 0)
      expect(total).toBe(17)
    }
  })
})

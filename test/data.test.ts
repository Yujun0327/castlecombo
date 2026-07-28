import { describe, expect, it } from 'vitest'
import { CARDS, cardById, cardsOfDeck } from '../src/data'
import { SHIELDS } from '../src/engine'
import type { Countable, Effect, Scoring } from '../src/engine'

/**
 * Catalog validation (RL-1: data is provisional, but its SHAPE is contract).
 */

function countables(): Countable[] {
  const out: Countable[] = []
  for (const c of CARDS) {
    if (c.discount) out.push(c.discount.what)
    for (const fx of c.onBuy ?? []) {
      if ('what' in fx) out.push(fx.what)
    }
    for (const s of c.scroll ?? []) {
      if ('what' in s) out.push(s.what)
    }
  }
  return out
}

describe('card catalog', () => {
  it('has unique, deck-banded ids (castle < 100 ≤ village)', () => {
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(CARDS.length)
    for (const c of CARDS) {
      if (c.deck === 'castle') expect(c.id).toBeLessThan(100)
      else expect(c.id).toBeGreaterThanOrEqual(100)
    }
  })

  it('both decks are dealable (≥ 12 cards each) and evenly represented', () => {
    expect(cardsOfDeck('castle').length).toBeGreaterThanOrEqual(12)
    expect(cardsOfDeck('village').length).toBeGreaterThanOrEqual(12)
    expect(cardsOfDeck('castle').length + cardsOfDeck('village').length).toBe(CARDS.length)
  })

  it('every card is well-formed', () => {
    for (const c of CARDS) {
      expect(c.cost).toBeGreaterThanOrEqual(0)
      expect(c.name.length).toBeGreaterThan(0)
      for (const s of c.shields) expect(SHIELDS).toContain(s)
      if (c.messenger) expect(['castle', 'village']).toContain(c.messenger)
      if (c.purse !== undefined) {
        expect(c.purse).toBeGreaterThan(0)
        // a purse must be scored by a goldOnThisPurse scroll entry
        expect(
          (c.scroll ?? []).some((s) => s.kind === 'per' && s.what.count === 'goldOnThisPurse'),
        ).toBe(true)
      }
      // goldOnThisPurse never appears on purseless cards
      if (c.purse === undefined) {
        expect(
          (c.scroll ?? []).some((s) => 'what' in s && s.what.count === 'goldOnThisPurse'),
        ).toBe(false)
      }
      // discounts evaluate pre-placement: only the grid scope is meaningful
      if (c.discount) expect(c.discount.where).toBe('grid')
    }
  })

  it('cardById covers the catalog', () => {
    for (const c of CARDS) expect(cardById.get(c.id)).toBe(c)
  })

  it('exercises every effect, scoring and countable kind at least once', () => {
    const effectKinds = new Set<Effect['kind']>()
    const scoringKinds = new Set<Scoring['kind']>()
    for (const c of CARDS) {
      for (const fx of c.onBuy ?? []) effectKinds.add(fx.kind)
      for (const s of c.scroll ?? []) scoringKinds.add(s.kind)
    }
    for (const k of ['gold', 'keys', 'goldPer', 'eachOpponentGold', 'goldPerOpponent'] as const) {
      expect(effectKinds, `effect kind ${k}`).toContain(k)
    }
    for (const k of ['flat', 'per', 'position', 'threshold'] as const) {
      expect(scoringKinds, `scoring kind ${k}`).toContain(k)
    }
    const countKinds = new Set(countables().map((c) => c.count))
    for (const k of ['shields', 'cards', 'keys', 'goldOnThisPurse', 'shieldSets'] as const) {
      expect(countKinds, `countable kind ${k}`).toContain(k)
    }
  })

  it('some cards carry messenger icons in both directions', () => {
    expect(CARDS.some((c) => c.messenger === 'castle')).toBe(true)
    expect(CARDS.some((c) => c.messenger === 'village')).toBe(true)
  })
})

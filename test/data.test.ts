import { describe, expect, it } from 'vitest'
import { CARDS, cardById, cardsOfDeck } from '../src/data'
import { SHIELDS } from '../src/engine'
import type { Countable, Effect, Scoring } from '../src/engine'

/**
 * Catalog validation (RL-1: data is provisional, but its SHAPE is contract).
 */

function walkEffects(list: readonly Effect[], out: Effect[]): void {
  for (const fx of list) {
    out.push(fx)
    if (fx.kind === 'choice') {
      walkEffects(fx.a, out)
      walkEffects(fx.b, out)
    }
  }
}

function allEffects(): Effect[] {
  const out: Effect[] = []
  for (const c of CARDS) walkEffects(c.onBuy ?? [], out)
  return out
}

function countables(): Countable[] {
  const out: Countable[] = []
  for (const fx of allEffects()) {
    if ('what' in fx) out.push(fx.what)
  }
  for (const c of CARDS) {
    for (const s of c.scroll ?? []) {
      if ('what' in s) out.push(s.what)
    }
  }
  return out
}

describe('card catalog', () => {
  it('holds the full 78-card roster: 39 castle + 39 village (RL-1)', () => {
    expect(cardsOfDeck('castle')).toHaveLength(39)
    expect(cardsOfDeck('village')).toHaveLength(39)
    expect(CARDS).toHaveLength(78)
  })

  it('has unique, deck-banded ids (castle < 100 ≤ village)', () => {
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(CARDS.length)
    for (const c of CARDS) {
      if (c.deck === 'castle') expect(c.id).toBeLessThan(100)
      else expect(c.id).toBeGreaterThanOrEqual(100)
    }
    expect(new Set(CARDS.map((c) => c.name)).size).toBe(CARDS.length)
  })

  it('carries exactly 19 messenger icons per deck (RL-12)', () => {
    for (const deck of ['castle', 'village'] as const) {
      expect(cardsOfDeck(deck).filter((c) => c.messenger).length).toBe(19)
    }
  })

  it('every card is well-formed', () => {
    for (const c of CARDS) {
      expect(c.cost).toBeGreaterThanOrEqual(0)
      expect(c.cost).toBeLessThanOrEqual(9)
      expect(c.name.length).toBeGreaterThan(0)
      expect(c.shields.length).toBeGreaterThanOrEqual(1)
      expect(c.shields.length).toBeLessThanOrEqual(2)
      for (const s of c.shields) expect(SHIELDS).toContain(s)
      if (c.banner) expect(['all', 'castle', 'village']).toContain(c.banner)
      // a purse must be scored: by its own coins or by coins-anywhere
      const scoresPurse = (c.scroll ?? []).some(
        (s) => 'what' in s && (s.what.count === 'goldOnThisPurse' || s.what.count === 'goldOnPurses'),
      )
      if (c.purse) expect(scoresPurse, `${c.name} purse unscored`).toBe(true)
      // goldOnThisPurse never appears on purseless cards
      if (!c.purse) {
        expect(
          (c.scroll ?? []).some((s) => 'what' in s && s.what.count === 'goldOnThisPurse'),
          `${c.name} scores a purse it does not have`,
        ).toBe(false)
      }
      // every card either scores or advances the economy — none is blank
      expect((c.scroll?.length ?? 0) + (c.onBuy?.length ?? 0) + (c.banner ? 1 : 0)).toBeGreaterThan(0)
    }
  })

  it('cardById covers the catalog', () => {
    for (const c of CARDS) expect(cardById.get(c.id)).toBe(c)
  })

  it('exercises every effect, scoring and countable kind the roster uses', () => {
    const effectKinds = new Set(allEffects().map((fx) => fx.kind))
    for (const k of [
      'keys',
      'goldPer',
      'keysPer',
      'oppGoldPer',
      'oppKeysPer',
      'eachOpponentGold',
      'eachOpponentKeys',
      'choice',
      'fillPurses',
      'fillTwoPurses',
      'discardRow',
    ] as const) {
      expect(effectKinds, `effect kind ${k}`).toContain(k)
    }
    const scoringKinds = new Set(CARDS.flatMap((c) => (c.scroll ?? []).map((s) => s.kind)))
    for (const k of ['per', 'position', 'threshold', 'absent'] as const) {
      expect(scoringKinds, `scoring kind ${k}`).toContain(k)
    }
    const countKinds = new Set(countables().map((c) => c.count))
    for (const k of [
      'shields',
      'cards',
      'keys',
      'goldOnThisPurse',
      'goldOnPurses',
      'shieldTypes',
      'missingShieldTypes',
      'sets',
      'sameShieldTriplets',
      'deckPairs',
      'emptySpaces',
    ] as const) {
      expect(countKinds, `countable kind ${k}`).toContain(k)
    }
  })

  it('spot-checks verbatim-sourced cards', () => {
    const traveler = CARDS.find((c) => c.name === 'Traveler')!
    expect(traveler.cost).toBe(0)
    expect(traveler.deck).toBe('village')
    const holiness = CARDS.find((c) => c.name === 'His Holiness')!
    expect(holiness.cost).toBe(7)
    expect(holiness.scroll).toEqual([
      { kind: 'per', points: 6, what: { count: 'missingShieldTypes' }, where: 'grid' },
    ])
    const brigand = CARDS.find((c) => c.name === 'Brigand')!
    expect(brigand.scroll?.[0]).toMatchObject({ points: 7, each: 3 })
  })
})

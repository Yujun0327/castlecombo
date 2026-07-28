import { describe, expect, it } from 'vitest'
import { CARDS } from '../src/data'
import { effectLines, effectText, scrollLines, scrollText } from '../src/ui/cardtext'

describe('cardtext', () => {
  it('renders the canonical examples', () => {
    expect(
      effectText({
        kind: 'goldPer',
        amount: 1,
        what: { count: 'shields', shields: ['scholar'] },
        where: 'grid',
      }),
    ).toBe('+1 gold per scholar shield in your kingdom')

    expect(
      scrollText({
        kind: 'per',
        points: 3,
        what: { count: 'shields', shields: ['faith'] },
        where: 'col',
      }),
    ).toBe('3 pts per faith shield in this column')
  })

  it('spells decisions, purses and positions', () => {
    expect(
      effectText({
        kind: 'choice',
        a: [{ kind: 'gold', amount: 2 }],
        b: [{ kind: 'keys', amount: 1 }],
      }),
    ).toBe('either +2 gold — or +1 key')

    expect(effectText({ kind: 'fillTwoPurses' })).toBe('fill your two best purses to the brim')
    expect(effectText({ kind: 'discardRow', row: 'village', gain: 'gold' })).toBe(
      'discard a card from the village row: gain its cost in gold',
    )

    expect(scrollText({ kind: 'position', at: 'corner', points: 4 })).toBe(
      '4 pts if this card sits in a corner',
    )
    expect(
      scrollText({
        kind: 'absent',
        what: { count: 'shields', shields: ['peasant'] },
        where: 'grid',
        points: 10,
      }),
    ).toBe('10 pts if no peasant shield in your kingdom')
  })

  it('groups counted scrolls and skips the scope tail for self-scoped countables', () => {
    expect(
      scrollText({
        kind: 'per',
        points: 7,
        what: { count: 'cards', deck: 'village' },
        where: 'grid',
        each: 3,
      }),
    ).toBe('7 pts per 3 village cards in your kingdom')

    expect(
      scrollText({ kind: 'per', points: 1, what: { count: 'keys' }, where: 'grid' }),
    ).toBe('1 pt per key you hold')

    expect(
      scrollText({ kind: 'per', points: 2, what: { count: 'goldOnThisPurse' }, where: 'grid' }),
    ).toBe('2 pts per gold coin in this purse')
  })

  it('produces clean prose for every one of the 78 cards', () => {
    for (const card of CARDS) {
      const lines = [...effectLines(card.onBuy ?? []), ...scrollLines(card.scroll ?? [])]
      for (const line of lines) {
        expect(line).toMatch(/\S/)
        expect(line).not.toMatch(/undefined|\[object|NaN/)
      }
    }
  })
})

import { describe, expect, it } from 'vitest'
import { CARDS } from '../src/data'
import { scoreBreakdown, allocatePurses, START_KEYS } from '../src/engine'
import type { Placement, PlayerState } from '../src/engine'

/**
 * Worked scoring examples (RULES.md §7) — every number here is hand-summed
 * from the transcribed card texts.
 */

const byName = (name: string) => CARDS.find((c) => c.name === name)!
const id = (name: string) => byName(name).id

function up(name: string, x: number, y: number, purseGold = 0): Placement {
  return { card: id(name), x, y, faceDown: false, purseGold }
}

function down(x: number, y: number): Placement {
  return { card: id('Baker'), x, y, faceDown: true, purseGold: 0 }
}

function player(placed: Placement[], gold = 0, keys = 0): PlayerState {
  return { gold, keys, placed }
}

function pointsOf(p: PlayerState, name: string): number {
  const line = scoreBreakdown(p).cards.find((c) => c.card === id(name))
  return line!.points
}

describe('worked scoring examples', () => {
  it('E1 — row scope counts the card itself (Clockmaker)', () => {
    // row: Clockmaker(crafts) Potter(crafts) Squire(military) → 2 crafts × 3pts
    const p = player([up('Clockmaker', 0, 0), up('Potter', 1, 0), up('Squire', 2, 0)])
    expect(pointsOf(p, 'Clockmaker')).toBe(6)
  })

  it('E2 — rowcol scope on a slid (negative-coord) grid (Armorer)', () => {
    // Armorer at (-1,-1); military at (-1,0) [col] and (0,-1) [row]; diagonal ignored
    const p = player([
      up('Armorer', -1, -1),
      up('Militiaman', -1, 0), // military, same col
      up('Bombardier', 0, -1), // military, same row
      up('Barbarian', 0, 0), // military, diagonal — out of scope
    ])
    expect(pointsOf(p, 'Armorer')).toBe(6) // 2 military × 3pts
  })

  it('E3 — complete-set scoring (Doctor: scholar+peasant pairs)', () => {
    // scholars: Doctor, Inventor, Judge = 3; peasants: Farmer, Baker = 2 → min 2 × 4pts
    const p = player([
      up('Doctor', 0, 0),
      up('Inventor', 1, 0),
      up('Judge', 2, 0),
      up('Farmer', 0, 1),
      up('Baker', 1, 1),
    ])
    expect(pointsOf(p, 'Doctor')).toBe(8)
  })

  it('E4 — end-game purse top-up respects capacity and prior fills (RL-3, RL-11)', () => {
    // Vicar's purse already holds 2 from mid-game effects; cap 5 leaves room for 3
    const p = player([up('Vicar', 0, 0, 2), up('Potter', 1, 0)], 4)
    const { finalPlaced, leftover } = allocatePurses(p)
    expect(finalPlaced[0].purseGold).toBe(5)
    expect(finalPlaced[1].purseGold).toBe(1)
    expect(leftover).toBe(0)
    expect(pointsOf(p, 'Vicar')).toBe(10) // 2pts × 5 coins
  })

  it('E5 — face-down cards count as cards, never as characters (RL-2)', () => {
    // Inventor: 1pt per VILLAGE card — the face-down back has no deck
    const p = player([up('Inventor', 0, 0), up('Nun', 1, 0), down(2, 0)])
    expect(pointsOf(p, 'Inventor')).toBe(2) // Inventor + Nun only
    // Carpenter: 8pts if any face-down card
    const q = player([up('Carpenter', 0, 0), down(1, 0)])
    expect(pointsOf(q, 'Carpenter')).toBe(8)
    const r = player([up('Carpenter', 0, 0), up('Nun', 1, 0)])
    expect(pointsOf(r, 'Carpenter')).toBe(0)
  })

  it('E6 — all-or-nothing absence scrolls (Baron, Witch)', () => {
    const noPeasant = player([up('Baron', 0, 0), up('Nun', 1, 0)])
    expect(pointsOf(noPeasant, 'Baron')).toBe(10)
    const spoiled = player([up('Baron', 0, 0), up('Farmer', 1, 0)])
    expect(pointsOf(spoiled, 'Baron')).toBe(0)
    const witch = player([up('Witch', 0, 0)], 0, 0)
    expect(pointsOf(witch, 'Witch')).toBe(9) // witch is peasant, not faith
  })

  it('E7 — key multipliers stack with the base key point (Locksmith)', () => {
    const p = player([up('Locksmith', 0, 0)], 0, 4)
    const b = scoreBreakdown(p)
    expect(b.cards[0].points).toBe(4) // 1pt per key on the scroll
    expect(b.keyPoints).toBe(4) // plus the standard 1pt per key
  })

  it('E8 — golden 9-card kingdom, hand-summed', () => {
    const p = player(
      [
        up('Duchess', 0, 0), // top row: 8
        up('Prince', 1, 0), // 4 × 3 nobles in row: 12
        up('Princess', 2, 0), // 3 × 3 nobles in row: 9
        up('Knight', 0, 1), // 3 × (Jester + Duchess nobles in rowcol): 6
        up('Jester', 1, 1), // 2 × (self + Prince nobles in rowcol): 4
        up('Monk', 2, 1), // 2 × (self + Fisherman peasants in rowcol): 4
        up('Farmer', 0, 2), // bottom row: 7
        up('Baker', 1, 2), // edge, not corner: 3
        up('Fisherman', 2, 2), // corner: 4
      ],
      3,
      START_KEYS,
    )
    const b = scoreBreakdown(p)
    const expected: Record<string, number> = {
      Duchess: 8,
      Prince: 12,
      Princess: 9,
      Knight: 6,
      Jester: 4,
      Monk: 4,
      Farmer: 7,
      Baker: 3,
      Fisherman: 4,
    }
    for (const [name, pts] of Object.entries(expected)) {
      expect(pointsOf(p, name), name).toBe(pts)
    }
    expect(b.keyPoints).toBe(2)
    expect(b.leftoverGold).toBe(3) // no purses in this kingdom
    expect(b.total).toBe(57 + 2)
  })

  it('E9 — Banker values every pursed coin, and the top-up knows it', () => {
    // Banker purse rate is 0 on its own scroll, but its coins-anywhere scroll
    // makes filling it strictly better than leaving tiebreak gold
    const p = player([up('Banker', 0, 0), up('Vicar', 1, 0)], 8)
    const { finalPlaced, leftover } = allocatePurses(p)
    expect(finalPlaced[1].purseGold).toBe(5) // Vicar first (2pts/coin + 1 banker bonus)
    expect(finalPlaced[0].purseGold).toBe(3)
    expect(leftover).toBe(0)
    expect(pointsOf(p, 'Banker')).toBe(8) // 1pt × every coin in any purse
    expect(pointsOf(p, 'Vicar')).toBe(10)
  })
})

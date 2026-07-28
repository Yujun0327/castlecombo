import type { CardDef, Gem, Tier } from '../engine/types'

/**
 * All 90 development cards of the official distribution.
 * Shorthand cost keys: w=diamond(white) u=sapphire(blue) g=emerald(green)
 * r=ruby(red) k=onyx(black) — the conventional wUgRk notation.
 * Ids are stable: 0–39 tier 1, 40–69 tier 2, 70–89 tier 3.
 */

interface ShortCost {
  w?: number
  u?: number
  g?: number
  r?: number
  k?: number
}

let nextId = 0

function card(tier: Tier, gem: Gem, points: number, c: ShortCost): CardDef {
  const cost: CardDef['cost'] = {}
  if (c.w) cost.diamond = c.w
  if (c.u) cost.sapphire = c.u
  if (c.g) cost.emerald = c.g
  if (c.r) cost.ruby = c.r
  if (c.k) cost.onyx = c.k
  return { id: nextId++, tier, gem, points, cost }
}

export const CARDS: readonly CardDef[] = [
  /* ---------------- tier 1 (40) ---------------- */
  // onyx (black)
  card(1, 'onyx', 0, { w: 1, u: 1, g: 1, r: 1 }),
  card(1, 'onyx', 0, { w: 1, u: 2, g: 1, r: 1 }),
  card(1, 'onyx', 0, { w: 2, u: 2, r: 1 }),
  card(1, 'onyx', 0, { g: 1, r: 3, k: 1 }),
  card(1, 'onyx', 0, { g: 2, r: 1 }),
  card(1, 'onyx', 0, { w: 2, g: 2 }),
  card(1, 'onyx', 0, { g: 3 }),
  card(1, 'onyx', 1, { u: 4 }),
  // sapphire (blue)
  card(1, 'sapphire', 0, { w: 1, g: 1, r: 1, k: 1 }),
  card(1, 'sapphire', 0, { w: 1, g: 1, r: 2, k: 1 }),
  card(1, 'sapphire', 0, { w: 1, g: 2, r: 2 }),
  card(1, 'sapphire', 0, { u: 1, g: 3, r: 1 }),
  card(1, 'sapphire', 0, { w: 1, k: 2 }),
  card(1, 'sapphire', 0, { g: 2, k: 2 }),
  card(1, 'sapphire', 0, { k: 3 }),
  card(1, 'sapphire', 1, { r: 4 }),
  // diamond (white)
  card(1, 'diamond', 0, { u: 1, g: 1, r: 1, k: 1 }),
  card(1, 'diamond', 0, { u: 1, g: 2, r: 1, k: 1 }),
  card(1, 'diamond', 0, { u: 2, g: 2, k: 1 }),
  card(1, 'diamond', 0, { w: 3, u: 1, k: 1 }),
  card(1, 'diamond', 0, { r: 2, k: 1 }),
  card(1, 'diamond', 0, { u: 2, k: 2 }),
  card(1, 'diamond', 0, { u: 3 }),
  card(1, 'diamond', 1, { g: 4 }),
  // emerald (green)
  card(1, 'emerald', 0, { w: 1, u: 1, r: 1, k: 1 }),
  card(1, 'emerald', 0, { w: 1, u: 1, r: 1, k: 2 }),
  card(1, 'emerald', 0, { u: 1, r: 2, k: 2 }),
  card(1, 'emerald', 0, { w: 1, u: 3, g: 1 }),
  card(1, 'emerald', 0, { w: 2, u: 1 }),
  card(1, 'emerald', 0, { u: 2, r: 2 }),
  card(1, 'emerald', 0, { r: 3 }),
  card(1, 'emerald', 1, { k: 4 }),
  // ruby (red)
  card(1, 'ruby', 0, { w: 1, u: 1, g: 1, k: 1 }),
  card(1, 'ruby', 0, { w: 2, u: 1, g: 1, k: 1 }),
  card(1, 'ruby', 0, { w: 2, g: 1, k: 2 }),
  card(1, 'ruby', 0, { w: 1, r: 1, k: 3 }),
  card(1, 'ruby', 0, { u: 2, g: 1 }),
  card(1, 'ruby', 0, { w: 2, r: 2 }),
  card(1, 'ruby', 0, { w: 3 }),
  card(1, 'ruby', 1, { w: 4 }),

  /* ---------------- tier 2 (30) ---------------- */
  // onyx
  card(2, 'onyx', 1, { w: 3, u: 2, g: 2 }),
  card(2, 'onyx', 1, { w: 3, g: 3, k: 2 }),
  card(2, 'onyx', 2, { u: 1, g: 4, r: 2 }),
  card(2, 'onyx', 2, { g: 5, r: 3 }),
  card(2, 'onyx', 2, { w: 5 }),
  card(2, 'onyx', 3, { k: 6 }),
  // sapphire
  card(2, 'sapphire', 1, { u: 2, g: 2, r: 3 }),
  card(2, 'sapphire', 1, { u: 2, g: 3, k: 3 }),
  card(2, 'sapphire', 2, { w: 5, u: 3 }),
  card(2, 'sapphire', 2, { w: 2, r: 1, k: 4 }),
  card(2, 'sapphire', 2, { u: 5 }),
  card(2, 'sapphire', 3, { u: 6 }),
  // diamond
  card(2, 'diamond', 1, { g: 3, r: 2, k: 2 }),
  card(2, 'diamond', 1, { w: 2, u: 3, r: 3 }),
  card(2, 'diamond', 2, { g: 1, r: 4, k: 2 }),
  card(2, 'diamond', 2, { r: 5, k: 3 }),
  card(2, 'diamond', 2, { r: 5 }),
  card(2, 'diamond', 3, { w: 6 }),
  // emerald
  card(2, 'emerald', 1, { w: 3, g: 2, r: 3 }),
  card(2, 'emerald', 1, { w: 2, u: 3, k: 2 }),
  card(2, 'emerald', 2, { w: 4, u: 2, k: 1 }),
  card(2, 'emerald', 2, { u: 5, g: 3 }),
  card(2, 'emerald', 2, { g: 5 }),
  card(2, 'emerald', 3, { g: 6 }),
  // ruby
  card(2, 'ruby', 1, { w: 2, r: 2, k: 3 }),
  card(2, 'ruby', 1, { u: 3, r: 2, k: 3 }),
  card(2, 'ruby', 2, { w: 1, u: 4, g: 2 }),
  card(2, 'ruby', 2, { w: 3, k: 5 }),
  card(2, 'ruby', 2, { k: 5 }),
  card(2, 'ruby', 3, { r: 6 }),

  /* ---------------- tier 3 (20) ---------------- */
  // onyx
  card(3, 'onyx', 3, { w: 3, u: 3, g: 5, r: 3 }),
  card(3, 'onyx', 4, { r: 7 }),
  card(3, 'onyx', 4, { g: 3, r: 6, k: 3 }),
  card(3, 'onyx', 5, { r: 7, k: 3 }),
  // sapphire
  card(3, 'sapphire', 3, { w: 3, g: 3, r: 3, k: 5 }),
  card(3, 'sapphire', 4, { w: 7 }),
  card(3, 'sapphire', 4, { w: 6, u: 3, k: 3 }),
  card(3, 'sapphire', 5, { w: 7, u: 3 }),
  // diamond
  card(3, 'diamond', 3, { u: 3, g: 3, r: 5, k: 3 }),
  card(3, 'diamond', 4, { k: 7 }),
  card(3, 'diamond', 4, { w: 3, r: 3, k: 6 }),
  card(3, 'diamond', 5, { w: 3, k: 7 }),
  // emerald
  card(3, 'emerald', 3, { w: 5, u: 3, r: 3, k: 3 }),
  card(3, 'emerald', 4, { u: 7 }),
  card(3, 'emerald', 4, { w: 3, u: 6, g: 3 }),
  card(3, 'emerald', 5, { u: 7, g: 3 }),
  // ruby
  card(3, 'ruby', 3, { w: 3, u: 5, g: 3, k: 3 }),
  card(3, 'ruby', 4, { g: 7 }),
  card(3, 'ruby', 4, { u: 3, g: 6, r: 3 }),
  card(3, 'ruby', 5, { g: 7, r: 3 }),
]

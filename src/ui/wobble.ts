/**
 * Hand-drawn line helpers. Every "straight" stroke in the app passes through
 * here so nothing is ruler-perfect (art-bible: Line). Wobble is seeded from
 * the caller's coordinates — stable across renders, different per hex.
 */

function hashSeed(x: number, y: number, salt: number): number {
  let h = (Math.round(x * 7.13) * 374761393 + Math.round(y * 3.77) * 668265263 + salt) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/**
 * A closed wobbly polygon path through the given points: each edge becomes a
 * quadratic curve whose control point drifts off the midline a little.
 */
export function wobblyPolygon(
  points: { x: number; y: number }[],
  amount = 1.6,
  salt = 0,
): string {
  const n = points.length
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  for (let i = 0; i < n; i++) {
    const a = points[i]
    const b = points[(i + 1) % n]
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    // perpendicular drift, seeded by the edge midpoint
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const drift = (hashSeed(mx, my, salt) - 0.5) * 2 * amount
    const cx = mx + (-dy / len) * drift
    const cy = my + (dx / len) * drift
    d += ` Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
  }
  return d + ' Z'
}

/** A wobbly flat-top hexagon path centered on (cx, cy). */
export function wobblyHex(cx: number, cy: number, size: number, amount = 1.6): string {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i
    return { x: cx + size * Math.cos(a), y: cy + size * Math.sin(a) }
  })
  return wobblyPolygon(pts, amount, 101)
}

/** A wobbly open stroke from (x1,y1) to (x2,y2) in `segments` gentle arcs. */
export function wobblyLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  amount = 1.2,
  segments = 2,
): string {
  let d = `M ${x1.toFixed(2)} ${y1.toFixed(2)}`
  for (let i = 0; i < segments; i++) {
    const t0 = i / segments
    const t1 = (i + 1) / segments
    const ax = x1 + (x2 - x1) * t0
    const ay = y1 + (y2 - y1) * t0
    const bx = x1 + (x2 - x1) * t1
    const by = y1 + (y2 - y1) * t1
    const mx = (ax + bx) / 2
    const my = (ay + by) / 2
    const dx = bx - ax
    const dy = by - ay
    const len = Math.hypot(dx, dy) || 1
    const drift = (hashSeed(mx, my, 211) - 0.5) * 2 * amount
    d += ` Q ${(mx + (-dy / len) * drift).toFixed(2)} ${(my + (dx / len) * drift).toFixed(2)} ${bx.toFixed(2)} ${by.toFixed(2)}`
  }
  return d
}

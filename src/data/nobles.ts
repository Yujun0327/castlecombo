import type { NobleDef } from '../engine/types'

/**
 * All 10 noble tiles of the official distribution: five 3+3+3 requirements
 * cycling adjacent colors, five 4+4 requirements on adjacent pairs.
 * Each noble is worth 3 prestige (NOBLE_POINTS).
 */
export const NOBLES: readonly NobleDef[] = [
  { id: 0, req: { diamond: 3, sapphire: 3, emerald: 3 } },
  { id: 1, req: { sapphire: 3, emerald: 3, ruby: 3 } },
  { id: 2, req: { emerald: 3, ruby: 3, onyx: 3 } },
  { id: 3, req: { ruby: 3, onyx: 3, diamond: 3 } },
  { id: 4, req: { onyx: 3, diamond: 3, sapphire: 3 } },
  { id: 5, req: { diamond: 4, sapphire: 4 } },
  { id: 6, req: { sapphire: 4, emerald: 4 } },
  { id: 7, req: { emerald: 4, ruby: 4 } },
  { id: 8, req: { ruby: 4, onyx: 4 } },
  { id: 9, req: { onyx: 4, diamond: 4 } },
]

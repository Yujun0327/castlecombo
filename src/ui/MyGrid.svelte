<script lang="ts">
  import { cardById } from '../data'
  import type { Placement } from '../engine'
  import { GRID_SIDE } from '../engine'
  import { dur, settle } from './motion'
  import { scale } from 'svelte/transition'
  import { wobblyPolygon } from './wobble'
  import CardBack from './CardBack.svelte'
  import CardFace from './CardFace.svelte'

  interface Props {
    placed: readonly Placement[]
    /** Legal placement cells (gold-leaf wash) during a placing selection. */
    targets?: readonly { x: number; y: number }[]
    /** Called after the inline confirm chip is accepted. */
    onPlace?: (x: number, y: number) => void
    /** Read-only smaller rendering (opponent inspection). */
    compact?: boolean
  }

  const { placed, targets = [], onPlace, compact = false }: Props = $props()

  /**
   * The sliding window: every cell the kingdom can still reach. The
   * bounding box may grow to 3×3, so the reachable span on each axis is
   * [max−2, min+2]; an empty page shows the 3×3 around the origin.
   */
  const win = $derived.by(() => {
    if (placed.length === 0) return { x0: -1, x1: 1, y0: -1, y1: 1 }
    const xs = placed.map((p) => p.x)
    const ys = placed.map((p) => p.y)
    return {
      x0: Math.max(...xs) - (GRID_SIDE - 1),
      x1: Math.min(...xs) + (GRID_SIDE - 1),
      y0: Math.max(...ys) - (GRID_SIDE - 1),
      y1: Math.min(...ys) + (GRID_SIDE - 1),
    }
  })

  const cols = $derived(win.x1 - win.x0 + 1)
  const cells = $derived.by(() => {
    const out: { x: number; y: number }[] = []
    for (let y = win.y0; y <= win.y1; y++) {
      for (let x = win.x0; x <= win.x1; x++) out.push({ x, y })
    }
    return out
  })

  const byCell = $derived(new Map(placed.map((p) => [`${p.x},${p.y}`, p])))
  const targetSet = $derived(new Set(targets.map((t) => `${t.x},${t.y}`)))

  let pending = $state<{ x: number; y: number } | null>(null)

  /** Cards size to the measured track width so nothing overflows a phone. */
  let gridW = $state(0)
  const cap = $derived(compact ? 76 : 112)
  const cellW = $derived(
    gridW > 0 ? Math.min(cap, (gridW - (cols - 1) * 6) / cols) : cap,
  )

  // a stale confirm chip must not survive a selection change
  $effect(() => {
    if (pending && !targetSet.has(`${pending.x},${pending.y}`)) pending = null
  })

  function confirm() {
    if (!pending) return
    const { x, y } = pending
    pending = null
    onPlace?.(x, y)
  }

  const cellOutline = (x: number, y: number) =>
    wobblyPolygon(
      [
        { x: 2, y: 2 },
        { x: 98, y: 2 },
        { x: 98, y: 138 },
        { x: 2, y: 138 },
      ],
      2.2,
      x * 31 + y * 7 + 400,
    )
</script>

<div
  class="kingdom"
  class:compact
  style="--cols: {cols}; --cell: {cellW.toFixed(1)}px"
  bind:clientWidth={gridW}
  aria-label="your kingdom"
>
  {#each cells as cell (`${cell.x},${cell.y}`)}
    {@const key = `${cell.x},${cell.y}`}
    {@const p = byCell.get(key)}
    {@const hot = targetSet.has(key)}
    <div class="cell" class:hot class:empty={!p && !hot}>
      <svg class="rule" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true">
        <path d={cellOutline(cell.x, cell.y)} class="cell-line" class:cell-line--hot={hot} />
      </svg>

      {#if p}
        <div class="placed" in:scale={{ duration: dur(220), start: 1.05, easing: settle }}>
          {#if p.faceDown}
            <CardBack deck={cardById.get(p.card)!.deck} width={Math.round(cellW - 6)} />
          {:else}
            <CardFace
              def={cardById.get(p.card)!}
              purseGold={p.purseGold}
              width={Math.round(cellW - 6)}
              mini
            />
          {/if}
        </div>
      {:else if hot}
        <button
          class="target"
          aria-label="place at {cell.x}, {cell.y}"
          onclick={() => (pending = cell)}
        ></button>
        {#if pending && pending.x === cell.x && pending.y === cell.y}
          <div class="confirm" transition:scale={{ duration: dur(140), start: 0.9 }}>
            <button class="chip chip--yes" onclick={confirm}>Place here</button>
            <button class="chip" onclick={() => (pending = null)}>Not here</button>
          </div>
        {/if}
      {:else}
        <span class="compass" aria-hidden="true"></span>
      {/if}
    </div>
  {/each}
</div>

<style>
  .kingdom {
    display: grid;
    grid-template-columns: repeat(var(--cols), var(--cell));
    gap: 6px;
    justify-content: center;
  }

  .cell {
    position: relative;
    aspect-ratio: 100 / 140;
    border-radius: var(--radius);
    display: grid;
    place-items: center;
  }

  .cell.empty {
    background: var(--parchment-deep);
  }

  .cell.hot {
    background: color-mix(in srgb, var(--gold-leaf) 18%, var(--parchment));
  }

  .rule {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .cell-line {
    fill: none;
    stroke: var(--line);
    stroke-width: 1.4;
  }

  .cell-line--hot {
    stroke: var(--gold-leaf);
    stroke-width: 2;
  }

  .placed {
    width: 100%;
    display: grid;
    place-items: center;
  }

  .placed :global(.entry),
  .placed :global(.back) {
    box-shadow: none;
  }

  .target {
    position: absolute;
    inset: 0;
    background: transparent;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    padding: 0;
  }

  .compass {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--line);
  }

  .confirm {
    position: absolute;
    inset: auto 2px 6px 2px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    z-index: 3;
  }

  .chip {
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    border: 1px solid var(--ink);
    border-radius: var(--radius);
    background: var(--panel);
    color: var(--ink);
    padding: 4px 6px;
    box-shadow: var(--shadow);
  }

  .chip--yes {
    background: var(--gold-leaf);
  }
</style>

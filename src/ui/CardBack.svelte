<script lang="ts">
  import type { Deck } from '../engine'
  import { wobblyLine, wobblyPolygon } from './wobble'

  interface Props {
    deck: Deck
    /** Folio count for deck stacks; omitted on a lone face-down card. */
    count?: number
    /** Rendering width in px, 160×224 base. */
    width?: number
  }

  const { deck, count, width = 160 }: Props = $props()

  const uid = $props.id()

  const W = 160
  const H = 224

  const frame = $derived(
    wobblyPolygon(
      [
        { x: 6, y: 6 },
        { x: W - 6, y: 6 },
        { x: W - 6, y: H - 6 },
        { x: 6, y: H - 6 },
      ],
      1.8,
      deck === 'castle' ? 301 : 302,
    ),
  )

  // one diaper tile: two wobbled diagonals crossing a 20×20 cell
  const diaperA = wobblyLine(0, 20, 20, 0, 0.9, 2)
  const diaperB = wobblyLine(0, 0, 20, 20, 0.9, 2)

  const gothic = $derived(width >= 120) /* back word renders ≥18px from 120px wide */
</script>

<div
  class="back deck--{deck}"
  style="width:{width}px; font-size:{((width / W) * 16).toFixed(2)}px"
  role="img"
  aria-label="{deck} card back{count !== undefined ? `, ${count} cards` : ''}"
>
  <svg class="art" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <pattern id="diaper-{uid}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d={diaperA} class="diaper" />
        <path d={diaperB} class="diaper" />
      </pattern>
    </defs>
    <rect x="6" y="6" width={W - 12} height={H - 12} fill="url(#diaper-{uid})" />
    <path d={frame} class="frame-rule" />
  </svg>

  <span class="deck-name" class:gothic>{deck}</span>

  {#if count !== undefined}
    <span class="folio tabular">{count}</span>
  {/if}
</div>

<style>
  .back {
    position: relative;
    aspect-ratio: 160 / 224;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
    overflow: hidden;
  }

  .back::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-image: var(--grain);
    opacity: 0.06;
    pointer-events: none;
  }

  .deck--castle {
    background: color-mix(in srgb, var(--castle) 30%, var(--panel));
  }

  .deck--village {
    background: color-mix(in srgb, var(--village) 30%, var(--panel));
  }

  .art {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .deck--castle .diaper {
    stroke: var(--castle-lo);
  }

  .deck--village .diaper {
    stroke: var(--village-lo);
  }

  .diaper {
    fill: none;
    stroke-width: 1;
    opacity: 0.35;
  }

  .frame-rule {
    fill: none;
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .deck--castle .frame-rule {
    stroke: var(--castle-lo);
  }

  .deck--village .frame-rule {
    stroke: var(--village-lo);
  }

  .deck-name {
    position: relative;
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 0.8em;
    letter-spacing: 0.14em;
    color: var(--ink);
  }

  .deck-name.gothic {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.5em; /* ≥18px whenever shown as gothic */
    letter-spacing: 0.04em;
  }

  .folio {
    position: relative;
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 0.85em;
    color: var(--ink);
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 0.1em 0.5em;
  }
</style>

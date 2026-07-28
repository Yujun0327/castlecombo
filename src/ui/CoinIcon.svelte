<script lang="ts">
  import { wobblyPolygon } from './wobble'

  interface Props {
    size?: number
    /** Number stamped on the face; omit for the tiny mint mark. */
    value?: number | string
  }

  const { size = 24, value }: Props = $props()

  // stamped disc: a wobbled 10-gon reads as a hand-struck coin rim
  const rim = $derived(
    wobblyPolygon(
      Array.from({ length: 10 }, (_, i) => {
        const a = (Math.PI / 5) * i - Math.PI / 2
        return { x: 12 + 9.6 * Math.cos(a), y: 12 + 9.6 * Math.sin(a) }
      }),
      0.9,
      7,
    ),
  )
</script>

<svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="gold" class="coin">
  <path d={rim} class="disc" />
  {#if value !== undefined}
    <text x="12" y="12.5" class="value tabular">{value}</text>
  {:else}
    <!-- mint mark: a tiny stamped cross -->
    <path d="M12 9 Q12.2 12 12 15 M9 12 Q12 12.25 15 12" class="mint" />
  {/if}
</svg>

<style>
  .coin {
    display: block;
    flex: none;
  }

  .disc {
    fill: var(--gold-leaf);
    stroke: var(--ink);
    stroke-width: 1.5;
    stroke-linejoin: round;
  }

  .value {
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 12px;
    fill: var(--ink);
    text-anchor: middle;
    dominant-baseline: central;
  }

  .mint {
    stroke: var(--ink);
    stroke-width: 1.4;
    stroke-linecap: round;
    opacity: 0.55;
  }
</style>

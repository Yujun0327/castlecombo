<script lang="ts">
  import { wobblyPolygon } from './wobble'

  interface Props {
    size?: number
  }

  const { size = 24 }: Props = $props()

  // gold bow: a wobbled ring of 8 points at the head of the key
  const bow = $derived(
    wobblyPolygon(
      Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI / 4) * i
        return { x: 12 + 4.4 * Math.cos(a), y: 6.5 + 4.4 * Math.sin(a) }
      }),
      0.7,
      13,
    ),
  )
</script>

<svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="key" class="key">
  <path d={bow} class="bow" />
  <path d="M12 10.9 Q11.75 15.8 12 20.5 M12 20.5 Q13.8 20.8 15.6 20.5 M12 17 Q13.3 17.25 14.6 17" class="wards" />
</svg>

<style>
  .key {
    display: block;
    flex: none;
  }

  .bow {
    fill: var(--gold-leaf);
    stroke: var(--ink);
    stroke-width: 1.8;
    stroke-linejoin: round;
  }

  .wards {
    fill: none;
    stroke: var(--ink);
    stroke-width: 2;
    stroke-linecap: round;
  }
</style>

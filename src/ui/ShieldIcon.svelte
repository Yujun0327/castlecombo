<script lang="ts">
  import type { Shield } from '../engine'
  import { wobblyPolygon } from './wobble'

  interface Props {
    type: Shield
    size?: number
  }

  const { type, size = 22 }: Props = $props()

  // heater-shield outline in a 24×28 box, wobbled per type so no two
  // renders of different charges share the exact same ink line
  const SALT: Record<Shield, number> = {
    noble: 11,
    faith: 23,
    scholar: 37,
    crafts: 41,
    peasant: 53,
    military: 67,
  }

  const outline = $derived(
    wobblyPolygon(
      [
        { x: 3.5, y: 4 },
        { x: 12, y: 5.6 },
        { x: 20.5, y: 4 },
        { x: 20.5, y: 14 },
        { x: 17.5, y: 21 },
        { x: 12, y: 25.5 },
        { x: 6.5, y: 21 },
        { x: 3.5, y: 14 },
      ],
      1,
      SALT[type],
    ),
  )

  // 2px-ink charge glyphs — the shape channel that backs up the color
  const CHARGE: Record<Shield, string> = {
    // crown
    noble: 'M7.5 18 L7.5 11.5 L10.2 14 L12 9.5 L13.8 14 L16.5 11.5 L16.5 18 Z',
    // cross
    faith: 'M12 9 Q12.3 14.2 12 19.5 M8.4 12.6 Q12 13 15.6 12.6',
    // open book
    scholar:
      'M12 10.6 C10.4 9.3 8 9.2 6.6 9.9 L6.6 17.6 C8 16.9 10.4 17 12 18.2 C13.6 17 16 16.9 17.4 17.6 L17.4 9.9 C16 9.2 13.6 9.3 12 10.6 Z M12 10.6 L12 18.2',
    // hammer
    crafts: 'M7.8 10 Q12 9.6 16.2 10 L16.2 13.4 Q12 13.7 7.8 13.4 Z M12 13.4 Q11.7 16.8 12 20',
    // wheat sheaf
    peasant:
      'M12 8.5 Q12.3 14.2 12 20 M12 11 L9 9.2 M12 11 L15 9.2 M12 14 L9 12.2 M12 14 L15 12.2 M12 17 L9 15.2 M12 17 L15 15.2',
    // sword
    military: 'M12 7.5 Q12.25 12.8 12 18 M8.8 15.4 Q12 15.8 15.2 15.4 M10.6 20 Q12 20.3 13.4 20',
  }
</script>

<svg
  width={size}
  height={(size / 24) * 28}
  viewBox="0 0 24 28"
  role="img"
  aria-label="{type} shield"
  class="shield shield--{type}"
>
  <path d={outline} class="field" />
  <path d={CHARGE[type]} class="charge" />
</svg>

<style>
  .shield {
    display: block;
    flex: none;
  }

  .field {
    stroke: var(--ink);
    stroke-width: 1.5;
    stroke-linejoin: round;
  }

  .shield--noble .field {
    fill: var(--noble);
  }
  .shield--faith .field {
    fill: var(--faith);
  }
  .shield--scholar .field {
    fill: var(--scholar);
  }
  .shield--crafts .field {
    fill: var(--crafts);
  }
  .shield--peasant .field {
    fill: var(--peasant);
  }
  .shield--military .field {
    fill: var(--military);
  }

  .charge {
    fill: none;
    stroke: var(--ink);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>

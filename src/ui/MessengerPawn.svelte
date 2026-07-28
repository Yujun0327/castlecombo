<script lang="ts">
  interface Props {
    size?: number
  }

  const { size = 26 }: Props = $props()
</script>

<!-- marginalia ink figure: the messenger mid-stride, satchel on his hip -->
<svg
  width={size}
  height={(size / 22) * 28}
  viewBox="0 0 22 28"
  role="img"
  aria-label="messenger"
  class="pawn"
>
  <circle cx="11.5" cy="4.6" r="2.7" class="ink" />
  <path d="M11.2 7.4 Q10.4 11.5 10.6 15.2" class="ink" />
  <path d="M10.6 15.2 L6.4 23.6 M10.6 15.2 L14.8 22.4 L15.6 25.4" class="ink" />
  <path d="M11 9.6 L6.8 13.4 M11 9.6 L15.4 11.8" class="ink" />
  <path d="M14.6 11.4 L17.4 12.2 L17 15.2 L14.2 14.4 Z" class="satchel" />
</svg>

<style>
  .pawn {
    display: block;
    flex: none;
  }

  .ink {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .satchel {
    fill: var(--gold-leaf);
    stroke: var(--ink);
    stroke-width: 1.3;
    stroke-linejoin: round;
  }
</style>

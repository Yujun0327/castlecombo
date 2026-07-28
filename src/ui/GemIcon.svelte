<script lang="ts">
  import type { TokenColor } from '../engine'

  interface Props {
    kind: TokenColor
    /** Rendered box in px. */
    size?: number
  }

  let { kind, size = 24 }: Props = $props()
</script>

<!--
  Colorblind-safe by silhouette: every token color has a distinct cut —
  diamond=kite brilliant, sapphire=oval cabochon, emerald=octagonal step,
  ruby=pear, onyx=shield hexagon (silver-rimmed), gold=milled coin with
  star punch. Used everywhere gems appear so shape always accompanies color.
-->
<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  aria-hidden="true"
  class="gem gem--{kind}"
>
  {#if kind === 'diamond'}
    <polygon class="body" points="4,9 8,4 16,4 20,9 12,21" />
    <path class="facet" d="M4,9 L20,9 M8,4 L9.5,9 L12,21 M16,4 L14.5,9 L12,21 M12,4 L12,9" />
  {:else if kind === 'sapphire'}
    <ellipse class="body" cx="12" cy="12" rx="7.5" ry="9.5" />
    <path class="facet" d="M8.2,7.2 A5.5,7.2 0 0 1 14.5,5.4" />
    <ellipse class="facet" cx="12" cy="12" rx="4.2" ry="6.2" />
  {:else if kind === 'emerald'}
    <polygon class="body" points="7,3 17,3 21,7 21,17 17,21 7,21 3,17 3,7" />
    <polygon class="facet" points="9,6 15,6 18,9 18,15 15,18 9,18 6,15 6,9" />
    <rect class="facet" x="8.5" y="8.5" width="7" height="7" />
  {:else if kind === 'ruby'}
    <path class="body" d="M12,2 C16,7 19,10.5 19,14.5 A7,7 0 1 1 5,14.5 C5,10.5 8,7 12,2 Z" />
    <path class="facet" d="M12,2 L12,21.4 M6.2,11 L12,13.5 L17.8,11" />
  {:else if kind === 'onyx'}
    <polygon class="body" points="12,2 20,6 20,14 12,22 4,14 4,6" />
    <polygon class="facet" points="12,5.5 17,8 17,13 12,18 7,13 7,8" />
    <path class="facet" d="M12,5.5 L12,18" />
  {:else}
    <circle class="body" cx="12" cy="12" r="9.5" />
    <circle class="mill" cx="12" cy="12" r="8.3" />
    <path class="punch" d="M12,5.5 L13.7,10.3 L18.5,12 L13.7,13.7 L12,18.5 L10.3,13.7 L5.5,12 L10.3,10.3 Z" />
  {/if}
</svg>

<style>
  .gem {
    display: block;
    flex: none;
  }

  .body {
    stroke-width: 1.5;
    stroke-linejoin: round;
  }

  .facet {
    fill: none;
    stroke-width: 1;
    stroke-linejoin: round;
    opacity: 0.8;
  }

  .gem--diamond .body {
    fill: var(--diamond);
    stroke: var(--diamond-lo);
  }
  .gem--diamond .facet {
    stroke: var(--diamond-lo);
  }

  .gem--sapphire .body {
    fill: var(--sapphire);
    stroke: var(--sapphire-lo);
  }
  .gem--sapphire .facet {
    stroke: var(--sapphire-hi);
  }

  .gem--emerald .body {
    fill: var(--emerald);
    stroke: var(--emerald-lo);
  }
  .gem--emerald .facet {
    stroke: var(--emerald-hi);
  }

  .gem--ruby .body {
    fill: var(--ruby);
    stroke: var(--ruby-lo);
  }
  .gem--ruby .facet {
    stroke: var(--ruby-hi);
  }

  .gem--onyx .body {
    fill: var(--onyx);
    stroke: var(--silver);
  }
  .gem--onyx .facet {
    stroke: var(--onyx-hi);
  }

  .gem--gold .body {
    fill: var(--gold);
    stroke: var(--gold-lo);
  }
  .gem--gold .mill {
    fill: none;
    stroke: var(--gold-lo);
    stroke-width: 1;
    stroke-dasharray: 1.1 1.6;
    opacity: 0.85;
  }
  .gem--gold .punch {
    fill: var(--gold-lo);
    opacity: 0.9;
  }
</style>

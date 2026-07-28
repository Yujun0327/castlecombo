<script lang="ts">
  import type { CardDef, Gem } from '../engine'
  import { GEMS } from '../engine'
  import DecoMotif from './DecoMotif.svelte'
  import GemIcon from './GemIcon.svelte'

  interface Props {
    card: CardDef
  }

  let { card }: Props = $props()

  const costs = $derived(GEMS.filter((g) => (card.cost[g] ?? 0) > 0).map(
    (g) => [g, card.cost[g]!] as [Gem, number],
  ))
</script>

<div class="holder">
  <article class="face chamfer face--{card.gem}">
    <div class="frame"></div>
    <header class="band">
      {#if card.points > 0}
        <span class="points foil-text tabular">{card.points}</span>
      {:else}
        <span></span>
      {/if}
      <GemIcon kind={card.gem} size={20} />
    </header>
    <div class="art">
      <DecoMotif gem={card.gem} tier={card.tier} />
    </div>
    <ul class="cost">
      {#each costs as [gem, n] (gem)}
        <li>
          <GemIcon kind={gem} size={15} />
          <span class="tabular">{n}</span>
        </li>
      {/each}
    </ul>
  </article>
</div>

<style>
  .holder {
    container-type: inline-size;
    filter: drop-shadow(0 2px 6px rgb(0 0 0 / 0.4));
  }

  .face {
    aspect-ratio: 5 / 7;
    background: var(--ivory);
    border-radius: var(--r-card);
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* paper grain over the whole face */
  .face::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: var(--grain);
    opacity: 0.07;
    pointer-events: none;
  }

  /* inner gold keyline frame — straight rect inside the chamfered edge */
  .frame {
    position: absolute;
    inset: 4.5%;
    border: 1.5px solid var(--gold);
    opacity: 0.85;
    pointer-events: none;
  }

  .band {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9% 11% 4%;
    min-height: 22%;
  }

  /* gem-tinted glaze behind the header band */
  .face--diamond .band { background: color-mix(in srgb, var(--diamond-lo) 24%, transparent); }
  .face--sapphire .band { background: color-mix(in srgb, var(--sapphire) 16%, transparent); }
  .face--emerald .band { background: color-mix(in srgb, var(--emerald) 16%, transparent); }
  .face--ruby .band { background: color-mix(in srgb, var(--ruby) 14%, transparent); }
  .face--onyx .band { background: color-mix(in srgb, var(--onyx) 18%, transparent); }

  .points {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 26cqw;
    line-height: 0.9;
  }

  .band :global(.gem) {
    width: 17cqw;
    height: 17cqw;
  }

  .art {
    flex: 1;
    min-height: 0;
    padding: 4% 8% 0;
    opacity: 0.9;
  }

  .cost {
    list-style: none;
    margin: 0;
    padding: 5% 9% 8%;
    display: flex;
    flex-direction: column-reverse;
    gap: 4%;
    align-items: flex-start;
  }

  .cost li {
    display: flex;
    align-items: center;
    gap: 5cqw;
  }

  .cost :global(.gem) {
    width: 13cqw;
    height: 13cqw;
  }

  .cost span {
    font-family: var(--font-engraved);
    font-size: 12cqw;
    color: var(--ink);
    line-height: 1;
  }
</style>

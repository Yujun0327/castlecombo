<script lang="ts">
  import type { Gem, NobleDef } from '../engine'
  import { GEMS, NOBLE_POINTS } from '../engine'
  import GemIcon from './GemIcon.svelte'

  interface Props {
    noble: NobleDef
  }

  let { noble }: Props = $props()

  const reqs = $derived(GEMS.filter((g) => (noble.req[g] ?? 0) > 0).map(
    (g) => [g, noble.req[g]!] as [Gem, number],
  ))
</script>

<div class="holder">
  <article class="tile chamfer">
    <div class="frame"></div>
    <span class="points foil-text tabular">{NOBLE_POINTS}</span>
    <ul class="reqs">
      {#each reqs as [gem, n] (gem)}
        <li>
          <GemIcon kind={gem} size={14} />
          <span class="tabular">{n}</span>
        </li>
      {/each}
    </ul>
    <!-- engraved deco cameo: stylized profile in a cartouche -->
    <svg class="cameo" viewBox="0 0 60 60" aria-hidden="true">
      <ellipse class="cartouche" cx="34" cy="30" rx="21" ry="26" />
      <path
        class="profile"
        d="M28,50 L28,45 C23,44 20,39 20,34 C20,25 25,17 33,16 C40,15 45,20 46,27 C46.5,30 46,32 47,34 L49,37 L46.5,38 C46.5,41 46,43 43,43.5 C41,43.8 39.5,43 38.5,44 C38,46 38,48 38.5,50 Z"
      />
      <path class="wave" d="M22,26 C24,18 30,13 37,13.5" />
      <path class="wave" d="M20,31 C20,21 28,13 37,13.5 C43,14 47,18 48,24" />
      <path class="wave" d="M24,22 C28,16 34,14.5 39,16" />
    </svg>
  </article>
</div>

<style>
  .holder {
    container-type: inline-size;
    filter: drop-shadow(0 2px 6px rgb(0 0 0 / 0.4));
  }

  .tile {
    aspect-ratio: 7 / 5;
    background: var(--ivory);
    border-radius: var(--r-card);
    position: relative;
    overflow: hidden;
  }

  .tile::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: var(--grain);
    opacity: 0.07;
    pointer-events: none;
  }

  .frame {
    position: absolute;
    inset: 6%;
    border: 1.5px solid var(--gold);
    opacity: 0.85;
    pointer-events: none;
  }

  .points {
    position: absolute;
    top: 9%;
    left: 10%;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 17cqw;
    line-height: 1;
  }

  .reqs {
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    left: 10%;
    bottom: 10%;
    display: flex;
    flex-direction: column-reverse;
    gap: 5%;
  }

  .reqs li {
    display: flex;
    align-items: center;
    gap: 3.5cqw;
  }

  .reqs :global(.gem) {
    width: 9cqw;
    height: 9cqw;
  }

  .reqs span {
    font-family: var(--font-engraved);
    font-size: 8cqw;
    color: var(--ink);
    line-height: 1;
  }

  .cameo {
    position: absolute;
    right: 7%;
    top: 10%;
    height: 80%;
  }

  .cartouche {
    fill: none;
    stroke: var(--gold);
    stroke-width: 1.5;
    opacity: 0.8;
  }

  .profile {
    fill: var(--ink);
    opacity: 0.82;
  }

  .wave {
    fill: none;
    stroke: var(--gold);
    stroke-width: 1.5;
    stroke-linecap: round;
    opacity: 0.9;
  }
</style>

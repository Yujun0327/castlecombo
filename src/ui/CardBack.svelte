<script lang="ts">
  import type { Tier } from '../engine'

  interface Props {
    tier: Tier
  }

  let { tier }: Props = $props()

  const numeral = $derived(['I', 'II', 'III'][tier - 1])
</script>

<div class="holder">
  <div class="back chamfer">
    <div class="keyline outer"></div>
    {#if tier >= 2}
      <div class="keyline inner"></div>
    {/if}
    {#if tier === 3}
      <svg class="corners" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true">
        <path d="M8,22 L20,10 M8,15 L14,9 M8,29 L26,11" />
        <path d="M92,22 L80,10 M92,15 L86,9 M92,29 L74,11" />
        <path d="M8,118 L20,130 M8,125 L14,131 M8,111 L26,129" />
        <path d="M92,118 L80,130 M92,125 L86,131 M92,111 L74,129" />
      </svg>
    {/if}
    <span class="numeral foil-text">{numeral}</span>
    <div class="lozenges" aria-hidden="true">
      {#each { length: tier } as _, i (i)}
        <span class="lozenge"></span>
      {/each}
    </div>
  </div>
</div>

<style>
  .holder {
    container-type: inline-size;
    filter: drop-shadow(0 2px 6px rgb(0 0 0 / 0.4));
  }

  .back {
    aspect-ratio: 5 / 7;
    background: var(--lacquer);
    border-radius: var(--r-card);
    position: relative;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 6%;
    overflow: hidden;
  }

  .back::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: var(--grain);
    opacity: 0.06;
    pointer-events: none;
  }

  .keyline {
    position: absolute;
    border: 1.5px solid var(--gold);
    pointer-events: none;
  }

  .keyline.outer {
    inset: 5%;
    opacity: 0.9;
  }

  .keyline.inner {
    inset: 10%;
    opacity: 0.55;
  }

  .corners {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .corners path {
    stroke: var(--gold);
    stroke-width: 1.5;
    fill: none;
    opacity: 0.7;
  }

  .numeral {
    font-family: var(--font-engraved);
    font-size: 34cqw;
    line-height: 1;
  }

  .lozenges {
    display: flex;
    gap: 7cqw;
  }

  .lozenge {
    width: 7cqw;
    height: 11cqw;
    background: var(--gold);
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
    opacity: 0.9;
  }
</style>

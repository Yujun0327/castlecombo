<script lang="ts">
  import { CARDS, NOBLES } from '../data'
  import { TOKEN_COLORS } from '../engine'
  import type { Tier } from '../engine'
  import CardBack from './CardBack.svelte'
  import CardFace from './CardFace.svelte'
  import NobleTile from './NobleTile.svelte'
  import TokenChip from './TokenChip.svelte'

  const tiers: Tier[] = [1, 2, 3]
</script>

<!-- Dev-only visual QA: every token, noble, back, and all 90 card faces. -->
<main class="gallery">
  <h1 class="foil-text">Component Gallery</h1>

  <section>
    <h2 class="label">Tokens</h2>
    <div class="row">
      {#each TOKEN_COLORS as c (c)}
        <TokenChip kind={c} count={7} size={56} />
      {/each}
      {#each TOKEN_COLORS as c (c)}
        <TokenChip kind={c} size={40} />
      {/each}
    </div>
  </section>

  <section>
    <h2 class="label">Nobles</h2>
    <div class="nobles">
      {#each NOBLES as noble (noble.id)}
        <NobleTile {noble} />
      {/each}
    </div>
  </section>

  {#each tiers as tier (tier)}
    <section>
      <h2 class="label">Tier {tier}</h2>
      <div class="cards">
        <CardBack {tier} />
        {#each CARDS.filter((c) => c.tier === tier) as card (card.id)}
          <CardFace {card} />
        {/each}
      </div>
    </section>
  {/each}
</main>

<style>
  .gallery {
    max-width: 1240px;
    margin: 0 auto;
    padding: var(--sp-6) var(--sp-5) var(--sp-7);
    display: flex;
    flex-direction: column;
    gap: var(--sp-6);
  }

  h1 {
    font-size: var(--fs-2xl);
    letter-spacing: 0.06em;
  }

  section {
    background: var(--felt);
    border-radius: var(--r-card);
    box-shadow: var(--hairline-dim), var(--shadow);
    padding: var(--sp-5);
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-4);
    align-items: center;
  }

  .nobles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--sp-4);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: var(--sp-4);
  }
</style>

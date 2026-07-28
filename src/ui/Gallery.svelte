<script lang="ts">
  import { cardsOfDeck } from '../data'
  import { DECKS, SHIELDS } from '../engine'
  import CardBack from './CardBack.svelte'
  import CardFace from './CardFace.svelte'
  import CoinIcon from './CoinIcon.svelte'
  import KeyIcon from './KeyIcon.svelte'
  import MessengerPawn from './MessengerPawn.svelte'
  import MyGrid from './MyGrid.svelte'
  import ScoreSheet from './ScoreSheet.svelte'
  import ShieldIcon from './ShieldIcon.svelte'
  import {
    finishedBreakdown,
    finishedPlayer,
    midGamePlaced,
    midGameTargets,
  } from './gallery-fixtures'
</script>

<!-- Dev-only visual QA: every icon, both backs, all 78 entries, grid fixtures. -->
<main class="gallery">
  <h1>Component Gallery</h1>

  <section class="panel">
    <h2 class="label">Heraldic shields</h2>
    <div class="row">
      {#each SHIELDS as s (s)}
        <div class="swatch">
          <ShieldIcon type={s} size={44} />
          <span class="label">{s}</span>
        </div>
      {/each}
    </div>
  </section>

  <section class="panel">
    <h2 class="label">Coins, keys, the messenger</h2>
    <div class="row">
      <CoinIcon size={44} value={7} />
      <CoinIcon size={30} value={0} />
      <CoinIcon size={30} />
      <KeyIcon size={44} />
      <KeyIcon size={26} />
      <MessengerPawn size={40} />
    </div>
  </section>

  <section class="panel">
    <h2 class="label">Card backs</h2>
    <div class="row">
      {#each DECKS as deck (deck)}
        <CardBack {deck} count={36} width={120} />
        <CardBack {deck} width={90} />
      {/each}
    </div>
  </section>

  {#each DECKS as deck (deck)}
    <section class="panel">
      <h2 class="label">{deck} deck — {cardsOfDeck(deck).length} entries</h2>
      <div class="cards">
        {#each cardsOfDeck(deck) as card (card.id)}
          <CardFace def={card} width={160} />
        {/each}
      </div>
    </section>
  {/each}

  <section class="panel">
    <h2 class="label">Kingdom, five turns in</h2>
    <MyGrid placed={midGamePlaced} />
  </section>

  <section class="panel">
    <h2 class="label">Kingdom during placement (legal targets washed gold)</h2>
    <MyGrid placed={midGamePlaced} targets={midGameTargets} onPlace={() => {}} />
  </section>

  <section class="panel">
    <h2 class="label">Score sheet, finished kingdom</h2>
    <div class="sheet-well">
      <ScoreSheet
        name="Fixture"
        breakdown={finishedBreakdown}
        faceDown={finishedPlayer.placed.map((p) => p.faceDown)}
      />
    </div>
  </section>
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
  }

  section {
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

  .swatch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sp-1);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, 160px);
    gap: var(--sp-4);
  }

  .sheet-well {
    max-width: 420px;
  }
</style>

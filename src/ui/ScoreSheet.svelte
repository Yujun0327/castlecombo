<script lang="ts">
  import { cardById } from '../data'
  import type { ScoreBreakdown } from '../engine'
  import CardFace from './CardFace.svelte'
  import CardBack from './CardBack.svelte'
  import CoinIcon from './CoinIcon.svelte'
  import KeyIcon from './KeyIcon.svelte'

  interface Props {
    name: string
    breakdown: ScoreBreakdown
    /** Face-down flags per line, in placement order (breakdown order). */
    faceDown?: readonly boolean[]
  }

  const { name, breakdown, faceDown = [] }: Props = $props()
</script>

<div class="sheet">
  <h3 class="who">{name}</h3>

  <ul class="lines">
    {#each breakdown.cards as line, i (i)}
      {@const def = cardById.get(line.card)!}
      <li class="line">
        <span class="mini-card">
          {#if faceDown[i]}
            <CardBack deck={def.deck} width={40} />
          {:else}
            <CardFace {def} width={40} mini purseGold={line.purseGold} />
          {/if}
        </span>
        <span class="card-name">{faceDown[i] ? 'Face-down card' : def.name}</span>
        {#if line.purseGold > 0}
          <span class="purse-note tabular"><CoinIcon size={13} />{line.purseGold} pursed</span>
        {/if}
        <svg class="scroll-mark" viewBox="0 0 20 14" aria-hidden="true">
          <path d="M4 3 L16 3 Q18 3 18 5 L18 11 L6 11 Q4 11 4 9 Z M4 3 Q2 4.5 4 6.5" class="mark" />
        </svg>
        <span class="pts tabular">{line.points}</span>
      </li>
    {/each}

    <li class="line">
      <span class="mini-card keyline"><KeyIcon size={22} /></span>
      <span class="card-name">Leftover keys</span>
      <span class="pts tabular">{breakdown.keyPoints}</span>
    </li>
  </ul>

  <p class="tiebreak tabular">
    <CoinIcon size={14} />
    {breakdown.leftoverGold} gold found no purse — it scores nothing, but breaks ties.
  </p>

  <p class="total">
    <span class="label">Total</span>
    <span class="gilt tabular total-num">{breakdown.total}</span>
  </p>
</div>

<style>
  .sheet {
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
  }

  .who {
    font-size: var(--fs-md);
  }

  .lines {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .line {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    padding: 3px 0;
    border-bottom: 1px solid var(--line);
  }

  .mini-card {
    flex: none;
    width: 40px;
  }

  .keyline {
    display: grid;
    place-items: center;
  }

  .card-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--fs-xs);
  }

  .purse-note {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-family: var(--font-ui);
    font-size: 0.68rem;
    color: var(--ink-soft);
  }

  .scroll-mark {
    width: 18px;
    flex: none;
  }

  .mark {
    fill: var(--parchment-deep);
    stroke: var(--ink-soft);
    stroke-width: 1.1;
  }

  .pts {
    font-family: var(--font-ui);
    font-weight: 700;
    min-width: 2ch;
    text-align: right;
  }

  .tiebreak {
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--sp-1);
    font-size: var(--fs-xs);
    font-style: italic;
    color: var(--ink-soft);
  }

  .total {
    margin: 0;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .total-num {
    font-family: var(--font-display);
    font-size: var(--fs-xl);
  }
</style>

<script lang="ts">
  import { fly } from 'svelte/transition'
  import { cardById } from '../data'
  import type { Tier } from '../engine'
  import type { BaseSession } from '../app/session.svelte'
  import type { SheetTarget } from './interact'
  import CardBack from './CardBack.svelte'
  import CardFace from './CardFace.svelte'
  import { dur, settle } from './motion'

  interface Props {
    session: BaseSession
    onOpen: (target: SheetTarget) => void
  }

  let { session, onOpen }: Props = $props()

  // physical convention: tier III on top, tier I at the bottom
  const tiers: Tier[] = [3, 2, 1]
</script>

<div class="market">
  {#each tiers as tier (tier)}
    {@const row = session.state.market[tier - 1]}
    {@const deckSize = session.state.decks[tier - 1].length}
    <div class="tier-row">
      <button
        class="deck"
        disabled={deckSize === 0}
        onclick={() => onOpen({ kind: 'deck', tier })}
        aria-label="tier {tier} deck, {deckSize} cards"
      >
        {#if deckSize > 0}
          <span class="deck-full">
            <CardBack {tier} />
            <span class="deck-count tabular">{deckSize}</span>
          </span>
          <span class="deck-spine">
            <span class="spine-numeral">{['I', 'II', 'III'][tier - 1]}</span>
            <span class="spine-count tabular">{deckSize}</span>
          </span>
        {:else}
          <div class="empty"><span class="lozenge"></span></div>
        {/if}
      </button>
      {#each row as card, slot (`${slot}:${card}`)}
        {#if card !== null}
          <!-- keyed on the card id so refills re-deal from the deck's direction -->
          <button
            class="slot"
            in:fly={{ x: -24, duration: dur(260), delay: dur(40 * slot), easing: settle }}
            onclick={() => onOpen({ kind: 'market', tier, slot, card })}
            aria-label="tier {tier} card"
          >
            <CardFace card={cardById.get(card)!} />
          </button>
        {:else}
          <div class="empty"><span class="lozenge"></span></div>
        {/if}
      {/each}
    </div>
  {/each}
</div>

<style>
  .market {
    display: flex;
    flex-direction: column;
    gap: var(--sp-3);
    max-width: 700px;
    margin-inline: auto;
  }

  .tier-row {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: var(--sp-3);
    align-items: stretch;
  }

  /* phone: the deck collapses to a slim spine so four cards keep readable size */
  .deck-spine {
    display: none;
  }

  @media (max-width: 899px) {
    .tier-row {
      gap: var(--sp-2);
      grid-template-columns: 34px repeat(4, minmax(0, 1fr));
    }

    .deck-full {
      display: none;
    }

    .deck:disabled .empty {
      aspect-ratio: auto;
      height: 100%;
    }

    .deck-spine {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      background: var(--lacquer);
      border-radius: var(--r-chip);
      box-shadow: var(--hairline-dim), var(--shadow);
      padding: var(--sp-2) 0;
    }

    .spine-numeral {
      font-family: var(--font-engraved);
      color: var(--gold);
      font-size: var(--fs-xs);
    }

    .spine-count {
      font-size: var(--fs-xs);
      color: var(--gold-hi);
    }
  }

  .deck,
  .slot {
    background: none;
    border: none;
    padding: 0;
    position: relative;
    border-radius: var(--r-card);
    transition: transform 120ms ease;
  }

  .deck:not(:disabled):hover,
  .slot:hover {
    transform: translateY(-3px);
  }

  .deck:disabled {
    cursor: default;
  }

  .deck-count {
    position: absolute;
    top: 6%;
    right: 8%;
    font-family: var(--font-engraved);
    font-size: var(--fs-xs);
    color: var(--gold-hi);
    background: rgb(0 0 0 / 0.45);
    border-radius: var(--r-chip);
    padding: 1px 5px;
  }

  /* engraved placeholder cartouche for exhausted slots */
  .empty {
    aspect-ratio: 5 / 7;
    border-radius: var(--r-card);
    box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--gold) 35%, transparent);
    display: grid;
    place-content: center;
  }

  .empty .lozenge {
    width: 10px;
    height: 16px;
    background: color-mix(in srgb, var(--gold) 35%, transparent);
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  }
</style>

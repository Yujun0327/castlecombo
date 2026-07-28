<script lang="ts">
  import { fly } from 'svelte/transition'
  import { cardById } from '../data'
  import { DECKS, effectiveCost, otherDeck } from '../engine'
  import type { Deck } from '../engine'
  import type { BaseSession } from '../app/session.svelte'
  import { dur, settle } from './motion'
  import { wobblyLine } from './wobble'
  import CardBack from './CardBack.svelte'
  import CardFace from './CardFace.svelte'
  import MessengerPawn from './MessengerPawn.svelte'

  interface Props {
    session: BaseSession
    onOpen: (slot: number) => void
  }

  const { session, onOpen }: Props = $props()

  const gs = $derived(session.state)
  const moves = $derived(session.myMoves())
  const canSwitch = $derived(moves.some((m) => m.type === 'useKey' && m.action === 'switch'))
  const canRefresh = $derived(moves.some((m) => m.type === 'useKey' && m.action === 'refresh'))

  /** Whose discounts the coins show: my seat, or the actor at a shared table. */
  const me = $derived(session.mySeat ?? session.actor)
  const myPlaced = $derived(gs.players[me].placed)

  const slotOpen = (slot: number) =>
    moves.some((m) => (m.type === 'buy' || m.type === 'takeFacedown') && m.slot === slot)

  /** Cards size to a third of the measured row; below 96px the row scrolls. */
  let slotsW = $state(0)
  const cardW = $derived(slotsW > 0 ? Math.max(96, Math.min(128, (slotsW - 16) / 3)) : 118)

  function rowLabel(deck: Deck): string {
    return `${deck} row`
  }
</script>

<div class="market">
  {#each DECKS as deck (deck)}
    {@const active = gs.messenger === deck}
    <section class="row" class:inactive={!active} aria-label={rowLabel(deck)}>
      <div class="margin">
        {#if active}
          <div class="pawn-slot" in:fly={{ y: 8, duration: dur(260), easing: settle }}>
            <MessengerPawn size={24} />
          </div>
          <button
            class="seal"
            disabled={!canSwitch}
            aria-label="move the messenger"
            title="Spend a key: move the messenger to the {otherDeck(deck)} row"
            onclick={() => session.submit({ type: 'useKey', action: 'switch' })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 9 Q10 8.65 15 9 M12 5.5 L15.5 9 L12 12.5" class="glyph" />
              <path d="M19 15 Q14 15.35 9 15 M12 11.5 L8.5 15 L12 18.5" class="glyph" />
            </svg>
            <span class="seal-label">move</span>
          </button>
          <button
            class="seal"
            disabled={!canRefresh}
            aria-label="redraw the row"
            title="Spend a key: discard this row and reveal three new cards"
            onclick={() => session.submit({ type: 'useKey', action: 'refresh' })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.5 9.5 A6.5 6.5 0 1 0 18.5 14" class="glyph" />
              <path d="M18 5.5 L18 10 L13.5 10" class="glyph" />
            </svg>
            <span class="seal-label">redraw</span>
          </button>
        {/if}
      </div>

      <div class="stack">
        <CardBack {deck} count={gs.decks[deck].length} width={64} />
      </div>

      <div class="slots" bind:clientWidth={slotsW}>
        {#each gs.rows[deck] as card, slot (slot)}
          {#if card !== null}
            {#if active}
              <button
                class="slot-btn"
                aria-label="{deck} slot {slot + 1}: {cardById.get(card)!.name}"
                disabled={!slotOpen(slot)}
                onclick={() => onOpen(slot)}
              >
                <CardFace
                  def={cardById.get(card)!}
                  effectiveCost={effectiveCost(myPlaced, card)}
                  width={cardW}
                />
              </button>
            {:else}
              <div class="slot-still" aria-label="{deck} slot {slot + 1}: {cardById.get(card)!.name}">
                <CardFace
                  def={cardById.get(card)!}
                  effectiveCost={effectiveCost(myPlaced, card)}
                  width={cardW}
                />
              </div>
            {/if}
          {:else}
            <div class="slot-empty" style="width:{cardW}px">
              <svg viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true">
                <path d={wobblyLine(6, 6, 94, 6, 1.4, 2)} class="empty-line" />
                <path d={wobblyLine(6, 134, 94, 134, 1.4, 2)} class="empty-line" />
              </svg>
              <span class="empty-note">the deck is spent</span>
            </div>
          {/if}
        {/each}
      </div>

      <div class="discard" title="{deck} discard">
        <svg viewBox="0 0 24 24" aria-hidden="true" class="book">
          <path
            d="M6.5 4.5 L17 4.5 Q18.5 4.5 18.5 6 L18.5 19.5 L8 19.5 Q6.5 19.5 6.5 18 Z"
            class="cover"
          />
          <path d="M8 19.5 Q7.2 17.8 8.6 16.6 L18.5 16.6" class="spine" />
        </svg>
        <span class="tabular discard-count">{gs.discard[deck].length}</span>
      </div>
    </section>
  {/each}

  {#if !session.myTurn && !gs.result}
    <p class="await">Awaiting {session.names[gs.turn]} — the quill is theirs.</p>
  {/if}
</div>

<style>
  .market {
    display: flex;
    flex-direction: column;
    gap: var(--sp-3);
  }

  .row {
    display: grid;
    grid-template-columns: 56px 64px 1fr auto;
    gap: var(--sp-2);
    align-items: center;
  }

  /* the idle row keeps its shape but its ink fades (never blurred) */
  .inactive .stack,
  .inactive .slots,
  .inactive .discard {
    opacity: 0.6;
  }

  .margin {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sp-2);
    min-height: 96px;
    justify-content: center;
  }

  .pawn-slot {
    display: grid;
    place-items: center;
  }

  /* wax-seal buttons: rubric disc, embossed ink glyph, presses squash 1px */
  .seal {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--ink);
    background: var(--rubric);
    color: var(--panel);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 3px 0 0;
    box-shadow: var(--shadow);
  }

  .seal:active:not(:disabled) {
    transform: translateY(1px) scaleY(0.96);
  }

  .seal:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .seal svg {
    width: 18px;
    height: 18px;
  }

  .glyph {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .seal-label {
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 0.5rem;
    letter-spacing: 0.06em;
    line-height: 1;
  }

  .slots {
    display: flex;
    gap: var(--sp-2);
    min-width: 0;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .slot-btn {
    background: none;
    border: none;
    padding: 0;
    border-radius: var(--radius);
    cursor: pointer;
    flex: none;
  }

  .slot-btn:disabled {
    cursor: default;
  }

  .slot-btn:not(:disabled):hover :global(.entry) {
    outline: 2px solid var(--gold-leaf);
    outline-offset: 1px;
  }

  .slot-still {
    flex: none;
  }

  .slot-empty {
    position: relative;
    flex: none;
    aspect-ratio: 160 / 224;
    background: var(--parchment-deep);
    border-radius: var(--radius);
    display: grid;
    place-items: center;
  }

  .slot-empty svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .empty-line {
    fill: none;
    stroke: var(--line);
    stroke-width: 1.2;
  }

  .empty-note {
    font-style: italic;
    font-size: 0.72rem;
    color: var(--ink-soft);
    text-align: center;
    padding: 0 6px;
  }

  .discard {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 34px;
  }

  .book {
    width: 26px;
    height: 26px;
  }

  .cover {
    fill: var(--parchment-deep);
    stroke: var(--ink);
    stroke-width: 1.4;
    stroke-linejoin: round;
  }

  .spine {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.2;
  }

  .discard-count {
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 0.75rem;
    color: var(--ink-soft);
  }

  .await {
    margin: 0;
    text-align: center;
    font-style: italic;
    color: var(--ink-soft);
  }

  @media (max-width: 480px) {
    .row {
      grid-template-columns: 44px 48px 1fr auto;
    }

    .seal {
      width: 40px;
      height: 40px;
    }
  }
</style>

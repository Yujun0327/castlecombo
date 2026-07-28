<script lang="ts">
  import { cardById } from '../data'
  import { FACEDOWN_GOLD, FACEDOWN_KEYS, buyRequirements, effectiveCost } from '../engine'
  import type { CardDef, Effect } from '../engine'
  import type { BaseSession } from '../app/session.svelte'
  import { canBuy } from './interact'
  import { effectLines } from './cardtext'
  import CardFace from './CardFace.svelte'
  import CoinIcon from './CoinIcon.svelte'
  import KeyIcon from './KeyIcon.svelte'
  import Modal from './Modal.svelte'

  interface Props {
    session: BaseSession
    slot: number
    onClose: () => void
    onCommit: (commit: {
      mode: 'buy' | 'takeFacedown'
      slot: number
      choice?: 'a' | 'b'
      discardSlot?: number
    }) => void
  }

  const { session, slot, onClose, onCommit }: Props = $props()

  const gs = $derived(session.state)
  const cardId = $derived(gs.rows[gs.messenger][slot])
  const def = $derived<CardDef | null>(cardId === null ? null : (cardById.get(cardId) ?? null))

  const me = $derived(session.mySeat ?? session.actor)
  const player = $derived(gs.players[me])
  const eff = $derived(cardId === null ? 0 : effectiveCost(player.placed, cardId))

  /** Banners already in the kingdom that touch this card's deck. */
  const bannerCount = $derived.by(() => {
    if (!def) return 0
    let n = 0
    for (const p of player.placed) {
      if (p.faceDown) continue
      const b = cardById.get(p.card)!.banner
      if (b === 'all' || b === def.deck) n++
    }
    return n
  })

  const moves = $derived(session.myMoves())
  const buyable = $derived(canBuy(slot, moves))

  const req = $derived(cardId === null ? { choice: false, discardRow: null } : buyRequirements(cardId))
  const choiceEffect = $derived(
    def?.onBuy?.find((fx): fx is Extract<Effect, { kind: 'choice' }> => fx.kind === 'choice'),
  )
  const discardRow = $derived(req.discardRow)
  const discardOptions = $derived.by(() => {
    if (!discardRow) return []
    return gs.rows[discardRow]
      .map((c, i) => ({ card: c, slot: i }))
      .filter((o): o is { card: number; slot: number } => o.card !== null)
  })

  let chosen = $state<'a' | 'b' | null>(null)
  let discardChosen = $state<number | null>(null)

  const needsChoice = $derived(req.choice && chosen === null)
  const needsDiscard = $derived(discardOptions.length > 0 && discardChosen === null)

  const buyBlock = $derived.by(() => {
    if (!def) return 'This slot is empty.'
    if (!session.myTurn) return `It is ${session.names[gs.turn]}'s turn — the quill is theirs.`
    if (!buyable) return `Not enough gold — it costs ${eff}, you hold ${player.gold}.`
    if (needsChoice) return 'Choose one of the printed options first.'
    if (needsDiscard) return `Pick the ${discardRow} card to discard first.`
    return null
  })

  function recruit() {
    if (buyBlock) return
    onCommit({
      mode: 'buy',
      slot,
      choice: chosen ?? undefined,
      discardSlot: discardChosen ?? undefined,
    })
  }

  function takeFacedown() {
    if (!session.myTurn) return
    onCommit({ mode: 'takeFacedown', slot })
  }
</script>

<Modal {onClose}>
  {#if def}
    <div class="sheet-body">
      <div class="showcase">
        <CardFace {def} effectiveCost={eff} width={190} />
        <div class="cost-math">
          <span class="label">Cost</span>
          {#if bannerCount > 0}
            <span class="math tabular">
              {def.cost} &minus; {bannerCount}
              {bannerCount === 1 ? 'banner' : 'banners'} = {eff}
            </span>
          {:else}
            <span class="math tabular">{def.cost} gold</span>
          {/if}
        </div>
      </div>

      {#if choiceEffect}
        <fieldset class="decision">
          <legend class="label">Printed choice — pick one</legend>
          <button
            class="choice-option"
            class:picked={chosen === 'a'}
            onclick={() => (chosen = 'a')}
          >
            {effectLines(choiceEffect.a).join(', then ')}
          </button>
          <button
            class="choice-option"
            class:picked={chosen === 'b'}
            onclick={() => (chosen = 'b')}
          >
            {effectLines(choiceEffect.b).join(', then ')}
          </button>
        </fieldset>
      {/if}

      {#if discardRow && discardOptions.length > 0}
        <fieldset class="decision">
          <legend class="label">Discard from the {discardRow} row — gain its cost</legend>
          <div class="discard-row">
            {#each discardOptions as o (o.slot)}
              <button
                class="discard-option"
                class:picked={discardChosen === o.slot}
                aria-label="discard {cardById.get(o.card)!.name}"
                onclick={() => (discardChosen = o.slot)}
              >
                <CardFace def={cardById.get(o.card)!} width={84} mini />
              </button>
            {/each}
          </div>
        </fieldset>
      {:else if discardRow}
        <p class="note">The {discardRow} row is empty — that effect will fizzle.</p>
      {/if}

      <div class="actions">
        <button class="btn btn--gold" disabled={buyBlock !== null} onclick={recruit}>
          Recruit for {eff} gold
        </button>
        {#if buyBlock && session.myTurn}
          <p class="why rubric">{buyBlock}</p>
        {:else if buyBlock}
          <p class="why">{buyBlock}</p>
        {/if}

        <button class="btn facedown" disabled={!session.myTurn} onclick={takeFacedown}>
          <span>Take face-down</span>
          <span class="gain">
            +{FACEDOWN_GOLD} <CoinIcon size={15} /> +{FACEDOWN_KEYS} <KeyIcon size={15} />
          </span>
        </button>
        <p class="note">
          A face-down card fills a cell of your kingdom but has no shields, no effect, and scores
          nothing.
        </p>

        <button class="btn btn--quiet" onclick={onClose}>Leave it</button>
      </div>
    </div>
  {:else}
    <div class="sheet-body">
      <p class="note">This slot is empty.</p>
      <button class="btn btn--quiet" onclick={onClose}>Close</button>
    </div>
  {/if}
</Modal>

<style>
  .sheet-body {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
    min-width: min(84vw, 320px);
  }

  .showcase {
    display: flex;
    gap: var(--sp-4);
    align-items: flex-start;
  }

  .cost-math {
    display: flex;
    flex-direction: column;
    gap: var(--sp-1);
    padding-top: var(--sp-2);
  }

  .math {
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: var(--fs-md);
  }

  .decision {
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: var(--sp-3);
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
    margin: 0;
  }

  .choice-option {
    font-family: var(--font-body);
    font-size: var(--fs-sm);
    text-align: left;
    background: var(--parchment-deep);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    color: var(--ink);
    padding: var(--sp-2) var(--sp-3);
    min-height: 44px;
  }

  .choice-option.picked,
  .discard-option.picked {
    border-color: var(--gold-leaf);
    outline: 2px solid var(--gold-leaf);
    outline-offset: 1px;
  }

  .discard-row {
    display: flex;
    gap: var(--sp-2);
    flex-wrap: wrap;
  }

  .discard-option {
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius);
    padding: 2px;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
  }

  .facedown {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-2);
  }

  .gain {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-variant-numeric: tabular-nums;
  }

  .why {
    margin: 0;
    font-size: var(--fs-xs);
    font-style: italic;
  }

  .note {
    margin: 0;
    font-size: var(--fs-xs);
    color: var(--ink-soft);
    font-style: italic;
  }
</style>

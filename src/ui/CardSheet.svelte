<script lang="ts">
  import { cardById } from '../data'
  import { TOKEN_COLORS } from '../engine'
  import type { Move } from '../engine'
  import { OnlineSession } from '../app/session.svelte'
  import type { BaseSession } from '../app/session.svelte'
  import type { SheetTarget } from './interact'
  import CardBack from './CardBack.svelte'
  import CardFace from './CardFace.svelte'
  import GemIcon from './GemIcon.svelte'
  import Modal from './Modal.svelte'

  interface Props {
    session: BaseSession
    target: SheetTarget
    onClose: () => void
  }

  let { session, target, onClose }: Props = $props()

  const moves = $derived(session.myMoves())
  const online = $derived(session instanceof OnlineSession ? session : null)

  const blockedReason = $derived.by(() => {
    if (session.state.result) return 'The game is over.'
    if (session.myTurn) {
      return session.state.pending ? 'Settle the pending choice first.' : null
    }
    if (online?.spectator) return 'You are watching this game.'
    return `Waiting for ${session.names[session.actor]} to finish their turn.`
  })

  const purchase = $derived.by((): (Move & { type: 'purchase' }) | null => {
    if (target.kind === 'deck') return null
    const from = target.kind === 'market' ? 'market' : 'reserved'
    return (
      (moves.find(
        (m) => m.type === 'purchase' && m.from === from && m.card === target.card,
      ) as Move & { type: 'purchase' }) ?? null
    )
  })

  const reserve = $derived.by((): (Move & { type: 'reserve' }) | null => {
    const match = moves.find(
      (m) =>
        m.type === 'reserve' &&
        (target.kind === 'deck'
          ? 'deck' in m.from && m.from.deck === target.tier
          : target.kind === 'market' &&
            'tier' in m.from &&
            m.from.tier === target.tier &&
            m.from.slot === target.slot),
    )
    return (match as Move & { type: 'reserve' }) ?? null
  })

  const paymentPips = $derived(
    purchase ? TOKEN_COLORS.filter((c) => purchase.payment[c] > 0) : [],
  )

  function act(move: Move | null) {
    if (!move) return
    session.submit(move)
    onClose()
  }
</script>

<Modal {onClose}>
  <div class="body">
    <div class="preview">
      {#if target.kind === 'deck'}
        <CardBack tier={target.tier} />
        <p class="hint">Reserve the top card of the tier {['I', 'II', 'III'][target.tier - 1]} deck, sight unseen.</p>
      {:else}
        <CardFace card={cardById.get(target.card)!} />
      {/if}
    </div>

    <div class="actions">
      {#if target.kind !== 'deck'}
        <button class="btn btn--gold buy" disabled={!purchase} onclick={() => act(purchase)}>
          Purchase
          {#if purchase}
            {#if paymentPips.length > 0}
              <span class="pay">
                {#each paymentPips as c (c)}
                  <span class="pip">
                    <GemIcon kind={c} size={15} />
                    <span class="tabular">{purchase.payment[c]}</span>
                  </span>
                {/each}
              </span>
            {:else}
              <span class="pay free">free</span>
            {/if}
          {/if}
        </button>
        {#if !purchase && session.myTurn}
          <p class="hint">You cannot afford this card yet.</p>
        {/if}
      {/if}

      {#if target.kind !== 'reserved'}
        <button class="btn" disabled={!reserve} onclick={() => act(reserve)}>
          Reserve
          {#if reserve && session.state.bank.gold > 0}
            <span class="pay pip">+<GemIcon kind="gold" size={15} /></span>
          {/if}
        </button>
        {#if session.myTurn && !reserve && !session.state.pending && !session.state.result}
          <p class="hint">Reserve limit reached (3 cards).</p>
        {/if}
      {/if}

      {#if blockedReason}
        <p class="hint">{blockedReason}</p>
      {/if}

      <button class="btn btn--quiet" onclick={onClose}>Close</button>
    </div>
  </div>
</Modal>

<style>
  .body {
    display: flex;
    gap: var(--sp-5);
    align-items: center;
  }

  .preview {
    width: min(38vw, 170px);
    flex: none;
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: var(--sp-3);
    min-width: 170px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--sp-2);
    flex-wrap: wrap;
  }

  .pay {
    display: inline-flex;
    gap: var(--sp-1);
    align-items: center;
  }

  .pip {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .free {
    font-style: italic;
    text-transform: none;
  }

  .hint {
    margin: 0;
    font-size: var(--fs-xs);
    color: color-mix(in srgb, var(--ivory) 65%, transparent);
  }
</style>

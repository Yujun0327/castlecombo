<script lang="ts">
  import { bagTotal, emptyTokenBag, TOKEN_COLORS } from '../engine'
  import type { TokenBag } from '../engine'
  import type { BaseSession } from '../app/session.svelte'
  import Modal from './Modal.svelte'
  import TokenChip from './TokenChip.svelte'

  interface Props {
    session: BaseSession
  }

  let { session }: Props = $props()

  const pending = $derived(
    session.state.pending?.kind === 'returnTokens' ? session.state.pending : null,
  )
  const player = $derived(pending ? session.state.players[pending.actor] : null)

  let returning = $state<TokenBag>(emptyTokenBag())

  const returned = $derived(bagTotal(returning))
  const done = $derived(pending !== null && returned === pending.excess)

  function give(c: (typeof TOKEN_COLORS)[number]) {
    if (!pending || !player) return
    if (returned >= pending.excess) return
    if (returning[c] >= player.tokens[c]) return
    returning = { ...returning, [c]: returning[c] + 1 }
  }

  function takeBack(c: (typeof TOKEN_COLORS)[number]) {
    if (returning[c] === 0) return
    returning = { ...returning, [c]: returning[c] - 1 }
  }

  function confirm() {
    if (!done) return
    session.submit({ type: 'return', tokens: returning })
    returning = emptyTokenBag()
  }
</script>

{#if pending && player}
  <Modal>
    <div class="dialog">
      <h2>Over the limit</h2>
      <p class="hint">
        {session.names[pending.actor]}, you may keep only 10 tokens — return
        <strong class="tabular">{pending.excess}</strong>.
      </p>

      <div class="group">
        <span class="label">Keeping</span>
        <div class="chips">
          {#each TOKEN_COLORS as c (c)}
            {#if player.tokens[c] - returning[c] > 0}
              <TokenChip
                kind={c}
                count={player.tokens[c] - returning[c]}
                size={44}
                disabled={returned >= pending.excess || returning[c] >= player.tokens[c]}
                onclick={() => give(c)}
                label="return one {c}"
              />
            {/if}
          {/each}
        </div>
      </div>

      <div class="group tray">
        <span class="label">Returning</span>
        <div class="chips">
          {#each TOKEN_COLORS as c (c)}
            {#if returning[c] > 0}
              <TokenChip kind={c} count={returning[c]} size={44} onclick={() => takeBack(c)} label="keep one {c}" />
            {/if}
          {/each}
          {#if returned === 0}
            <span class="hint">Tap tokens above to return them.</span>
          {/if}
        </div>
      </div>

      <button class="btn btn--gold" disabled={!done} onclick={confirm}>
        Return {returned}/{pending.excess}
      </button>
    </div>
  </Modal>
{/if}

<style>
  .dialog {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
    min-width: min(80vw, 340px);
  }

  h2 {
    font-size: var(--fs-lg);
    letter-spacing: 0.04em;
  }

  .hint {
    margin: 0;
    font-size: var(--fs-sm);
    color: color-mix(in srgb, var(--ivory) 75%, transparent);
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
  }

  .tray {
    background: color-mix(in srgb, var(--lacquer) 55%, transparent);
    border-radius: var(--r-card);
    padding: var(--sp-3);
    min-height: 76px;
  }

  .chips {
    display: flex;
    gap: var(--sp-2);
    flex-wrap: wrap;
    align-items: center;
    min-height: 44px;
  }
</style>

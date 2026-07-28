<script lang="ts">
  import type { Gem } from '../engine'
  import { GEMS } from '../engine'
  import type { BaseSession } from '../app/session.svelte'
  import { canAddGem, selectionMove, tapGem } from './interact'
  import GemIcon from './GemIcon.svelte'
  import TokenChip from './TokenChip.svelte'

  interface Props {
    session: BaseSession
    selection: Gem[]
    onSelection: (next: Gem[]) => void
  }

  let { session, selection, onSelection }: Props = $props()

  const moves = $derived(session.myMoves())
  const interactive = $derived(
    session.myTurn && !session.state.pending && !session.state.result,
  )
  const confirmMove = $derived(selectionMove(selection, moves))

  function countOf(g: Gem): number {
    return selection.filter((x) => x === g).length
  }

  function take() {
    if (!confirmMove) return
    session.submit(confirmMove)
    onSelection([])
  }
</script>

<div class="bank">
  <div class="chips">
    {#each GEMS as g (g)}
      <span class="stack" class:picked={countOf(g) > 0}>
        <TokenChip
          kind={g}
          count={session.state.bank[g]}
          selected={countOf(g) > 0}
          disabled={interactive && countOf(g) === 0 && !canAddGem(selection, g, moves)}
          onclick={interactive ? () => onSelection(tapGem(selection, g, moves)) : undefined}
          label="take {g}, {session.state.bank[g]} left"
        />
        {#if countOf(g) === 2}
          <span class="twice tabular">×2</span>
        {/if}
      </span>
    {/each}
    <TokenChip kind="gold" count={session.state.bank.gold} label="gold, {session.state.bank.gold} left" />
  </div>

  {#if selection.length > 0}
    <div class="confirm">
      <button class="btn btn--gold" disabled={!confirmMove} onclick={take}>
        Take
        {#each selection as g, i (i)}
          <GemIcon kind={g} size={16} />
        {/each}
      </button>
      <button class="btn btn--quiet" onclick={() => onSelection([])}>Clear</button>
    </div>
  {/if}
</div>

<style>
  .bank {
    display: flex;
    flex-direction: column;
    gap: var(--sp-3);
    align-items: center;
  }

  .chips {
    display: flex;
    gap: var(--sp-3);
    flex-wrap: wrap;
    justify-content: center;
  }

  @media (max-width: 899px) {
    .chips {
      gap: var(--sp-2);
    }
  }

  .stack {
    position: relative;
  }

  .twice {
    position: absolute;
    top: -10px;
    left: 50%;
    translate: -50% 0;
    font-size: var(--fs-xs);
    color: var(--gold-hi);
  }

  .confirm {
    display: flex;
    gap: var(--sp-2);
  }

  .confirm .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-1);
  }
</style>

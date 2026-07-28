<script lang="ts">
  import { fly } from 'svelte/transition'
  import { OnlineSession } from '../app/session.svelte'
  import type { BaseSession } from '../app/session.svelte'
  import Modal from './Modal.svelte'
  import ScoreSheet from './ScoreSheet.svelte'
  import { dur, settle } from './motion'

  interface Props {
    session: BaseSession
    onRematch: () => void
    onExit: () => void
  }

  const { session, onRematch, onExit }: Props = $props()

  const result = $derived(session.state.result)
  const online = $derived(session instanceof OnlineSession ? session : null)

  let sheetSeat = $state<number | null>(null)

  // open on the winner's sheet once the result lands
  $effect(() => {
    if (result && sheetSeat === null) sheetSeat = result.winners[0]
  })
</script>

{#if result}
  <Modal>
    <div class="dialog">
      <h2 class="crown">
        {#if result.winners.length > 1}
          A shared triumph
        {:else}
          {session.names[result.winners[0]]} prevails
        {/if}
      </h2>

      <ol class="ranking">
        {#each result.ranking as seat, i (seat)}
          <li
            class="rank-line"
            class:winner={result.winners.includes(seat)}
            in:fly={{ y: 14, duration: dur(300), delay: dur(180 + i * 140), easing: settle }}
          >
            <span class="place tabular">{i + 1}.</span>
            <button
              class="rank-name"
              class:current={sheetSeat === seat}
              onclick={() => (sheetSeat = seat)}
            >
              {session.names[seat]}
            </button>
            <span class="rank-total gilt tabular">{result.breakdown[seat].total}</span>
          </li>
        {/each}
      </ol>

      {#if result.winners.length === 1 && result.ranking.length > 1}
        <p class="hint">Ties in points fall to whoever kept the most unpursed gold.</p>
      {/if}

      {#if sheetSeat !== null}
        <div class="sheet-well">
          <ScoreSheet
            name={session.names[sheetSeat]}
            breakdown={result.breakdown[sheetSeat]}
            faceDown={session.state.players[sheetSeat].placed.map((p) => p.faceDown)}
          />
        </div>
      {/if}

      {#if online?.rematchWanted}
        <p class="hint">Rematch requested — waiting for the host to deal again&hellip;</p>
      {/if}

      <div class="row">
        <button class="btn btn--gold" onclick={onRematch}>Rematch</button>
        <button class="btn btn--quiet" onclick={onExit}>Leave the table</button>
      </div>
    </div>
  </Modal>
{/if}

<style>
  .dialog {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
    min-width: min(84vw, 340px);
  }

  .crown {
    font-size: var(--fs-xl);
  }

  .ranking {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--sp-1);
  }

  .rank-line {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    border-bottom: 1px solid var(--line);
    padding-bottom: var(--sp-1);
  }

  .rank-line.winner .rank-name {
    color: var(--rubric);
    font-weight: 600;
  }

  .place {
    font-family: var(--font-ui);
    color: var(--ink-soft);
  }

  .rank-name {
    flex: 1;
    text-align: left;
    background: none;
    border: none;
    padding: 4px 0;
    font: inherit;
    color: var(--ink);
    text-decoration: underline dotted var(--line);
  }

  .rank-name.current {
    text-decoration-color: var(--gold-leaf);
    text-decoration-style: solid;
  }

  .rank-total {
    font-family: var(--font-display);
    font-size: var(--fs-md);
  }

  .sheet-well {
    background: var(--parchment-deep);
    border-radius: var(--radius);
    padding: var(--sp-3);
    max-height: 42dvh;
    overflow-y: auto;
  }

  .hint {
    margin: 0;
    font-size: var(--fs-xs);
    font-style: italic;
    color: var(--ink-soft);
  }

  .row {
    display: flex;
    gap: var(--sp-2);
    justify-content: flex-end;
  }
</style>

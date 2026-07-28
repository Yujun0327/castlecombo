<script lang="ts">
  import { fly } from 'svelte/transition'
  import { prestige } from '../engine'
  import type { BaseSession } from '../app/session.svelte'
  import Modal from './Modal.svelte'
  import { dur, settle } from './motion'

  interface Props {
    session: BaseSession
    onRematch: () => void
    onExit: () => void
  }

  let { session, onRematch, onExit }: Props = $props()

  const result = $derived(session.state.result)
</script>

{#if result}
  <Modal>
    <div class="dialog">
      <h2 class="foil-text">
        {#if result.winners.length > 1}
          A shared triumph
        {:else}
          {session.names[result.winners[0]]} prevails
        {/if}
      </h2>

      <table>
        <thead>
          <tr>
            <th class="label">Player</th>
            <th class="label num">Prestige</th>
            <th class="label num">Cards</th>
          </tr>
        </thead>
        <tbody>
          {#each result.ranking as seat, i (seat)}
            <tr
              class:winner={result.winners.includes(seat)}
              in:fly={{ y: 14, duration: dur(300), delay: dur(180 + i * 140), easing: settle }}
            >
              <td>{session.names[seat]}</td>
              <td class="num tabular">{prestige(session.state.players[seat])}</td>
              <td class="num tabular">{session.state.players[seat].cards.length}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      {#if result.winners.length === 1 && result.ranking.length > 1}
        <p class="hint">Ties in prestige are broken by the fewest development cards.</p>
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

  h2 {
    font-size: var(--fs-xl);
    letter-spacing: 0.04em;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  th,
  td {
    text-align: left;
    padding: var(--sp-2) var(--sp-2);
    border-bottom: 1px solid color-mix(in srgb, var(--gold) 25%, transparent);
  }

  .num {
    text-align: right;
  }

  tr.winner td {
    color: var(--gold-hi);
    font-weight: 600;
  }

  .hint {
    margin: 0;
    font-size: var(--fs-xs);
    color: color-mix(in srgb, var(--ivory) 65%, transparent);
  }

  .row {
    display: flex;
    gap: var(--sp-2);
    justify-content: flex-end;
  }
</style>

<script lang="ts">
  import { nobleById } from '../data'
  import type { BaseSession } from '../app/session.svelte'
  import Modal from './Modal.svelte'
  import NobleTile from './NobleTile.svelte'

  interface Props {
    session: BaseSession
  }

  let { session }: Props = $props()

  const pending = $derived(
    session.state.pending?.kind === 'chooseNoble' ? session.state.pending : null,
  )
</script>

{#if pending}
  <Modal>
    <div class="dialog">
      <h2>A noble visits</h2>
      <p class="hint">{session.names[pending.actor]}, your gems have drawn admirers. Choose one patron.</p>
      <div class="tiles">
        {#each pending.options as id (id)}
          <button class="tile" onclick={() => session.submit({ type: 'chooseNoble', noble: id })}>
            <NobleTile noble={nobleById.get(id)!} />
          </button>
        {/each}
      </div>
    </div>
  </Modal>
{/if}

<style>
  .dialog {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
  }

  h2 {
    font-size: var(--fs-lg);
    letter-spacing: 0.04em;
  }

  .hint {
    margin: 0;
    color: color-mix(in srgb, var(--ivory) 75%, transparent);
  }

  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--sp-3);
  }

  .tile {
    background: none;
    border: none;
    padding: 0;
    border-radius: var(--r-card);
    transition: transform 120ms ease;
  }

  .tile:hover {
    transform: translateY(-3px);
  }
</style>

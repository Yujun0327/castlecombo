<script lang="ts">
  import type { OnlineSession } from '../app/session.svelte'
  import { savePlayerName } from '../app/persist'

  interface Props {
    session: OnlineSession
    onExit: () => void
  }

  let { session, onExit }: Props = $props()

  let copied = $state(false)
  let relays = $state(0)
  let waitedLong = $state(false)

  $effect(() => {
    const poll = setInterval(() => (relays = session.relayCount()), 1500)
    const slow = setTimeout(() => (waitedLong = true), 12000)
    return () => {
      clearInterval(poll)
      clearTimeout(slow)
    }
  })

  const mySeatEntry = $derived(session.seats.find((s) => s.playerKey === session.myKey))
  const filled = $derived(session.seats.filter((s) => s.playerKey !== null))

  async function copyInvite() {
    const url = `${location.origin}${location.pathname}#room=${session.room}`
    try {
      await navigator.clipboard.writeText(url)
      copied = true
      setTimeout(() => (copied = false), 1600)
    } catch {
      /* clipboard unavailable — code is shown anyway */
    }
  }

  function rename(e: Event) {
    const name = (e.target as HTMLInputElement).value
    savePlayerName(name)
    session.rename(name)
  }
</script>

<main class="lobby">
  <section class="card panel">
    <h1>The table is set</h1>

    <div class="code-row">
      <span class="label">Room</span>
      <span class="code gilt">{session.room}</span>
      <button class="btn btn--quiet" onclick={copyInvite}>{copied ? 'Copied' : 'Copy invite'}</button>
    </div>

    {#if session.status === 'room-full'}
      <p class="hint">This table already seats four. Ask the host for the next game.</p>
    {:else}
      <ul class="seats">
        {#each { length: 4 } as _, i (i)}
          {@const seat = session.seats[i]}
          <li class="seat" class:open={!seat?.playerKey}>
            {#if seat?.playerKey}
              <span class="dot" class:on={seat.connected}></span>
              {#if seat.playerKey === session.myKey}
                <input
                  class="name-input"
                  type="text"
                  maxlength="14"
                  value={seat.name}
                  onchange={rename}
                  aria-label="your name"
                />
              {:else}
                <span class="name">{seat.name}</span>
              {/if}
              {#if seat.playerKey === session.hostKey}
                <span class="label">host</span>
              {/if}
              <span class="ready" class:yes={seat.ready}>{seat.ready ? 'Ready' : 'Not ready'}</span>
            {:else}
              <span class="dot"></span>
              <span class="name empty">Open seat</span>
            {/if}
          </li>
        {/each}
      </ul>

      <div class="actions">
        {#if mySeatEntry}
          <button
            class="btn"
            class:btn--gold={!mySeatEntry.ready}
            onclick={() => session.setReady(!mySeatEntry.ready)}
          >
            {mySeatEntry.ready ? 'Not ready after all' : "I'm ready"}
          </button>
        {/if}
        {#if session.isHost}
          <button class="btn btn--gold" disabled={!session.canStart} onclick={() => session.startGame()}>
            Deal the cards
          </button>
        {/if}
        <button class="btn btn--quiet" onclick={onExit}>Leave</button>
      </div>

      <p class="hint">
        {#if session.status === 'connecting' && filled.length <= 1}
          <span class="dot" class:on={relays > 0}></span>
          {relays > 0 ? 'Connected to the signaling network.' : 'Reaching the signaling network…'}
          {#if !session.isHost}
            Waiting for the host.
          {:else}
            Share the invite — friends joining will appear here.
          {/if}
          {#if waitedLong && filled.length <= 1}
            Still quiet — check that everyone uses the same room code, or try a fresh room.
          {/if}
        {:else if session.isHost}
          Start needs at least two seated players, everyone ready.
        {:else}
          The host deals when everyone is ready.
        {/if}
      </p>
    {/if}
  </section>
</main>

<style>
  .lobby {
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: var(--sp-5);
  }

  .card {
    padding: var(--sp-6);
    display: flex;
    flex-direction: column;
    gap: var(--sp-5);
    width: min(94vw, 440px);
  }

  h1 {
    font-size: var(--fs-xl);
  }

  .code-row {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    flex-wrap: wrap;
  }

  .code {
    font-family: var(--font-display);
    font-size: var(--fs-xl);
    letter-spacing: 0.18em;
  }

  .seats {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
  }

  .seat {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    background: var(--parchment-deep);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: var(--sp-2) var(--sp-3);
    min-height: 48px;
  }

  .seat.open {
    opacity: 0.6;
    background: transparent;
    border-style: dashed;
  }

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--line);
    flex: none;
  }

  .dot.on {
    background: var(--scholar);
  }

  .name {
    font-weight: 600;
    flex: 1;
  }

  .name.empty {
    font-weight: 400;
    font-style: italic;
    color: var(--ink-soft);
  }

  .name-input {
    font: inherit;
    font-weight: 600;
    color: var(--ink);
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--line);
    flex: 1;
    min-width: 0;
    padding: 2px 0;
    min-height: 0;
    border-radius: 0;
  }

  .name-input:focus-visible {
    outline: none;
    border-bottom-color: var(--gold-leaf);
  }

  .ready {
    font-family: var(--font-ui);
    font-size: var(--fs-xs);
    letter-spacing: 0.08em;
    color: var(--ink-soft);
  }

  .ready.yes {
    color: var(--rubric);
  }

  .actions {
    display: flex;
    gap: var(--sp-2);
    flex-wrap: wrap;
  }

  .hint {
    margin: 0;
    font-size: var(--fs-sm);
    color: var(--ink-soft);
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    flex-wrap: wrap;
  }
</style>

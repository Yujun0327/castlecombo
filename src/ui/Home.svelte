<script lang="ts">
  import WalletBadge from './WalletBadge.svelte'
  import RulesLeaflet from './RulesLeaflet.svelte'
  import { wobblyLine } from './wobble'

  interface Props {
    onHotseat: (playerCount: 2 | 3 | 4, names: string[]) => void
    onCreateRoom?: () => void
    onJoinRoom?: (code: string) => void
  }

  let { onHotseat, onCreateRoom, onJoinRoom }: Props = $props()

  let playerCount = $state<2 | 3 | 4>(2)
  let names = $state(['', '', '', ''])
  let joinCode = $state('')
  let rulesOpen = $state(false)

  const online = $derived(onCreateRoom !== undefined && onJoinRoom !== undefined)

  const ruleTop = wobblyLine(4, 6, 336, 6, 1.6, 4)
  const ruleBottom = wobblyLine(4, 6, 336, 6, 1.6, 3)
</script>

<main class="home">
  <header class="marquee">
    <svg class="rule" viewBox="0 0 340 12" aria-hidden="true">
      <path d={ruleTop} class="rule-ink" />
      <path d="M170 1.5 L175 6 L170 10.5 L165 6 Z" class="rule-gem" />
    </svg>
    <h1>Castle Combo</h1>
    <svg class="rule" viewBox="0 0 340 12" aria-hidden="true">
      <path d={ruleBottom} class="rule-ink" />
      <path d="M170 1.5 L175 6 L170 10.5 L165 6 Z" class="rule-gem" />
    </svg>
    <p class="flavor">Build your kingdom, nine cards square.</p>
    <button class="btn btn--quiet" onclick={() => (rulesOpen = true)}>How to play</button>
  </header>
  <WalletBadge />

  <div class="panels">
    <section class="card panel">
      <h2>At one table</h2>
      <p class="hint">Pass one device around.</p>

      <div class="stepper" role="group" aria-label="player count">
        {#each [2, 3, 4] as const as n (n)}
          <button class="btn seat" class:btn--gold={playerCount === n} onclick={() => (playerCount = n)}>
            {n}
          </button>
        {/each}
        <span class="label">players</span>
      </div>

      <div class="names">
        {#each { length: playerCount } as _, i (i)}
          <input
            type="text"
            placeholder="Player {i + 1}"
            maxlength="14"
            bind:value={names[i]}
            aria-label="name of player {i + 1}"
          />
        {/each}
      </div>

      <button class="btn btn--gold start" onclick={() => onHotseat(playerCount, names.slice(0, playerCount))}>
        Begin
      </button>
    </section>

    <section class="card panel">
      <h2>Across the world</h2>
      <p class="hint">
        {#if online}
          Share a room code — no accounts, no servers.
        {:else}
          Online play is being prepared.
        {/if}
      </p>

      <button class="btn btn--gold" disabled={!online} onclick={() => onCreateRoom?.()}>
        Open a room
      </button>

      <div class="join">
        <input
          type="text"
          placeholder="Room code"
          maxlength="6"
          bind:value={joinCode}
          disabled={!online}
          aria-label="room code"
          onkeydown={(e) => e.key === 'Enter' && joinCode.trim() && onJoinRoom?.(joinCode.trim())}
        />
        <button
          class="btn"
          disabled={!online || joinCode.trim().length < 4}
          onclick={() => onJoinRoom?.(joinCode.trim())}
        >
          Join
        </button>
      </div>
    </section>
  </div>
</main>

{#if rulesOpen}
  <RulesLeaflet onClose={() => (rulesOpen = false)} />
{/if}

<style>
  .home {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--sp-7);
    padding: var(--sp-6) var(--sp-4);
  }

  .marquee {
    display: grid;
    justify-items: center;
    gap: var(--sp-2);
  }

  .marquee h1 {
    font-size: clamp(3rem, 10vw, 4.8rem);
    letter-spacing: 0.02em;
    line-height: 1;
  }

  .rule {
    width: min(70vw, 340px);
    height: 12px;
  }

  .rule-ink {
    fill: none;
    stroke: var(--ink-soft);
    stroke-width: 1.5;
    stroke-linecap: round;
  }

  .rule-gem {
    fill: var(--gold-leaf);
    stroke: var(--ink);
    stroke-width: 1;
    stroke-linejoin: round;
  }

  .flavor {
    margin: 0;
    font-style: italic;
    color: var(--ink-soft);
    font-size: var(--fs-md);
  }

  .panels {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 340px));
    gap: var(--sp-5);
    justify-content: center;
    width: 100%;
  }

  .card {
    padding: var(--sp-5);
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
  }

  h2 {
    font-size: var(--fs-lg);
  }

  .hint {
    margin: 0;
    font-size: var(--fs-sm);
    color: var(--ink-soft);
  }

  .stepper {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
  }

  .seat {
    min-width: 44px;
    padding: 10px 0;
  }

  .names {
    display: grid;
    gap: var(--sp-2);
  }

  .join {
    display: flex;
    gap: var(--sp-2);
  }

  .join input {
    flex: 1;
    min-width: 0;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
</style>

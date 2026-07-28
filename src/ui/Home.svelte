<script lang="ts">
  import RulesLeaflet from './RulesLeaflet.svelte'

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
</script>

<main class="home">
  <header class="marquee">
    <span class="rule" aria-hidden="true"></span>
    <h1 class="foil-text">Castle Combo</h1>
    <span class="rule" aria-hidden="true"></span>
    <p class="label">Gems · Cards · Nobles</p>
    <button class="btn btn--quiet" onclick={() => (rulesOpen = true)}>How to play</button>
  </header>

  <div class="panels">
    <section class="card">
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

    <section class="card">
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
    letter-spacing: 0.1em;
    line-height: 1;
  }

  .rule {
    width: min(70vw, 340px);
    height: 8px;
    background:
      linear-gradient(to right, transparent, var(--gold) 20%, var(--gold) 80%, transparent) center /
      100% 1.5px no-repeat;
    position: relative;
  }

  .rule::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
    width: 9px;
    height: 15px;
    background: var(--gold);
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  }

  .panels {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 340px));
    gap: var(--sp-5);
    justify-content: center;
    width: 100%;
  }

  .card {
    background: var(--felt);
    border-radius: var(--r-card);
    box-shadow: var(--hairline-dim), var(--shadow);
    padding: var(--sp-5);
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
    font-size: var(--fs-sm);
    color: color-mix(in srgb, var(--ivory) 70%, transparent);
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

  input {
    font: inherit;
    color: var(--ivory);
    background: color-mix(in srgb, var(--lacquer) 60%, transparent);
    border: none;
    border-radius: var(--r-chip);
    box-shadow: var(--hairline-dim);
    padding: 11px 14px;
    min-height: 44px;
  }

  input::placeholder {
    color: color-mix(in srgb, var(--ivory) 40%, transparent);
  }

  input:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
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

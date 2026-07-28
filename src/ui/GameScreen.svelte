<script lang="ts">
  import { flip } from 'svelte/animate'
  import { scale } from 'svelte/transition'
  import { nobleById } from '../data'
  import type { Gem, Seat } from '../engine'
  import { OnlineSession } from '../app/session.svelte'
  import type { BaseSession } from '../app/session.svelte'
  import { isMuted, play, setMuted } from './audio'
  import { dur } from './motion'
  import type { SheetTarget } from './interact'
  import BankRow from './BankRow.svelte'
  import CardSheet from './CardSheet.svelte'
  import MarketBoard from './MarketBoard.svelte'
  import MyTableau from './MyTableau.svelte'
  import NobleChoiceDialog from './NobleChoiceDialog.svelte'
  import NobleTile from './NobleTile.svelte'
  import OpponentStrip from './OpponentStrip.svelte'
  import RulesLeaflet from './RulesLeaflet.svelte'
  import TokenReturnDialog from './TokenReturnDialog.svelte'
  import VictoryOverlay from './VictoryOverlay.svelte'

  interface Props {
    session: BaseSession
    onExit: () => void
    onRematch: () => void
  }

  let { session, onExit, onRematch }: Props = $props()

  let selection = $state<Gem[]>([])
  let sheet = $state<SheetTarget | null>(null)
  let muted = $state(isMuted())
  let rulesOpen = $state(false)

  // foley: play whatever the session just emitted
  let seenEvent = -1
  $effect(() => {
    const last = session.events.at(-1)
    if (last && last.id > seenEvent) {
      seenEvent = last.id
      play(last.sfx)
    }
  })

  function toggleMute() {
    muted = !muted
    setMuted(muted)
  }

  function updateSelection(next: Gem[]) {
    if (next.length > selection.length) play('select')
    selection = next
  }

  /** The seat shown as "mine" at the bottom: fixed online, the actor in hotseat. */
  const me = $derived<Seat>(session.mySeat ?? session.actor)
  const others = $derived.by(() => {
    const n = session.state.players.length
    return Array.from({ length: n - 1 }, (_, i) => (me + 1 + i) % n)
  })

  const myPending = $derived(session.myTurn ? session.state.pending : null)
  const passOnly = $derived.by(() => {
    const moves = session.myMoves()
    return moves.length === 1 && moves[0].type === 'pass' ? moves[0] : null
  })

  const online = $derived(session instanceof OnlineSession ? session : null)

  const turnLine = $derived.by(() => {
    if (session.state.result) return 'Game over'
    if (session.mode === 'hotseat') return `${session.names[session.actor]} to play`
    if (online?.spectator) return `Watching — ${session.names[session.actor]} to play`
    return session.myTurn ? 'Your turn' : `${session.names[session.actor]} is thinking…`
  })
</script>

<div class="screen">
  <header class="topbar">
    <button class="btn btn--quiet exit" onclick={onExit}>Leave</button>
    <button class="btn btn--quiet exit" onclick={toggleMute} aria-label={muted ? 'unmute' : 'mute'}>
      {muted ? 'Sound off' : 'Sound on'}
    </button>
    <button class="btn btn--quiet exit" onclick={() => (rulesOpen = true)}>Rules</button>
    <div class="turn">
      <span class="turnline">{turnLine}</span>
      {#if session.state.finalRound && !session.state.result}
        <span class="final label">Final round</span>
      {/if}
    </div>
    <div class="opponents">
      {#each others as seat (seat)}
        <OpponentStrip {session} {seat} />
      {/each}
    </div>
  </header>

  {#if online?.status === 'desync'}
    <div class="notice">Out of step with the table — resynchronizing…</div>
  {:else if online?.waitingOn}
    <div class="notice">Waiting for {online.waitingOn} to reconnect…</div>
  {/if}

  <main class="table">
    <section class="nobles" aria-label="nobles">
      {#each session.state.nobles as id (id)}
        <div
          class="noble"
          animate:flip={{ duration: dur(300) }}
          out:scale={{ duration: dur(320), start: 1.06 }}
        >
          <NobleTile noble={nobleById.get(id)!} />
        </div>
      {/each}
    </section>

    <section class="market-area">
      <MarketBoard {session} onOpen={(t) => (sheet = t)} />
    </section>

    <section class="bank-area">
      <BankRow {session} {selection} onSelection={updateSelection} />
      {#if passOnly}
        <button class="btn btn--gold" onclick={() => session.submit(passOnly)}>
          Pass — no move available
        </button>
      {/if}
    </section>

    <section class="me-area">
      <MyTableau {session} seat={me} onOpen={(t) => (sheet = t)} />
    </section>
  </main>
</div>

{#if rulesOpen}
  <RulesLeaflet onClose={() => (rulesOpen = false)} />
{/if}
{#if sheet}
  <CardSheet {session} target={sheet} onClose={() => (sheet = null)} />
{/if}
{#if myPending?.kind === 'returnTokens'}
  <TokenReturnDialog {session} />
{/if}
{#if myPending?.kind === 'chooseNoble'}
  <NobleChoiceDialog {session} />
{/if}
<VictoryOverlay {session} {onRematch} onExit={onExit} />

<style>
  .screen {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    gap: var(--sp-3);
    padding: var(--sp-3);
    max-width: 1100px;
    margin: 0 auto;
  }

  .topbar {
    display: flex;
    gap: var(--sp-3);
    align-items: center;
    flex-wrap: wrap;
  }

  .exit {
    padding: 8px 14px;
    min-height: 36px;
  }

  .turn {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-right: auto;
  }

  .turnline {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: var(--fs-md);
    letter-spacing: 0.03em;
  }

  .final {
    color: var(--gold-hi);
  }

  .notice {
    background: color-mix(in srgb, var(--gold) 14%, var(--lacquer));
    color: var(--gold-hi);
    border-radius: var(--r-chip);
    box-shadow: var(--hairline-dim);
    padding: var(--sp-2) var(--sp-4);
    text-align: center;
    letter-spacing: 0.04em;
  }

  .opponents {
    display: flex;
    gap: var(--sp-2);
    flex-wrap: wrap;
  }

  .table {
    display: grid;
    gap: var(--sp-4);
    grid-template-areas:
      'nobles nobles'
      'market bank'
      'me me';
    grid-template-columns: 1fr auto;
    align-items: start;
  }

  /* keep scrollable children from propagating min-content width to the tracks */
  .table > section {
    min-width: 0;
  }

  .nobles {
    grid-area: nobles;
    display: flex;
    gap: var(--sp-3);
    justify-content: center;
    flex-wrap: wrap;
  }

  .noble {
    width: clamp(96px, 12vw, 136px);
  }

  .market-area {
    grid-area: market;
  }

  .bank-area {
    grid-area: bank;
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
    align-items: center;
    position: sticky;
    top: var(--sp-3);
  }

  .me-area {
    grid-area: me;
  }

  /* desktop: vertical bank column to the right of the market */
  @media (min-width: 900px) {
    .bank-area :global(.chips) {
      flex-direction: column;
    }
  }

  /* phone: single column, bank sticks above own tableau */
  @media (max-width: 899px) {
    .table {
      grid-template-areas:
        'nobles'
        'market'
        'bank'
        'me';
      grid-template-columns: 1fr;
    }

    .nobles {
      justify-content: flex-start;
      overflow-x: auto;
      flex-wrap: nowrap;
      padding-bottom: var(--sp-1);
    }

    .noble {
      width: 104px;
      flex: none;
    }

    .bank-area {
      position: sticky;
      bottom: var(--sp-2);
      top: auto;
      z-index: 10;
      background: color-mix(in srgb, var(--lacquer) 88%, transparent);
      border-radius: var(--r-card);
      padding: var(--sp-2);
      box-shadow: var(--shadow);
      width: 100%;
    }
  }
</style>

<script lang="ts">
  import type { Seat } from '../engine'
  import { OnlineSession } from '../app/session.svelte'
  import type { BaseSession } from '../app/session.svelte'
  import { scores } from '../app/session.svelte'
  import { isMuted, play, setMuted } from './audio'
  import { NO_SELECTION, targetCells } from './interact'
  import type { Selection } from './interact'
  import CardSheet from './CardSheet.svelte'
  import CoinIcon from './CoinIcon.svelte'
  import KeyIcon from './KeyIcon.svelte'
  import MarketBoard from './MarketBoard.svelte'
  import MyGrid from './MyGrid.svelte'
  import OpponentStrip from './OpponentStrip.svelte'
  import RulesLeaflet from './RulesLeaflet.svelte'
  import VictoryOverlay from './VictoryOverlay.svelte'

  interface Props {
    session: BaseSession
    onExit: () => void
    onRematch: () => void
  }

  const { session, onExit, onRematch }: Props = $props()

  let sel = $state<Selection>(NO_SELECTION)
  let pendingChoice = $state<'a' | 'b' | undefined>(undefined)
  let pendingDiscard = $state<number | undefined>(undefined)
  let muted = $state(isMuted())
  let rulesOpen = $state(false)

  // foley: play whatever the session just emitted (seen-cursor pattern)
  let seenEvent = -1
  $effect(() => {
    const last = session.events.at(-1)
    if (last && last.id > seenEvent) {
      seenEvent = last.id
      play(last.sfx)
    }
  })

  // a selection must not survive losing the turn (remote move landed)
  $effect(() => {
    if (!session.myTurn && sel.kind !== 'none') clearSelection()
  })

  function toggleMute() {
    muted = !muted
    setMuted(muted)
  }

  function clearSelection() {
    sel = NO_SELECTION
    pendingChoice = undefined
    pendingDiscard = undefined
  }

  /** The seat shown as "mine" at the bottom: fixed online, the actor in hotseat. */
  const me = $derived<Seat>(session.mySeat ?? session.actor)
  const others = $derived.by(() => {
    const n = session.state.players.length
    return Array.from({ length: n - 1 }, (_, i) => (me + 1 + i) % n)
  })

  const online = $derived(session instanceof OnlineSession ? session : null)
  const myPlayer = $derived(session.state.players[me])
  const myScore = $derived(scores(session.state)[me])

  const moves = $derived(session.myMoves())
  const targets = $derived(targetCells(sel, moves))

  const turnLine = $derived.by(() => {
    if (session.state.result) return 'The chronicle is closed'
    if (session.mode === 'hotseat') return `${session.names[session.actor]} to play`
    if (online?.spectator) return `Watching — ${session.names[session.actor]} to play`
    return session.myTurn ? 'Your turn' : `${session.names[session.actor]} to play`
  })

  function openSheet(slot: number) {
    sel = { kind: 'sheet', slot }
  }

  function commitSheet(commit: {
    mode: 'buy' | 'takeFacedown'
    slot: number
    choice?: 'a' | 'b'
    discardSlot?: number
  }) {
    pendingChoice = commit.choice
    pendingDiscard = commit.discardSlot
    sel = { kind: 'placing', slot: commit.slot, mode: commit.mode }
  }

  /** Dispatch the move for the confirmed cell, honoring pending decisions. */
  function placeAt(x: number, y: number) {
    if (sel.kind !== 'placing') return
    const mode = sel.mode
    const slot = sel.slot
    const candidates = moves.filter(
      (m) => m.type === mode && m.slot === slot && m.x === x && m.y === y,
    )
    const move =
      candidates.find(
        (m) =>
          m.type !== 'buy' ||
          ((pendingChoice === undefined || m.choice === pendingChoice) &&
            (pendingDiscard === undefined || m.discardSlot === pendingDiscard)),
      ) ?? candidates[0]
    if (!move) return
    clearSelection()
    session.submit(move)
  }
</script>

<div class="screen">
  <header class="topbar">
    <button class="btn btn--quiet small" onclick={onExit}>Leave</button>
    <h1 class="turnline" class:rubric={session.myTurn && !session.state.result}>{turnLine}</h1>
    <div class="top-actions">
      <button class="btn btn--quiet small" onclick={toggleMute} aria-label={muted ? 'unmute' : 'mute'}>
        {muted ? 'Sound off' : 'Sound on'}
      </button>
      <button class="btn btn--quiet small" onclick={() => (rulesOpen = true)}>Rules</button>
    </div>
  </header>

  {#if online?.status === 'desync'}
    <div class="notice">Out of step with the table — resynchronizing&hellip;</div>
  {:else if online?.waitingOn}
    <div class="notice">Waiting on {online.waitingOn}&hellip; (disconnected)</div>
  {/if}

  <div class="opponents">
    {#each others as seat (seat)}
      <OpponentStrip {session} {seat} />
    {/each}
  </div>

  <main class="table">
    <section class="market-area panel">
      <h2 class="area-title label">The market</h2>
      <MarketBoard {session} onOpen={openSheet} />
    </section>

    <section class="me-area panel">
      <h2 class="area-title label">Your kingdom</h2>
      <MyGrid placed={myPlayer.placed} {targets} onPlace={placeAt} />
      {#if sel.kind === 'placing'}
        <div class="placing-bar">
          <span class="placing-hint">Choose a gold-washed cell.</span>
          <button class="btn btn--quiet small" onclick={clearSelection}>Put the card back</button>
        </div>
      {/if}
      <div class="tray">
        <span class="stat tabular"><CoinIcon size={20} value={myPlayer.gold} /><span class="stat-word label">gold</span></span>
        <span class="stat tabular"><KeyIcon size={20} /><span class="count">{myPlayer.keys}</span><span class="stat-word label">keys</span></span>
        <span class="stat score tabular"><span class="gilt count">{myScore}</span><span class="stat-word label">pts</span></span>
      </div>
    </section>
  </main>
</div>

{#if rulesOpen}
  <RulesLeaflet onClose={() => (rulesOpen = false)} />
{/if}
{#if sel.kind === 'sheet'}
  <CardSheet {session} slot={sel.slot} onClose={clearSelection} onCommit={commitSheet} />
{/if}
<VictoryOverlay {session} {onRematch} {onExit} />

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
    gap: var(--sp-2);
    align-items: center;
  }

  .small {
    padding: 8px 12px;
    min-height: 36px;
    font-size: var(--fs-xs);
  }

  .turnline {
    /* the big turn banner: blackletter, well above the 18px floor */
    font-size: var(--fs-lg);
    font-weight: 500;
    letter-spacing: 0.01em;
    flex: 1;
    text-align: center;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .top-actions {
    display: flex;
    gap: var(--sp-1);
  }

  .notice {
    background: color-mix(in srgb, var(--rubric) 12%, var(--panel));
    color: var(--rubric);
    border: 1px solid var(--rubric);
    border-radius: var(--radius);
    padding: var(--sp-2) var(--sp-4);
    text-align: center;
    font-style: italic;
  }

  .opponents {
    display: flex;
    gap: var(--sp-2);
    flex-wrap: wrap;
    justify-content: center;
  }

  .table {
    display: grid;
    gap: var(--sp-4);
    grid-template-columns: 1fr;
    align-items: start;
  }

  .table > section {
    min-width: 0;
    padding: var(--sp-3);
    display: flex;
    flex-direction: column;
    gap: var(--sp-3);
  }

  .area-title {
    margin: 0;
    font-family: var(--font-ui);
  }

  .placing-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-2);
  }

  .placing-hint {
    font-style: italic;
    color: var(--ink-soft);
    font-size: var(--fs-xs);
  }

  .tray {
    display: flex;
    gap: var(--sp-4);
    align-items: center;
    border-top: 1px solid var(--line);
    padding-top: var(--sp-2);
  }

  .stat {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: var(--fs-md);
  }

  .count {
    font-size: var(--fs-md);
  }

  .score {
    margin-left: auto;
  }

  .stat-word {
    font-size: 0.62rem;
  }

  /* desktop: market left, kingdom right */
  @media (min-width: 940px) {
    .table {
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    }
  }
</style>

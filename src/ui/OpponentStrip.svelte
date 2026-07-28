<script lang="ts">
  import { cardById } from '../data'
  import type { Seat } from '../engine'
  import type { BaseSession } from '../app/session.svelte'
  import { scores } from '../app/session.svelte'
  import { wobblyPolygon } from './wobble'
  import CoinIcon from './CoinIcon.svelte'
  import KeyIcon from './KeyIcon.svelte'
  import Modal from './Modal.svelte'
  import MyGrid from './MyGrid.svelte'
  import ShieldIcon from './ShieldIcon.svelte'

  interface Props {
    session: BaseSession
    seat: Seat
  }

  const { session, seat }: Props = $props()

  const player = $derived(session.state.players[seat])
  const acting = $derived(session.state.turn === seat && !session.state.result)
  const score = $derived(scores(session.state)[seat])

  /** Placements shifted to a 0..2 window for the thumbnail. */
  const miniCells = $derived.by(() => {
    if (player.placed.length === 0) return []
    const minX = Math.min(...player.placed.map((p) => p.x))
    const minY = Math.min(...player.placed.map((p) => p.y))
    return player.placed.map((p) => ({ ...p, x: p.x - minX, y: p.y - minY }))
  })

  let open = $state(false)

  const thumbOutline = (i: number) =>
    wobblyPolygon(
      [
        { x: 1.5, y: 1.5 },
        { x: 26.5, y: 1.5 },
        { x: 26.5, y: 26.5 },
        { x: 1.5, y: 26.5 },
      ],
      1,
      i * 17 + seat * 5 + 900,
    )
</script>

<button class="strip panel" class:acting onclick={() => (open = true)} aria-label="inspect {session.names[seat]}'s kingdom">
  <span class="who">
    <span class="name">{session.names[seat]}</span>
    {#if acting}<span class="turn-mark rubric">their turn</span>{/if}
  </span>

  <span class="purse-line">
    <span class="stat tabular"><CoinIcon size={15} />{player.gold}</span>
    <span class="stat tabular"><KeyIcon size={15} />{player.keys}</span>
    <span class="stat score gilt tabular">{score}</span>
  </span>

  <span class="thumb" aria-hidden="true">
    {#each Array.from({ length: 9 }, (_, i) => i) as i (i)}
      {@const x = i % 3}
      {@const y = Math.floor(i / 3)}
      {@const p = miniCells.find((c) => c.x === x && c.y === y)}
      <span class="thumb-cell" class:facedown={p?.faceDown}
        class:castle={p && !p.faceDown && cardById.get(p.card)!.deck === 'castle'}
        class:village={p && !p.faceDown && cardById.get(p.card)!.deck === 'village'}
      >
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <path d={thumbOutline(i)} class="thumb-line" />
          {#if p?.faceDown}
            <path d="M4 24 Q14.4 13.6 24 4 M4 14 Q8.8 9.3 14 4 M14 24 Q19.2 18.7 24 14" class="hatch" />
          {/if}
        </svg>
        {#if p && !p.faceDown}
          <span class="thumb-shields">
            {#each cardById.get(p.card)!.shields as s, j (j)}
              <ShieldIcon type={s} size={10} />
            {/each}
          </span>
        {/if}
      </span>
    {/each}
  </span>
</button>

{#if open}
  <Modal onClose={() => (open = false)}>
    <div class="inspect">
      <h3 class="inspect-title">{session.names[seat]}&rsquo;s kingdom</h3>
      <p class="inspect-stats tabular">
        <CoinIcon size={17} />{player.gold} &nbsp; <KeyIcon size={17} />{player.keys} &nbsp;
        <span class="gilt">{score} pts so far</span>
      </p>
      {#if player.placed.length > 0}
        <MyGrid placed={player.placed} compact />
      {:else}
        <p class="empty-prose">An empty page — their first card is yet to be entered.</p>
      {/if}
      <button class="btn btn--quiet" onclick={() => (open = false)}>Close</button>
    </div>
  </Modal>
{/if}

<style>
  .strip {
    display: flex;
    flex-direction: column;
    gap: var(--sp-1);
    align-items: stretch;
    border: 1px solid var(--line);
    padding: var(--sp-2);
    cursor: pointer;
    text-align: left;
    min-width: 118px;
  }

  .strip.acting {
    border-color: var(--rubric);
    box-shadow:
      inset 0 0 0 1px var(--rubric),
      var(--shadow);
  }

  .who {
    display: flex;
    align-items: baseline;
    gap: var(--sp-2);
    justify-content: space-between;
  }

  .name {
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: var(--fs-xs);
    letter-spacing: 0.04em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .turn-mark {
    font-family: var(--font-ui);
    font-size: 0.62rem;
    letter-spacing: 0.05em;
    flex: none;
  }

  .purse-line {
    display: flex;
    gap: var(--sp-2);
    align-items: center;
  }

  .stat {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: var(--fs-xs);
  }

  .score {
    margin-left: auto;
    font-size: var(--fs-sm);
  }

  .thumb {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    width: 90px;
    align-self: center;
  }

  .thumb-cell {
    position: relative;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    background: var(--parchment-deep);
    border-radius: 2px;
  }

  .thumb-cell.castle {
    background: color-mix(in srgb, var(--castle) 30%, var(--panel));
  }

  .thumb-cell.village {
    background: color-mix(in srgb, var(--village) 30%, var(--panel));
  }

  .thumb-cell.facedown {
    background: var(--parchment-deep);
  }

  .thumb-cell svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .thumb-line {
    fill: none;
    stroke: var(--line);
    stroke-width: 1;
  }

  .hatch {
    fill: none;
    stroke: var(--ink-soft);
    stroke-width: 1;
  }

  .thumb-shields {
    position: relative;
    display: flex;
    gap: 1px;
  }

  .inspect {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
    min-width: min(84vw, 300px);
  }

  .inspect-title {
    font-size: var(--fs-lg);
  }

  .inspect-stats {
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    font-family: var(--font-ui);
    font-weight: 700;
  }

  .empty-prose {
    margin: 0;
    font-style: italic;
    color: var(--ink-soft);
  }
</style>

<script lang="ts">
  import type { Seat } from '../engine'
  import { discounts, GEMS, prestige, TOKEN_COLORS } from '../engine'
  import type { BaseSession } from '../app/session.svelte'
  import GemIcon from './GemIcon.svelte'

  interface Props {
    session: BaseSession
    seat: Seat
  }

  let { session, seat }: Props = $props()

  const player = $derived(session.visibleState.players[seat])
  const disc = $derived(discounts(session.state.players[seat]))
  const active = $derived(session.actor === seat && !session.state.result)
</script>

<div class="strip" class:active>
  <div class="who">
    <span class="name">{session.names[seat]}</span>
    <span class="score foil-text tabular">{prestige(session.state.players[seat])}</span>
  </div>
  <div class="row" aria-label="tokens">
    {#each TOKEN_COLORS as c (c)}
      {#if player.tokens[c] > 0}
        <span class="mini">
          <GemIcon kind={c} size={14} />
          <span class="tabular">{player.tokens[c]}</span>
        </span>
      {/if}
    {/each}
  </div>
  <div class="row" aria-label="card discounts">
    {#each GEMS as g (g)}
      {#if disc[g] > 0}
        <span class="mini card-pip">
          <GemIcon kind={g} size={14} />
          <span class="tabular">{disc[g]}</span>
        </span>
      {/if}
    {/each}
    {#if player.reserved.length > 0}
      <span class="mini reserved" title="reserved cards">
        {#each player.reserved as r, i (i)}
          <span class="mini-back"></span>
        {/each}
      </span>
    {/if}
    {#if player.nobles.length > 0}
      <span class="mini noble tabular" title="nobles">♛ {player.nobles.length}</span>
    {/if}
  </div>
</div>

<style>
  .strip {
    background: var(--felt);
    border-radius: var(--r-card);
    box-shadow: var(--hairline-dim), var(--shadow);
    padding: var(--sp-2) var(--sp-3);
    display: flex;
    flex-direction: column;
    gap: var(--sp-1);
    min-width: 150px;
  }

  .strip.active {
    box-shadow: var(--hairline), var(--shadow);
    background: var(--felt-hi);
  }

  .who {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--sp-2);
  }

  .name {
    font-weight: 600;
    letter-spacing: 0.04em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .score {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--fs-lg);
    line-height: 1;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-1);
    align-items: center;
    min-height: 18px;
  }

  .mini {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: var(--fs-xs);
  }

  .card-pip {
    background: color-mix(in srgb, var(--ivory) 12%, transparent);
    border-radius: var(--r-chip);
    padding: 1px 4px;
  }

  .mini-back {
    display: inline-block;
    width: 11px;
    height: 15px;
    border-radius: 2px;
    background: var(--lacquer);
    box-shadow: inset 0 0 0 1px var(--gold-lo);
    margin-left: 2px;
  }

  .noble {
    color: var(--gold-hi);
  }
</style>

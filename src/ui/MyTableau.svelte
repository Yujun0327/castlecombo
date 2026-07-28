<script lang="ts">
  import { nobleById } from '../data'
  import type { Seat } from '../engine'
  import { discounts, GEMS, HIDDEN_CARD, prestige, TOKEN_COLORS } from '../engine'
  import { cardById } from '../data'
  import type { BaseSession } from '../app/session.svelte'
  import type { SheetTarget } from './interact'
  import CardBack from './CardBack.svelte'
  import CardFace from './CardFace.svelte'
  import GemIcon from './GemIcon.svelte'
  import NobleTile from './NobleTile.svelte'
  import TokenChip from './TokenChip.svelte'

  interface Props {
    session: BaseSession
    seat: Seat
    onOpen: (target: SheetTarget) => void
  }

  let { session, seat, onOpen }: Props = $props()

  const player = $derived(session.visibleState.players[seat])
  const disc = $derived(discounts(session.state.players[seat]))
  const mine = $derived(session.mySeat === null || session.mySeat === seat)
</script>

<div class="tableau">
  <div class="head">
    <span class="name">{session.names[seat]}</span>
    <span class="label">Prestige</span>
    <span class="score foil-text tabular">{prestige(session.state.players[seat])}</span>
  </div>

  <div class="tokens">
    {#each TOKEN_COLORS as c (c)}
      <TokenChip kind={c} count={player.tokens[c]} size={38} />
    {/each}
  </div>

  <div class="discounts" aria-label="card discounts">
    {#each GEMS as g (g)}
      <span class="disc" class:none={disc[g] === 0}>
        <GemIcon kind={g} size={18} />
        <span class="tabular">{disc[g]}</span>
      </span>
    {/each}
  </div>

  {#if player.reserved.length > 0}
    <div class="reserved">
      <span class="label">Reserved</span>
      <div class="cards">
        {#each player.reserved as r, i (i)}
          {#if r.card === HIDDEN_CARD}
            <div class="mini"><CardBack tier={1} /></div>
          {:else if mine}
            <button class="mini" onclick={() => onOpen({ kind: 'reserved', card: r.card })}>
              <CardFace card={cardById.get(r.card)!} />
            </button>
          {:else}
            <div class="mini"><CardFace card={cardById.get(r.card)!} /></div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

  {#if player.nobles.length > 0}
    <div class="nobles">
      {#each player.nobles as id (id)}
        <div class="mini-noble"><NobleTile noble={nobleById.get(id)!} /></div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tableau {
    background: var(--felt);
    border-radius: var(--r-card);
    box-shadow: var(--hairline-dim), var(--shadow);
    padding: var(--sp-3) var(--sp-4);
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-4);
    align-items: center;
  }

  .head {
    display: flex;
    align-items: baseline;
    gap: var(--sp-2);
  }

  .name {
    font-weight: 600;
    letter-spacing: 0.04em;
    font-size: var(--fs-md);
  }

  .score {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--fs-xl);
    line-height: 1;
  }

  .tokens {
    display: flex;
    gap: var(--sp-2);
    flex-wrap: wrap;
  }

  .discounts {
    display: flex;
    gap: var(--sp-2);
  }

  .disc {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: color-mix(in srgb, var(--ivory) 12%, transparent);
    border-radius: var(--r-chip);
    padding: 3px 7px;
  }

  .disc.none {
    opacity: 0.35;
  }

  .reserved {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
  }

  .cards {
    display: flex;
    gap: var(--sp-2);
  }

  .mini {
    width: 56px;
    background: none;
    border: none;
    padding: 0;
    border-radius: var(--r-card);
    transition: transform 120ms ease;
  }

  button.mini:hover {
    transform: translateY(-3px);
  }

  .nobles {
    display: flex;
    gap: var(--sp-2);
  }

  .mini-noble {
    width: 72px;
  }
</style>

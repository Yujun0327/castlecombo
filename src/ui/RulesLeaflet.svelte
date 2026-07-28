<script lang="ts">
  import { GEMS } from '../engine'
  import GemIcon from './GemIcon.svelte'
  import Modal from './Modal.svelte'

  interface Props {
    onClose: () => void
  }

  let { onClose }: Props = $props()
</script>

<Modal {onClose}>
  <article class="leaflet">
    <header>
      <h2 class="foil-text">How to play</h2>
      <p class="hint">You are Renaissance merchants racing to build the most prestigious jewel house.</p>
    </header>

    <section>
      <h3 class="label">The goal</h3>
      <p><strong>15 prestige points</strong> triggers the final round. Points come from purchased cards and visiting nobles.</p>
    </section>

    <section>
      <h3 class="label">Your turn — exactly one action</h3>
      <ol>
        <li>
          <strong>Take 3 gems</strong> of different colors from the bank
          <span class="gems">{#each GEMS.slice(0, 3) as g (g)}<GemIcon kind={g} size={14} />{/each}</span>
          — or <strong>take 2 of one color</strong>, allowed only if that stack has 4 or more.
          If fewer colors remain, take as many different ones as you can.
        </li>
        <li>
          <strong>Reserve a card</strong> — any face-up card, or the top of a deck sight-unseen.
          You also take 1 gold <GemIcon kind="gold" size={14} /> if any is left. Reserved cards are
          yours alone to buy later; you may hold at most <strong>3</strong>.
        </li>
        <li>
          <strong>Purchase a card</strong> — from the market or your own reserve. Pay its gem cost;
          <strong>gold stands in for any color</strong>. Your purchased cards give permanent
          discounts: each card's gem reduces matching costs by 1 forever.
        </li>
      </ol>
    </section>

    <section>
      <h3 class="label">The limit</h3>
      <p>You may hold at most <strong>10 tokens</strong> at the end of your turn — return any excess (gold included, your choice which).</p>
    </section>

    <section>
      <h3 class="label">Nobles</h3>
      <p>
        Nobles visit <em>automatically</em> at the end of your turn once your card discounts meet
        their requirement — they cost nothing and are worth <strong>3 prestige</strong>. One visit
        per turn at most; if several qualify at once, you choose.
      </p>
    </section>

    <section>
      <h3 class="label">Game end</h3>
      <p>
        When anyone ends their turn with 15+ prestige, the round is finished so everyone has played
        an equal number of turns. Highest prestige wins; ties go to whoever bought
        <strong>fewer</strong> cards. Still tied — the victory is shared.
      </p>
    </section>

    <p class="hint fine">
      Setup scales automatically: gem stacks of 4 / 5 / 7 for 2 / 3 / 4 players, 5 gold, and one
      more noble than there are players.
    </p>

    <button class="btn btn--gold" onclick={onClose}>To the table</button>
  </article>
</Modal>

<style>
  .leaflet {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
    max-width: 520px;
  }

  h2 {
    font-size: var(--fs-xl);
    letter-spacing: 0.05em;
  }

  h3 {
    margin-bottom: var(--sp-1);
  }

  p,
  li {
    margin: 0;
    font-size: var(--fs-sm);
    line-height: 1.55;
  }

  ol {
    margin: 0;
    padding-left: 1.2em;
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
  }

  li::marker {
    color: var(--gold);
    font-family: var(--font-engraved);
  }

  strong {
    color: var(--gold-hi);
    font-weight: 600;
  }

  .gems {
    display: inline-flex;
    gap: 2px;
    vertical-align: -2px;
  }

  .leaflet :global(.gem) {
    display: inline-block;
    vertical-align: -2px;
  }

  .hint {
    color: color-mix(in srgb, var(--ivory) 70%, transparent);
  }

  .fine {
    font-size: var(--fs-xs);
    border-top: 1px solid color-mix(in srgb, var(--gold) 30%, transparent);
    padding-top: var(--sp-3);
  }

  .btn {
    align-self: flex-end;
  }
</style>

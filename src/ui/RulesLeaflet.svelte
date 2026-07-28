<script lang="ts">
  import Modal from './Modal.svelte'

  interface Props {
    onClose: () => void
  }

  const { onClose }: Props = $props()
</script>

<Modal {onClose}>
  <article class="leaflet">
    <h2>How the kingdom is built</h2>

    <section>
      <h3>The turn</h3>
      <p class="dropcap">
        Each turn you take exactly one card from the row the messenger stands beside. Before
        taking, you may spend one key to either move the messenger to the other row, or discard
        the whole row and reveal three fresh cards. Then buy a card and place it in your kingdom,
        or take it face-down instead.
      </p>
    </section>

    <section>
      <h3>Keys</h3>
      <p class="dropcap">
        Keys are spent to move the messenger or redraw a row — at most one key per turn. Every
        key still in hand at the end of the chronicle is worth one point.
      </p>
    </section>

    <section>
      <h3>Taking face-down</h3>
      <p class="dropcap">
        Instead of paying for a card, lay it face-down in your kingdom and take 6 gold and 2 keys
        from the supply. A face-down card fills its cell but has no shields, no effect, and scores
        nothing. If the card bears a messenger icon, the messenger still moves.
      </p>
    </section>

    <section>
      <h3>Banners</h3>
      <p class="dropcap">
        A &minus;1 banner discounts every later purchase of its scope — all cards, or only castle,
        or only village — by one gold, down to a floor of zero. Banners stack; a banner never
        discounts its own purchase.
      </p>
    </section>

    <section>
      <h3>Purses</h3>
      <p class="dropcap">
        Some cards carry a drawstring purse. Effects may lock gold onto them during play; that
        gold cannot be spent. When the game ends, your loose gold climbs onto your purses with
        room, best purse first, and scores as the purse's scroll says.
      </p>
    </section>

    <section>
      <h3>The kingdom</h3>
      <p class="dropcap">
        Your kingdom must always fit inside three cards by three. After the first card, every card
        must touch one already placed, side to side. Nine turns each — a finished kingdom is the
        full square.
      </p>
    </section>

    <section>
      <h3>Scoring &amp; ties</h3>
      <p class="dropcap">
        Every face-up card scores its scroll: rows and columns count on the finished square. Add
        one point per leftover key. The highest total prevails; ties fall to whoever kept the most
        gold that found no purse, and then the triumph is shared.
      </p>
    </section>

    <button class="btn btn--gold" onclick={onClose}>Back to the table</button>
  </article>
</Modal>

<style>
  .leaflet {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
    max-width: 60ch;
  }

  h2 {
    font-size: var(--fs-xl);
  }

  h3 {
    font-size: var(--fs-md);
    margin-bottom: var(--sp-1);
  }

  p {
    margin: 0;
    font-size: var(--fs-sm);
    line-height: 1.55;
  }

  /* rubricated drop caps open each section */
  .dropcap::first-letter {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 2.6em;
    line-height: 0.8;
    color: var(--rubric);
    float: left;
    padding: 0.06em 0.12em 0 0;
  }

  .btn {
    align-self: flex-end;
  }
</style>

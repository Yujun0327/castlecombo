<script lang="ts">
  import type { CardDef } from '../engine'
  import { effectIcon, effectText, scrollLines } from './cardtext'
  import { wobblyLine, wobblyPolygon } from './wobble'
  import CoinIcon from './CoinIcon.svelte'
  import KeyIcon from './KeyIcon.svelte'
  import MessengerPawn from './MessengerPawn.svelte'
  import ShieldIcon from './ShieldIcon.svelte'

  interface Props {
    def: CardDef
    /** Cost after banners; shown on the coin with the printed cost struck. */
    effectiveCost?: number
    /** Gold stored on this card's purse, shown in the purse mouth when > 0. */
    purseGold?: number
    /** Rendering width in px; the whole entry scales from a 160×224 base. */
    width?: number
    /** Marginal (kingdom-cell) entry: art marks only, no prose. */
    mini?: boolean
  }

  const { def, effectiveCost, purseGold = 0, width = 160, mini = false }: Props = $props()

  // base design is 160×224; everything inside scales in em
  const W = 160
  const H = 224

  const frame = $derived(
    wobblyPolygon(
      [
        { x: 5, y: 5 },
        { x: W - 5, y: 5 },
        { x: W - 5, y: H - 5 },
        { x: 5, y: H - 5 },
      ],
      1.8,
      def.id * 3 + 1,
    ),
  )
  const baseline = $derived(wobblyLine(38, 41, W - 10, 41, 1.1, 3))

  const discounted = $derived(effectiveCost !== undefined && effectiveCost < def.cost)
  const shownCost = $derived(discounted ? effectiveCost : def.cost)

  // the blackletter face never drops below 18px (art-bible: Type) —
  // smaller entries fall back to the body face
  const gothic = $derived(!mini && width >= 156)

  const effects = $derived(def.onBuy ?? [])
  const scroll = $derived(scrollLines(def.scroll ?? []))
</script>

<article
  class="entry deck--{def.deck}"
  class:mini
  class:has-purse={def.purse}
  style="width:{width}px; font-size:{((width / W) * 16).toFixed(2)}px"
  aria-label="{def.name}, {def.deck} card, cost {def.cost}"
>
  <svg class="frame" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">
    <path d={frame} class="frame-rule" />
    {#if !mini}
      <path d={baseline} class="rule-line" />
    {/if}
  </svg>

  <div class="cost">
    <CoinIcon size={mini ? 20 : 28} value={shownCost} />
    {#if discounted}
      <s class="was tabular">{def.cost}</s>
    {/if}
  </div>

  {#if def.banner}
    <div class="banner banner--{def.banner}">
      <span class="minus tabular">&minus;1</span>
      <span class="scope">{def.banner}</span>
    </div>
  {/if}

  <h4 class="name" class:gothic>{def.name}</h4>

  <div class="mid">
    <div class="rail">
      {#each def.shields as s, i (i)}
        <ShieldIcon type={s} size={mini ? 15 : 20} />
      {/each}
    </div>

    {#if !mini}
      <div class="body">
        {#each effects as fx, i (i)}
          <p class="fx">
            <span class="fx-icon">
              {#if effectIcon(fx) === 'key'}<KeyIcon size={13} />{:else}<CoinIcon size={13} />{/if}
            </span>{effectText(fx)}
          </p>
        {/each}
      </div>
    {/if}
  </div>

  {#if def.purse}
    <div class="purse">
      <svg viewBox="0 0 24 24" class="purse-glyph" aria-label="purse" role="img">
        <path
          d="M12 8.2 C6.6 9.2 4.8 13.8 6.2 17.6 C8 20.8 16 20.8 17.8 17.6 C19.2 13.8 17.4 9.2 12 8.2 Z"
          class="pouch"
        />
        <path d="M8.6 8.6 Q12 6.2 15.4 8.6 M11 6.6 L10 4.4 M13 6.6 L14 4.4" class="string" />
        {#if purseGold > 0}
          <text x="12" y="16.2" class="purse-count tabular">{purseGold}</text>
        {/if}
      </svg>
    </div>
  {/if}

  {#if def.messenger}
    <div class="messenger"><MessengerPawn size={mini ? 12 : 17} /></div>
  {/if}

  {#if def.scroll && def.scroll.length > 0}
    <div class="scrollband">
      <svg class="band-art" viewBox="0 0 150 40" preserveAspectRatio="none" aria-hidden="true">
        <path
          d={wobblyPolygon(
            [
              { x: 7, y: 3 },
              { x: 143, y: 3 },
              { x: 143, y: 37 },
              { x: 7, y: 37 },
            ],
            1.4,
            def.id * 5 + 2,
          )}
          class="band"
        />
        <path d="M7 3 Q3 8 7 13 M143 3 Q147 8 143 13" class="curl" />
      </svg>
      {#if !mini}
        <div class="scroll-text">
          {#each scroll as line, i (i)}
            <p>{line}</p>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</article>

<style>
  .entry {
    position: relative;
    aspect-ratio: 160 / 224;
    background: var(--panel);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    color: var(--ink);
    display: flex;
    flex-direction: column;
    padding: 0.55em 0.55em 0.5em;
    overflow: hidden;
  }

  .entry::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-image: var(--grain);
    opacity: 0.05;
    pointer-events: none;
  }

  .frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .frame-rule {
    fill: none;
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .deck--castle .frame-rule {
    stroke: var(--castle);
  }

  .deck--village .frame-rule {
    stroke: var(--village);
  }

  .rule-line {
    fill: none;
    stroke: var(--line);
    stroke-width: 1;
  }

  .cost {
    position: absolute;
    top: 0.45em;
    left: 0.45em;
    display: flex;
    align-items: flex-end;
    gap: 0.15em;
    z-index: 1;
  }

  .was {
    font-family: var(--font-ui);
    font-size: 0.62em;
    color: var(--rubric);
  }

  .banner {
    position: absolute;
    top: 0;
    right: 0.7em;
    width: 1.6em;
    padding: 0.3em 0 0.45em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.05em;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 0.32em), 0 100%);
    border: 1px solid var(--ink);
    border-top: none;
    z-index: 2;
  }

  .banner--all {
    background: var(--gold-leaf);
  }

  .banner--castle {
    background: var(--castle-hi);
  }

  .banner--village {
    background: var(--village-hi);
  }

  .minus {
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 0.68em;
    line-height: 1;
  }

  .scope {
    font-family: var(--font-ui);
    font-size: 0.42em;
    letter-spacing: 0.03em;
    line-height: 1;
  }

  .name {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 1em;
    line-height: 1.05;
    margin: 0.4em 0 0 2.1em;
    padding-right: 1.5em;
    min-height: 1.6em;
    display: flex;
    align-items: flex-end;
  }

  .name.gothic {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.15em; /* 18.4px at full size — above the blackletter floor */
    margin-left: 1.85em;
  }

  .mid {
    display: flex;
    gap: 0.3em;
    flex: 1;
    margin-top: 0.5em;
    min-height: 0;
  }

  .rail {
    display: flex;
    flex-direction: column;
    gap: 0.2em;
    flex: none;
    padding-top: 0.1em;
  }

  .body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25em;
  }

  /* keep effect prose clear of the purse glyph in the corner */
  .has-purse .body {
    padding-right: 1.6em;
  }

  .fx {
    margin: 0;
    font-size: 0.6em;
    line-height: 1.25;
  }

  .fx-icon {
    display: inline-block;
    vertical-align: -0.15em;
    margin-right: 0.25em;
  }

  .purse {
    position: absolute;
    right: 0.5em;
    bottom: 3.1em;
    width: 1.7em;
    z-index: 1;
  }

  .mini .purse {
    bottom: 1.2em;
    width: 1.9em;
  }

  .purse-glyph {
    display: block;
    width: 100%;
  }

  .pouch {
    fill: var(--parchment-deep);
    stroke: var(--ink);
    stroke-width: 1.4;
  }

  .string {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.2;
    stroke-linecap: round;
  }

  .purse-count {
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 9px;
    fill: var(--ink);
    text-anchor: middle;
  }

  .messenger {
    position: absolute;
    left: 0.5em;
    bottom: 0.35em;
    z-index: 2;
  }

  .scrollband {
    position: relative;
    flex: none;
    min-height: 2.7em;
    margin: 0.3em 0.05em 0;
    padding: 0.35em 0.75em 0.3em;
    display: flex;
    align-items: center;
  }

  .mini .scrollband {
    min-height: 0.9em;
    padding: 0;
    margin-left: 1.4em;
  }

  .band-art {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .band {
    fill: var(--parchment-deep);
    stroke: var(--ink-soft);
    stroke-width: 1.2;
  }

  .curl {
    fill: none;
    stroke: var(--ink-soft);
    stroke-width: 1;
  }

  .scroll-text {
    position: relative;
    width: 100%;
  }

  .scroll-text p {
    margin: 0;
    font-size: 0.56em;
    line-height: 1.2;
    font-style: italic;
    text-align: center;
  }

  /* marginal (mini) entries */
  .mini {
    padding: 0.4em 0.4em 0.35em;
  }

  .mini .name {
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 0.85em;
    letter-spacing: 0.02em;
    margin: 0.3em 0 0 2.2em;
    padding-right: 0.2em;
    min-height: 0;
    align-items: flex-start;
  }
</style>

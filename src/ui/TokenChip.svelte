<script lang="ts">
  import type { TokenColor } from '../engine'
  import GemIcon from './GemIcon.svelte'

  interface Props {
    kind: TokenColor
    count?: number | null
    selected?: boolean
    disabled?: boolean
    size?: number
    onclick?: () => void
    label?: string
  }

  let { kind, count = null, selected = false, disabled = false, size = 48, onclick, label }: Props = $props()

  const interactive = $derived(onclick !== undefined)
</script>

<svelte:element
  this={interactive ? 'button' : 'div'}
  class="chip chip--{kind}"
  class:selected
  class:dimmed={disabled}
  style:width="{size}px"
  style:height="{size}px"
  disabled={interactive ? disabled : undefined}
  onclick={interactive ? onclick : undefined}
  aria-label={label ?? `${kind}${count === null ? '' : `, ${count}`}`}
  role={interactive ? undefined : 'img'}
>
  <GemIcon {kind} size={size * 0.52} />
  {#if count !== null}
    <span class="count tabular" style:font-size="{size * 0.3}px">{count}</span>
  {/if}
</svelte:element>

<style>
  .chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: none;
    background: color-mix(in srgb, var(--lacquer) 82%, var(--ivory));
    box-shadow: var(--hairline-dim), var(--shadow);
    padding: 0;
    flex: none;
    transition: transform 120ms ease, box-shadow 120ms ease;
  }

  button.chip {
    cursor: pointer;
  }

  button.chip:disabled {
    cursor: default;
  }

  .chip.selected {
    transform: translateY(-4px);
    box-shadow: var(--hairline), 0 6px 12px rgb(0 0 0 / 0.5);
  }

  .chip.dimmed {
    opacity: 0.4;
  }

  .count {
    position: absolute;
    right: -6%;
    bottom: -6%;
    min-width: 38%;
    height: 38%;
    display: grid;
    place-content: center;
    border-radius: 50%;
    background: var(--ivory);
    color: var(--ink);
    font-family: var(--font-engraved);
    line-height: 1;
    box-shadow: var(--hairline-dim);
  }
</style>

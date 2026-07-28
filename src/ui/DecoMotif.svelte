<script lang="ts">
  import type { Gem, Tier } from '../engine'

  interface Props {
    gem: Gem
    tier: Tier
  }

  let { gem, tier }: Props = $props()

  // Higher tiers get denser ornament — the only "value" cue besides the back.
  const density = $derived(tier + 2)

  /** Sunburst rays fanning up from the bottom center (diamond). */
  const rays = $derived.by(() => {
    const n = 5 + density * 2
    const out: string[] = []
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.08 + (0.84 * i) / (n - 1))
      out.push(`M50,88 L${50 + 80 * Math.cos(a)},${88 - 80 * Math.sin(a)}`)
    }
    return out
  })

  /** Chevron waterfall (sapphire). */
  const chevrons = $derived.by(() => {
    const n = density + 2
    const out: string[] = []
    for (let i = 0; i < n; i++) {
      const y = 8 + (i * 64) / (n - 1)
      out.push(`M12,${y} L50,${y + 16} L88,${y}`)
    }
    return out
  })

  /** Fan palmette (emerald). */
  const petals = $derived.by(() => {
    const n = 4 + density
    const out: string[] = []
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.12 + (0.76 * i) / (n - 1))
      out.push(`M50,84 L${50 + 62 * Math.cos(a)},${84 - 62 * Math.sin(a)}`)
    }
    return out
  })

  /** Stepped ziggurat (ruby). */
  const steps = $derived.by(() => {
    const n = density + 1
    const out: { x: number; y: number; w: number; h: number }[] = []
    const stepH = 72 / n
    for (let i = 0; i < n; i++) {
      const w = 78 - (i * 58) / n
      out.push({ x: 50 - w / 2, y: 86 - (i + 1) * stepH, w, h: stepH })
    }
    return out
  })

  /** Nested keyline arches (onyx). */
  const arches = $derived.by(() => {
    const n = density
    const out: string[] = []
    for (let i = 0; i < n; i++) {
      const inset = i * (30 / n)
      const r = 36 - inset
      out.push(`M${14 + inset},88 L${14 + inset},48 A${r},${r} 0 0 1 ${86 - inset},48 L${86 - inset},88`)
    }
    return out
  })
</script>

<svg viewBox="0 0 100 90" preserveAspectRatio="xMidYMax meet" aria-hidden="true" class="motif motif--{gem}">
  {#if gem === 'diamond'}
    {#each rays as d (d)}<path class="line" {d} />{/each}
    <circle class="line" cx="50" cy="88" r="16" />
    <circle class="line faint" cx="50" cy="88" r="28" />
    <path class="accent" d="M50,82 L53,88 L50,94 L47,88 Z" />
  {:else if gem === 'sapphire'}
    {#each chevrons as d (d)}<path class="line" {d} />{/each}
    <path class="accent" d="M50,78 L53,84 L50,90 L47,84 Z" />
  {:else if gem === 'emerald'}
    {#each petals as d (d)}<path class="line" {d} />{/each}
    <path class="line" d="M-4,64 A54,54 0 0 1 104,64" />
    <circle class="line faint" cx="50" cy="84" r="10" />
    <path class="accent" d="M50,78 L53,84 L50,90 L47,84 Z" />
  {:else if gem === 'ruby'}
    {#each steps as s (s.y)}<rect class="line" x={s.x} y={s.y} width={s.w} height={s.h} />{/each}
    <path class="accent" d="M50,2 L53,8 L50,14 L47,8 Z" />
  {:else}
    {#each arches as d (d)}<path class="line" {d} />{/each}
    <path class="accent" d="M50,58 L53,64 L50,70 L47,64 Z" />
  {/if}
</svg>

<style>
  .motif {
    display: block;
    width: 100%;
    height: 100%;
  }

  .line {
    fill: none;
    stroke-width: 1.5;
    stroke-linejoin: round;
    opacity: 0.5;
  }

  .line.faint {
    opacity: 0.28;
  }

  .accent {
    fill: var(--gold);
    stroke: none;
  }

  .motif--diamond .line {
    stroke: var(--diamond-lo);
    opacity: 0.75;
  }
  .motif--sapphire .line {
    stroke: var(--sapphire);
  }
  .motif--emerald .line {
    stroke: var(--emerald);
  }
  .motif--ruby .line {
    stroke: var(--ruby);
  }
  .motif--onyx .line {
    stroke: var(--onyx);
  }
</style>

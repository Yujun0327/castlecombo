# Art Bible — "Art-Deco Jewel House"

The whole interface is one place: a private gem atelier in the late 1920s.
Dark lacquered room, one felt-topped table, engraved ivory cards, gold foil.
Every visual decision must be traceable to that room. If a element could appear
in a generic web app, it does not belong here.

## Surfaces

| Token | Hex | Use |
|---|---|---|
| `--lacquer` | `#14110C` | page ground, card backs, chips |
| `--felt` | `#0F2C23` | table panels (play surfaces) |
| `--felt-hi` | `#17402F` | active/hover felt |
| `--ivory` | `#F2E9D5` | card faces, noble tiles, dialogs — never pure white |
| `--ink` | `#241D14` | text on ivory |
| `--gold` | `#C9A227` (`hi #EED688`, `lo #8A6C14`) | the ONLY accent metal |

Surfaces are flat with a 5–7% `feTurbulence` grain overlay. Gradients exist in
exactly two places: gold foil (`--foil`) and gem facets. Nowhere else.

## Line, shape, elevation

- 1.5px gold is the single ornament line weight (frames, facets, cartouches).
- Radii: 2px (chips, buttons), 6px (cards). Cards additionally chamfer their
  corners (`.chamfer`, 8px cut).
- One elevation: `--shadow` plus an inset gold hairline. No stacked shadows,
  no blur panels.

## Type

- **Cormorant Garamond 600/700** — display, headings, prestige numerals.
- **Marcellus** — engraved numerals, tier Roman numerals, room codes.
- **Jost 400/500/600** — UI text, buttons (period-correct geometric sans).
- Labels are letter-spaced small caps (`.label`); all counts use tabular numerals.

## Gems

Color is never the only channel — each token color has a bespoke cut
(`GemIcon.svelte`): diamond = kite brilliant, sapphire = oval cabochon,
emerald = octagonal step, ruby = pear, onyx = shield hexagon with a silver rim,
gold = milled coin with a star punch. Use `GemIcon` everywhere a gem appears.

## Cards

Portrait 5:7, chamfered, gold keyline frame inset 4.5%. Top band: gem-tinted
glaze, foil prestige numeral left, discount gem right. Center: a generated SVG
deco motif per gem family — sunburst (diamond), chevron waterfall (sapphire),
fan palmette (emerald), stepped ziggurat (ruby), keyline arches (onyx) — denser
at higher tiers (`DecoMotif.svelte`). Cost pips bottom-left, stacked.
Backs: lacquer, tier I/II/III in Marcellus, ornament density by tier.
Nobles: landscape 7:5, engraved cameo profile in a gold cartouche.

## Motion

Quick start, gentle settle (`settle` easing, 160–320ms). Cards deal from the
deck's direction with a 40ms stagger; dialogs rise; nobles descend out on a
slight scale. Everything collapses to instant under `prefers-reduced-motion`
(`dur()` helper).

## Sound

Synthesized WebAudio foley only (no binaries): glassy chip clinks, felt card
slides, a bell chime for nobles (`audio.ts`).

## Anti-slop checklist (review before shipping any screen)

1. No purple, no gradient-washed surfaces, no glassmorphism.
2. Zero emoji as iconography — bespoke SVG only.
3. No Inter/system-ui/Roboto anywhere.
4. One radius scale + chamfers; 1.5px gold is the only ornament line.
5. Gold focus ring (2px, offset 2) — never the default blue, never removed.
6. Designed empty/paused states (engraved cartouches), not spinners.
7. Numerals aligned (tabular), labels small-caps, hierarchy from type not size soup.

## If painted art is added later (optional AI pass)

Master style prompt: *"1920s art-deco engraving, gold foil on ivory paper,
subtle paper grain, jewel-tone accents (viridian, sapphire, ruby, onyx),
symmetrical ornament, clean linework, no text"*. Generate at 2× card size,
posterize lightly, overlay the existing grain, keep the gold frame from
`CardFace` — art replaces only the `DecoMotif` center field via a single
swap point (`CardFace.svelte`).

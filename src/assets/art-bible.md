# Castle Combo — Art Bible: "The Illuminated Manuscript"

Every visual decision checks against this page. If a screen doesn't look like a page
from a working scriptorium — parchment, iron-gall ink, gold leaf laid on in patches,
heraldic marginalia — it isn't done.

## Mood

A 14th-century household book kept by a slightly irreverent scribe: ruled lines,
rubricated initials, coats of arms in the margins, a messenger drawn walking along
the text block. Warm, tactile, a little playful. NOT: glossy, neon, gradient-purple,
glassmorphic, emoji-flavored, "medieval fantasy game UI" (no stone textures, no
hammered-metal buttons, no torches).

## Surfaces

| Token | Value | Use |
|---|---|---|
| `--parchment` | `#EFE4C9` | page background |
| `--panel` | `#F6EDD6` | cards, sheets, modals |
| `--parchment-deep` | `#E3D5B2` | wells, empty grid cells, insets |
| `--ink` | `#3B2F1E` | text, line work (iron-gall brown-black) |
| `--ink-soft` | `rgb(59 47 30 / .62)` | secondary text |
| `--line` | `rgb(59 47 30 / .26)` | hairlines, ruled lines, cell outlines |
| `--gold-leaf` | `#C29832` | the ONE accent: highlights, focus states, legal-target wash, scores |
| `--rubric` | `#9E3B23` | rubricated emphasis: warnings, "your turn", key actions |

Parchment always carries the `--grain` turbulence overlay at low opacity. No pure
white anywhere; no pure black anywhere. Gold leaf is used like real gold leaf —
small patches that matter (legal cells, the active row's seal, score numerals),
never large fills.

## The two decks (load-bearing — players know them from the real game)

Card frames identify the deck at a glance, desaturated to sit on parchment:

| Deck | frame base | frame hi | frame lo |
|---|---|---|---|
| castle (grey) | `#7E8595` | `#99A0AE` | `#636A79` |
| village (brown) | `#8A6748` | `#A17E5C` | `#6E4F35` |

## Heraldic shield colors (the six real types — load-bearing)

The real game's six shield types, in muted manuscript versions matching the
physical cards' hues; readable at a glance. The Faith plum is a FUNCTIONAL color
like the rest — the anti-slop "no purple" rule bans decorative purple, not this.

| Shield | base | hi | lo | charge glyph |
|---|---|---|---|---|
| noble (blue) | `#5F87A8` | `#7BA0BE` | `#48708E` | crown |
| faith (plum) | `#7E5A78` | `#987291` | `#64465F` | cross |
| scholar (green) | `#5C7A4A` | `#749260` | `#465F38` | open book |
| crafts (orange) | `#B97B3F` | `#CE9459` | `#9A6230` | hammer |
| peasant (yellow) | `#C9A94E` | `#DBBF6B` | `#A8893B` | wheat sheaf |
| military (red) | `#A9553F` | `#C06E56` | `#87422F` | sword |

Shields are never color-only: each type pairs with its charge glyph
(2px ink line) so color-blind players read the shape.

## Line

Ink line `#3B2F1E`, 1.5–2px, with deliberate wobble (`wobble.ts`, seeded by
position — stable across renders). Ruled manuscript lines under headings and card
name baselines. Nothing perfectly straight except type.

## Type

- **Grenze Gotisch** (variable): display. Blackletter-adjacent but legible; titles,
  card names, the big turn banner. Used sparingly — never for body text.
- **EB Garamond**: body text, rules prose, scroll conditions.
- **Alegreya Sans SC**: small-caps UI labels, buttons, coin/key counts.
- Numerals: tabular where they align (gold, keys, scores). Score totals may take a
  gold-leaf fill with ink outline.
- Rubricated drop caps (rubric red) open the rules leaflet sections.

## Shape & depth

- One radius: `4px` for sheets and cards (manuscript pages are nearly square-cut).
- Coins are stamped gold discs (ellipse + ink rim + tiny mint mark), keys are 2px
  ink glyphs with a gold bow. Both drawn in SVG, no image binaries.
- Shadows: single soft umbra `0 2px 6px rgb(59 47 30 / .18)`; never glows.
- Wax-seal buttons for key actions (move messenger / redraw row): rubric-red disc
  with an embossed ink glyph, pressed state squashes it 1px.

## The market ("the two rows")

Two ruled text-blocks: castle row above, village row below, each 3 cards. The
messenger is a small ink marginalia figure who stands in the margin beside the
active row. The inactive row sits at ~60% ink opacity (never blurred). Deck stacks
show folio-numbered card backs; discard is a closed book glyph with a count.

## Cards ("entries")

Each card is a manuscript entry: deck-colored frame rule, name in Grenze Gotisch on
a ruled baseline, cost as a gold coin in the top-left corner, shields as marginal
coats of arms down the left edge, messenger icon as the walking figure in the
bottom margin, immediate effect as an inline illuminated line, scroll scoring on an
unrolled scroll band at the foot. Purse cards carry a drawn drawstring purse whose
mouth holds end-game coins. Face-down cards show the deck's back: a diapered
pattern with the folio number.

## The grid ("your kingdom page")

A 3×3 ruled window on your own page. Empty legal cells wash `--parchment-deep`
with a faint compass-dot center; legal placement targets take a gold-leaf wash
(`--gold-leaf` at ~18%) + 2px gold ink outline — never a glow. The window slides
as your bounding box grows; cells outside the reachable window simply aren't drawn.

## Motion

- Cards SLIDE from the market to the grid (220ms, `settle` easing) with a paper
  slide foley; landing stamps a faint ink impression.
- Coins tick and arc; keys turn (small rotation) when spent; the messenger walks
  (two-frame bob) when he changes rows.
- Score numbers count up. Nothing floats or pulses idly.
- All durations through `dur()`; reduced-motion collapses to 0.

## Sound

WebAudio only (audio.ts): paper slides, coin clinks (pitch rises with amount), a
key click, a quill scratch for scoring, one soft bell for game end. Quiet by
default; mute persists.

## Anti-slop checklist (gate every screen against this)

- [ ] no gradients-as-decoration, no glassmorphism, no purple
- [ ] no emoji anywhere in UI
- [ ] no Inter/system-ui; only the three faces above
- [ ] one radius scale; no mixed rounding
- [ ] gold focus ring (`2px solid var(--gold-leaf)` offset 2) on every focusable
- [ ] empty states designed (ruled empty cells, "awaiting the messenger…" prose), never spinners alone
- [ ] wobble on every drawn line; no perfectly straight SVG strokes
- [ ] parchment grain present; no flat #fff panels
- [ ] every color from the tables above; nothing sampled ad hoc
- [ ] blackletter display face never set below 18px and never for sentences

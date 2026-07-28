# Castle Combo

A fan-made web implementation of the card game **Castle Combo**
(Grégory Grard & Mathieu Roussel, Catch Up Games / Pandasaurus) for playing with
friends. No accounts, no servers: share a six-letter room code and play
peer-to-peer, or pass one device around the table.

Private, non-commercial fan project. All artwork is original ("The Illuminated
Manuscript" — see `src/assets/art-bible.md`). If you enjoy the game, buy a copy
of the real thing.

## Play

- **Hotseat** — 2–4 players on one device.
- **Online** — the host opens a room and shares the invite link (`#room=CODE`).
  Multiplayer runs peer-to-peer over WebRTC (Trystero, Nostr signaling); the static
  site can be hosted anywhere (Netlify config included).

Nine turns each: buy a character from the messenger's market row (or take one
face-down for 6 gold and 2 keys), place it in your 3×3 kingdom, and combo the
shields, purses and banners into the highest-scoring page of the manuscript.

## Development

```sh
npm install
npm run dev        # dev server; #gallery renders every component, #demo seats a game
npm test           # vitest: data, engine, playouts, scoring examples, session mesh, UI
npm run check      # svelte-check + tsc
npm run build      # static build in dist/
```

## Architecture

- `src/engine/` — pure, headless rules: one `applyMove` reducer over a JSON
  `GameState`, `legalMoves` enumeration (the UI renders only legal moves), seeded
  deterministic setup so every client derives the identical game from one shared
  config. Card decisions (either/or effects, row discards) ride on the move itself,
  so the reducer stays choice-free and log-replayable.
- `src/data/` — the 78-card roster (39 castle + 39 village) as a declarative
  effect/scoring DSL, transcribed from published card lists
  (`docs/reference/castlecombo-roster.md`). Provisional bits are pinned in
  `rulings.md` (RL-1, RL-11, RL-12).
- `src/transport/` — a small `Transport` interface over Trystero with pinned Nostr
  relays and a TURN fallback.
- `src/app/` — sessions. Hotseat plays every seat locally. Online uses **turn-holder
  sequencing**: Castle Combo never has concurrent decisions, so the acting client
  stamps the next sequence number and broadcasts; every peer folds the same move log
  into the same state and verifies a full-state hash after each move (desync
  tripwire). Reconnects replay a localStorage log, then longer-log-wins resync.
- `src/ui/` — Svelte 5 components on a token-driven design system; all art is
  runtime-generated SVG, zero image binaries.
- `docs/RULES.md` — the numbered rules spec the engine implements; every fact has a
  test. Ambiguities are pinned in `rulings.md`, never resolved silently in code.

### Known limitations

- The card catalog is faithful but **provisional** (`CARDS_PROVISIONAL`): per-card
  messenger icons, purse capacities, and a few shield/deck assignments await
  verification against the official rulebook (see rulings RL-1/11/12). Swapping in
  corrected data touches only `src/data/cards.ts`.
- Deck order is derived from the shared seed on every client, so a determined player
  could read upcoming cards with devtools. The market is open information anyway;
  fine among friends.
- If every player closes their browser, the room's game survives only in their
  localStorage logs — any one returning player restores it for everyone.

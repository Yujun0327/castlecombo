# Castle Combo

A fan-made web implementation of the board game **Castle Combo** (Marc André, Space Cowboys)
for playing with friends. No accounts, no servers: share a six-letter room code and play
peer-to-peer, or pass one device around the table.

Private, non-commercial fan project. All artwork is original. If you enjoy the game,
buy a copy of the real thing.

## Play

- **Hotseat** — 2–4 players on one device.
- **Online** — the host opens a room and shares the invite link (`#room=CODE`).
  Multiplayer runs peer-to-peer over WebRTC (Trystero, Nostr signaling); the static
  site can be hosted anywhere (Netlify config included).

## Development

```sh
npm install
npm run dev        # dev server; #gallery renders every component, #demo seats a game
npm test           # vitest: data, engine, playouts, session mesh, UI
npm run check      # svelte-check + tsc
npm run build      # static build in dist/
```

## Architecture

- `src/engine/` — pure, headless rules: one `applyMove` reducer over a JSON `GameState`,
  `legalMoves` enumeration (the UI renders only legal moves), seeded deterministic
  setup so every client derives the identical game from one shared config.
- `src/data/` — the official 90-card / 10-noble distribution as validated data.
- `src/transport/` — a small `Transport` interface over Trystero with pinned Nostr
  relays and a TURN fallback.
- `src/app/` — sessions. Hotseat plays every seat locally. Online uses **turn-holder
  sequencing**: Castle Combo never has concurrent decisions, so the acting client stamps
  the next sequence number and broadcasts; every peer folds the same move log into the
  same state and verifies a full-state hash after each move (desync tripwire).
  Reconnects replay a localStorage log, then longer-log-wins resync over the wire.
- `src/ui/` — Svelte 5 components on a token-driven design system
  (see `src/assets/art-bible.md`).

### Known limitations

- Deck order is derived from the shared seed on every client, so a determined player
  could read upcoming cards with devtools. Fine among friends; don't play for money.
- If every player closes their browser, the room's game survives only in their
  localStorage logs — any one returning player restores it for everyone.

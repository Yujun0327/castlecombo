# Castle Combo — Rules Specification (ground truth for the engine)

Source: official rules (Catch Up Games / Pandasaurus, 2024), cross-checked against
published rules summaries. Reference captures live in `docs/reference/`.
Every numbered fact here is encoded as at least one test. Ambiguities are pinned in
`rulings.md`, never resolved silently in code.

Scope of this implementation: **2–4 player game**. The official solo mode and any
promo cards are out of scope for v1.

## 1. Components

- Two decks of character cards: **castle (grey backs, 39)** and **village (brown
  backs, 39)** — 78 unique cards, transcribed in `src/data/cards.ts` (RL-1).
- The **messenger** pawn, marking the active row.
- Gold coins (treated as unlimited supply) and **keys**.
- Six heraldic **shield** types: noble, faith, scholar, crafts, peasant, military;
  cards carry 1–2 shields.
- Each card carries: a gold **cost**, its shields, optionally a **messenger icon**
  (RL-12), a **"-1" discount banner** (RL-4), a **purse** (RL-11), an **immediate
  effect**, and/or an end-game **scroll** scoring condition.

## 2. Setup

1. Shuffle each deck; reveal **3 face-up cards per deck** in two rows: castle above,
   village below.
2. The messenger starts beside the **village** row (ruling RL-6).
3. Each player starts with **15 gold** and **2 keys**.
4. First player = seat 0 (`startingSeat`); play proceeds clockwise (seat order).

All shuffling derives from `cfg.sharedSeed` in a FIXED order (castle deck, then
village deck) so every peer reconstructs the same game (`engine/setup.ts`).

## 3. Turn structure

A turn is, in order:

- **R3.1 [Optional, max once] Spend a key**: return 1 key to the supply, then either
  (a) **move the messenger** to the other row, or (b) **redraw**: discard all 3 cards
  of the messenger's current row and reveal 3 replacements from that deck.
- **R3.2 [Mandatory, exactly once] Take a card** from the messenger's row:
  - **Buy**: pay the card's gold cost, reduced by 1 per applicable "-1" discount
    banner already in your kingdom (all/castle/village scope; floor 0; a banner
    never discounts its own purchase — ruling RL-4). Place it face-up in your
    kingdom (§4), then resolve its immediate effects (§5).
  - **Take face-down**: instead of paying, take the chosen card face-down —
    immediately gain **6 gold and 2 keys**. The card is placed face-down in your
    kingdom; it has no shields, no effects, and scores nothing (ruling RL-2).
- **R3.3 [Automatic] Refill**: the emptied slot is refilled from that row's deck.
  If the deck is empty, shuffle its discard pile to form a new deck (ruling RL-5).
- **R3.4 [Automatic] Messenger icon**: if the taken card bears a messenger icon,
  move the messenger to the row the icon indicates (applies also to face-down
  takes — the icon is visible in the market; ruling RL-8).
- **R3.5** The key spent in R3.1 is limited to one per turn; spending is legal only
  before the take, and only when you hold ≥1 key.

## 4. Kingdom placement

- **R4.1** Your kingdom is a grid that must always fit inside a **3×3 bounding box**.
- **R4.2** The first card may be placed anywhere (canonically at origin).
- **R4.3** Every later card must be **orthogonally adjacent** (no diagonals) to at
  least one already-placed card, and may not push the bounding box beyond 3×3.
- **R4.4** Cards are never moved or removed once placed.
- **R4.5** The game gives every player exactly **9 turns**; a finished kingdom is
  exactly the full 3×3.

## 5. Immediate effects

Resolved when a card is bought (never for face-down takes), in the order printed:

- **R5.1** Flat gains: +N gold, +N keys.
- **R5.2** Counted gains: +N gold/keys per matching countable (shields, cards,
  shield types, missing types, empty cells…) currently in your kingdom — the
  just-placed card counts itself (ruling RL-4 corollary).
- **R5.3** Neighbour-scoped gains auto-target the better neighbouring opponent
  (ruling RL-9); all-opponents effects apply to every other seat, floored at 0.
- **R5.4** Printed decisions (either/or effects; discard-a-row-card effects) are
  carried on the buy move itself (`choice`, `discardSlot`) — the reducer resolves
  all effects atomically and deterministically within the `buy` move (RL-9).
- **R5.5** Purse-filling effects lock supply gold onto purses immediately; pursed
  gold is unspendable and scores at game end (RL-11).

## 6. End of game & scoring

- **R6.1** The game ends when every player has placed 9 cards (equal turns by
  construction).
- **R6.2** **Purse top-up**: each player's loose gold is placed onto their purse
  cards with room (capacity RL-11), **automatically in the optimal assignment**
  (ruling RL-3), joining any gold locked there during play. Gold not on a purse
  scores nothing.
- **R6.3** Each face-up card scores its scroll condition; face-down cards score 0.
- **R6.4** Positional conditions (row/column/center/corner/edge) evaluate on the
  normalized grid: shift the bounding box to rows/cols 0–2 (`scoring.ts normalize`).
- **R6.5** +1 point per leftover key.
- **R6.6** Winner: highest total. Tie: most leftover gold (gold on purses is spent —
  ruling RL-10: leftover means unplaced gold). Still tied: shared victory.

## 7. Worked scoring examples (each is a test fixture)

Defined in `test/scoring.test.ts` once the DSL lands (M3), ≥8 fixtures:

- **E1** flat + per-shield-in-grid scroll.
- **E2** row/column positional scoring after normalization (grid grown leftward, so
  raw x-coords are negative).
- **E3** adjacency-scoped scroll (per adjacent shield).
- **E4** purse: greedy optimal allocation across two purses with different rates.
- **E5** face-down card: occupies a cell, no shields, still blocks/enables adjacency.
- **E6** discount floor at 0 and self-counting per-shield effect.
- **E7** keys: leftover keys score 1 each; spent keys don't.
- **E8** full 9-card golden fixture, hand-summed, plus gold tiebreak case.

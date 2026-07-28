# Rulings

Every rules ambiguity gets pinned here with a decision and a test. If a real-game
dispute finds a better answer, change the ruling here first, then the code, then bump
`rulesVersion`.

## RL-1 — Card catalog is provisional
`src/data/cards.ts` ships behind `CARDS_PROVISIONAL = true` until every card is
verified against two independent sources (BGG card-list threads + the circulated
"Chateau Combo Card Roster"). Shield type names/count and deck sizes are pinned by
the same transcription. Card data is pure data — swapping it requires no code
changes, but bump `rulesVersion`. Tests: `data.test.ts` validates schema, id
stability, deck membership, cost ranges, and that every effect/scoring kind in the
DSL is exercised by at least one card.

## RL-2 — Face-down cards
A face-down card occupies its cell for adjacency and for "number of cards" style
conditions that count physical cards in a row/column, but it has **no shields, no
deck identity, no cost, no effects, and scores 0**. (It is a card back — countable
as a card, invisible as a character.) Test: E5.

## RL-3 — End-game purse filling is automatic and optimal
The physical rule lets each player distribute leftover gold onto their purse cards.
With linear per-gold rates the optimal assignment is computable (fill purses in
descending point-per-gold order), so the engine does it automatically and the score
sheet displays the assignment. Revisit only if a transcribed card has a nonlinear
purse. Test: E4.

## RL-4 — Discount banners and self-counting
Discounts are cumulative "-1 banners" ("all/Village/Castle cards cost you one gold
less from now on") that apply only to **future** purchases — a banner never
discounts its own purchase (per the roster booklet's quick guide). The reduced
cost floors at 0. A bought card's per-shield **immediate effect**, by contrast,
evaluates **after** placement, so its own shields count themselves ("including
this card" on the printed text). Tests: engine discount + effect suites.

## RL-5 — Deck exhaustion
When a refill or redraw needs cards and the deck is empty, shuffle that row's
discard pile (deterministically, via the game's `rngState` stream) to form the new
deck. If deck and discard are both empty, the slot stays empty (`null`) and cannot
be taken. Playout tests assert the messenger's row always offers ≥1 takeable card
with real deck counts.

## RL-6 — Messenger starting row
The rulebook places the messenger at the **village** row at setup. Encoded in
`setup.ts`; if transcription proves otherwise, change there and bump `rulesVersion`.

## RL-7 — Redraw with a short deck
A key-redraw discards the active row's 3 cards FIRST, then reveals up to 3 from the
deck (reshuffling the just-grown discard if needed per RL-5). With both deck and
discard short, fewer than 3 cards may be revealed; remaining slots are `null`.

## RL-8 — Messenger icon on face-down takes
The messenger icon is public information on the market card, so it moves the pawn
even when the card is taken face-down. Test: engine grammar suite.

## RL-9 — Neighbour-scoped effects and printed choices
Several cards count shields "in the array of a neighbouring opponent" (Barbarian,
Templar, Spy, Witch, Brigand…). **Ruling: the engine auto-targets the neighbouring
opponent (seat ±1) with the higher count** — the reward is a pure gain, so taking
the max is always optimal and no information is hidden; this removes a fiddly
decision without changing any rational outcome. In 2-player, both sides are the
same opponent. Printed **either/or** choices (gold-per-shield OR flat keys) and
**discard-a-row-card** choices ARE real decisions: they ride on the buy move
itself (`choice: 'a'|'b'`, `discardSlot`) so the reducer stays deterministic and
log-replayable. Tests: engine effects suite.

## RL-10 — Tiebreak gold
"Most leftover gold" for the tiebreak means gold **not** placed on purses (purse
gold has been converted to points). Test: E8.

## RL-11 — Purse capacity (provisional)
Purses have a printed capacity ("each purse with capacity") whose numeric value no
consulted source shows legibly. **Provisional: a uniform capacity of 5 gold per
purse** until verified from the rulebook or clear card scans. Gold enters purses
mid-game via fill effects (locked, unspendable) and at game end via the RL-3
top-up. Data-only change when the real values land; bump `rulesVersion`. Tests: E4, E9.

## RL-12 — Messenger icons (provisional assignment)
Each deck has exactly **19 cards bearing the messenger icon** (BGG-sourced count);
the icon sends the pawn to the OTHER row when the card is taken (even face-down —
RL-8). Confirmed from card photos: Fisherman, Astronomer, Chancellor, Locksmith.
The remaining assignments in `src/data/cards.ts` are provisional and deterministic
(every other card until the count is met) so game FLOW is faithful while the exact
mapping awaits verification. This is the roster's biggest open gap. Test:
`data.test.ts` asserts the 19-per-deck count.

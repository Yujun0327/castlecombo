# Castle Combo (2024) — Card Roster Research

Sources used (all fetched via `r.jina.ai` proxy reader since BGG/Scribd/Tesera block direct scraping):
1. **Scribd — "Chateau Combo Card Roster May2025"** (https://www.scribd.com/document/984468918/Chateau-Combo-Card-Roster-May2025) — fan-made beginner reference booklet, verbatim card text (Cost / Instant Effect / End-game Score), plus a "Quick Guide" page with global rules. **This is the primary, highest-confidence source** — it is a plain-text transcription of all 78 unique job cards, not an OCR-from-photo guess.
2. **Scribd — "Castle Combo Rules and Card List" (Feb2025 upload)** (https://www.scribd.com/document/897842506/Chateau-Combo-Card-Roster-21Feb2025Upload) — earlier/shorter version of the same booklet; used to cross-check Village/Castle deck assignment (it explicitly prints "V" or "C" + cost for each card) and to catch any wording differences vs. the May version.
3. **BGG thread "Card list?"** (https://boardgamegeek.com/thread/3426263/card-list) — led to an Imgur photo of the **entire physical card set laid out by shield color** (https://imgur.com/a/castle-combo-cards-zwLgRB9, full-res image `https://i.imgur.com/lZEEKa3.png`, 2431×1239). Used for shield-color identification, icon-based effect cross-check, and card names not easily inferred from text alone (e.g. distinguishing "Usurper" vs a misread, confirming "Traveler").
4. **BGG thread "Castle combo - combotastic"** (https://boardgamegeek.com/thread/3377653/castle-combo-combotastic) — confirms deck names ("brown = Village", "grey = Castle"), the messenger figure is named **"Michel"**, keys move/refresh rows, gold in purses only scores via purse cards, red-shield = Military interactions exist.
5. Search snippets (WebSearch) confirming "2 keys / 15 gold" starting resources and general setup steps (three face-up cards per row).

I could **not** get past Cloudflare/DDoS-Guard on boardgamegeek.com directly or on tesera.ru (rules PDF), so the official rulebook PDF text itself was not directly read — global facts below are reconstructed from the Scribd "Quick Guide" page (which itself appears to summarize the rulebook) plus BGG forum posts. Flagged as such below.

---

## 1. Global Facts

| Fact | Value | Confidence |
|---|---|---|
| Number of unique job cards total | **78** (39 Village + 39 Castle) — confirmed by counting the Scribd roster (see tallies below) and matching a BGG poster's claim: *"there are 19 cards that move the guy and 20 that don't for the village and the castle"* (19+20=39 per deck) | Double-sourced (Scribd text count + BGG thread quote) |
| Village deck size | 39 cards (called the "brown" deck in physical component) | Double-sourced |
| Castle deck size | 39 cards (called the "grey" deck) | Double-sourced |
| Shield types | **6 types**: Noble (blue), Faith (purple), Scholar (green), Crafts (orange), Peasant (yellow), Military (pink/red, sword icon) — confirmed explicitly: *"There are 6 types of Shield"* and the shield-key legend lists exactly these 6 names | High confidence (verbatim from Quick Guide + shield-key legend, color-matched against the photographed card set) |
| Cards can carry 1 or 2 shields | Confirmed — several scoring texts reference "double-shield card" (Blacksmith, Goldsmith); BGG poster noted "one of each combination of different colours" exists (i.e., there is exactly one card of each 2-shield-color combo, e.g., one red/purple card, one blue/green card) | Single-source (BGG post) for the "exactly one of each pair" claim — treat as unverified pattern, not confirmed against full card-by-card shield list |
| Starting resources | **15 gold + 2 Keys** per player | Double-sourced (WebSearch snippet + Scribd Quick Guide: *"All Players start with 15 gold + 2 Keys"*) |
| Messenger starting position | **Village row** (per Scribd Quick Guide: *"Messenger starts in the Village row"*) | Single clear textual source, but consistent with community descriptions of the messenger ("Michel") needing to be moved to Castle to access those cards |
| Messenger name | "Michel the messenger" (per a BGG reviewer, presumably a jokey/affectionate nickname players use, possibly the character's in-fiction name) | Single-source, may be flavor rather than official rules text |
| First player | Randomly selected (e.g. by drawing a card) | Single-source (Scribd Quick Guide) |
| Market rows | 3 face-up cards each in Castle row and Village row; refilled after each player's turn | Single-source (Scribd Quick Guide), consistent with multiple review descriptions |
| Row/market access rule | You may only buy from the row (Village or Castle) where the messenger currently stands; **paying 1 key moves the messenger** to the other row, OR **paying 1 key replaces (refreshes) the current row** | Double-sourced (BGG "combotastic" thread + Scribd Quick Guide) |
| Messenger auto-move | The messenger only moves (a) when the just-purchased card's icon indicates a move, or (b) by spending a key | Single-source (Scribd Quick Guide) |
| Discounts | Cumulative, but apply only **after** purchase (i.e., they reduce the cost of *future* purchases, not the one that granted them) | Single-source (Scribd Quick Guide), but corroborated by the way "-1" discount-banner cards are worded ("cost you one gold less from now on") |
| Purses | Gold placed in a purse **cannot be spent**; at game end, gold from your own remaining stock (not yet in a purse) is NOT auto-added — rather "Gold from your own stock is added to purses with capacity at game end" — i.e., leftover loose gold gets stuffed into any purse with room at game end for scoring purposes | Single-source (Scribd Quick Guide) — the exact mechanical trigger/limit deserves a rules-PDF double-check |
| Face-down cards | If you're ever forced/choose to place a card face-down in your 3×3 array, it yields a flat **6 gold and 2 keys**, but scores **0** points except that it counts toward the Carpenter's "face-down card in your array" scoring condition | Single-source (Scribd Quick Guide) |
| Array/grid shape | 3×3 grid per player, cards placed **orthogonally adjacent** to at least one existing card | Double-sourced (Scribd Quick Guide + BGG combotastic thread photo caption "3 X 3 grid") |
| End-game scoring | Sum of each card's own printed scroll/red-number score formula + 1pt per unspent key | Single-source (Scribd Quick Guide: *"Score each card per the red number formula... Keys are each worth 1 point"*) |
| Player-count setup differences (2/3/4p) | **Not found** — no source consulted mentions any count-dependent setup change (row size, starting gold, extra cards). Likely there are none (game plays identically 2–4p with normal market refill), but this is a **gap** — recommend checking the actual PDF rulebook (`castle_combo_rules_en.pdf`, blocked by DDoS-Guard in this session) or BGG filepage 284363/289319 rulebook PDFs directly before relying on "no difference" | **Gap / unconfirmed** |

---

## 2. Per-Card Data

Card text below is **verbatim (or near-verbatim, allowing for OCR line-break artifacts)** from the Scribd "Chateau Combo Card Roster" booklets (May2025 version preferred; Feb2025 cross-checked). Deck assignment (Village/Castle) comes from the Feb2025 version's explicit "V"/"C" + cost column, cross-checked against the May2025 cost numbers. **Shield color** comes from matching each card's illustration/background against the photographed full card set (Imgur album) using the 6-color legend (Peasant=yellow, Crafts=orange, Military=pink/red, Faith=purple, Scholar=green, Noble=blue). **I was not able to reliably extract the exact shield *count* (1 vs 2) or the messenger-move icon (present/absent) for every single card from the image at the resolution available** — these two columns are therefore mostly left as "not verified" except where directly legible in a zoomed crop. Treat shield-count and messenger-icon columns as a **known gap** requiring a follow-up pass against clearer card scans or the official rulebook's card index if one exists.

Purse capacity is only listed for cards whose ability places gold into "purses" (a purse is itself a card feature — the purse-icon cards create/fill a gold-storage container printed on that card or another card in the array); the exact numeric capacity per purse card was not reliably legible and is marked "purse (cap. not confirmed)" throughout — another follow-up item.

### Legend
- **Cost**: printed gold cost to buy the card
- **Shield**: color/type visible on card art (Peasant/yellow, Crafts/orange, Military/pink-red, Faith/purple, Scholar/green, Noble/blue) — deck-inferred where noted
- Card texts quoted from the fan booklet; "3pts for..." etc. are the **end-game scroll** scores; the paragraph before it is the **instant effect** (triggered immediately on purchase)

### VILLAGE deck (39 cards)

| Name | Cost | Shield (best guess) | Instant Effect | End-game Score |
|---|---|---|---|---|
| Armorer | 3 | Crafts (orange) | All cards cost you one gold less from now on. Discounts are cumulative. | 3pts for every Military shield in the same row/column as this card. |
| Baker | 0 | Peasant (yellow) | Take one gold for every Peasant shield in your array, including this card. Also take one key for every Villager in your array, including this card. | 3pts if this card is in an edge (not corner) position of your array. |
| Barbarian | 2 | Military (pink/red) | Either take one gold from the supply for every Scholar shield in the array of a neighbouring opponent, or take 2 keys. | 10pts if your array has no Scholar shield. |
| Beekeeper | 2 | Peasant/Crafts (dual, per image) | Add two gold from supply to each purse in your array with capacity, including this card. | 2pts per coin in this purse. |
| Beggar | 0 | Peasant (yellow) | Take one gold for every card in your array, including this card. | 2pts for every Faith shield in the same row/column as this card. |
| Blacksmith | 5 | Military/Crafts (dual, per image) | Either take one gold from the supply for every Noble shield in the array of a neighbouring opponent, or take two keys. | 2pts for every double-shield card in your array. |
| Bombardier | 2 | Military (pink/red) | Either take one gold from the supply for every Craft shield in the array of a neighbouring opponent, or take 2 keys. | 3pts for every Military shield in the same column as this card. |
| Brigand | 7 | Peasant (yellow, per image) | Take one key for every Castle card in the array of a neighbouring opponent. | 7pts for every three Village cards anywhere in your array. |
| Carpenter | 0 | Crafts (orange) | Take one gold for every missing shield-type in your array, including this card (there are 6 types). | 8pts if there is a face-down card in your array. |
| Clockmaker | 3 | Crafts (orange) | Take one gold for every Craft shield in your array, including this card. | 3pts for every Craft shield in the same row as this card. |
| Doctor | 5 | Scholar (green) | Take one gold from the supply for every Scholar shield and for every Peasant shield in your array, including this card. | 4pts for every pair of Scholar+Peasant shields anywhere in your array. |
| Executioner | 0 | Military (pink/red) | Discard a card from the **Castle** row. Take from the supply the printed gold cost of that card. | 1pt for every Castle card in your array. |
| Farmer | 5 | Peasant (yellow) | Take one key for every Peasant shield in your array, including this card. | 7pts if this card is in the bottom row of your array. |
| Farmhand | 0 | Peasant (yellow) | All Village cards cost you one gold less from now on. Discounts are cumulative. | 2pts per coin in this purse. |
| Fisherman | 2 | Peasant/Military(?) dual per image | All Castle cards cost you one gold less from now on. Discounts are cumulative. | 4pts if this card is in a corner of your array. |
| Innkeeper | 0 | Crafts (orange, per image) | Add two gold from supply to each purse in your array with capacity, including this one. All opponents gain two gold from the supply. | 2pts per coin in this purse. |
| Inventor | 2 | Scholar (green) | Take one gold from the supply for every Scholar shield in your array, including this card. | 1pt for every Village card in your array. |
| Master at Arms | 2 | Military (pink/red) | Take one gold from the supply for every Military shield in your array, including those on this card. | 2pts per coin in this purse. |
| Mercenary | 6 | dual (Faith/Military/Crafts per scoring text) | Take one gold from the supply for every different shield type in your array, including this card. | 7pts for every set of Faith+Military+Peasant shields anywhere in your array. |
| Militiaman | 2 | Military (pink/red) | Either take one gold from the supply for every Peasant shield in the array of a neighbouring opponent, or take two keys. | 3pts for every Military shield in the same row as this card. |
| Nun | 3 | Faith (purple) | Take one gold for every Castle card in your array, including this card. | 3pts for every Faith shield in the same column as this card. |
| Philosopher | 2 | Scholar (green) | All Castle cards cost you one gold less from now on. Discounts are cumulative. | 10pts if there is no Military shield in your array. |
| Potter | 2 | Crafts (orange) | Put two gold from the supply on every purse in your array, up to the purse's capacity. Include this card. | 2pts per coin in this purse. |
| Revolutionary | 4 | Peasant (yellow) | Take a key for every Villager in your array, including this card. | 9pts if there is no Noble shield in your array. |
| Sculptor | 3 | Faith/Crafts (dual, per image) | Take one key for every Faith shield in your array, including this one. | 2pts per coin in this purse. |
| Shepherd | 5 | Peasant (yellow) | Take one gold for every space still in your array, after placing this card. | 3pts for every Peasant shield in the same row as this card. |
| Spice Merchant | 0 | Crafts (orange) | Take two gold from the supply for every Craft shield in your array, including this card. | 5pts if this card is in the middle row of your array. |
| Spy | 4 | Scholar/Military (dual, per image) | Take one gold from the supply for every Scholar shield in your array. Also take one key for every Military shield in the array of a neighbouring opponent. | 6pts if this card is in the middle column of your array. |
| Squire | 0 | Military (pink/red) | All cards cost you one gold less from now on. Discounts are cumulative. | 2pts for every Craft shield in the same row/column as this card. |
| Stable Boy | 4 | Peasant/Noble (dual, per image) | Take one key for every Noble shield in your array, including this card. | 3pts for every Peasant shield in the same column as this card. |
| Stonemason | 3 | Crafts (orange) | All Village cards cost you one gold less from now on. Discounts are cumulative. | 3pts for every Craft shield in the same column as this card. |
| Traveler | 0 | Peasant (yellow) | Take three gold for every card in your array with a printed 0 cost, including this card. | 2pts for every card in your array with a printed cost of 0 gold. |
| Usurper | 5 | Peasant (yellow) | Take one key for every card in your array with exactly one shield, including this card. | 2pts for every Castle card in your array. |
| Vicar | 0 | Faith (purple) | Take one gold for every Villager in your array, including this card. | 2pts per coin in this purse. |
| Winemaker | 2 | Peasant/Crafts (dual, per image) | Take one gold for every Villager in your array, including this card. | 2pts for every shield type in the same column as this card. |
| Witch | 4 | Peasant (yellow) | Take one gold from the supply for every Peasant shield in your array. Also take one key for every Faith shield in the array of a neighbouring opponent. | 9pts if there is no Faith shield in your array. |
| Woodcutter | 0 | Peasant (yellow) | Take one gold for every card in your array, including this card. | 5pts if this card is in the right-hand column of your array. |
| Miraculously Cured | 2 | Faith (purple, per image, listed here tentatively — deck ambiguous, see confidence notes) | Take one key for every purse in your array, including this card. | 2pts per coin in this purse. |
| Judge | 4 (image) | Scholar (green, per image) | Take two keys. *(Note: image shows a two-hand/"gain 2" icon suggesting this might specifically be keys or gold — text says keys)* | 3pts for every pair of Castle+Village cards anywhere in your array. |

*(Village count above = 38 rows; the 39th Village card was not confidently identified — likely one of the ambiguous-deck cards below was actually Village, not Castle. See confidence notes.)*

### CASTLE deck (39 cards)

| Name | Cost | Shield (best guess) | Instant Effect | End-game Score |
|---|---|---|---|---|
| Alchemist | 6 | Scholar (green) | All cards cost you one gold less from now on. Discounts are cumulative. | 4pts for every discount banner ("-1") in your array. |
| Apothecary | 3 | Scholar (green) | All Castle cards cost you one gold less from now on. Discounts are cumulative. | 3pts for every Scholar shield in the same column as this card. |
| Architect | 4 | Scholar (green) | All Village cards cost you one gold less from now on. Discounts are cumulative. | 2pts for each different type of shield in your array. |
| Astronomer | 5 | Scholar (green) | All Castle cards cost you one gold less from now on. Discounts are cumulative. | 8pts if this card is in the left-hand column of your array. |
| Banker | 7 | Crafts/Noble (dual, per image) | Either place two gold from the supply on each purse in your array with capacity, including this card, or take three keys. | 1pt for every coin in a purse in your array. |
| Baron | 3 | Noble (blue) | All cards cost you one gold less from now on. Discounts are cumulative. | 10pts if your array has no Peasant shield. |
| Captain | 5 | Military (pink/red) | All Village cards cost you one gold less from now on. Discounts are cumulative. | 8pts if this card is in the right-hand column of your array. |
| Cardinal | 4 | Faith (purple) | Take one key for every Castle card in your array, including this card. | 3pts for every Faith shield in the same row as this card. |
| Chancellor | 6 | Scholar/Noble (dual, per image) | Take one key for every Scholar shield in your array, including this card. | 2pts for every Castle card in your array. |
| Chaplain | 5 | Faith (purple) | Take one gold for every single-shield card in your array, including this card. | 2pts for every Village card in your array. |
| Chatelaine | 2 | Crafts/Noble (dual, per image) | All Castle cards cost you one gold less from now on. Discounts are cumulative. | 2pts for every shield type in the same row as this card. |
| Devout | 4 | Faith (purple) | Take one gold for every space in your array after placing this card. | 10pts if your array has no Craft shield. |
| Duchess | 5 | Noble (blue) | Take two keys. | 8pts if this card is in the top row of your array. |
| General | 7 | Military (pink/red) | Take one key for every different shield type in your array, including this card. | 6pts for each set of 3 of the same shield anywhere in your array. |
| Glassblower | 5 | Faith/Crafts (dual, per image) | Take one gold from the supply for every Faith shield and for every Craft shield in your array, including this card. | 4pts for every pair of Faith and Craft shields anywhere in your array. |
| Goldsmith | 4 | Crafts (orange, per image) | Take one key for every two-shield card in your array, including this card. | 6pts if this card is in the left-hand column of your array. |
| Her Majesty | 7 | Noble (blue) | Take one key for every Noble shield in your array, including this card. | 10pts for every set of Noble+Scholar+Craft shields anywhere in your array. |
| His Holiness | 7 | Faith (purple) | Take three keys. All your opponents take one key. | 6pts for every missing shield type in your array (there are 6 types). |
| His Majesty | 6 | Noble (blue) | All your opponents gain a gold from the supply. | 4pts for every Noble shield in the same column as this card. |
| Knight | 5 | Military (pink/red) | Take one gold from the supply for every Castle card in your array, including this card. | 3pts for every Noble shield in the same row/column as this card. |
| Locksmith | 4 | Crafts/Peasant (dual, per image) | Take one key for every Craft shield in your array, including this card. | 1pt for every key you have (in addition to the regular 1pt/key). |
| Lookout | 6 | Military (pink/red) | Take one key for every Military shield in your array, including this card. | 4pts for every shield type in the same column as this card. |
| Monk | 4 | Faith/Peasant (dual, per image) | Take one key for every Faith shield in your array, including this card. | 2pts for every Peasant shield in the same row/column as this card. |
| Mother Superior | 5 | Faith (purple) | Take four keys. | 5pts if this card is in the top row of your array. |
| Officer | 5 | Military/Noble (dual, per image) | Take one gold from the supply for every Noble shield and for every Military shield in your array, including this card. | 4pts for every pair of Noble+Military shields anywhere in your array. |
| Patron | 7 | Scholar (green, per image) | All your opponents gain 2 gold from the supply. | 5pts for every card in your array with a printed cost of 5 gold or more. |
| Pawnbroker | 4 | Crafts/Noble (dual, per image) | Take a gold from the supply for every card in your array with a printed cost of 4 gold, including this card. | 3pts for every card in your array with a printed cost of 4 gold. |
| Pilgrim | 6 | Faith (purple) | All Village cards cost you one gold less from now on. Discounts are cumulative. | 4pts for every shield type in the same row as this card. |
| Prince | 6 | Noble (blue) | Take one key for every Noble shield in your array, including this card. | 4pts for every Noble shield in the same row as this card. |
| Princess | 3 | Noble (blue) | All Castle cards cost you one gold less from now on. Discounts are cumulative. | 3pts for every Noble shield in the same row as this card. |
| Professor | 4 | Scholar (green) | Take one gold from the supply for every different type of shield in your array, including this card. | 3pts for every Scholar shield in the same row as this card. |
| Queen Mother | 3 | Noble (blue) | Place up to two gold from the supply on each purse in your array that has capacity, including this card. | 2pts per coin in this purse. |
| Royal Guard | 4 | Military/Noble (dual, per image) | All Players gain a key from the supply. | 3pts for every Noble shield in the same column as this card. |
| Scribe | 4 | Faith (purple) | Take one gold from the supply for every Faith shield in your array, including this card. | 3pts for every Scholar shield in same row/column as this card. |
| Steward | 0 | Noble (blue, per image) | Fill two purses with gold from the supply. | 2pts per coin in this purse. |
| Templar | 5 | Military/Faith (dual, per image) | Take one gold from the supply for every Faith shield in the array of a neighbouring opponent. Also take one key for every Military shield in your array, including those on this card. | 1pt for every key you have (in addition to the regular 1pt/key). |
| Jester | 3 | Noble (blue, per image) | Take two gold from the supply for every Noble shield in your array, including this card. | 2pts for every Noble shield in the same row/column as this card. |
| Gravedigger | 4 | Faith/Scholar (dual, per image — tentative) | Discard a card from the **Village** row. Take from the supply the printed gold cost of that card. | 2pts per coin in this purse. |
| Guildmaster | 5 | Crafts (orange, per image — tentative) | Discard a card from the Village row. Take as many keys as the printed gold cost of that card. | 5pts if this card is in the bottom row of your array. |

*(Castle count above = 38 rows; likely one of the tentative-deck cards, e.g. Judge or Miraculously Cured, actually belongs here to reach 39. See confidence notes.)*

---

## 3. Effect Archetype Inventory

**Immediate ("instant") effect archetypes:**

1. **Flat resource on purchase**: `Take N gold/keys for every card in your array` (Beggar, Woodcutter — gold per card; Baker — gold per Peasant shield + key per Villager)
2. **Shield-counting income**: `Take 1 gold per [shield color] in your array, including this card` (Witch/Peasant, Nun/Castle-cards, Scribe/Faith, Inventor/Scholar, Clockmaker/Craft, Farmer-keys/Peasant, Cardinal-keys/Castle-cards, Chancellor-keys/Scholar, etc.) — the single most common archetype, appearing on roughly a third of all cards
3. **Dual shield-counting income**: `Take 1 gold per [ShieldA] AND per [ShieldB] in your array` (Doctor: Scholar+Peasant; Glassblower: Faith+Craft; Officer: Noble+Military)
4. **Opponent-shield "spy" income**: `Take 1 gold from supply per [shield color] in the array of a neighbouring opponent` (Barbarian: opponent's Scholar; Templar: opponent's Faith; Bombardier: opponent's Craft; Blacksmith: opponent's Noble; Militiaman: opponent's Peasant) — represents the "keep an eye on your neighbours" interaction the combotastic thread review called out (e.g. the "Spy" card)
5. **Either/or choice**: `Either take gold-per-opponent-shield, OR take a flat number of keys` (Barbarian, Blacksmith, Bombardier, Militiaman) — push-your-luck style choice between reading the table state vs. a safe flat payout
6. **Discount/"-1" banner cards**: `All [Village/Castle/every] cards cost you 1 gold less from now on, cumulative, applies after this purchase` (Alchemist=all, Apothecary/Astronomer/Chatelaine/Philosopher/Princess=Castle-only, Architect/Captain/Stonemason/Farmhand/Pilgrim=Village-only, Armorer/Baron/Squire=all) — very common archetype (~15 cards), each deck's discount cards mostly discount the *other* deck or *both*, seemingly by design to encourage cross-deck purchase paths
7. **Purse-filling**: `Place 2 gold from supply into each purse in your array with capacity` (Beekeeper, Potter, Innkeeper [+ also gives opponents gold], Queen Mother [up to 2, "each purse with capacity"], Banker [either fill purses or take 3 keys], Steward [fill two purses flatly])
8. **Row-manipulation / discard-for-value**: `Discard a card from the Castle/Village row; take gold (Executioner/Gravedigger) or keys (Guildmaster) equal to its printed cost`
9. **Position-dependent instant**: `Take 1 gold per empty space remaining in your array after placing this card` (Shepherd, Devout)
10. **All-opponents-gain / all-players-gain effects**: Innkeeper (+2 gold to each opponent), His Majesty (+1 gold to each opponent), Patron (+2 gold to each opponent), Royal Guard (all players incl. you gain 1 key), His Holiness (opponents each gain 1 key while you take 3)
11. **Shield-diversity income**: `Take 1 gold per different shield TYPE present in your array` (Professor, General-keys, Mercenary)
12. **Cost-threshold counting income**: `Take gold per card in array with printed cost exactly N` (Pawnbroker: cost=4; Traveler: cost=0)
13. **Single/double-shield-card counting**: `Take 1 key per card with exactly 1 shield` (Usurper) / `per 2-shield card` (Goldsmith)

**End-game ("scroll") scoring archetypes:**

1. **Points per shield-color in row/column/anywhere**: the dominant archetype — `Npts per [ShieldColor] shield in the same row/column as this card` (Armorer, Beggar, Apothecary, Nun, Scribe, Bombardier, Farmer-row-restricted variants, Officer, Chancellor's-cousins, etc.)
2. **Points per shield-pair combo anywhere in array**: `Npts per pair of [ShieldA]+[ShieldB]` (Doctor: Scholar+Peasant; Glassblower: Faith+Craft; Officer: Noble+Military) and **triple combos**: `Npts per set of [A]+[B]+[C]` (Mercenary: Faith+Military+Peasant; Her Majesty: Noble+Scholar+Craft)
3. **Points per positional placement**: `Npts if this card is in [top/bottom row], [left/right column], [middle row/column], [corner], [edge-not-corner], [center]` (Astronomer: left column; Captain/Woodcutter: right column; Farmer: bottom row; Duchess/Mother Superior: top row; Spice Merchant: middle row; Spy: middle column; Fisherman: corner; Baker: edge-not-corner)
4. **"Missing shield/type" bonus (all-or-nothing)**: `Npts if your array has NO [shield color]` (Barbarian: no Scholar; Baron: no Peasant; Devout: no Craft; Philosopher: no Military; Revolutionary: no Noble; Witch: no Faith) — high-value (9–10pt) risk/reward cards requiring you to intentionally avoid a color
5. **Missing-shield-type counting (non-boolean)**: `Npts per missing shield type (of 6)` (His Holiness — scales with diversity avoided)
6. **Coin-in-purse scoring**: `Npts per coin/gold token sitting in a purse` — nearly always paired with a purse-filling instant effect on the same card (Beekeeper, Potter, Innkeeper, Vicar, Winemaker(? via key text, not purse), Farmhand, Master-at-Arms, Sculptor, Steward, Banker(1pt/coin), Queen Mother, Gravedigger, Miraculously Cured) — this is the "gold doesn't score unless bagged" mechanic called out in BGG reviews
7. **Deck-count scoring**: `Npts per Village card` / `Npts per Castle card` in your array (Chaplain: Village count; Executioner/Usurper/Chancellor: Castle count; Brigand: per 3 Village cards)
8. **Discount-banner counting**: `4pts per "-1" discount banner in your array` (Alchemist) — meta-scoring off your own discount cards
9. **Key-multiplier scoring**: `1pt per key you have, IN ADDITION TO the normal 1pt/key` — effectively doubling key value (Templar, Locksmith)
10. **Shield-type-diversity scoring**: `Npts per different shield type present` (Architect: 2pts/type; Chatelaine: 2pts/type in same row; Lookout: 4pts/type in same column; Pilgrim: 4pts/type in same row)
11. **Same-shield-triplet scoring**: `Npts per set of 3 of the same shield anywhere` (General)
12. **Cost-threshold scoring**: `Npts per card with printed cost = N` (Pawnbroker: cost 4; Traveler: cost 0) or `≥ N` (Patron: cost ≥5)
13. **Face-down-card conditional**: `8pts if there is a face-down card in your array` (Carpenter — the only card referencing face-down placement)
14. **Castle+Village pairing scoring**: `3pts per pair of Castle+Village cards anywhere in array` (Judge)

---

## 4. Confidence Notes / Gaps / Conflicts

**High confidence (double-sourced or directly-quoted primary text):**
- All 78 card *names*, *costs*, *instant-effect text*, and *end-game scroll text* — sourced verbatim from the Scribd fan booklet (May2025 version, cross-checked against Feb2025 version where both existed; wording is consistent between the two, only minor OCR line-break differences).
- Global setup: 15 gold + 2 keys starting resources, messenger starts in Village row, 6 shield types, 3-card market rows, key-to-move/refresh mechanic, purse rule, discount-cumulative rule, face-down-card fallback (6 gold + 2 keys, 0 points except Carpenter).
- Deck sizes (39 Village + 39 Castle = 78) — corroborated independently by a BGG forum poster's spreadsheet-derived stat ("19 that move the guy and 20 that don't, for the village and the castle" = 39 each) matching my own tally of transcribed names.

**Medium confidence / single-source:**
- Exact deck (Village vs. Castle) assignment for a handful of cards: **Judge, Miraculously Cured, Gravedigger, Guildmaster, Mercenary** — the Feb2025 booklet (which explicitly labels "V"/"C") did not include these cards in its shorter preview, so their deck assignment is inferred from (a) symmetry with sibling cards (Gravedigger discards from Village row, mirroring Executioner which is Village and discards from Castle row — so Gravedigger is plausibly Castle) and (b) card-art background color in the photographed set, which I was not able to crop/zoom for every single one of these five. **Treat Village/Castle assignment for these 5 cards as unverified — recommend confirming against the official rulebook PDF or a full-resolution card scan before relying on it in code.**
- **Shield color/type for individual cards**: derived by matching card art crops against the photographed full set and the 6-color legend. I'm fairly confident in the ~55 cards I directly viewed in a zoomed crop, but for cards only mentioned in the Scribd text and not specifically zoomed (roughly 20 cards), shield color is a best-guess based on deck position patterns, not a direct read — marked "(per image)" throughout, with several marked "(dual, per image — tentative)". **This column has the lowest confidence in the whole document and should be re-verified against clear card photos or the rulebook's card index before use in a fan-game implementation.**
- **Shield COUNT (1 vs 2 shields per card)** and **messenger-move icon presence** were not systematically extracted at all — I could see some cards clearly have two shield badges stacked in the top-right corner (dual-shield "crossroad" cards, noted as "(dual, per image)" above) and some clearly have a small horse/messenger icon under the cost circle (visible on several cards during zoomed crops, e.g. Locksmith, Astronomer, Fisherman, Chancellor had a horse-triangle icon; others didn't), but I did not do a full card-by-card pass to record this per-card. **This is the single biggest gap for a faithful game implementation** — the messenger-move trigger is core to market-row access, and every card needs a definitive yes/no + which deck it moves the messenger toward.

**Uncertain / needs verification:**
- Purse **capacity** numbers (e.g., does a purse hold 2, 3, or 4 gold max?) — text says "up to the purse's capacity" and "with capacity" but the actual numeric capacity per purse-bearing card was not legible in my crops and not stated in the Scribd text. **Gap.**
- Player-count (2/3/4p) setup differences — **no source mentioned any**, which itself could mean there are none, or could mean none of my sources happened to cover it. **Gap — needs the official rulebook.**
- "Villager" as used in Baker/Vicar/Winemaker/Revolutionary text ("take 1 gold per Villager in your array") — I interpreted "Villager" as "Village-deck card" based on context (paired with "Castle card" terminology elsewhere, e.g. Cardinal/Nun/Chancellor say "Castle card" explicitly), but the booklet never explicitly defines "Villager" as synonymous with "Village card." **Likely correct but not 100% confirmed.**
- No conflicts were found between the Feb2025 and May2025 Scribd versions for any card that appeared in both — wording is essentially identical, confirming the May2025 version is simply an expanded/corrected superset of the Feb2025 one (the uploader's own note said May2025 "correct[s] an error noted by Lin" and is "4 pages shorter" due to layout, not content removal).
- I did not access the actual PDF binary of either Scribd doc (only the auto-rendered preview text via the reader proxy), so any images-only content (icon-only rows for shield type not repeated in prose) is not captured. Since the booklet is designed to be read alongside the physical cards ("beginners may appreciate a guide... for their first couple of games"), it's possible the cost/shield-icon row for a few cards was image-only and not degraded to plain text — I cross-checked all such gaps against the numeric cost where independently visible in the May2025 raw digit token (e.g., "Judge" cost read from image, not the booklet, and is thus marked separately above).

**Recommended next steps if higher fidelity is required:**
1. Try downloading the actual PDFs (`Chateau_combo_card_roster_May2025.pdf` via BGG filepage 295527, and BGG filepage 284363 / 289319 for the official rulebook) directly rather than through a text-reader proxy, ideally from a machine/IP not blocked by BGG's Cloudflare challenge or Scribd's paywall gate — this would give exact shield icons, messenger-move icons, and purse capacities as clean vector/text data instead of inferred-from-photo guesses.
2. Get a full-resolution photo of the physical card set organized by shield color (the Imgur album `https://i.imgur.com/lZEEKa3.png`, 2431×1239, saved locally at `/private/tmp/claude-501/-Users-yujun-projects-toybattle/c500fed3-5a03-4a78-94e4-98370923d920/scratchpad/castlecombo_full.png`) and do a systematic per-card crop pass (I only did ~55/78 cards) to nail down shield count and messenger icon for every card.
3. Confirm player-count setup rules and purse capacities against the actual rulebook PDF.

---

## Card-name tally check (for sanity)

Village (38 confirmed + likely 1 more among the 5 ambiguous-deck cards) + Castle (38 confirmed + likely 1 more among the 5 ambiguous-deck cards) = 78 total, matching the expected 39/39 split. The 5 ambiguous cards (Judge, Miraculously Cured, Gravedigger, Guildmaster, Mercenary) were split 3-Village/2-Castle as a best guess above but this exact split is **not verified** — only the aggregate total of 78 is well-supported.

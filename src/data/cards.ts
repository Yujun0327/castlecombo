import type { CardDef, Deck, Shield } from '../engine/types'

/**
 * The real Castle Combo roster: 78 cards, 39 castle (grey) + 39 village
 * (brown), transcribed from the fan "Chateau Combo Card Roster" booklet
 * (May 2025, cross-checked against the Feb 2025 version) and the BGG
 * card-list threads. See docs/reference/castlecombo-roster.md.
 *
 * PROVISIONAL — ruling RL-1. Verbatim-sourced: names, costs, instant
 * effects, scroll scores. Best-guess pending verification: shield types on
 * ~20 cards, deck assignment of Judge / Miraculously Cured / Gravedigger /
 * Guildmaster / Mercenary, purse capacities (RL-11), and the per-card
 * messenger icons (RL-12 — only 4 confirmed; the rest are assigned
 * provisionally below to reach the known 19-per-deck count).
 *
 * Ids are stable: castle 0.., village 100.. Swapping in corrected data
 * touches only this file; bump `rulesVersion`.
 */
export const CARDS_PROVISIONAL = true

const defs: CardDef[] = []
const nextId: Record<Deck, number> = { castle: 0, village: 100 }

function card(
  deck: Deck,
  name: string,
  cost: number,
  shields: Shield[],
  extra: Omit<CardDef, 'id' | 'name' | 'deck' | 'cost' | 'shields'> = {},
): void {
  defs.push({ id: nextId[deck]++, name, deck, cost, shields, ...extra })
}

/* shorthand */
const sh = (...shields: Shield[]) => ({ count: 'shields', shields }) as const
const inMyPurse = { count: 'goldOnThisPurse' } as const
const purseScroll = [{ kind: 'per', points: 2, what: inMyPurse, where: 'grid' }] as const

/* ================= CASTLE (grey), ids 0.. ================= */

card('castle', 'Alchemist', 6, ['scholar'], {
  banner: 'all',
  scroll: [{ kind: 'per', points: 4, what: { count: 'cards', hasBanner: true }, where: 'grid' }],
})
card('castle', 'Apothecary', 3, ['scholar'], {
  banner: 'castle',
  scroll: [{ kind: 'per', points: 3, what: sh('scholar'), where: 'col' }],
})
card('castle', 'Architect', 4, ['scholar'], {
  banner: 'village',
  scroll: [{ kind: 'per', points: 2, what: { count: 'shieldTypes' }, where: 'grid' }],
})
card('castle', 'Astronomer', 5, ['scholar'], {
  banner: 'castle',
  messenger: true, // icon confirmed in card photo
  scroll: [{ kind: 'position', at: 'left', points: 8 }],
})
card('castle', 'Banker', 7, ['crafts', 'noble'], {
  purse: true,
  onBuy: [{ kind: 'choice', a: [{ kind: 'fillPurses', amount: 2 }], b: [{ kind: 'keys', amount: 3 }] }],
  scroll: [{ kind: 'per', points: 1, what: { count: 'goldOnPurses' }, where: 'grid' }],
})
card('castle', 'Baron', 3, ['noble'], {
  banner: 'all',
  scroll: [{ kind: 'absent', what: sh('peasant'), where: 'grid', points: 10 }],
})
card('castle', 'Captain', 5, ['military'], {
  banner: 'village',
  scroll: [{ kind: 'position', at: 'right', points: 8 }],
})
card('castle', 'Cardinal', 4, ['faith'], {
  onBuy: [{ kind: 'keysPer', amount: 1, what: { count: 'cards', deck: 'castle' }, where: 'grid' }],
  scroll: [{ kind: 'per', points: 3, what: sh('faith'), where: 'row' }],
})
card('castle', 'Chancellor', 6, ['scholar', 'noble'], {
  messenger: true, // icon confirmed in card photo
  onBuy: [{ kind: 'keysPer', amount: 1, what: sh('scholar'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 2, what: { count: 'cards', deck: 'castle' }, where: 'grid' }],
})
card('castle', 'Chaplain', 5, ['faith'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'cards', shieldCount: 1 }, where: 'grid' }],
  scroll: [{ kind: 'per', points: 2, what: { count: 'cards', deck: 'village' }, where: 'grid' }],
})
card('castle', 'Chatelaine', 2, ['crafts', 'noble'], {
  banner: 'castle',
  scroll: [{ kind: 'per', points: 2, what: { count: 'shieldTypes' }, where: 'row' }],
})
card('castle', 'Devout', 4, ['faith'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'emptySpaces' }, where: 'grid' }],
  scroll: [{ kind: 'absent', what: sh('crafts'), where: 'grid', points: 10 }],
})
card('castle', 'Duchess', 5, ['noble'], {
  onBuy: [{ kind: 'keys', amount: 2 }],
  scroll: [{ kind: 'position', at: 'top', points: 8 }],
})
card('castle', 'General', 7, ['military'], {
  onBuy: [{ kind: 'keysPer', amount: 1, what: { count: 'shieldTypes' }, where: 'grid' }],
  scroll: [{ kind: 'per', points: 6, what: { count: 'sameShieldTriplets' }, where: 'grid' }],
})
card('castle', 'Glassblower', 5, ['faith', 'crafts'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: sh('faith', 'crafts'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 4, what: { count: 'sets', shields: ['faith', 'crafts'] }, where: 'grid' }],
})
card('castle', 'Goldsmith', 4, ['crafts'], {
  onBuy: [{ kind: 'keysPer', amount: 1, what: { count: 'cards', shieldCount: 2 }, where: 'grid' }],
  scroll: [{ kind: 'position', at: 'left', points: 6 }],
})
card('castle', 'Her Majesty', 7, ['noble'], {
  onBuy: [{ kind: 'keysPer', amount: 1, what: sh('noble'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 10, what: { count: 'sets', shields: ['noble', 'scholar', 'crafts'] }, where: 'grid' }],
})
card('castle', 'His Holiness', 7, ['faith'], {
  onBuy: [{ kind: 'keys', amount: 3 }, { kind: 'eachOpponentKeys', amount: 1 }],
  scroll: [{ kind: 'per', points: 6, what: { count: 'missingShieldTypes' }, where: 'grid' }],
})
card('castle', 'His Majesty', 6, ['noble'], {
  onBuy: [{ kind: 'eachOpponentGold', amount: 1 }],
  scroll: [{ kind: 'per', points: 4, what: sh('noble'), where: 'col' }],
})
card('castle', 'Knight', 5, ['military'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'cards', deck: 'castle' }, where: 'grid' }],
  scroll: [{ kind: 'per', points: 3, what: sh('noble'), where: 'rowcol' }],
})
card('castle', 'Locksmith', 4, ['crafts', 'peasant'], {
  messenger: true, // icon confirmed in card photo
  onBuy: [{ kind: 'keysPer', amount: 1, what: sh('crafts'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 1, what: { count: 'keys' }, where: 'grid' }],
})
card('castle', 'Lookout', 6, ['military'], {
  onBuy: [{ kind: 'keysPer', amount: 1, what: sh('military'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 4, what: { count: 'shieldTypes' }, where: 'col' }],
})
card('castle', 'Monk', 4, ['faith', 'peasant'], {
  onBuy: [{ kind: 'keysPer', amount: 1, what: sh('faith'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 2, what: sh('peasant'), where: 'rowcol' }],
})
card('castle', 'Mother Superior', 5, ['faith'], {
  onBuy: [{ kind: 'keys', amount: 4 }],
  scroll: [{ kind: 'position', at: 'top', points: 5 }],
})
card('castle', 'Officer', 5, ['military', 'noble'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: sh('noble', 'military'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 4, what: { count: 'sets', shields: ['noble', 'military'] }, where: 'grid' }],
})
card('castle', 'Patron', 7, ['scholar'], {
  onBuy: [{ kind: 'eachOpponentGold', amount: 2 }],
  scroll: [{ kind: 'per', points: 5, what: { count: 'cards', costAtLeast: 5 }, where: 'grid' }],
})
card('castle', 'Pawnbroker', 4, ['crafts', 'noble'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'cards', cost: 4 }, where: 'grid' }],
  scroll: [{ kind: 'per', points: 3, what: { count: 'cards', cost: 4 }, where: 'grid' }],
})
card('castle', 'Pilgrim', 6, ['faith'], {
  banner: 'village',
  scroll: [{ kind: 'per', points: 4, what: { count: 'shieldTypes' }, where: 'row' }],
})
card('castle', 'Prince', 6, ['noble'], {
  onBuy: [{ kind: 'keysPer', amount: 1, what: sh('noble'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 4, what: sh('noble'), where: 'row' }],
})
card('castle', 'Princess', 3, ['noble'], {
  banner: 'castle',
  scroll: [{ kind: 'per', points: 3, what: sh('noble'), where: 'row' }],
})
card('castle', 'Professor', 4, ['scholar'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'shieldTypes' }, where: 'grid' }],
  scroll: [{ kind: 'per', points: 3, what: sh('scholar'), where: 'row' }],
})
card('castle', 'Queen Mother', 3, ['noble'], {
  purse: true,
  onBuy: [{ kind: 'fillPurses', amount: 2 }],
  scroll: [...purseScroll],
})
card('castle', 'Royal Guard', 4, ['military', 'noble'], {
  onBuy: [{ kind: 'keys', amount: 1 }, { kind: 'eachOpponentKeys', amount: 1 }],
  scroll: [{ kind: 'per', points: 3, what: sh('noble'), where: 'col' }],
})
card('castle', 'Scribe', 4, ['faith'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: sh('faith'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 3, what: sh('scholar'), where: 'rowcol' }],
})
card('castle', 'Steward', 0, ['noble'], {
  purse: true,
  onBuy: [{ kind: 'fillTwoPurses' }],
  scroll: [...purseScroll],
})
card('castle', 'Templar', 5, ['military', 'faith'], {
  onBuy: [
    { kind: 'oppGoldPer', amount: 1, what: sh('faith') },
    { kind: 'keysPer', amount: 1, what: sh('military'), where: 'grid' },
  ],
  scroll: [{ kind: 'per', points: 1, what: { count: 'keys' }, where: 'grid' }],
})
card('castle', 'Jester', 3, ['noble'], {
  onBuy: [{ kind: 'goldPer', amount: 2, what: sh('noble'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 2, what: sh('noble'), where: 'rowcol' }],
})
card('castle', 'Gravedigger', 4, ['faith', 'scholar'], {
  purse: true,
  onBuy: [{ kind: 'discardRow', row: 'village', gain: 'gold' }],
  scroll: [...purseScroll],
})
card('castle', 'Guildmaster', 5, ['crafts'], {
  onBuy: [{ kind: 'discardRow', row: 'village', gain: 'keys' }],
  scroll: [{ kind: 'position', at: 'bottom', points: 5 }],
})

/* ================= VILLAGE (brown), ids 100.. ================= */

card('village', 'Armorer', 3, ['crafts'], {
  banner: 'all',
  scroll: [{ kind: 'per', points: 3, what: sh('military'), where: 'rowcol' }],
})
card('village', 'Baker', 0, ['peasant'], {
  onBuy: [
    { kind: 'goldPer', amount: 1, what: sh('peasant'), where: 'grid' },
    { kind: 'keysPer', amount: 1, what: { count: 'cards', deck: 'village' }, where: 'grid' },
  ],
  scroll: [{ kind: 'position', at: 'edge', points: 3 }],
})
card('village', 'Barbarian', 2, ['military'], {
  onBuy: [{ kind: 'choice', a: [{ kind: 'oppGoldPer', amount: 1, what: sh('scholar') }], b: [{ kind: 'keys', amount: 2 }] }],
  scroll: [{ kind: 'absent', what: sh('scholar'), where: 'grid', points: 10 }],
})
card('village', 'Beekeeper', 2, ['peasant', 'crafts'], {
  purse: true,
  onBuy: [{ kind: 'fillPurses', amount: 2 }],
  scroll: [...purseScroll],
})
card('village', 'Beggar', 0, ['peasant'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'cards' }, where: 'grid' }],
  scroll: [{ kind: 'per', points: 2, what: sh('faith'), where: 'rowcol' }],
})
card('village', 'Blacksmith', 5, ['military', 'crafts'], {
  onBuy: [{ kind: 'choice', a: [{ kind: 'oppGoldPer', amount: 1, what: sh('noble') }], b: [{ kind: 'keys', amount: 2 }] }],
  scroll: [{ kind: 'per', points: 2, what: { count: 'cards', shieldCount: 2 }, where: 'grid' }],
})
card('village', 'Bombardier', 2, ['military'], {
  onBuy: [{ kind: 'choice', a: [{ kind: 'oppGoldPer', amount: 1, what: sh('crafts') }], b: [{ kind: 'keys', amount: 2 }] }],
  scroll: [{ kind: 'per', points: 3, what: sh('military'), where: 'col' }],
})
card('village', 'Brigand', 7, ['peasant'], {
  onBuy: [{ kind: 'oppKeysPer', amount: 1, what: { count: 'cards', deck: 'castle' } }],
  scroll: [{ kind: 'per', points: 7, what: { count: 'cards', deck: 'village' }, where: 'grid', each: 3 }],
})
card('village', 'Carpenter', 0, ['crafts'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'missingShieldTypes' }, where: 'grid' }],
  scroll: [{ kind: 'threshold', what: { count: 'cards', faceDown: true }, where: 'grid', atLeast: 1, points: 8 }],
})
card('village', 'Clockmaker', 3, ['crafts'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: sh('crafts'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 3, what: sh('crafts'), where: 'row' }],
})
card('village', 'Doctor', 5, ['scholar'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: sh('scholar', 'peasant'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 4, what: { count: 'sets', shields: ['scholar', 'peasant'] }, where: 'grid' }],
})
card('village', 'Executioner', 0, ['military'], {
  onBuy: [{ kind: 'discardRow', row: 'castle', gain: 'gold' }],
  scroll: [{ kind: 'per', points: 1, what: { count: 'cards', deck: 'castle' }, where: 'grid' }],
})
card('village', 'Farmer', 5, ['peasant'], {
  onBuy: [{ kind: 'keysPer', amount: 1, what: sh('peasant'), where: 'grid' }],
  scroll: [{ kind: 'position', at: 'bottom', points: 7 }],
})
card('village', 'Farmhand', 0, ['peasant'], {
  banner: 'village',
  purse: true,
  scroll: [...purseScroll],
})
card('village', 'Fisherman', 2, ['peasant', 'military'], {
  banner: 'castle',
  messenger: true, // icon confirmed in card photo
  scroll: [{ kind: 'position', at: 'corner', points: 4 }],
})
card('village', 'Innkeeper', 0, ['crafts'], {
  purse: true,
  onBuy: [{ kind: 'fillPurses', amount: 2 }, { kind: 'eachOpponentGold', amount: 2 }],
  scroll: [...purseScroll],
})
card('village', 'Inventor', 2, ['scholar'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: sh('scholar'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 1, what: { count: 'cards', deck: 'village' }, where: 'grid' }],
})
card('village', 'Master at Arms', 2, ['military'], {
  purse: true,
  onBuy: [{ kind: 'goldPer', amount: 1, what: sh('military'), where: 'grid' }],
  scroll: [...purseScroll],
})
card('village', 'Mercenary', 6, ['faith', 'military'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'shieldTypes' }, where: 'grid' }],
  scroll: [{ kind: 'per', points: 7, what: { count: 'sets', shields: ['faith', 'military', 'peasant'] }, where: 'grid' }],
})
card('village', 'Militiaman', 2, ['military'], {
  onBuy: [{ kind: 'choice', a: [{ kind: 'oppGoldPer', amount: 1, what: sh('peasant') }], b: [{ kind: 'keys', amount: 2 }] }],
  scroll: [{ kind: 'per', points: 3, what: sh('military'), where: 'row' }],
})
card('village', 'Nun', 3, ['faith'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'cards', deck: 'castle' }, where: 'grid' }],
  scroll: [{ kind: 'per', points: 3, what: sh('faith'), where: 'col' }],
})
card('village', 'Philosopher', 2, ['scholar'], {
  banner: 'castle',
  scroll: [{ kind: 'absent', what: sh('military'), where: 'grid', points: 10 }],
})
card('village', 'Potter', 2, ['crafts'], {
  purse: true,
  onBuy: [{ kind: 'fillPurses', amount: 2 }],
  scroll: [...purseScroll],
})
card('village', 'Revolutionary', 4, ['peasant'], {
  onBuy: [{ kind: 'keysPer', amount: 1, what: { count: 'cards', deck: 'village' }, where: 'grid' }],
  scroll: [{ kind: 'absent', what: sh('noble'), where: 'grid', points: 9 }],
})
card('village', 'Sculptor', 3, ['faith', 'crafts'], {
  purse: true,
  onBuy: [{ kind: 'keysPer', amount: 1, what: sh('faith'), where: 'grid' }],
  scroll: [...purseScroll],
})
card('village', 'Shepherd', 5, ['peasant'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'emptySpaces' }, where: 'grid' }],
  scroll: [{ kind: 'per', points: 3, what: sh('peasant'), where: 'row' }],
})
card('village', 'Spice Merchant', 0, ['crafts'], {
  onBuy: [{ kind: 'goldPer', amount: 2, what: sh('crafts'), where: 'grid' }],
  scroll: [{ kind: 'position', at: 'middleRow', points: 5 }],
})
card('village', 'Spy', 4, ['scholar', 'military'], {
  onBuy: [
    { kind: 'goldPer', amount: 1, what: sh('scholar'), where: 'grid' },
    { kind: 'oppKeysPer', amount: 1, what: sh('military') },
  ],
  scroll: [{ kind: 'position', at: 'middleCol', points: 6 }],
})
card('village', 'Squire', 0, ['military'], {
  banner: 'all',
  scroll: [{ kind: 'per', points: 2, what: sh('crafts'), where: 'rowcol' }],
})
card('village', 'Stable Boy', 4, ['peasant', 'noble'], {
  onBuy: [{ kind: 'keysPer', amount: 1, what: sh('noble'), where: 'grid' }],
  scroll: [{ kind: 'per', points: 3, what: sh('peasant'), where: 'col' }],
})
card('village', 'Stonemason', 3, ['crafts'], {
  banner: 'village',
  scroll: [{ kind: 'per', points: 3, what: sh('crafts'), where: 'col' }],
})
card('village', 'Traveler', 0, ['peasant'], {
  onBuy: [{ kind: 'goldPer', amount: 3, what: { count: 'cards', cost: 0 }, where: 'grid' }],
  scroll: [{ kind: 'per', points: 2, what: { count: 'cards', cost: 0 }, where: 'grid' }],
})
card('village', 'Usurper', 5, ['peasant'], {
  onBuy: [{ kind: 'keysPer', amount: 1, what: { count: 'cards', shieldCount: 1 }, where: 'grid' }],
  scroll: [{ kind: 'per', points: 2, what: { count: 'cards', deck: 'castle' }, where: 'grid' }],
})
card('village', 'Vicar', 0, ['faith'], {
  purse: true,
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'cards', deck: 'village' }, where: 'grid' }],
  scroll: [...purseScroll],
})
card('village', 'Winemaker', 2, ['peasant', 'crafts'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'cards', deck: 'village' }, where: 'grid' }],
  scroll: [{ kind: 'per', points: 2, what: { count: 'shieldTypes' }, where: 'col' }],
})
card('village', 'Witch', 4, ['peasant'], {
  onBuy: [
    { kind: 'goldPer', amount: 1, what: sh('peasant'), where: 'grid' },
    { kind: 'oppKeysPer', amount: 1, what: sh('faith') },
  ],
  scroll: [{ kind: 'absent', what: sh('faith'), where: 'grid', points: 9 }],
})
card('village', 'Woodcutter', 0, ['peasant'], {
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'cards' }, where: 'grid' }],
  scroll: [{ kind: 'position', at: 'right', points: 5 }],
})
card('village', 'Miraculously Cured', 2, ['faith'], {
  purse: true,
  onBuy: [{ kind: 'keysPer', amount: 1, what: { count: 'cards', hasPurse: true }, where: 'grid' }],
  scroll: [...purseScroll],
})
card('village', 'Judge', 4, ['scholar'], {
  onBuy: [{ kind: 'keys', amount: 2 }],
  scroll: [{ kind: 'per', points: 3, what: { count: 'deckPairs' }, where: 'grid' }],
})

/**
 * RL-12: 19 cards per deck carry the messenger icon (BGG-sourced count),
 * but the per-card assignment is only confirmed for a handful. Fill the
 * remainder provisionally and deterministically (every other card) so the
 * game FLOW is faithful even while the exact assignment isn't.
 */
const MESSENGERS_PER_DECK = 19
for (const deck of ['castle', 'village'] as const) {
  const cards = defs.filter((c) => c.deck === deck)
  let n = cards.filter((c) => c.messenger).length
  for (let i = 0; i < cards.length && n < MESSENGERS_PER_DECK; i += 1) {
    const c = cards[i]
    if (!c.messenger && i % 2 === 0) {
      c.messenger = true
      n++
    }
  }
  for (const c of cards) {
    if (n >= MESSENGERS_PER_DECK) break
    if (!c.messenger) {
      c.messenger = true
      n++
    }
  }
}

export const CARDS: readonly CardDef[] = defs

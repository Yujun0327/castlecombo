import type { CardDef, Deck, Shield } from '../engine/types'

/**
 * PROVISIONAL CATALOG — ruling RL-1.
 *
 * A shape- and difficulty-representative stand-in until the real roster is
 * transcribed and double-sourced (BGG card-list threads + the circulated
 * "Chateau Combo Card Roster"). Ids are stable: castle 0.., village 100..
 * Swapping in the real data touches only this file; bump `rulesVersion`.
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

/* --- castle (grey): nobles, clergy, officials — pricier, positional --- */

card('castle', 'The Queen', 8, ['or', 'gules'], {
  scroll: [{ kind: 'position', at: 'center', points: 8 }],
})
card('castle', 'The Chancellor', 6, ['sable'], {
  scroll: [{ kind: 'per', points: 2, what: { count: 'shields', shields: ['sable'] }, where: 'grid' }],
})
card('castle', 'The Bishop', 5, ['azure'], {
  messenger: 'village',
  scroll: [{ kind: 'per', points: 2, what: { count: 'shields', shields: ['azure'] }, where: 'col' }],
})
card('castle', 'The Treasurer', 7, ['or'], {
  purse: 8,
  scroll: [{ kind: 'per', points: 1, what: { count: 'goldOnThisPurse' }, where: 'grid' }],
})
card('castle', 'The Marshal', 6, ['gules', 'gules'], {
  onBuy: [{ kind: 'goldPer', amount: 2, what: { count: 'shields', shields: ['gules'] }, where: 'grid' }],
  scroll: [{ kind: 'flat', points: 4 }],
})
card('castle', 'The Diplomat', 5, ['argent'], {
  discount: { amount: 1, what: { count: 'shields', shields: ['argent'] }, where: 'grid' },
  scroll: [{ kind: 'flat', points: 5 }],
})
card('castle', 'The Astronomer', 4, ['vert'], {
  scroll: [{ kind: 'per', points: 1, what: { count: 'keys' }, where: 'grid' }],
})
card('castle', 'The Duchess', 7, ['or', 'argent'], {
  scroll: [{ kind: 'per', points: 3, what: { count: 'cards', deck: 'castle' }, where: 'row' }],
})
card('castle', 'The Judge', 6, ['sable', 'argent'], {
  scroll: [{ kind: 'threshold', what: { count: 'shields', shields: ['sable'] }, where: 'grid', atLeast: 3, points: 8 }],
})
card('castle', 'The Herald', 3, ['azure'], {
  messenger: 'castle',
  onBuy: [{ kind: 'keys', amount: 1 }],
  scroll: [{ kind: 'per', points: 2, what: { count: 'cards', faceDown: true }, where: 'grid' }],
})
card('castle', 'The Chamberlain', 5, ['or'], {
  scroll: [{ kind: 'per', points: 1, what: { count: 'shieldSets' }, where: 'grid' }],
})
card('castle', 'The Tax Collector', 4, ['sable'], {
  onBuy: [
    { kind: 'eachOpponentGold', amount: -1 },
    { kind: 'goldPerOpponent', amount: 1 },
  ],
  scroll: [{ kind: 'flat', points: 3 }],
})

/* --- village (brown): tradespeople — cheaper, synergy-driven --- */

card('village', 'The Blacksmith', 4, ['gules'], {
  onBuy: [{ kind: 'gold', amount: 2 }],
  scroll: [{ kind: 'per', points: 2, what: { count: 'shields', shields: ['gules'] }, where: 'adjacent' }],
})
card('village', 'The Miller', 3, ['vert'], {
  scroll: [{ kind: 'per', points: 2, what: { count: 'shields', shields: ['vert'] }, where: 'row' }],
})
card('village', 'The Innkeeper', 4, ['or'], {
  purse: 6,
  scroll: [{ kind: 'per', points: 2, what: { count: 'goldOnThisPurse' }, where: 'grid' }],
})
card('village', 'The Beggar', 0, [], {
  scroll: [{ kind: 'position', at: 'corner', points: 4 }],
})
card('village', 'The Carpenter', 3, ['vert'], {
  messenger: 'castle',
  scroll: [{ kind: 'per', points: 2, what: { count: 'cards', deck: 'village' }, where: 'col' }],
})
card('village', 'The Fishwife', 2, ['azure'], {
  onBuy: [{ kind: 'keys', amount: 1 }],
  scroll: [{ kind: 'position', at: 'edge', points: 3 }],
})
card('village', 'The Mason', 5, ['sable'], {
  discount: { amount: 2, what: { count: 'cards', deck: 'castle' }, where: 'grid' },
  scroll: [{ kind: 'flat', points: 4 }],
})
card('village', 'The Shepherd', 2, ['vert', 'vert'], {
  scroll: [{ kind: 'per', points: 1, what: { count: 'shields', shields: ['vert'] }, where: 'grid' }],
})
card('village', 'The Moneylender', 6, ['or', 'sable'], {
  purse: 10,
  scroll: [{ kind: 'per', points: 1, what: { count: 'goldOnThisPurse' }, where: 'grid' }],
})
card('village', 'The Gravedigger', 1, ['sable'], {
  scroll: [{ kind: 'per', points: 3, what: { count: 'cards', faceDown: true }, where: 'adjacent' }],
})
card('village', 'The Weaver', 3, ['argent'], {
  scroll: [{ kind: 'threshold', what: { count: 'cards', hasPurse: true }, where: 'grid', atLeast: 2, points: 6 }],
})
card('village', 'The Smuggler', 4, ['sable', 'azure'], {
  messenger: 'village',
  onBuy: [{ kind: 'goldPer', amount: 1, what: { count: 'cards', faceDown: true }, where: 'grid' }],
  scroll: [{ kind: 'flat', points: 2 }],
})

/* --- pad each deck to a plausible size with simple variations --- */

const FILLER_SHIELDS: Shield[][] = [['gules'], ['azure'], ['vert'], ['or'], ['sable'], ['argent']]
for (const deck of ['castle', 'village'] as const) {
  const base = deck === 'castle' ? 4 : 2
  for (let i = 0; defs.filter((c) => c.deck === deck).length < 30; i++) {
    const shields = FILLER_SHIELDS[i % FILLER_SHIELDS.length]
    card(deck, `${deck === 'castle' ? 'Courtier' : 'Villager'} ${i + 1}`, base + (i % 4), shields, {
      ...(i % 5 === 0 ? { messenger: (deck === 'castle' ? 'village' : 'castle') as Deck } : {}),
      scroll: [
        {
          kind: 'per',
          points: 2,
          what: { count: 'shields', shields },
          where: (['grid', 'row', 'col', 'adjacent'] as const)[i % 4],
        },
      ],
    })
  }
}

export const CARDS: readonly CardDef[] = defs

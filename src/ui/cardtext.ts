import type { Countable, Effect, Scoring, Where } from '../engine'

/**
 * Turns the card DSL (Effect[] / Scoring[]) into short English lines for
 * card faces and the card sheet. Pure string work — never evaluates rules.
 */

const pl = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many)

function wherePhrase(where: Where): string {
  switch (where) {
    case 'grid':
      return 'in your kingdom'
    case 'row':
      return 'in this row'
    case 'col':
      return 'in this column'
    case 'rowcol':
      return 'in this row or column'
    case 'adjacent':
      return 'adjacent to this card'
  }
}

/** The countable as a noun phrase; `n` picks singular/plural. */
export function countableText(what: Countable, n = 1): string {
  switch (what.count) {
    case 'shields':
      return `${what.shields.join(' or ')} ${pl(n, 'shield')}`
    case 'cards': {
      const parts: string[] = []
      if (what.faceDown === true) parts.push('face-down')
      if (what.faceDown === false) parts.push('face-up')
      if (what.deck !== undefined) parts.push(what.deck)
      if (what.cost !== undefined) parts.push(`cost-${what.cost}`)
      if (what.costAtLeast !== undefined) parts.push(`cost-${what.costAtLeast}-or-more`)
      if (what.shieldCount === 1) parts.push('single-shield')
      if (what.shieldCount === 2) parts.push('two-shield')
      if (what.hasBanner !== undefined) parts.push(what.hasBanner ? 'banner' : 'bannerless')
      if (what.hasPurse !== undefined) parts.push(what.hasPurse ? 'purse' : 'purseless')
      return [...parts, pl(n, 'card')].join(' ')
    }
    case 'keys':
      return `${pl(n, 'key')} you hold`
    case 'goldOnThisPurse':
      return `gold ${pl(n, 'coin')} in this purse`
    case 'goldOnPurses':
      return `gold ${pl(n, 'coin')} on your purses`
    case 'shieldTypes':
      return `shield ${pl(n, 'type')} present`
    case 'missingShieldTypes':
      return `missing shield ${pl(n, 'type')}`
    case 'sets':
      return `${what.shields.join(' + ')} ${pl(n, 'set')}`
    case 'sameShieldTriplets':
      return `${pl(n, 'trio')} of a same shield`
    case 'deckPairs':
      return `castle + village ${pl(n, 'pair')}`
    case 'emptySpaces':
      return `empty ${pl(n, 'space')}`
  }
}

/** Self-scoped countables read badly with an "in your kingdom" tail. */
function perPhrase(what: Countable, where: Where, n = 1): string {
  const noun = countableText(what, n)
  if (what.count === 'keys' || what.count === 'goldOnThisPurse' || what.count === 'goldOnPurses') {
    return noun
  }
  return `${noun} ${wherePhrase(where)}`
}

const gold = (n: number) => `${n} gold`
const keys = (n: number) => `${n} ${pl(n, 'key')}`

/** One immediate effect as a compact line. */
export function effectText(fx: Effect): string {
  switch (fx.kind) {
    case 'gold':
      return `+${gold(fx.amount)}`
    case 'keys':
      return `+${keys(fx.amount)}`
    case 'goldPer':
      return `+${fx.amount} gold per ${perPhrase(fx.what, fx.where)}`
    case 'keysPer':
      return `+${fx.amount} ${pl(fx.amount, 'key')} per ${perPhrase(fx.what, fx.where)}`
    case 'oppGoldPer':
      return `+${fx.amount} gold per ${countableText(fx.what)} in a neighbour's kingdom`
    case 'oppKeysPer':
      return `+${fx.amount} ${pl(fx.amount, 'key')} per ${countableText(fx.what)} in a neighbour's kingdom`
    case 'eachOpponentGold':
      return `every opponent gains ${gold(fx.amount)}`
    case 'eachOpponentKeys':
      return `every opponent gains ${keys(fx.amount)}`
    case 'choice':
      return `either ${effectList(fx.a)} — or ${effectList(fx.b)}`
    case 'fillPurses':
      return `put ${fx.amount} gold from the supply on each of your purses`
    case 'fillTwoPurses':
      return 'fill your two best purses to the brim'
    case 'discardRow':
      return `discard a card from the ${fx.row} row: gain its cost in ${fx.gain === 'gold' ? 'gold' : 'keys'}`
  }
}

/** A branch of effects joined into one clause. */
export function effectList(effects: readonly Effect[]): string {
  return effects.map(effectText).join(', then ')
}

export function effectLines(effects: readonly Effect[]): string[] {
  return effects.map(effectText)
}

const pts = (n: number) => `${n} ${pl(n, 'pt')}`

function positionPhrase(at: Extract<Scoring, { kind: 'position' }>['at']): string {
  switch (at) {
    case 'top':
      return 'the top row'
    case 'bottom':
      return 'the bottom row'
    case 'left':
      return 'the left column'
    case 'right':
      return 'the right column'
    case 'middleRow':
      return 'the middle row'
    case 'middleCol':
      return 'the middle column'
    case 'corner':
      return 'a corner'
    case 'edge':
      return 'an edge, not a corner'
    case 'center':
      return 'the center'
  }
}

/** One scroll scoring entry as a compact line. */
export function scrollText(entry: Scoring): string {
  switch (entry.kind) {
    case 'flat':
      return pts(entry.points)
    case 'per': {
      const each = entry.each ?? 1
      const unit = each === 1 ? perPhrase(entry.what, entry.where) : `${each} ${perPhrase(entry.what, entry.where, each)}`
      const cap = entry.cap !== undefined ? ` (at most ${pts(entry.points * entry.cap)})` : ''
      return `${pts(entry.points)} per ${unit}${cap}`
    }
    case 'position':
      return `${pts(entry.points)} if this card sits in ${positionPhrase(entry.at)}`
    case 'threshold':
      return `${pts(entry.points)} with ${entry.atLeast} or more ${perPhrase(entry.what, entry.where, entry.atLeast)}`
    case 'absent':
      return `${pts(entry.points)} if no ${perPhrase(entry.what, entry.where)}`
  }
}

export function scrollLines(scroll: readonly Scoring[]): string[] {
  return scroll.map(scrollText)
}

/** Which small icon leads an effect line on the card face. */
export function effectIcon(fx: Effect): 'coin' | 'key' {
  switch (fx.kind) {
    case 'keys':
    case 'keysPer':
    case 'oppKeysPer':
    case 'eachOpponentKeys':
      return 'key'
    case 'choice':
      return [...fx.a, ...fx.b].some((f) => effectIcon(f) === 'coin') ? 'coin' : 'key'
    case 'discardRow':
      return fx.gain === 'gold' ? 'coin' : 'key'
    default:
      return 'coin'
  }
}

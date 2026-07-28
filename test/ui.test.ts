// @vitest-environment jsdom
import { flushSync, mount, unmount } from 'svelte'
import { describe, expect, it } from 'vitest'
import { CARDS } from '../src/data'
import { HotseatSession } from '../src/app/session.svelte'
import type { Gem } from '../src/engine'
import GameScreen from '../src/ui/GameScreen.svelte'
import Home from '../src/ui/Home.svelte'

// jsdom has no Web Animations API; give Svelte transitions an instantly-
// finishing stand-in so intros/outros complete synchronously.
if (!Element.prototype.animate) {
  Element.prototype.animate = function () {
    const anim = {
      cancel() {},
      finish() {},
      finished: Promise.resolve(),
      set onfinish(fn: (() => void) | null) {
        fn?.()
      },
    }
    return anim as unknown as Animation
  }
}

function render(component: Parameters<typeof mount>[0], props: Record<string, unknown>) {
  const target = document.createElement('div')
  document.body.appendChild(target)
  const instance = mount(component, { target, props })
  flushSync()
  return {
    target,
    cleanup: () => {
      unmount(instance)
      target.remove()
    },
  }
}

describe('Home', () => {
  it('renders the hotseat setup and starts a game', () => {
    let started: { count: number; names: string[] } | null = null
    const { target, cleanup } = render(Home, {
      onHotseat: (count: number, names: string[]) => (started = { count, names }),
    })
    expect(target.textContent).toContain('Castle Combo')

    const begin = [...target.querySelectorAll('button')].find((b) => b.textContent!.includes('Begin'))!
    begin.click()
    flushSync()
    expect(started).toMatchObject({ count: 2 })
    cleanup()
  })
})

describe('GameScreen (hotseat)', () => {
  it('renders the full table and plays a token take', () => {
    const session = new HotseatSession(3, ['Ana', 'Bo', 'Cy'])
    const { target, cleanup } = render(GameScreen, {
      session,
      onExit: () => {},
      onRematch: () => {},
    })

    // table anatomy: 4 nobles, 12 market cards + 3 decks, 6 bank chips
    expect(target.textContent).toContain('to play')
    expect(target.querySelectorAll('.noble').length).toBe(4)
    expect(target.querySelectorAll('.slot').length).toBe(12)
    expect(target.querySelectorAll('.deck').length).toBe(3)

    // tap three bank chips and confirm the take
    const actorBefore = session.actor
    const chip = (label: string) =>
      [...target.querySelectorAll('button')].find((b) =>
        b.getAttribute('aria-label')?.startsWith(label),
      )!
    chip('take ruby').click()
    flushSync()
    chip('take onyx').click()
    flushSync()
    chip('take emerald').click()
    flushSync()
    const confirm = [...target.querySelectorAll('button')].find((b) => b.textContent!.includes('Take'))!
    confirm.click()
    flushSync()

    expect(session.state.players[actorBefore].tokens.ruby).toBe(1)
    expect(session.actor).not.toBe(actorBefore)
    cleanup()
  })

  it('purchases a card through the action sheet', () => {
    const session = new HotseatSession(2, ['Ana', 'Bo'])
    // bankroll the actor for the first tier-1 card so Purchase is live
    const id = session.state.market[0][0]!
    const def = CARDS.find((c) => c.id === id)!
    const actor = session.actor
    for (const [gem, n] of Object.entries(def.cost)) {
      session.state.players[actor].tokens[gem as Gem] += n!
      session.state.bank[gem as Gem] -= n!
    }
    const { target, cleanup } = render(GameScreen, {
      session,
      onExit: () => {},
      onRematch: () => {},
    })

    const slot = [...target.querySelectorAll('button.slot')].find(
      (b) => b.getAttribute('aria-label') === 'tier 1 card',
    ) as HTMLButtonElement
    slot.click()
    flushSync()
    const buy = [...document.querySelectorAll('button')].find((b) =>
      b.textContent!.trim().startsWith('Purchase'),
    )!
    expect(buy.disabled).toBe(false)
    buy.click()
    flushSync()

    expect(session.state.players[actor].cards).toContain(id)
    expect(session.state.market[0][0]).not.toBe(id) // slot refilled
    expect(document.querySelector('.backdrop')).toBe(null)
    cleanup()
  })

  it('reserves a market card through the action sheet', () => {
    const session = new HotseatSession(2, ['Ana', 'Bo'])
    const { target, cleanup } = render(GameScreen, {
      session,
      onExit: () => {},
      onRematch: () => {},
    })

    const actor = session.actor
    ;(target.querySelector('.slot') as HTMLButtonElement).click()
    flushSync()
    const reserveBtn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent!.trim().startsWith('Reserve'),
    )!
    reserveBtn.click()
    flushSync()

    expect(session.state.players[actor].reserved.length).toBe(1)
    expect(session.state.players[actor].tokens.gold).toBe(1)
    expect(document.querySelector('.backdrop')).toBe(null) // sheet closed
    cleanup()
  })
})

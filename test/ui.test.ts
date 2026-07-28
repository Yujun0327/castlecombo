// @vitest-environment jsdom
import { flushSync, mount, unmount } from 'svelte'
import { describe, expect, it } from 'vitest'
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

/**
 * Minimal smoke suite: the splendor-era game UI is being rewritten for
 * Castle Combo in M4, so only the Home screen is exercised here.
 */
describe('Home', () => {
  it('renders the title and starts a hotseat game', () => {
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

  it('offers the create/join room controls when online play is wired', () => {
    const { target, cleanup } = render(Home, {
      onHotseat: () => {},
      onCreateRoom: () => {},
      onJoinRoom: () => {},
    })

    const open = [...target.querySelectorAll('button')].find((b) =>
      b.textContent!.includes('Open a room'),
    ) as HTMLButtonElement
    expect(open).toBeDefined()
    expect(open.disabled).toBe(false)

    const code = target.querySelector('input[aria-label="room code"]') as HTMLInputElement
    expect(code).not.toBe(null)
    cleanup()
  })
})

describe('GameScreen (M4)', () => {
  // The table UI is still the splendor board; M4 must cover at minimum:
  it.todo('renders the full table: both market rows, messenger position, kingdoms')
  it.todo('buys a card and places it on a legal kingdom cell')
  it.todo('takes a card face-down for gold and keys')
  it.todo('spends a key to switch rows or refresh the market')
})

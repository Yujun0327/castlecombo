// @vitest-environment jsdom
import { flushSync, mount, unmount } from 'svelte'
import { describe, expect, it } from 'vitest'
import { BaseSession } from '../src/app/session.svelte'
import { createGame } from '../src/engine'
import type { GameConfig, Move, Seat } from '../src/engine'
import GameScreen from '../src/ui/GameScreen.svelte'
import Home from '../src/ui/Home.svelte'

// jsdom has no ResizeObserver; bind:clientWidth needs a quiet stand-in
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

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

/* ------------------------------------------------------------------ */
/* GameScreen: click-through against a deterministic local session     */
/* ------------------------------------------------------------------ */

/** Hotseat-style session with a FIXED seed so market rows are stable. */
class TestSession extends BaseSession {
  readonly mode = 'hotseat'

  constructor(seed = 7) {
    const cfg: GameConfig = {
      playerCount: 2,
      sharedSeed: seed,
      startingSeat: 0,
      names: ['Ana', 'Bo'],
      rulesVersion: '2',
    }
    super(cfg, createGame(cfg))
  }

  get mySeat(): Seat | null {
    return null
  }

  get viewer(): Seat | null {
    return this.actor
  }

  submit(move: Move): void {
    this.applyLocal(this.actor, move)
  }
}

function click(el: Element | null | undefined) {
  expect(el, 'expected element to click').toBeTruthy()
  ;(el as HTMLElement).click()
  flushSync()
}

const byText = (root: ParentNode, text: string) =>
  [...root.querySelectorAll('button')].find((b) => b.textContent!.includes(text))

function newScreen() {
  const session = new TestSession()
  const r = render(GameScreen, { session, onExit: () => {}, onRematch: () => {} })
  return { session, ...r }
}

/** Open the market sheet for the active row's slot (1-based aria index). */
function openSlot(target: HTMLElement, session: BaseSession, slot: number) {
  const deck = session.state.messenger
  click(target.querySelector(`button[aria-label^="${deck} slot ${slot + 1}:"]`))
}

/** In the open sheet: satisfy any printed decisions, then recruit. */
function recruitThroughSheet(target: HTMLElement) {
  const choice = target.querySelector('.choice-option')
  if (choice) click(choice)
  const discard = target.querySelector('.discard-option')
  if (discard) click(discard)
  const recruit = byText(target, 'Recruit') as HTMLButtonElement
  expect(recruit.disabled).toBe(false)
  click(recruit)
}

/** Tap the origin target cell and accept the inline confirm chip. */
function placeAtOrigin(target: HTMLElement) {
  click(target.querySelector('button[aria-label="place at 0, 0"]'))
  click(byText(target, 'Place here'))
}

describe('GameScreen (M4)', () => {
  it('renders the full table: both market rows, messenger position, kingdoms', () => {
    const { session, target, cleanup } = newScreen()

    // both ruled rows, three face-up entries each
    const castleRow = target.querySelector('[aria-label="castle row"]')!
    const villageRow = target.querySelector('[aria-label="village row"]')!
    expect(castleRow).not.toBe(null)
    expect(villageRow).not.toBe(null)
    expect(castleRow.querySelectorAll('[aria-label^="castle slot"]').length).toBe(3)
    expect(villageRow.querySelectorAll('[aria-label^="village slot"]').length).toBe(3)

    // the messenger starts beside the village row (RL-6)
    expect(session.state.messenger).toBe('village')
    expect(villageRow.querySelector('.pawn-slot')).not.toBe(null)
    expect(castleRow.querySelector('.pawn-slot')).toBe(null)

    // my kingdom page and the opponent's compact panel
    expect(target.querySelector('[aria-label="your kingdom"]')).not.toBe(null)
    expect(target.textContent).toContain('Bo')
    expect(target.textContent).toContain('Ana to play')
    cleanup()
  })

  it('buys a card and places it on a legal kingdom cell', () => {
    const { session, target, cleanup } = newScreen()
    const wanted = session.state.rows[session.state.messenger][0]!

    openSlot(target, session, 0)
    recruitThroughSheet(target)
    placeAtOrigin(target)

    const placed = session.state.players[0].placed
    expect(placed.length).toBe(1)
    expect(placed[0]).toMatchObject({ card: wanted, x: 0, y: 0, faceDown: false })
    expect(session.actor).toBe(1) // the turn passed
    cleanup()
  })

  it('takes a card face-down for gold and keys', () => {
    const { session, target, cleanup } = newScreen()

    openSlot(target, session, 1)
    click(byText(target, 'Take face-down'))
    placeAtOrigin(target)

    const p = session.state.players[0]
    expect(p.placed.length).toBe(1)
    expect(p.placed[0].faceDown).toBe(true)
    expect(p.gold).toBe(15 + 6)
    expect(p.keys).toBe(2 + 2)
    cleanup()
  })

  it('spends a key to switch rows or refresh the market', () => {
    const { session, target, cleanup } = newScreen()

    const move = () => target.querySelector('[aria-label="move the messenger"]') as HTMLButtonElement
    const redraw = () => target.querySelector('[aria-label="redraw the row"]') as HTMLButtonElement

    // both seals reflect myMoves(): legal on a fresh turn with 2 keys
    expect(move().disabled).toBe(false)
    expect(redraw().disabled).toBe(false)

    click(move())
    expect(session.state.messenger).toBe('castle')
    expect(session.state.keyUsedThisTurn).toBe(true)
    expect(session.state.players[0].keys).toBe(1)

    // one key per turn (R3.5): the seals — now beside the castle row — are dead
    expect(session.myMoves().some((m) => m.type === 'useKey')).toBe(false)
    expect(move().disabled).toBe(true)
    expect(redraw().disabled).toBe(true)
    cleanup()
  })
})

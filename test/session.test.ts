// @vitest-environment jsdom
import { flushSync, mount, unmount } from 'svelte'
import { beforeEach, describe, expect, it } from 'vitest'
import { OnlineSession } from '../src/app/session.svelte'
import { KINGDOM_CARDS, mulberry32, publicHash } from '../src/engine'
import type { Move } from '../src/engine'
import GameScreen from '../src/ui/GameScreen.svelte'
import { Mesh } from './mesh'
import PlayingProbe from './support/PlayingProbe.svelte'

// jsdom has no ResizeObserver; bind:clientWidth needs a quiet stand-in
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

// jsdom has no Web Animations API; Svelte transitions need a finishing stub
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

const ROOM = 'TESTROOM'

function addPeer(mesh: Mesh, i: number, creator = false): OnlineSession {
  const transport = mesh.createPeer(`peer-${i}`)
  const session = new OnlineSession(
    ROOM,
    creator,
    { key: `key-${i}`, name: `P${i}` },
    transport,
  )
  mesh.announce(`peer-${i}`)
  return session
}

/** Host + n-1 joiners through the full lobby handshake, everyone ready, deal. */
function startGame(mesh: Mesh, n: number): OnlineSession[] {
  const sessions = [addPeer(mesh, 0, true)]
  mesh.flush()
  for (let i = 1; i < n; i++) {
    sessions.push(addPeer(mesh, i))
    mesh.flush()
  }
  for (const s of sessions) {
    s.setReady(true)
    mesh.flush()
  }
  sessions[0].startGame()
  mesh.flush()
  return sessions
}

/**
 * First turn-ending move (buy/takeFacedown). `useKey` does NOT advance the
 * turn, so tests that need "one submit = one turn" must skip it.
 */
function firstTake(session: OnlineSession): Move {
  const move = session.myMoves().find((m) => m.type !== 'useKey')
  expect(move).toBeDefined()
  return move!
}

beforeEach(() => {
  localStorage.clear()
})

describe('lobby', () => {
  it('seats joiners in order and gates start on ready', () => {
    const mesh = new Mesh()
    const host = addPeer(mesh, 0, true)
    mesh.flush()
    const b = addPeer(mesh, 1)
    const c = addPeer(mesh, 2)
    mesh.flush()

    expect(host.seats.map((s) => s.name)).toEqual(['P0', 'P1', 'P2'])
    expect(b.seats.length).toBe(3) // roster broadcast reached joiners
    expect(host.canStart).toBe(false)

    host.setReady(true)
    b.setReady(true)
    c.setReady(true)
    mesh.flush()
    expect(host.canStart).toBe(true)

    host.startGame()
    mesh.flush()
    for (const s of [host, b, c]) {
      expect(s.playing).toBe(true)
      expect(s.cfg.playerCount).toBe(3)
    }
    expect([host.seat, b.seat, c.seat].sort()).toEqual([0, 1, 2])
    expect(publicHash(b.state)).toBe(publicHash(host.state))
  })

  it('renders the lobby→game transition reactively on every client', () => {
    // regression: `playing` short-circuits on `started`; if that field is not
    // reactive the template tracks nothing while false and never flips
    const mesh = new Mesh()
    const host = addPeer(mesh, 0, true)
    mesh.flush()
    const guest = addPeer(mesh, 1)
    mesh.flush()

    const targets = [host, guest].map((session) => {
      const target = document.createElement('div')
      document.body.appendChild(target)
      const instance = mount(PlayingProbe, { target, props: { session } })
      return { target, instance }
    })
    flushSync()
    expect(targets.map((t) => t.target.textContent)).toEqual(['LOBBY', 'LOBBY'])

    host.setReady(true)
    guest.setReady(true)
    mesh.flush()
    host.startGame()
    mesh.flush()
    flushSync()

    expect(targets.map((t) => t.target.textContent)).toEqual(['GAME', 'GAME'])
    for (const t of targets) {
      unmount(t.instance)
      t.target.remove()
    }
  })

  it('drops a departed seat so it cannot ghost-block the start', () => {
    const mesh = new Mesh()
    const host = addPeer(mesh, 0, true)
    mesh.flush()
    const b = addPeer(mesh, 1)
    const c = addPeer(mesh, 2)
    mesh.flush()
    for (const s of [host, b, c]) {
      s.setReady(true)
      mesh.flush()
    }
    expect(host.canStart).toBe(true)

    // c closes the tab without un-readying — the seat must vanish, not linger
    mesh.drop('peer-2')
    c.destroy()
    mesh.flush()
    expect(host.seats.length).toBe(2)
    expect(host.canStart).toBe(true)

    host.startGame()
    mesh.flush()
    expect(host.cfg.playerCount).toBe(2)
    expect(b.playing).toBe(true)
  })

  it('seats a ready claim that raced ahead of its hello', () => {
    const mesh = new Mesh()
    const host = addPeer(mesh, 0, true)
    mesh.flush()

    // the joiner's hello to the host is lost; only the host's hello arrives
    mesh.filter = (msg, from, to) => !(msg.t === 'hello' && from === 'peer-1' && to === 'peer-0')
    const guest = addPeer(mesh, 1)
    mesh.flush()
    expect(host.seats.length).toBe(1) // hello never landed

    mesh.filter = () => true
    guest.setReady(true) // claimSeat reaches the host and seats them
    mesh.flush()
    expect(host.seats.length).toBe(2)
    expect(host.seats[1]).toMatchObject({ playerKey: 'key-1', ready: true, connected: true })
  })

  it('turns a fifth arrival away', () => {
    const mesh = new Mesh()
    const sessions = [addPeer(mesh, 0, true)]
    mesh.flush()
    for (let i = 1; i < 5; i++) {
      sessions.push(addPeer(mesh, i))
      mesh.flush()
    }
    expect(sessions[4].status).toBe('room-full')
    expect(sessions[0].seats.length).toBe(4)
  })
})

describe('play across the mesh', () => {
  function playRandomGame(n: 2 | 3 | 4, seed: number) {
    const mesh = new Mesh()
    const sessions = startGame(mesh, n)
    const rng = mulberry32(seed)
    // each turn is ≤2 moves (optional key + exactly one take), 9 turns each
    const maxSteps = 2 * KINGDOM_CARDS * n + 8

    for (let step = 0; !sessions[0].state.result; step++) {
      expect(step).toBeLessThan(maxSteps)
      const current = sessions.find((s) => s.myTurn)!
      const moves = current.myMoves()
      expect(moves.length).toBeGreaterThan(0)
      current.submit(moves[Math.floor(rng() * moves.length)])
      mesh.flush()
    }

    const reference = publicHash(sessions[0].state)
    for (const s of sessions) {
      expect(s.state.result).not.toBe(null)
      expect(s.state.players.every((p) => p.placed.length === KINGDOM_CARDS)).toBe(true)
      expect(publicHash(s.state)).toBe(reference)
      expect(s.status).not.toBe('desync')
    }
  }

  it('2 peers finish a full random game in lockstep', () => playRandomGame(2, 10))
  it('3 peers finish a full random game in lockstep', () => playRandomGame(3, 11))
  it('4 peers finish a full random game in lockstep', () => playRandomGame(4, 12))

  it('recovers from a dropped move via resync', () => {
    const mesh = new Mesh()
    const sessions = startGame(mesh, 3)

    // the victim is the seat two turns away: not the current or the next actor,
    // so play can continue while it is behind (seat i belongs to peer-i)
    const firstActor = sessions[0].state.turn
    const victimSeat = (firstActor + 2) % 3
    const victim = sessions.find((s) => s.seat === victimSeat)!
    const reference = sessions.find((s) => s !== victim)!

    let dropped = false
    mesh.filter = (msg, _from, to) => {
      if (!dropped && msg.t === 'move' && to === `peer-${victimSeat}`) {
        dropped = true
        return false
      }
      return true
    }

    const first = sessions.find((s) => s.myTurn)!
    first.submit(firstTake(first))
    mesh.flush()
    expect(dropped).toBe(true)
    expect(publicHash(victim.state)).not.toBe(publicHash(reference.state)) // missed it

    // the next move arrives with a seq gap → the victim requests a resync
    const second = sessions.find((s) => s.myTurn)!
    second.submit(firstTake(second))
    mesh.flush()

    expect(publicHash(victim.state)).toBe(publicHash(reference.state))
    expect(victim.status).toBe('playing')
  })
})

describe('online play through the rendered UI (M4)', () => {
  function mountScreen(session: OnlineSession) {
    const target = document.createElement('div')
    document.body.appendChild(target)
    const instance = mount(GameScreen, {
      target,
      props: { session, onExit: () => {}, onRematch: () => {} },
    })
    flushSync()
    return {
      target,
      cleanup: () => {
        unmount(instance)
        target.remove()
      },
    }
  }

  function click(el: Element | null | undefined) {
    expect(el, 'expected element to click').toBeTruthy()
    ;(el as HTMLElement).click()
    flushSync()
  }

  const byText = (root: ParentNode, text: string) =>
    [...root.querySelectorAll('button')].find((b) => b.textContent!.includes(text))

  it('lets the acting player buy a card via clicks and syncs it to the peer', () => {
    const mesh = new Mesh()
    const sessions = startGame(mesh, 2)
    const acting = sessions.find((s) => s.myTurn)!
    const peer = sessions.find((s) => !s.myTurn)!
    const { target, cleanup } = mountScreen(acting)

    // tap the first entry of the messenger's row → the sheet opens
    const deck = acting.state.messenger
    click(target.querySelector(`button[aria-label^="${deck} slot 1:"]`))

    // satisfy any printed decisions the entry demands, then recruit
    const choice = target.querySelector('.choice-option')
    if (choice) click(choice)
    const discard = target.querySelector('.discard-option')
    if (discard) click(discard)
    const recruit = byText(target, 'Recruit') as HTMLButtonElement
    expect(recruit.disabled).toBe(false) // 15 starting gold covers any cost
    click(recruit)

    // first placement: the origin cell is washed gold — tap and confirm
    click(target.querySelector('button[aria-label="place at 0, 0"]'))
    click(byText(target, 'Place here'))
    mesh.flush()

    expect(acting.state.players[acting.seat!].placed.length).toBe(1)
    expect(acting.state.players[acting.seat!].placed[0].faceDown).toBe(false)
    expect(publicHash(peer.state)).toBe(publicHash(acting.state))
    cleanup()
  })

  it('lets the acting player spend a key (switch/refresh) via clicks', () => {
    const mesh = new Mesh()
    const sessions = startGame(mesh, 2)
    const acting = sessions.find((s) => s.myTurn)!
    const peer = sessions.find((s) => !s.myTurn)!
    const { target, cleanup } = mountScreen(acting)

    const seal = target.querySelector('[aria-label="move the messenger"]') as HTMLButtonElement
    expect(seal.disabled).toBe(false)
    const before = acting.state.messenger
    click(seal)
    mesh.flush()

    expect(acting.state.messenger).not.toBe(before)
    expect(acting.state.keyUsedThisTurn).toBe(true)
    expect(publicHash(peer.state)).toBe(publicHash(acting.state))

    // one key per turn: both seals go dead, exactly like myMoves() says
    expect(acting.myMoves().some((m) => m.type === 'useKey')).toBe(false)
    expect(
      (target.querySelector('[aria-label="redraw the row"]') as HTMLButtonElement).disabled,
    ).toBe(true)
    cleanup()
  })

  it('tells the waiting player why the card actions are unavailable', () => {
    const mesh = new Mesh()
    const sessions = startGame(mesh, 2)
    const waiting = sessions.find((s) => !s.myTurn)!
    const actorName = waiting.names[waiting.state.turn]
    const { target, cleanup } = mountScreen(waiting)

    // every market entry is inert and the margin prose says whose turn it is
    const slots = [...target.querySelectorAll('button[aria-label*=" slot "]')]
    expect(slots.length).toBeGreaterThan(0)
    expect(slots.every((b) => (b as HTMLButtonElement).disabled)).toBe(true)
    expect(target.textContent).toContain(`Awaiting ${actorName}`)
    expect(target.textContent).toContain('the quill is theirs')

    // the wax seals are dead too — no useKey move exists for this seat
    expect(
      (target.querySelector('[aria-label="move the messenger"]') as HTMLButtonElement).disabled,
    ).toBe(true)
    cleanup()
  })
})

describe('reconnect and spectators', () => {
  it('replays from local storage and catches up over the wire', () => {
    const mesh = new Mesh()
    const sessions = startGame(mesh, 3)
    const lostSeat = sessions[2].seat

    // play a few turns, then peer-2 vanishes
    for (let i = 0; i < 3; i++) {
      const s = sessions.find((x) => x.myTurn)!
      s.submit(firstTake(s))
      mesh.flush()
    }
    mesh.drop('peer-2')
    sessions[2].destroy()
    mesh.flush()

    // two more turns happen while they are away
    for (let i = 0; i < 2; i++) {
      const s = sessions.slice(0, 2).find((x) => x.myTurn)
      if (!s) break // it may be the absent player's turn
      s.submit(firstTake(s))
      mesh.flush()
    }

    // same playerKey returns on a fresh transport: storage replay + resync
    const revived = addPeer(mesh, 2)
    expect(revived.playing).toBe(true) // restored from localStorage before any wire traffic
    mesh.flush()

    expect(revived.seat).toBe(lostSeat) // seat reclaimed
    expect(publicHash(revived.state)).toBe(publicHash(sessions[0].state))
  })

  it('recovers a mid-turn key spend from local storage and finishes the turn', () => {
    // M5 gate for two-move turns: refresh BETWEEN the useKey and the take
    const mesh = new Mesh()
    const sessions = startGame(mesh, 2)
    const actingIdx = sessions.findIndex((s) => s.myTurn)
    const acting = sessions[actingIdx]
    const other = sessions[1 - actingIdx]

    const useKey = acting.myMoves().find((m) => m.type === 'useKey')
    expect(useKey).toBeDefined() // everyone starts with 2 keys
    acting.submit(useKey!)
    mesh.flush()
    expect(acting.state.keyUsedThisTurn).toBe(true)
    expect(acting.myTurn).toBe(true) // still the same seat's turn
    expect(publicHash(other.state)).toBe(publicHash(acting.state))

    // the acting client's tab refreshes mid-turn: transport gone, then a new
    // session for the same playerKey reconstructs from localStorage
    mesh.drop(`peer-${actingIdx}`)
    acting.destroy()
    mesh.flush()
    const revived = addPeer(mesh, actingIdx)
    expect(revived.playing).toBe(true) // restored before any wire traffic
    expect(revived.myTurn).toBe(true)
    expect(revived.state.keyUsedThisTurn).toBe(true) // the key spend survived
    expect(revived.myMoves().some((m) => m.type === 'useKey')).toBe(false) // no second key
    mesh.flush()
    expect(publicHash(revived.state)).toBe(publicHash(other.state))

    // it can now finish the interrupted turn with the take
    revived.submit(firstTake(revived))
    mesh.flush()
    expect(revived.myTurn).toBe(false) // turn passed
    expect(publicHash(other.state)).toBe(publicHash(revived.state))
    expect(other.status).toBe('playing')
    expect(revived.status).toBe('playing')
  })

  it('marks the table as waiting when the acting player disconnects', () => {
    const mesh = new Mesh()
    const sessions = startGame(mesh, 2)
    const actingIdx = sessions.findIndex((s) => s.myTurn)
    const waitingIdx = 1 - actingIdx

    mesh.drop(`peer-${actingIdx}`)
    mesh.flush()
    expect(sessions[waitingIdx].waitingOn).toBe(`P${actingIdx}`)
  })

  it('gives a latecomer a spectator view of the running game', () => {
    const mesh = new Mesh()
    const sessions = startGame(mesh, 2)

    // the acting player takes a card face-down so a hidden-info placement exists
    const acting = sessions.find((s) => s.myTurn)!
    const facedown = acting.myMoves().find((m) => m.type === 'takeFacedown')!
    acting.submit(facedown)
    mesh.flush()

    const spec = addPeer(mesh, 7)
    mesh.flush()

    expect(spec.playing).toBe(true)
    expect(spec.spectator).toBe(true)
    expect(spec.myTurn).toBe(false)
    expect(spec.myMoves()).toEqual([])
    expect(publicHash(spec.state)).toBe(publicHash(sessions[0].state))
    // Castle Combo is open information — the spectator sees the whole table,
    // including the face-down placement (its flag, like everyone else's view)
    const placed = spec.visibleState.players[acting.seat!].placed
    expect(placed.length).toBe(1)
    expect(placed[0].faceDown).toBe(true)
  })
})

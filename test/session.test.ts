// @vitest-environment jsdom
import { flushSync, mount, unmount } from 'svelte'
import { beforeEach, describe, expect, it } from 'vitest'
import { OnlineSession } from '../src/app/session.svelte'
import { mulberry32, publicHash } from '../src/engine'
import type { Move } from '../src/engine'
import GameScreen from '../src/ui/GameScreen.svelte'
import { Mesh } from './mesh'
import PlayingProbe from './support/PlayingProbe.svelte'

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

    for (let step = 0; step < 4000 && !sessions[0].state.result; step++) {
      const current = sessions.find((s) => s.myTurn)!
      const moves = current.myMoves()
      expect(moves.length).toBeGreaterThan(0)
      const purchases = moves.filter((m) => m.type === 'purchase')
      const pool = purchases.length > 0 && rng() < 0.7 ? purchases : moves
      current.submit(pool[Math.floor(rng() * pool.length)] as Move)
      mesh.flush()
    }

    const reference = publicHash(sessions[0].state)
    for (const s of sessions) {
      expect(s.state.result).not.toBe(null)
      expect(publicHash(s.state)).toBe(reference)
      expect(s.status).not.toBe('desync')
    }
  }

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
    first.submit(first.myMoves()[0])
    mesh.flush()
    expect(dropped).toBe(true)
    expect(publicHash(victim.state)).not.toBe(publicHash(reference.state)) // missed it

    // the next move arrives with a seq gap → the victim requests a resync
    const second = sessions.find((s) => s.myTurn)!
    second.submit(second.myMoves()[0])
    mesh.flush()

    expect(publicHash(victim.state)).toBe(publicHash(reference.state))
    expect(victim.status).toBe('playing')
  })
})

describe('online play through the rendered UI', () => {
  function mountGame(session: OnlineSession) {
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
        document.querySelectorAll('.backdrop').forEach((n) => n.remove())
      },
    }
  }

  it('lets the acting player reserve via clicks and syncs it to the peer', () => {
    const mesh = new Mesh()
    const sessions = startGame(mesh, 2)
    const acting = sessions.find((s) => s.myTurn)!
    const other = sessions.find((s) => !s.myTurn)!
    const { target, cleanup } = mountGame(acting)

    const slot = [...target.querySelectorAll('button.slot')].find(
      (b) => b.getAttribute('aria-label') === 'tier 1 card',
    ) as HTMLButtonElement
    slot.click()
    flushSync()
    const reserveBtn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent!.trim().startsWith('Reserve'),
    )!
    expect(reserveBtn.disabled).toBe(false)
    reserveBtn.click()
    flushSync()
    mesh.flush()

    expect(acting.state.players[acting.seat!].reserved.length).toBe(1)
    expect(acting.state.players[acting.seat!].tokens.gold).toBe(1)
    expect(publicHash(other.state)).toBe(publicHash(acting.state)) // peer applied it
    cleanup()
  })

  it('tells the waiting player why the card actions are unavailable', () => {
    const mesh = new Mesh()
    const sessions = startGame(mesh, 2)
    const waiting = sessions.find((s) => !s.myTurn)!
    const { target, cleanup } = mountGame(waiting)

    const slot = [...target.querySelectorAll('button.slot')].find(
      (b) => b.getAttribute('aria-label') === 'tier 1 card',
    ) as HTMLButtonElement
    slot.click()
    flushSync()

    const buttons = [...document.querySelectorAll('button')]
    const buy = buttons.find((b) => b.textContent!.trim().startsWith('Purchase'))!
    const reserveBtn = buttons.find((b) => b.textContent!.trim().startsWith('Reserve'))!
    expect(buy.disabled).toBe(true)
    expect(reserveBtn.disabled).toBe(true)
    expect(document.body.textContent).toContain('to finish their turn')
    cleanup()
  })
})

describe('reconnect and spectators', () => {
  it('replays from local storage and catches up over the wire', () => {
    const mesh = new Mesh()
    const sessions = startGame(mesh, 3)
    const lostSeat = sessions[2].seat

    // play a few moves, then peer-2 vanishes
    for (let i = 0; i < 3; i++) {
      const s = sessions.find((x) => x.myTurn)!
      s.submit(s.myMoves()[0])
      mesh.flush()
    }
    mesh.drop('peer-2')
    sessions[2].destroy()
    mesh.flush()

    // two more moves happen while they are away
    for (let i = 0; i < 2; i++) {
      const s = sessions.slice(0, 2).find((x) => x.myTurn)
      if (!s) break // it may be the absent player's turn
      s.submit(s.myMoves()[0])
      mesh.flush()
    }

    // same playerKey returns on a fresh transport: storage replay + resync
    const revived = addPeer(mesh, 2)
    expect(revived.playing).toBe(true) // restored from localStorage before any wire traffic
    mesh.flush()

    expect(revived.seat).toBe(lostSeat) // seat reclaimed
    expect(publicHash(revived.state)).toBe(publicHash(sessions[0].state))
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

  it('gives a latecomer a spectator view, blind reserves hidden', () => {
    const mesh = new Mesh()
    const sessions = startGame(mesh, 2)

    // the acting player blind-reserves so there is something to hide
    const acting = sessions.find((s) => s.myTurn)!
    acting.submit({ type: 'reserve', from: { deck: 1 } })
    mesh.flush()

    const spec = addPeer(mesh, 7)
    mesh.flush()

    expect(spec.playing).toBe(true)
    expect(spec.spectator).toBe(true)
    expect(spec.myTurn).toBe(false)
    expect(spec.myMoves()).toEqual([])
    expect(publicHash(spec.state)).toBe(publicHash(sessions[0].state))
    const hidden = spec.visibleState.players[acting.seat!].reserved
    expect(hidden[0].card).toBe(-1) // masked for spectators
  })
})

// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { OnlineSession } from '../src/app/session.svelte'
import { publicHash } from '../src/engine'
import { Mesh } from './mesh'

const ROOM = 'DBGROOM'
function addPeer(mesh: Mesh, i: number, creator = false): OnlineSession {
  const t = mesh.createPeer(`peer-${i}`)
  const s = new OnlineSession(ROOM, creator, { key: `key-${i}`, name: `P${i}` }, t)
  mesh.announce(`peer-${i}`)
  return s
}
beforeEach(() => localStorage.clear())

describe('debug', () => {
  it('drop trace', () => {
    const mesh = new Mesh()
    const sessions = [addPeer(mesh, 0, true)]
    mesh.flush()
    sessions.push(addPeer(mesh, 1))
    mesh.flush()
    sessions.push(addPeer(mesh, 2))
    mesh.flush()
    for (const s of sessions) {
      s.setReady(true)
      mesh.flush()
    }
    sessions[0].startGame()
    mesh.flush()

    const firstActor = sessions[0].state.turn
    const victimSeat = (firstActor + 2) % 3
    console.log('firstActor', firstActor, 'victimSeat', victimSeat, 'seats', sessions.map((s) => s.seat))

    const seen: string[] = []
    let dropped = false
    mesh.filter = (msg, from, to) => {
      seen.push(`${msg.t} ${from}->${to}`)
      if (!dropped && msg.t === 'move' && to === `peer-${victimSeat}`) {
        dropped = true
        return false
      }
      return true
    }
    const first = sessions.find((s) => s.myTurn)!
    console.log('first seat', first.seat)
    // a turn-ending take (useKey would keep the turn on the same seat)
    first.submit(first.myMoves().find((m) => m.type !== 'useKey')!)
    mesh.flush()
    console.log('deliveries:', seen.join(' | '))
    console.log('hashes', sessions.map((s) => publicHash(s.state)))
    expect(true).toBe(true)
  })
})

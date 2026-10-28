import { type Readouts, readouts } from '@/lib/readouts'
import { act, advance, availableActions, load, turn } from '@/lib/sequence'
import { type Action, initialState, type SequenceState, type TurnAction } from '@/lib/steps'

/** Engine turns per second at full speed. */
const ENGINE_RATE = 1.2

/**
 * The live sequence: the pure state machine, ticked by the render loop. Parts
 * read it every frame (no React render); the overlay subscribes to its
 * changes (`version`) to redraw its hint and verdict.
 */
export function createSequenceStore() {
  let state: SequenceState = initialState
  let current: Readouts = readouts(state)
  /** The engine's turned angle, in radians, and the time since load. */
  let engineAngle = 0
  let time = 0
  const listeners = new Set<() => void>()
  /** Bumped on each change the overlay shows. */
  let version = 0
  const set = (next: SequenceState) => {
    // The overlay redraws on a new phase, a log in (it can then reset), or up the ladder.
    const changed =
      next.phase !== state.phase || next.logs.length !== state.logs.length || next.up !== state.up
    state = next
    current = readouts(state)
    if (changed) {
      version++
      listeners.forEach((listener) => listener())
    }
  }
  return {
    get readouts() {
      return current
    },
    get engineAngle() {
      return engineAngle
    },
    get time() {
      return time
    },
    get phase() {
      return state.phase
    },
    get version() {
      return version
    },
    actions: () => availableActions(state),
    can: (action: Action) => availableActions(state).includes(action),
    act: (action: Action) => set(act(state, action)),
    /** Log number `log` went into the stove. */
    load: (log: number) => set(load(state, log)),
    /** The visitor turned `action`'s handle by `turns`, counterclockwise positive. */
    turn: (action: TurnAction, turns: number) => set(turn(state, action, turns)),
    tick: (dt: number) => {
      // A tab left in the background comes back with a huge step: cap it.
      const step = Math.min(dt, 0.1)
      time += step
      engineAngle += current.engine * ENGINE_RATE * 2 * Math.PI * step
      set(advance(state, step))
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export type SequenceStore = ReturnType<typeof createSequenceStore>

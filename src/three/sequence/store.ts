import {
  act,
  advance,
  availableActions,
  initialState,
  readouts,
  turn,
  type Action,
  type Readouts,
  type SequenceState,
  type TurnAction,
} from '@/lib/sequence'

/** Engine turns per second at full speed. */
const ENGINE_RATE = 1.2

/**
 * The live sequence: the pure state machine, ticked by the render loop. Parts
 * read it every frame (no React render); the overlay subscribes to its phase
 * changes to redraw its buttons.
 */
export function createSequenceStore() {
  let state: SequenceState = initialState
  let current: Readouts = readouts(state)
  /** The engine's turned angle, in radians, and the time since load. */
  let engineAngle = 0
  let time = 0
  const listeners = new Set<() => void>()
  const set = (next: SequenceState) => {
    const changed = next.phase !== state.phase
    state = next
    current = readouts(state)
    if (changed) listeners.forEach((listener) => listener())
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
    actions: () => availableActions(state),
    can: (action: Action) => availableActions(state).includes(action),
    act: (action: Action) => set(act(state, action)),
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

/*
 * The film's sequence as a state machine: what the visitor's clicks set off,
 * how long each stage runs, and what the machine shows at any moment. Pure:
 * the 3D scene only reads `readouts` and sends `act`.
 *
 * 1. Opening the steam valve starts the engine: it spins up by fits, the
 *    machine starts to knock and shake, steam gushes out of the vent.
 * 2. Turning the crank ("hard left!") slides the sleeve along the coil.
 * 3. Cold vapor gushes from the duct; holding the basin under it, one ice
 *    cube drops into it.
 * 4. The tongs put the cube in Doc's glass of tea.
 */

type Phase = 'idle' | 'starting' | 'running' | 'cranking' | 'jet' | 'dropping' | 'caught' | 'served'

export type Action = 'openValve' | 'turnCrank' | 'holdBasin' | 'useTongs' | 'reset'

export interface SequenceState {
  phase: Phase
  /** Seconds spent in the current phase. */
  elapsed: number
}

/** How long the timed phases last, in seconds, and the phase each leads to. */
const TIMED: Partial<Record<Phase, { duration: number; next: Phase }>> = {
  starting: { duration: 3, next: 'running' },
  cranking: { duration: 4, next: 'jet' },
  dropping: { duration: 1.2, next: 'caught' },
}

/** What each click does, and in which phase it is allowed. */
const ON_ACTION: Record<Exclude<Action, 'reset'>, { from: Phase; to: Phase }> = {
  openValve: { from: 'idle', to: 'starting' },
  turnCrank: { from: 'running', to: 'cranking' },
  holdBasin: { from: 'jet', to: 'dropping' },
  useTongs: { from: 'caught', to: 'served' },
}

export const initialState: SequenceState = { phase: 'idle', elapsed: 0 }

/** The clicks that do something right now. */
export function availableActions(state: SequenceState): Action[] {
  const actions = (Object.keys(ON_ACTION) as (keyof typeof ON_ACTION)[]).filter(
    (action) => ON_ACTION[action].from === state.phase,
  )
  return state.phase === 'idle' ? actions : [...actions, 'reset']
}

/** The state after a click; unchanged when the click does nothing now. */
export function act(state: SequenceState, action: Action): SequenceState {
  if (action === 'reset') return initialState
  const step = ON_ACTION[action]
  return step.from === state.phase ? { phase: step.to, elapsed: 0 } : state
}

/** The state `dt` seconds later, moving on through any timed phases that end. */
export function advance(state: SequenceState, dt: number): SequenceState {
  let { phase, elapsed } = state
  elapsed += dt
  for (let timed = TIMED[phase]; timed && elapsed >= timed.duration; timed = TIMED[phase]) {
    elapsed -= timed.duration
    phase = timed.next
  }
  return { phase, elapsed }
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
/** How far through its timed phase the state is, 0 to 1. */
const progress = ({ phase, elapsed }: SequenceState) =>
  clamp01(elapsed / (TIMED[phase]?.duration ?? 1))
const ORDER: Phase[] = [
  'idle',
  'starting',
  'running',
  'cranking',
  'jet',
  'dropping',
  'caught',
  'served',
]
/** Whether the state has reached `phase` (or gone past it). */
const reached = (state: SequenceState, phase: Phase) =>
  ORDER.indexOf(state.phase) >= ORDER.indexOf(phase)

export interface Readouts {
  /** The engine's speed, 0 (still) to 1 (full): flywheel, belt, gears, bellows. */
  engine: number
  /** How hard the pipes knock and shake, 0 to 1. */
  shaking: number
  /** The gauges' pressure, 0 to 1. */
  pressure: number
  /** The steam plume at the vent, 0 to 1. */
  steam: number
  /** The sleeve along the coil, 0 (right, at rest) to 1 (hard left). */
  sleeve: number
  /** The cold vapor from the duct, 0 to 1. */
  coldJet: number
  /** Where the ice cube is; `fall` runs 0 to 1 from the duct's mouth to the basin. */
  cube: { where: 'none' | 'falling' | 'basin' | 'glass'; fall: number }
}

/** What the machine shows in a given state. */
export function readouts(state: SequenceState): Readouts {
  const p = progress(state)
  const { phase, elapsed } = state
  const starting = phase === 'starting'
  const coldJetEnd = phase === 'caught' ? clamp01(1 - elapsed / 1.5) : 0
  return {
    // The engine spins up by fits: two stalls on its way to full speed.
    engine: starting
      ? p * (0.7 + 0.3 * Math.abs(Math.cos(p * Math.PI * 2)))
      : reached(state, 'running')
        ? 1
        : 0,
    shaking: starting ? p : reached(state, 'running') ? (phase === 'served' ? 0.4 : 1) : 0,
    pressure: starting
      ? 0.6 * p
      : reached(state, 'cranking')
        ? 1
        : phase === 'running'
          ? 0.6 + 0.3 * clamp01(elapsed / 3)
          : 0,
    steam: starting ? p : reached(state, 'running') ? 1 : 0,
    sleeve: phase === 'cranking' ? p : reached(state, 'jet') ? 1 : 0,
    coldJet: phase === 'jet' ? clamp01(elapsed / 0.5) : phase === 'dropping' ? 1 : coldJetEnd,
    cube:
      phase === 'dropping'
        ? { where: 'falling', fall: p * p }
        : phase === 'caught'
          ? { where: 'basin', fall: 1 }
          : phase === 'served'
            ? { where: 'glass', fall: 1 }
            : { where: 'none', fall: 0 },
  }
}

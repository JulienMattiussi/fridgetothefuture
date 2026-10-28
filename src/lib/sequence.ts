/*
 * The film's sequence as a state machine: what the visitor's clicks and turns
 * set off, and how the timed stages run on. Pure: the 3D scene sends `act`,
 * `turn` and `load`, and reads what the machine shows (readouts.ts). The
 * steps themselves, and the state a run keeps, are in steps.ts.
 *
 * 1. Doc's three special logs go into the stove, one by one: the fire takes.
 * 2. The small valve low on the right is opened.
 * 3. Up the ladder, opening the valve on the vat's red cap starts the engine:
 *    it spins up by fits, the machine starts to knock and shake, steam gushes
 *    out of the vent.
 * 4. Turning the crank "hard left!" slides the sleeve along the coil.
 * 5. With the big copper valve open, pulling the big lever down lets the
 *    cold out: vapor gushes from the duct.
 * 6. The basin lifted up under it, the cold dies down; two seconds later one
 *    ice cube drops into it, and the basin goes back down on the bench with it.
 * 7. The tongs put the cube in Doc's glass of tea.
 *
 * Out of order, things go wrong. Some mistakes break the machine there and
 * then (`Failure`); others do nothing at the time but doom the run, which
 * then breaks down further on, at the latest when the cold should come.
 * Traps (the small handwheel by the gear train) only ever break it.
 */
import {
  type Action,
  ahead,
  type ClickAction,
  type Failure,
  initialState,
  isTrap,
  isTurn,
  isUp,
  ON_CLICK,
  ON_TURN,
  type Phase,
  type SequenceState,
  type StepTurn,
  STOVE_LOGS,
  TIMED,
  TRAPS,
  type TurnAction,
  turning,
} from '@/lib/steps'

/** Seconds per turn when a handle turns by itself. */
const AUTO_TURN = 0.5

const entries = <K extends string, V>(record: Record<K, V>) => Object.entries(record) as [K, V][]

/** The step handle the phase waits for, if it waits for one. */
const awaitedTurn = (phase: Phase) => entries(ON_TURN).find(([, step]) => step.from === phase)

/** Whether the step the phase waits for is the one `action` does. */
const awaits = (state: SequenceState, action: ClickAction | StepTurn) =>
  (isTurn(action) ? ON_TURN[action] : ON_CLICK[action]).from === state.phase

/**
 * The state entering `phase`, the run's logs and doom carried on; straight
 * on past it if its step was already done out of turn.
 */
function enter(state: SequenceState, phase: Phase): SequenceState {
  const next = { ...state, phase, elapsed: 0, worked: 0, auto: false, turning: null }
  // The lever already down: the cold comes straight out.
  if (phase === 'opened' && state.leverDown) return enter(next, 'jet')
  // The vat's valve already opened: no need to climb up to it any more.
  if (phase === 'primed' && state.opened.includes('openTopValve')) return enter(next, 'climbed')
  const awaited = awaitedTurn(phase)
  return awaited && state.opened.includes(awaited[0]) ? enter(next, awaited[1].to) : next
}

/** The run breaks down, there and then. */
const fail = (state: SequenceState, kind: Failure): SequenceState => ({
  ...enter(state, 'failed'),
  failure: { kind, during: state.phase },
})

/** A mistake that does nothing now, but dooms the run (the first one made counts). */
const doom = (state: SequenceState, kind: Failure): SequenceState => ({
  ...state,
  doom: state.doom ?? kind,
})

/** Whether a step is still to come and not done yet out of turn. */
function stillToCome(state: SequenceState, action: ClickAction | StepTurn) {
  const { from } = isTurn(action) ? ON_TURN[action] : ON_CLICK[action]
  if (!ahead(state, from)) return false
  switch (action) {
    // The vat's valve is reached only from up the ladder.
    case 'openTopValve':
      return false
    // The ladder, any time till that valve is open.
    case 'climbLadder':
      return !state.opened.includes('openTopValve')
    case 'pullLever':
      return !state.leverDown
    default:
      return !state.opened.includes(action as StepTurn)
  }
}

/**
 * The parts that can be worked right now, in turn or not: every step still
 * to come, and the traps (a run that ended takes none but `reset`).
 */
export function availableActions(state: SequenceState): Action[] {
  if (state.phase === 'served' || state.phase === 'failed') return ['reset']
  // Up the ladder, the vat's valve is all there is to work.
  if (isUp(state)) return ['openTopValve', 'reset']
  const steps = [...Object.keys(ON_CLICK), ...Object.keys(ON_TURN)] as (ClickAction | StepTurn)[]
  const actions: Action[] = [
    ...steps.filter((action) => stillToCome(state, action)),
    // The small valve, skipped, can still be opened late: to the boiler's ruin.
    ...(state.smallShut ? (['openSmallValve'] as const) : []),
    ...(Object.keys(TRAPS) as Action[]),
  ]
  const untouched = state.phase === 'idle' && state.logs.length === 0
  return untouched ? actions : [...actions, 'reset']
}

/**
 * The state after a click; unchanged when the click does nothing now. A step
 * handle "clicked" sets it turning by itself (for the end-to-end tests). Out
 * of turn, a click does nothing, but dooms the run.
 */
export function act(state: SequenceState, action: Action): SequenceState {
  if (action === 'reset') return initialState
  if (!availableActions(state).includes(action)) return state
  if (isTurn(action)) {
    return !isTrap(action) && awaits(state, action) ? { ...state, auto: true } : state
  }
  if (action === 'loadStove') return load(state, state.logs.length + 1)
  if (awaits(state, action)) return enter(state, ON_CLICK[action].to)
  // Up the ladder early: nothing wrong yet, but the only way down is the vat's valve.
  if (action === 'climbLadder') return { ...state, up: true }
  // The lever pulled early: it stays down, and the run is doomed.
  if (action === 'pullLever') return doom({ ...state, leverDown: true }, 'pipeBurst')
  return doom(state, 'pipeBurst')
}

/**
 * The state after log number `log` (1 to STOVE_LOGS) went into the stove.
 * Out of their order, the logs still burn, but the gauges will burst.
 */
export function load(state: SequenceState, log: number): SequenceState {
  if (state.phase !== 'idle' || state.logs.includes(log)) return state
  const logs = [...state.logs, log]
  const loaded = log === logs.length ? { ...state, logs } : doom({ ...state, logs }, 'gaugesBurst')
  return logs.length === STOVE_LOGS ? enter(loaded, 'stoking') : loaded
}

/**
 * The state after the visitor turned `action`'s handle by `turns`,
 * counterclockwise positive. Turning it the wrong way winds it back, never
 * past where it started; turned all the way, it takes effect.
 */
export function turn(state: SequenceState, action: TurnAction, turns: number): SequenceState {
  if (!availableActions(state).includes(action)) return state
  const inTurn = !isTrap(action) && awaits(state, action)
  // Another handle than the last one turned out of turn starts from nothing.
  const from = (inTurn && state.turning === null) || state.turning === action ? state.worked : 0
  const { turns: needed, way } = turning(action)
  const worked = Math.max(0, from + (turns * way) / needed)
  if (worked < 1) return { ...state, worked, turning: inTurn ? null : action }
  if (isTrap(action)) return fail(state, TRAPS[action].failure)
  return inTurn ? turned(state, action) : turnedOutOfTurn(state, action)
}

/** A step handle turned all the way, in its turn. */
function turned(state: SequenceState, action: StepTurn): SequenceState {
  // A doomed run breaks down at the latest when the cold should come.
  if (action === 'openValve' && state.doom) return fail(state, state.doom)
  return enter(state, ON_TURN[action].to)
}

/** A step handle turned all the way, out of its turn. */
function turnedOutOfTurn(state: SequenceState, action: StepTurn): SequenceState {
  const left = { ...state, worked: 0, turning: null, opened: [...state.opened, action] }
  switch (action) {
    case 'openSmallValve':
      // Late, the vat's steam already in: the boiler blows up. Early, before
      // the fire: nothing, for now.
      return state.smallShut ? fail(state, 'boilerExplodes') : doom(left, 'pipeBurst')
    case 'openTopValve':
      // Turned from up the ladder, climbed early: back down. The fire lit, the
      // engine starts all the same, but without the small valve there will be
      // no ice; before the fire, nothing, for now.
      if (state.phase === 'lit') return enter({ ...state, up: false, smallShut: true }, 'starting')
      return doom({ ...left, up: false }, 'pipeBurst')
    case 'turnCrank':
      return fail(state, 'pipeBurst')
    case 'openValve':
      return fail(state, 'water')
  }
}

/** The state `dt` seconds later, moving on through any timed phases that end. */
export function advance(state: SequenceState, dt: number): SequenceState {
  const awaited = state.auto && awaitedTurn(state.phase)
  if (awaited) {
    const [action, step] = awaited
    const next = turn(state, action, (step.way * dt) / AUTO_TURN)
    return next.phase === state.phase ? { ...next, elapsed: state.elapsed + dt } : next
  }
  let next = { ...state, elapsed: state.elapsed + dt }
  for (
    let timed = TIMED[next.phase];
    timed && next.elapsed >= timed.duration;
    timed = TIMED[next.phase]
  ) {
    const left = next.elapsed - timed.duration
    next = { ...moveOn(next, timed.next), elapsed: left }
  }
  return next
}

/** A timed phase over: on to the next, unless the run breaks down there. */
function moveOn(state: SequenceState, next: Phase): SequenceState {
  // The basin never came: the cube falls on the floor; without the small
  // valve, no cube was ever coming.
  if (state.phase === 'jet') return fail(state, state.smallShut ? 'noIce' : 'cubeOnFloor')
  // Out-of-order logs: the gauges burst as the engine comes up to speed.
  if (state.phase === 'starting' && state.doom === 'gaugesBurst') return fail(state, 'gaugesBurst')
  // No small valve: the cold died down, and no ice comes.
  if (state.phase === 'waiting' && state.smallShut) return fail(state, 'noIce')
  return enter(state, next)
}

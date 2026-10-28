/*
 * The film's sequence as a state machine: what the visitor's clicks and turns
 * set off, how long each stage runs, and what the machine shows at any
 * moment. Pure: the 3D scene only reads `readouts` and sends `act` and `turn`.
 *
 * 1. Doc's three special logs go into the stove, one by one: the fire takes.
 * 2. The small valve low on the right is opened.
 * 3. Up the ladder, opening the valve on the vat's red cap starts the engine:
 *    it spins up by fits, the machine starts to knock and shake, steam gushes
 *    out of the vent.
 * 4. Turning the crank "hard left!" slides the sleeve along the coil.
 * 5. Opening the big copper valve lets the cold out: vapor gushes from the
 *    duct.
 * 6. The basin lifted up under it, the cold dies down; two seconds later one
 *    ice cube drops into it, and the basin goes back down on the bench with it.
 * 7. The tongs put the cube in Doc's glass of tea.
 *
 * Out of order, things go wrong. Some mistakes break the machine there and
 * then (`Failure`); others do nothing at the time but doom the run, which
 * then breaks down further on, at the latest when the cold should come.
 */

/** How a run can break down. */
export type Failure =
  /** The logs went in out of order: every gauge bursts as the engine comes up. */
  | 'gaugesBurst'
  /** The small valve opened after the vat's: the boiler blows up. */
  | 'boilerExplodes'
  /** Something worked out of turn: a big pipe tears off the vat, spraying everywhere. */
  | 'pipeBurst'
  /** The big valve opened before the crank was done: water runs out of the duct. */
  | 'water'
  /** The basin not lifted in time: the ice cube falls on the floor. */
  | 'cubeOnFloor'
  /** The small valve never opened: the cold gushes, but no ice cube ever comes. */
  | 'noIce'

type Phase =
  | 'idle'
  | 'stoking'
  | 'lit'
  | 'primed'
  | 'climbed'
  | 'starting'
  | 'running'
  | 'cranked'
  | 'jet'
  | 'waiting'
  | 'dropping'
  | 'caught'
  | 'served'
  | 'failed'

/** The handles worked by turning them round, not by a click. */
export type TurnAction = 'openSmallValve' | 'openTopValve' | 'turnCrank' | 'openValve'
type ClickAction = 'loadStove' | 'climbLadder' | 'holdBasin' | 'useTongs'
export type Action = TurnAction | ClickAction | 'reset'

export interface SequenceState {
  phase: Phase
  /** Seconds spent in the current phase. */
  elapsed: number
  /**
   * How far the step the phase waits for has gone, 0 to 1: the handle turned,
   * or the logs put in.
   */
  worked: number
  /** Whether that handle turns by itself (the overlay's button turned it). */
  auto: boolean
  /** A handle being turned out of turn, `worked` its progress; null for the awaited step. */
  turning: TurnAction | null
  /**
   * The handles turned all the way out of turn, harmlessly for now: they stay
   * open, and their step counts as done when it comes.
   */
  opened: TurnAction[]
  /** The logs in the stove, by number, in the order they went in. */
  logs: number[]
  /** A mistake made that did nothing yet, and how the run will break down for it. */
  doom: Failure | null
  /** Whether the vat's valve was opened with the small one still shut: no ice will come. */
  smallShut: boolean
  /** Once failed: how, and the phase it failed in (the machine still shows it). */
  failure: { kind: Failure; during: Phase } | null
}

/**
 * Once the basin is up: the cold keeps gushing a while, dies down, and two
 * seconds later the ice cube drops. Seconds from lifting it.
 */
const WAIT = { jetEnds: 1.5, jetGone: 2, drop: 4 }

/** How long the cold gushes, waiting for the basin, before the cube falls on the floor. */
const BASIN_WAIT = 6

/** How long the timed phases last, in seconds, and the phase each leads to. */
const TIMED: Partial<Record<Phase, { duration: number; next: Phase }>> = {
  stoking: { duration: 2, next: 'lit' },
  jet: { duration: BASIN_WAIT, next: 'failed' },
  starting: { duration: 3, next: 'running' },
  waiting: { duration: WAIT.drop, next: 'dropping' },
  dropping: { duration: 1.2, next: 'caught' },
}

/** The crank's turns, and the sleeve's runs along the coil over them, ending hard left. */
export const CRANK_TURNS = 6
const SLEEVE_RUNS = 5

/** The logs the stove takes before the fire is lit. */
export const STOVE_LOGS = 3

/**
 * What each click does, in which phase it is allowed, and how many times it
 * takes (once, unless said otherwise).
 */
const ON_CLICK: Record<ClickAction, { from: Phase; to: Phase; times?: number }> = {
  loadStove: { from: 'idle', to: 'stoking', times: STOVE_LOGS },
  climbLadder: { from: 'primed', to: 'climbed' },
  holdBasin: { from: 'jet', to: 'waiting' },
  useTongs: { from: 'caught', to: 'served' },
}

/**
 * What each handle does once turned all the way, in which phase, how many
 * turns it takes, and which way as the visitor faces it: 1 counterclockwise
 * (the crank "hard left"), -1 clockwise. The valves open each their own way.
 */
const ON_TURN: Record<TurnAction, { from: Phase; to: Phase; turns: number; way: 1 | -1 }> = {
  openSmallValve: { from: 'lit', to: 'primed', turns: 1.5, way: 1 },
  openTopValve: { from: 'climbed', to: 'starting', turns: 2, way: -1 },
  turnCrank: { from: 'running', to: 'cranked', turns: CRANK_TURNS, way: 1 },
  openValve: { from: 'cranked', to: 'jet', turns: 2, way: -1 },
}

/** Which way a handle turns: 1 counterclockwise, -1 clockwise. */
export const turnWay = (action: TurnAction) => ON_TURN[action].way

/** Whether an action is worked by turning a handle round. */
export const isTurn = (action: Action): action is TurnAction => action in ON_TURN

/** Seconds per turn when a handle turns by itself. */
const AUTO_TURN = 0.5

export const initialState: SequenceState = {
  phase: 'idle',
  elapsed: 0,
  worked: 0,
  auto: false,
  turning: null,
  opened: [],
  logs: [],
  doom: null,
  smallShut: false,
  failure: null,
}

/**
 * The state entering `phase`, the run's logs and doom carried on; straight
 * on past it if the handle it waits for was already opened out of turn.
 */
function enter(state: SequenceState, phase: Phase): SequenceState {
  const next = { ...state, phase, elapsed: 0, worked: 0, auto: false, turning: null }
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

const entries = <K extends string, V>(record: Record<K, V>) => Object.entries(record) as [K, V][]

/** The handle the phase waits for, if it waits for one. */
function awaitedTurn(phase: Phase) {
  return entries(ON_TURN).find(([, step]) => step.from === phase)
}

/** Whether the step `from` leads on from is still to come: the phase is before it, or at it. */
const ahead = (state: SequenceState, from: Phase) =>
  ORDER.indexOf(state.phase) <= ORDER.indexOf(from)

/**
 * The parts that can be worked right now, in turn or not: every step still
 * to come (a run that ended takes none but `reset`).
 */
export function availableActions(state: SequenceState): Action[] {
  if (state.phase === 'served' || state.phase === 'failed') return ['reset']
  const actions = [...entries(ON_CLICK), ...entries(ON_TURN)]
    .filter(
      ([action, step]) =>
        (ahead(state, step.from) && !state.opened.includes(action as TurnAction)) ||
        lateValve(state, action),
    )
    .map(([action]) => action)
  const untouched = state.phase === 'idle' && state.logs.length === 0
  return untouched ? actions : [...actions, 'reset']
}

/** The small valve, skipped, can still be opened late: to the boiler's ruin. */
const lateValve = (state: SequenceState, action: Action) =>
  action === 'openSmallValve' && state.smallShut

/** Whether the step the phase waits for is the one `action` does. */
const awaits = (state: SequenceState, action: ClickAction | TurnAction) =>
  (isTurn(action) ? ON_TURN[action] : ON_CLICK[action]).from === state.phase

/**
 * The state after a click; unchanged when the click does nothing now. A turn
 * action clicked sets its handle turning by itself (for the tests). Out of
 * turn, a click does nothing, but dooms the run.
 */
export function act(state: SequenceState, action: Action): SequenceState {
  if (action === 'reset') return initialState
  if (!availableActions(state).includes(action)) return state
  if (isTurn(action)) {
    return awaits(state, action) ? { ...state, auto: true } : state
  }
  if (action === 'loadStove') return load(state, state.logs.length + 1)
  const step = ON_CLICK[action as ClickAction]
  return step.from === state.phase ? enter(state, step.to) : doom(state, 'pipeBurst')
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
 * past where it started; turned all the way, the sequence moves on.
 */
export function turn(state: SequenceState, action: TurnAction, turns: number): SequenceState {
  if (!availableActions(state).includes(action)) return state
  const step = ON_TURN[action]
  const inTurn = awaits(state, action)
  // Another handle than the last one turned out of turn starts from nothing.
  const from = (inTurn && state.turning === null) || state.turning === action ? state.worked : 0
  const worked = Math.max(0, from + (turns * step.way) / step.turns)
  if (worked < 1) return { ...state, worked, turning: inTurn ? null : action }
  return inTurn ? turned(state, action) : turnedOutOfTurn(state, action)
}

/** A handle turned all the way, in its turn. */
function turned(state: SequenceState, action: TurnAction): SequenceState {
  // A doomed run breaks down at the latest when the cold should come.
  if (action === 'openValve' && state.doom) return fail(state, state.doom)
  return enter(state, ON_TURN[action].to)
}

/** A handle turned all the way, out of its turn. */
function turnedOutOfTurn(state: SequenceState, action: TurnAction): SequenceState {
  const left = { ...state, worked: 0, turning: null, opened: [...state.opened, action] }
  switch (action) {
    case 'openSmallValve':
      // Late, the vat's steam already in: the boiler blows up. Early, before
      // the fire: nothing, for now.
      return state.smallShut ? fail(state, 'boilerExplodes') : doom(left, 'pipeBurst')
    case 'openTopValve':
      // The fire lit, the engine starts all the same; without the small valve
      // there will be no ice, without the ladder something will give.
      if (state.phase === 'lit') return enter({ ...state, smallShut: true }, 'starting')
      if (state.phase === 'primed') return enter(doom(state, 'pipeBurst'), 'starting')
      return doom(left, 'pipeBurst')
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
  // The basin never came: the cube falls on the floor.
  if (state.phase === 'jet') return fail(state, 'cubeOnFloor')
  // Out-of-order logs: the gauges burst as the engine comes up to speed.
  if (state.phase === 'starting' && state.doom === 'gaugesBurst') return fail(state, 'gaugesBurst')
  // No small valve: the cold died down, and no ice comes.
  if (state.phase === 'waiting' && state.smallShut) return fail(state, 'noIce')
  return enter(state, next)
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
/** How far through its timed phase the state is, 0 to 1. */
const progress = ({ phase, elapsed }: SequenceState) =>
  clamp01(elapsed / (TIMED[phase]?.duration ?? 1))
const ORDER: Phase[] = [
  'idle',
  'stoking',
  'lit',
  'primed',
  'climbed',
  'starting',
  'running',
  'cranked',
  'jet',
  'waiting',
  'dropping',
  'caught',
  'served',
  'failed',
]
/** Whether the state has reached `phase` (or gone past it). */
const reached = (state: SequenceState, phase: Phase) =>
  ORDER.indexOf(state.phase) >= ORDER.indexOf(phase)
/**
 * How far a handle has turned: 0 before its phase, `worked` during (or while
 * turned out of turn), 1 after (or once opened out of turn).
 */
const handle = (state: SequenceState, action: TurnAction) => {
  const { from, to } = ON_TURN[action]
  if (state.opened.includes(action) || reached(state, to)) return 1
  const turningIt = state.turning === action || (state.turning === null && state.phase === from)
  return turningIt ? state.worked : 0
}

export interface Readouts {
  /** The logs in the stove, by number. */
  logs: number[]
  /** The fire in the stove, 0 (cold) to 1 (roaring); the logs go in as it takes. */
  fire: number
  /** How far open the valves are, 0 to 1: the small one, the vat's, the big copper one. */
  smallValve: number
  topValve: number
  mainValve: number
  /** The engine's speed, 0 (still) to 1 (full): flywheel, belt, gears, bellows. */
  engine: number
  /** How hard the pipes knock and shake, 0 to 1. */
  shaking: number
  /**
   * The vat's steam coming down its pipes, 0 to 1: as its valve opens they
   * start to rumble and their gauges to stir, until the engine takes over.
   */
  stir: number
  /**
   * Where the view closes in, if anywhere: on the vat's top up the ladder, on
   * the basin and the glass once the cold gushes, for the ice cube.
   */
  closeUp: 'none' | 'vat' | 'basin'
  /** The gauges' pressure, 0 to 1. */
  pressure: number
  /** The steam plume at the vent, 0 to 1. */
  steam: number
  /** How far the crank has turned, 0 to 1 (CRANK_TURNS turns). */
  crank: number
  /**
   * The sleeve along the coil, 0 (right, at rest) to 1 (hard left): it runs
   * back and forth as the crank turns, to end hard left.
   */
  sleeve: number
  /** The cold vapor from the duct, 0 to 1. */
  coldJet: number
  /** Whether the basin is held up under the duct (1), till the cube lands, or on the bench (0). */
  basin: number
  /**
   * Where the ice cube is; `fall` runs 0 to 1 from the duct's mouth to the
   * basin, or on down to the floor.
   */
  cube: { where: 'none' | 'falling' | 'basin' | 'glass' | 'floor'; fall: number }
  /** How the run broke down, if it did, and seconds since. */
  failure: { kind: Failure; since: number } | null
}

/** The engine's run, 0 to 1: spinning up by fits while starting, then full on. */
function running(state: SequenceState) {
  const p = progress(state)
  // Two stalls on its way to full speed.
  if (state.phase === 'starting') return p * (0.7 + 0.3 * Math.abs(Math.cos(p * Math.PI * 2)))
  return reached(state, 'running') ? 1 : 0
}

/** The gauges' pressure: a little with the fire, more with each valve, full once cranked. */
function pressure(state: SequenceState) {
  const { phase, elapsed } = state
  const p = progress(state)
  if (phase === 'stoking') return 0.1 * p
  if (phase === 'starting') return 0.35 + 0.25 * p
  if (phase === 'running') return 0.6 + 0.3 * clamp01(elapsed / 3)
  if (reached(state, 'cranked')) return 1
  if (reached(state, 'climbed')) return 0.2
  return reached(state, 'lit') ? 0.1 + 0.05 * handle(state, 'openSmallValve') : 0
}

/** Back and forth over `runs` runs as `p` goes 0 to 1: 0, 1, 0, 1... */
function shuttle(p: number, runs: number) {
  const along = p * runs
  const run = Math.min(Math.floor(along), runs - 1)
  const part = along - run
  return run % 2 === 0 ? part : 1 - part
}

/** How long a broken-down engine takes to wind down, in seconds. */
const WIND_DOWN = 2.5

/**
 * What the machine shows in a given state. Broken down, it shows what it did
 * when it broke, the engine winding down, and the breakdown itself.
 */
export function readouts(state: SequenceState): Readouts {
  if (state.failure) {
    const { kind, during } = state.failure
    const since = state.elapsed
    const before = readouts({ ...state, phase: during, elapsed: 0, failure: null })
    const down = clamp01(1 - since / WIND_DOWN)
    return {
      ...before,
      engine: before.engine * down,
      steam: before.steam * down,
      shaking: before.shaking * down,
      coldJet: 0,
      basin: 0,
      // Water running out of the duct is watched close, as the ice would have been.
      closeUp: kind === 'water' ? 'basin' : before.closeUp === 'vat' ? 'none' : before.closeUp,
      cube:
        kind === 'cubeOnFloor' ? { where: 'floor', fall: clamp01(since / 0.9) ** 2 } : before.cube,
      failure: { kind, since },
    }
  }
  const { phase, elapsed } = state
  const engine = running(state)
  return {
    logs: state.logs,
    fire: phase === 'stoking' ? progress(state) : reached(state, 'lit') ? 1 : 0,
    smallValve: handle(state, 'openSmallValve'),
    topValve: handle(state, 'openTopValve'),
    mainValve: handle(state, 'openValve'),
    engine,
    shaking: phase === 'served' ? 0.4 : phase === 'starting' ? progress(state) : engine,
    stir:
      phase === 'starting'
        ? 1 - progress(state)
        : reached(state, 'starting')
          ? 0
          : handle(state, 'openTopValve'),
    closeUp: phase === 'climbed' ? 'vat' : reached(state, 'jet') ? 'basin' : 'none',
    pressure: pressure(state),
    steam: engine,
    crank: handle(state, 'turnCrank'),
    sleeve: shuttle(handle(state, 'turnCrank'), SLEEVE_RUNS),
    coldJet:
      phase === 'jet'
        ? clamp01(elapsed / 0.5)
        : phase === 'waiting'
          ? clamp01((WAIT.jetGone - elapsed) / (WAIT.jetGone - WAIT.jetEnds))
          : 0,
    basin: phase === 'waiting' || phase === 'dropping' ? 1 : 0,
    cube:
      phase === 'dropping'
        ? { where: 'falling', fall: progress(state) ** 2 }
        : phase === 'caught'
          ? { where: 'basin', fall: 1 }
          : reached(state, 'served')
            ? { where: 'glass', fall: 1 }
            : { where: 'none', fall: 0 },
    failure: null,
  }
}

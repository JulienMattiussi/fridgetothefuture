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
 * 6. Lifting the basin up under it, one ice cube drops into it; the basin
 *    goes back down on the bench with it.
 * 7. The tongs put the cube in Doc's glass of tea.
 */

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
  | 'dropping'
  | 'caught'
  | 'served'

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
}

/** How long the timed phases last, in seconds, and the phase each leads to. */
const TIMED: Partial<Record<Phase, { duration: number; next: Phase }>> = {
  stoking: { duration: 2, next: 'lit' },
  starting: { duration: 3, next: 'running' },
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
  holdBasin: { from: 'jet', to: 'dropping' },
  useTongs: { from: 'caught', to: 'served' },
}

/**
 * What each handle does once turned all the way, in which phase, how many
 * turns it takes, and which way: 1 counterclockwise as the visitor faces it
 * (opening, or the crank "hard left"), -1 clockwise (closing).
 */
const ON_TURN: Record<TurnAction, { from: Phase; to: Phase; turns: number; way: 1 | -1 }> = {
  openSmallValve: { from: 'lit', to: 'primed', turns: 1.5, way: 1 },
  openTopValve: { from: 'climbed', to: 'starting', turns: 2, way: 1 },
  turnCrank: { from: 'running', to: 'cranked', turns: CRANK_TURNS, way: 1 },
  openValve: { from: 'cranked', to: 'jet', turns: 2, way: 1 },
}

/** Which way a handle turns: 1 counterclockwise, -1 clockwise. */
export const turnWay = (action: TurnAction) => ON_TURN[action].way

/** Whether an action is worked by turning a handle round. */
export const isTurn = (action: Action): action is TurnAction => action in ON_TURN

/** Seconds per turn when a handle turns by itself. */
const AUTO_TURN = 0.5

export const initialState: SequenceState = { phase: 'idle', elapsed: 0, worked: 0, auto: false }

const enter = (phase: Phase): SequenceState => ({ phase, elapsed: 0, worked: 0, auto: false })

const entries = <K extends string, V>(record: Record<K, V>) => Object.entries(record) as [K, V][]

/** The handle the phase waits for, if it waits for one. */
function awaitedTurn(phase: Phase) {
  return entries(ON_TURN).find(([, step]) => step.from === phase)
}

/** The clicks and turns that do something right now. */
export function availableActions(state: SequenceState): Action[] {
  const actions = [...entries(ON_CLICK), ...entries(ON_TURN)]
    .filter(([, step]) => step.from === state.phase)
    .map(([action]) => action)
  const untouched = state.phase === 'idle' && state.worked === 0
  return untouched ? actions : [...actions, 'reset']
}

/**
 * The state after a click; unchanged when the click does nothing now. A turn
 * action clicked (the overlay's button) sets its handle turning by itself.
 */
export function act(state: SequenceState, action: Action): SequenceState {
  if (action === 'reset') return initialState
  if (isTurn(action)) {
    const step = ON_TURN[action]
    return step.from === state.phase ? { ...state, auto: true } : state
  }
  const step = ON_CLICK[action as ClickAction]
  if (step.from !== state.phase) return state
  const worked = state.worked + 1 / (step.times ?? 1)
  // A hair under 1 from adding fractions still counts as done.
  return worked >= 1 - 1e-9 ? enter(step.to) : { ...state, worked }
}

/**
 * The state after the visitor turned `action`'s handle by `turns`,
 * counterclockwise positive. Turning it the wrong way winds it back, never
 * past where it started; turned all the way, the sequence moves on.
 */
export function turn(state: SequenceState, action: TurnAction, turns: number): SequenceState {
  const step = ON_TURN[action]
  if (step.from !== state.phase) return state
  const worked = Math.max(0, state.worked + (turns * step.way) / step.turns)
  return worked >= 1 ? enter(step.to) : { ...state, worked }
}

/** The state `dt` seconds later, moving on through any timed phases that end. */
export function advance(state: SequenceState, dt: number): SequenceState {
  const awaited = state.auto && awaitedTurn(state.phase)
  if (awaited) {
    const [action, step] = awaited
    const turned = turn(state, action, (step.way * dt) / AUTO_TURN)
    return turned.phase === state.phase ? { ...turned, elapsed: state.elapsed + dt } : turned
  }
  let { phase, elapsed } = state
  elapsed += dt
  for (let timed = TIMED[phase]; timed && elapsed >= timed.duration; timed = TIMED[phase]) {
    elapsed -= timed.duration
    phase = timed.next
  }
  return phase === state.phase ? { ...state, elapsed } : { ...enter(phase), elapsed }
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
  'dropping',
  'caught',
  'served',
]
/** Whether the state has reached `phase` (or gone past it). */
const reached = (state: SequenceState, phase: Phase) =>
  ORDER.indexOf(state.phase) >= ORDER.indexOf(phase)
/** How far a handle has turned: 0 before its phase, `worked` during, 1 after. */
const handle = (state: SequenceState, action: TurnAction) => {
  const { from, to } = ON_TURN[action]
  return state.phase === from ? state.worked : reached(state, to) ? 1 : 0
}

export interface Readouts {
  /** How many logs are in the stove, 0 to STOVE_LOGS. */
  logs: number
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
  /** Where the ice cube is; `fall` runs 0 to 1 from the duct's mouth to the basin. */
  cube: { where: 'none' | 'falling' | 'basin' | 'glass'; fall: number }
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

/** What the machine shows in a given state. */
export function readouts(state: SequenceState): Readouts {
  const { phase, elapsed } = state
  const engine = running(state)
  const coldJetEnd = phase === 'caught' ? clamp01(1 - elapsed / 1.5) : 0
  return {
    logs: phase === 'idle' ? Math.round(state.worked * STOVE_LOGS) : STOVE_LOGS,
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
    coldJet: phase === 'jet' ? clamp01(elapsed / 0.5) : phase === 'dropping' ? 1 : coldJetEnd,
    basin: phase === 'dropping' ? 1 : 0,
    cube:
      phase === 'dropping'
        ? { where: 'falling', fall: progress(state) ** 2 }
        : phase === 'caught'
          ? { where: 'basin', fall: 1 }
          : reached(state, 'served')
            ? { where: 'glass', fall: 1 }
            : { where: 'none', fall: 0 },
  }
}

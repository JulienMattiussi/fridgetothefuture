/*
 * The sequence's steps: its phases in order, what each click and each handle
 * does in its turn, how long the timed phases last, and the state a run keeps.
 * The rules (sequence.ts) and what the machine shows (readouts.ts) read them.
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
  /** The handwheel by the gear train turned: it comes off in the hand, and it leaks. */
  | 'wheelOff'

export type Phase =
  | 'idle'
  | 'stoking'
  | 'lit'
  | 'primed'
  | 'climbed'
  | 'starting'
  | 'running'
  | 'cranked'
  | 'opened'
  | 'jet'
  | 'waiting'
  | 'dropping'
  | 'caught'
  | 'served'
  | 'failed'

/** The phases in their order: a run goes through them, or breaks down. */
const ORDER: Phase[] = [
  'idle',
  'stoking',
  'lit',
  'primed',
  'climbed',
  'starting',
  'running',
  'cranked',
  'opened',
  'jet',
  'waiting',
  'dropping',
  'caught',
  'served',
  'failed',
]

/** The handles that are steps, worked by turning them round. */
export type StepTurn = 'openSmallValve' | 'openTopValve' | 'turnCrank' | 'openValve'
/** The handles that are traps: they play no part, and turning them breaks the machine. */
type TrapTurn = 'turnSideWheel'
/** Every handle worked by turning it round. */
export type TurnAction = StepTurn | TrapTurn
export type ClickAction = 'loadStove' | 'climbLadder' | 'pullLever' | 'holdBasin' | 'useTongs'
export type Action = TurnAction | ClickAction | 'reset'

export interface SequenceState {
  phase: Phase
  /** Seconds spent in the current phase. */
  elapsed: number
  /** How far the handle being turned has gone, 0 to 1. */
  worked: number
  /** Whether the awaited handle turns by itself (the end-to-end tests set it going). */
  auto: boolean
  /** A handle being turned out of turn, `worked` its progress; null for the awaited step. */
  turning: TurnAction | null
  /**
   * The handles turned all the way out of turn, harmlessly for now: they stay
   * open, and their step counts as done when it comes.
   */
  opened: StepTurn[]
  /** The logs in the stove, by number, in the order they went in. */
  logs: number[]
  /** A mistake made that did nothing yet, and how the run will break down for it. */
  doom: Failure | null
  /** Whether the vat's valve was opened with the small one still shut: no ice will come. */
  smallShut: boolean
  /**
   * Up the ladder out of turn (in turn, the phase says so): there, only the
   * vat's valve can be worked, and turning it brings the visitor back down.
   */
  up: boolean
  /** Whether the big lever was pulled down out of turn: it stays down, its step done. */
  leverDown: boolean
  /** Once failed: how, and the phase it failed in (the machine still shows it). */
  failure: { kind: Failure; during: Phase } | null
}

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
  up: false,
  leverDown: false,
  failure: null,
}

/**
 * Once the basin is up: the cold keeps gushing a while, dies down, and two
 * seconds later the ice cube drops. Seconds from lifting it.
 */
export const WAIT = { jetEnds: 1.5, jetGone: 2, drop: 4 }

/** How long the cold gushes, waiting for the basin, before the cube falls on the floor. */
const BASIN_WAIT = 6

/** How long the timed phases last, in seconds, and the phase each leads to. */
export const TIMED: Partial<Record<Phase, { duration: number; next: Phase }>> = {
  stoking: { duration: 2, next: 'lit' },
  jet: { duration: BASIN_WAIT, next: 'failed' },
  starting: { duration: 3, next: 'running' },
  waiting: { duration: WAIT.drop, next: 'dropping' },
  dropping: { duration: 1.2, next: 'caught' },
}

/** The crank's turns, and the sleeve's runs along the coil over them, ending hard left. */
export const CRANK_TURNS = 6
export const SLEEVE_RUNS = 5

/** The logs the stove takes before the fire is lit. */
export const STOVE_LOGS = 3

/** What each click does in its turn: the phase it is awaited in, and where it leads. */
export const ON_CLICK: Record<ClickAction, { from: Phase; to: Phase }> = {
  loadStove: { from: 'idle', to: 'stoking' },
  climbLadder: { from: 'primed', to: 'climbed' },
  pullLever: { from: 'opened', to: 'jet' },
  holdBasin: { from: 'jet', to: 'waiting' },
  useTongs: { from: 'caught', to: 'served' },
}

/**
 * What each handle does once turned all the way, in which phase, how many
 * turns it takes, and which way as the visitor faces it: 1 counterclockwise
 * (the crank "hard left"), -1 clockwise. The valves open each their own way.
 */
export const ON_TURN: Record<StepTurn, { from: Phase; to: Phase; turns: number; way: 1 | -1 }> = {
  openSmallValve: { from: 'lit', to: 'primed', turns: 1.5, way: 1 },
  openTopValve: { from: 'climbed', to: 'starting', turns: 2, way: -1 },
  turnCrank: { from: 'running', to: 'cranked', turns: CRANK_TURNS, way: 1 },
  openValve: { from: 'cranked', to: 'opened', turns: 2, way: -1 },
}

/** The traps: how many turns it takes, which way, and how the machine breaks down. */
export const TRAPS: Record<TrapTurn, { turns: number; way: 1 | -1; failure: Failure }> = {
  turnSideWheel: { turns: 1, way: 1, failure: 'wheelOff' },
}

/** Whether an action is worked by turning a handle round. */
export const isTurn = (action: Action): action is TurnAction => action in ON_TURN || isTrap(action)

/** Whether an action is a trap. */
export const isTrap = (action: Action): action is TrapTurn => action in TRAPS

/** How many turns a handle takes, and which way: 1 counterclockwise, -1 clockwise. */
export const turning = (action: TurnAction): { turns: number; way: 1 | -1 } =>
  isTrap(action) ? TRAPS[action] : ON_TURN[action]

/** Which way a handle turns: 1 counterclockwise, -1 clockwise. */
export const turnWay = (action: TurnAction) => turning(action).way

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Where a phase stands in the order. */
const rank = (phase: Phase) => ORDER.indexOf(phase)

/** Whether the state has reached `phase` (or gone past it). */
export const reached = (state: SequenceState, phase: Phase) => rank(state.phase) >= rank(phase)

/** Whether the step `from` leads on from is still to come: the phase is before it, or at it. */
export const ahead = (state: SequenceState, from: Phase) => rank(state.phase) <= rank(from)

/** How far through its timed phase the state is, 0 to 1. */
export const progress = ({ phase, elapsed }: SequenceState) =>
  clamp01(elapsed / (TIMED[phase]?.duration ?? 1))

/** Whether the visitor is up the ladder: in turn, or out of it. */
export const isUp = (state: SequenceState) => state.up || state.phase === 'climbed'

/**
 * How far a step's handle has turned: 0 before its phase, `worked` during (or
 * while turned out of turn), 1 after (or once opened out of turn).
 */
export function handle(state: SequenceState, action: StepTurn) {
  const { from, to } = ON_TURN[action]
  if (state.opened.includes(action) || reached(state, to)) return 1
  const turningIt = state.turning === action || (state.turning === null && state.phase === from)
  return turningIt ? state.worked : 0
}

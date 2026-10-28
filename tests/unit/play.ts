import { act, advance, turn } from '@/lib/sequence'
import {
  type Action,
  CRANK_TURNS,
  initialState,
  type SequenceState,
  STOVE_LOGS,
  type TurnAction,
} from '@/lib/steps'

/** A step of a run: an action clicks, a number waits that many seconds, a pair turns a handle. */
export type Step = Action | number | [TurnAction, number]

/** Plays steps in order, from `start`. */
export const playFrom = (start: SequenceState, ...steps: Step[]): SequenceState =>
  steps.reduce<SequenceState>((state, step) => {
    if (typeof step === 'number') return advance(state, step)
    if (Array.isArray(step)) return turn(state, ...step)
    return act(state, step)
  }, start)

/** Plays steps in order, from the start. */
export const play = (...steps: Step[]) => playFrom(initialState, ...steps)

/** The stove's logs, put in one by one, in order. */
export const LOAD: Step[] = Array<Step>(STOVE_LOGS).fill('loadStove')
/** Up to the ladder: the logs burnt, the small valve open. */
export const PRIMED: Step[] = [...LOAD, 2, ['openSmallValve', 1.5]]
/** Up to the engine running: the ladder, the vat's valve, the engine's start. */
export const RUNNING: Step[] = [...PRIMED, 'climbLadder', ['openTopValve', -2], 3]
/** Up to the cold gushing: the crank, the big copper valve, then the lever. */
export const JET: Step[] = [...RUNNING, ['turnCrank', CRANK_TURNS], ['openValve', -2], 'pullLever']
/** Through to the iced tea: the basin up, the cube in, the tongs. */
export const SERVED: Step[] = [...JET, 'holdBasin', 5.2, 'useTongs']

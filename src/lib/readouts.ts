/*
 * What the machine shows in a given state of the sequence: how far each
 * handle has turned, the engine, the steam, the cold, the ice cube, and the
 * breakdown when there is one. Pure: the 3D scene reads it every frame.
 */
import {
  clamp01,
  type Failure,
  handle,
  isUp,
  progress,
  reached,
  type SequenceState,
  SLEEVE_RUNS,
  WAIT,
} from '@/lib/steps'

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
  /** Whether the big lever is down (1), letting the cold out, or up (0). */
  lever: number
  /** How far the small handwheel by the gear train has turned, 0 to 1. */
  sideWheel: number
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

/** Seconds since the machine broke down `kind`'s way, or -1 if it has not (or another way). */
export const brokenFor = ({ failure }: Readouts, kind: Failure) =>
  failure?.kind === kind ? failure.since : -1

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
      // Water, or no ice, are watched close at the basin, as the ice would have been.
      closeUp:
        kind === 'water' || kind === 'noIce'
          ? 'basin'
          : before.closeUp === 'vat'
            ? 'none'
            : before.closeUp,
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
    closeUp: isUp(state) ? 'vat' : reached(state, 'jet') ? 'basin' : 'none',
    pressure: pressure(state),
    steam: engine,
    crank: handle(state, 'turnCrank'),
    sleeve: shuttle(handle(state, 'turnCrank'), SLEEVE_RUNS),
    lever: state.leverDown || reached(state, 'jet') ? 1 : 0,
    sideWheel: state.turning === 'turnSideWheel' ? state.worked : 0,
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

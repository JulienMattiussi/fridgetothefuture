import {
  act,
  advance,
  availableActions,
  CRANK_TURNS,
  initialState,
  STOVE_LOGS,
  isTurn,
  load,
  readouts,
  turn,
  turnWay,
  type Action,
  type SequenceState,
  type TurnAction,
} from '@/lib/sequence'

type Step = Action | number | [TurnAction, number]

/** The stove's logs, put in one by one. */
const LOAD: Step[] = Array<Step>(STOVE_LOGS).fill('loadStove')

/**
 * Plays steps in order: an action clicks, a number waits that many seconds,
 * and a pair turns a handle by that many turns.
 */
function play(...steps: Step[]): SequenceState {
  return steps.reduce<SequenceState>((state, step) => {
    if (typeof step === 'number') return advance(state, step)
    if (Array.isArray(step)) return turn(state, ...step)
    return act(state, step)
  }, initialState)
}

/** Up to the engine running: stove, small valve, ladder, the vat's valve. */
const RUNNING: Step[] = [
  ...LOAD,
  2,
  ['openSmallValve', 1.5],
  'climbLadder',
  ['openTopValve', -2],
  3,
]
/** Up to the cold gushing: the crank, then the big copper valve. */
const JET: Step[] = [...RUNNING, ['turnCrank', CRANK_TURNS], ['openValve', -2]]
const SERVED: Step[] = [...JET, 'holdBasin', 5.2, 'useTongs']

describe('the sequence', () => {
  it('lets every part be worked at first, but not reset', () => {
    expect(availableActions(initialState)).toContain('loadStove')
    expect(availableActions(initialState)).toContain('turnCrank')
    expect(availableActions(initialState)).not.toContain('reset')
  })

  it('takes nothing but a reset once over', () => {
    expect(availableActions(play(...SERVED))).toEqual(['reset'])
    expect(act(play(...SERVED), 'holdBasin').phase).toBe('served')
  })

  it('runs through the film, clicks, turns and timed stages in turn', () => {
    const phases = [
      [...LOAD],
      [...LOAD, 2],
      [...LOAD, 2, ['openSmallValve', 1.5]],
      [...LOAD, 2, ['openSmallValve', 1.5], 'climbLadder'],
      [...LOAD, 2, ['openSmallValve', 1.5], 'climbLadder', ['openTopValve', -2]],
      RUNNING,
      [...RUNNING, ['turnCrank', CRANK_TURNS]],
      JET,
      [...JET, 'holdBasin'],
      [...JET, 'holdBasin', 4],
      [...JET, 'holdBasin', 5.2],
      SERVED,
    ].map((steps) => play(...(steps as Step[])).phase)
    expect(phases).toEqual([
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
    ])
  })

  it('needs the handles turned all the way, and the right way', () => {
    const lit = play(...LOAD, 2)
    expect(turn(lit, 'openSmallValve', 1).phase).toBe('lit')
    expect(turn(lit, 'openSmallValve', 1).worked).toBeCloseTo(2 / 3)
    expect(turn(lit, 'openSmallValve', -1).worked).toBe(0)
    expect(play(...RUNNING, ['turnCrank', -CRANK_TURNS]).phase).toBe('running')
  })

  it('tells the handles from the clicks, and which way each turns', () => {
    expect(isTurn('turnCrank')).toBe(true)
    expect(isTurn('holdBasin')).toBe(false)
    expect(turnWay('openTopValve')).toBe(-1)
    expect(turnWay('turnCrank')).toBe(1)
  })

  it('turns a handle by itself when its button is clicked', () => {
    const turning = act(play(...LOAD, 2), 'openSmallValve')
    expect(turning).toMatchObject({ phase: 'lit', auto: true })
    expect(advance(turning, 0.3).worked).toBeCloseTo(0.4)
    expect(advance(turning, 0.75).phase).toBe('primed')
  })

  it('carries leftover time into the next phase', () => {
    expect(play(...LOAD, 2.5)).toMatchObject({ phase: 'lit', elapsed: 0.5, worked: 0 })
  })

  it('can always be reset once started', () => {
    const served = play(...SERVED)
    expect(availableActions(served)).toEqual(['reset'])
    expect(act(served, 'reset')).toEqual(initialState)
  })
})

describe('readouts', () => {
  it('shows a still, cold machine at first', () => {
    expect(readouts(initialState)).toEqual({
      logs: [],
      fire: 0,
      smallValve: 0,
      topValve: 0,
      mainValve: 0,
      engine: 0,
      shaking: 0,
      stir: 0,
      closeUp: 'none',
      pressure: 0,
      steam: 0,
      crank: 0,
      sleeve: 0,
      coldJet: 0,
      basin: 0,
      cube: { where: 'none', fall: 0 },
      failure: null,
    })
  })

  it('takes the logs one by one before the fire takes', () => {
    const short = play(...LOAD.slice(1))
    expect(short.phase).toBe('idle')
    expect(readouts(short)).toMatchObject({ logs: [1, 2], fire: 0 })
    expect(availableActions(short)).toContain('reset')
    expect(readouts(play(...LOAD)).logs).toHaveLength(STOVE_LOGS)
  })

  it('lights the fire once the logs are in', () => {
    expect(readouts(play(...LOAD, 1)).fire).toBeCloseTo(0.5)
    expect(readouts(play(...LOAD, 2)).fire).toBe(1)
  })

  it('opens each valve as far as its handle turned', () => {
    expect(readouts(play(...LOAD, 2, ['openSmallValve', 0.75])).smallValve).toBeCloseTo(0.5)
    const started = readouts(play(...RUNNING.slice(0, -1)))
    expect(started).toMatchObject({ smallValve: 1, topValve: 1, mainValve: 0 })
    expect(
      readouts(play(...RUNNING, ['turnCrank', CRANK_TURNS], ['openValve', -1])).mainValve,
    ).toBeCloseTo(0.5)
  })

  it('closes in on the vat while up the ladder', () => {
    const up = [...LOAD, 2, ['openSmallValve', 1.5], 'climbLadder'] as Step[]
    expect(readouts(play(...up)).closeUp).toBe('vat')
    expect(readouts(play(...up, ['openTopValve', -2])).closeUp).toBe('none')
  })

  it('closes in on the basin and the glass once the cold gushes, to the end', () => {
    expect(readouts(play(...RUNNING, ['turnCrank', CRANK_TURNS])).closeUp).toBe('none')
    expect(readouts(play(...JET)).closeUp).toBe('basin')
    expect(readouts(play(...SERVED)).closeUp).toBe('basin')
  })

  it("stirs the vat's pipes as its valve opens, until the engine takes over", () => {
    const up = [...LOAD, 2, ['openSmallValve', 1.5], 'climbLadder'] as Step[]
    expect(readouts(play(...up)).stir).toBe(0)
    expect(readouts(play(...up, ['openTopValve', -1])).stir).toBeCloseTo(0.5)
    expect(readouts(play(...RUNNING.slice(0, -1), 1.5)).stir).toBeCloseTo(0.5)
    expect(readouts(play(...RUNNING)).stir).toBe(0)
  })

  it('raises the pressure step by step, on to full once cranked', () => {
    const steps = [
      [...LOAD, 2],
      RUNNING.slice(0, -2),
      RUNNING,
      [...RUNNING, ['turnCrank', CRANK_TURNS]],
    ]
    const pressures = steps.map((s) => readouts(play(...(s as Step[]))).pressure)
    expect(pressures).toEqual([...pressures].sort((a, b) => a - b))
    expect(pressures.at(-1)).toBe(1)
  })

  it('spins the engine up while starting, and keeps it running to the end', () => {
    const half = readouts(play(...RUNNING.slice(0, -1), 1.5)).engine
    expect(half).toBeGreaterThan(0)
    expect(half).toBeLessThan(1)
    expect(readouts(play(...RUNNING)).engine).toBe(1)
    expect(readouts(play(...SERVED))).toMatchObject({ engine: 1, steam: 1 })
  })

  it('runs the sleeve back and forth as the crank turns, to end hard left', () => {
    const at = (turns: number) => readouts(play(...RUNNING, ['turnCrank', turns]))
    const run = CRANK_TURNS / 5
    expect(at(run / 2)).toMatchObject({
      sleeve: expect.closeTo(0.5),
      crank: expect.closeTo(1 / 10),
    })
    expect(at(run).sleeve).toBeCloseTo(1)
    expect(at(2 * run).sleeve).toBeCloseTo(0)
    expect(at(CRANK_TURNS)).toMatchObject({ sleeve: 1, crank: 1 })
  })

  it('lets the cold out once the big valve opens, not before', () => {
    expect(readouts(play(...RUNNING, ['turnCrank', CRANK_TURNS])).coldJet).toBe(0)
    expect(readouts(play(...JET, 1)).coldJet).toBe(1)
  })

  it('drops the cube from the duct into the basin, then into the glass', () => {
    const jet = play(...JET)
    expect(readouts(jet).coldJet).toBe(0)
    expect(readouts(advance(jet, 1)).coldJet).toBe(1)
    const falling = readouts(advance(act(jet, 'holdBasin'), 4.6)).cube
    expect(falling.where).toBe('falling')
    expect(falling.fall).toBeGreaterThan(0)
    expect(falling.fall).toBeLessThan(1)
    const caught = play(...JET, 'holdBasin', 5.2)
    expect(readouts(caught).cube).toEqual({ where: 'basin', fall: 1 })
    expect(readouts(play(...SERVED)).cube.where).toBe('glass')
  })

  it('holds the basin up under the duct till the cube lands, then puts it back down', () => {
    expect(readouts(play(...JET)).basin).toBe(0)
    expect(readouts(play(...JET, 'holdBasin')).basin).toBe(1)
    expect(readouts(play(...JET, 'holdBasin', 5.2)).basin).toBe(0)
  })

  it('lets the cold die down once the basin is up, and drops the cube two seconds later', () => {
    const up = play(...JET, 'holdBasin')
    expect(readouts(advance(up, 1)).coldJet).toBe(1)
    expect(readouts(advance(up, 1.75)).coldJet).toBeCloseTo(0.5)
    expect(readouts(advance(up, 2)).coldJet).toBe(0)
    expect(readouts(advance(up, 3.9)).cube.where).toBe('none')
    expect(readouts(advance(up, 4.1)).cube.where).toBe('falling')
  })
})

describe('out of order', () => {
  const failed = (state: SequenceState) => state.failure?.kind

  it('bursts the gauges as the engine comes up, when the logs went in out of order', () => {
    const muddled = [2, 1, 3].reduce((state, log) => load(state, log), initialState)
    expect(muddled.phase).toBe('stoking')
    expect(muddled.doom).toBe('gaugesBurst')
    const up = [2, ['openSmallValve', 1.5], 'climbLadder', ['openTopValve', -2]] as Step[]
    const starting = up.reduce<SequenceState>(
      (state, step) =>
        typeof step === 'number'
          ? advance(state, step)
          : Array.isArray(step)
            ? turn(state, ...step)
            : act(state, step),
      muddled,
    )
    expect(starting.phase).toBe('starting')
    expect(failed(advance(starting, 3))).toBe('gaugesBurst')
  })

  it("blows up the boiler when the small valve opens after the vat's", () => {
    const skipped = play(...LOAD, 2, 'climbLadder', ['openTopValve', -2])
    expect(skipped).toMatchObject({ phase: 'starting', smallShut: true, doom: null })
    expect(failed(turn(skipped, 'openSmallValve', 1.5))).toBe('boilerExplodes')
  })

  it('never makes ice when the small valve stays shut', () => {
    const skipped = [...LOAD, 2, 'climbLadder', ['openTopValve', -2], 3] as Step[]
    const up = play(...skipped, ['turnCrank', CRANK_TURNS], ['openValve', -2], 'holdBasin')
    expect(up.phase).toBe('waiting')
    expect(failed(advance(up, 4))).toBe('noIce')
  })

  it('shows a handle turning out of turn, and leaves it open when nothing breaks', () => {
    expect(readouts(play(['turnCrank', CRANK_TURNS / 2])).crank).toBeCloseTo(0.5)
    const early = play(['openSmallValve', 1.5])
    expect(early).toMatchObject({ opened: ['openSmallValve'], doom: 'pipeBurst' })
    expect(readouts(early).smallValve).toBe(1)
    // Its step counts as done when it comes: the fire lit, straight on to the ladder.
    expect(play(['openSmallValve', 1.5], ...LOAD, 2).phase).toBe('primed')
  })

  it("keeps the vat's valve out of reach till up the ladder, and nothing else once up", () => {
    expect(availableActions(play(...LOAD, 2))).not.toContain('openTopValve')
    const up = play('climbLadder')
    expect(availableActions(up)).toEqual(['openTopValve', 'reset'])
    expect(readouts(up).closeUp).toBe('vat')
    // Down again by that valve: before the fire, nothing yet, but the run is doomed.
    expect(play('climbLadder', ['openTopValve', -2])).toMatchObject({
      up: false,
      doom: 'pipeBurst',
    })
  })

  it('tears a pipe off when the crank turns before the engine runs', () => {
    expect(failed(play(['turnCrank', CRANK_TURNS]))).toBe('pipeBurst')
  })

  it('runs water out of the duct when the big valve opens before the crank is done', () => {
    expect(failed(play(...RUNNING, ['openValve', -2]))).toBe('water')
    expect(readouts(play(...RUNNING, ['openValve', -2])).closeUp).toBe('basin')
  })

  it('drops the cube on the floor when the basin does not come in time', () => {
    const lost = play(...JET, 6)
    expect(failed(lost)).toBe('cubeOnFloor')
    expect(readouts(advance(lost, 1)).cube.where).toBe('floor')
  })

  it('does nothing for a click out of turn, but breaks down when the cold should come', () => {
    const early = play(...LOAD, 'holdBasin')
    expect(early).toMatchObject({ phase: 'stoking', doom: 'pipeBurst' })
    const doomed = play(...LOAD, 'holdBasin', 2, ['openSmallValve', 1.5], 'climbLadder')
    const running = [['openTopValve', -2], 3, ['turnCrank', CRANK_TURNS]] as Step[]
    const cranked = running.reduce<SequenceState>(
      (state, step) =>
        typeof step === 'number'
          ? advance(state, step)
          : Array.isArray(step)
            ? turn(state, ...step)
            : act(state, step),
      doomed,
    )
    expect(cranked.phase).toBe('cranked')
    expect(failed(turn(cranked, 'openValve', -2))).toBe('pipeBurst')
  })

  it('shows the machine as it broke, the engine winding down, then takes a reset', () => {
    const broken = play(...RUNNING, ['openValve', -2])
    expect(readouts(broken)).toMatchObject({ engine: 1, failure: { kind: 'water', since: 0 } })
    expect(readouts(advance(broken, 5)).engine).toBe(0)
    expect(availableActions(broken)).toEqual(['reset'])
  })
})

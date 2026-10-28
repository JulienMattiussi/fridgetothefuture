import { act, advance, availableActions, load, turn } from '@/lib/sequence'
import { readouts } from '@/lib/readouts'
import {
  CRANK_TURNS,
  initialState,
  isTrap,
  isTurn,
  type SequenceState,
  STOVE_LOGS,
  turnWay,
} from '@/lib/steps'
import { JET, LOAD, play, playFrom, PRIMED, RUNNING, SERVED, type Step } from './play'

describe('the sequence', () => {
  it('lets every part be worked at first, but not reset', () => {
    expect(availableActions(initialState)).toContain('loadStove')
    expect(availableActions(initialState)).toContain('turnCrank')
    expect(availableActions(initialState)).not.toContain('reset')
  })

  it('takes nothing but a reset once over, and starts afresh', () => {
    const served = play(...SERVED)
    expect(availableActions(served)).toEqual(['reset'])
    expect(act(served, 'holdBasin').phase).toBe('served')
    expect(act(served, 'reset')).toEqual(initialState)
  })

  it('runs through the film, clicks, turns and timed stages in turn', () => {
    const phases = [
      [...LOAD],
      [...LOAD, 2],
      PRIMED,
      [...PRIMED, 'climbLadder'],
      [...PRIMED, 'climbLadder', ['openTopValve', -2]],
      RUNNING,
      [...RUNNING, ['turnCrank', CRANK_TURNS]],
      [...RUNNING, ['turnCrank', CRANK_TURNS], ['openValve', -2]],
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
      'opened',
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

  it('tells the handles from the clicks, the traps from the steps, and which way each turns', () => {
    expect(isTurn('turnCrank')).toBe(true)
    expect(isTurn('turnSideWheel')).toBe(true)
    expect(isTurn('holdBasin')).toBe(false)
    expect(isTrap('turnSideWheel')).toBe(true)
    expect(isTrap('turnCrank')).toBe(false)
    expect(turnWay('openTopValve')).toBe(-1)
    expect(turnWay('turnCrank')).toBe(1)
  })

  it('turns the awaited handle by itself when its action is played (for the end-to-end tests)', () => {
    const turning = act(play(...LOAD, 2), 'openSmallValve')
    expect(turning).toMatchObject({ phase: 'lit', auto: true })
    expect(advance(turning, 0.3).worked).toBeCloseTo(0.4)
    expect(advance(turning, 0.75).phase).toBe('primed')
  })

  it('carries leftover time into the next phase', () => {
    expect(play(...LOAD, 2.5)).toMatchObject({ phase: 'lit', elapsed: 0.5, worked: 0 })
  })

  it('takes each log once, and only before the fire', () => {
    const one = load(initialState, 1)
    expect(load(one, 1)).toBe(one)
    expect(load(play(...LOAD), 1).logs).toHaveLength(STOVE_LOGS)
  })
})

describe('out of order', () => {
  const failed = (state: SequenceState) => state.failure?.kind

  it('bursts the gauges as the engine comes up, when the logs went in out of order', () => {
    const muddled = [2, 1, 3].reduce((state, log) => load(state, log), initialState)
    expect(muddled.phase).toBe('stoking')
    expect(muddled.doom).toBe('gaugesBurst')
    const starting = playFrom(muddled, 2, ['openSmallValve', 1.5], 'climbLadder', [
      'openTopValve',
      -2,
    ])
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
    const up = play(
      ...skipped,
      ['turnCrank', CRANK_TURNS],
      ['openValve', -2],
      'pullLever',
      'holdBasin',
    )
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

  it('breaks down whenever the small handwheel by the gear train is turned', () => {
    expect(readouts(play(['turnSideWheel', 0.5])).sideWheel).toBeCloseTo(0.5)
    expect(failed(play(['turnSideWheel', 1]))).toBe('wheelOff')
    expect(failed(play(...RUNNING, ['turnSideWheel', 1]))).toBe('wheelOff')
  })

  it('lets the cold out only with the lever pulled, after the big valve', () => {
    const opened = play(...RUNNING, ['turnCrank', CRANK_TURNS], ['openValve', -2])
    expect(readouts(opened)).toMatchObject({ coldJet: 0, lever: 0 })
    expect(readouts(act(opened, 'pullLever'))).toMatchObject({ lever: 1 })
    const early = play(...RUNNING, 'pullLever')
    expect(early).toMatchObject({ doom: 'pipeBurst', leverDown: true })
    expect(readouts(early).lever).toBe(1)
    expect(availableActions(early)).not.toContain('pullLever')
  })

  it('tears a pipe off when the crank turns before the engine runs', () => {
    expect(failed(play(['turnCrank', CRANK_TURNS]))).toBe('pipeBurst')
  })

  it('runs water out of the duct when the big valve opens before the crank is done', () => {
    expect(failed(play(...RUNNING, ['openValve', -2]))).toBe('water')
    expect(readouts(play(...RUNNING, ['openValve', -2])).closeUp).toBe('basin')
  })

  it('makes no ice when the small valve stayed shut and the basin never came', () => {
    const skipped = [...LOAD, 2, 'climbLadder', ['openTopValve', -2], 3] as Step[]
    const lost = play(...skipped, ['turnCrank', CRANK_TURNS], ['openValve', -2], 'pullLever', 6)
    expect(failed(lost)).toBe('noIce')
    expect(readouts(lost).closeUp).toBe('basin')
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
    const cranked = playFrom(doomed, ['openTopValve', -2], 3, ['turnCrank', CRANK_TURNS])
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

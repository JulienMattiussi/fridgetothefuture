import { act, advance, availableActions } from '@/lib/sequence'
import { brokenFor, readouts } from '@/lib/readouts'
import { CRANK_TURNS, initialState, STOVE_LOGS } from '@/lib/steps'
import { JET, LOAD, play, RUNNING, SERVED, type Step } from './play'

describe('readouts', () => {
  it('tells how long the machine has been broken down a given way', () => {
    const broken = readouts(advance(play(['turnSideWheel', 1]), 0.5))
    expect(brokenFor(broken, 'wheelOff')).toBeCloseTo(0.5)
    expect(brokenFor(broken, 'water')).toBe(-1)
    expect(brokenFor(readouts(initialState), 'wheelOff')).toBe(-1)
  })

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
      lever: 0,
      sideWheel: 0,
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

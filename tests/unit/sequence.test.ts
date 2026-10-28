import {
  act,
  advance,
  availableActions,
  initialState,
  readouts,
  type SequenceState,
} from '@/lib/sequence'

/** Plays clicks and waits in order: a number waits that many seconds. */
function play(...steps: (Parameters<typeof act>[1] | number)[]): SequenceState {
  return steps.reduce<SequenceState>(
    (state, step) => (typeof step === 'number' ? advance(state, step) : act(state, step)),
    initialState,
  )
}

describe('the sequence', () => {
  it('only lets the valve be opened at first', () => {
    expect(availableActions(initialState)).toEqual(['openValve'])
  })

  it('ignores clicks out of turn', () => {
    expect(act(initialState, 'turnCrank')).toBe(initialState)
    expect(play('openValve', 'holdBasin')).toEqual({ phase: 'starting', elapsed: 0 })
  })

  it('runs through the film, clicks and timed stages in turn', () => {
    expect(play('openValve').phase).toBe('starting')
    expect(play('openValve', 3).phase).toBe('running')
    expect(play('openValve', 3, 'turnCrank', 4).phase).toBe('jet')
    expect(play('openValve', 3, 'turnCrank', 4, 'holdBasin', 1.2).phase).toBe('caught')
    expect(play('openValve', 3, 'turnCrank', 4, 'holdBasin', 1.2, 'useTongs').phase).toBe('served')
  })

  it('carries leftover time into the next phase', () => {
    expect(play('openValve', 3.5)).toEqual({ phase: 'running', elapsed: 0.5 })
  })

  it('waits for a click in untimed phases', () => {
    expect(play('openValve', 3, 100)).toEqual({ phase: 'running', elapsed: 100 })
  })

  it('can always be reset once started', () => {
    const served = play('openValve', 3, 'turnCrank', 4, 'holdBasin', 2, 'useTongs')
    expect(availableActions(served)).toEqual(['reset'])
    expect(act(served, 'reset')).toEqual(initialState)
  })
})

describe('readouts', () => {
  it('shows a still machine at first', () => {
    expect(readouts(initialState)).toEqual({
      engine: 0,
      shaking: 0,
      pressure: 0,
      steam: 0,
      sleeve: 0,
      coldJet: 0,
      cube: { where: 'none', fall: 0 },
    })
  })

  it('spins the engine up while starting, to full speed once running', () => {
    const half = readouts(play('openValve', 1.5)).engine
    expect(half).toBeGreaterThan(0)
    expect(half).toBeLessThan(1)
    expect(readouts(play('openValve', 3)).engine).toBe(1)
  })

  it('slides the sleeve hard left while cranking', () => {
    expect(readouts(play('openValve', 3, 'turnCrank', 2)).sleeve).toBeCloseTo(0.5)
    expect(readouts(play('openValve', 3, 'turnCrank', 4)).sleeve).toBe(1)
  })

  it('drops the cube from the duct into the basin, then into the glass', () => {
    const jet = play('openValve', 3, 'turnCrank', 4)
    expect(readouts(jet).coldJet).toBe(0)
    expect(readouts(advance(jet, 1)).coldJet).toBe(1)
    const falling = readouts(play('openValve', 3, 'turnCrank', 4, 'holdBasin', 0.6)).cube
    expect(falling.where).toBe('falling')
    expect(falling.fall).toBeGreaterThan(0)
    expect(falling.fall).toBeLessThan(1)
    const caught = play('openValve', 3, 'turnCrank', 4, 'holdBasin', 1.2)
    expect(readouts(caught).cube).toEqual({ where: 'basin', fall: 1 })
    expect(readouts(act(caught, 'useTongs')).cube.where).toBe('glass')
  })

  it('lets the cold jet die down once the cube is caught', () => {
    const caught = play('openValve', 3, 'turnCrank', 4, 'holdBasin', 1.2)
    expect(readouts(caught).coldJet).toBe(1)
    expect(readouts(advance(caught, 2)).coldJet).toBe(0)
  })
})

import { dialDesign, dialTicks } from '@/lib/gaugeDial'

describe('dialDesign', () => {
  it('draws the same dial from the same seed', () => {
    expect(dialDesign(1200)).toEqual(dialDesign(1200))
  })

  it('draws a different dial for each gauge', () => {
    const seeds = [660, 720, 770, 810, 860, 940, 970, 1040, 1180, 1680, 1820]
    const designs = new Set(seeds.map((seed) => JSON.stringify(dialDesign(seed))))
    expect(designs.size).toBe(seeds.length)
  })

  it('keeps every design within its ranges', () => {
    for (let seed = 0; seed < 50; seed++) {
      const design = dialDesign(seed)
      expect(design.sweep).toBeGreaterThanOrEqual((240 * Math.PI) / 180)
      expect(design.sweep).toBeLessThanOrEqual((300 * Math.PI) / 180)
      expect(design.ticks % design.majorEvery).toBe(0)
      expect(design.redFrom).toBeGreaterThan(0.6)
      expect(design.redFrom).toBeLessThanOrEqual(1)
    }
  })
})

describe('dialTicks', () => {
  it('spreads the graduations evenly over the arc, major at both ends', () => {
    const ticks = dialTicks({ ...dialDesign(1), sweep: Math.PI, ticks: 10, majorEvery: 5 })
    expect(ticks).toHaveLength(11)
    expect(ticks[0]).toEqual({ angle: -Math.PI / 2, major: true })
    expect(ticks[5]!.angle).toBeCloseTo(0)
    expect(ticks[10]).toEqual({ angle: Math.PI / 2, major: true })
  })
})

import { dialDesign, dialTicks, needleTemper } from '@/lib/gaugeDial'

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

describe('needleTemper', () => {
  const seeds = [660, 720, 770, 810, 860, 940, 970, 1040, 1180, 1680, 1820]
  const tempers = seeds.map(needleTemper)

  it('gives the same needle the same temper', () => {
    expect(needleTemper(1200)).toEqual(needleTemper(1200))
  })

  it('makes the needles climb at their own pace', () => {
    expect(new Set(tempers.map((t) => t.lag)).size).toBe(seeds.length)
    expect(Math.min(...tempers.map((t) => t.curve))).toBeLessThan(1)
    expect(Math.max(...tempers.map((t) => t.curve))).toBeGreaterThan(1)
  })

  it('lets some needles swing wildly while the others quiver', () => {
    const swings = tempers.map((t) => t.swing)
    expect(swings.some((swing) => swing > 0.25)).toBe(true)
    expect(swings.some((swing) => swing < 0.1)).toBe(true)
  })
})

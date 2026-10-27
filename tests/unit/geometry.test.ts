import { evenAngles, onCircle, segment } from '@/lib/geometry'

describe('segment', () => {
  it('gives the midpoint, the length and the unit direction', () => {
    expect(segment([0, 0, 0], [0, 4, 0])).toEqual({
      midpoint: [0, 2, 0],
      length: 4,
      direction: [0, 1, 0],
    })
  })

  it('handles a diagonal', () => {
    const { midpoint, length, direction } = segment([1, 1, 1], [4, 5, 1])
    expect(midpoint).toEqual([2.5, 3, 1])
    expect(length).toBe(5)
    expect(direction).toEqual([0.6, 0.8, 0])
  })

  it('refuses two identical points', () => {
    expect(() => segment([1, 2, 3], [1, 2, 3])).toThrow(RangeError)
  })
})

describe('evenAngles', () => {
  it('spreads the angles around the circle', () => {
    expect(evenAngles(4)).toEqual([0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2])
  })

  it('starts from the offset', () => {
    expect(evenAngles(2, 1)).toEqual([1, 1 + Math.PI])
  })
})

describe('onCircle', () => {
  it('places a point on the circle, in the XY plane', () => {
    const [x, y, z] = onCircle(2, Math.PI / 2, 0.5)
    expect(x).toBeCloseTo(0)
    expect(y).toBeCloseTo(2)
    expect(z).toBe(0.5)
  })
})

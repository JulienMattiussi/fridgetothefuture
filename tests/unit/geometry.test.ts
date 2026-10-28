import {
  atX,
  beltRuns,
  beltWraps,
  evenAngles,
  helixPoints,
  lerp,
  onCircle,
  ringPoint,
  roundedPath,
  segment,
} from '@/lib/geometry'

describe('beltRuns', () => {
  it('runs parallel to the center line between equal pulleys', () => {
    const runs = beltRuns({ center: [0, 0, 1], radius: 1 }, { center: [0, 4, 1], radius: 1 })
    const ends = runs.map(([from, to]) => [...from, ...to].map((v) => Math.round(v * 1e9) / 1e9))
    expect(ends).toContainEqual([-1, 0, 1, -1, 4, 1])
    expect(ends).toContainEqual([1, 0, 1, 1, 4, 1])
  })

  it('meets each pulley at a right angle to its radius', () => {
    const a = { center: [0, 0, 0] as [number, number, number], radius: 2 }
    const b = { center: [5, 1, 0] as [number, number, number], radius: 0.5 }
    for (const [from, to] of beltRuns(a, b)) {
      const run = [to[0] - from[0], to[1] - from[1]]
      expect(run[0]! * from[0] + run[1]! * from[1]).toBeCloseTo(0)
      expect(Math.hypot(from[0], from[1])).toBeCloseTo(2)
      expect(Math.hypot(to[0] - 5, to[1] - 1)).toBeCloseTo(0.5)
    }
  })

  it('refuses pulleys one inside the other', () => {
    expect(() =>
      beltRuns({ center: [0, 0, 0], radius: 2 }, { center: [0.5, 0, 0], radius: 1 }),
    ).toThrow(RangeError)
  })
})

describe('beltWraps', () => {
  it('wraps half of each of two equal pulleys, on their far sides', () => {
    const [a, b] = beltWraps({ center: [0, 0, 0], radius: 1 }, { center: [0, 4, 0], radius: 1 })
    expect(a!.sweep).toBeCloseTo(Math.PI)
    expect(b!.sweep).toBeCloseTo(Math.PI)
    // The lower pulley's arc passes under it (-Y), the upper one's over it.
    expect(Math.sin(a!.start + a!.sweep / 2)).toBeCloseTo(-1)
    expect(Math.sin(b!.start + b!.sweep / 2)).toBeCloseTo(1)
  })

  it('wraps more of the bigger pulley, the two arcs making a full turn', () => {
    const [a, b] = beltWraps({ center: [0, 0, 0], radius: 2 }, { center: [5, 1, 0], radius: 0.5 })
    expect(a!.sweep).toBeGreaterThan(Math.PI)
    expect(a!.sweep + b!.sweep).toBeCloseTo(2 * Math.PI)
  })
})

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

describe('helixPoints', () => {
  it('winds around the X axis, from one end to the other', () => {
    const points = helixPoints(2, 0.5, 4, 8)
    expect(points).toHaveLength(17)
    expect(points[0]).toEqual([-2, 0.5, 0])
    const [x, y, z] = points.at(-1)!
    expect(x).toBe(2)
    expect(y).toBeCloseTo(0.5)
    expect(z).toBeCloseTo(0)
  })

  it('keeps every point at the coil radius', () => {
    for (const [, y, z] of helixPoints(3.5, 0.2, 1)) {
      expect(Math.hypot(y, z)).toBeCloseTo(0.2)
    }
  })
})

describe('roundedPath', () => {
  it('keeps a straight run as one line', () => {
    expect(
      roundedPath(
        [
          [0, 0, 0],
          [2, 0, 0],
        ],
        0.5,
      ),
    ).toEqual([{ kind: 'line', from: [0, 0, 0], to: [2, 0, 0] }])
  })

  it('rounds a corner off, the bend starting and ending its radius away', () => {
    expect(
      roundedPath(
        [
          [0, 0, 0],
          [2, 0, 0],
          [2, 3, 0],
        ],
        0.5,
      ),
    ).toEqual([
      { kind: 'line', from: [0, 0, 0], to: [1.5, 0, 0] },
      { kind: 'bend', from: [1.5, 0, 0], corner: [2, 0, 0], to: [2, 0.5, 0] },
      { kind: 'line', from: [2, 0.5, 0], to: [2, 3, 0] },
    ])
  })

  it('shrinks the bend on a short run', () => {
    const [, bend] = roundedPath(
      [
        [0, 0, 0],
        [0.4, 0, 0],
        [0.4, 3, 0],
      ],
      0.5,
    )
    expect(bend).toEqual({
      kind: 'bend',
      from: [0.2, 0, 0],
      corner: [0.4, 0, 0],
      to: [0.4, 0.2, 0],
    })
  })

  it('adds no bend at a straight-through point', () => {
    expect(
      roundedPath(
        [
          [0, 0, 0],
          [1, 0, 0],
          [3, 0, 0],
        ],
        0.5,
      ),
    ).toEqual([{ kind: 'line', from: [0, 0, 0], to: [3, 0, 0] }])
  })
})

describe('ringPoint', () => {
  it('steps out square to the axis, toward the given side', () => {
    const [x, y, z] = ringPoint([1, 2, 3], [1, 0, 0], 0.5, [5, 0, 1])
    expect(x).toBeCloseTo(1)
    expect(y).toBeCloseTo(2)
    expect(z).toBeCloseTo(3.5)
  })
})

describe('lerp', () => {
  it('runs from the first point to the second', () => {
    expect(lerp([0, 0, 0], [2, 4, -6], 0)).toEqual([0, 0, 0])
    expect(lerp([0, 0, 0], [2, 4, -6], 0.5)).toEqual([1, 2, -3])
    expect(lerp([0, 0, 0], [2, 4, -6], 1)).toEqual([2, 4, -6])
  })
})

describe('atX', () => {
  it('finds the point of a line at a given X, inside or past its ends', () => {
    expect(atX([0, 0, 0], [2, 4, 6], 1)).toEqual([1, 2, 3])
    expect(atX([0, 0, 0], [2, 4, 6], 3)).toEqual([3, 6, 9])
  })
})

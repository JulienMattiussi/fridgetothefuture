export type Vec3 = [number, number, number]

export interface Segment {
  midpoint: Vec3
  length: number
  /** Unit vector from the start to the end. */
  direction: Vec3
}

/** What it takes to lay a beam or a pipe from one point to another. */
export function segment(from: Vec3, to: Vec3): Segment {
  const delta: Vec3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]]
  const length = Math.hypot(...delta)
  if (length === 0) {
    throw new RangeError('A segment needs two distinct points')
  }
  return {
    midpoint: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2],
    length,
    direction: [delta[0] / length, delta[1] / length, delta[2] / length],
  }
}

/** `count` angles evenly spread around a circle (spokes, gear teeth, bolts). */
export function evenAngles(count: number, offset = 0): number[] {
  return Array.from({ length: count }, (_, i) => offset + (2 * Math.PI * i) / count)
}

/** The point at `angle` on a circle of `radius` in the XY plane. */
export function onCircle(radius: number, angle: number, z = 0): Vec3 {
  return [radius * Math.cos(angle), radius * Math.sin(angle), z]
}

export interface Pulley {
  /** Center in the XY plane; the belt runs at this center's Z. */
  center: Vec3
  radius: number
}

/**
 * The two straight runs of an open belt between two pulleys in the same XY
 * plane: the outer tangents, each from the first pulley to the second.
 */
export function beltRuns(a: Pulley, b: Pulley): [Vec3, Vec3][] {
  const dx = b.center[0] - a.center[0]
  const dy = b.center[1] - a.center[1]
  const distance = Math.hypot(dx, dy)
  if (distance <= Math.abs(a.radius - b.radius)) {
    throw new RangeError('A belt needs two pulleys clear of each other')
  }
  const heading = Math.atan2(dy, dx)
  // Angle between the center line and the radius that meets the tangent.
  const spread = Math.acos((a.radius - b.radius) / distance)
  return [heading + spread, heading - spread].map((normal) => {
    const [ax, ay] = onCircle(a.radius, normal)
    const [bx, by] = onCircle(b.radius, normal)
    return [
      [a.center[0] + ax, a.center[1] + ay, a.center[2]],
      [b.center[0] + bx, b.center[1] + by, a.center[2]],
    ]
  })
}

/**
 * Points along a coil wound around the X axis, centered on the origin: a
 * copper tube coiled on itself, `turns` times over `length`.
 */
export function helixPoints(turns: number, radius: number, length: number, perTurn = 24): Vec3[] {
  const count = Math.max(1, Math.round(turns * perTurn))
  return Array.from({ length: count + 1 }, (_, i) => {
    const t = i / count
    const angle = 2 * Math.PI * turns * t
    return [length * (t - 0.5), radius * Math.cos(angle), radius * Math.sin(angle)]
  })
}

/** A piece of a pipe's center line: a straight run, or a bend around a corner. */
export type PathPiece =
  { kind: 'line'; from: Vec3; to: Vec3 } | { kind: 'bend'; from: Vec3; corner: Vec3; to: Vec3 }

/**
 * A polyline with each corner rounded off: the bend starts `bend` before the
 * corner and ends `bend` after it, less when a run is too short for that.
 * Straight-through points add no bend.
 */
export function roundedPath(points: Vec3[], bend: number): PathPiece[] {
  if (points.length < 2) {
    throw new RangeError('A path needs at least two points')
  }
  const pieces: PathPiece[] = []
  let start = points[0]!
  for (let i = 1; i < points.length - 1; i++) {
    const corner = points[i]!
    const into = segment(points[i - 1]!, corner)
    const out = segment(corner, points[i + 1]!)
    const turn = into.direction.reduce((sum, d, k) => sum + d * out.direction[k]!, 0)
    if (turn > 0.9999) continue
    const r = Math.min(bend, into.length / 2, out.length / 2)
    const from = corner.map((c, k) => c - into.direction[k]! * r) as Vec3
    const to = corner.map((c, k) => c + out.direction[k]! * r) as Vec3
    pieces.push({ kind: 'line', from: start, to: from })
    pieces.push({ kind: 'bend', from, corner, to })
    start = to
  }
  pieces.push({ kind: 'line', from: start, to: points.at(-1)! })
  return pieces
}

/**
 * The point at `distance` from `center`, square to `axis`, on the side
 * `toward` points to: where a string tied round a pipe leaves it.
 */
export function ringPoint(center: Vec3, axis: Vec3, distance: number, toward: Vec3): Vec3 {
  const axisLength = Math.hypot(...axis)
  const unit = axis.map((v) => v / axisLength)
  const along = toward.reduce((sum, v, k) => sum + v * unit[k]!, 0)
  const side = toward.map((v, k) => v - along * unit[k]!)
  const scale = distance / Math.hypot(...side)
  return center.map((v, k) => v + side[k]! * scale) as Vec3
}

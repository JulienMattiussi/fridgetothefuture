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

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

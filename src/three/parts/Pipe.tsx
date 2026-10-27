import { useMemo } from 'react'
import { CurvePath, LineCurve3, QuadraticBezierCurve3, Vector3 } from 'three'
import { roundedPath, type Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Flange } from '@/three/parts/Flange'
import { ToonMesh } from '@/three/parts/ToonMesh'

interface PipeProps {
  /** The pipe's path: straight runs between points, a curved elbow at each bend. */
  points: Vec3[]
  radius?: number
  /** The elbows' radius, where the runs leave room; tight by default. */
  bend?: number
  color?: string
  /**
   * Bolt the first point onto a tank or device: the direction into its
   * surface there (its inward normal). The pipe leaves square to it.
   */
  flangeStart?: Vec3
  /** Likewise for the last point. */
  flangeEnd?: Vec3
}

/**
 * The extra point that makes a flanged end leave its surface square: `distance`
 * back out from `at`, against `into`. None when the path's `next` point already
 * lies straight out, so the pipe never doubles back on itself.
 */
function leadOut(at: Vec3, into: Vec3, next: Vec3, distance: number): Vec3[] {
  const out = into.map((v) => -v / Math.hypot(...into)) as Vec3
  const toNext = next.map((v, k) => v - at[k]!) as Vec3
  const along = toNext.reduce((sum, v, k) => sum + v * out[k]!, 0)
  if (along > 0 && along > Math.hypot(...toNext) * 0.9999) return []
  return [[at[0] + out[0] * distance, at[1] + out[1] * distance, at[2] + out[2] * distance]]
}

/**
 * A pipe drawn as one tube along its path, its corners bent round, its ends
 * bolted on with flanges where it meets a tank or device.
 */
export function Pipe({
  points,
  radius = 0.06,
  bend = radius * 2.5,
  color = palette.steel,
  flangeStart,
  flangeEnd,
}: PipeProps) {
  // Callers pass fresh arrays each render: key the geometry on the values.
  const key = JSON.stringify({ points, flangeStart, flangeEnd })
  const { path, segments, ends } = useMemo(() => {
    const given = JSON.parse(key) as Pick<PipeProps, 'points' | 'flangeStart' | 'flangeEnd'>
    const first = given.points[0]!
    const last = given.points[given.points.length - 1]!
    // A flanged end runs straight out of its surface before any bend.
    const lead = radius * 2
    const second = given.points[1]!
    const beforeLast = given.points[given.points.length - 2]!
    const pts = [
      first,
      ...(given.flangeStart ? leadOut(first, given.flangeStart, second, lead) : []),
      ...given.points.slice(1, -1),
      ...(given.flangeEnd ? leadOut(last, given.flangeEnd, beforeLast, lead) : []),
      last,
    ]
    const curve = new CurvePath<Vector3>()
    for (const piece of roundedPath(pts, bend)) {
      const from = new Vector3(...piece.from)
      const to = new Vector3(...piece.to)
      curve.add(
        piece.kind === 'line'
          ? new LineCurve3(from, to)
          : new QuadraticBezierCurve3(from, new Vector3(...piece.corner), to),
      )
    }
    return {
      path: curve,
      segments: Math.max(8, Math.round(curve.getLength() * 30)),
      ends: {
        start: given.flangeStart && { at: first, into: given.flangeStart },
        end: given.flangeEnd && { at: last, into: given.flangeEnd },
      },
    }
  }, [key, radius, bend])
  return (
    <>
      <ToonMesh color={color}>
        <tubeGeometry args={[path, segments, radius, 14, false]} />
      </ToonMesh>
      {ends.start && <Flange {...ends.start} radius={radius} />}
      {ends.end && <Flange {...ends.end} radius={radius} />}
    </>
  )
}

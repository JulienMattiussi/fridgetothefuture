import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'
import { segment, type Vec3 } from '@/lib/geometry'

const UP = new Vector3(0, 1, 0)

/**
 * Where to put, and how to turn, a mesh built along Y (cylinder, box) so it
 * spans from `from` to `to`.
 */
export function useSegment(from: Vec3, to: Vec3) {
  const [fx, fy, fz] = from
  const [tx, ty, tz] = to
  return useMemo(() => {
    const { midpoint, length, direction } = segment([fx, fy, fz], [tx, ty, tz])
    const quaternion = new Quaternion().setFromUnitVectors(UP, new Vector3(...direction))
    return { position: midpoint, quaternion, length }
  }, [fx, fy, fz, tx, ty, tz])
}

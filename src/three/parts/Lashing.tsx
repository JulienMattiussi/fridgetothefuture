import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'

interface LashingProps {
  /** A point on the pipe's axis. */
  at: Vec3
  /** The pipe's direction there. */
  along: Vec3
  /** The pipe's radius. */
  radius: number
}

/** A turn of string tied round a pipe. */
export function Lashing({ at, along, radius }: LashingProps) {
  // A torus lies in its local XY plane: turn its Z onto the pipe's axis.
  const quaternion = useMemo(
    () =>
      new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(...along).normalize()),
    [along],
  )
  return (
    <ToonMesh position={at} quaternion={quaternion} color={palette.hay} outline={0}>
      <torusGeometry args={[radius + 0.008, 0.01, 6, 24]} />
    </ToonMesh>
  )
}

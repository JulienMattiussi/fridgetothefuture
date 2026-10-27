import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'
import { evenAngles, onCircle, type Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'

interface FlangeProps {
  /** Where the pipe meets the tank or device. */
  at: Vec3
  /** The pipe's direction there, pointing into the tank or device. */
  into: Vec3
  /** The pipe's radius. */
  radius: number
  color?: string
}

const THICKNESS = 0.025
const BOLTS = 6

/** A bolted flange: a ring of bolt heads on a plate, where a pipe meets a tank or device. */
export function Flange({ at, into, radius, color = palette.iron }: FlangeProps) {
  // Local +Z runs along the pipe into the device; the plate lies flat against it.
  const quaternion = useMemo(
    () =>
      new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(...into).normalize()),
    [into],
  )
  const plate = radius * 1.9
  const bolt = radius * 0.28
  return (
    <group position={at} quaternion={quaternion}>
      <ToonMesh position={[0, 0, -THICKNESS / 2]} rotation={[Math.PI / 2, 0, 0]} color={color}>
        <cylinderGeometry args={[plate, plate, THICKNESS, 24]} />
      </ToonMesh>
      {evenAngles(BOLTS).map((angle) => (
        <ToonMesh
          key={angle}
          position={onCircle(radius * 1.5, angle, -THICKNESS - bolt * 0.4)}
          rotation={[Math.PI / 2, 0, 0]}
          color={palette.blackIron}
          outline={0}
        >
          <cylinderGeometry args={[bolt, bolt, bolt * 0.8, 6]} />
        </ToonMesh>
      ))}
    </group>
  )
}

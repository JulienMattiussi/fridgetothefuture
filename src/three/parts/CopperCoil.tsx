import { useMemo } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { CatmullRomCurve3, Vector3 } from 'three'
import { helixPoints } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'

type CopperCoilProps = ThreeElements['group'] & {
  turns: number
  /** Radius of the coil, to the tube's center line. */
  radius: number
  length: number
  /** Radius of the copper tube itself. */
  tube?: number
}

/** A copper tube wound on itself around the X axis, centered on the group's origin. */
export function CopperCoil({ turns, radius, length, tube = 0.016, ...props }: CopperCoilProps) {
  const curve = useMemo(
    () => new CatmullRomCurve3(helixPoints(turns, radius, length).map((p) => new Vector3(...p))),
    [turns, radius, length],
  )
  return (
    <group {...props}>
      <ToonMesh color={palette.copper}>
        <tubeGeometry args={[curve, Math.round(turns * 32), tube, 8, false]} />
      </ToonMesh>
    </group>
  )
}

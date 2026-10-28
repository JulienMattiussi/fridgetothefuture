import type { ThreeElements } from '@react-three/fiber'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'

type SackProps = ThreeElements['group'] & {
  /** How big it is, slumped on the floor (the group's origin). */
  size: number
}

/** A slumped burlap sack: a squashed body sitting on the floor, its tied neck on top. */
export function Sack({ size: s, ...props }: SackProps) {
  return (
    <group {...props}>
      <ToonMesh position={[0, s * 0.42, 0]} scale={[1, 0.85, 0.8]} color={palette.burlap}>
        <sphereGeometry args={[s * 0.5, 16, 12]} />
      </ToonMesh>
      <ToonMesh position={[0, s * 0.85, 0]} color={palette.burlap}>
        <cylinderGeometry args={[s * 0.06, s * 0.14, s * 0.18, 10]} />
      </ToonMesh>
    </group>
  )
}

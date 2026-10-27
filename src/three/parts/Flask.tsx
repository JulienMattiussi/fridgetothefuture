import type { ThreeElements } from '@react-three/fiber'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'

type FlaskProps = ThreeElements['group'] & {
  radius?: number
  /** The color of what it holds, if anything. */
  liquid?: string
}

/** A round-bottom chemistry flask, its bulb centered on the group's origin. */
export function Flask({ radius = 0.08, liquid, ...props }: FlaskProps) {
  return (
    <group {...props}>
      <ToonMesh color={palette.glass} opacity={0.45}>
        <sphereGeometry args={[radius, 20, 14]} />
      </ToonMesh>
      <ToonMesh position={[0, radius * 1.5, 0]} color={palette.glass} opacity={0.45}>
        <cylinderGeometry args={[radius * 0.25, radius * 0.25, radius * 1.4, 12]} />
      </ToonMesh>
      {liquid && (
        // The lower half of the bulb, filled.
        <ToonMesh color={liquid} outline={0}>
          <sphereGeometry
            args={[radius * 0.92, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]}
          />
        </ToonMesh>
      )}
    </group>
  )
}

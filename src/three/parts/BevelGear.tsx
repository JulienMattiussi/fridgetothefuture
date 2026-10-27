import type { ThreeElements } from '@react-three/fiber'
import { evenAngles } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'

type BevelGearProps = ThreeElements['group'] & {
  radius: number
  teeth?: number
  color?: string
}

/**
 * A cast-iron bevel gear, its toothed cone facing +Y: a short cone with teeth
 * ridged across its slant, on a hub.
 */
export function BevelGear({ radius, teeth = 16, color = palette.iron, ...props }: BevelGearProps) {
  const height = radius * 0.45
  const inner = radius * 0.55
  const mid = (radius + inner) / 2
  // The slant's angle off the axis, for laying the teeth along it.
  const slope = Math.atan2(radius - inner, height)
  return (
    <group {...props}>
      <ToonMesh position={[0, height / 2, 0]} color={color}>
        <cylinderGeometry args={[inner, radius, height, 32]} />
      </ToonMesh>
      {evenAngles(teeth).map((angle) => (
        <group key={angle} rotation={[0, -angle, 0]}>
          <ToonMesh
            position={[mid + 0.006, height / 2, 0]}
            rotation={[0, 0, slope]}
            color={color}
            outline={0}
          >
            <boxGeometry
              args={[radius * 0.08, Math.hypot(radius - inner, height), (Math.PI * mid) / teeth]}
            />
          </ToonMesh>
        </group>
      ))}
      <ToonMesh position={[0, height + radius * 0.1, 0]} color={palette.steel}>
        <cylinderGeometry args={[radius * 0.22, radius * 0.22, radius * 0.25, 16]} />
      </ToonMesh>
    </group>
  )
}

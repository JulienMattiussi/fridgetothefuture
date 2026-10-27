import type { ThreeElements } from '@react-three/fiber'
import { evenAngles, onCircle } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'

type GearProps = ThreeElements['group'] & {
  radius: number
  teeth?: number
  width?: number
  color?: string
}

/** A cast-iron spur gear facing +Z. */
export function Gear({
  radius,
  teeth = 16,
  width = 0.06,
  color = palette.iron,
  ...props
}: GearProps) {
  const tooth = (Math.PI * radius) / teeth
  return (
    <group {...props}>
      <ToonMesh rotation={[Math.PI / 2, 0, 0]} color={color}>
        <cylinderGeometry args={[radius, radius, width, 32]} />
      </ToonMesh>
      {evenAngles(teeth).map((angle) => (
        <ToonMesh
          key={angle}
          position={onCircle(radius + tooth * 0.4, angle)}
          rotation={[0, 0, angle]}
          color={color}
          outline={0}
        >
          <boxGeometry args={[tooth * 0.9, tooth, width]} />
        </ToonMesh>
      ))}
      <ToonMesh rotation={[Math.PI / 2, 0, 0]} color={palette.steel}>
        <cylinderGeometry args={[radius * 0.25, radius * 0.25, width * 1.6, 16]} />
      </ToonMesh>
    </group>
  )
}

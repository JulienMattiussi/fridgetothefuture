import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSegment } from '@/three/parts/useSegment'

interface RibbedSleeveProps {
  from: Vec3
  to: Vec3
  radius: number
  ribs?: number
  color?: string
}

/** A corrugated sheet-metal sleeve, like the cold-air duct's mouth. */
export function RibbedSleeve({
  from,
  to,
  radius,
  ribs = 9,
  color = palette.steel,
}: RibbedSleeveProps) {
  const { position, quaternion, length } = useSegment(from, to)
  const pitch = length / ribs
  return (
    <group position={position} quaternion={quaternion}>
      <ToonMesh color={color}>
        <cylinderGeometry args={[radius, radius, length, 24, 1, true]} />
      </ToonMesh>
      {Array.from({ length: ribs }, (_, i) => (
        <ToonMesh
          key={i}
          position={[0, -length / 2 + pitch * (i + 0.5), 0]}
          rotation={[Math.PI / 2, 0, 0]}
          color={color}
          outline={0}
        >
          <torusGeometry args={[radius, pitch * 0.3, 6, 24]} />
        </ToonMesh>
      ))}
    </group>
  )
}

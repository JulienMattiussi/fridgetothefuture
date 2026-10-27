import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSegment } from '@/three/parts/useSegment'

interface BeamProps {
  from: Vec3
  to: Vec3
  /** Square section side, in meters. */
  size?: number
  color?: string
}

/** A square wooden beam from one point to another: posts, rails, braces. */
export function Beam({ from, to, size = 0.1, color = palette.wood }: BeamProps) {
  const { position, quaternion, length } = useSegment(from, to)
  return (
    <ToonMesh position={position} quaternion={quaternion} color={color}>
      <boxGeometry args={[size, length, size]} />
    </ToonMesh>
  )
}

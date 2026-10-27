import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSegment } from '@/three/parts/useSegment'

interface BeamProps {
  from: Vec3
  to: Vec3
  /** Section side, in meters. */
  size?: number
  /** The other section side, for a flat strip (a belt); square by default. */
  depth?: number
  color?: string
  outline?: number
}

/** A square wooden beam from one point to another: posts, rails, braces. */
export function Beam({
  from,
  to,
  size = 0.1,
  depth = size,
  color = palette.wood,
  outline,
}: BeamProps) {
  const { position, quaternion, length } = useSegment(from, to)
  return (
    <ToonMesh position={position} quaternion={quaternion} color={color} outline={outline}>
      <boxGeometry args={[size, length, depth]} />
    </ToonMesh>
  )
}

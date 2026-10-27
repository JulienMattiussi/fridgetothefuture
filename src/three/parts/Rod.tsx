import type { Vec3 } from '@/lib/geometry'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSegment } from '@/three/parts/useSegment'

interface RodProps {
  from: Vec3
  to: Vec3
  radius: number
  color: string
  outline?: number
}

/** A round bar from one point to another: pipe run, spoke, axle, post. */
export function Rod({ from, to, radius, color, outline }: RodProps) {
  const { position, quaternion, length } = useSegment(from, to)
  return (
    <ToonMesh position={position} quaternion={quaternion} color={color} outline={outline}>
      <cylinderGeometry args={[radius, radius, length, 16]} />
    </ToonMesh>
  )
}

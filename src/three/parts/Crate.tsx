import type { ThreeElements } from '@react-three/fiber'
import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'

type CrateProps = ThreeElements['group'] & {
  /** Width, height and depth, its bottom on the group's origin. */
  size: Vec3
  color?: string
}

/** A rough wooden crate: a box with two battens round it, standing on its bottom. */
export function Crate({ size, color = palette.shadowWood, ...props }: CrateProps) {
  const [w, h, d] = size
  return (
    <group {...props}>
      <ToonMesh position={[0, h / 2, 0]} color={color}>
        <boxGeometry args={[w, h, d]} />
      </ToonMesh>
      {/* Battens nailed round it, a little proud of its sides. */}
      {[0.2, 0.8].map((at) => (
        <ToonMesh key={at} position={[0, h * at, 0]} color={palette.shadowWoodDeep} outline={0}>
          <boxGeometry args={[w + 0.012, 0.04, d + 0.012]} />
        </ToonMesh>
      ))}
    </group>
  )
}

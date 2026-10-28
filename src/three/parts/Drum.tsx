import type { ThreeElements } from '@react-three/fiber'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'

type DrumProps = ThreeElements['group'] & {
  radius: number
  height: number
  color?: string
}

/** An iron drum standing on its bottom (the group's origin): a cylinder with two rolled hoops. */
export function Drum({ radius, height, color = palette.shadowIron, ...props }: DrumProps) {
  return (
    <group {...props}>
      <ToonMesh position={[0, height / 2, 0]} color={color}>
        <cylinderGeometry args={[radius, radius, height, 24]} />
      </ToonMesh>
      {[0.25, 0.75].map((at) => (
        <ToonMesh
          key={at}
          position={[0, height * at, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          color={palette.shadowSteel}
          outline={0}
        >
          <torusGeometry args={[radius + 0.005, 0.012, 6, 32]} />
        </ToonMesh>
      ))}
    </group>
  )
}

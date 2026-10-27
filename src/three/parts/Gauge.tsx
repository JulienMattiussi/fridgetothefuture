import type { ThreeElements } from '@react-three/fiber'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'

type GaugeProps = ThreeElements['group'] & {
  radius?: number
  /** Needle angle in radians, 0 pointing up, positive clockwise. */
  reading?: number
  /** Dial color; a dark dial takes a light needle. */
  face?: string
  needle?: string
}

/** A brass pressure gauge facing +Z. */
export function Gauge({
  radius = 0.1,
  reading = -0.8,
  face = palette.dial,
  needle = palette.ink,
  ...props
}: GaugeProps) {
  return (
    <group {...props}>
      <ToonMesh rotation={[Math.PI / 2, 0, 0]} color={face}>
        <cylinderGeometry args={[radius, radius, radius * 0.4, 32]} />
      </ToonMesh>
      <ToonMesh position={[0, 0, radius * 0.2]} color={palette.brass}>
        <torusGeometry args={[radius, radius * 0.12, 8, 32]} />
      </ToonMesh>
      <group position={[0, 0, radius * 0.22]} rotation={[0, 0, -reading]}>
        <ToonMesh position={[0, radius * 0.4, 0]} color={needle} outline={0}>
          <boxGeometry args={[radius * 0.08, radius * 0.8, radius * 0.04]} />
        </ToonMesh>
      </group>
    </group>
  )
}

import type { ThreeElements } from '@react-three/fiber'
import { evenAngles, onCircle } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'

type WheelProps = ThreeElements['group'] & {
  radius: number
  spokes?: number
  color?: string
  /** The iron tire around a wagon wheel's rim; none on a valve handwheel. */
  tire?: boolean
}

/** A spoked wheel facing +Z: wagon wheel turned flywheel, or valve handwheel. */
export function Wheel({
  radius,
  spokes = 12,
  color = palette.woodLight,
  tire = true,
  ...props
}: WheelProps) {
  const rim = radius * 0.08
  const spoke = radius * 0.035
  return (
    <group {...props}>
      <ToonMesh color={color}>
        <torusGeometry args={[radius - rim, rim, 10, 48]} />
      </ToonMesh>
      {tire && (
        <ToonMesh color={palette.iron} outline={0}>
          <torusGeometry args={[radius - rim * 0.2, rim * 0.5, 8, 48]} />
        </ToonMesh>
      )}
      {evenAngles(spokes).map((angle) => (
        <Rod
          key={angle}
          from={[0, 0, 0]}
          to={onCircle(radius - rim, angle)}
          radius={spoke}
          color={color}
        />
      ))}
      <ToonMesh rotation={[Math.PI / 2, 0, 0]} color={palette.iron}>
        <cylinderGeometry args={[radius * 0.16, radius * 0.16, radius * 0.3, 20]} />
      </ToonMesh>
    </group>
  )
}

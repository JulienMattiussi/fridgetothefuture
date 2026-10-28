import type { ThreeElements } from '@react-three/fiber'
import { DoubleSide, Path, Shape } from 'three'
import { evenAngles, onCircle } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'

type WheelProps = ThreeElements['group'] & {
  radius: number
  spokes?: number
  color?: string
  /** The flat iron tire round a wagon wheel's rim; none on a valve handwheel. */
  tire?: boolean
  /** A flat-faced rim, square in section (a cast flywheel), instead of a round one. */
  flatRim?: boolean
  /** An unseen disc across the whole wheel, so a handwheel is taken between its spokes too. */
  grip?: boolean
}

/** A flat ring in the XY plane, from `inner` to `outer`, extruded `depth` along Z. */
function ringShape(inner: number, outer: number) {
  const shape = new Shape()
  shape.absarc(0, 0, outer, 0, Math.PI * 2, false)
  const hole = new Path()
  hole.absarc(0, 0, inner, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  return shape
}

/** A spoked wheel facing +Z: wagon wheel turned flywheel, or valve handwheel. */
export function Wheel({
  radius,
  spokes = 12,
  color = palette.woodLight,
  tire = true,
  flatRim = false,
  grip = false,
  ...props
}: WheelProps) {
  const rim = radius * 0.08
  const spoke = radius * 0.035
  return (
    <group {...props}>
      {flatRim ? (
        <ToonMesh position={[0, 0, -rim * 1.5]} color={color}>
          <extrudeGeometry
            args={[
              ringShape(radius - rim, radius),
              { depth: rim * 3, bevelEnabled: false, curveSegments: 48 },
            ]}
          />
        </ToonMesh>
      ) : (
        <ToonMesh color={color}>
          <torusGeometry args={[radius - rim, rim, 10, 48]} />
        </ToonMesh>
      )}
      {/* The tire: a flat iron band shrunk round the felloe. */}
      {tire && (
        <ToonMesh rotation={[Math.PI / 2, 0, 0]} color={palette.iron} side={DoubleSide}>
          {/* As wide as the felloe: a flat one is wider than a round one. */}
          <cylinderGeometry args={[radius, radius, rim * (flatRim ? 3.2 : 2.6), 48, 1, true]} />
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
      {grip && (
        // Drawn but never seen: hidden objects don't catch the pointer.
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius, radius, radius * 0.3, 24]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      )}
    </group>
  )
}

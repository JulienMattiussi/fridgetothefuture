import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { Wheel } from '@/three/parts/Wheel'
import { layout } from '@/three/machine/layout'

const { wheelAxle } = layout
const [axleLeft, axleRight] = wheelAxle.wheels as [number, number]
/** The frame's front posts that stand on the axle, through bearing blocks. */
const BEARINGS = layout.deckPosts

/** The lone wagon wheel at the back right, on a stub axle held by a post. */
const BACK_WHEEL = { center: [1.3, 0.75, -0.65] as Vec3, radius: 0.5, axleHalf: 0.3 }

/**
 * Old wagon wheels built into the machine. As on a cart, they stand along the
 * machine's depth, on axles running left-right. They never turn in the film:
 * they stay still while the machine runs. The two on the left share one axle,
 * which carries the frame's front posts above it.
 */
export function WagonWheels() {
  const { y, z, radius } = wheelAxle
  const [bx, by, bz] = BACK_WHEEL.center
  return (
    <group>
      {wheelAxle.wheels.map((x) => (
        <Wheel key={x} position={[x, y, z]} rotation={[0, Math.PI / 2, 0]} radius={radius} />
      ))}
      <Rod
        from={[axleLeft - 0.08, y, z]}
        to={[axleRight + 0.08, y, z]}
        radius={0.035}
        color={palette.steel}
      />
      {BEARINGS.map((x) => (
        <ToonMesh key={x} position={[x, y + 0.02, z]} color={palette.iron}>
          <boxGeometry args={[0.14, 0.12, 0.14]} />
        </ToonMesh>
      ))}
      <Wheel
        position={BACK_WHEEL.center}
        rotation={[0, Math.PI / 2, 0]}
        radius={BACK_WHEEL.radius}
      />
      <Rod
        from={[bx - BACK_WHEEL.axleHalf, by, bz]}
        to={[bx + BACK_WHEEL.axleHalf, by, bz]}
        radius={0.03}
        color={palette.steel}
      />
      <Beam
        from={[bx - BACK_WHEEL.axleHalf, 0, bz]}
        to={[bx - BACK_WHEEL.axleHalf, by + 0.08, bz]}
      />
    </group>
  )
}

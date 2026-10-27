import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { Rod } from '@/three/parts/Rod'
import { Wheel } from '@/three/parts/Wheel'

/**
 * Old wagon wheels built into the machine. As on a cart, they stand along the
 * machine's depth, each on an axle running left-right, held by a post on one
 * side (`bearing`: -1 left, 1 right). They never turn in the film: they stay
 * still while the machine runs.
 */
const wagonWheels: { center: Vec3; radius: number; bearing: -1 | 1 }[] = [
  // Left of the workbench, under the boiler's left flank, as in the film.
  { center: [-0.45, 0.55, 0.65], radius: 0.45, bearing: -1 },
  { center: [-1.45, 0.42, -0.45], radius: 0.4, bearing: 1 },
  { center: [1.3, 0.75, -0.65], radius: 0.5, bearing: -1 },
]
const AXLE_HALF = 0.3

export function WagonWheels() {
  return (
    <group>
      {wagonWheels.map(({ center, radius, bearing }) => {
        const [x, y, z] = center
        const bearingX = x + bearing * AXLE_HALF
        return (
          <group key={center.join(':')}>
            <Wheel position={center} rotation={[0, Math.PI / 2, 0]} radius={radius} />
            <Rod
              from={[x - AXLE_HALF, y, z]}
              to={[x + AXLE_HALF, y, z]}
              radius={0.03}
              color={palette.steel}
            />
            <Beam from={[bearingX, 0, z]} to={[bearingX, y + 0.08, z]} />
          </group>
        )
      })}
    </group>
  )
}

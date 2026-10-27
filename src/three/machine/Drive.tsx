import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { Gear } from '@/three/parts/Gear'
import { Rod } from '@/three/parts/Rod'
import { Wheel } from '@/three/parts/Wheel'
import { layout } from '@/three/machine/layout'

/** Wagon wheels reused as flywheels, each on an axle running to the back. */
const flywheels: { center: Vec3; radius: number; spokes?: number; color?: string }[] = [
  { center: [-0.42, 0.47, 0.32], radius: 0.45 },
  { center: [-1.45, 0.42, -0.45], radius: 0.4 },
  { center: [1.3, 0.75, -0.55], radius: 0.5 },
  // The small iron flywheel up on the deck.
  { center: [-0.85, layout.deckY + 0.4, -0.3], radius: 0.32, spokes: 6, color: palette.iron },
]

const AXLE_BACK = -1.05

/** The wheels and gears that the engine sets turning. */
export function Drive() {
  return (
    <group>
      {flywheels.map(({ center, radius, spokes, color }) => {
        const [x, y] = center
        return (
          <group key={center.join(':')}>
            <Wheel position={center} radius={radius} spokes={spokes} color={color} />
            <Rod from={center} to={[x, y, AXLE_BACK]} radius={0.03} color={palette.steel} />
            {/* The axle's bearing post at the back. */}
            <Beam from={[x, y < 1 ? 0 : layout.deckY, AXLE_BACK]} to={[x, y + 0.1, AXLE_BACK]} />
          </group>
        )
      })}
      <Gear position={[-0.42, layout.deckY + 0.28, -0.25]} radius={0.16} teeth={18} />
      <Gear
        position={[-0.17, layout.deckY + 0.2, -0.25]}
        radius={0.09}
        teeth={10}
        rotation={[0, 0, 0.15]}
      />
    </group>
  )
}

import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { Belt } from '@/three/parts/Belt'
import { Gear } from '@/three/parts/Gear'
import { Rod } from '@/three/parts/Rod'
import { Wheel } from '@/three/parts/Wheel'
import { layout } from '@/three/machine/layout'

/** The small iron flywheel up on the deck, facing front, its axle to the back. */
const deckFlywheel = { center: [-0.85, layout.deckY + 0.45, -0.3] as Vec3, radius: 0.3 }
const AXLE_BACK = -1.05

/** The deck flywheel is belted up to a pulley on the line shaft under the roof. */
const SHAFT = { y: 3.75, z: deckFlywheel.center[2], left: -2.0, right: 1.3 }
const shaftPulley = { center: [deckFlywheel.center[0], SHAFT.y, SHAFT.z] as Vec3, radius: 0.14 }

/** The big valve handwheel on the right of the frame, by the workbench. */
const HANDWHEEL: Vec3 = [1.8, 1.38, 0.33]

/**
 * The moving parts that the engine drives: the deck flywheel, its gears, the
 * belt up to the line shaft, and the right-hand valve handwheel.
 */
export function Drive() {
  return (
    <group>
      <Wheel {...deckFlywheel} position={deckFlywheel.center} spokes={6} color={palette.iron} />
      <Rod
        from={deckFlywheel.center}
        to={[deckFlywheel.center[0], deckFlywheel.center[1], AXLE_BACK]}
        radius={0.03}
        color={palette.steel}
      />
      <Gear position={[-0.42, layout.deckY + 0.28, -0.25]} radius={0.16} teeth={18} />
      <Gear
        position={[-0.17, layout.deckY + 0.2, -0.25]}
        radius={0.09}
        teeth={10}
        rotation={[0, 0, 0.15]}
      />
      <Rod
        from={[SHAFT.left, SHAFT.y, SHAFT.z]}
        to={[SHAFT.right, SHAFT.y, SHAFT.z]}
        radius={0.03}
        color={palette.steel}
      />
      {[SHAFT.left + 0.2, 0.2, SHAFT.right - 0.1].map((x) => (
        <Beam key={x} from={[x, SHAFT.y, SHAFT.z]} to={[x, 4.6, SHAFT.z]} size={0.08} />
      ))}
      <Wheel
        {...shaftPulley}
        position={shaftPulley.center}
        spokes={4}
        tire={false}
        color={palette.iron}
      />
      <Belt from={deckFlywheel} to={shaftPulley} />
      <Rod
        from={HANDWHEEL}
        to={[HANDWHEEL[0], HANDWHEEL[1], HANDWHEEL[2] - 0.15]}
        radius={0.025}
        color={palette.steel}
      />
      <Wheel position={HANDWHEEL} radius={0.24} spokes={6} tire={false} color={palette.iron} />
      <Gear position={[2.12, 1.2, 0.3]} radius={0.09} teeth={12} />
    </group>
  )
}

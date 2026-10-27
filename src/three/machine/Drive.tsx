import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { Belt } from '@/three/parts/Belt'
import { Gear } from '@/three/parts/Gear'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { Wheel } from '@/three/parts/Wheel'
import { layout } from '@/three/machine/layout'

const { deckY } = layout
/** A quarter turn about Y: a wheel facing +Z turned to face along X. */
const EDGE_ON: [number, number, number] = [0, Math.PI / 2, 0]
/**
 * The big iron flywheel up on the deck, edge-on: its axle runs left-right,
 * across into the bearing frame, like the line shaft above it.
 */
const deckFlywheel = { center: [-1.6, deckY + 0.42, -0.4] as Vec3, radius: 0.36 }

/** The deck flywheel is belted up to a pulley on the line shaft under the roof. */
const SHAFT = { y: 3.75, z: deckFlywheel.center[2], left: -2.2, right: 1.3 }
/**
 * The belt runs on a small pulley on the flywheel's axle, beside its hub, not
 * on the flywheel's rim.
 */
const hubPulley = {
  center: [deckFlywheel.center[0] + 0.09, deckFlywheel.center[1], deckFlywheel.center[2]] as Vec3,
  radius: 0.1,
}
const shaftPulley = { center: [hubPulley.center[0], SHAFT.y, SHAFT.z] as Vec3, radius: 0.14 }

/**
 * Right of it, a wooden bearing frame on the deck carries a front-to-back
 * axle: a flat disc on it, a small handwheel at its front, and a spur gear
 * driving a smaller one below.
 */
const HUB = { x: -1.05, y: deckY + 0.42, back: -0.65, front: 0.12 }
const FRAME = { xs: [-1.24, -0.86], z: -0.5, top: deckY + 0.62 }
const DISC = { z: -0.4, radius: 0.17 }
const BIG_GEAR = { z: -0.18, radius: 0.11 }
const SMALL_GEAR = { radius: 0.065 }
const SMALL_GEAR_AT: Vec3 = [
  HUB.x + (BIG_GEAR.radius + SMALL_GEAR.radius) * Math.sin(2.4),
  HUB.y + (BIG_GEAR.radius + SMALL_GEAR.radius) * Math.cos(2.4),
  BIG_GEAR.z,
]
/** Further right, a small disc on its own stand, worked by a rod off the big gear. */
const SIDE_DISC = { at: [-0.72, deckY + 0.3, -0.18] as Vec3, radius: 0.1 }
const CRANK_PIN: Vec3 = [HUB.x + 0.07, HUB.y - 0.04, BIG_GEAR.z + 0.03]
const SIDE_PIN: Vec3 = [SIDE_DISC.at[0] - 0.06, SIDE_DISC.at[1], SIDE_DISC.at[2] + 0.03]

/**
 * The moving parts on the deck that the engine drives (after the film's shot
 * of the deck): the big flywheel belted up to the line shaft, and the bearing
 * frame with its disc, handwheel and gears, rodded to a small side disc. The
 * valve gear on the right is ValveGear.
 */
export function Drive() {
  return (
    <group>
      <Wheel
        {...deckFlywheel}
        position={deckFlywheel.center}
        rotation={EDGE_ON}
        spokes={6}
        tire={false}
        color={palette.iron}
      />
      <Rod
        from={deckFlywheel.center}
        to={[FRAME.xs[0]!, deckFlywheel.center[1], deckFlywheel.center[2]]}
        radius={0.03}
        color={palette.steel}
      />
      {/* The bearing frame: two posts and a cap across them. */}
      {FRAME.xs.map((x) => (
        <Beam key={x} from={[x, deckY, FRAME.z]} to={[x, FRAME.top, FRAME.z]} size={0.08} />
      ))}
      <Beam
        from={[FRAME.xs[0]! - 0.06, FRAME.top, FRAME.z]}
        to={[FRAME.xs[1]! + 0.06, FRAME.top, FRAME.z]}
        size={0.08}
      />
      <Beam
        from={[FRAME.xs[0]!, HUB.y, FRAME.z]}
        to={[FRAME.xs[1]!, HUB.y, FRAME.z]}
        size={0.06}
        color={palette.woodDark}
      />
      <Rod
        from={[HUB.x, HUB.y, HUB.back]}
        to={[HUB.x, HUB.y, HUB.front]}
        radius={0.02}
        color={palette.steel}
      />
      <ToonMesh
        position={[HUB.x, HUB.y, DISC.z]}
        rotation={[Math.PI / 2, 0, 0]}
        color={palette.dial}
      >
        <cylinderGeometry args={[DISC.radius, DISC.radius, 0.025, 40]} />
      </ToonMesh>
      <Gear
        position={[HUB.x, HUB.y, BIG_GEAR.z]}
        radius={BIG_GEAR.radius}
        teeth={16}
        width={0.035}
      />
      <Gear position={SMALL_GEAR_AT} radius={SMALL_GEAR.radius} teeth={10} width={0.035} />
      <Rod
        from={[SMALL_GEAR_AT[0], SMALL_GEAR_AT[1], FRAME.z]}
        to={SMALL_GEAR_AT}
        radius={0.014}
        color={palette.steel}
      />
      <Wheel
        position={[HUB.x, HUB.y, HUB.front]}
        radius={0.09}
        spokes={5}
        tire={false}
        color={palette.iron}
      />
      {/* The side disc on its stand, and the rod from the big gear's crank pin. */}
      <Beam
        from={[SIDE_DISC.at[0], deckY, SIDE_DISC.at[2] - 0.06]}
        to={[SIDE_DISC.at[0], SIDE_DISC.at[1], SIDE_DISC.at[2] - 0.06]}
        size={0.06}
      />
      <ToonMesh position={SIDE_DISC.at} rotation={[Math.PI / 2, 0, 0]} color={palette.dial}>
        <cylinderGeometry args={[SIDE_DISC.radius, SIDE_DISC.radius, 0.03, 32]} />
      </ToonMesh>
      <Rod from={CRANK_PIN} to={SIDE_PIN} radius={0.012} color={palette.iron} />
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
        rotation={EDGE_ON}
        spokes={4}
        tire={false}
        color={palette.iron}
      />
      {/* The belt, in the wheels' upright plane: drawn flat, then turned into it. */}
      <ToonMesh position={hubPulley.center} rotation={[0, 0, Math.PI / 2]} color={palette.iron}>
        <cylinderGeometry args={[hubPulley.radius, hubPulley.radius, 0.08, 24]} />
      </ToonMesh>
      <group position={[hubPulley.center[0], 0, hubPulley.center[2]]} rotation={EDGE_ON}>
        <Belt
          from={{ center: [0, hubPulley.center[1], 0], radius: hubPulley.radius }}
          to={{ center: [0, SHAFT.y, 0], radius: shaftPulley.radius }}
        />
      </group>
    </group>
  )
}

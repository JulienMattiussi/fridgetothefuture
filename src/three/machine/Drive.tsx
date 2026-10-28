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
/** The deck sits forward of the rest of the frame: shift its machinery along. */
const DECK_SHIFT = layout.deckFront - layout.frameFront
/** A quarter turn about Y: a wheel facing +Z turned to face along X. */
const EDGE_ON: [number, number, number] = [0, Math.PI / 2, 0]
/**
 * The big iron flywheel up on the deck, edge-on: its axle runs left-right,
 * across into the bearing frame, like the line shaft above it.
 */
const deckFlywheel = { center: [-1.6, deckY + 0.42, 0.05] as Vec3, radius: 0.36 }
/** A short wooden post on the deck holds the flywheel axle's other end. */
const AXLE_POST_X = -1.25

/** The deck flywheel is belted up to a pulley on the line shaft under the roof. */
const SHAFT = { y: 5.2, z: deckFlywheel.center[2], left: -2.2, right: 1.3 }
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
 * Right of it, a front-to-back axle: a flat pulley disc well to the front, a
 * small handwheel ahead of it, a spur gear driving a smaller one below, and
 * at the back a crank working the bellows housed in the wooden arch there.
 */
const HUB = { x: -1.05, y: deckY + 0.42, back: -0.5, front: 0.32 }
const FRAME = { xs: [-1.34, -0.76], z: -0.5, top: deckY + 1.1 }
const DISC = { z: 0.15, radius: 0.17 }
const BIG_GEAR = { z: -0.05, radius: 0.11 }
/**
 * The round bellows hangs from the arch's cap: a fixed disc up top, a moving
 * one below, leather folds between. A rod from the crank pushes the moving board
 * up and down (`open`: its height above the deck, at rest).
 */
const BELLOWS = { radius: 0.2, top: FRAME.top - 0.07, open: deckY + 0.58, folds: 6 }
const CRANK = { z: -0.42, throw: 0.08 }
const CRANK_TOP: Vec3 = [HUB.x, HUB.y + CRANK.throw, CRANK.z]
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
 * of the deck): the big flywheel belted up to the line shaft, and the axle
 * with its pulley disc, handwheel and gears, rodded to a small side disc and
 * cranking a bellows housed in the wooden arch behind. The valve gear on the
 * right is ValveGear.
 */
export function Drive() {
  return (
    // Everything here was laid out for the frame's front; it follows the deck's.
    <group position={[0, 0, DECK_SHIFT]}>
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
        to={[AXLE_POST_X, deckFlywheel.center[1], deckFlywheel.center[2]]}
        radius={0.03}
        color={palette.steel}
      />
      <Beam
        from={[AXLE_POST_X, deckY, deckFlywheel.center[2]]}
        to={[AXLE_POST_X, deckFlywheel.center[1] + 0.05, deckFlywheel.center[2]]}
        size={0.07}
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
      {/* The bellows in the arch, and the crank and rod working it. */}
      {[BELLOWS.top, BELLOWS.open].map((y) => (
        <ToonMesh key={y} position={[HUB.x, y, FRAME.z]} color={palette.woodDark}>
          <cylinderGeometry args={[BELLOWS.radius, BELLOWS.radius, 0.04, 32]} />
        </ToonMesh>
      ))}
      {Array.from({ length: BELLOWS.folds }, (_, i) => {
        const y = BELLOWS.open + ((i + 0.5) * (BELLOWS.top - BELLOWS.open)) / BELLOWS.folds
        const r = BELLOWS.radius - (i % 2 === 0 ? 0.05 : 0.015)
        return (
          <ToonMesh key={i} position={[HUB.x, y, FRAME.z]} color={palette.leather}>
            <cylinderGeometry args={[r, r, (BELLOWS.top - BELLOWS.open) / BELLOWS.folds, 32]} />
          </ToonMesh>
        )
      })}
      <ToonMesh
        position={[HUB.x, HUB.y, CRANK.z]}
        rotation={[Math.PI / 2, 0, 0]}
        color={palette.iron}
      >
        <cylinderGeometry args={[CRANK.throw + 0.025, CRANK.throw + 0.025, 0.03, 24]} />
      </ToonMesh>
      <Rod
        from={CRANK_TOP}
        to={[HUB.x, BELLOWS.open, CRANK.z]}
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
        <Beam key={x} from={[x, SHAFT.y, SHAFT.z]} to={[x, SHAFT.y + 0.8, SHAFT.z]} size={0.08} />
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

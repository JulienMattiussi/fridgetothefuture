import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { BOARD_THICKNESS, onBoard } from '@/three/parts/boardTop'
import { Crate } from '@/three/parts/Crate'
import { Pipe } from '@/three/parts/Pipe'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { CLUTTER_PIPE, DECK_UNDER } from '@/three/machine/clutter/anchors'

/**
 * A wooden rack standing in the middle of the left frame, over the barrel:
 * four legs, two levels. It stays clear of the orange pipe down the frame's
 * left side, of the crates behind it, and of the pipes up into the deck in
 * front of it.
 */
const RACK = { left: -1.6, right: -1.27, back: -0.5, front: 0.12, leg: 0.05 }
const LEVELS = [1.05, 1.75]
const ON_LOW = onBoard(LEVELS[0]!)
const ON_HIGH = onBoard(LEVELS[1]!)
const TOP = LEVELS[1]! + BOARD_THICKNESS / 2
/** The iron housing on the top level, piped up into the deck, in front of the orange pipe. */
const HOUSING = { x: -1.45, z: -0.05, size: [0.3, 0.3, 0.25] as [number, number, number] }

export function LeftRack() {
  const x = (RACK.left + RACK.right) / 2
  const z = (RACK.back + RACK.front) / 2
  return (
    <group>
      {[RACK.left, RACK.right].flatMap((lx) =>
        [RACK.back, RACK.front].map((lz) => (
          <Beam
            key={`${lx}:${lz}`}
            from={[lx, 0, lz]}
            to={[lx, TOP, lz]}
            size={RACK.leg}
            color={palette.shadowWoodDeep}
          />
        )),
      )}
      {LEVELS.map((y) => (
        <ToonMesh key={y} position={[x, y, z]} color={palette.shadowWood}>
          <boxGeometry
            args={[
              RACK.right - RACK.left + RACK.leg,
              BOARD_THICKNESS,
              RACK.front - RACK.back + RACK.leg,
            ]}
          />
        </ToonMesh>
      ))}
      {/* The lower level: two crates and a can. */}
      <Crate position={[-1.5, ON_LOW, -0.3]} size={[0.2, 0.28, 0.3]} />
      <Crate
        position={[-1.36, ON_LOW, 0.0]}
        rotation={[0, 0.3, 0]}
        size={[0.16, 0.2, 0.16]}
        color={palette.shadowWoodDeep}
      />
      <ToonMesh position={[-1.52, ON_LOW + 0.11, 0.0]} color={palette.shadowIron}>
        <cylinderGeometry args={[0.05, 0.05, 0.22, 12]} />
      </ToonMesh>
      {/* The top level: a crate, and the iron housing piped into the deck. */}
      <Crate position={[-1.43, ON_HIGH, -0.36]} size={[0.26, 0.22, 0.2]} />
      <Crate
        position={[HOUSING.x, ON_HIGH, HOUSING.z]}
        size={HOUSING.size}
        color={palette.shadowIron}
      />
      <Pipe
        points={[
          [HOUSING.x, ON_HIGH + HOUSING.size[1], HOUSING.z + 0.05],
          [HOUSING.x, DECK_UNDER, HOUSING.z + 0.05],
        ]}
        radius={CLUTTER_PIPE}
        color={palette.shadowSteel}
        flangeStart={[0, -1, 0]}
        flangeEnd={[0, 1, 0]}
      />
    </group>
  )
}

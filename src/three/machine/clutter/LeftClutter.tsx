import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { Crate } from '@/three/parts/Crate'
import { Drum } from '@/three/parts/Drum'
import { Pipe } from '@/three/parts/Pipe'
import { Rod } from '@/three/parts/Rod'
import { Sack } from '@/three/parts/Sack'
import { LeftRack } from '@/three/machine/clutter/LeftRack'
import { onBoard } from '@/three/parts/boardTop'
import { ShelfBoard } from '@/three/parts/ShelfBoard'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'
import { CLUTTER_PIPE, DECK_UNDER, WALL_FACE } from '@/three/machine/clutter/anchors'

const [postL, postR] = layout.deckPosts
/** The back shelf board across the deck's back posts, resting on cleats nailed to them. */
const BOARD = { y: 1.5, back: -1.05, front: -0.75 }
const ON_BOARD = onBoard(BOARD.y)
/** A third pipe up into the deck, by its right post. */
const THIRD_RISER: [number, number] = [-0.85, 0.27]
/** The pipe across from it to the others. */
const CROSS = { y: 1.1, radius: 0.025 }
/** A slimmer tank under that pipe, piped up into it. */
const SMALL_TANK = { x: -1.08, z: THIRD_RISER[1], height: 0.95 }
/** The iron housing on it. */
const HOUSING_HEIGHT = 0.5
/** The tank standing in the corner, its pipes up into the deck and back into the wall. */
const TANK = { x: -1.0, z: -0.65, radius: 0.22, height: 1.0 }

/**
 * The dark jumble inside the left frame, under the deck: crates stacked on
 * the floor with planks leaning on them, an iron tank piped up into the
 * deck and back into the wall, a pipe up the back wall, two up into the deck,
 * sacks on the floor, a rope and hook hanging from the deck, and a shelf
 * board across the back posts with boxes stacked on it, and odds and ends.
 */
export function LeftClutter() {
  return (
    <group>
      {/* Crates, one on the other. */}
      <Crate position={[-1.5, 0, -0.75]} size={[0.45, 0.4, 0.4]} />
      <Crate position={[-1.48, 0.4, -0.8]} rotation={[0, 0.2, 0]} size={[0.32, 0.3, 0.32]} />
      <Drum position={[TANK.x, 0, TANK.z]} radius={TANK.radius} height={TANK.height} />
      <Pipe
        points={[
          [TANK.x, TANK.height, TANK.z],
          [TANK.x, DECK_UNDER, TANK.z],
        ]}
        radius={CLUTTER_PIPE}
        color={palette.shadowSteel}
        flangeStart={[0, -1, 0]}
        flangeEnd={[0, 1, 0]}
      />
      <Pipe
        points={[
          [TANK.x, 0.6, TANK.z - TANK.radius],
          [TANK.x, 0.6, WALL_FACE],
        ]}
        radius={CLUTTER_PIPE}
        color={palette.shadowSteel}
        flangeStart={[0, 0, 1]}
        flangeEnd={[0, 0, -1]}
      />
      {/* A pipe up the back wall from the floor, turning into the wall up high. */}
      <Pipe
        points={[
          [-1.3, 0, -1.19],
          [-1.3, 2.3, -1.19],
          [-1.3, 2.3, WALL_FACE],
        ]}
        radius={0.035}
        bend={0.08}
        color={palette.shadowSteel}
        flangeStart={[0, -1, 0]}
        flangeEnd={[0, 0, -1]}
      />
      {/* A second, slimmer tank up front, piped into the pipe across. */}
      <Drum position={[SMALL_TANK.x, 0, SMALL_TANK.z]} radius={0.15} height={SMALL_TANK.height} />
      <Pipe
        points={[
          [SMALL_TANK.x, SMALL_TANK.height, SMALL_TANK.z],
          [SMALL_TANK.x, CROSS.y - CROSS.radius, SMALL_TANK.z],
        ]}
        radius={0.025}
        color={palette.shadowSteel}
        flangeStart={[0, -1, 0]}
      />
      <LeftRack />
      <Sack position={[-0.88, 0, -0.15]} rotation={[0, -0.6, 0.08]} size={0.28} />
      {/* A barrel on the floor, a crate on it, piped into the tank's front. */}
      <Drum position={[-1.42, 0, -0.07]} radius={0.18} height={0.75} color={palette.shadowWood} />
      <Pipe
        points={[
          [-1.42 + 0.18, 0.5, -0.07],
          [TANK.x, 0.5, -0.07],
          [TANK.x, 0.5, TANK.z + TANK.radius],
        ]}
        radius={0.03}
        color={palette.shadowSteel}
        flangeStart={[-1, 0, 0]}
        flangeEnd={[0, 0, -1]}
      />
      <Crate position={[-1.42, 0.75, -0.07]} rotation={[0, 0.5, 0]} size={[0.26, 0.24, 0.26]} />
      {/* A bundle hung from the deck on a rope. */}
      <Rod
        from={[-1.0, DECK_UNDER, 0.05]}
        to={[-1.0, 2.0, 0.05]}
        radius={0.012}
        color={palette.burlap}
      />
      <Sack position={[-1.0, 2.0 - 0.94 * 0.3, 0.05]} size={0.3} />
      {/* The shelf board on its two cleats, and what lies on it. */}
      <ShelfBoard posts={[postL, postR]} y={BOARD.y} back={BOARD.back} front={BOARD.front} />
      <Crate position={[-1.55, ON_BOARD, -0.9]} size={[0.3, 0.22, 0.25]} />
      {/* Boxes stacked on the board, up to the deck. */}
      {/* An iron housing on the board, piped up into the deck. */}
      <Crate
        position={[-0.98, ON_BOARD, -0.9]}
        size={[0.34, HOUSING_HEIGHT, 0.26]}
        color={palette.shadowIron}
      />
      <Pipe
        points={[
          [-0.98, ON_BOARD + HOUSING_HEIGHT, -0.9],
          [-0.98, DECK_UNDER, -0.9],
        ]}
        radius={CLUTTER_PIPE}
        color={palette.shadowSteel}
        flangeStart={[0, -1, 0]}
        flangeEnd={[0, 1, 0]}
      />
      {/* Two pipes from the floor up into the deck, and a rope hanging from it. */}
      {[
        [-1.55, 0.2],
        [-1.46, 0.27],
      ].map(([x, z]) => (
        <Pipe
          key={x}
          points={[
            [x!, 0, z!],
            [x!, DECK_UNDER, z!],
          ]}
          radius={0.035}
          color={palette.shadowSteel}
          flangeStart={[0, -1, 0]}
          flangeEnd={[0, 1, 0]}
        />
      ))}
      {/* A third, by the deck's right post, tied to them by a pipe across. */}
      <Pipe
        points={[
          [THIRD_RISER[0], 0, THIRD_RISER[1]],
          [THIRD_RISER[0], DECK_UNDER, THIRD_RISER[1]],
        ]}
        radius={0.035}
        color={palette.shadowSteel}
        flangeStart={[0, -1, 0]}
        flangeEnd={[0, 1, 0]}
      />
      <Pipe
        points={[
          [THIRD_RISER[0] - 0.035, CROSS.y, THIRD_RISER[1]],
          [-1.46 + 0.035, CROSS.y, THIRD_RISER[1]],
        ]}
        radius={CROSS.radius}
        color={palette.shadowSteel}
      />
      {/* A small iron box on the floor in the front corner, a crate more on the stack. */}
      <Crate position={[-1.7, 0, 0.35]} size={[0.2, 0.22, 0.2]} color={palette.shadowIron} />
      <Crate position={[-1.5, 0.7, -0.82]} rotation={[0, -0.15, 0]} size={[0.28, 0.3, 0.26]} />
      {/* Planks leaning on the wall, left of the frame. */}
      {[-2.1, -2.28].map((x, i) => (
        <Beam
          key={x}
          from={[x, 0.01, -0.7 - i * 0.05]}
          to={[x, 1.8 - i * 0.3, WALL_FACE + 0.0125]}
          size={0.16}
          depth={0.025}
          color={i ? palette.shadowWoodDeep : palette.shadowWood}
        />
      ))}
      {/* Clamped together, low and high. */}
      {[0.8, 1.9].map((y) => (
        <Beam
          key={y}
          from={[-1.55, y, 0.2]}
          to={[-1.46, y, 0.27]}
          size={0.05}
          depth={0.09}
          color={palette.shadowIron}
        />
      ))}
      <Rod
        from={[-1.2, DECK_UNDER, 0.3]}
        to={[-1.2, 1.7, 0.3]}
        radius={0.012}
        color={palette.burlap}
      />
      <ToonMesh
        position={[-1.2, 1.66, 0.3]}
        rotation={[0, Math.PI / 2, 0]}
        color={palette.shadowIron}
      >
        <torusGeometry args={[0.045, 0.012, 6, 14, Math.PI * 1.5]} />
      </ToonMesh>
      {/* A coil of rope, and two dark bottles. */}
      <ToonMesh
        position={[-1.27, ON_BOARD + 0.025, -0.9]}
        rotation={[Math.PI / 2, 0, 0]}
        color={palette.burlap}
      >
        <torusGeometry args={[0.1, 0.025, 8, 20]} />
      </ToonMesh>
      {[-0.74, -0.66].map((x, i) => (
        <ToonMesh
          key={x}
          position={[x, ON_BOARD + 0.11 + i * 0.02, -0.88]}
          color={palette.shadowIron}
        >
          <cylinderGeometry args={[0.035, 0.04, 0.22 + i * 0.04, 12]} />
        </ToonMesh>
      ))}
    </group>
  )
}

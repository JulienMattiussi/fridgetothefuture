import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { Crate } from '@/three/parts/Crate'
import { Drum } from '@/three/parts/Drum'
import { Pipe } from '@/three/parts/Pipe'
import { RightBoards } from '@/three/machine/clutter/RightBoards'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { Sack } from '@/three/parts/Sack'
import { CLUTTER_PIPE, SHELF_UNDER, WALL_FACE } from '@/three/machine/clutter/anchors'

/** The iron drum under the vat, piped up into the shelf and down into the floor. */
const DRUM = { x: 2.5, z: -0.6, radius: 0.28, height: 0.95 }
/** The drum's riser up into the shelf, off its top. */
const DRUM_RISER: [number, number] = [DRUM.x + 0.05, DRUM.z - 0.1]
/** Two pipes up from the floor into the shelf, by its left posts, in front of the crates. */
const RISERS: [number, number][] = [
  [1.66, -0.25],
  [1.75, -0.33],
]
/** The small pipe under the shelf, at depth -0.1: the barrel's feed meets its underside. */
const FEED_TOP = 1.86 - 0.025
/** Where the coupling to the box meets the drum's side, at depth -0.8: out from its axis. */
const COUPLING_X = Math.sqrt(0.28 ** 2 - 0.2 ** 2)
/** An iron box at the back, piped up and back into the wall, under the board. */
const BOX = { x: 2.95, z: -0.88, size: [0.3, 0.35, 0.25] as [number, number, number] }

/**
 * The dark jumble inside the right frame, under the vat: crates on the floor,
 * an iron drum piped up into the shelf and down into the floor, an iron box
 * piped into the wall, two pipes up into the shelf, planks lying on the floor,
 * a sack, and a board across the back posts with crates, rods and a can.
 */
export function RightClutter() {
  return (
    <group>
      <Crate position={[1.9, 0, -0.65]} size={[0.5, 0.45, 0.45]} />
      <Crate position={[1.88, 0.45, -0.68]} rotation={[0, 0.25, 0]} size={[0.34, 0.3, 0.32]} />
      <Drum position={[DRUM.x, 0, DRUM.z]} radius={DRUM.radius} height={DRUM.height} />
      <Pipe
        points={[
          [DRUM_RISER[0], DRUM.height, DRUM_RISER[1]],
          [DRUM_RISER[0], SHELF_UNDER, DRUM_RISER[1]],
        ]}
        radius={CLUTTER_PIPE}
        color={palette.shadowSteel}
        flangeStart={[0, -1, 0]}
        flangeEnd={[0, 1, 0]}
      />
      <Pipe
        points={[
          [DRUM.x + DRUM.radius, 0.45, DRUM.z],
          [3.0, 0.45, DRUM.z],
          [3.0, 0, DRUM.z],
        ]}
        radius={CLUTTER_PIPE}
        color={palette.shadowSteel}
        flangeStart={[-1, 0, 0]}
        flangeEnd={[0, -1, 0]}
      />
      {/* The drum and the box coupled by a short pipe. */}
      <Pipe
        points={[
          [BOX.x - BOX.size[0] / 2, 0.2, -0.8],
          [DRUM.x + COUPLING_X, 0.2, -0.8],
        ]}
        radius={0.035}
        color={palette.shadowSteel}
        flangeStart={[1, 0, 0]}
        flangeEnd={[-COUPLING_X, 0, 0.2]}
      />
      <Crate position={[BOX.x, 0, BOX.z]} size={BOX.size} color={palette.shadowIron} />
      <Pipe
        points={[
          [BOX.x, BOX.size[1], BOX.z],
          [BOX.x, 0.85, BOX.z],
          [BOX.x, 0.85, WALL_FACE],
        ]}
        radius={0.035}
        color={palette.shadowSteel}
        flangeStart={[0, -1, 0]}
        flangeEnd={[0, 0, -1]}
      />
      {/* Planks lying on the floor, one on the other, a little askew. */}
      {[0, 1, 2].map((i) => (
        <Beam
          key={i}
          from={[1.75 + i * 0.04, 0.015 + i * 0.03, 0.02 + i * 0.03]}
          to={[2.85 - i * 0.05, 0.015 + i * 0.03, 0.06 - i * 0.02]}
          size={0.03}
          depth={0.17}
          color={i % 2 ? palette.shadowWoodDeep : palette.shadowWood}
        />
      ))}
      <Sack position={[2.0, 0, -0.18]} rotation={[0, 0.9, 0]} size={0.4} />
      {/* A sack on the crates, a big wooden barrel by the right posts. */}
      <Sack position={[1.88, 0.75, -0.66]} rotation={[0, 0.7, 0]} size={0.3} />
      <Drum position={[3.0, 0, -0.2]} radius={0.18} height={1.0} color={palette.shadowWood} />
      {/* It feeds the small pipe running under the shelf. */}
      <Pipe
        points={[
          [3.0, 1.0, -0.2],
          [3.0, 1.6, -0.2],
          [3.0, 1.6, -0.1],
          [3.0, FEED_TOP, -0.1],
        ]}
        radius={0.02}
        bend={0.05}
        color={palette.shadowSteel}
        flangeStart={[0, -1, 0]}
      />
      {/* A rope hanging from the shelf, a hook at its end. */}
      <Rod
        from={[2.0, SHELF_UNDER, 0.0]}
        to={[2.0, 1.5, 0.0]}
        radius={0.012}
        color={palette.burlap}
      />
      <ToonMesh
        position={[2.0, 1.46, 0.0]}
        rotation={[0, Math.PI / 2, 0]}
        color={palette.shadowIron}
      >
        <torusGeometry args={[0.045, 0.012, 6, 14, Math.PI * 1.5]} />
      </ToonMesh>
      {/* Two pipes from the floor up into the shelf, by its left posts. */}
      {RISERS.map(([x, z]) => (
        <Pipe
          key={x}
          points={[
            [x, 0, z],
            [x, SHELF_UNDER, z],
          ]}
          radius={0.035}
          color={palette.shadowSteel}
          flangeStart={[0, -1, 0]}
          flangeEnd={[0, 1, 0]}
        />
      ))}
      {/* Clamped together, low and high. */}
      {[0.7, 1.5].map((y) => (
        <Beam
          key={y}
          from={[RISERS[0]![0], y, RISERS[0]![1]]}
          to={[RISERS[1]![0], y, RISERS[1]![1]]}
          size={0.05}
          depth={0.09}
          color={palette.shadowIron}
        />
      ))}
      {/* The risers and the drum's riser linked across, above the crates. */}
      <Pipe
        points={[
          [RISERS[1]![0] + 0.035, 1.4, RISERS[1]![1]],
          [2.2, 1.4, RISERS[1]![1]],
          [2.2, 1.4, DRUM_RISER[1]],
          [DRUM_RISER[0] - CLUTTER_PIPE, 1.4, DRUM_RISER[1]],
        ]}
        radius={0.03}
        color={palette.shadowSteel}
      />
      {/* A crate in the middle, a can on it; a small iron box in the front corner. */}
      <Crate position={[2.45, 0, -0.18]} size={[0.4, 0.5, 0.24]} />
      <ToonMesh position={[2.4, 0.5 + 0.15, -0.18]} color={palette.shadowIron}>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 14]} />
      </ToonMesh>
      <Crate position={[3.03, 0, 0.12]} size={[0.2, 0.25, 0.18]} color={palette.shadowIron} />
      <RightBoards />
    </group>
  )
}

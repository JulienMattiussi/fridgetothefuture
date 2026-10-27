import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { BevelGear } from '@/three/parts/BevelGear'
import { Gear } from '@/three/parts/Gear'
import { Pipe } from '@/three/parts/Pipe'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { Wheel } from '@/three/parts/Wheel'
import { layout } from '@/three/machine/layout'

const { valvePlank } = layout
/** The front face of the plank across the right frame, where all this is mounted. */
const PLANK_FRONT = layout.frameFront + 0.055 + valvePlank.depth
/** Everything stands this far out, room for the big wheel turned edge-on. */
const Z = PLANK_FRONT + 0.28

/** The big copper valve handwheel, edge-on, its spindle across into the column. */
const BIG_WHEEL = { at: [1.68, 1.25, Z] as Vec3, radius: 0.24 }
/** The iron column to its right, carrying the gear train. */
const COLUMN = { x: 1.99, bottom: 0.9, top: 1.4, radius: 0.022 }
/** The big bevel gear, its axle left-right, driving the column's lower bevel gear. */
/**
 * The bevel pair meshes at right angles: each one's toothed face sits as far
 * from the axes' crossing as the other gear's radius.
 */
const MESH_Y = 1.13
const SMALL_BEVEL = { radius: 0.065 }
const BIG_BEVEL = { radius: 0.1 }
const BIG_BEVEL_AT: Vec3 = [COLUMN.x + SMALL_BEVEL.radius + 0.045, MESH_Y, Z]
const SMALL_BEVEL_Y = MESH_Y - BIG_BEVEL.radius - 0.03
/** The upright plank nailed across the two frame planks, the column bracketed to it. */
const UPRIGHT = { width: 0.16, depth: 0.04 }
const UPRIGHT_FRONT = PLANK_FRONT + UPRIGHT.depth
const UPRIGHT_FROM = layout.lowPlank.y - layout.lowPlank.height / 2
const UPRIGHT_TO = valvePlank.y + valvePlank.height / 2
/** The small valve on a short pipe out to the right, its handwheel to the front. */
const SMALL_VALVE = { x: 2.36, y: 0.98, radius: 0.085 }
/** Its pipe runs on right, then up and back into the right small pipe under the shelf. */
const SMALL_PIPE_X = 2.75

/**
 * The valve gear on the right of the frame (as Doc stands by it in the film):
 * the big copper handwheel, edge-on, its spindle into the column; an iron column with a spur gear on top, a bearing
 * collar, and a bevel gear pair halfway down, the big one on a left-right
 * axle; a short pipe out to the right with a small valve and its handwheel,
 * then up into the small pipe under the shelf. The column is bracketed to an
 * upright plank nailed across the frame's two planks.
 */
export function ValveGear() {
  return (
    <group>
      <Rod
        from={BIG_WHEEL.at}
        to={[COLUMN.x, BIG_WHEEL.at[1], Z]}
        radius={0.025}
        color={palette.steel}
      />
      <Wheel
        position={BIG_WHEEL.at}
        radius={BIG_WHEEL.radius}
        spokes={5}
        tire={false}
        rotation={[0, Math.PI / 2, 0]}
        color={palette.copper}
      />
      <Rod
        from={[COLUMN.x, COLUMN.bottom, Z]}
        to={[COLUMN.x, COLUMN.top, Z]}
        radius={COLUMN.radius}
        color={palette.steel}
      />
      <ToonMesh
        position={[COLUMN.x, (UPRIGHT_FROM + UPRIGHT_TO) / 2, PLANK_FRONT + UPRIGHT.depth / 2]}
        color={palette.wood}
      >
        <boxGeometry args={[UPRIGHT.width, UPRIGHT_TO - UPRIGHT_FROM, UPRIGHT.depth]} />
      </ToonMesh>
      {/* Brackets holding the column to that upright plank. */}
      {[COLUMN.bottom + 0.04, COLUMN.top - 0.2].map((y) => (
        <ToonMesh key={y} position={[COLUMN.x, y, (Z + UPRIGHT_FRONT) / 2]} color={palette.iron}>
          <boxGeometry args={[0.06, 0.04, Z - UPRIGHT_FRONT]} />
        </ToonMesh>
      ))}
      <Gear
        position={[COLUMN.x, COLUMN.top, Z]}
        rotation={[Math.PI / 2, 0, 0]}
        radius={0.07}
        teeth={14}
        width={0.03}
      />
      <ToonMesh position={[COLUMN.x, COLUMN.top - 0.08, Z]} color={palette.iron}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
      </ToonMesh>
      <BevelGear position={[COLUMN.x, SMALL_BEVEL_Y, Z]} radius={SMALL_BEVEL.radius} teeth={12} />
      <BevelGear
        position={BIG_BEVEL_AT}
        rotation={[0, 0, Math.PI / 2]}
        radius={BIG_BEVEL.radius}
        teeth={20}
      />
      <Rod
        from={BIG_BEVEL_AT}
        to={[BIG_BEVEL_AT[0] + 0.12, BIG_BEVEL_AT[1], Z]}
        radius={0.016}
        color={palette.steel}
      />
      <ToonMesh position={[COLUMN.x, COLUMN.bottom, Z]} color={palette.iron}>
        <cylinderGeometry args={[0.045, 0.045, 0.05, 16]} />
      </ToonMesh>
      {/* The small valve: pipe out to the right, valve body, spindle and wheel. */}
      <Pipe
        points={[
          [COLUMN.x, SMALL_VALVE.y, Z],
          [SMALL_PIPE_X, SMALL_VALVE.y, Z],
          [SMALL_PIPE_X, 1.6, Z],
          [SMALL_PIPE_X, 1.6, layout.vatSmallPipe.z],
          [SMALL_PIPE_X, layout.vatSmallPipe.y, layout.vatSmallPipe.z],
        ]}
        radius={0.022}
      />
      <ToonMesh
        position={[SMALL_VALVE.x, SMALL_VALVE.y, Z]}
        rotation={[0, 0, Math.PI / 2]}
        color={palette.iron}
      >
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
      </ToonMesh>
      <Rod
        from={[SMALL_VALVE.x, SMALL_VALVE.y, Z]}
        to={[SMALL_VALVE.x, SMALL_VALVE.y, Z + 0.12]}
        radius={0.01}
        color={palette.steel}
      />
      <Wheel
        position={[SMALL_VALVE.x, SMALL_VALVE.y, Z + 0.12]}
        radius={SMALL_VALVE.radius}
        spokes={6}
        tire={false}
        color={palette.iron}
      />
    </group>
  )
}

import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { CopperCoil } from '@/three/parts/CopperCoil'
import { Gauge } from '@/three/parts/Gauge'
import { Rod } from '@/three/parts/Rod'
import { Table } from '@/three/parts/Table'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const { table, coilUnit } = layout
const top = table.top
const Z = coilUnit.z

/** The big black block on the left, with a pulley and the crank in front. */
const LEFT = { left: -2.05, right: -1.6, height: 0.55, depth: 0.44 }
/** The smaller grey block on the right. */
const RIGHT = { left: -1.2, right: -0.9, height: 0.4, depth: 0.36 }
/** The copper coil between the blocks. */
const COIL = { y: top + 0.25, radius: 0.15, turns: 9 }
/** The two rods joining the blocks above the coil, front and back. */
const RODS = { y: top + 0.47, spread: 0.1 }
/** The sleeve sliding along the rods, the coil running through it. */
const SLEEVE = { width: 0.16, half: 0.2, plate: 0.02 }
/** The crank on the left block's front, Marty's handle. */
const CRANK = { x: -1.75, y: top + 0.18, arm: 0.14, handle: 0.12 }

const leftFront = Z + LEFT.depth / 2
const coilLength = RIGHT.left - LEFT.right
const sleeveX = (LEFT.right + RIGHT.left) / 2 + coilUnit.slide
const s = SLEEVE.half

/**
 * The coil unit on the left table, where Marty stands
 * (docs/references/video-bobine.jpg): three volumes in a row. The black block
 * on the left takes the long red pipe on top and carries a pulley and the
 * crank on its front; the smaller grey block on the right takes the blue pipe
 * in front; between them a copper coil, two rods above, and a sleeve that the
 * crank slides left and right along the rods, the coil running through it.
 */
export function CrankCoil() {
  return (
    <group>
      <Table {...table} />
      <ToonMesh
        position={[(LEFT.left + LEFT.right) / 2, top + LEFT.height / 2, Z]}
        color={palette.blackIron}
      >
        <boxGeometry args={[LEFT.right - LEFT.left, LEFT.height, LEFT.depth]} />
      </ToonMesh>
      <ToonMesh
        position={[(RIGHT.left + RIGHT.right) / 2, top + RIGHT.height / 2, Z]}
        color={palette.steel}
      >
        <boxGeometry args={[RIGHT.right - RIGHT.left, RIGHT.height, RIGHT.depth]} />
      </ToonMesh>
      <CopperCoil
        position={[(LEFT.right + RIGHT.left) / 2, COIL.y, Z]}
        turns={COIL.turns}
        radius={COIL.radius}
        length={coilLength}
      />
      {[-1, 1].map((side) => (
        <Rod
          key={side}
          from={[LEFT.right, RODS.y, Z + side * RODS.spread]}
          to={[RIGHT.left, RODS.y, Z + side * RODS.spread]}
          radius={0.014}
          color={palette.steel}
        />
      ))}
      {/* The sliding sleeve: four plates around the coil, open at both ends. */}
      <group position={[sleeveX, COIL.y, Z]}>
        {[
          { y: s, z: 0, size: [SLEEVE.width, SLEEVE.plate, 2 * s] },
          { y: -s, z: 0, size: [SLEEVE.width, SLEEVE.plate, 2 * s] },
          { y: 0, z: s, size: [SLEEVE.width, 2 * s, SLEEVE.plate] },
          { y: 0, z: -s, size: [SLEEVE.width, 2 * s, SLEEVE.plate] },
        ].map(({ y, z, size }) => (
          <ToonMesh key={`${y}:${z}`} position={[0, y, z]} color={palette.iron}>
            <boxGeometry args={size as [number, number, number]} />
          </ToonMesh>
        ))}
      </group>
      {/* Sight glass at the left block's front corner. */}
      <Rod
        from={[LEFT.left - 0.03, top + 0.05, leftFront - 0.04]}
        to={[LEFT.left - 0.03, top + 0.5, leftFront - 0.04]}
        radius={0.022}
        color={palette.glass}
      />
      {/* The pulley on the left block's front. */}
      <ToonMesh
        position={[-1.93, top + 0.38, leftFront + 0.02]}
        rotation={[Math.PI / 2, 0, 0]}
        color={palette.dial}
      >
        <cylinderGeometry args={[0.1, 0.1, 0.04, 32]} />
      </ToonMesh>
      {/* The crank: arm and wooden handle, in front of the left block. */}
      <Beam
        from={[CRANK.x, CRANK.y, leftFront + 0.03]}
        to={[CRANK.x, CRANK.y + CRANK.arm, leftFront + 0.03]}
        size={0.035}
        color={palette.iron}
      />
      <Rod
        from={[CRANK.x, CRANK.y + CRANK.arm, leftFront + 0.03]}
        to={[CRANK.x, CRANK.y + CRANK.arm, leftFront + 0.03 + CRANK.handle]}
        radius={0.018}
        color={palette.woodDark}
      />
      {/* Perforated angle iron along the table's front edge. */}
      <Beam
        from={[table.left, top - 0.05, table.front + 0.01]}
        to={[table.right, top - 0.05, table.front + 0.01]}
        size={0.09}
        depth={0.012}
        color={palette.steel}
      />
      {/* The two gauges on their bar above the left block. */}
      <Rod
        from={[-2.1, top + 0.85, Z - 0.1]}
        to={[-1.45, top + 0.85, Z - 0.1]}
        radius={0.015}
        color={palette.steel}
      />
      <Gauge
        position={[-1.78, top + 1.0, Z - 0.05]}
        radius={0.15}
        face={palette.dialDark}
        needle={palette.dial}
      />
      <Gauge position={[-1.56, top + 0.86, Z]} radius={0.1} reading={0.4} />
    </group>
  )
}

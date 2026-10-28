import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { type Group, type Mesh, Path, Shape } from 'three'
import { CRANK_TURNS } from '@/lib/sequence'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { CopperCoil } from '@/three/parts/CopperCoil'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { Handle } from '@/three/sequence/Handle'
import { useSequence } from '@/three/sequence/context'
import { CoilStand } from '@/three/machine/CoilStand'
import { layout } from '@/three/machine/layout'

const { table, coilUnit } = layout
const top = table.top
const Z = coilUnit.z

/** The big black block on the left, with the crank in front. */
const LEFT = coilUnit.blackBlock
/** The copper coil between the blocks. */
const COIL = { y: top + 0.25, radius: 0.15, tube: 0.016, turns: 9 }
/** The sleeve sliding along the rods, the coil running through it. */
const SLEEVE = { width: 0.16, half: 0.2, plate: 0.02 }
const sleeveTop = COIL.y + SLEEVE.half + SLEEVE.plate / 2
/** The smaller grey block on the right, as tall as the sleeve. */
const RIGHT = { ...coilUnit.greyBlock, height: sleeveTop - top }
/**
 * The two rods, front and back, welded into both blocks: they run just under
 * the sleeve's top plate, inside it, clear of the coil.
 */
const RODS = { y: sleeveTop - 0.04, spread: 0.1, radius: 0.014 }
/**
 * The crank, Marty's handle, low on the black block's front: `out` in front of
 * it, so its arm turns in a plane ahead of the iron foot, the thin pipe and
 * its gauge. It rests pointing down.
 */
const CRANK = { x: -1.9, y: top + 0.14, arm: 0.11, handle: 0.12, out: 0.11 }

const leftFront = Z + LEFT.depth / 2
const coilLength = RIGHT.left - LEFT.right
/**
 * Half the sleeve's run: it rests at the coil's right end and runs back and
 * forth as the crank turns, to end hard left (the sequence's `sleeve` and
 * `crank`).
 */
const SLEEVE_TRAVEL = (RIGHT.left - LEFT.right) / 2 - SLEEVE.width / 2 - 0.02
const sleeveX = (LEFT.right + RIGHT.left) / 2
const s = SLEEVE.half + SLEEVE.plate / 2
/**
 * The sleeve's face, across the coil's axis: a square with a round bore that
 * hugs the coil, and two small holes where the rods run through it.
 */
const sleeveShape = (() => {
  const shape = new Shape()
  shape.moveTo(-s, -s)
  shape.lineTo(s, -s)
  shape.lineTo(s, s)
  shape.lineTo(-s, s)
  shape.closePath()
  const bore = new Path()
  bore.absarc(0, 0, COIL.radius + COIL.tube + 0.006, 0, Math.PI * 2, true)
  shape.holes.push(bore)
  for (const side of [-1, 1]) {
    const rod = new Path()
    rod.absarc(side * RODS.spread, RODS.y - COIL.y, RODS.radius + 0.002, 0, Math.PI * 2, true)
    shape.holes.push(rod)
  }
  return shape
})()

/**
 * The coil unit on the left table, where Marty stands
 * (docs/references/video-bobine.jpg): three volumes in a row. The black block
 * on the left takes the long red pipe on top and carries the crank on its
 * front; the smaller grey block on the right takes the blue pipe
 * in front; between them a copper coil, two rods above, and a sleeve that the
 * crank slides left and right along the rods, the coil running through it.
 */
export function CrankCoil() {
  const sequence = useSequence()
  const sleeve = useRef<Mesh>(null)
  const crank = useRef<Group>(null)
  useFrame(() => {
    const { sleeve: slid, crank: turned } = sequence?.readouts ?? { sleeve: 0, crank: 0 }
    if (sleeve.current) {
      sleeve.current.position.x = sleeveX - SLEEVE.width / 2 + SLEEVE_TRAVEL * (1 - 2 * slid)
    }
    if (crank.current) crank.current.rotation.z = turned * CRANK_TURNS * 2 * Math.PI
  })
  return (
    <group>
      {/* Each block stands on an iron foot riveted over the stand's front. */}
      <CoilStand
        feet={[LEFT, RIGHT].map((block) => ({
          left: block.left - 0.05,
          right: block.right + 0.05,
          back: Z - block.depth / 2,
        }))}
      />
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
        tube={COIL.tube}
        length={coilLength}
      />
      {[-1, 1].map((side) => (
        <Rod
          key={side}
          from={[LEFT.right, RODS.y, Z + side * RODS.spread]}
          to={[RIGHT.left, RODS.y, Z + side * RODS.spread]}
          radius={RODS.radius}
          color={palette.steel}
        />
      ))}
      {/* Weld beads where the rods meet the blocks. */}
      {[LEFT.right, RIGHT.left].flatMap((x) =>
        [-1, 1].map((side) => (
          <ToonMesh
            key={`${x}:${side}`}
            position={[x, RODS.y, Z + side * RODS.spread]}
            rotation={[0, Math.PI / 2, 0]}
            color={palette.iron}
          >
            <torusGeometry args={[0.018, 0.008, 6, 16]} />
          </ToonMesh>
        )),
      )}
      {/* The sliding sleeve: a square iron block bored round to fit the coil. */}
      <ToonMesh
        ref={sleeve}
        position={[sleeveX - SLEEVE.width / 2 + SLEEVE_TRAVEL, COIL.y, Z]}
        rotation={[0, Math.PI / 2, 0]}
        color={palette.iron}
      >
        <extrudeGeometry args={[sleeveShape, { depth: SLEEVE.width, bevelEnabled: false }]} />
      </ToonMesh>
      {/* Sight glass at the left block's front corner. */}
      <Rod
        from={[LEFT.left - 0.03, top + 0.05, leftFront - 0.04]}
        to={[LEFT.left - 0.03, top + 0.5, leftFront - 0.04]}
        radius={0.022}
        color={palette.glass}
      />
      {/* The crank, Marty's handle: arm and wooden handle, turning on its boss. */}
      <Handle actions={['turnCrank']}>
        <group ref={crank} position={[CRANK.x, CRANK.y, leftFront + CRANK.out]}>
          <Beam from={[0, 0, 0]} to={[0, -CRANK.arm, 0]} size={0.035} color={palette.iron} />
          <Rod
            from={[0, -CRANK.arm, 0]}
            to={[0, -CRANK.arm, CRANK.handle]}
            radius={0.018}
            color={palette.woodDark}
          />
          {/* A wider, unseen grip, easier to click than the thin handle. */}
          <mesh position={[0, -CRANK.arm / 2, CRANK.handle / 2]} visible={false}>
            <boxGeometry args={[0.16, 0.24, 0.2]} />
          </mesh>
        </group>
      </Handle>
    </group>
  )
}

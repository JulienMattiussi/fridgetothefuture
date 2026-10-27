import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { RivetedFoot } from '@/three/parts/RivetedFoot'
import { Table } from '@/three/parts/Table'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const { table } = layout
const { left, right, back, front, top } = table
const UNDER = top - 0.06
/** How far each end's front leg splays forward at the floor. */
const SPLAY = 0.16
/** Each end's frame stands this far in from the stand's ends. */
const ENDS = [left + 0.12, right - 0.08]
/**
 * Every post and leg: the same light plank, edge to the front and its wide
 * face to the side (the dark board seen at each end in the film).
 */
const LEG = { width: 0.14, thickness: 0.05 }
const LEFT_POST_WIDTH = 0.3
/** The short plank across the right end's legs. */
const CLEAT = { y: 0.45, height: 0.1, thickness: 0.025 }
/**
 * Planks nailed flat onto the front legs' front face lean back like them,
 * `tilt` off upright: the centre of one `depth` thick, at height `y`.
 */
const tilt = Math.atan2(SPLAY + 0.05, UNDER)
const frontLegZ = (y: number) => front + SPLAY - ((SPLAY + 0.05) * y) / UNDER
const onFrontLegs = (y: number, depth: number): [number, number, number] => {
  const out = LEG.width / 2 + depth / 2
  return [
    (left - 0.1 + right + 0.05) / 2,
    y + Math.sin(tilt) * out,
    frontLegZ(y) + Math.cos(tilt) * out,
  ]
}
/** The low stretcher, and the darker apron high up, under the iron feet. */
const STRETCHER = { y: 0.17, height: 0.16, depth: 0.07 }
const STRETCHER_AT = onFrontLegs(STRETCHER.y, STRETCHER.depth)
const APRON = { height: 0.12, depth: 0.04 }
/** The apron sits right under the top. */
const APRON_Y = UNDER - APRON.height / 2
const APRON_AT = onFrontLegs(APRON_Y, APRON.depth)
/** The apron's front face at its foot, where the iron feet fold down over it. */
const APRON_FRONT =
  APRON_AT[2] + (Math.cos(tilt) * APRON.depth) / 2 + (Math.sin(tilt) * APRON.height) / 2
const FOOT_DROP = top - (APRON_Y - APRON.height / 2)

interface CoilStandProps {
  /** The blocks' iron feet: each one's ends, and how far back it runs on the top. */
  feet: { left: number; right: number; back: number }[]
}

/**
 * The coil unit's stand (docs/references/video-support-bobine.jpg): no plain
 * table but a narrow rough frame, no deeper than the blocks it carries (the
 * blocks' iron feet fold over the top's front edge, see CrankCoil). A dark
 * apron plank is nailed on the front legs just under the top, and the feet
 * fold down over it, riveted. Each end stands on two planks of the same wood: an upright post in the middle of the depth, and a leg splayed
 * forward in front of it.
 * A thick stretcher runs low along the front, nailed on those front legs, the
 * wagon wheel showing through behind it; the same plank runs behind, nailed on
 * the back of the middle posts.
 */
export function CoilStand({ feet }: CoilStandProps) {
  const middle = (front + back) / 2
  return (
    <group>
      <Table {...table} legs={false} />
      {feet.map((foot) => (
        <RivetedFoot
          key={foot.left}
          left={foot.left}
          right={foot.right}
          top={top}
          front={APRON_FRONT}
          reach={APRON_FRONT - foot.back}
          drop={FOOT_DROP}
        />
      ))}
      <ToonMesh position={APRON_AT} rotation={[-tilt, 0, 0]} color={palette.woodDark}>
        <boxGeometry args={[right - left + 0.15, APRON.height, APRON.depth]} />
      </ToonMesh>
      {ENDS.map((x, i) => {
        // The left end's middle plank is wider, its back edge level with the
        // right one's so the back plank sits on both.
        const width = i === 0 ? LEFT_POST_WIDTH : LEG.width
        const z = middle - LEG.width / 2 + width / 2
        return (
          <group key={x}>
            <Beam
              from={[x, 0, z]}
              to={[x, UNDER, z]}
              size={LEG.thickness}
              depth={width}
              color={palette.woodLight}
            />
            <Beam
              from={[x, UNDER, front - 0.05]}
              to={[x, 0, front + SPLAY]}
              size={LEG.thickness}
              depth={LEG.width}
              color={palette.woodLight}
            />
          </group>
        )
      })}
      <ToonMesh position={STRETCHER_AT} rotation={[-tilt, 0, 0]} color={palette.woodLight}>
        <boxGeometry args={[right - left + 0.15, STRETCHER.height, STRETCHER.depth]} />
      </ToonMesh>
      {/* A short plank nailed across the right end's two legs, on their outer side. */}
      <ToonMesh
        position={[
          ENDS[1]! + LEG.thickness / 2 + CLEAT.thickness / 2,
          CLEAT.y,
          (middle - LEG.width / 2 + frontLegZ(CLEAT.y) + LEG.width / 2) / 2,
        ]}
        color={palette.woodLight}
      >
        <boxGeometry
          args={[CLEAT.thickness, CLEAT.height, frontLegZ(CLEAT.y) - middle + LEG.width]}
        />
      </ToonMesh>
      {/* The same plank behind, nailed on the back of the middle posts. */}
      <ToonMesh
        position={[STRETCHER_AT[0], STRETCHER.y, middle - LEG.width / 2 - STRETCHER.depth / 2]}
        color={palette.woodLight}
      >
        <boxGeometry args={[right - left + 0.15, STRETCHER.height, STRETCHER.depth]} />
      </ToonMesh>
    </group>
  )
}

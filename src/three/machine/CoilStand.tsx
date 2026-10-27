import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { Table } from '@/three/parts/Table'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const { table } = layout
const { left, right, back, front, top } = table
const UNDER = top - 0.06
/** How far each end's two legs splay out, front and back, at the floor. */
const SPLAY = 0.16
/** Each end's frame stands this far in from the stand's ends. */
const ENDS = [left + 0.12, right - 0.08]
const LEG = 0.08
/**
 * The low stretcher, nailed flat onto the front legs' front face: it leans
 * back like them, `tilt` off upright, and sits on their face at its height.
 */
const STRETCHER = { y: 0.17, height: 0.16, depth: 0.07 }
const tilt = Math.atan2(SPLAY + 0.05, UNDER)
const frontLegZ = (y: number) => front + SPLAY - ((SPLAY + 0.05) * y) / UNDER
const out = LEG / 2 + STRETCHER.depth / 2
const STRETCHER_AT: [number, number, number] = [
  (left - 0.1 + right + 0.05) / 2,
  STRETCHER.y + Math.sin(tilt) * out,
  frontLegZ(STRETCHER.y) + Math.cos(tilt) * out,
]

/**
 * The coil unit's stand (docs/references/video-support-bobine.jpg): no plain
 * table but a narrow rough frame, no deeper than the blocks it carries. A
 * plank apron runs under the top (the blocks' iron feet fold over its front
 * edge, see CrankCoil). Each end is a sawhorse in profile: two legs splayed
 * front and back around a thick middle post. A thick stretcher runs low along
 * the front, the wagon wheel showing through behind it.
 */
export function CoilStand() {
  const middle = (front + back) / 2
  return (
    <group>
      <Table {...table} legs={false} />
      <ToonMesh
        position={[(left + right) / 2, UNDER - 0.07, front - 0.04]}
        color={palette.woodDark}
      >
        <boxGeometry args={[right - left - 0.1, 0.14, 0.04]} />
      </ToonMesh>
      {ENDS.map((x) => (
        <group key={x}>
          <Beam
            from={[x, 0, middle]}
            to={[x, UNDER, middle]}
            size={0.13}
            color={palette.woodDark}
          />
          <Beam from={[x, UNDER, front - 0.05]} to={[x, 0, front + SPLAY]} size={LEG} />
          <Beam from={[x, UNDER, back + 0.05]} to={[x, 0, back - SPLAY]} size={LEG} />
        </group>
      ))}
      <ToonMesh position={STRETCHER_AT} rotation={[-tilt, 0, 0]} color={palette.woodLight}>
        <boxGeometry args={[right - left + 0.15, STRETCHER.height, STRETCHER.depth]} />
      </ToonMesh>
    </group>
  )
}

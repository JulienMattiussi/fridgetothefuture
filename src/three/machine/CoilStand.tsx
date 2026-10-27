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
          <Beam from={[x, UNDER, front - 0.05]} to={[x, 0, front + SPLAY]} size={0.08} />
          <Beam from={[x, UNDER, back + 0.05]} to={[x, 0, back - SPLAY]} size={0.08} />
        </group>
      ))}
      <Beam
        from={[left - 0.1, 0.17, front + SPLAY * 0.8]}
        to={[right + 0.05, 0.17, front + SPLAY * 0.8]}
        size={0.16}
        depth={0.07}
        color={palette.woodLight}
      />
    </group>
  )
}

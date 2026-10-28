import { palette } from '@/three/palette'
import { Crate } from '@/three/parts/Crate'
import { Pipe } from '@/three/parts/Pipe'
import { Rod } from '@/three/parts/Rod'
import { onBoard } from '@/three/parts/boardTop'
import { ShelfBoard } from '@/three/parts/ShelfBoard'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { SHELF_UNDER } from '@/three/machine/clutter/anchors'

/** The right frame's back posts, and the two boards across them, mid and high. */
const POSTS: [number, number] = [1.55, 3.2]
const DEPTH = { back: -1.05, front: -0.75 }
const ON_LOW = onBoard(1.15)
const ON_HIGH = onBoard(1.65)

/**
 * The two boards across the right frame's back posts, under the vat: crates,
 * a bundle of iron rods and a can on the lower one; crates on the higher one,
 * an iron housing piped up into the shelf.
 */
export function RightBoards() {
  return (
    <group>
      <ShelfBoard posts={POSTS} y={1.15} {...DEPTH} />
      <Crate position={[1.85, ON_LOW, -0.92]} size={[0.32, 0.26, 0.24]} />
      <Crate position={[2.18, ON_LOW, -0.9]} rotation={[0, -0.15, 0]} size={[0.22, 0.2, 0.2]} />
      <Crate position={[2.9, ON_LOW, -0.9]} size={[0.36, 0.3, 0.26]} color={palette.shadowIron} />
      {/* A bundle of iron rods lying on it, the third on the other two, and a can. */}
      {[0, 1, 2].map((i) => {
        const y = ON_LOW + 0.012 + (i === 2 ? 0.02 : 0)
        const z = -0.81 - (i === 2 ? 0.0125 : i * 0.025)
        return (
          <Rod
            key={i}
            from={[2.35, y, z]}
            to={[2.68, y, z + 0.02]}
            radius={0.012}
            color={palette.shadowSteel}
          />
        )
      })}
      <ToonMesh position={[2.62, ON_LOW + 0.1, -0.97]} color={palette.shadowIron}>
        <cylinderGeometry args={[0.06, 0.06, 0.2, 14]} />
      </ToonMesh>
      <ShelfBoard posts={POSTS} y={1.65} {...DEPTH} />
      <Crate position={[1.9, ON_HIGH, -0.9]} size={[0.4, 0.4, 0.26]} />
      <Crate
        position={[2.3, ON_HIGH, -0.9]}
        rotation={[0, 0.1, 0]}
        size={[0.3, 0.3, 0.24]}
        color={palette.shadowWoodDeep}
      />
      <Crate position={[2.8, ON_HIGH, -0.9]} size={[0.5, 0.42, 0.26]} color={palette.shadowIron} />
      <Pipe
        points={[
          [2.9, ON_HIGH + 0.42, -0.9],
          [2.9, SHELF_UNDER, -0.9],
        ]}
        radius={0.035}
        color={palette.shadowSteel}
        flangeStart={[0, -1, 0]}
        flangeEnd={[0, 1, 0]}
      />
    </group>
  )
}

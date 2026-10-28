import { palette } from '@/three/palette'
import { BOARD_THICKNESS } from '@/three/parts/boardTop'
import { ToonMesh } from '@/three/parts/ToonMesh'

interface ShelfBoardProps {
  /** The two posts it spans (their x), past which it juts a little. */
  posts: [number, number]
  /** The height of its middle, and its depth from the posts' front face out. */
  y: number
  back: number
  front: number
}

/** How far it juts past each post, and its cleats' size. */
const OVERHANG = 0.1
const CLEAT = { width: 0.08, height: 0.1, depth: 0.1 }

/** A rough board across two posts, on a cleat nailed to each. */
export function ShelfBoard({ posts: [left, right], y, back, front }: ShelfBoardProps) {
  return (
    <group>
      <ToonMesh position={[(left + right) / 2, y, (back + front) / 2]} color={palette.shadowWood}>
        <boxGeometry args={[right - left + 2 * OVERHANG, BOARD_THICKNESS, front - back]} />
      </ToonMesh>
      {[left, right].map((x) => (
        <ToonMesh
          key={x}
          position={[x, y - BOARD_THICKNESS / 2 - CLEAT.height / 2, back + CLEAT.depth / 2]}
          color={palette.shadowWoodDeep}
        >
          <boxGeometry args={[CLEAT.width, CLEAT.height, CLEAT.depth]} />
        </ToonMesh>
      ))}
    </group>
  )
}

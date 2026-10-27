import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const FRONT = layout.frameFront
const BACK = -1.1
const TOP = 3.6
const { deckY, deckLeft, deckRight, shelfY } = layout

/** A post from the floor (or a given height) up, at the front and the back. */
function postPair(x: number, top: number, bottom = 0): [Vec3, Vec3][] {
  return [
    [
      [x, bottom, FRONT],
      [x, top, FRONT],
    ],
    [
      [x, bottom, BACK],
      [x, top, BACK],
    ],
  ]
}

const posts = [
  ...postPair(-1.35, deckY),
  ...postPair(-0.65, deckY),
  // The deck's right corner post stands behind the boiler, at the back only.
  postPair(-0.2, deckY)[1]!,
  ...postPair(1.55, TOP),
  ...postPair(3.2, TOP),
]

const rails: [Vec3, Vec3][] = [
  // Skids on the floor, under the whole machine.
  [
    [-2.2, 0.07, FRONT + 0.1],
    [3.4, 0.07, FRONT + 0.1],
  ],
  [
    [-2.2, 0.07, BACK],
    [3.4, 0.07, BACK],
  ],
  // Mid-height rail and the deck's front edge.
  [
    [-1.35, 1.2, FRONT],
    [-0.65, 1.2, FRONT],
  ],
  [
    [deckLeft, deckY - 0.1, FRONT],
    [-0.65, deckY - 0.1, FRONT],
  ],
  [
    [1.55, shelfY - 0.1, FRONT],
    [3.2, shelfY - 0.1, FRONT],
  ],
  [
    [1.45, TOP, FRONT],
    [3.3, TOP, FRONT],
  ],
  [
    [1.45, TOP, BACK],
    [3.3, TOP, BACK],
  ],
  // Diagonal braces.
  [
    [-1.35, 0.15, FRONT],
    [-0.65, 1.15, FRONT],
  ],
  [
    [1.55, shelfY, BACK],
    [3.2, TOP - 0.1, BACK],
  ],
]

/** The rough wooden frame: posts, rails, braces, the deck and the shelf. */
export function Scaffold() {
  return (
    <group>
      {[...posts, ...rails].map(([from, to], i) => (
        <Beam key={i} from={from} to={to} size={0.11} />
      ))}
      <ToonMesh
        position={[(deckLeft + deckRight) / 2, deckY, (FRONT + BACK) / 2]}
        color={palette.woodDark}
      >
        <boxGeometry args={[deckRight - deckLeft, 0.07, FRONT - BACK + 0.2]} />
      </ToonMesh>
      <ToonMesh position={[2.4, shelfY, (FRONT + BACK) / 2]} color={palette.woodDark}>
        <boxGeometry args={[1.9, 0.07, FRONT - BACK + 0.2]} />
      </ToonMesh>
    </group>
  )
}

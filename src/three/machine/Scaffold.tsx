import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const FRONT = layout.frameFront
const BACK = -1.1
const { deckY, deckLeft, deckRight, deckPosts, deckCorner, shelfY, wheelAxle } = layout
const [postL, postR] = deckPosts
/** The frame's right end, where rungs run all up between its two posts. */
const RIGHT_END = 3.2
/** The right shelf's left edge, and the big timber under it. */
const SHELF_LEFT = 1.45
const { shelfTimber: SHELF_TIMBER } = layout
const TIMBER_FRONT = SHELF_TIMBER.front
const TIMBER_Y = layout.shelfY - 0.035 - SHELF_TIMBER.height / 2
/** Where the front posts over the wheel axle stand, on its bearing blocks. */
const ON_AXLE = wheelAxle.y + 0.08

/** A post from the floor up, at the front and the back. */
function postPair(x: number, top: number): [Vec3, Vec3][] {
  return [
    [
      [x, 0, FRONT],
      [x, top, FRONT],
    ],
    [
      [x, 0, BACK],
      [x, top, BACK],
    ],
  ]
}

const posts: [Vec3, Vec3][] = [
  // Over the wheel axle, the front posts stand on it, the back ones on the floor.
  ...deckPosts.flatMap((x): [Vec3, Vec3][] => [
    [
      [x, ON_AXLE, FRONT],
      [x, deckY, FRONT],
    ],
    postPair(x, deckY)[1]!,
  ]),
  // The deck's right corner post, at the back only.
  postPair(deckCorner, deckY)[1]!,
  // The right frame stops at the shelf: the vat stands on it.
  // The left ones stop under the big timber that carries the shelf's edge.
  ...postPair(1.55, TIMBER_Y - SHELF_TIMBER.height / 2),
  ...postPair(RIGHT_END, shelfY),
]

/** Rungs all up the right end, under the vat, the frame's depth long. */
const RUNG_YS = Array.from({ length: 7 }, (_, i) => 0.35 + i * 0.27)

const rails: [Vec3, Vec3][] = [
  // A skid on the floor, along the back.
  [
    [-2.2, 0.07, BACK],
    [3.4, 0.07, BACK],
  ],
  // Mid-height rail and the deck's front edge.
  [
    [postL, 1.2, FRONT],
    [postR, 1.2, FRONT],
  ],
  [
    [deckLeft, deckY - 0.1, FRONT],
    [postR, deckY - 0.1, FRONT],
  ],
  [
    [1.55, shelfY - 0.1, FRONT],
    [3.2, shelfY - 0.1, FRONT],
  ],
  // Diagonal braces.
  [
    [postL, ON_AXLE + 0.1, FRONT],
    [postR, 1.15, FRONT],
  ],
  [
    [1.55, 0.15, BACK],
    [3.2, shelfY - 0.1, BACK],
  ],
]

/** The rough wooden frame: posts, rails, braces, the deck and the shelf. */
export function Scaffold() {
  return (
    <group>
      {[...posts, ...rails].map(([from, to], i) => (
        <Beam key={i} from={from} to={to} size={0.11} />
      ))}
      {RUNG_YS.map((y) => (
        <Rod
          key={y}
          from={[RIGHT_END + 0.07, y, FRONT]}
          to={[RIGHT_END + 0.07, y, BACK]}
          radius={0.022}
          color={palette.wood}
        />
      ))}
      <ToonMesh
        position={[(deckLeft + deckRight) / 2, deckY, (FRONT + BACK) / 2]}
        color={palette.woodDark}
      >
        <boxGeometry args={[deckRight - deckLeft, 0.07, FRONT - BACK + 0.2]} />
      </ToonMesh>
      <ToonMesh position={[SHELF_LEFT + 0.95, shelfY, (FRONT + BACK) / 2]} color={palette.woodDark}>
        <boxGeometry args={[1.9, 0.07, FRONT - BACK + 0.2]} />
      </ToonMesh>
      {/* A big timber under the shelf's left edge, back to front, over the red
          line: the left posts carry it, and it carries the shelf. */}
      <ToonMesh
        position={[SHELF_TIMBER.x, TIMBER_Y, (BACK + TIMBER_FRONT) / 2]}
        color={palette.woodLight}
      >
        <boxGeometry args={[SHELF_TIMBER.width, SHELF_TIMBER.height, TIMBER_FRONT - BACK]} />
      </ToonMesh>
    </group>
  )
}

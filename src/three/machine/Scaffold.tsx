import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { Wheel } from '@/three/parts/Wheel'
import { layout } from '@/three/machine/layout'

const FRONT = layout.frameFront
const BACK = -1.1
const { deckY, deckLeft, deckRight, deckPosts, deckFront: DECK_FRONT, shelfY, wheelAxle } = layout
const [postL, postR] = deckPosts
/**
 * The big wheel inside the frame under the deck, its hub fixed on the back of
 * the deck's right front post, in front of the pipes behind it.
 */
const UNDER_DECK_WHEEL = {
  at: [deckPosts[1], 1.95, layout.deckFront - 0.055 - 0.045] as Vec3,
  radius: 0.42,
}
/** The frame's right end, where rungs run all up between its two posts. */
const RIGHT_END = 3.2
const LOW_PLANK = layout.lowPlank
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
      [x, ON_AXLE, DECK_FRONT],
      [x, deckY, DECK_FRONT],
    ],
    postPair(x, deckY)[1]!,
  ]),
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
    [postL, 1.2, DECK_FRONT],
    [postR, 1.2, DECK_FRONT],
  ],
  [
    [deckLeft, deckY - 0.1, DECK_FRONT],
    [postR, deckY - 0.1, DECK_FRONT],
  ],
  [
    [1.55, shelfY - 0.1, FRONT],
    [3.2, shelfY - 0.1, FRONT],
  ],
  // Diagonal braces.
  [
    [postL, ON_AXLE + 0.1, DECK_FRONT],
    [postR, 1.15, DECK_FRONT],
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
      {/* The big plank nailed across the right frame's front posts. */}
      <ToonMesh
        position={[
          (1.55 + RIGHT_END) / 2,
          layout.valvePlank.y,
          FRONT + 0.055 + layout.valvePlank.depth / 2,
        ]}
        color={palette.wood}
      >
        <boxGeometry
          args={[RIGHT_END - 1.55 + 0.15, layout.valvePlank.height, layout.valvePlank.depth]}
        />
      </ToonMesh>
      {/* Another one lower down, under the workbench's top. */}
      <ToonMesh
        position={[
          (1.55 + RIGHT_END) / 2,
          LOW_PLANK.y,
          FRONT + 0.055 + layout.valvePlank.depth / 2,
        ]}
        color={palette.wood}
      >
        <boxGeometry args={[RIGHT_END - 1.55 + 0.15, LOW_PLANK.height, layout.valvePlank.depth]} />
      </ToonMesh>
      {/* A big spoked wheel inside the frame under the deck, hub on the right post. */}
      <Wheel
        position={UNDER_DECK_WHEEL.at}
        radius={UNDER_DECK_WHEEL.radius}
        spokes={8}
        flatRim
        tire={false}
        color={palette.iron}
      />
      <Rod
        from={UNDER_DECK_WHEEL.at}
        to={[UNDER_DECK_WHEEL.at[0], UNDER_DECK_WHEEL.at[1], DECK_FRONT]}
        radius={0.04}
        color={palette.steel}
      />
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
        position={[(deckLeft + deckRight) / 2, deckY, (DECK_FRONT + BACK) / 2]}
        color={palette.woodDark}
      >
        <boxGeometry args={[deckRight - deckLeft, 0.07, DECK_FRONT - BACK + 0.2]} />
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

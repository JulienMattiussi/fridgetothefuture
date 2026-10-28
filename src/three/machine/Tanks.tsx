import type { Group } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { turnWay } from '@/lib/sequence'
import { palette } from '@/three/palette'
import { Ladder } from '@/three/parts/Ladder'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { Wheel } from '@/three/parts/Wheel'
import { Handle } from '@/three/sequence/Handle'
import { useTurn } from '@/three/sequence/useTurn'
import { layout } from '@/three/machine/layout'

const { vat } = layout
const capY = vat.y + vat.height + vat.cap.height / 2
/** The valve handwheel on the red cap's front, low on it. */
const VALVE = { radius: 0.22, y: capY - 0.14 }
/**
 * The ladder leans on the vat's right flank, square to it and parallel to the
 * frame's rungs below: `angle` round from straight right toward the front, its
 * foot `lean` out at the floor, its top `reach` up the grey vat.
 */
const LADDER = { angle: 0, lean: 0.75, reach: (2 / 3) * vat.height }
/** A point `out` from the vat's axis toward the ladder, at height `y`. */
const onVatSide = (out: number, y: number): Vec3 => [
  vat.x + Math.cos(LADDER.angle) * out,
  y,
  vat.z + Math.sin(LADDER.angle) * out,
]

/**
 * Up on the right shelf, the huge grey vat, its red cap
 * taking the rising pipes, a valve handwheel on its front and a ladder
 * leaning on its right (docs/references/video-cuve.jpg).
 */
export function Tanks() {
  const valve = useTurn<Group>(
    'z',
    (s) => s.readouts.topValve * turnWay('openTopValve') * 4 * Math.PI,
  )
  return (
    <group>
      <ToonMesh position={[vat.x, vat.y + vat.height / 2, vat.z]} color={palette.galvanized}>
        <cylinderGeometry args={[vat.radius, vat.radius, vat.height, 40]} />
      </ToonMesh>
      {/* The rolled lip round the vat's rim. */}
      <ToonMesh
        position={[vat.x, vat.y + vat.height, vat.z]}
        rotation={[Math.PI / 2, 0, 0]}
        color={palette.galvanized}
      >
        <torusGeometry args={[vat.radius, 0.03, 8, 48]} />
      </ToonMesh>
      <ToonMesh position={[vat.x, capY, vat.z]} color={palette.paintRed}>
        <cylinderGeometry args={[vat.cap.radius, vat.cap.radius, vat.cap.height, 32]} />
      </ToonMesh>
      {/* Opened from up the ladder: two turns. */}
      <Handle actions={['openTopValve']}>
        <Wheel
          ref={valve}
          grip
          position={[vat.x, VALVE.y, vat.z + vat.cap.radius + 0.06]}
          radius={VALVE.radius}
          spokes={6}
          tire={false}
          color={palette.iron}
        />
      </Handle>
      <Handle actions={['climbLadder']}>
        <Ladder
          foot={onVatSide(LADDER.lean + vat.radius + 0.05, 0)}
          top={onVatSide(vat.radius + 0.05, vat.y + LADDER.reach)}
          across={[-Math.sin(LADDER.angle) * 0.2, 0, Math.cos(LADDER.angle) * 0.2]}
          rungs={10}
        />
      </Handle>
    </group>
  )
}

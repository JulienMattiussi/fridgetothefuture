import { palette } from '@/three/palette'
import { Ladder } from '@/three/parts/Ladder'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { Wheel } from '@/three/parts/Wheel'
import { layout } from '@/three/machine/layout'

const { vat } = layout
const capY = vat.y + vat.height + vat.cap.height / 2

/**
 * Up on the right shelf, the huge grey vat, its red cap
 * taking the rising pipes, a valve handwheel on its front and a ladder
 * leaning on its right (docs/references/video-cuve.jpg).
 */
export function Tanks() {
  return (
    <group>
      <ToonMesh position={[vat.x, vat.y + vat.height / 2, vat.z]} color={palette.galvanized}>
        <cylinderGeometry args={[vat.radius, vat.radius * 0.92, vat.height, 40]} />
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
      <Wheel
        position={[vat.x, capY, vat.z + vat.cap.radius + 0.06]}
        radius={0.17}
        spokes={6}
        tire={false}
        color={palette.iron}
      />
      <Ladder
        foot={[vat.x + vat.radius + 0.55, 0, vat.z + 0.35]}
        top={[vat.x + vat.radius + 0.05, vat.y + vat.height + 0.1, vat.z + 0.1]}
        across={[0.17, 0, 0.13]}
        rungs={12}
      />
    </group>
  )
}

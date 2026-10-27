import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const { x, z, radius, bottom, height } = layout.boiler
const top = bottom + height
/** The shell starts this far up the bench; the dome sits on its top. */
const BASE = 0.06
/** Just under the small pipes' arrival on its flank (see Pipework). */
const RING_Y = 1.06

/**
 * The rusty upright boiler, standing on the workbench next to the basin
 * (docs/references/video-plan-large.jpg): a plain shell with a single thin
 * hoop. Pipes come into its dome and flanks.
 */
export function Boiler() {
  return (
    <group position={[x, 0, z]}>
      <ToonMesh position={[0, bottom + (height + BASE) / 2, 0]} color={palette.rust}>
        <cylinderGeometry args={[radius, radius, height + BASE, 32]} />
      </ToonMesh>
      {/* Its only hoop: a thin wire just under where the small pipes come in. */}
      <ToonMesh position={[0, RING_Y, 0]} rotation={[Math.PI / 2, 0, 0]} color={palette.rustDark}>
        <torusGeometry args={[radius + 0.004, 0.007, 6, 48]} />
      </ToonMesh>
      <ToonMesh position={[0, top + BASE, 0]} color={palette.rust}>
        <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </ToonMesh>
    </group>
  )
}

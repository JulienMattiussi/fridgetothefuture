import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const { x, z, radius, bottom, height } = layout.boiler
const top = bottom + height
const BASE = 0.06

/**
 * The rusty upright boiler, standing on the workbench next to the basin
 * (docs/references/video-plan-large.jpg). Pipes come into its dome and flanks.
 */
export function Boiler() {
  return (
    <group position={[x, 0, z]}>
      <ToonMesh position={[0, bottom + BASE / 2, 0]} color={palette.rustDark}>
        <cylinderGeometry args={[radius * 1.06, radius * 1.1, BASE, 32]} />
      </ToonMesh>
      <ToonMesh position={[0, bottom + BASE + height / 2, 0]} color={palette.rust}>
        <cylinderGeometry args={[radius, radius, height, 32]} />
      </ToonMesh>
      {[0.12, 0.5, 0.92].map((h) => (
        <ToonMesh
          key={h}
          position={[0, bottom + BASE + h * height, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          color={palette.rustDark}
        >
          <torusGeometry args={[radius + 0.01, 0.025, 8, 40]} />
        </ToonMesh>
      ))}
      <ToonMesh position={[0, top + BASE, 0]} color={palette.rust}>
        <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </ToonMesh>
    </group>
  )
}

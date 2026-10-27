import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const GLASS = { x: 1.95, z: -0.6, radius: 0.32, height: 0.9 }
const BARREL = { x: 2.8, z: -0.6, radius: 0.42, height: 1.1 }

/** Up on the right shelf: the big glass tank and the wooden water tank. */
export function Tanks() {
  const glassY = layout.shelfY + 0.05 + GLASS.height / 2
  const barrelY = layout.shelfY + 0.05 + BARREL.height / 2
  return (
    <group>
      <ToonMesh position={[GLASS.x, glassY, GLASS.z]} color={palette.glass} opacity={0.45}>
        <cylinderGeometry args={[GLASS.radius, GLASS.radius, GLASS.height, 32]} />
      </ToonMesh>
      {[-1, 1].map((side) => (
        <ToonMesh
          key={side}
          position={[GLASS.x, glassY + (side * GLASS.height) / 2, GLASS.z]}
          color={palette.brass}
        >
          <cylinderGeometry args={[GLASS.radius + 0.03, GLASS.radius + 0.03, 0.07, 32]} />
        </ToonMesh>
      ))}
      <ToonMesh position={[BARREL.x, barrelY, BARREL.z]} color={palette.woodDark}>
        <cylinderGeometry args={[BARREL.radius, BARREL.radius, BARREL.height, 24]} />
      </ToonMesh>
      {[-0.4, 0, 0.4].map((h) => (
        <ToonMesh
          key={h}
          position={[BARREL.x, barrelY + h * BARREL.height, BARREL.z]}
          rotation={[Math.PI / 2, 0, 0]}
          color={palette.iron}
        >
          <torusGeometry args={[BARREL.radius + 0.01, 0.022, 8, 40]} />
        </ToonMesh>
      ))}
    </group>
  )
}

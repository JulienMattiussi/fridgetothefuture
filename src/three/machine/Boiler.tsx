import { palette } from '@/three/palette'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const { x, z, radius, bottom, height } = layout.boiler
const top = bottom + height

/** The rusty upright boiler at the heart of the machine, on its firebox. */
export function Boiler() {
  return (
    <group position={[x, 0, z]}>
      {/* Firebox, with its door facing the room. */}
      <ToonMesh position={[0, bottom / 2, 0]} color={palette.iron}>
        <cylinderGeometry args={[radius * 1.15, radius * 1.2, bottom, 32]} />
      </ToonMesh>
      <ToonMesh position={[0, bottom / 2, radius * 1.15]} color={palette.ink} outline={0}>
        <boxGeometry args={[0.24, 0.2, 0.03]} />
      </ToonMesh>
      <ToonMesh position={[0, bottom + height / 2, 0]} color={palette.rust}>
        <cylinderGeometry args={[radius, radius, height, 32]} />
      </ToonMesh>
      {[0.15, 0.45, 0.75, 1.05].map((h) => (
        <ToonMesh
          key={h}
          position={[0, bottom + h * height, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          color={palette.rustDark}
        >
          <torusGeometry args={[radius + 0.01, 0.025, 8, 40]} />
        </ToonMesh>
      ))}
      <ToonMesh position={[0, top, 0]} color={palette.rust}>
        <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </ToonMesh>
      {/* The stack, where the smoke comes out at the top. */}
      <Rod from={[0, top + radius - 0.05, 0]} to={[0, 3.5, 0]} radius={0.08} color={palette.iron} />
    </group>
  )
}

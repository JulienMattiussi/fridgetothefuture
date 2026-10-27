import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const PLANK = 0.32
const WALL_HEIGHT = 9
const planks = Array.from({ length: 44 }, (_, i) => -7 + PLANK * (i + 0.5))

/** The livery stable around the machine: hay floor, plank wall, roof beams. */
export function Stable() {
  const z = layout.wallZ
  return (
    <group>
      <ToonMesh rotation={[-Math.PI / 2, 0, 0]} color={palette.hay} outline={0}>
        <planeGeometry args={[30, 30]} />
      </ToonMesh>
      {planks.map((x, i) => (
        <ToonMesh
          key={x}
          position={[x, WALL_HEIGHT / 2, z - (i % 3) * 0.01]}
          color={i % 2 ? palette.wall : palette.wallLight}
          outline={0}
        >
          <boxGeometry args={[PLANK - 0.015, WALL_HEIGHT, 0.04]} />
        </ToonMesh>
      ))}
      <Beam from={[-7, 4.2, z + 0.1]} to={[7, 4.2, z + 0.1]} size={0.2} color={palette.woodDark} />
      {[-4.5, -2.5, 4.5].map((x) => (
        <Beam
          key={x}
          from={[x, 0, z + 0.12]}
          to={[x, 4.2, z + 0.12]}
          size={0.2}
          color={palette.woodDark}
        />
      ))}
    </group>
  )
}

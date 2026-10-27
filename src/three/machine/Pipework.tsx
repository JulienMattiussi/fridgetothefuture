import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Pipe } from '@/three/parts/Pipe'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const { x: bx, z: bz, radius: br } = layout.boiler
const [sx, sy, sz] = layout.spout

const pipes: { points: Vec3[]; radius?: number; color?: string }[] = [
  // The two long diagonals, from the top right down to the control box.
  {
    points: [
      [1.4, 3.3, -0.5],
      [-1.75, 1.55, 0],
      [-1.75, 1.3, 0],
    ],
    radius: 0.075,
  },
  {
    points: [
      [bx - br, 1.6, bz],
      [-1.45, 1.35, 0.1],
      [-1.45, 1.3, 0.1],
    ],
  },
  // From the boiler's top to the glass tank on the right.
  {
    points: [
      [bx + br - 0.05, 1.95, bz],
      [1.9, 1.85, bz],
      [1.9, 1.85, -0.6],
      [1.9, 2.5, -0.6],
    ],
  },
  // Low feed into the control box.
  {
    points: [
      [bx - br, 0.9, bz],
      [-0.85, 0.9, 0.1],
      [-1.0, 0.9, 0.1],
    ],
    radius: 0.05,
  },
  // The copper line that ends in the ice spout over the basin.
  {
    points: [
      [bx + br, 1.15, bz],
      [sx, 1.25, bz],
      [sx, 1.25, sz],
      [sx, sy, sz],
    ],
    radius: 0.045,
    color: palette.brass,
  },
]

/** All the pipes, plus the steam whistle and its pull cord. */
export function Pipework() {
  return (
    <group>
      {pipes.map((pipe, i) => (
        <Pipe key={i} {...pipe} />
      ))}
      {/* Spout nozzle. */}
      <ToonMesh position={[sx, sy - 0.04, sz]} color={palette.brass}>
        <cylinderGeometry args={[0.045, 0.07, 0.08, 16]} />
      </ToonMesh>
      {/* Steam whistle on the tank line, its cord hanging down for Doc. */}
      <ToonMesh position={[1.2, 2.02, bz]} color={palette.brass}>
        <cylinderGeometry args={[0.05, 0.05, 0.22, 16]} />
      </ToonMesh>
      <Rod
        from={[1.25, 1.95, bz + 0.05]}
        to={[1.25, 1.35, bz + 0.1]}
        radius={0.008}
        color={palette.hay}
      />
    </group>
  )
}

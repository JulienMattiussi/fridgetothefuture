import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'

interface PipeProps {
  /** The pipe's path: straight runs between points, a round elbow at each bend. */
  points: Vec3[]
  radius?: number
  color?: string
}

export function Pipe({ points, radius = 0.06, color = palette.steel }: PipeProps) {
  const runs = points.slice(1).map((to, i) => [points[i]!, to] as const)
  return (
    <group>
      {runs.map(([from, to], i) => (
        <Rod key={`run-${i}`} from={from} to={to} radius={radius} color={color} />
      ))}
      {points.slice(1, -1).map((point, i) => (
        <ToonMesh key={`elbow-${i}`} position={point} color={color}>
          <sphereGeometry args={[radius * 1.15, 16, 12]} />
        </ToonMesh>
      ))}
    </group>
  )
}

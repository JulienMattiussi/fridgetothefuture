import type { Vec3 } from '@/lib/geometry'
import { Beam } from '@/three/parts/Beam'

interface LadderProps {
  /** The middle of the ladder's foot. */
  foot: Vec3
  /** The middle of its top. */
  top: Vec3
  /** Half the gap between the two rails, as a vector across the ladder. */
  across: Vec3
  rungs: number
}

const shift = (p: Vec3, v: Vec3, k: number): Vec3 => [
  p[0] + v[0] * k,
  p[1] + v[1] * k,
  p[2] + v[2] * k,
]

/** A wooden ladder: two rails and evenly spaced rungs. */
export function Ladder({ foot, top, across, rungs }: LadderProps) {
  const up: Vec3 = [top[0] - foot[0], top[1] - foot[1], top[2] - foot[2]]
  return (
    <group>
      {[-1, 1].map((side) => (
        <Beam
          key={side}
          from={shift(foot, across, side)}
          to={shift(top, across, side)}
          size={0.07}
        />
      ))}
      {Array.from({ length: rungs }, (_, i) => {
        const at = shift(foot, up, (i + 1) / (rungs + 1))
        return (
          <Beam
            key={i}
            from={shift(at, across, -1)}
            to={shift(at, across, 1)}
            size={0.04}
            outline={0}
          />
        )
      })}
    </group>
  )
}

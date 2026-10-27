import { beltRuns, type Pulley } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'

interface BeltProps {
  from: Pulley
  to: Pulley
  width?: number
}

/** A flat leather belt between two pulleys; only its straight runs are drawn. */
export function Belt({ from, to, width = 0.07 }: BeltProps) {
  return (
    <group>
      {beltRuns(from, to).map(([start, end], i) => (
        <Beam key={i} from={start} to={end} size={0.015} depth={width} color={palette.leather} />
      ))}
    </group>
  )
}

import { DoubleSide } from 'three'
import { beltRuns, beltWraps, type Pulley } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { ToonMesh } from '@/three/parts/ToonMesh'

interface BeltProps {
  from: Pulley
  to: Pulley
  width?: number
}

const THICKNESS = 0.015

/** A flat leather belt between two pulleys: its straight runs, and its wraps round both. */
export function Belt({ from, to, width = 0.07 }: BeltProps) {
  const wraps = beltWraps(from, to)
  return (
    <group>
      {beltRuns(from, to).map(([start, end], i) => (
        <Beam
          key={i}
          from={start}
          to={end}
          size={THICKNESS}
          depth={width}
          color={palette.leather}
        />
      ))}
      {[from, to].map((pulley, i) => {
        const { start, sweep } = wraps[i]!
        const r = pulley.radius + THICKNESS / 2
        // An open cylinder stood along Z: its theta runs a quarter turn ahead of the XY angle.
        return (
          <ToonMesh
            key={i}
            position={pulley.center}
            rotation={[Math.PI / 2, 0, 0]}
            color={palette.leather}
            side={DoubleSide}
          >
            <cylinderGeometry args={[r, r, width, 32, 1, true, start + Math.PI / 2, sweep]} />
          </ToonMesh>
        )
      })}
    </group>
  )
}

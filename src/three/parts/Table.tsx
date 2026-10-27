import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { ToonMesh } from '@/three/parts/ToonMesh'

interface TableProps {
  left: number
  right: number
  back: number
  front: number
  top: number
  /** False for a top carried by something else (trestles, uprights). */
  legs?: boolean
}

const THICKNESS = 0.06
const INSET = 0.06

/** A plank table, on four square legs unless it has its own supports. */
export function Table({ left, right, back, front, top, legs = true }: TableProps) {
  const legX = [left + INSET, right - INSET]
  const legZ = [back + INSET, front - INSET]
  return (
    <group>
      <ToonMesh
        position={[(left + right) / 2, top - THICKNESS / 2, (back + front) / 2]}
        color={palette.woodLight}
      >
        <boxGeometry args={[right - left, THICKNESS, front - back]} />
      </ToonMesh>
      {legs &&
        legX.flatMap((x) =>
          legZ.map((z) => (
            <Beam key={`${x}:${z}`} from={[x, 0, z]} to={[x, top - THICKNESS, z]} size={0.07} />
          )),
        )}
    </group>
  )
}

import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'

interface RivetedFootProps {
  /** The plate's ends, left and right. */
  left: number
  right: number
  /** The table top it is riveted on, and that top's front edge. */
  top: number
  front: number
  /** How far back from the edge the plate runs on the top. */
  reach: number
  /** How far down the front edge it folds. */
  drop: number
}

const PLATE = 0.012
const RIVET = 0.012
const PITCH = 0.06

/** Rivet heads in a row from `from` to `to`, at the given height and depth. */
function rivetRow(from: number, to: number) {
  const count = Math.max(2, Math.floor((to - from) / PITCH))
  return Array.from({ length: count }, (_, i) => from + ((i + 0.5) * (to - from)) / count)
}

/**
 * A device's iron foot: a plate bent over a table's front edge and riveted
 * on top and down the front.
 */
export function RivetedFoot({ left, right, top, front, reach, drop }: RivetedFootProps) {
  const width = right - left
  const x = (left + right) / 2
  const xs = rivetRow(left, right)
  return (
    <group>
      <ToonMesh position={[x, top + PLATE / 2, front - reach / 2]} color={palette.steel}>
        <boxGeometry args={[width, PLATE, reach]} />
      </ToonMesh>
      <ToonMesh position={[x, top - drop / 2, front + PLATE / 2]} color={palette.steel}>
        <boxGeometry args={[width, drop + PLATE, PLATE]} />
      </ToonMesh>
      {[top - drop * 0.3, top - drop * 0.75].flatMap((y) =>
        xs.map((rx) => (
          <ToonMesh
            key={`${y}:${rx}`}
            position={[rx, y, front + PLATE]}
            color={palette.iron}
            outline={0}
          >
            <sphereGeometry args={[RIVET, 8, 6]} />
          </ToonMesh>
        )),
      )}
      {xs.map((rx) => (
        <ToonMesh
          key={rx}
          position={[rx, top + PLATE, front - 0.05]}
          color={palette.iron}
          outline={0}
        >
          <sphereGeometry args={[RIVET, 8, 6]} />
        </ToonMesh>
      ))}
    </group>
  )
}

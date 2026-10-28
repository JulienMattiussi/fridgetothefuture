import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { DoubleSide, type Group, type Vector3 } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'
import { Handle } from '@/three/sequence/Handle'
import { layout } from '@/three/machine/layout'

const { bench, ductMouth, basinLift } = layout
const DEPTH = 0.1
/** On the bench under the duct, and lifted up under its mouth. */
const REST: Vec3 = [ductMouth[0], bench.top, ductMouth[2]]
const UP: Vec3 = [REST[0], REST[1] + basinLift, REST[2]]
/** Where its middle goes, lifted: the drag's target. */
const UP_MIDDLE: Vec3 = [UP[0], UP[1] + DEPTH / 2, UP[2]]
/** How long it takes to settle up or down, roughly, in seconds. */
const EASE = 0.25

/**
 * The enamel basin on the bench under the cold-air duct. Lifted up under the
 * duct's mouth while the cold gushes, it catches the ice cube, then goes back
 * down on the bench with it. `onMove` follows where it is, for the cube.
 */
export function Basin({ onMove }: { onMove: (at: Vector3) => void }) {
  const sequence = useSequence()
  const basin = useRef<Group>(null)
  const carried = useRef(false)
  useFrame((_, dt) => {
    if (!basin.current) return
    onMove(basin.current.position)
    if (carried.current) return
    const up = sequence?.readouts.basin ?? 0
    const goal = REST[1] + basinLift * up
    const { position } = basin.current
    position.y += (goal - position.y) * (1 - Math.exp(-dt / EASE))
    position.x += (REST[0] - position.x) * (1 - Math.exp(-dt / EASE))
    position.z += (REST[2] - position.z) * (1 - Math.exp(-dt / EASE))
  })
  const move = (point: Vector3 | null) => {
    if (!basin.current) return
    carried.current = point !== null
    // Let go, it settles where the sequence says: up if it took, back down if not.
    if (point) basin.current.position.set(point.x, point.y - DEPTH / 2, point.z)
  }
  return (
    <Handle actions={['holdBasin']} drag={{ target: UP_MIDDLE, move }}>
      <group ref={basin} position={REST}>
        <ToonMesh position={[0, DEPTH / 2, 0]} color={palette.enamel} side={DoubleSide}>
          <cylinderGeometry args={[0.2, 0.13, DEPTH, 32, 1, true]} />
        </ToonMesh>
        <ToonMesh position={[0, 0.005, 0]} color={palette.enamel} outline={0}>
          <cylinderGeometry args={[0.13, 0.13, 0.01, 32]} />
        </ToonMesh>
      </group>
    </Handle>
  )
}

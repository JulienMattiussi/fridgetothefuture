import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'

const WATER = '#5f93bd'
/** How wide the puddle spreads, and how fast, in meters and seconds. */
const PUDDLE = { radius: 0.35, time: 3 }

/**
 * Water running out of the duct instead of ice: a stream falling from its
 * mouth onto the bench, and a puddle spreading there.
 */
export function Water({ mouth, floor }: { mouth: Vec3; floor: number }) {
  const sequence = useSequence()
  const group = useRef<Group>(null)
  const stream = useRef<Mesh>(null)
  const puddle = useRef<Mesh>(null)
  const drop = mouth[1] - floor
  useFrame(() => {
    const failure = sequence?.readouts.failure
    const t = failure?.kind === 'water' ? failure.since : -1
    if (group.current) group.current.visible = t >= 0
    if (t < 0) return
    // The stream reaches down in a blink, wobbling.
    const reach = Math.min(1, t / 0.3)
    if (stream.current) {
      stream.current.scale.set(1 + 0.15 * Math.sin(t * 31), reach, 1 + 0.15 * Math.sin(t * 23))
      stream.current.position.y = -(drop * reach) / 2
    }
    puddle.current?.scale.setScalar(Math.max(0.01, Math.min(1, (t - 0.3) / PUDDLE.time)))
  })
  return (
    <group ref={group} position={mouth} visible={false}>
      <ToonMesh ref={stream} color={WATER} opacity={0.8} outline={0}>
        <cylinderGeometry args={[0.025, 0.035, drop, 12]} />
      </ToonMesh>
      <ToonMesh
        ref={puddle}
        position={[0, -drop + 0.004, 0]}
        color={WATER}
        opacity={0.75}
        outline={0}
      >
        <cylinderGeometry args={[PUDDLE.radius, PUDDLE.radius, 0.006, 32]} />
      </ToonMesh>
    </group>
  )
}

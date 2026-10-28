import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'
import { layout } from '@/three/machine/layout'

const WATER = '#5f93bd'
/** How long the basin takes to fill, then how wide the overflow spreads, and how fast. */
const FILL = 2.5
const PUDDLE = { radius: 0.35, time: 3 }
const { basin } = layout

/**
 * Water running out of the duct instead of ice: a stream falling from its
 * mouth into the basin on the bench under it, filling it up, then spilling
 * over into a puddle spreading round it.
 */
export function Water({ mouth, floor }: { mouth: Vec3; floor: number }) {
  const sequence = useSequence()
  const group = useRef<Group>(null)
  const stream = useRef<Mesh>(null)
  const puddle = useRef<Mesh>(null)
  const level = useRef<Mesh>(null)
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
    // The basin fills, its surface widening up its flaring side; full, it spills.
    const full = Math.min(1, Math.max(0, (t - 0.3) / FILL))
    if (level.current) {
      level.current.visible = full > 0
      level.current.position.y = -drop + 0.012 + (basin.depth - 0.02) * full
      level.current.scale.setScalar(1 + ((basin.rim - basin.bottom) / basin.bottom) * full * 0.9)
    }
    const spill = (t - 0.3 - FILL) / PUDDLE.time
    if (puddle.current) {
      puddle.current.visible = spill > 0
      puddle.current.scale.setScalar(Math.max(0.01, Math.min(1, spill)))
    }
  })
  return (
    <group ref={group} position={mouth} visible={false}>
      <ToonMesh ref={stream} color={WATER} opacity={0.8} outline={0}>
        <cylinderGeometry args={[0.025, 0.035, drop, 12]} />
      </ToonMesh>
      <ToonMesh ref={level} color={WATER} opacity={0.85} outline={0} visible={false}>
        <cylinderGeometry args={[basin.bottom, basin.bottom, 0.004, 32]} />
      </ToonMesh>
      <ToonMesh
        ref={puddle}
        visible={false}
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

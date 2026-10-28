import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh, MeshToonMaterial } from 'three'
import type { Failure } from '@/lib/sequence'
import type { Vec3 } from '@/lib/geometry'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'

interface BurstProps {
  /** The breakdown that sets it off, and where. */
  on: Failure
  at: Vec3
  /** How many puffs, how far they fly out, how big they swell. */
  count: number
  reach: number
  size: number
  colors: string[]
  /** How long it lasts, in seconds. */
  life?: number
}

const ignorePointer = () => {}

/**
 * A one-off blast: puffs flung out every way from `at` as the machine breaks
 * down `on`, swelling, slowing and fading.
 */
export function Burst({ on, at, count, reach, size, colors, life = 2.5 }: BurstProps) {
  const sequence = useSequence()
  const group = useRef<Group>(null)
  const puffs = useRef<(Mesh | null)[]>([])
  useFrame(() => {
    const failure = sequence?.readouts.failure
    const t = failure?.kind === on ? failure.since : -1
    const live = t >= 0 && t < life
    if (group.current) group.current.visible = live
    if (!live) return
    // Fast out, then slowing: the square root of the time.
    const out = reach * Math.sqrt(Math.min(1, t / (life * 0.6)))
    puffs.current.forEach((puff, i) => {
      if (!puff) return
      // Spread evenly over a sphere (a golden spiral), a little more upward.
      const y = 1 - (2 * (i + 0.5)) / count
      const ring = Math.sqrt(1 - y * y)
      const angle = i * 2.39996
      const spread = 0.6 + 0.4 * ((i * 0.618) % 1)
      puff.position.set(
        Math.cos(angle) * ring * out * spread,
        (y * 0.7 + 0.3) * out * spread,
        Math.sin(angle) * ring * out * spread,
      )
      puff.scale.setScalar(size * (0.6 + 2 * (t / life)))
      ;(puff.material as MeshToonMaterial).opacity = 0.95 * (1 - t / life)
    })
  })
  return (
    <group ref={group} position={at} visible={false}>
      {Array.from({ length: count }, (_, i) => (
        <ToonMesh
          key={i}
          ref={(mesh) => {
            puffs.current[i] = mesh
          }}
          color={colors[i % colors.length]!}
          opacity={0.9}
          outline={0}
          raycast={ignorePointer}
        >
          <sphereGeometry args={[0.1, 12, 10]} />
        </ToonMesh>
      ))}
    </group>
  )
}

import { useFrame } from '@react-three/fiber'
import { type ReactNode, useRef } from 'react'
import type { Group } from 'three'
import type { Failure } from '@/lib/sequence'
import type { Vec3 } from '@/lib/geometry'
import { useSequence } from '@/three/sequence/context'

/** How far it swings out, torn off, in radians, and how long it whips about. */
const SWING = 0.45
const WHIP = 3

/**
 * Tears its children loose as the machine breaks down `on`: they swing out
 * about `pivot` (the end that holds) and whip about as the steam drives them.
 */
export function Tear({ on, pivot, children }: { on: Failure; pivot: Vec3; children: ReactNode }) {
  const sequence = useSequence()
  const swing = useRef<Group>(null)
  useFrame(() => {
    if (!swing.current) return
    const failure = sequence?.readouts.failure
    const t = failure?.kind === on ? failure.since : 0
    const out = Math.min(1, t / 0.25)
    const whip = 0.12 * Math.sin(t * 25) * Math.max(0, 1 - t / WHIP)
    swing.current.rotation.z = -(SWING * out + whip * out)
  })
  return (
    <group ref={swing} position={pivot}>
      <group position={[-pivot[0], -pivot[1], -pivot[2]]}>{children}</group>
    </group>
  )
}

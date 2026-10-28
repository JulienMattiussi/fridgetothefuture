import { useFrame } from '@react-three/fiber'
import { type ReactNode, useRef } from 'react'
import type { Group } from 'three'
import { useSequence } from '@/three/sequence/context'

/** How far, in meters, the shaken parts jolt at full shaking. */
const AMPLITUDE = 0.006

/** Shakes its children about while the machine knocks, as hard as the sequence's `shaking`. */
export function Shaking({ children }: { children: ReactNode }) {
  const sequence = useSequence()
  const group = useRef<Group>(null)
  useFrame(() => {
    if (!sequence || !group.current) return
    const { time, readouts } = sequence
    const a = AMPLITUDE * readouts.shaking
    // Uneven frequencies, so it knocks rather than hums.
    group.current.position.set(
      a * Math.sin(time * 41) * Math.sin(time * 3.1),
      a * Math.sin(time * 53 + 1),
      a * 0.5 * Math.sin(time * 37 + 2),
    )
  })
  return <group ref={group}>{children}</group>
}

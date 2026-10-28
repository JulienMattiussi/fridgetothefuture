import { useFrame } from '@react-three/fiber'
import { type ReactNode, useRef } from 'react'
import type { Group } from 'three'
import type { Readouts } from '@/lib/sequence'
import { useSequence } from '@/three/sequence/context'

interface ShakingProps {
  children: ReactNode
  /** How far, in meters, the parts jolt at full shaking. */
  amplitude?: number
  /** How fast they knock: 1 is the boiler's pace, higher rattles quicker. */
  pace?: number
  /** Sets this part's own rhythm, so no two shake in step. */
  seed?: number
  /** How hard it shakes, 0 to 1, from what the machine shows: the knocking by default. */
  level?: (readouts: Readouts) => number
}

const knocking = (readouts: Readouts) => readouts.shaking

/** Shakes its children about while the machine knocks, as hard as `level` says. */
export function Shaking({
  children,
  amplitude = 0.006,
  pace = 1,
  seed = 0,
  level = knocking,
}: ShakingProps) {
  const sequence = useSequence()
  const group = useRef<Group>(null)
  // Uneven frequencies and phases, from the seed, so it knocks rather than hums.
  const f = (k: number) => pace * (k + ((seed * 7.3) % 9))
  const phase = seed * 2.17
  useFrame(() => {
    if (!sequence || !group.current) return
    const { readouts } = sequence
    const t = sequence.time + phase
    const a = amplitude * level(readouts)
    group.current.position.set(
      a * Math.sin(t * f(41)) * Math.sin(t * f(3.1)),
      a * Math.sin(t * f(53) + 1),
      a * 0.5 * Math.sin(t * f(37) + 2),
    )
  })
  return <group ref={group}>{children}</group>
}

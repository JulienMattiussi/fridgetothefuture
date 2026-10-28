import { useFrame } from '@react-three/fiber'
import { type ReactNode, useRef } from 'react'
import type { Group } from 'three'
import type { Failure } from '@/lib/steps'
import { useSequence } from '@/three/sequence/context'
import { brokenFor } from '@/lib/readouts'

/** Hides its children `after` seconds into the breakdown `on`: blown to bits. */
export function Vanish({
  on,
  after,
  children,
}: {
  on: Failure
  after: number
  children: ReactNode
}) {
  const sequence = useSequence()
  const group = useRef<Group>(null)
  useFrame(() => {
    const since = sequence ? brokenFor(sequence.readouts, on) : -1
    if (group.current) group.current.visible = since < after
  })
  return <group ref={group}>{children}</group>
}

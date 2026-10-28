import { useFrame } from '@react-three/fiber'
import { type ReactNode, useRef } from 'react'
import type { Group } from 'three'
import type { Failure } from '@/lib/sequence'
import { useSequence } from '@/three/sequence/context'

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
    const failure = sequence?.readouts.failure
    if (group.current) group.current.visible = !(failure?.kind === on && failure.since >= after)
  })
  return <group ref={group}>{children}</group>
}

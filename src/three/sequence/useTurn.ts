import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Object3D } from 'three'
import { useSequence } from '@/three/sequence/context'
import type { SequenceStore } from '@/three/sequence/store'

/**
 * A ref whose object turns about its local `axis` to `angle(sequence)` every
 * frame (the full angle, rest pose included). Still outside a sequence.
 */
export function useTurn<T extends Object3D>(
  axis: 'x' | 'y' | 'z',
  angle: (sequence: SequenceStore) => number,
) {
  const ref = useRef<T>(null)
  const sequence = useSequence()
  useFrame(() => {
    if (sequence && ref.current) ref.current.rotation[axis] = angle(sequence)
  })
  return ref
}

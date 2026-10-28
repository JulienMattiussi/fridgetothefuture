import { useFrame } from '@react-three/fiber'
import { useSequence } from '@/three/sequence/context'

/** Ticks the sequence with the render loop. */
export function SequenceClock() {
  const sequence = useSequence()
  useFrame((_, dt) => sequence?.tick(dt))
  return null
}

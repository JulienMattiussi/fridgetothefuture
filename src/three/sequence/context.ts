import { createContext, useContext, useSyncExternalStore } from 'react'
import type { SequenceStore } from '@/three/sequence/store'

export const SequenceContext = createContext<SequenceStore | null>(null)

/** The live sequence, or null outside one (a part drawn on its own stays still). */
export function useSequence() {
  return useContext(SequenceContext)
}

/** The sequence's phase, re-rendering on each change: for the overlay's buttons. */
export function usePhase(store: SequenceStore) {
  return useSyncExternalStore(store.subscribe, () => store.phase)
}

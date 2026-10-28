import { useEffect, useState } from 'react'
import { Scene } from '@/three/Scene'
import { SequenceContext } from '@/three/sequence/context'
import { createSequenceStore } from '@/three/sequence/store'
import { Controls } from '@/ui/Controls'

export default function App() {
  const [sequence] = useState(createSequenceStore)
  // `?e2e` hands the sequence to the end-to-end tests, which play it without
  // the mouse gestures.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('e2e')) Object.assign(window, { sequence })
  }, [sequence])
  return (
    <main className="relative h-full w-full">
      <SequenceContext value={sequence}>
        <Scene />
      </SequenceContext>
      <Controls sequence={sequence} />
    </main>
  )
}

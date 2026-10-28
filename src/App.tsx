import { useState } from 'react'
import { Scene } from '@/three/Scene'
import { SequenceContext } from '@/three/sequence/context'
import { createSequenceStore } from '@/three/sequence/store'
import { Controls } from '@/ui/Controls'

export default function App() {
  const [sequence] = useState(createSequenceStore)
  return (
    <main className="relative h-full w-full">
      <SequenceContext value={sequence}>
        <Scene />
      </SequenceContext>
      <Controls sequence={sequence} />
    </main>
  )
}

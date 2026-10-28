import { useEffect, useState } from 'react'
import { Scene } from '@/three/Scene'
import { SequenceContext } from '@/three/sequence/context'
import { createSequenceStore } from '@/three/sequence/store'
import { Controls } from '@/ui/Controls'
import { createEndingsStore } from '@/ui/endingsStore'
import { LanguageProvider } from '@/ui/LanguageProvider'
import { useLanguage } from '@/ui/useLanguage'
import { LanguageSwitch } from '@/ui/LanguageSwitch'
import { Trophies } from '@/ui/Trophies'

export default function App() {
  return (
    <LanguageProvider>
      <Page />
    </LanguageProvider>
  )
}

function Page() {
  const [sequence] = useState(createSequenceStore)
  const [endings] = useState(() => createEndingsStore(sequence))
  const [orbit, setOrbit] = useState(false)
  const { t } = useLanguage()
  // `?e2e` hands the sequence to the end-to-end tests, which play it without
  // the mouse gestures.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('e2e')) Object.assign(window, { sequence })
  }, [sequence])
  return (
    <main className="relative h-full w-full">
      <SequenceContext value={sequence}>
        <Scene orbit={orbit} label={t.scene} />
      </SequenceContext>
      <Controls sequence={sequence} endings={endings} />
      <Trophies endings={endings} orbit={orbit} onOrbit={setOrbit} />
      <LanguageSwitch />
    </main>
  )
}

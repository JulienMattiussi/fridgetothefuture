import { useEffect, useState } from 'react'
import { Plate, PlateRule } from '@/ui/Plate'
import { useLanguage } from '@/ui/useLanguage'

/** How long the title stays up, then how long it fades, in milliseconds. */
const SHOWN = 4000
const FADE = 800

/**
 * The title plate over the scene as the page opens: it fades away by itself
 * after a few seconds, or at a click.
 */
export function Splash() {
  const { t } = useLanguage()
  const [stage, setStage] = useState<'shown' | 'fading' | 'gone'>('shown')
  useEffect(() => {
    if (stage === 'gone') return
    const timer = setTimeout(
      () => setStage(stage === 'shown' ? 'fading' : 'gone'),
      stage === 'shown' ? SHOWN : FADE,
    )
    return () => clearTimeout(timer)
  }, [stage])
  if (stage === 'gone') return null
  return (
    <button
      type="button"
      onClick={() => setStage('fading')}
      aria-label={t.close}
      className={`absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 transition-opacity ease-out ${
        stage === 'fading' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE}ms` }}
    >
      <Plate className="max-w-2xl">
        <div className="flex flex-col items-center px-6 py-4 text-center">
          <p className="text-sm tracking-[0.4em] text-[#d8c3a0] uppercase">{t.splashKicker}</p>
          <h1 className="mt-2 text-5xl font-bold tracking-[0.12em] text-[#f0cf7f] uppercase [text-shadow:0_3px_0_rgba(0,0,0,0.8),0_0_28px_rgba(255,190,90,0.45)]">
            The Fridge Timeback Machine
          </h1>
          <PlateRule />
          <p className="text-xl text-[#f3e6cf] italic">{t.splashTagline}</p>
        </div>
      </Plate>
    </button>
  )
}

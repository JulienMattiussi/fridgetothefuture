import { useSyncExternalStore } from 'react'
import { usePhase } from '@/three/sequence/context'
import type { EndingsStore } from '@/ui/endingsStore'
import type { SequenceStore } from '@/three/sequence/store'

/** What to do or what happens, phase by phase. */
const HINTS: Record<string, string> = {
  idle: 'Glissez les bûches de Doc dans le poêle, dans l’ordre : verte, jaune, rouge.',
  stoking: 'Le feu prend...',
  lit: 'Ouvrez la petite vanne en bas à droite : tournez vers la gauche.',
  primed: "Montez à l'échelle de la cuve.",
  climbed: 'Ouvrez la vanne du haut pour lancer le moteur : tournez vers la droite.',
  starting: 'Le moteur démarre par à-coups...',
  running: '« Tourne à fond vers la gauche ! »',
  cranked: 'Ouvrez la grande vanne de cuivre : tournez vers la droite.',
  jet: 'Le froid jaillit du conduit : levez la bassine dessous.',
  waiting: 'Le froid retombe... attendez.',
  dropping: 'Un glaçon tombe !',
  caught: 'Prenez le glaçon à la pince et mettez-le dans le verre.',
  served: '« Thé glacé ? »',
}

const BUTTON =
  'pointer-events-auto rounded border border-amber-200/40 bg-stone-900/80 px-3 py-1.5 text-amber-50 hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-amber-300'

/**
 * The overlay: the current hint, and a button to start over once begun; at
 * the end, the verdict: success, or a mishandling (the machine shows what
 * broke). The steps themselves are only played on the machine's parts.
 */
export function Controls({
  sequence,
  endings,
}: {
  sequence: SequenceStore
  endings: EndingsStore
}) {
  const phase = usePhase(sequence)
  const { last } = useSyncExternalStore(endings.subscribe, endings.get)
  const restart = (
    <button type="button" onClick={() => sequence.act('reset')} className={BUTTON}>
      Recommencer
    </button>
  )
  if (phase === 'failed' || phase === 'served') {
    const won = phase === 'served'
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center p-4">
        <div
          role="status"
          className={`flex max-w-xl flex-col items-center gap-3 rounded-lg border-2 bg-black/75 px-6 py-4 text-center text-amber-50 ${
            won ? 'border-amber-300' : 'border-red-500'
          }`}
        >
          <p className={`text-2xl font-bold ${won ? 'text-amber-300' : 'text-red-400'}`}>
            {won ? 'Réussite !' : 'Échec'}
          </p>
          <p className="text-lg">{won ? HINTS.served : 'Il y a eu une erreur de manipulation.'}</p>
          {last && (
            <p className="text-amber-200">
              {last.isNew ? `Fin ${last.number} débloquée !` : `Fin ${last.number}`}
            </p>
          )}
          {restart}
        </div>
      </div>
    )
  }
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-3 p-4">
      <p aria-live="polite" className="rounded bg-black/60 px-4 py-2 text-lg text-amber-50">
        {HINTS[phase]}
      </p>
      {sequence.can('reset') && restart}
    </div>
  )
}

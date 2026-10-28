import { useSyncExternalStore } from 'react'
import { usePhase } from '@/three/sequence/context'
import type { EndingsStore } from '@/ui/endingsStore'
import { BRASS_BUTTON, Plate, PlateRule, PlateTitle } from '@/ui/Plate'
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
    <button type="button" onClick={() => sequence.act('reset')} className={BRASS_BUTTON}>
      Recommencer
    </button>
  )
  if (phase === 'failed' || phase === 'served') {
    const won = phase === 'served'
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center p-4">
        <Plate metal={won ? 'brass' : 'rust'} className="max-w-xl">
          <div role="status" className="flex flex-col items-center text-center">
            <PlateTitle tone={won ? 'brass' : 'rust'}>{won ? 'Réussite' : 'Échec'}</PlateTitle>
            <PlateRule />
            <p className="text-xl italic">
              {won ? HINTS.served : 'Il y a eu une erreur de manipulation.'}
            </p>
            {last && (
              <p
                className={`mt-3 rounded-full border px-4 py-0.5 text-sm tracking-widest uppercase ${
                  last.isNew
                    ? 'border-[#f0cf7f] bg-[#f0cf7f]/15 text-[#f0cf7f]'
                    : 'border-[#b07d36]/60 text-[#d8c3a0]'
                }`}
              >
                {last.isNew ? `Fin n°${last.number} débloquée !` : `Fin n°${last.number}`}
              </p>
            )}
            <div className="mt-4">{restart}</div>
          </div>
        </Plate>
      </div>
    )
  }
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-3 p-4">
      <Plate compact className="max-w-3xl">
        <p aria-live="polite" className="text-center text-lg italic">
          {HINTS[phase]}
        </p>
      </Plate>
      {sequence.can('reset') && restart}
    </div>
  )
}

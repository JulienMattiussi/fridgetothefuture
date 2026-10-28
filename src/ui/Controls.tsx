import { usePhase } from '@/three/sequence/context'
import type { SequenceStore } from '@/three/sequence/store'

/** What to do or what happens, phase by phase. */
const HINTS: Record<string, string> = {
  idle: 'Glissez les bûches de Doc dans le poêle, dans l’ordre : verte, jaune, rouge.',
  stoking: 'Le feu prend...',
  lit: 'Ouvrez la petite vanne en bas à droite : tournez vers la gauche.',
  primed: "Montez à l'échelle de la cuve.",
  climbed: 'Ouvrez la vanne du haut pour lancer le moteur : tournez vers la gauche.',
  starting: 'Le moteur démarre par à-coups...',
  running: '« Tourne à fond vers la gauche ! »',
  cranked: 'Ouvrez la grande vanne de cuivre : tournez vers la gauche.',
  jet: 'Le froid jaillit du conduit : levez la bassine dessous.',
  dropping: 'Un glaçon tombe !',
  caught: 'Prenez le glaçon à la pince et mettez-le dans le verre.',
  served: '« Thé glacé ? »',
}

/**
 * The overlay: the current hint, and a button to start over once begun. The
 * steps themselves are only played on the machine's parts.
 */
export function Controls({ sequence }: { sequence: SequenceStore }) {
  const phase = usePhase(sequence)
  const canReset = sequence.can('reset')
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-3 p-4">
      <p aria-live="polite" className="rounded bg-black/60 px-4 py-2 text-lg text-amber-50">
        {HINTS[phase]}
      </p>
      {canReset && (
        <button
          type="button"
          onClick={() => sequence.act('reset')}
          className="pointer-events-auto rounded border border-amber-200/40 bg-stone-900/80 px-3 py-1.5 text-amber-50 hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-amber-300"
        >
          Recommencer
        </button>
      )}
    </div>
  )
}

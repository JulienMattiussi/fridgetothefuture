import type { Action } from '@/lib/sequence'
import { usePhase } from '@/three/sequence/context'
import type { SequenceStore } from '@/three/sequence/store'

/** What to do or what happens, phase by phase. */
const HINTS: Record<string, string> = {
  idle: 'Ouvrez la grande vanne de cuivre pour lancer le moteur.',
  starting: 'Le moteur démarre par à-coups...',
  running: '« Tourne à fond vers la gauche ! »',
  cranking: 'Le manchon glisse le long de la bobine.',
  jet: 'Le froid jaillit du conduit : présentez la bassine.',
  dropping: 'Un glaçon tombe !',
  caught: 'Prenez le glaçon à la pince.',
  served: '« Thé glacé ? »',
}

const LABELS: Record<Action, string> = {
  openValve: 'Ouvrir la vanne',
  turnCrank: 'Tourner la manivelle',
  holdBasin: 'Présenter la bassine',
  useTongs: 'Prendre la pince',
  reset: 'Recommencer',
}

/**
 * The overlay: the current hint, and the actions the sequence waits for as
 * buttons, the same as clicking the parts in the scene.
 */
export function Controls({ sequence }: { sequence: SequenceStore }) {
  const phase = usePhase(sequence)
  const actions = sequence.actions()
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-4">
      <p aria-live="polite" className="rounded bg-black/60 px-4 py-2 text-lg text-amber-50">
        {HINTS[phase]}
      </p>
      <div className="pointer-events-auto flex gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => sequence.act(action)}
            className="rounded border border-amber-200/40 bg-stone-900/80 px-3 py-1.5 text-amber-50 hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-amber-300"
          >
            {LABELS[action]}
          </button>
        ))}
      </div>
    </div>
  )
}

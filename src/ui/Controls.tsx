import { useSyncExternalStore } from 'react'
import { usePhase } from '@/three/sequence/context'
import type { EndingsStore } from '@/ui/endingsStore'
import { useLanguage } from '@/ui/useLanguage'
import { BRASS_BUTTON, Plate, PlateRule, PlateTitle } from '@/ui/Plate'
import type { SequenceStore } from '@/three/sequence/store'

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
  const { t } = useLanguage()
  const { last } = useSyncExternalStore(endings.subscribe, endings.get)
  const restart = (
    <button type="button" onClick={() => sequence.act('reset')} className={BRASS_BUTTON}>
      {t.restart}
    </button>
  )
  if (phase === 'failed' || phase === 'served') {
    const won = phase === 'served'
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center p-4">
        <Plate metal={won ? 'brass' : 'rust'} className="max-w-xl">
          <div role="status" className="flex flex-col items-center text-center">
            <PlateTitle tone={won ? 'brass' : 'rust'}>{won ? t.success : t.failure}</PlateTitle>
            <PlateRule />
            <p className="text-xl italic">{won ? t.hints.served : t.mishandled}</p>
            {last && (
              <p
                className={`mt-3 rounded-full border px-4 py-0.5 text-sm tracking-widest uppercase ${
                  last.isNew
                    ? 'border-[#f0cf7f] bg-[#f0cf7f]/15 text-[#f0cf7f]'
                    : 'border-[#b07d36]/60 text-[#d8c3a0]'
                }`}
              >
                {last.isNew ? t.unlocked(last.number) : t.ending(last.number)}
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
          {/* Up the ladder out of turn, the vat's valve is the way down. */}
          {t.hints[sequence.readouts.closeUp === 'vat' ? 'climbed' : phase]}
        </p>
      </Plate>
      {sequence.can('reset') && restart}
    </div>
  )
}

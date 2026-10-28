import { useState, useSyncExternalStore } from 'react'
import { ENDINGS } from '@/lib/endings'
import type { EndingsStore } from '@/ui/endingsStore'
import { useLanguage } from '@/ui/useLanguage'
import { Plate, PlateRule, PlateTitle } from '@/ui/Plate'

interface TrophiesProps {
  endings: EndingsStore
  /** The free view round the machine, unlocked by seeing every ending. */
  orbit: boolean
  onOrbit: (on: boolean) => void
}

/** A trophy cup: bowl, handles, stem and base. */
function Cup({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M7 3h10v2h3a1 1 0 0 1 1 1v2a5 5 0 0 1-4.6 5 6 6 0 0 1-3.4 3v2h3a2 2 0 0 1 2 2v1H6v-1a2 2 0 0 1 2-2h3v-2a6 6 0 0 1-3.4-3A5 5 0 0 1 3 8V6a1 1 0 0 1 1-1h3V3zm0 4H5v1a3 3 0 0 0 2.2 2.9A6 6 0 0 1 7 9V7zm10 0v2c0 .7-.1 1.3-.2 1.9A3 3 0 0 0 19 8V7h-2z" />
    </svg>
  )
}

/**
 * The trophy cup, bottom right, once an ending has been reached: it wobbles
 * when a new one is unlocked, and opens the list of endings on a brass plate,
 * the ones not seen yet hidden. All of them seen, it offers the free view.
 */
export function Trophies({ endings, orbit, onOrbit }: TrophiesProps) {
  const { seen, last } = useSyncExternalStore(endings.subscribe, endings.get)
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()
  if (seen.length === 0) return null
  const all = seen.length === ENDINGS.length
  return (
    <div className="absolute right-4 bottom-4 flex flex-col items-end gap-3">
      {open && (
        <Plate className="w-80">
          <div id="endings">
            <PlateTitle>{t.trophies}</PlateTitle>
            <p className="mt-1 text-center text-sm tracking-widest text-[#d8c3a0] uppercase">
              {t.count(seen.length, ENDINGS.length)}
            </p>
            <PlateRule />
            <ol className="flex flex-col gap-1.5">
              {ENDINGS.map((ending, i) => {
                const found = seen.includes(ending)
                return (
                  <li key={ending} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                        found
                          ? 'border-[#f4dc98] bg-linear-to-b from-[#d9b25f] to-[#8a5a22] text-[#1c110a]'
                          : 'border-[#b07d36]/40 text-[#b07d36]/70'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={found ? 'text-lg' : 'text-lg tracking-widest text-[#8a7458]'}>
                      {found ? t.endings[ending] : t.hidden}
                    </span>
                  </li>
                )
              })}
            </ol>
            <PlateRule />
            {all ? (
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-[#f0cf7f]">{t.orbit}</span>
                <input
                  type="checkbox"
                  checked={orbit}
                  onChange={(event) => onOrbit(event.target.checked)}
                  className="h-5 w-5 accent-[#d9b25f]"
                />
              </label>
            ) : (
              <p className="text-center text-sm text-[#8a7458] italic">{t.secret}</p>
            )}
          </div>
        </Plate>
      )}
      <button
        type="button"
        title={t.trophies}
        aria-label={t.trophies}
        aria-expanded={open}
        aria-controls="endings"
        onClick={() => setOpen(!open)}
        // Remounted on a new ending, so the wobble plays again.
        key={last?.isNew ? `new-${last.number}` : 'cup'}
        className={`pointer-events-auto rounded-full bg-linear-to-b from-[#f4dc98] via-[#b07d36] to-[#5c3a14] p-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0cf7f] ${
          last?.isNew ? 'animate-[wobble_0.6s_ease-in-out_5]' : ''
        }`}
      >
        <span className="flex rounded-full bg-[radial-gradient(circle_at_top,#3a2516,#1c110a_70%)] p-3 text-[#f0cf7f]">
          <Cup className="h-12 w-12 drop-shadow-[0_0_8px_rgba(240,207,127,0.5)]" />
        </span>
      </button>
    </div>
  )
}

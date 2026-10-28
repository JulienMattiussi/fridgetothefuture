import { useState, useSyncExternalStore } from 'react'
import { ENDINGS } from '@/lib/endings'
import type { EndingsStore } from '@/ui/endingsStore'

/**
 * The trophy cup, bottom right, once an ending has been reached: it wobbles
 * when a new one is unlocked, and opens the list of endings, the ones not
 * seen yet hidden.
 */
export function Trophies({ endings }: { endings: EndingsStore }) {
  const { seen, last } = useSyncExternalStore(endings.subscribe, endings.get)
  const [open, setOpen] = useState(false)
  if (seen.length === 0) return null
  return (
    <div className="absolute right-4 bottom-4 flex flex-col items-end gap-2">
      {open && (
        <div
          id="endings"
          className="rounded-lg border border-amber-200/40 bg-black/80 px-5 py-3 text-amber-50"
        >
          <p className="mb-2 text-lg font-bold text-amber-300">Succès</p>
          <ol className="flex flex-col gap-1">
            {ENDINGS.map(({ ending, title }, i) => (
              <li key={ending}>
                Fin {i + 1} : {seen.includes(ending) ? title : '????'}
              </li>
            ))}
          </ol>
        </div>
      )}
      <button
        type="button"
        title="Succès"
        aria-label="Succès"
        aria-expanded={open}
        aria-controls="endings"
        onClick={() => setOpen(!open)}
        // Remounted on a new ending, so the wobble plays again.
        key={last?.isNew ? `new-${last.number}` : 'cup'}
        className={`rounded-full border-2 border-amber-300 bg-black/70 p-3 text-amber-300 hover:bg-black/90 focus-visible:outline-2 focus-visible:outline-amber-300 ${
          last?.isNew ? 'animate-[wobble_0.6s_ease-in-out_5]' : ''
        }`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-12 w-12" fill="currentColor">
          {/* A trophy cup: bowl, handles, stem and base. */}
          <path d="M7 3h10v2h3a1 1 0 0 1 1 1v2a5 5 0 0 1-4.6 5 6 6 0 0 1-3.4 3v2h3a2 2 0 0 1 2 2v1H6v-1a2 2 0 0 1 2-2h3v-2a6 6 0 0 1-3.4-3A5 5 0 0 1 3 8V6a1 1 0 0 1 1-1h3V3zm0 4H5v1a3 3 0 0 0 2.2 2.9A6 6 0 0 1 7 9V7zm10 0v2c0 .7-.1 1.3-.2 1.9A3 3 0 0 0 19 8V7h-2z" />
        </svg>
      </button>
    </div>
  )
}

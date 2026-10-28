import { type Ending, endingNumber, parseSeen, reach } from '@/lib/endings'
import type { SequenceStore } from '@/three/sequence/store'

/** A run's ending, once over: its number, and whether it was new. */
interface LastEnding {
  number: number
  isNew: boolean
}

/** Where the endings seen are kept, in this browser. */
const KEY = 'fridgetothefuture:endings'

function load() {
  try {
    return parseSeen(localStorage.getItem(KEY))
  } catch {
    return []
  }
}

function save(seen: Ending[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(seen))
  } catch {
    // Storage off (a private window): they are only kept for this visit.
  }
}

/**
 * The endings collected, kept in the browser: it watches the sequence, and as
 * a run ends, records its ending and whether it is new.
 */
export function createEndingsStore(sequence: SequenceStore) {
  let seen = load()
  let last: LastEnding | null = null
  let snapshot: { seen: Ending[]; last: LastEnding | null } = { seen, last }
  const listeners = new Set<() => void>()
  const publish = () => {
    snapshot = { seen, last }
    listeners.forEach((listener) => listener())
  }
  sequence.subscribe(() => {
    const { phase } = sequence
    if (phase !== 'served' && phase !== 'failed') {
      if (last) {
        last = null
        publish()
      }
      return
    }
    if (last) return
    const ending: Ending = phase === 'served' ? 'served' : sequence.readouts.failure!.kind
    const reached = reach(seen, ending)
    seen = reached.seen
    if (reached.isNew) save(seen)
    last = { number: endingNumber(ending), isNew: reached.isNew }
    publish()
  })
  return {
    get: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export type EndingsStore = ReturnType<typeof createEndingsStore>

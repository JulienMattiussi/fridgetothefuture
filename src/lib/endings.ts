/*
 * The run's endings, numbered: the iced tea, and each way the machine can
 * break down. The visitor collects them; an ending not yet seen keeps its
 * name hidden.
 */
import type { Failure } from '@/lib/steps'

/** An ending: the iced tea served, or a breakdown. */
export type Ending = 'served' | Failure

/** The endings in their order: their number is their place, from 1 (names in i18n). */
export const ENDINGS: Ending[] = [
  'served',
  'boilerExplodes',
  'gaugesBurst',
  'pipeBurst',
  'water',
  'cubeOnFloor',
  'noIce',
  'wheelOff',
]

/** An ending's number, from 1. */
export const endingNumber = (ending: Ending) => ENDINGS.indexOf(ending) + 1

/** The endings seen so far, read back from storage: anything unknown is dropped. */
export function parseSeen(stored: string | null): Ending[] {
  try {
    const parsed: unknown = JSON.parse(stored ?? '[]')
    if (!Array.isArray(parsed)) return []
    return ENDINGS.filter((ending) => parsed.includes(ending))
  } catch {
    return []
  }
}

/** The endings seen once `ending` is reached, and whether it is a new one. */
export function reach(seen: Ending[], ending: Ending) {
  return seen.includes(ending) ? { seen, isNew: false } : { seen: [...seen, ending], isNew: true }
}

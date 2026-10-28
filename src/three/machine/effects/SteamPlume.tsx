import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { PuffStream } from '@/three/machine/effects/PuffStream'

/** How high a puff rises over its life: idling, then blasting once the crank turns. */
const RISE = 1.2
const BLAST_RISE = 3.5

/**
 * The white steam out of the vent while the engine runs: a thick column of
 * puffs rising, then, from the first turn of the crank, a dense cloud shot up
 * violently, high and wide.
 */
export function SteamPlume({ at }: { at: Vec3 }) {
  return (
    <PuffStream
      at={at}
      count={44}
      life={1.4}
      color={[palette.enamel, '#ffffff', '#e4e1d8']}
      opacity={0.95}
      fadeFrom={0.6}
      strength={(readouts) => readouts.steam}
      puff={(i, age, { crank }) => {
        const blast = crank > 0 ? 1 : 0
        // Blasting, a puff shoots up fast and slows as it spreads.
        const rise = blast ? BLAST_RISE * Math.sqrt(age) : RISE * age
        const wobble = Math.sin(i * 2.3) * (0.4 + 0.6 * ((i * 0.618) % 1))
        return {
          position: [wobble * (0.06 + 0.4 * blast) * age, rise, Math.cos(i * 1.7) * 0.05 * age],
          scale: 1.2 + age * (2 + 3.5 * blast),
        }
      }}
    />
  )
}

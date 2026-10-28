import type { Vec3 } from '@/lib/geometry'
import type { Readouts } from '@/lib/sequence'
import { palette } from '@/three/palette'
import { PuffStream } from '@/three/machine/effects/PuffStream'

const STEAM = [palette.enamel, '#ffffff', '#e4e1d8']
/** How high a puff rises over its life: idling, then blasting once the crank turns. */
const RISE = 1.2
const BLAST_RISE = 3.5
/** The thick neck right out of the vent, before it opens into the cloud. */
const NECK = 0.35
const strength = (readouts: Readouts) => readouts.steam
const blasting = ({ crank }: Readouts) => (crank > 0 ? 1 : 0)

/**
 * The white steam out of the vent while the engine runs: a thick neck of
 * small puffs packed right out of the mouth, opening into a column that
 * rises; from the first turn of the crank, a dense cloud shot up violently,
 * high and wide.
 */
export function SteamPlume({ at }: { at: Vec3 }) {
  return (
    <group>
      <PuffStream
        at={at}
        count={30}
        life={0.3}
        color={STEAM}
        opacity={1}
        fadeFrom={0.8}
        strength={strength}
        puff={(i, age, readouts) => ({
          position: [Math.sin(i * 2.3) * 0.02, NECK * (1 + blasting(readouts)) * age, 0],
          scale: 0.6 + age * 0.9,
        })}
      />
      <PuffStream
        at={[at[0], at[1] + NECK, at[2]]}
        count={44}
        life={1.4}
        color={STEAM}
        opacity={0.95}
        fadeFrom={0.6}
        strength={strength}
        puff={(i, age, readouts) => {
          const blast = blasting(readouts)
          // Blasting, a puff shoots up fast and slows as it spreads.
          const rise = blast ? BLAST_RISE * Math.sqrt(age) : RISE * age
          const wobble = Math.sin(i * 2.3) * (0.4 + 0.6 * ((i * 0.618) % 1))
          return {
            position: [wobble * (0.06 + 0.4 * blast) * age, rise, Math.cos(i * 1.7) * 0.05 * age],
            scale: 1.4 + age * (2 + 3.5 * blast),
          }
        }}
      />
    </group>
  )
}

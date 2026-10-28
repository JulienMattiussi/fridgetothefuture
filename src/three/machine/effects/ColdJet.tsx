import { useMemo } from 'react'
import { Vector3 } from 'three'
import type { Vec3 } from '@/lib/geometry'
import type { Readouts } from '@/lib/readouts'
import { PuffStream } from '@/three/machine/effects/PuffStream'

/** Frozen air: white with icy blue glints. */
const FROST = ['#f4fbff', '#cfe8fa', '#a9d3f2', '#ffffff', '#bfe0f7']
/** The blast right out of the mouth: how far it shoots before it slows. */
const BLAST = 0.5
/** The cloud it billows into: how far it carries along the duct, and how much it sinks. */
const REACH = 1.5
const SINK = 0.5
const strength = (readouts: Readouts) => readouts.coldJet

/**
 * The frozen air blasting out of the duct's mouth, along its axis: a dense
 * blast of small puffs right at the mouth, billowing into a cloud that sinks
 * (it is heavy) and fades, as strong as the sequence's `coldJet`.
 */
export function ColdJet({ mouth, along }: { mouth: Vec3; along: Vec3 }) {
  const axis = useMemo(() => new Vector3(...along).normalize(), [along])
  // Two directions square to the axis, for the puffs to fan out along.
  const [side, up] = useMemo(() => {
    const s = new Vector3(0, 1, 0).cross(axis).normalize()
    return [s, axis.clone().cross(s).normalize()]
  }, [axis])
  /** A point `reach` along the axis, `fan` out round it at puff `i`'s own angle, `sink` down. */
  const out = (i: number, reach: number, fan: number, sink: number): Vec3 => {
    const angle = i * 2.39996
    const round = (k: number) =>
      side.getComponent(k) * Math.cos(angle) + up.getComponent(k) * Math.sin(angle)
    return [0, 1, 2].map(
      (k) => axis.getComponent(k) * reach + round(k) * fan - (k === 1 ? sink : 0),
    ) as Vec3
  }
  return (
    <group>
      <PuffStream
        at={mouth}
        count={48}
        life={0.4}
        color={FROST}
        opacity={0.95}
        fadeFrom={0.6}
        strength={strength}
        puff={(i, age) => ({
          position: out(i, BLAST * age, 0.12 * age * (0.5 + ((i * 0.618) % 0.5)), 0),
          scale: 0.35 + age * 1.1,
        })}
      />
      <PuffStream
        at={mouth}
        count={56}
        life={1.2}
        color={FROST}
        opacity={0.9}
        fadeFrom={0.5}
        strength={strength}
        puff={(i, age) => ({
          position: out(
            i,
            BLAST + (REACH - BLAST) * Math.sqrt(age),
            0.15 + 0.5 * age * (0.4 + ((i * 0.618) % 0.6)),
            SINK * age * age,
          ),
          scale: 1.3 + age * 2.2,
        })}
      />
    </group>
  )
}

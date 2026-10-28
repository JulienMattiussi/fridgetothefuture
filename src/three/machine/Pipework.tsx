import type { ComponentProps } from 'react'
import type { Readouts } from '@/lib/sequence'
import { Pipe } from '@/three/parts/Pipe'
import { Shaking } from '@/three/machine/effects/Shaking'
import { PipeFittings } from '@/three/machine/pipework/PipeFittings'
import { PipeGauges } from '@/three/machine/pipework/PipeGauges'
import { pipes, tornPipe, vatLines } from '@/three/machine/pipework/pipes'
import { RED_DROP_END } from '@/three/machine/pipework/anchors'
import { PuffStream } from '@/three/machine/effects/PuffStream'
import { Tear } from '@/three/machine/effects/Tear'

type PipeRun = ComponentProps<typeof Pipe>

/** Pipes this thin or thinner rattle quick and hard. */
const THIN = 0.03
/** Pipes running behind this depth, on average, sway slow and little. */
const BACK_Z = 0.3

/**
 * How each pipe shakes while the machine knocks: the thin ones rattle, the
 * ones at the back sway, the big ones in front knock; each in its own rhythm.
 */
function shake({ points, radius = 0.06 }: PipeRun) {
  if (radius <= THIN) return { amplitude: 0.005, pace: 1.6 }
  const z = points.reduce((sum, p) => sum + p[2], 0) / points.length
  return z < BACK_Z ? { amplitude: 0.0015, pace: 0.5 } : { amplitude: 0.003, pace: 1 }
}

/** Whether the big pipe has torn off the dome. */
const tornOff = ({ failure }: Readouts) => (failure?.kind === 'pipeBurst' ? 1 : 0)

/** The vat's lines rumble with its steam, then knock with the engine. */
const vatRumble = ({ shaking, stir }: Readouts) => Math.max(shaking, 0.8 * stir)

/**
 * All the pipes, with what stands on them: gauges, the cold-air duct's mouth,
 * strings, the steam vent. Their shared points are in pipework/anchors.ts.
 */
export function Pipework() {
  return (
    <group>
      {pipes.map((pipe, i) => (
        <Shaking
          key={i}
          seed={i + 1}
          level={vatLines.has(pipe) ? vatRumble : undefined}
          {...shake(pipe)}
        >
          {pipe === tornPipe ? (
            <Tear on="pipeBurst" pivot={pipe.points[0]!}>
              <Pipe {...pipe} />
            </Tear>
          ) : (
            <Pipe {...pipe} />
          )}
        </Shaking>
      ))}
      {/* Torn off the dome, the big pipe leaves a hole: a hard jet of steam shoots
          out of it, water spraying round it and raining down. */}
      <PuffStream
        at={RED_DROP_END}
        count={70}
        life={0.7}
        color={['#ffffff', '#f4f1ea', '#e4e1d8']}
        opacity={1}
        fadeFrom={0.55}
        strength={tornOff}
        puff={(i, age) => {
          // A tight cone up and to the left, opening as it goes.
          const angle = i * 2.39996
          const fan = 0.25 * age * (0.4 + ((i * 0.618) % 0.6))
          const reach = 1.6 * Math.sqrt(age)
          return {
            position: [
              -0.35 * reach + Math.cos(angle) * fan,
              reach + Math.sin(angle) * fan,
              0.15 * reach,
            ],
            scale: 0.35 + 3 * age,
          }
        }}
      />
      <PuffStream
        at={RED_DROP_END}
        count={50}
        life={1.1}
        color={['#9cc3e0', '#7fb0d6', '#c6def0']}
        opacity={0.9}
        fadeFrom={0.7}
        strength={tornOff}
        puff={(i, age) => {
          // Droplets flung out every way, falling back.
          const angle = i * 2.39996
          const speed = 0.8 + 0.6 * ((i * 0.618) % 1)
          return {
            position: [
              Math.cos(angle) * speed * age,
              1.4 * speed * age - 2.5 * age * age,
              Math.sin(angle) * speed * age * 0.6,
            ],
            scale: 0.12,
          }
        }}
      />
      <Shaking amplitude={0.003} seed={pipes.length + 1}>
        <PipeFittings />
        <PipeGauges />
      </Shaking>
    </group>
  )
}

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
      {/* Torn off the dome, the big pipe leaves a hole spraying steam and water everywhere. */}
      <PuffStream
        at={RED_DROP_END}
        count={40}
        life={0.9}
        color={['#ffffff', '#e4e1d8', '#9cc3e0']}
        opacity={0.95}
        fadeFrom={0.5}
        strength={({ failure }) => (failure?.kind === 'pipeBurst' ? 1 : 0)}
        puff={(i, age) => {
          const angle = i * 2.39996
          const out = 1.4 * age
          return {
            position: [
              Math.cos(angle) * out,
              0.8 * age - 1.6 * age * age,
              Math.sin(angle) * out * 0.6,
            ],
            scale: 0.6 + 2.5 * age,
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

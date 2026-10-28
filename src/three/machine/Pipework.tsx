import type { ComponentProps } from 'react'
import type { Readouts } from '@/lib/sequence'
import { Pipe } from '@/three/parts/Pipe'
import { Shaking } from '@/three/machine/effects/Shaking'
import { PipeFittings } from '@/three/machine/pipework/PipeFittings'
import { PipeGauges } from '@/three/machine/pipework/PipeGauges'
import { pipes, vatLines } from '@/three/machine/pipework/pipes'

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
          <Pipe {...pipe} />
        </Shaking>
      ))}
      <Shaking amplitude={0.003} seed={pipes.length + 1}>
        <PipeFittings />
        <PipeGauges />
      </Shaking>
    </group>
  )
}

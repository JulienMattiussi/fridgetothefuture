import { Pipe } from '@/three/parts/Pipe'
import { PipeFittings } from '@/three/machine/pipework/PipeFittings'
import { PipeGauges } from '@/three/machine/pipework/PipeGauges'
import { pipes } from '@/three/machine/pipework/pipes'

/**
 * All the pipes, with what stands on them: gauges, the cold-air duct's mouth,
 * strings, the steam vent. Their shared points are in pipework/anchors.ts.
 */
export function Pipework() {
  return (
    <group>
      {pipes.map((pipe, i) => (
        <Pipe key={i} {...pipe} />
      ))}
      <PipeFittings />
      <PipeGauges />
    </group>
  )
}

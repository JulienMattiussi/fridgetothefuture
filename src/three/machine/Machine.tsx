import type { Vec3 } from '@/lib/geometry'
import { Gauge } from '@/three/parts/Gauge'
import { Boiler } from '@/three/machine/Boiler'
import { CrankCoil } from '@/three/machine/CrankCoil'
import { Drive } from '@/three/machine/Drive'
import { Pipework } from '@/three/machine/Pipework'
import { Scaffold } from '@/three/machine/Scaffold'
import { Stove } from '@/three/machine/Stove'
import { Tanks } from '@/three/machine/Tanks'
import { WagonWheels } from '@/three/machine/WagonWheels'
import { ValveGear } from '@/three/machine/ValveGear'
import { Workbench } from '@/three/machine/Workbench'

/**
 * The gauges scattered over the frame, beyond those on the pipes. Each has its
 * own size, so its own dial (see Gauge).
 */
const gauges: { position: Vec3; radius: number; reading: number }[] = []

/** Doc's steam-powered refrigerator, as it stands in the livery stable. */
export function Machine() {
  return (
    <group>
      <Scaffold />
      <Boiler />
      <Pipework />
      <Drive />
      <ValveGear />
      <WagonWheels />
      <CrankCoil />
      <Tanks />
      <Stove />
      <Workbench />
      {gauges.map((gauge) => (
        <Gauge key={gauge.position.join(':')} {...gauge} />
      ))}
    </group>
  )
}

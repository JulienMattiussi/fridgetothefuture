import type { Vec3 } from '@/lib/geometry'
import { Gauge } from '@/three/parts/Gauge'
import { Boiler } from '@/three/machine/Boiler'
import { CrankCoil } from '@/three/machine/CrankCoil'
import { Drive } from '@/three/machine/Drive'
import { Pipework } from '@/three/machine/Pipework'
import { Scaffold } from '@/three/machine/Scaffold'
import { Tanks } from '@/three/machine/Tanks'
import { WagonWheels } from '@/three/machine/WagonWheels'
import { Workbench } from '@/three/machine/Workbench'

/** The gauges scattered over the frame, beyond the crank coil's two. */
const gauges: { position: Vec3; radius: number; reading: number }[] = [
  { position: [-0.94, 2.24, 0.33], radius: 0.07, reading: -0.3 },
  { position: [-0.67, 1.7, 0.33], radius: 0.08, reading: 0.5 },
  { position: [-0.35, 2.8, 0.0], radius: 0.09, reading: 0.6 },
  { position: [1.36, 1.92, 0.33], radius: 0.08, reading: 0.2 },
  { position: [2.35, 2.9, -0.1], radius: 0.1, reading: -0.5 },
  // The big brass gauge, like a porthole, on the right.
  { position: [2.36, 1.98, 0.33], radius: 0.17, reading: -0.2 },
  { position: [2.62, 1.75, 0.33], radius: 0.08, reading: 1.0 },
]

/** Doc's steam-powered refrigerator, as it stands in the livery stable. */
export function Machine() {
  return (
    <group>
      <Scaffold />
      <Boiler />
      <Pipework />
      <Drive />
      <WagonWheels />
      <CrankCoil />
      <Tanks />
      <Workbench />
      {gauges.map((gauge) => (
        <Gauge key={gauge.position.join(':')} {...gauge} />
      ))}
    </group>
  )
}

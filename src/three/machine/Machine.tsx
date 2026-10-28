import type { Vec3 } from '@/lib/geometry'
import { Boiler } from '@/three/machine/Boiler'
import { CrankCoil } from '@/three/machine/CrankCoil'
import { Drive } from '@/three/machine/Drive'
import { ColdJet } from '@/three/machine/effects/ColdJet'
import { IceCube } from '@/three/machine/effects/IceCube'
import { Shaking } from '@/three/machine/effects/Shaking'
import { SteamPlume } from '@/three/machine/effects/SteamPlume'
import { layout } from '@/three/machine/layout'
import { Pipework } from '@/three/machine/Pipework'
import { RED_LINE_Z, SLEEVE_START } from '@/three/machine/pipework/anchors'
import { Scaffold } from '@/three/machine/Scaffold'
import { Stove } from '@/three/machine/Stove'
import { Tanks } from '@/three/machine/Tanks'
import { ValveGear } from '@/three/machine/ValveGear'
import { WagonWheels } from '@/three/machine/WagonWheels'
import { Workbench } from '@/three/machine/Workbench'

const { ductMouth, bench, teaGlass, steamVent } = layout
const DUCT_AXIS = ductMouth.map((v, k) => v - SLEEVE_START[k]!) as Vec3

/** Doc's steam-powered refrigerator, as it stands in the livery stable. */
export function Machine() {
  return (
    <group>
      <Scaffold />
      {/* The pipes and boiler knock and shake while the engine runs. */}
      <Shaking>
        <Boiler />
        <Pipework />
      </Shaking>
      <Drive />
      <ValveGear />
      <WagonWheels />
      <CrankCoil />
      <Tanks />
      <Stove />
      <Workbench />
      <SteamPlume at={[steamVent.x, steamVent.top + 0.2, RED_LINE_Z]} />
      <ColdJet mouth={ductMouth} along={DUCT_AXIS} />
      <IceCube
        mouth={ductMouth}
        basin={[ductMouth[0], bench.top + 0.04, ductMouth[2]]}
        glass={[teaGlass.x, bench.top + 0.05 + teaGlass.height * 0.7, teaGlass.z]}
      />
    </group>
  )
}

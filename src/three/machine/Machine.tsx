import { useCallback, useRef } from 'react'
import { Vector3 } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { Basin } from '@/three/machine/Basin'
import { BigLever } from '@/three/machine/BigLever'
import { Boiler } from '@/three/machine/Boiler'
import { CrankCoil } from '@/three/machine/CrankCoil'
import { Drive } from '@/three/machine/Drive'
import { ColdJet } from '@/three/machine/effects/ColdJet'
import { IceCube } from '@/three/machine/effects/IceCube'
import { BoilerBlast } from '@/three/machine/effects/BoilerBlast'
import { Shaking } from '@/three/machine/effects/Shaking'
import { Vanish } from '@/three/machine/effects/Vanish'
import { Water } from '@/three/machine/effects/Water'
import { SteamPlume } from '@/three/machine/effects/SteamPlume'
import { layout } from '@/three/machine/layout'
import { LogPile } from '@/three/machine/LogPile'
import { Pipework } from '@/three/machine/Pipework'
import { RED_LINE_Z, SLEEVE_START } from '@/three/machine/pipework/anchors'
import { Scaffold } from '@/three/machine/Scaffold'
import { Stove } from '@/three/machine/Stove'
import { Tongs } from '@/three/machine/Tongs'
import { Tanks } from '@/three/machine/Tanks'
import { ValveGear } from '@/three/machine/ValveGear'
import { WagonWheels } from '@/three/machine/WagonWheels'
import { Workbench } from '@/three/machine/Workbench'

const { ductMouth, bench, teaGlass, steamVent } = layout
/**
 * The ice cube lands in the basin held up under the duct, rides it back down
 * on the bench, and ends in the glass of tea.
 */
const CUBE_LANDING: Vec3 = [ductMouth[0], bench.top + layout.basinLift + 0.04, ductMouth[2]]
const CUBE_IN_BASIN: Vec3 = [ductMouth[0], bench.top + 0.04, ductMouth[2]]
const CUBE_IN_GLASS: Vec3 = [teaGlass.x, bench.top + 0.05 + teaGlass.height * 0.7, teaGlass.z]
/** Where the tongs' tips lie on the bench, open. */
const TONGS_REST: Vec3 = [1.56, bench.top + 0.01, 0.88]
const DUCT_AXIS = ductMouth.map((v, k) => v - SLEEVE_START[k]!) as Vec3

/** Doc's steam-powered refrigerator, as it stands in the livery stable. */
export function Machine() {
  /** Where the tongs hold the ice cube, while they do: shared with the cube. */
  const heldCube = useRef<Vector3 | null>(null)
  /** Where the basin is, as it is lifted and put back: the cube rides in it. */
  const basinAt = useRef(new Vector3(ductMouth[0], bench.top, ductMouth[2]))
  const moveBasin = useCallback((at: Vector3) => {
    basinAt.current.copy(at)
  }, [])
  const holdCube = useCallback((at: Vector3 | null) => {
    heldCube.current = at
  }, [])
  return (
    <group>
      <Scaffold />
      {/* The boiler knocks while the engine runs; each pipe shakes its own way (Pipework). */}
      <Shaking>
        <Vanish on="boilerExplodes" after={0.12}>
          <Boiler />
        </Vanish>
      </Shaking>
      <BoilerBlast
        at={[layout.boiler.x, layout.boiler.bottom + layout.boiler.height / 2, layout.boiler.z]}
      />
      <Water mouth={ductMouth} floor={bench.top} />
      <Pipework />
      <Drive />
      <ValveGear />
      <BigLever />
      <WagonWheels />
      <CrankCoil />
      <Tanks />
      <Stove />
      <LogPile />
      <Workbench />
      <Basin onMove={moveBasin} />
      <SteamPlume at={[steamVent.x, steamVent.top + 0.2, RED_LINE_Z]} />
      <ColdJet mouth={ductMouth} along={DUCT_AXIS} />
      <IceCube
        mouth={ductMouth}
        landing={CUBE_LANDING}
        glass={CUBE_IN_GLASS}
        edge={[ductMouth[0], bench.top + 0.03, bench.front + 0.03]}
        floor={[ductMouth[0], 0.025, bench.front + 0.3]}
        basin={basinAt}
        held={heldCube}
      />
      <Tongs
        rest={TONGS_REST}
        cube={CUBE_IN_BASIN}
        glass={[teaGlass.x, bench.top + teaGlass.height, teaGlass.z]}
        onHold={holdCube}
      />
    </group>
  )
}

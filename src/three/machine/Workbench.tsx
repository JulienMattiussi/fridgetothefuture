import { useMemo } from 'react'
import { DoubleSide, Shape } from 'three'
import { palette } from '@/three/palette'
import { Flask } from '@/three/parts/Flask'
import { Rod } from '@/three/parts/Rod'
import { Table } from '@/three/parts/Table'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const { bench, ductMouth } = layout
const top = bench.top
const [basinX, , basinZ] = ductMouth

/** The two flasks' brass stand: a crossbar on two uprights. */
const STAND = { left: 1.4, right: 1.75, z: 0.5, height: 0.2 }
const GLASS = { x: 1.15, z: 0.8, height: 0.26 }
/**
 * The bench has no legs: it rests on two thick wooden uprights, their back
 * edge cut on a slant, as in the film.
 */
const UPRIGHTS = { xs: [-0.22, 1.85], thickness: 0.12, foot: 0.45, notch: 0.18 }

/** One upright's side profile, drawn in (z, y). */
function uprightProfile() {
  const front = bench.front - 0.05
  const back = bench.back + 0.03
  const under = top - 0.06
  const shape = new Shape()
  shape.moveTo(front, 0)
  shape.lineTo(front, under)
  shape.lineTo(back, under)
  shape.lineTo(back, under - UPRIGHTS.notch)
  shape.lineTo(front - UPRIGHTS.foot, 0)
  shape.closePath()
  return shape
}

/**
 * The right workbench, after the film (docs/references/video-*.jpg): the
 * enamel basin under the cold-air duct, the tongs, the flasks on their stand
 * and Doc's tall glass of tea, waiting for its ice cube.
 */
export function Workbench() {
  const profile = useMemo(() => uprightProfile(), [])
  return (
    <group>
      <Table {...bench} legs={false} />
      {/* Turned a quarter so the profile's x runs along the depth. */}
      {UPRIGHTS.xs.map((x) => (
        <ToonMesh
          key={x}
          position={[x + UPRIGHTS.thickness / 2, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          color={palette.wood}
        >
          <extrudeGeometry args={[profile, { depth: UPRIGHTS.thickness, bevelEnabled: false }]} />
        </ToonMesh>
      ))}
      {/* The basin where the ice cube lands. */}
      <ToonMesh position={[basinX, top + 0.05, basinZ]} color={palette.enamel} side={DoubleSide}>
        <cylinderGeometry args={[0.2, 0.13, 0.1, 32, 1, true]} />
      </ToonMesh>
      <ToonMesh position={[basinX, top + 0.005, basinZ]} color={palette.enamel} outline={0}>
        <cylinderGeometry args={[0.13, 0.13, 0.01, 32]} />
      </ToonMesh>
      {/* Tongs, lying open. */}
      <Rod
        from={[1.3, top + 0.01, 0.88]}
        to={[1.57, top + 0.01, 0.93]}
        radius={0.008}
        color={palette.iron}
      />
      <Rod
        from={[1.3, top + 0.01, 0.88]}
        to={[1.55, top + 0.01, 0.83]}
        radius={0.008}
        color={palette.iron}
      />
      {/* Flask stand. */}
      {[STAND.left, STAND.right].map((x) => (
        <Rod
          key={x}
          from={[x, top, STAND.z]}
          to={[x, top + STAND.height, STAND.z]}
          radius={0.008}
          color={palette.brass}
        />
      ))}
      <Rod
        from={[STAND.left, top + STAND.height, STAND.z]}
        to={[STAND.right, top + STAND.height, STAND.z]}
        radius={0.008}
        color={palette.brass}
      />
      <Flask position={[1.5, top + STAND.height, STAND.z]} liquid={palette.redLiquid} />
      <Flask position={[1.66, top + STAND.height, STAND.z]} />
      {/* Doc's tall graduated glass of tea: foot, stem, flared bowl. */}
      <group position={[GLASS.x, top, GLASS.z]}>
        <ToonMesh position={[0, 0.005, 0]} color={palette.glass} opacity={0.5}>
          <cylinderGeometry args={[0.045, 0.045, 0.01, 20]} />
        </ToonMesh>
        <ToonMesh position={[0, 0.03, 0]} color={palette.glass} opacity={0.5}>
          <cylinderGeometry args={[0.012, 0.012, 0.04, 10]} />
        </ToonMesh>
        <ToonMesh position={[0, 0.05 + GLASS.height / 2, 0]} color={palette.glass} opacity={0.4}>
          <cylinderGeometry args={[0.055, 0.03, GLASS.height, 20, 1, true]} />
        </ToonMesh>
        <ToonMesh position={[0, 0.05 + GLASS.height * 0.35, 0]} color={palette.tea} outline={0}>
          <cylinderGeometry args={[0.044, 0.029, GLASS.height * 0.7, 20]} />
        </ToonMesh>
      </group>
    </group>
  )
}

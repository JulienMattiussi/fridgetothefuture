import { DoubleSide, Shape } from 'three'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { Flask } from '@/three/parts/Flask'
import { Rod } from '@/three/parts/Rod'
import { Table } from '@/three/parts/Table'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { Clickable } from '@/three/sequence/Clickable'
import { layout } from '@/three/machine/layout'

const { bench, ductMouth } = layout
const top = bench.top
const [basinX, , basinZ] = ductMouth

/** The two flasks' brass stand: a crossbar on two uprights. */
const STAND = { left: 1.4, right: 1.75, z: 0.5, height: 0.2 }
const GLASS = layout.teaGlass
/**
 * Under the bench, at each pair of legs: a square bearer running across under the top,
 * jutting out front and back, and two plank legs nailed on its side, splayed
 * a little front and back like an A.
 */
const UNDER = top - 0.06
/** The left legs stand just right of the boiler, the right ones near the end. */
const ENDS = [layout.boiler.x + layout.boiler.radius + 0.1, bench.right - 0.2]
const BEARER = { size: 0.07, overhang: 0.06 }
const BEARER_Y = UNDER - BEARER.size / 2
const PLANK = { width: 0.12, thickness: 0.05 }
/** How far each leg's foot splays out past its top. */
const SPLAY = 0.1
/** The thick plank on the floor under the boiler, along the bench, near its back. */
const SILL = { length: 0.7, width: 0.25, thickness: 0.06, z: bench.back + 0.15 }
/** The two big planks propping the boiler's end of the bench. */
const PROP = { spread: 0.2, width: 0.2, thickness: 0.12, chamfer: 0.04 }
/**
 * Each prop's side profile, in (z, y): cut level where it stands on the sill
 * and where it meets the top's underside, its two sharp corners chamfered.
 */
const propProfile = (() => {
  const half = PROP.width / 2
  const [zb, yb] = [SILL.z, SILL.thickness]
  const [zt, yt] = [bench.front - half, UNDER]
  const length = Math.hypot(zt - zb, yt - yb)
  const [dz, dy] = [(zt - zb) / length, (yt - yb) / length]
  const c = PROP.chamfer
  const shape = new Shape()
  // Round the parallelogram from the back foot, cutting its two acute corners.
  shape.moveTo(zb - half + c, yb)
  shape.lineTo(zb + half, yb)
  shape.lineTo(zt + half - c * dz, yt - c * dy)
  shape.lineTo(zt + half - c, yt)
  shape.lineTo(zt - half, yt)
  shape.lineTo(zb - half + c * dz, yb + c * dy)
  shape.closePath()
  return shape
})()
/** The legs' tops, front and back, in from the bearer's ends. */
const LEG_TOP_ZS = [bench.back + 0.12, bench.front - 0.12]
/**
 * The right workbench, after the film (docs/references/video-*.jpg): the
 * enamel basin under the cold-air duct, the tongs, the flasks on their stand
 * and Doc's tall glass of tea, waiting for its ice cube.
 */
export function Workbench() {
  return (
    <group>
      <Table {...bench} legs={false} />
      {/* Under the boiler: a thick plank flat on the floor, and two big planks
          slanting up from it at the back to the top's underside at the front. */}
      <ToonMesh position={[layout.boiler.x, SILL.thickness / 2, SILL.z]} color={palette.wood}>
        <boxGeometry args={[SILL.length, SILL.thickness, SILL.width]} />
      </ToonMesh>
      {/* Turned a quarter so the profile's x runs along the depth. */}
      {[-1, 1].map((side) => (
        <ToonMesh
          key={side}
          position={[layout.boiler.x + side * PROP.spread + PROP.thickness / 2, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          color={palette.woodLight}
        >
          <extrudeGeometry args={[propProfile, { depth: PROP.thickness, bevelEnabled: false }]} />
        </ToonMesh>
      ))}
      {/* A third square bar along the bench, from one bearer to the other. */}
      <Beam
        from={[ENDS[0]!, BEARER_Y, (bench.back + bench.front) / 2]}
        to={[ENDS[1]!, BEARER_Y, (bench.back + bench.front) / 2]}
        size={BEARER.size}
      />
      {ENDS.map((x) => {
        const legX = x + BEARER.size / 2 + PLANK.thickness / 2
        return (
          <group key={x}>
            <Beam
              from={[x, BEARER_Y, bench.back - BEARER.overhang]}
              to={[x, BEARER_Y, bench.front + BEARER.overhang]}
              size={BEARER.size}
            />
            {LEG_TOP_ZS.map((z, i) => (
              <Beam
                key={z}
                from={[legX, UNDER, z]}
                to={[legX, 0, z + (i === 0 ? -SPLAY : SPLAY)]}
                size={PLANK.thickness}
                depth={PLANK.width}
                color={palette.woodLight}
              />
            ))}
          </group>
        )
      })}
      {/* The basin where the ice cube lands, held under the duct. */}
      <Clickable action="holdBasin">
        <ToonMesh position={[basinX, top + 0.05, basinZ]} color={palette.enamel} side={DoubleSide}>
          <cylinderGeometry args={[0.2, 0.13, 0.1, 32, 1, true]} />
        </ToonMesh>
        <ToonMesh position={[basinX, top + 0.005, basinZ]} color={palette.enamel} outline={0}>
          <cylinderGeometry args={[0.13, 0.13, 0.01, 32]} />
        </ToonMesh>
      </Clickable>
      {/* Tongs, lying open, to put the cube in the glass. */}
      <Clickable action="useTongs">
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
        {/* A wider, unseen grip, easier to click than the thin arms. */}
        <mesh position={[1.43, top + 0.03, 0.88]} visible={false}>
          <boxGeometry args={[0.3, 0.06, 0.16]} />
        </mesh>
      </Clickable>
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

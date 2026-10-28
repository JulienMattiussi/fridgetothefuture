import { Shape } from 'three'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { Flask } from '@/three/parts/Flask'
import { Rod } from '@/three/parts/Rod'
import { Table } from '@/three/parts/Table'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const { bench } = layout
const top = bench.top

/** The two flasks' brass stand: a crossbar on two uprights. */
const STAND = { x: 1.58, z: 0.5, width: 0.4, depth: 0.18, base: 0.025, height: 0.36, rodZ: 0.43 }
/**
 * Its two flasks: their bulb, the cork ring each sits on, their neck's radius;
 * and how far above the ring the bulb's center sits, resting on it.
 */
const FLASK = { radius: 0.08, ring: 0.045, neck: 0.02, seat: Math.sqrt(0.08 ** 2 - 0.045 ** 2) }
const FLASK_Y = top + STAND.base + 0.014 + FLASK.seat
/** The clamps hold them at the neck (see Flask: its neck's middle, 1.5 radii up). */
const NECK_Y = FLASK_Y + FLASK.radius * 1.5
const FLASKS = [
  { x: 1.5, liquid: palette.redLiquid },
  { x: 1.66, liquid: undefined },
]
const GLASS = layout.teaGlass
/** The step stool under the bench, on the floor. */
const STOOL = { x: 1.35, z: 0.78, width: 0.45, depth: 0.28, height: 0.24 }
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
 * flasks on their stand and Doc's tall glass of tea, waiting for its ice cube
 * (the basin and the tongs on it are worked: Basin, Tongs).
 */
export function Workbench() {
  return (
    <group>
      <Table {...bench} legs={false} />
      {/* A low step stool under the bench, in pale wood: a top on four short legs. */}
      <ToonMesh position={[STOOL.x, STOOL.height - 0.015, STOOL.z]} color={palette.woodLight}>
        <boxGeometry args={[STOOL.width, 0.03, STOOL.depth]} />
      </ToonMesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <ToonMesh
            key={`${sx}:${sz}`}
            position={[
              STOOL.x + sx * (STOOL.width / 2 - 0.03),
              (STOOL.height - 0.03) / 2,
              STOOL.z + sz * (STOOL.depth / 2 - 0.03),
            ]}
            color={palette.woodLight}
          >
            <boxGeometry args={[0.04, STOOL.height - 0.03, 0.04]} />
          </ToonMesh>
        )),
      )}
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
      {/* The flasks' stand: a wooden base, each flask on a cork ring, held at
          the neck by a brass clamp off an iron retort rod behind them. */}
      <ToonMesh position={[STAND.x, top + STAND.base / 2, STAND.z]} color={palette.woodDark}>
        <boxGeometry args={[STAND.width, STAND.base, STAND.depth]} />
      </ToonMesh>
      <Rod
        from={[STAND.x, top + STAND.base, STAND.rodZ]}
        to={[STAND.x, top + STAND.base + STAND.height, STAND.rodZ]}
        radius={0.01}
        color={palette.iron}
      />
      {FLASKS.map(({ x, liquid }) => (
        <group key={x}>
          <ToonMesh
            position={[x, FLASK_Y - FLASK.seat, STAND.z]}
            rotation={[Math.PI / 2, 0, 0]}
            color={palette.hay}
          >
            <torusGeometry args={[FLASK.ring, 0.014, 8, 20]} />
          </ToonMesh>
          <Flask position={[x, FLASK_Y, STAND.z]} radius={FLASK.radius} liquid={liquid} />
          <Rod
            from={[STAND.x, NECK_Y, STAND.rodZ]}
            to={[x, NECK_Y, STAND.z - FLASK.neck - 0.004]}
            radius={0.005}
            color={palette.brass}
          />
          <ToonMesh
            position={[x, NECK_Y, STAND.z]}
            rotation={[Math.PI / 2, 0, 0]}
            color={palette.brass}
          >
            <torusGeometry args={[FLASK.neck + 0.004, 0.004, 6, 16]} />
          </ToonMesh>
        </group>
      ))}
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

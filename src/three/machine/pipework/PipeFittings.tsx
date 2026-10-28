import { DoubleSide } from 'three'
import { lerp, ringPoint, type Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Lashing } from '@/three/parts/Lashing'
import { Pipe } from '@/three/parts/Pipe'
import { RibbedSleeve } from '@/three/parts/RibbedSleeve'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'
import {
  DUCT_BEND,
  onRedDiagonal,
  onRedLine,
  ORANGE_RADIUS,
  RED_JOIN_T,
  RED_LINE_ALONG,
  RED_LINE_RADIUS,
  RED_LINE_Z,
  SLEEVE_START,
} from '@/three/machine/pipework/anchors'

const { steamVent, shelfTimber } = layout

/**
 * The duct hangs from the red line by two strings in a V: both tied round the
 * duct just above its sleeve, one rising straight up to the red line, the
 * other slanting up to it further right. They leave each tie on its front
 * side, so they run in front of the pipes instead of through them.
 */
const DUCT_TIE = lerp(DUCT_BEND, SLEEVE_START, 0.2)
const DUCT_ALONG: Vec3 = SLEEVE_START.map((v, k) => v - DUCT_BEND[k]!) as Vec3
const STRING_SIDE: Vec3 = [0, -0.4, 1]
const STRING_GAP = 0.012
const STRINGS = [onRedLine(DUCT_TIE[0]), onRedLine(1.3)].map((tie) => ({
  tie,
  from: ringPoint(tie, RED_LINE_ALONG, RED_LINE_RADIUS + STRING_GAP, STRING_SIDE),
  to: ringPoint(DUCT_TIE, DUCT_ALONG, ORANGE_RADIUS + STRING_GAP, [0, 1, 1]),
}))

/** Where a string ties the red line up to the shelf's big timber. */
const TIMBER_TIE = onRedLine(shelfTimber.x)
const TIMBER_BOTTOM = layout.shelfY - 0.035 - shelfTimber.height
/** The iron strap holding the steam vent to the timber's right side. */
const VENT_STRAP_FROM = shelfTimber.x + shelfTimber.width / 2 - 0.01
const VENT_STRAP_LENGTH = steamVent.x + steamVent.radius + 0.015 - VENT_STRAP_FROM
const VENT_STRAP_X = VENT_STRAP_FROM + VENT_STRAP_LENGTH / 2

/**
 * What goes on the pipes besides gauges: the cold-air duct's corrugated mouth
 * and the strings it hangs by, the collar on the red join, the steam vent
 * strapped to the shelf's timber, and the string tying the red line up to it.
 */
export function PipeFittings() {
  return (
    <group>
      <RibbedSleeve from={SLEEVE_START} to={layout.ductMouth} radius={0.09} />
      <Lashing at={DUCT_TIE} along={DUCT_ALONG} radius={ORANGE_RADIUS} />
      {STRINGS.map(({ tie, from, to }) => (
        <group key={tie[0]}>
          <Lashing at={tie} along={RED_LINE_ALONG} radius={RED_LINE_RADIUS} />
          <Rod from={from} to={to} radius={0.008} color={palette.hay} />
        </group>
      ))}
      {/* The collar where the long diagonal joins the vat's pipe. */}
      <Rod
        from={onRedDiagonal(RED_JOIN_T - 0.06)}
        to={onRedDiagonal(RED_JOIN_T + 0.06)}
        radius={0.095}
        color={palette.steel}
      />
      {/* The steam vent: up from the red line, strapped to the big timber, flared. */}
      <Pipe
        points={[onRedLine(steamVent.x), [steamVent.x, steamVent.top, RED_LINE_Z]]}
        radius={steamVent.radius}
      />
      <ToonMesh
        position={[steamVent.x, steamVent.top + 0.09, RED_LINE_Z]}
        color={palette.steel}
        side={DoubleSide}
      >
        <cylinderGeometry args={[0.12, steamVent.radius, 0.18, 24, 1, true]} />
      </ToonMesh>
      <ToonMesh
        position={[VENT_STRAP_X, TIMBER_BOTTOM + shelfTimber.height / 2, RED_LINE_Z]}
        color={palette.iron}
      >
        <boxGeometry args={[VENT_STRAP_LENGTH, 0.035, 2 * steamVent.radius + 0.02]} />
      </ToonMesh>
      {/* The red line tied up to the shelf's big timber by a string. */}
      <Lashing at={TIMBER_TIE} along={RED_LINE_ALONG} radius={RED_LINE_RADIUS} />
      <Rod
        from={[TIMBER_TIE[0], TIMBER_TIE[1] + RED_LINE_RADIUS, TIMBER_TIE[2]]}
        to={[TIMBER_TIE[0], TIMBER_BOTTOM, TIMBER_TIE[2]]}
        radius={0.008}
        color={palette.hay}
      />
      <ToonMesh
        position={[TIMBER_TIE[0], TIMBER_BOTTOM + shelfTimber.height / 2, TIMBER_TIE[2]]}
        color={palette.hay}
        outline={0}
      >
        <boxGeometry args={[shelfTimber.width + 0.012, shelfTimber.height + 0.012, 0.02]} />
      </ToonMesh>
    </group>
  )
}

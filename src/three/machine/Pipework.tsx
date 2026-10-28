import type { ComponentProps } from 'react'
import { DoubleSide } from 'three'
import { ringPoint, type Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Gauge } from '@/three/parts/Gauge'
import { Lashing } from '@/three/parts/Lashing'
import { Pipe } from '@/three/parts/Pipe'
import { RibbedSleeve } from '@/three/parts/RibbedSleeve'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

/*
 * The pipe runs follow the film, as traced over its wide shot (red, orange
 * and blue series, docs/references/video-plan-large.jpg). The red and blue
 * series run in front of the frame; the orange one comes down behind the red
 * horizontal line, then forward to the basin.
 */

const { x: bx, z: bz, radius: br, bottom, height } = layout.boiler
const vat = layout.vat
/** The red cap's top, where the rising pipes come in from above. */
const CAP_TOP = vat.y + vat.height + vat.cap.height
/** A point on that top, `dx` and `dz` from the axis, and the point `rise` above it. */
const onCapTop = (dx: number, dz: number): Vec3 => [vat.x + dx, CAP_TOP, vat.z + dz]
const overCapTop = (dx: number, dz: number, rise: number): Vec3 => [
  vat.x + dx,
  CAP_TOP + rise,
  vat.z + dz,
]
/** The middle of the grey vat's bottom, where the red line comes up into it through the shelf. */
const VAT_BOTTOM: Vec3 = [vat.x, vat.y, vat.z]
/** The red line's straight run slopes down to here, under the shelf. */
const UNDER_SHELF_Y = layout.vatSmallPipe.y
/** Its right end, clear left of the big gauge there. */
const RED_DOWN_X = 2.1
const front = layout.pipesZ
/** A point on the boiler's flank, `angle` around it seen from above (0: left). */
const onBoiler = (angle: number, y: number): Vec3 => [
  bx - br * Math.cos(angle),
  y,
  bz + br * Math.sin(angle),
]
const domeCenterY = bottom + 0.06 + height
const domeTop = domeCenterY + br
/** Inward normals, for the flanges bolted onto these surfaces. */
const DOWN: Vec3 = [0, -1, 0]
/** Clear behind the boiler's back, for the pipe passing behind it. */
const BEHIND_BOILER_Z = bz - br - 0.15
/** Just clear of the boiler's left side. */
const BOILER_LEFT_HUG_X = bx - br - 0.075
/**
 * From the duct line, a pipe runs straight left, high behind the boiler and on
 * inside the deck's frame behind its front posts, then drops and comes forward
 * into the black block's back. A branch tees off it behind the boiler and
 * comes down to the grey block.
 */
/** It runs well back in the frame, behind the big wheel under the deck. */
const HIGH_RUN_FROM: Vec3 = [0.715, 2.375, -0.25]
const HIGH_RUN_TO: Vec3 = [-1.7, 2.25, -0.25]
const HIGH_RUN_RADIUS = 0.06
/** The point on the high run's axis at `x`. */
const onHighRun = (x: number): Vec3 =>
  HIGH_RUN_FROM.map(
    (v, k) =>
      v + ((HIGH_RUN_TO[k]! - v) * (x - HIGH_RUN_FROM[0])) / (HIGH_RUN_TO[0] - HIGH_RUN_FROM[0]),
  ) as Vec3
/** The black block's back, at the height the high run comes in. */
const BLACK_BACK_Y = 1.35
/** Where the branch to the grey block tees off, and its run down behind the boiler. */
const GREY_BRANCH_TEE = onHighRun(0.35)
const BEHIND_BOILER_TO: Vec3 = [BOILER_LEFT_HUG_X, 1.54, BEHIND_BOILER_Z]
/** A gauge stands out in front of the high run, on a short stem. */
const BRANCH_GAUGE = { x: -1.44, radius: 0.072, stem: 0.06 }
const BRANCH_GAUGE_ON = onHighRun(BRANCH_GAUGE.x)
const BRANCH_GAUGE_AT: Vec3 = [
  BRANCH_GAUGE.x,
  BRANCH_GAUGE_ON[1],
  BRANCH_GAUGE_ON[2] + HIGH_RUN_RADIUS + BRANCH_GAUGE.stem + BRANCH_GAUGE.radius * 0.2,
]
/** Inward, into the boiler's flank at `angle` (as `onBoiler` measures it). */
const inward = (angle: number): Vec3 => [Math.cos(angle), 0, -Math.sin(angle)]
const mouth = layout.ductMouth

/**
 * Red, above the boiler (docs/references/video-coude.jpg): the pipe from the
 * vat's red cap comes down a diagonal to an elbow and drops straight into the
 * dome. The long diagonal from the coil unit rises in front of that elbow,
 * then a little higher turns back to join the vat's pipe.
 */
const RED_TOP: Vec3 = [1.45, 3.75, front]
/** The elbow sits right over the dome, so the drop lands square on its top. */
const RED_ELBOW: Vec3 = [bx, 2.62, bz]
const RED_DROP_END: Vec3 = [bx, domeTop, bz]
/** A point on the vat pipe's diagonal, `t` of the way from the elbow up. */
const onRedDiagonal = (t: number): Vec3 =>
  RED_ELBOW.map((v, k) => v + (RED_TOP[k]! - v) * t) as Vec3
/** Where the long diagonal joins the vat's pipe, under a collar. */
const RED_JOIN_T = 0.25
const RED_JOIN = onRedDiagonal(RED_JOIN_T)
const { coilUnit } = layout
const { blackBlock, greyBlock } = coilUnit
/** The long diagonal's foot, straight up from the black block's middle. */
const RED_LOW: Vec3 = [(blackBlock.left + blackBlock.right) / 2, 1.75, coilUnit.z]
/**
 * The long diagonal's height and depth as it passes in front of the elbow: it
 * slants back as it rises from the coil unit, a step ahead of the rest.
 */
const RED_PASS_Y = 2.48
const RED_PASS_Z = bz + 0.35
/**
 * Where the long diagonal, past the elbow and a little below the join, turns
 * back and up toward it.
 */
const RED_TURN: Vec3 = [
  RED_JOIN[0],
  RED_LOW[1] + ((RED_PASS_Y - RED_LOW[1]) * (RED_JOIN[0] - RED_LOW[0])) / (bx - RED_LOW[0]),
  RED_PASS_Z,
]
/**
 * Red: the horizontal line's plane, just ahead of the pipes plane so it clears
 * the cold-air duct crossing behind it.
 */
const RED_LINE_Z = front + 0.06
/** The horizontal line's main straight run, the blue pipe teeing in below it. */
const RED_LINE_FROM: Vec3 = [bx + 0.12, 2.2, RED_LINE_Z]
const RED_LINE_TO: Vec3 = [RED_DOWN_X, UNDER_SHELF_Y, RED_LINE_Z]
const RED_LINE_RADIUS = 0.06
/** The point on that run's axis at `x`. */
const onRedLine = (x: number): Vec3 => [
  x,
  RED_LINE_FROM[1] +
    ((RED_LINE_TO[1] - RED_LINE_FROM[1]) * (x - RED_LINE_FROM[0])) /
      (RED_LINE_TO[0] - RED_LINE_FROM[0]),
  RED_LINE_Z,
]
const BLUE_TEE = onRedLine(1.17)
/**
 * Small pipes round the vat, along its flanks and the frame: a point on a
 * round flank about the vat's axis, `angle` round from the left toward the
 * front (past pi, round the back), at `r` from the axis.
 */
const aroundVat = (angle: number, y: number, r: number): Vec3 => [
  vat.x - r * Math.cos(angle),
  y,
  vat.z + r * Math.sin(angle),
]
const CAP_FOOT = vat.y + vat.height
/** Clear of the vat's rolled lip, for pipes running down its flank. */
const VAT_CLEAR = vat.radius + 0.08
const SMALL = 0.025
/** The vat's gauge, on the small pipe running down its front. */
const VAT_GAUGE = { x: 2.08, y: 2.85, radius: 0.104, pipeZ: 0.48 }
const vatFrontAngle = Math.acos((vat.x - VAT_GAUGE.x) / vat.cap.radius)
const vatLowAngle = Math.acos((vat.x - VAT_GAUGE.x) / vat.radius)
/**
 * The right small pipe leaves the cap's right flank at depth `z`, clear in
 * front of the ladder, and comes down at `x`, past the shelf's right end.
 */
const RIGHT_SMALL_Z = layout.vatSmallPipe.z
const RIGHT_SMALL = {
  z: RIGHT_SMALL_Z,
  x: 3.45,
  angle: Math.PI - Math.asin((RIGHT_SMALL_Z - vat.z) / vat.cap.radius),
}
/**
 * The big porthole gauge hangs on a stem under the red line's run back to the
 * vat; the small one stands out in front of the right small pipe.
 */
const PORTHOLE = { radius: 0.168, on: [RED_DOWN_X, UNDER_SHELF_Y, 0.45] as Vec3, stem: 0.05 }
const PORTHOLE_AT: Vec3 = [
  PORTHOLE.on[0],
  PORTHOLE.on[1] - RED_LINE_RADIUS - PORTHOLE.stem - PORTHOLE.radius,
  PORTHOLE.on[2],
]
const RUNG_GAUGE = { radius: 0.077, x: 2.62, stem: 0.05 }
const RUNG_GAUGE_AT: Vec3 = [
  RUNG_GAUGE.x,
  UNDER_SHELF_Y,
  RIGHT_SMALL_Z + SMALL + RUNG_GAUGE.stem + RUNG_GAUGE.radius * 0.2,
]
const VAT_GAUGE_AT: Vec3 = [VAT_GAUGE.x, VAT_GAUGE.y, VAT_GAUGE.pipeZ + SMALL + 0.06]
/** Where a string ties the red line up to the shelf's big timber. */
const TIMBER_TIE = onRedLine(layout.shelfTimber.x)
const TIMBER_BOTTOM = layout.shelfY - 0.035 - layout.shelfTimber.height
/** The iron strap holding the steam vent to the timber's right side. */
const VENT_STRAP_FROM = layout.shelfTimber.x + layout.shelfTimber.width / 2 - 0.01
const VENT_STRAP_LENGTH = layout.steamVent.x + layout.steamVent.radius + 0.015 - VENT_STRAP_FROM
const VENT_STRAP_X = VENT_STRAP_FROM + VENT_STRAP_LENGTH / 2
/** Where the big blue pipe bolts onto the grey block's front, and the depth it comes in at. */
const GREY_FLANGE: Vec3 = [
  (greyBlock.left + greyBlock.right) / 2,
  layout.table.top + 0.19,
  coilUnit.z + greyBlock.depth / 2,
]
const GREY_FLANGE_RUN_Z = GREY_FLANGE[2] + 0.12
/** A gauge hangs under the red line, past where the blue pipe tees in. */
const LINE_GAUGE_ON = onRedLine(1.42)
const LINE_GAUGE = {
  radius: 0.086,
  on: LINE_GAUGE_ON,
  at: [LINE_GAUGE_ON[0], LINE_GAUGE_ON[1] - RED_LINE_RADIUS - 0.04 - 0.086, RED_LINE_Z] as Vec3,
}
/** The blue pipe from the boiler's right flank runs back here, behind the duct. */
const BLUE_BEHIND_DUCT_Z = 0.35
/** It leaves the boiler's flank toward the back right. */
const BLUE_RIGHT_ANGLE = Math.PI + 0.6
const RED_LONG_RADIUS = 0.075
/** A gauge stands on top of the long red diagonal, on a short stem. */
const DIAGONAL_GAUGE = { x: -0.85, radius: 0.094, stem: 0.06 }
const DIAGONAL_GAUGE_ON = RED_LOW.map(
  (v, k) => v + ((RED_TURN[k]! - v) * (DIAGONAL_GAUGE.x - RED_LOW[0])) / (RED_TURN[0] - RED_LOW[0]),
) as Vec3
const DIAGONAL_GAUGE_AT: Vec3 = [
  DIAGONAL_GAUGE_ON[0],
  DIAGONAL_GAUGE_ON[1] + RED_LONG_RADIUS + DIAGONAL_GAUGE.stem + DIAGONAL_GAUGE.radius,
  DIAGONAL_GAUGE_ON[2],
]
/** The first thin pipe's start, on the black block's front. */
const THIN1_START: Vec3 = [-1.85, 1.08, coilUnit.z + 0.22]
/** A gauge stands on it just out of the block (the white disc of the film). */
const BLOCK_GAUGE = { radius: 0.097, stem: 0.04, foot: [-1.79, 1.07, coilUnit.z + 0.26] as Vec3 }
/** The thin pipe's last corner, and its end low on the boiler. */
const THIN_CORNER: Vec3 = [-0.33, 1.12, 0.9]
/** Its end on the boiler's left flank, about level in depth with the corner. */
const THIN_END_ANGLE = 0.5
const THIN_END = onBoiler(THIN_END_ANGLE, THIN_CORNER[1])
/** A point on the thin pipe's last run, `t` of the way to the boiler. */
const onThinLastRun = (t: number): Vec3 =>
  THIN_CORNER.map((v, k) => v + (THIN_END[k]! - v) * t) as Vec3
/** The second thin pipe joins the first there, just before its gauge. */
const THIN_MERGE = onThinLastRun(0.1)
/** A gauge stands on the last run, right against the boiler. */
const THIN_GAUGE = { radius: 0.066, stem: 0.08, foot: onThinLastRun(0.45) }
/** The second thin pipe's run over the coil unit, from the black block on. */
const THIN2_RUN_FROM: Vec3 = [-1.95, 1.8, 1.45]
const THIN2_RUN_TO: Vec3 = [-1.0, 1.76, 1.45]
const THIN2_RADIUS = 0.02
/** The point on that run's axis at `x`. */
const onThin2Run = (x: number): Vec3 =>
  THIN2_RUN_FROM.map(
    (v, k) =>
      v +
      ((THIN2_RUN_TO[k]! - v) * (x - THIN2_RUN_FROM[0])) / (THIN2_RUN_TO[0] - THIN2_RUN_FROM[0]),
  ) as Vec3
/**
 * Past the run it slopes down to the right, over the big blue pipe, to a
 * bend where it drops into the first thin pipe; a gauge stands on the slope.
 */
const THIN2_BEND: Vec3 = [-0.42, 1.62, 0.98]
const SLOPE_GAUGE = {
  radius: 0.081,
  stem: 0.06,
  foot: THIN2_RUN_TO.map((v, k) => v + (THIN2_BEND[k]! - v) * 0.3) as Vec3,
}
/**
 * The two gauges over the black block stand on that thin run, in front of
 * the long red diagonal (docs/references/video-bobine.jpg): the big dark one on
 * a stem, the small white one, to its right and lower, on a short fitting.
 */
const BIG_GAUGE = { radius: 0.182, stem: 0.05, on: onThin2Run(-1.6) }
const BIG_GAUGE_AT: Vec3 = [
  BIG_GAUGE.on[0],
  BIG_GAUGE.on[1] + THIN2_RADIUS + BIG_GAUGE.stem + BIG_GAUGE.radius,
  BIG_GAUGE.on[2],
]
const SMALL_GAUGE = { radius: 0.118, fitting: 0.03, on: onThin2Run(-1.36) }
const SMALL_GAUGE_AT: Vec3 = [
  SMALL_GAUGE.on[0],
  SMALL_GAUGE.on[1] + THIN2_RADIUS + SMALL_GAUGE.fitting + SMALL_GAUGE.radius,
  SMALL_GAUGE.on[2] + 0.04,
]
/** Red: the branch point on the drop, where the horizontal line leaves. */
const RED_BRANCH: Vec3 = [bx, 2.21, bz]
/** Orange: the cold-air duct's line, and the two corners its branch tees off between. */
const ORANGE_RADIUS = 0.065
const ORANGE_BEFORE_TEE: Vec3 = [1.36, 2.53, 0.1]
const ORANGE_AFTER_TEE: Vec3 = [1.04, 2.3, 0.15]
/** Mid-run between those two corners, clear of their bends. */
const ORANGE_TEE = ORANGE_BEFORE_TEE.map((v, k) => (v + ORANGE_AFTER_TEE[k]!) / 2) as Vec3
/** The cold-air duct's last run, ending in its corrugated sleeve. */
const DUCT_BEND: Vec3 = [0.82, 1.61, 0.62]
const SLEEVE_START: Vec3 = [0.77, 1.42, 0.72]
/**
 * The duct hangs from the red line by two strings in a V: both tied round the
 * duct just above its sleeve, one rising straight up to the red line, the
 * other slanting up to it further right.
 */
const RED_LINE_ALONG: Vec3 = RED_LINE_TO.map((v, k) => v - RED_LINE_FROM[k]!) as Vec3
const DUCT_TIE: Vec3 = DUCT_BEND.map((v, k) => v + (SLEEVE_START[k]! - v) * 0.2) as Vec3
const DUCT_ALONG: Vec3 = SLEEVE_START.map((v, k) => v - DUCT_BEND[k]!) as Vec3
/**
 * The strings leave each tie on its front side, so they run in front of the
 * pipes between instead of through them.
 */
const STRING_SIDE: Vec3 = [0, -0.4, 1]
const STRING_GAP = 0.012
const STRINGS = [onRedLine(DUCT_TIE[0]), onRedLine(1.3)].map((tie) => ({
  tie,
  from: ringPoint(tie, RED_LINE_ALONG, RED_LINE_RADIUS + STRING_GAP, STRING_SIDE),
  to: ringPoint(DUCT_TIE, DUCT_ALONG, ORANGE_RADIUS + STRING_GAP, [0, 1, 1]),
}))
const DUCT_UNDER_LINE: Vec3 = [0.94, 2.0, 0.35]

const pipes: ComponentProps<typeof Pipe>[] = [
  // Small: from the red cap's front left, down the vat's left flank, out in
  // front of the shelf and into the red line from above.
  {
    points: [
      aroundVat(1.0, CAP_FOOT + 0.25, vat.cap.radius),
      aroundVat(1.0, CAP_FOOT + 0.25, VAT_CLEAR),
      aroundVat(1.0, layout.shelfY + 0.18, VAT_CLEAR),
      [1.9, layout.shelfY + 0.18, RED_LINE_Z],
      onRedLine(1.9),
    ],
    radius: SMALL,
    flangeStart: inward(1.0),
  },
  // Small: from the red cap's front, down the grey vat's front past its gauge,
  // and back into the vat low down.
  {
    points: [
      aroundVat(vatFrontAngle, CAP_FOOT + 0.2, vat.cap.radius),
      [VAT_GAUGE.x, CAP_FOOT + 0.2, VAT_GAUGE.pipeZ],
      [VAT_GAUGE.x, vat.y + 0.3, VAT_GAUGE.pipeZ],
      aroundVat(vatLowAngle, vat.y + 0.3, vat.radius),
    ],
    radius: SMALL,
    flangeStart: inward(vatFrontAngle),
    flangeEnd: inward(vatLowAngle),
  },
  // Small: from the red cap's right flank, down past the shelf's right end,
  // and left through the frame's rungs into the red line's run to the vat.
  {
    points: [
      aroundVat(RIGHT_SMALL.angle, CAP_FOOT + 0.2, vat.cap.radius),
      // Out past the shelf's right end, between it and the ladder, and down.
      [RIGHT_SMALL.x, CAP_FOOT + 0.2, RIGHT_SMALL.z],
      [RIGHT_SMALL.x, UNDER_SHELF_Y, RIGHT_SMALL.z],
      // Then left between two of the frame's rungs, into the red line's side.
      [RED_DOWN_X, UNDER_SHELF_Y, RIGHT_SMALL.z],
    ],
    radius: SMALL,
    flangeStart: inward(RIGHT_SMALL.angle),
  },
  // Red: the pipe from the vat's red cap, down its diagonal and into the dome.
  {
    points: [onCapTop(-0.42, 0.35), overCapTop(-0.42, 0.35, 0.3), RED_TOP, RED_ELBOW, RED_DROP_END],
    radius: 0.075,
    flangeStart: DOWN,
    flangeEnd: DOWN,
  },
  // Red: the long diagonal from the coil unit's black block, passing in front
  // of the elbow, then turning back onto the vat's pipe.
  {
    points: [
      [RED_LOW[0], layout.table.top + blackBlock.height, RED_LOW[2]],
      RED_LOW,
      RED_TURN,
      RED_JOIN,
    ],
    radius: RED_LONG_RADIUS,
    flangeStart: DOWN,
  },
  // Red: the horizontal line to the right, on up into the grey vat's bottom.
  {
    points: [
      RED_BRANCH,
      RED_LINE_FROM,
      RED_LINE_TO,
      // Then back under the shelf, over to under the vat's middle, and up.
      [RED_DOWN_X, UNDER_SHELF_Y, VAT_BOTTOM[2]],
      [VAT_BOTTOM[0], UNDER_SHELF_Y, VAT_BOTTOM[2]],
      VAT_BOTTOM,
    ],
    radius: RED_LINE_RADIUS,
    flangeEnd: [0, 1, 0],
  },
  // Orange: one pipe from the vat's red cap, down behind the red line and on
  // to the basin as the cold-air duct.
  {
    points: [
      onCapTop(-0.5, -0.15),
      overCapTop(-0.5, -0.15, 0.25),
      // Out past the cap's edge before coming down, clear of it.
      overCapTop(-vat.cap.radius - 0.15, -0.15, 0.25),
      [1.6, 3.7, 0.1],
      [1.525, 3.11, 0.1],
      [1.435, 2.66, 0.1],
      ORANGE_BEFORE_TEE,
      ORANGE_AFTER_TEE,
      [1.03, 2.18, 0.2],
      DUCT_UNDER_LINE,
      DUCT_BEND,
      SLEEVE_START,
    ],
    radius: ORANGE_RADIUS,
    flangeStart: DOWN,
  },
  // A thin pipe from the black block's front, zigzagging along the front of
  // the coil unit, then back into the boiler's front-left flank.
  {
    points: [
      THIN1_START,
      [-1.28, 1.0, coilUnit.z + 0.28],
      [-1.15, 1.36, coilUnit.z + 0.28],
      // Down across the grey block's front, clear of it until past its edge,
      // slipping behind the big blue pipe, then straight on to the boiler.
      [greyBlock.right + 0.02, 1.28, coilUnit.z + greyBlock.depth / 2 + 0.03],
      THIN_CORNER,
      THIN_END,
    ],
    radius: 0.02,
    flangeStart: [0, 0, -1],
    flangeEnd: inward(THIN_END_ANGLE),
  },
  // A second thin pipe, from the black block's top: along over the coil unit,
  // sloping down over the big blue pipe, then down into the first, just
  // before its gauge by the boiler.
  {
    points: [
      [-1.95, layout.table.top + blackBlock.height, 1.45],
      THIN2_RUN_FROM,
      THIN2_RUN_TO,
      THIN2_BEND,
      THIN_MERGE,
    ],
    radius: THIN2_RADIUS,
    flangeStart: DOWN,
  },
  // Orange: from the duct line, straight left high behind the boiler and
  // through the deck's frame, then down and into the black block from behind.
  {
    points: [
      ORANGE_TEE,
      HIGH_RUN_FROM,
      HIGH_RUN_TO,
      [HIGH_RUN_TO[0], BLACK_BACK_Y, HIGH_RUN_TO[2]],
      [HIGH_RUN_TO[0], BLACK_BACK_Y, coilUnit.z - blackBlock.depth / 2],
    ],
    radius: HIGH_RUN_RADIUS,
    flangeEnd: [0, 0, 1],
  },
  // Blue: the branch teeing off it behind the boiler, down past the boiler's
  // left side and on to the coil unit's grey block, into its front.
  {
    points: [
      GREY_BRANCH_TEE,
      BEHIND_BOILER_TO,
      [BOILER_LEFT_HUG_X, 1.5, front],
      // Then left and forward, high; straight down beside the grey block; and
      // left, level, into its front.
      [-0.8, 1.5, GREY_FLANGE_RUN_Z],
      [-0.8, GREY_FLANGE[1], GREY_FLANGE_RUN_Z],
      GREY_FLANGE,
    ],
    radius: 0.06,
    bend: 0.3,
    flangeEnd: [0, 0, -1],
  },
  // Blue: from the boiler's right flank, behind the cold-air duct, then up
  // into the red horizontal line from below.
  {
    points: [
      onBoiler(BLUE_RIGHT_ANGLE, 1.6),
      [0.6, 1.63, BLUE_BEHIND_DUCT_Z],
      [BLUE_TEE[0], 1.66, BLUE_BEHIND_DUCT_Z],
      [BLUE_TEE[0], 1.9, BLUE_BEHIND_DUCT_Z],
      [BLUE_TEE[0], BLUE_TEE[1] - 0.12, RED_LINE_Z],
      BLUE_TEE,
    ],
    radius: 0.055,
    flangeStart: inward(BLUE_RIGHT_ANGLE),
  },
]

/** All the pipes, the cold-air duct's mouth and the gauges standing on them. */
export function Pipework() {
  return (
    <group>
      {pipes.map((pipe, i) => (
        <Pipe key={i} {...pipe} />
      ))}
      <RibbedSleeve from={SLEEVE_START} to={mouth} radius={0.09} />
      {/* The two strings the cold-air duct hangs by, tied round both pipes. */}
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
      <Gauge
        position={BIG_GAUGE_AT}
        radius={BIG_GAUGE.radius}
        face={palette.dialDark}
        needle={palette.dial}
      />
      <Rod
        from={BIG_GAUGE.on}
        to={[BIG_GAUGE_AT[0], BIG_GAUGE_AT[1] - BIG_GAUGE.radius, BIG_GAUGE_AT[2]]}
        radius={0.025}
        color={palette.copperGrey}
      />
      <Rod
        from={BLOCK_GAUGE.foot}
        to={[BLOCK_GAUGE.foot[0], BLOCK_GAUGE.foot[1] + BLOCK_GAUGE.stem, BLOCK_GAUGE.foot[2]]}
        radius={0.012}
        color={palette.copperGrey}
      />
      <Gauge
        position={[
          BLOCK_GAUGE.foot[0],
          BLOCK_GAUGE.foot[1] + BLOCK_GAUGE.stem + BLOCK_GAUGE.radius,
          BLOCK_GAUGE.foot[2],
        ]}
        radius={BLOCK_GAUGE.radius}
        reading={-1.1}
      />
      <Rod
        from={THIN_GAUGE.foot}
        to={[THIN_GAUGE.foot[0], THIN_GAUGE.foot[1] + THIN_GAUGE.stem, THIN_GAUGE.foot[2]]}
        radius={0.012}
        color={palette.copperGrey}
      />
      <Gauge
        position={[
          THIN_GAUGE.foot[0],
          THIN_GAUGE.foot[1] + THIN_GAUGE.stem + THIN_GAUGE.radius,
          THIN_GAUGE.foot[2],
        ]}
        radius={THIN_GAUGE.radius}
        reading={-0.4}
      />
      <Rod
        from={SLOPE_GAUGE.foot}
        to={[SLOPE_GAUGE.foot[0], SLOPE_GAUGE.foot[1] + SLOPE_GAUGE.stem, SLOPE_GAUGE.foot[2]]}
        radius={0.012}
        color={palette.copperGrey}
      />
      <Gauge
        position={[
          SLOPE_GAUGE.foot[0],
          SLOPE_GAUGE.foot[1] + SLOPE_GAUGE.stem + SLOPE_GAUGE.radius,
          SLOPE_GAUGE.foot[2],
        ]}
        radius={SLOPE_GAUGE.radius}
        reading={0.5}
      />
      <Gauge position={SMALL_GAUGE_AT} radius={SMALL_GAUGE.radius} reading={0.4} />
      <ToonMesh
        position={[
          SMALL_GAUGE.on[0],
          SMALL_GAUGE.on[1] + THIN2_RADIUS + SMALL_GAUGE.fitting / 2,
          SMALL_GAUGE.on[2] + 0.02,
        ]}
        color={palette.copperGrey}
      >
        <boxGeometry args={[0.05, SMALL_GAUGE.fitting + 0.02, 0.06]} />
      </ToonMesh>
      {/* The steam vent: up from the red line, strapped to the big timber, flared. */}
      <Pipe
        points={[
          onRedLine(layout.steamVent.x),
          [layout.steamVent.x, layout.steamVent.top, RED_LINE_Z],
        ]}
        radius={layout.steamVent.radius}
      />
      <ToonMesh
        position={[layout.steamVent.x, layout.steamVent.top + 0.09, RED_LINE_Z]}
        color={palette.steel}
        side={DoubleSide}
      >
        <cylinderGeometry args={[0.12, layout.steamVent.radius, 0.18, 24, 1, true]} />
      </ToonMesh>
      <ToonMesh
        position={[VENT_STRAP_X, TIMBER_BOTTOM + layout.shelfTimber.height / 2, RED_LINE_Z]}
        color={palette.iron}
      >
        <boxGeometry args={[VENT_STRAP_LENGTH, 0.035, 2 * layout.steamVent.radius + 0.02]} />
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
        position={[TIMBER_TIE[0], TIMBER_BOTTOM + layout.shelfTimber.height / 2, TIMBER_TIE[2]]}
        color={palette.hay}
        outline={0}
      >
        <boxGeometry
          args={[layout.shelfTimber.width + 0.012, layout.shelfTimber.height + 0.012, 0.02]}
        />
      </ToonMesh>
      <Rod from={BRANCH_GAUGE_ON} to={BRANCH_GAUGE_AT} radius={0.012} color={palette.copperGrey} />
      <Gauge position={BRANCH_GAUGE_AT} radius={BRANCH_GAUGE.radius} reading={-0.3} />
      <Rod
        from={DIAGONAL_GAUGE_ON}
        to={[
          DIAGONAL_GAUGE_AT[0],
          DIAGONAL_GAUGE_AT[1] - DIAGONAL_GAUGE.radius,
          DIAGONAL_GAUGE_AT[2],
        ]}
        radius={0.014}
        color={palette.copperGrey}
      />
      <Gauge position={DIAGONAL_GAUGE_AT} radius={DIAGONAL_GAUGE.radius} reading={0.6} />
      <Rod
        from={[VAT_GAUGE.x, VAT_GAUGE.y, VAT_GAUGE.pipeZ]}
        to={VAT_GAUGE_AT}
        radius={0.012}
        color={palette.copperGrey}
      />
      <Gauge position={VAT_GAUGE_AT} radius={VAT_GAUGE.radius} reading={-0.5} />
      <Rod
        from={PORTHOLE.on}
        to={[PORTHOLE_AT[0], PORTHOLE_AT[1] + PORTHOLE.radius, PORTHOLE_AT[2]]}
        radius={0.018}
        color={palette.copperGrey}
      />
      <Gauge position={PORTHOLE_AT} radius={PORTHOLE.radius} reading={-0.2} />
      <Rod
        from={[RUNG_GAUGE.x, UNDER_SHELF_Y, RIGHT_SMALL_Z]}
        to={RUNG_GAUGE_AT}
        radius={0.01}
        color={palette.copperGrey}
      />
      <Gauge position={RUNG_GAUGE_AT} radius={RUNG_GAUGE.radius} reading={1.0} />
      {/* A gauge hanging under the red line on a short stem. */}
      <Rod
        from={LINE_GAUGE.on}
        to={[LINE_GAUGE.on[0], LINE_GAUGE.at[1] + LINE_GAUGE.radius, LINE_GAUGE.on[2]]}
        radius={0.012}
        color={palette.copperGrey}
      />
      <Gauge position={LINE_GAUGE.at} radius={LINE_GAUGE.radius} reading={0.2} />
    </group>
  )
}

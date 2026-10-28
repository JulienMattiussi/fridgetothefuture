import { atX, lerp, type Vec3 } from '@/lib/geometry'
import { layout } from '@/three/machine/layout'

/*
 * The points the pipe runs share: where they meet the tanks and blocks, and
 * the corners other pipes tee onto, gauges stand on, or strings tie round.
 * The runs themselves follow the film, as traced over its wide shot (red,
 * orange and blue series, docs/references/video-plan-large.jpg).
 */

const { x: bx, z: bz, radius: br, bottom, height } = layout.boiler
export const vat = layout.vat
export const { coilUnit } = layout
export const { blackBlock, greyBlock } = coilUnit
export const front = layout.pipesZ
/** Inward normal of a horizontal surface seen from above: for flanges bolted on top. */
export const DOWN: Vec3 = [0, -1, 0]
/** Small pipes' radius. */
export const SMALL = 0.025

/* The boiler. */

/** A point on the boiler's flank, `angle` around it seen from above (0: left). */
export const onBoiler = (angle: number, y: number): Vec3 => [
  bx - br * Math.cos(angle),
  y,
  bz + br * Math.sin(angle),
]
/** Inward, into a round flank at `angle` (as `onBoiler` and `aroundVat` measure it). */
export const inward = (angle: number): Vec3 => [Math.cos(angle), 0, -Math.sin(angle)]
const domeTop = bottom + 0.06 + height + br
/** Clear behind the boiler's back, for the pipe passing behind it. */
const BEHIND_BOILER_Z = bz - br - 0.15
/** Just clear of the boiler's left side. */
export const BOILER_LEFT_HUG_X = bx - br - 0.075

/* The vat and its red cap. */

/** The red cap's top, where the rising pipes come in from above. */
const CAP_TOP = vat.y + vat.height + vat.cap.height
/** A point on that top, `dx` and `dz` from the axis, and the point `rise` above it. */
export const onCapTop = (dx: number, dz: number): Vec3 => [vat.x + dx, CAP_TOP, vat.z + dz]
export const overCapTop = (dx: number, dz: number, rise: number): Vec3 => [
  vat.x + dx,
  CAP_TOP + rise,
  vat.z + dz,
]
/**
 * A point on a round flank about the vat's axis: `angle` round from the left
 * toward the front (past pi, round the back), at `r` from the axis.
 */
export const aroundVat = (angle: number, y: number, r: number): Vec3 => [
  vat.x - r * Math.cos(angle),
  y,
  vat.z + r * Math.sin(angle),
]
export const CAP_FOOT = vat.y + vat.height
/** Clear of the vat's rolled lip, for pipes running down its flank. */
export const VAT_CLEAR = vat.radius + 0.08
/** The middle of the grey vat's bottom, where the red line comes up into it through the shelf. */
export const VAT_BOTTOM: Vec3 = [vat.x, vat.y, vat.z]
/** The small pipe down the vat's front, carrying its gauge. */
export const VAT_FRONT_PIPE = { x: 2.08, z: 0.48 }
export const vatFrontAngle = Math.acos((vat.x - VAT_FRONT_PIPE.x) / vat.cap.radius)
export const vatLowAngle = Math.acos((vat.x - VAT_FRONT_PIPE.x) / vat.radius)
/**
 * The right small pipe leaves the cap's right flank at depth `z`, clear in
 * front of the ladder, and comes down at `x`, past the shelf's right end.
 */
export const RIGHT_SMALL = {
  z: layout.vatSmallPipe.z,
  x: 3.45,
  angle: Math.PI - Math.asin((layout.vatSmallPipe.z - vat.z) / vat.cap.radius),
}

/* Red: from the vat's cap down into the dome, and the long diagonal from the coil unit. */

/**
 * Above the boiler (docs/references/video-coude.jpg): the pipe from the
 * vat's red cap comes down a diagonal to an elbow and drops straight into the
 * dome. The long diagonal from the coil unit rises in front of that elbow,
 * then a little higher turns back to join the vat's pipe.
 */
export const RED_TOP: Vec3 = [1.45, 3.75, front]
/** The elbow sits right over the dome, so the drop lands square on its top. */
export const RED_ELBOW: Vec3 = [bx, 2.62, bz]
export const RED_DROP_END: Vec3 = [bx, domeTop, bz]
/** A point on the vat pipe's diagonal, `t` of the way from the elbow up. */
export const onRedDiagonal = (t: number): Vec3 => lerp(RED_ELBOW, RED_TOP, t)
/** Where the long diagonal joins the vat's pipe, under a collar. */
export const RED_JOIN_T = 0.25
export const RED_JOIN = onRedDiagonal(RED_JOIN_T)
export const RED_LONG_RADIUS = 0.075
/** The long diagonal's foot, straight up from the black block's middle. */
export const RED_LOW: Vec3 = [(blackBlock.left + blackBlock.right) / 2, 1.75, coilUnit.z]
/**
 * Where the long diagonal, past the elbow and a little below the join, turns
 * back and up toward it: it slants back as it rises from the coil unit, a
 * step ahead of the rest, passing in front of the elbow at this height.
 */
const RED_PASS_Y = 2.48
export const RED_TURN: Vec3 = [
  RED_JOIN[0],
  RED_LOW[1] + ((RED_PASS_Y - RED_LOW[1]) * (RED_JOIN[0] - RED_LOW[0])) / (bx - RED_LOW[0]),
  bz + 0.35,
]

/* Red: the horizontal line, from the drop on down to the grey vat. */

/** The branch point on the drop, where the horizontal line leaves. */
export const RED_BRANCH: Vec3 = [bx, 2.21, bz]
/**
 * The horizontal line's plane, just ahead of the pipes plane so it clears the
 * cold-air duct crossing behind it.
 */
export const RED_LINE_Z = front + 0.06
export const RED_LINE_RADIUS = 0.06
/** The red line's straight run slopes down to here, under the shelf. */
export const UNDER_SHELF_Y = layout.vatSmallPipe.y
/** Its right end, clear left of the big gauge there. */
export const RED_DOWN_X = 2.1
/** The horizontal line's main straight run, the blue pipe teeing in below it. */
export const RED_LINE_FROM: Vec3 = [bx + 0.12, 2.2, RED_LINE_Z]
export const RED_LINE_TO: Vec3 = [RED_DOWN_X, UNDER_SHELF_Y, RED_LINE_Z]
export const RED_LINE_ALONG: Vec3 = RED_LINE_TO.map((v, k) => v - RED_LINE_FROM[k]!) as Vec3
/** The point on that run's axis at `x`. */
export const onRedLine = (x: number): Vec3 => atX(RED_LINE_FROM, RED_LINE_TO, x)

/* Orange: from the vat's cap down to the basin, the cold-air duct. */

export const ORANGE_RADIUS = 0.065
/** The duct line's two corners a branch tees off between, mid-run, clear of their bends. */
export const ORANGE_BEFORE_TEE: Vec3 = [1.36, 2.53, 0.1]
export const ORANGE_AFTER_TEE: Vec3 = [1.04, 2.3, 0.15]
export const ORANGE_TEE = lerp(ORANGE_BEFORE_TEE, ORANGE_AFTER_TEE, 0.5)
export const DUCT_UNDER_LINE: Vec3 = [0.94, 2.0, 0.35]
/** The cold-air duct's last run, ending in its corrugated sleeve. */
export const DUCT_BEND: Vec3 = [0.82, 1.61, 0.62]
export const SLEEVE_START: Vec3 = [0.77, 1.42, 0.72]

/* Orange, then blue: the high run back to the black block, and its branch to the grey block. */

/**
 * From the duct line, a pipe runs straight left, high behind the boiler and on
 * inside the deck's frame, well back behind the big wheel there, then drops
 * and comes forward into the black block's back. A branch tees off it behind
 * the boiler and comes down to the grey block.
 */
export const HIGH_RUN_FROM: Vec3 = [0.715, 2.375, -0.25]
export const HIGH_RUN_TO: Vec3 = [-1.7, 2.25, -0.25]
export const HIGH_RUN_RADIUS = 0.06
/** The point on the high run's axis at `x`. */
export const onHighRun = (x: number): Vec3 => atX(HIGH_RUN_FROM, HIGH_RUN_TO, x)
/** The black block's back, at the height the high run comes in. */
export const BLACK_BACK_Y = 1.35
/** Where the branch to the grey block tees off, and its run down behind the boiler. */
export const GREY_BRANCH_TEE = onHighRun(0.35)
export const BEHIND_BOILER_TO: Vec3 = [BOILER_LEFT_HUG_X, 1.54, BEHIND_BOILER_Z]
/** Where the big blue pipe bolts onto the grey block's front, and the depth it comes in at. */
export const GREY_FLANGE: Vec3 = [
  (greyBlock.left + greyBlock.right) / 2,
  layout.table.top + 0.19,
  coilUnit.z + greyBlock.depth / 2,
]
export const GREY_FLANGE_RUN_Z = GREY_FLANGE[2] + 0.12

/* Blue: from the boiler's right flank up into the red line. */

export const BLUE_TEE = onRedLine(1.17)
/** It leaves the boiler's flank toward the back right, then runs back behind the duct. */
export const BLUE_RIGHT_ANGLE = Math.PI + 0.6
export const BLUE_BEHIND_DUCT_Z = 0.35

/* The two thin pipes from the black block to the boiler. */

/** The first thin pipe's start, on the black block's front. */
export const THIN1_START: Vec3 = [-1.85, 1.08, coilUnit.z + 0.22]
/** Its last corner, and its end low on the boiler's left flank, about level in depth. */
export const THIN_CORNER: Vec3 = [-0.33, 1.12, 0.9]
export const THIN_END_ANGLE = 0.5
export const THIN_END = onBoiler(THIN_END_ANGLE, THIN_CORNER[1])
/** A point on the thin pipe's last run, `t` of the way to the boiler. */
export const onThinLastRun = (t: number): Vec3 => lerp(THIN_CORNER, THIN_END, t)
/** The second thin pipe joins the first there, just before its gauge. */
export const THIN_MERGE = onThinLastRun(0.1)
/** The second thin pipe's run over the coil unit, from the black block on. */
export const THIN2_RUN_FROM: Vec3 = [-1.95, 1.8, 1.45]
export const THIN2_RUN_TO: Vec3 = [-1.0, 1.76, 1.45]
export const THIN2_RADIUS = 0.02
/** The point on that run's axis at `x`. */
export const onThin2Run = (x: number): Vec3 => atX(THIN2_RUN_FROM, THIN2_RUN_TO, x)
/** Past the run it slopes down to the right, over the big blue pipe, to this bend. */
export const THIN2_BEND: Vec3 = [-0.42, 1.62, 0.98]

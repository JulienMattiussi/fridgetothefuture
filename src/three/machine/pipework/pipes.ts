import type { ComponentProps } from 'react'
import type { Pipe } from '@/three/parts/Pipe'
import { layout } from '@/three/machine/layout'
import {
  aroundVat,
  BEHIND_BOILER_TO,
  BLACK_BACK_Y,
  blackBlock,
  BLUE_BEHIND_DUCT_Z,
  BLUE_RIGHT_ANGLE,
  BLUE_TEE,
  BOILER_LEFT_HUG_X,
  CAP_FOOT,
  coilUnit,
  DOWN,
  DUCT_BEND,
  DUCT_UNDER_LINE,
  front,
  GREY_BRANCH_TEE,
  GREY_FLANGE,
  GREY_FLANGE_RUN_Z,
  greyBlock,
  HIGH_RUN_FROM,
  HIGH_RUN_RADIUS,
  HIGH_RUN_TO,
  inward,
  onBoiler,
  onCapTop,
  onRedLine,
  ORANGE_AFTER_TEE,
  ORANGE_BEFORE_TEE,
  ORANGE_RADIUS,
  ORANGE_TEE,
  overCapTop,
  RED_BRANCH,
  RED_DOWN_X,
  RED_DROP_END,
  RED_ELBOW,
  RED_JOIN,
  RED_LINE_FROM,
  RED_LINE_RADIUS,
  RED_LINE_TO,
  RED_LINE_Z,
  RED_LONG_RADIUS,
  RED_LOW,
  RED_TOP,
  RED_TURN,
  RIGHT_SMALL,
  SLEEVE_START,
  SMALL,
  THIN_CORNER,
  THIN_END,
  THIN_END_ANGLE,
  THIN_MERGE,
  THIN1_START,
  THIN2_BEND,
  THIN2_RADIUS,
  THIN2_RUN_FROM,
  THIN2_RUN_TO,
  UNDER_SHELF_Y,
  vat,
  VAT_BOTTOM,
  VAT_CLEAR,
  VAT_FRONT_PIPE,
  vatFrontAngle,
  vatLowAngle,
} from '@/three/machine/pipework/anchors'

type PipeRun = ComponentProps<typeof Pipe>

/** The small pipes round the vat, along its flanks and the frame. */
const vatPipes: PipeRun[] = [
  // From the red cap's front left, down the vat's left flank, out in front of
  // the shelf and into the red line from above.
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
  // From the red cap's front, down the grey vat's front past its gauge, and
  // back into the vat low down.
  {
    points: [
      aroundVat(vatFrontAngle, CAP_FOOT + 0.2, vat.cap.radius),
      [VAT_FRONT_PIPE.x, CAP_FOOT + 0.2, VAT_FRONT_PIPE.z],
      [VAT_FRONT_PIPE.x, vat.y + 0.3, VAT_FRONT_PIPE.z],
      aroundVat(vatLowAngle, vat.y + 0.3, vat.radius),
    ],
    radius: SMALL,
    flangeStart: inward(vatFrontAngle),
    flangeEnd: inward(vatLowAngle),
  },
  // From the red cap's right flank, down past the shelf's right end, and left
  // through the frame's rungs into the red line's run to the vat.
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
]

const redPipes: PipeRun[] = [
  // The pipe from the vat's red cap, down its diagonal and into the dome.
  {
    points: [onCapTop(-0.42, 0.35), overCapTop(-0.42, 0.35, 0.3), RED_TOP, RED_ELBOW, RED_DROP_END],
    radius: 0.075,
    flangeStart: DOWN,
    flangeEnd: DOWN,
  },
  // The long diagonal from the coil unit's black block, passing in front of
  // the elbow, then turning back onto the vat's pipe.
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
  // The horizontal line to the right, on up into the grey vat's bottom.
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
]

const orangeBluePipes: PipeRun[] = [
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

/** The two thin pipes from the black block, merging just before the boiler. */
const thinPipes: PipeRun[] = [
  // From the black block's front, zigzagging along the front of the coil
  // unit, then back into the boiler's front-left flank.
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
  // From the black block's top: along over the coil unit, sloping down over
  // the big blue pipe, then down into the first, just before its gauge.
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
]

export const pipes: PipeRun[] = [...vatPipes, ...redPipes, ...orangeBluePipes, ...thinPipes]

/**
 * The pipes out of the vat: they rumble first, as its valve lets the steam
 * down, before the engine runs (the ones round it, the red one down its
 * diagonal, the orange one down to the duct).
 */
export const vatLines = new Set<PipeRun>([...vatPipes, redPipes[0]!, orangeBluePipes[0]!])

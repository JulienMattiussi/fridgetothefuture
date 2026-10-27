import type { ComponentProps } from 'react'
import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
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
/**
 * A point on a round flank around the vat's axis: `angle` around it seen from
 * above (0: left), `y` up from `foot`.
 */
const onFlank =
  (radius: number, foot: number) =>
  (angle: number, y: number): Vec3 => [
    vat.x - radius * Math.cos(angle),
    foot + y,
    vat.z + radius * Math.sin(angle),
  ]
const onCap = onFlank(vat.cap.radius, vat.y + vat.height)
/** Low on the vat, where it is narrower than at its rim. */
const onVat = onFlank(vat.radius * 0.93, vat.y)
const front = layout.pipesZ
const domeCenterY = bottom + 0.06 + height
const domeTop = domeCenterY + br
/** Inward normals, for the flanges bolted onto these surfaces. */
const DOWN: Vec3 = [0, -1, 0]
const intoVat = (angle: number): Vec3 => [Math.cos(angle), 0, -Math.sin(angle)]
const intoDome = (x: number, y: number): Vec3 => [bx - x, domeCenterY - y, 0]
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
/** The long diagonal runs this far in front of the vat's pipe. */
const RED_LONG_Z = front + 0.2
const RED_LOW: Vec3 = [-1.85, 1.75, RED_LONG_Z]
/** The long diagonal's height as it passes in front of the elbow. */
const RED_PASS_Y = 2.48
/**
 * Where the long diagonal, past the elbow and a little below the join, turns
 * back and up toward it.
 */
const RED_TURN: Vec3 = [
  RED_JOIN[0],
  RED_LOW[1] + ((RED_PASS_Y - RED_LOW[1]) * (RED_JOIN[0] - RED_LOW[0])) / (bx - RED_LOW[0]),
  RED_LONG_Z,
]
/** Red: the branch point on the drop, where the horizontal line leaves. */
const RED_BRANCH: Vec3 = [bx, 2.21, bz]
/** Orange: where the descent from the top right splits in two. */
const ORANGE_SPLIT: Vec3 = [1.12, 2.45, 0.1]
/** The cold-air duct's last run, ending in its corrugated sleeve. */
const DUCT_BEND: Vec3 = [0.75, 1.61, 0.55]
const SLEEVE_START: Vec3 = [0.69, 1.42, 0.62]

const pipes: ComponentProps<typeof Pipe>[] = [
  // Red: the pipe from the vat's red cap, down its diagonal and into the dome.
  {
    points: [onCap(0.8, 0.3), RED_TOP, RED_ELBOW, RED_DROP_END],
    radius: 0.075,
    flangeStart: intoVat(0.8),
    flangeEnd: DOWN,
  },
  // Red: the long diagonal from the coil unit's black block, passing in front
  // of the elbow, then turning back onto the vat's pipe.
  {
    points: [[-1.85, 1.5, 0.75], RED_LOW, RED_TURN, RED_JOIN],
    radius: 0.075,
    flangeStart: DOWN,
  },
  // Red: the horizontal line to the right, rising into the vat's flank.
  {
    points: [RED_BRANCH, [1.54, 2.05, front], [1.9, 2.03, front], onVat(1.1, 0.25)],
    flangeEnd: intoVat(1.1),
  },
  // Orange: the descent from the vat's red cap, behind the red line.
  {
    points: [
      onCap(0.15, 0.15),
      [1.6, 3.7, 0.1],
      [1.525, 3.11, 0.1],
      [1.435, 2.66, 0.1],
      [1.36, 2.53, 0.1],
      ORANGE_SPLIT,
    ],
    flangeStart: intoVat(0.15),
  },
  // Orange: the left branch, hooking down onto the dome.
  {
    points: [
      ORANGE_SPLIT,
      [0.715, 2.375, 0.1],
      [0.63, 2.24, 0.15],
      [0.6, 2.05, 0.2],
      [0.36, domeTop - 0.12, bz],
    ],
    flangeEnd: intoDome(0.36, domeTop - 0.12),
  },
  // Orange: the right branch, down to the basin: the cold-air duct.
  {
    points: [
      ORANGE_SPLIT,
      [1.04, 2.3, 0.15],
      [1.03, 2.18, 0.2],
      [0.94, 2.0, 0.35],
      DUCT_BEND,
      SLEEVE_START,
    ],
    radius: 0.1,
  },
  // Blue: from the boiler's left flank to the coil unit's grey block, U-turning into its front.
  {
    points: [
      [bx - br, 1.6, bz],
      [-0.5, 1.53, front],
      [-0.73, 1.42, front],
      [-0.76, 1.08, front],
      [-0.85, 1.02, 1.05],
      [-1.1, 1.02, 1.05],
      [-1.14, 1.1, 1.0],
      [-1.05, 1.14, 0.93],
    ],
    radius: 0.055,
    flangeStart: [1, 0, 0],
    flangeEnd: [0, 0, -1],
  },
  // Blue: a short stub from the boiler's right flank into the duct.
  {
    points: [
      [bx + br, 1.6, bz],
      [0.6, 1.69, 0.45],
      [0.78, 1.68, 0.5],
    ],
    radius: 0.055,
    flangeStart: [-1, 0, 0],
  },
]

/** All the pipes, the cold-air duct's mouth, the steam whistle and its pull cord. */
export function Pipework() {
  return (
    <group>
      {pipes.map((pipe, i) => (
        <Pipe key={i} {...pipe} />
      ))}
      <RibbedSleeve from={SLEEVE_START} to={mouth} radius={0.125} />
      {/* The collar where the long diagonal joins the vat's pipe. */}
      <Rod
        from={onRedDiagonal(RED_JOIN_T - 0.06)}
        to={onRedDiagonal(RED_JOIN_T + 0.06)}
        radius={0.095}
        color={palette.steel}
      />
      {/* Steam whistle on the red horizontal line, its cord hanging down for Doc. */}
      <ToonMesh position={[1.2, 2.2, front]} color={palette.brass}>
        <cylinderGeometry args={[0.05, 0.05, 0.22, 16]} />
      </ToonMesh>
      <Rod
        from={[1.25, 2.1, front + 0.05]}
        to={[1.25, 1.45, front + 0.08]}
        radius={0.008}
        color={palette.hay}
      />
    </group>
  )
}

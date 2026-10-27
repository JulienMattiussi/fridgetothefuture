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
const front = layout.pipesZ
const domeTop = bottom + 0.06 + height + br
const mouth = layout.ductMouth

/** Red: where the long diagonal meets the drop into the boiler's dome. */
const RED_TEE: Vec3 = [0.27, 2.6, front]
/** Red: the branch point on the drop, where the horizontal line leaves. */
const RED_BRANCH: Vec3 = [bx, 2.21, bz]
/** Orange: where the descent from the top right splits in two. */
const ORANGE_SPLIT: Vec3 = [1.12, 2.45, 0.1]
/** The cold-air duct's last run, ending in its corrugated sleeve. */
const DUCT_BEND: Vec3 = [0.75, 1.61, 0.55]
const SLEEVE_START: Vec3 = [0.69, 1.42, 0.62]

const pipes: { points: Vec3[]; radius?: number; color?: string }[] = [
  // Red: the long diagonal, from the top right down onto the coil unit's black block.
  {
    points: [[1.67, 3.9, front], RED_TEE, [-1.85, 1.75, front], [-1.85, 1.5, 0.75]],
    radius: 0.075,
  },
  // Red: the drop from the diagonal into the boiler's dome.
  {
    points: [RED_TEE, [bx, 2.55, bz], [bx, domeTop - 0.02, bz]],
  },
  // Red: the horizontal line to the right, on to the glass tank.
  {
    points: [
      RED_BRANCH,
      [0.25, 2.21, front],
      [1.54, 2.05, front],
      [1.9, 2.03, front],
      [1.9, 2.03, -0.6],
      [1.9, layout.shelfY + 0.05, -0.6],
    ],
  },
  // Orange: the descent from the top right, behind the red line.
  {
    points: [
      [1.6, 3.9, 0.1],
      [1.525, 3.11, 0.1],
      [1.435, 2.66, 0.1],
      [1.36, 2.53, 0.1],
      ORANGE_SPLIT,
    ],
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
      [bx - br + 0.02, 1.64, bz],
      [-0.5, 1.53, front],
      [-0.73, 1.42, front],
      [-0.76, 1.08, front],
      [-0.85, 1.02, 1.05],
      [-1.1, 1.02, 1.05],
      [-1.14, 1.1, 1.0],
      [-1.05, 1.14, 0.93],
    ],
    radius: 0.055,
  },
  // Blue: a short stub from the boiler's right flank into the duct.
  {
    points: [
      [bx + br - 0.02, 1.75, bz],
      [0.6, 1.69, 0.45],
      [0.78, 1.68, 0.5],
    ],
    radius: 0.055,
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

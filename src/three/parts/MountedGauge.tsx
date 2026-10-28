import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Gauge, type GaugeDrive } from '@/three/parts/Gauge'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'

export interface MountedGaugeProps {
  /** The point on the pipe's axis (or surface) it is mounted on. */
  on: Vec3
  /** Which way it stands off the pipe. */
  side: 'up' | 'down' | 'front'
  /** The pipe's radius at `on`; 0 when `on` is already on its surface. */
  pipeRadius?: number
  /** The stem's length, from the pipe's surface to the gauge. */
  stem: number
  radius: number
  reading?: number
  face?: string
  needle?: string
  drive?: GaugeDrive
  /** The stem's thickness. */
  rod?: number
  /** A square fitting instead of a stem, the gauge sitting a little forward on it. */
  block?: boolean
}

/** Where a mounted gauge's dial sits, and where its stem reaches it. */
function placement({ on, side, pipeRadius = 0, stem, radius, block }: MountedGaugeProps) {
  const [x, y, z] = on
  if (side === 'front') {
    const at: Vec3 = [x, y, z + pipeRadius + stem]
    return { at, stemEnd: at }
  }
  const sign = side === 'up' ? 1 : -1
  const reach = pipeRadius + stem
  const at: Vec3 = [x, y + sign * (reach + radius), z + (block ? 0.04 : 0)]
  return { at, stemEnd: [x, y + sign * reach, z] as Vec3 }
}

/** A gauge mounted on a pipe, on a short stem (or a square fitting). */
export function MountedGauge(props: MountedGaugeProps) {
  const {
    on,
    pipeRadius = 0,
    stem,
    radius,
    reading,
    face,
    needle,
    drive,
    rod = 0.012,
    block,
  } = props
  const { at, stemEnd } = placement(props)
  return (
    <group>
      {block ? (
        <ToonMesh
          position={[on[0], on[1] + pipeRadius + stem / 2, on[2] + 0.02]}
          color={palette.copperGrey}
        >
          <boxGeometry args={[0.05, stem + 0.02, 0.06]} />
        </ToonMesh>
      ) : (
        <Rod from={on} to={stemEnd} radius={rod} color={palette.copperGrey} />
      )}
      <Gauge
        position={at}
        radius={radius}
        reading={reading}
        face={face}
        needle={needle}
        drive={drive}
      />
    </group>
  )
}

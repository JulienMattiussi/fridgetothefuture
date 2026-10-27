import type { ThreeElements } from '@react-three/fiber'
import { useMemo } from 'react'
import { dialDesign, dialTicks } from '@/lib/gaugeDial'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'

type GaugeProps = ThreeElements['group'] & {
  radius?: number
  /** Needle angle in radians, 0 pointing up, positive clockwise. */
  reading?: number
  /** Dial color; a dark dial takes light markings. */
  face?: string
  needle?: string
}

/** Clockwise-from-up angles to a ring's counterclockwise-from-right theta. */
const theta = (angle: number) => Math.PI / 2 - angle

/**
 * A pressure gauge in a coppery grey rim, facing +Z. Its dial (graduations,
 * red zone, rings, needle) comes from its size, and no two gauges in the
 * machine have the same size: so no two share a dial.
 */
export function Gauge({
  radius = 0.1,
  reading = -0.8,
  face = palette.dial,
  needle = palette.ink,
  ...props
}: GaugeProps) {
  const design = useMemo(() => dialDesign(Math.round(radius * 10000)), [radius])
  const ticks = useMemo(() => dialTicks(design), [design])
  const r = radius
  // Markings lie just proud of the face, one layer above another.
  const front = r * 0.2
  const layer = (n: number) => front + 0.001 * n
  const low = theta(design.sweep / 2)
  return (
    <group {...props}>
      <ToonMesh rotation={[Math.PI / 2, 0, 0]} color={face}>
        <cylinderGeometry args={[r, r, r * 0.4, 40]} />
      </ToonMesh>
      <ToonMesh position={[0, 0, front]} color={palette.copperGrey}>
        <torusGeometry args={[r, r * design.bezel, 10, 40]} />
      </ToonMesh>
      {/* The scale's arc, and its red zone at the high end. */}
      <ToonMesh position={[0, 0, layer(1)]} color={needle} outline={0}>
        <ringGeometry args={[r * 0.86, r * 0.88, 40, 1, low, design.sweep]} />
      </ToonMesh>
      {design.redFrom < 1 && (
        <ToonMesh position={[0, 0, layer(2)]} color={palette.dialRed} outline={0}>
          <ringGeometry
            args={[r * 0.72, r * 0.84, 24, 1, low, design.sweep * (1 - design.redFrom)]}
          />
        </ToonMesh>
      )}
      {ticks.map(({ angle, major }) => {
        const length = r * (major ? 0.16 : 0.08)
        const at = r * 0.86 - length / 2
        return (
          <ToonMesh
            key={angle}
            position={[Math.sin(angle) * at, Math.cos(angle) * at, layer(3)]}
            rotation={[0, 0, -angle]}
            color={needle}
            outline={0}
          >
            <boxGeometry args={[r * (major ? 0.035 : 0.018), length, 0.001]} />
          </ToonMesh>
        )
      })}
      {design.innerRing && (
        <ToonMesh position={[0, 0, layer(1)]} color={needle} outline={0}>
          <ringGeometry args={[r * 0.46, r * 0.48, 32]} />
        </ToonMesh>
      )}
      {design.subDial && (
        <group position={[0, -r * 0.42, layer(1)]}>
          <ToonMesh color={needle} outline={0}>
            <ringGeometry args={[r * 0.15, r * 0.17, 24]} />
          </ToonMesh>
          <ToonMesh
            position={[0, r * 0.06, 0.001]}
            rotation={[0, 0, reading * 2]}
            color={needle}
            outline={0}
          >
            <boxGeometry args={[r * 0.02, r * 0.12, 0.001]} />
          </ToonMesh>
        </group>
      )}
      <group position={[0, 0, layer(5)]} rotation={[0, 0, -reading]}>
        <ToonMesh position={[0, r * 0.35, 0]} color={needle} outline={0}>
          <boxGeometry args={[r * 0.05, r * 0.7, r * 0.02]} />
        </ToonMesh>
        {design.needle === 'arrow' && (
          <ToonMesh position={[0, r * 0.68, 0]} color={needle} outline={0}>
            <coneGeometry args={[r * 0.07, r * 0.16, 3]} />
          </ToonMesh>
        )}
        {design.needle === 'spade' && (
          <ToonMesh
            position={[0, r * 0.52, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            color={needle}
            outline={0}
          >
            <cylinderGeometry args={[r * 0.07, r * 0.07, r * 0.02, 16]} />
          </ToonMesh>
        )}
      </group>
      <ToonMesh
        position={[0, 0, layer(6)]}
        rotation={[Math.PI / 2, 0, 0]}
        color={palette.copperGrey}
        outline={0}
      >
        <cylinderGeometry args={[r * 0.08, r * 0.08, r * 0.04, 16]} />
      </ToonMesh>
    </group>
  )
}

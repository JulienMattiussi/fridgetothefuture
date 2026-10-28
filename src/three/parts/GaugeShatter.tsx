import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { DoubleSide, type Group, type Mesh } from 'three'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'

const SHARDS = 9
const CRACKS = 6

interface GaugeShatterProps {
  /** The gauge's radius, the face's height off its middle, and its delay before bursting. */
  radius: number
  front: number
  delay: number
}

/**
 * A gauge's glass bursting as the gauges blow (the `gaugesBurst` breakdown):
 * cracks shoot across the dial, and shards of glass fly off and fall.
 */
export function GaugeShatter({ radius: r, front, delay }: GaugeShatterProps) {
  const sequence = useSequence()
  const group = useRef<Group>(null)
  const shards = useRef<(Mesh | null)[]>([])
  // Each shard's own way out, speed and spin; each crack's angle and length.
  const flights = useMemo(
    () =>
      Array.from({ length: SHARDS }, (_, i) => ({
        angle: i * 2.39996 + r,
        speed: 0.4 + ((i * 0.618 + r * 7) % 0.6),
        spin: 6 + ((i * 3.7) % 9),
      })),
    [r],
  )
  const cracks = useMemo(
    () =>
      Array.from({ length: CRACKS }, (_, i) => ({
        angle: (i / CRACKS) * Math.PI * 2 + ((i * 1.3 + r * 11) % 0.8),
        length: r * (0.5 + ((i * 0.618) % 0.4)),
      })),
    [r],
  )
  useFrame(() => {
    const failure = sequence?.readouts.failure
    const t = failure?.kind === 'gaugesBurst' ? failure.since - delay : -1
    if (group.current) group.current.visible = t > 0
    if (t <= 0) return
    shards.current.forEach((shard, i) => {
      const flight = flights[i]
      if (!shard || !flight) return
      const out = flight.speed * t
      shard.position.set(
        Math.cos(flight.angle) * (r * 0.5 + out),
        Math.sin(flight.angle) * (r * 0.5 + out) - 4.9 * t * t,
        0.6 * t,
      )
      shard.rotation.set(flight.spin * t, flight.spin * 0.7 * t, flight.angle)
    })
  })
  return (
    <group ref={group} position={[0, 0, front]} visible={false}>
      {/* The cracks across the dial, from a point off its middle. */}
      <group position={[r * 0.15, r * 0.1, 0]}>
        {cracks.map(({ angle, length }) => (
          <ToonMesh
            key={angle}
            position={[(Math.cos(angle) * length) / 2, (Math.sin(angle) * length) / 2, 0]}
            rotation={[0, 0, angle]}
            color={palette.ink}
            outline={0}
          >
            <boxGeometry args={[length, r * 0.025, 0.001]} />
          </ToonMesh>
        ))}
      </group>
      {flights.map(({ angle }, i) => (
        <ToonMesh
          key={angle}
          ref={(mesh) => {
            shards.current[i] = mesh
          }}
          color={palette.glass}
          opacity={0.75}
          side={DoubleSide}
          outline={1}
        >
          <circleGeometry args={[r * (0.12 + 0.06 * (i % 3)), 3]} />
        </ToonMesh>
      ))}
    </group>
  )
}

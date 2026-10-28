import { useFrame, type ThreeElements } from '@react-three/fiber'
import { useRef } from 'react'
import { DoubleSide, type Group, Shape } from 'three'
import { useSequence } from '@/three/sequence/context'

type FlameProps = ThreeElements['group'] & {
  height: number
  /** How fast it dances, and where in its dance it starts. */
  rate: number
  phase?: number
}

/**
 * A tongue of flame, flat, unit high, its base on the origin: a round belly
 * drawn up to a tip curling a little to the left.
 */
const tongue = (() => {
  const shape = new Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(0.34, 0, 0.42, 0.32, 0.2, 0.58)
  shape.quadraticCurveTo(0.06, 0.78, -0.04, 1)
  shape.quadraticCurveTo(0.0, 0.74, -0.16, 0.58)
  shape.bezierCurveTo(-0.4, 0.34, -0.34, 0, 0, 0)
  return shape
})()

/** Outside in: red, orange, then a yellow heart, each a little smaller and lower. */
const LAYERS = [
  { color: '#d9481c', scale: 1 },
  { color: '#ff8a2a', scale: 0.76 },
  { color: '#ffd04a', scale: 0.5 },
]

/**
 * A cartoon flame facing +Z: three nested tongues, red to yellow, that
 * stretch, swell and sway, each flame to its own beat.
 */
export function Flame({ height, rate, phase = 0, ...props }: FlameProps) {
  const sequence = useSequence()
  const flame = useRef<Group>(null)
  useFrame(() => {
    if (!flame.current) return
    const t = (sequence?.time ?? 0) * rate + phase
    const stretch = 0.85 + 0.15 * Math.sin(t) + 0.08 * Math.sin(2.7 * t + 1)
    flame.current.scale.set(height * (1.05 - 0.2 * stretch), height * stretch, 1)
    flame.current.rotation.z = 0.12 * Math.sin(0.8 * t + 2)
  })
  return (
    <group {...props}>
      <group ref={flame}>
        {LAYERS.map(({ color, scale }, i) => (
          <mesh key={color} position={[0, 0, 0.001 * i]} scale={[scale, scale, 1]}>
            <shapeGeometry args={[tongue, 12]} />
            <meshBasicMaterial color={color} side={DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

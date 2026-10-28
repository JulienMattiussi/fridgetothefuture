import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh, MeshBasicMaterial, PointLight } from 'three'
import { stoking } from '@/lib/stoking'
import { palette } from '@/three/palette'
import { Flame } from '@/three/parts/Flame'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'
import { layout } from '@/three/machine/layout'

const { stove } = layout
/** The fire door: its size, and the stove's front face where it hangs. */
const DOOR = { width: 0.2, height: 0.16, thickness: 0.025 }
const FRONT = stove.z + stove.radius
const FIRE = '#ff8a2a'
/** How far the door swings open, in radians. */
const SWING = 1.9
/** The flames in the fire box, overlapping: across, height, and their own dance. */
const FLAMES = [
  { x: -0.055, height: 0.1, rate: 9, phase: 0 },
  { x: 0.03, height: 0.11, rate: 11, phase: 2 },
  { x: -0.015, height: 0.13, rate: 13, phase: 4 },
  { x: 0.065, height: 0.08, rate: 10, phase: 1 },
]
const EMBERS = [
  { x: -0.04, width: 0.08, color: '#a3321c' },
  { x: 0.045, width: 0.07, color: '#c4421c' },
]
/**
 * The stove's fire door, hinged on its left: it swings open as each log goes
 * in, showing the flames dancing on the embers in the fire box, then shuts.
 * Lit, the gap under it glows and flickers, lighting the floor round it.
 */
export function FireDoor() {
  const sequence = useSequence()
  const door = useRef<Group>(null)
  const fireBox = useRef<Group>(null)
  const glow = useRef<Mesh>(null)
  const light = useRef<PointLight>(null)
  /** The logs in, and when the last one went in (sequence time). */
  const loaded = useRef({ logs: 0, at: -Infinity })
  useFrame(() => {
    if (!sequence) return
    const { fire } = sequence.readouts
    const logs = sequence.readouts.logs.length
    const t = sequence.time
    if (logs !== loaded.current.logs) {
      loaded.current = { logs, at: logs > loaded.current.logs ? t : -Infinity }
    }
    const open = stoking(t - loaded.current.at).door
    if (door.current) door.current.rotation.y = -open * SWING
    const flicker = 0.75 + 0.15 * Math.sin(t * 17) + 0.1 * Math.sin(t * 41 + 1)
    if (fireBox.current) fireBox.current.visible = logs > 0 && open > 0
    if (glow.current) {
      glow.current.visible = fire > 0 && open === 0
      ;(glow.current.material as MeshBasicMaterial).opacity = fire * flicker
    }
    if (light.current) light.current.intensity = 3 * Math.max(fire, open * 0.6) * flicker
  })
  return (
    <group position={[stove.x, stove.doorY, 0]}>
      {/* The fire box's mouth, dark, and the flames in it. */}
      <mesh position={[0, 0, FRONT + 0.004]}>
        <planeGeometry args={[DOOR.width * 0.9, DOOR.height * 0.9]} />
        <meshBasicMaterial color={palette.ink} />
      </mesh>
      <group ref={fireBox} position={[0, -DOOR.height * 0.42, FRONT + 0.006]} visible={false}>
        {/* The embers they rise from, glowing on the fire box's floor. */}
        {EMBERS.map(({ x, width, color }) => (
          <mesh key={x} position={[x, 0.008, 0]}>
            <planeGeometry args={[width, 0.018]} />
            <meshBasicMaterial color={color} />
          </mesh>
        ))}
        {FLAMES.map(({ x, height, rate, phase }) => (
          <Flame key={x} position={[x, 0.01, 0.002]} height={height} rate={rate} phase={phase} />
        ))}
      </group>
      <group ref={door} position={[-DOOR.width / 2, 0, FRONT + 0.012 + DOOR.thickness / 2]}>
        <ToonMesh position={[DOOR.width / 2, 0, 0]} color={palette.iron}>
          <boxGeometry args={[DOOR.width, DOOR.height, DOOR.thickness]} />
        </ToonMesh>
        {/* Its latch, on the free edge. */}
        <ToonMesh
          position={[DOOR.width - 0.03, 0, DOOR.thickness / 2 + 0.01]}
          color={palette.steel}
        >
          <boxGeometry args={[0.02, 0.05, 0.02]} />
        </ToonMesh>
      </group>
      <mesh ref={glow} position={[0, -DOOR.height / 2 - 0.006, FRONT + 0.03]} visible={false}>
        <planeGeometry args={[DOOR.width * 0.8, 0.012]} />
        <meshBasicMaterial color={FIRE} transparent />
      </mesh>
      <pointLight
        ref={light}
        position={[0, 0, FRONT + 0.3]}
        color={FIRE}
        intensity={0}
        distance={2.5}
      />
    </group>
  )
}

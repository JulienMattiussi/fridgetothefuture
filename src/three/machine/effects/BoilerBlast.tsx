import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh, MeshBasicMaterial, PointLight } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'
import { Burst } from '@/three/machine/effects/Burst'

const FIRE = ['#fff3b0', '#ffd04a', '#ff9a2a', '#e8541c']
const FLASH = '#ffb347'
/** The fireball's reach and life, in meters and seconds. */
const FIREBALL = { count: 16, reach: 0.9, life: 1.1 }
const PLATES = 14
const GRAVITY = 9.8
const ignorePointer = () => {}

/** A seeded spread in [0, 1): the same blast every time. */
const spread = (i: number, k: number) => (Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1

/**
 * The boiler blowing up (the `boilerExplodes` breakdown): a white-hot flash,
 * a fireball swelling and dying, the rusted shell's plates flung out, tumbling
 * down to the floor, and steam then black smoke rolling out.
 */
export function BoilerBlast({ at }: { at: Vec3 }) {
  const sequence = useSequence()
  const group = useRef<Group>(null)
  const light = useRef<PointLight>(null)
  const fire = useRef<(Mesh | null)[]>([])
  const plates = useRef<(Mesh | null)[]>([])
  // Each plate's own flight: out and up, and its tumble.
  const flights = useMemo(
    () =>
      Array.from({ length: PLATES }, (_, i) => {
        const angle = (i / PLATES) * Math.PI * 2 + Math.abs(spread(i, 1))
        const speed = 2.5 + 2.5 * Math.abs(spread(i, 2))
        return {
          vx: Math.cos(angle) * speed,
          vz: Math.sin(angle) * speed * 0.7 + 1,
          vy: 2 + 4 * Math.abs(spread(i, 3)),
          spin: [8 * spread(i, 4), 8 * spread(i, 5), 8 * spread(i, 6)] as Vec3,
        }
      }),
    [],
  )
  useFrame(() => {
    const failure = sequence?.readouts.failure
    const t = failure?.kind === 'boilerExplodes' ? failure.since : -1
    if (group.current) group.current.visible = t >= 0
    if (t < 0) return
    if (light.current) light.current.intensity = 60 * Math.exp(-t * 5)
    fire.current.forEach((ball, i) => {
      if (!ball) return
      const p = Math.min(1, t / FIREBALL.life)
      ball.visible = p < 1
      const dir: Vec3 = [spread(i, 7), Math.abs(spread(i, 8)) * 0.8 + 0.2, spread(i, 9)]
      const out = FIREBALL.reach * Math.sqrt(p)
      ball.position.set(dir[0] * out, dir[1] * out, dir[2] * out)
      ball.scale.setScalar(0.6 + 3 * p)
      ;(ball.material as MeshBasicMaterial).opacity = 1 - p
    })
    plates.current.forEach((plate, i) => {
      const flight = flights[i]
      if (!plate || !flight) return
      // Flung out, then down to the floor, where it lies flat.
      const landing = (flight.vy + Math.sqrt(flight.vy ** 2 + 2 * GRAVITY * at[1])) / GRAVITY
      const s = Math.min(t, landing)
      const y = at[1] + flight.vy * s - (GRAVITY / 2) * s * s
      plate.position.set(at[0] + flight.vx * s, Math.max(0.01, y), at[2] + flight.vz * s)
      if (t < landing) plate.rotation.set(...(flight.spin.map((w) => w * s) as Vec3))
      else plate.rotation.set(-Math.PI / 2, 0, flight.spin[1])
    })
  })
  return (
    <group>
      <group ref={group} visible={false}>
        <pointLight ref={light} position={at} color={FLASH} intensity={0} distance={8} />
        <group position={at}>
          {Array.from({ length: FIREBALL.count }, (_, i) => (
            <mesh
              key={i}
              ref={(mesh) => {
                fire.current[i] = mesh
              }}
              raycast={ignorePointer}
            >
              <sphereGeometry args={[0.12, 14, 10]} />
              <meshBasicMaterial color={FIRE[i % FIRE.length]} transparent depthWrite={false} />
            </mesh>
          ))}
        </group>
        {flights.map((_, i) => (
          <ToonMesh
            key={i}
            ref={(mesh) => {
              plates.current[i] = mesh
            }}
            color={i % 3 ? palette.rust : palette.rustDark}
            raycast={ignorePointer}
          >
            <boxGeometry args={[0.16 + 0.08 * (i % 3), 0.2, 0.015]} />
          </ToonMesh>
        ))}
      </group>
      {/* Steam first, white and fast; then black smoke, rolling slowly. */}
      <Burst
        on="boilerExplodes"
        at={at}
        count={40}
        reach={2}
        size={2.5}
        life={2.2}
        colors={['#ffffff', '#ece8de', '#d9d4c8']}
      />
      <Burst
        on="boilerExplodes"
        at={[at[0], at[1] + 0.3, at[2]]}
        count={30}
        reach={1.4}
        size={3.5}
        life={6}
        colors={['#3a3430', '#4f4843', '#2a2522']}
      />
    </group>
  )
}

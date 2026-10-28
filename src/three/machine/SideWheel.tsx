import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { type Group, Plane, Raycaster, Vector2, Vector3 } from 'three'
import type { Readouts } from '@/lib/sequence'
import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Pipe } from '@/three/parts/Pipe'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { Wheel } from '@/three/parts/Wheel'
import { useSequence } from '@/three/sequence/context'
import { Handle } from '@/three/sequence/Handle'
import { PuffStream } from '@/three/machine/effects/PuffStream'
import { VALVE_GEAR_Z, VALVE_LINE_X, VALVE_LINE_Z } from '@/three/machine/layout'

/**
 * A small valve right of the gear column (docs/references/video-roue-de-vanne.jpg):
 * its body on a pipe against the frame's plank, teeing into the small valve's
 * line on the right, its handwheel out in front on a long spindle. It plays no part: turned, the wheel
 * comes off in the hand, the spindle leaks, and let go, the wheel drops.
 */
const BODY: Vec3 = [2.13, 1.27, VALVE_LINE_Z]
const PIPE = 0.022
const AT: Vec3 = [BODY[0], BODY[1], VALVE_GEAR_Z + 0.11]
const RADIUS = 0.065
/** How far toward the viewer it comes, off the spindle, if not held. */
const OFF = 0.35
const leaking = ({ failure }: Readouts) => (failure?.kind === 'wheelOff' ? 1 : 0)

export function SideWheel() {
  const sequence = useSequence()
  const { camera, gl } = useThree()
  const wheel = useRef<Group>(null)
  /** The pointer on the page, and whether a button is down. */
  const pointer = useRef({ x: 0, y: 0, down: false })
  /** Once off: whether still in the hand, and where and when it was let go. */
  const off = useRef<{ held: boolean; from: Vector3; at: number } | null>(null)
  useEffect(() => {
    const track = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY, down: e.buttons !== 0 }
    }
    const up = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY, down: false }
    }
    window.addEventListener('pointermove', track)
    window.addEventListener('pointerdown', track)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', track)
      window.removeEventListener('pointerdown', track)
      window.removeEventListener('pointerup', up)
    }
  }, [])
  /** The point under the pointer on the plane square to the view, `OFF` in front of the wheel. */
  const underPointer = () => {
    const rect = gl.domElement.getBoundingClientRect()
    const ndc = new Vector2(
      ((pointer.current.x - rect.left) / rect.width) * 2 - 1,
      1 - ((pointer.current.y - rect.top) / rect.height) * 2,
    )
    const raycaster = new Raycaster()
    raycaster.setFromCamera(ndc, camera)
    const plane = new Plane().setFromNormalAndCoplanarPoint(
      camera.getWorldDirection(new Vector3()).negate(),
      new Vector3(AT[0], AT[1], AT[2] + OFF),
    )
    return raycaster.ray.intersectPlane(plane, new Vector3())
  }
  useFrame(() => {
    if (!wheel.current || !sequence) return
    const { sideWheel, failure } = sequence.readouts
    const w = wheel.current
    if (failure?.kind !== 'wheelOff') {
      off.current = null
      w.position.set(...AT)
      w.rotation.set(0, 0, sideWheel * 2 * Math.PI)
      return
    }
    // Off the spindle: in the hand while the button is held (or just out in
    // front, without a mouse), then dropping to the floor and lying there.
    const t = failure.since
    off.current ??= {
      held: pointer.current.down,
      from: new Vector3(AT[0] + 0.08, AT[1] + 0.12, AT[2] + OFF),
      at: 0,
    }
    const state = off.current
    if (state.held) {
      const hand = pointer.current.down ? underPointer() : null
      if (hand) {
        w.position.copy(hand)
        w.rotation.set(0.4, -0.3, t * 0.5)
        return
      }
      state.held = false
      state.from = w.position.clone()
      state.at = t
    }
    const fall = Math.max(0, t - Math.max(state.at, 0.3))
    const y = Math.max(RADIUS * 0.3, state.from.y - 4.9 * fall * fall)
    const landed = y <= RADIUS * 0.3
    w.position.set(state.from.x, y, state.from.z)
    w.rotation.set(landed ? -Math.PI / 2 : 0.4 + fall * 6, -0.3, fall * 3)
  })
  return (
    <group>
      {/* The valve's body on its pipe, teeing into the line on the right. */}
      <Pipe points={[BODY, [VALVE_LINE_X - PIPE, BODY[1], BODY[2]]]} radius={PIPE} />
      <ToonMesh position={BODY} rotation={[Math.PI / 2, 0, 0]} color={palette.iron}>
        <cylinderGeometry args={[0.035, 0.035, 0.08, 16]} />
      </ToonMesh>
      <Rod from={BODY} to={AT} radius={0.009} color={palette.steel} />
      <Handle actions={['turnSideWheel']}>
        <Wheel
          ref={wheel}
          grip
          position={AT}
          radius={RADIUS}
          spokes={4}
          tire={false}
          color={palette.iron}
        />
      </Handle>
      {/* The leak out of the bare spindle: steam, and water dripping. */}
      <PuffStream
        at={AT}
        count={30}
        life={0.8}
        color={['#ffffff', '#f4f1ea', '#e4e1d8']}
        opacity={0.9}
        fadeFrom={0.5}
        strength={leaking}
        puff={(i, age) => {
          const angle = i * 2.39996
          const fan = 0.1 * age
          return {
            position: [
              0.5 * age + Math.cos(angle) * fan,
              0.3 * age + Math.sin(angle) * fan,
              0.2 * age,
            ],
            scale: 0.2 + 1.6 * age,
          }
        }}
      />
      <PuffStream
        at={AT}
        count={20}
        life={0.7}
        color={['#9cc3e0', '#7fb0d6']}
        opacity={0.9}
        fadeFrom={0.7}
        strength={leaking}
        puff={(i, age) => ({
          position: [0.03 * Math.sin(i * 2.3), -1.2 * age * age, 0.05 * Math.cos(i * 1.7)],
          scale: 0.1,
        })}
      />
    </group>
  )
}

import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { type PerspectiveCamera, Vector3 } from 'three'
import { fitDistance } from '@/lib/framing'
import { useSequence } from '@/three/sequence/context'
import { CLOSE_UPS, FRAME } from '@/three/viewFrame'

const FOV = 40
/** How long the view takes to close in or back off, roughly, in seconds. */
const EASE = 0.5

/**
 * A fixed, straight-on view, like a point-and-click scene: no orbiting. The
 * camera backs off as the window narrows so the machine always fits. At some
 * steps (the sequence's `closeUp`) it closes in a little: on the vat's top up
 * the ladder, on the basin for the ice cube. `still` keeps it put, for the
 * inspection orbit.
 */
export function FrontCamera({ still = false }: { still?: boolean }) {
  const get = useThree((state) => state.get)
  const { width, height } = useThree((state) => state.size)
  const sequence = useSequence()
  /**
   * Where the camera stands and looks for the whole view; then how far it has
   * closed in (0 to 1), on what, and by how much.
   */
  const base = useRef({ at: new Vector3(), look: new Vector3() })
  const shot = useRef({ k: 0, focus: new Vector3(), zoom: 0, rise: 0 })

  useLayoutEffect(() => {
    // Read here, not from a hook's value: three.js cameras are mutated in place.
    const camera = get().camera as PerspectiveCamera
    const distance = fitDistance(FRAME, FOV, width / height)
    base.current.at.set(FRAME.centerX, FRAME.centerY, FRAME.front + distance)
    base.current.look.set(FRAME.centerX, FRAME.centerY, FRAME.front)
    camera.fov = FOV
    camera.position.copy(base.current.at)
    camera.lookAt(base.current.look)
    camera.updateProjectionMatrix()
  }, [get, width, height])

  useFrame(({ camera }, dt) => {
    if (still || !sequence) return
    const view = shot.current
    const closeUp = sequence.readouts.closeUp
    const goal = closeUp === 'none' ? null : CLOSE_UPS[closeUp]
    const goalK = goal ? 1 : 0
    if (view.k === goalK && (!goal || view.focus.equals(new Vector3(...goal.focus)))) return
    const step = 1 - Math.exp(-dt / EASE)
    // Backing off keeps the last focus; closing in eases over to the new one.
    if (goal) {
      view.focus.lerp(new Vector3(...goal.focus), step)
      view.zoom += (goal.zoom - view.zoom) * step
      view.rise += (goal.rise - view.rise) * step
    }
    view.k += (goalK - view.k) * step
    if (Math.abs(goalK - view.k) < 0.001) {
      view.k = goalK
      if (goal) view.focus.set(...goal.focus)
    }
    const { at, look } = base.current
    const near = view.focus.clone()
    near.z += (at.z - near.z) * (1 - view.zoom)
    near.y += view.rise
    camera.position.lerpVectors(at, near, view.k)
    camera.lookAt(look.clone().lerp(view.focus, view.k))
  })

  return null
}

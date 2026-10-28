import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { type PerspectiveCamera, Vector3 } from 'three'
import { fitDistance } from '@/lib/framing'
import { useSequence } from '@/three/sequence/context'
import { CLOSE_UPS, FRAME } from '@/three/viewFrame'

const FOV = 40

/** A glide of the free camera from one shot to another, `t` from 0 to 1. */
interface Glide {
  closeUp: string
  from: { at: Vector3; look: Vector3 }
  to: { at: Vector3; look: Vector3 }
  t: number
}
/** How long the view takes to close in or back off, roughly, in seconds. */
const EASE = 0.5

/**
 * A fixed, straight-on view, like a point-and-click scene: no orbiting. The
 * camera backs off as the window narrows so the machine always fits. At some
 * steps (the sequence's `closeUp`) it closes in a little: on the vat's top up
 * the ladder, on the basin for the ice cube. In the free view (`free`), the
 * visitor turns it round; it only glides over to each close-up as it comes,
 * and back to the whole view after.
 */
export function FrontCamera({ free = false }: { free?: boolean }) {
  const get = useThree((state) => state.get)
  const { width, height } = useThree((state) => state.size)
  const sequence = useSequence()
  /**
   * Where the camera stands and looks for the whole view; then how far it has
   * closed in (0 to 1), on what, and by how much.
   */
  const base = useRef({ at: new Vector3(), look: new Vector3() })
  const shot = useRef<{
    k: number
    focus: Vector3
    zoom: number
    rise: number
    /** In the free view: the last close-up glided to, and the glide under way. */
    glide: Glide | null
  }>({ k: 0, focus: new Vector3(), zoom: 0, rise: 0, glide: null })

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
    // Back from the free view: the closing in starts over from the whole view.
    shot.current.k = 0
    shot.current.glide = null
  }, [get, width, height, free])

  /** Where the camera stands and looks for a close-up, or the whole view. */
  const shotFor = (closeUp: keyof typeof CLOSE_UPS | 'none') => {
    const { at, look } = base.current
    if (closeUp === 'none') return { at: at.clone(), look: look.clone() }
    const { focus, zoom, rise } = CLOSE_UPS[closeUp]
    const target = new Vector3(...focus)
    const stand = target.clone()
    stand.z += (at.z - target.z) * (1 - zoom)
    stand.y += rise
    return { at: stand, look: target }
  }

  useFrame(({ camera }, dt) => {
    if (!sequence) return
    if (free) {
      const controls = get().controls as { target: Vector3; update: () => void } | null
      if (!controls) return
      const closeUp = sequence.readouts.closeUp
      const view = shot.current
      if (closeUp !== (view.glide?.closeUp ?? 'none')) {
        view.glide = {
          closeUp,
          from: { at: camera.position.clone(), look: controls.target.clone() },
          to: shotFor(closeUp),
          t: 0,
        }
      }
      const g = view.glide
      if (!g || g.t >= 1) return
      g.t = Math.min(1, g.t + dt / (EASE * 2))
      const e = g.t * g.t * (3 - 2 * g.t)
      camera.position.lerpVectors(g.from.at, g.to.at, e)
      controls.target.lerpVectors(g.from.look, g.to.look, e)
      controls.update()
      return
    }
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

import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { type PerspectiveCamera, Vector3 } from 'three'
import { fitDistance } from '@/lib/framing'
import type { Readouts } from '@/lib/readouts'
import { useSequence } from '@/three/sequence/context'
import { CLOSE_UPS, FRAME } from '@/three/viewFrame'

const FOV = 40
/** How long the view takes to glide in or back out, in seconds. */
const GLIDE = 1

/** Where the camera stands, and the point it looks at. */
interface Shot {
  at: Vector3
  look: Vector3
}

/** A glide from one shot to the next, `t` running 0 to 1. */
interface Glide {
  closeUp: Readouts['closeUp']
  from: Shot
  to: Shot
  t: number
}

/**
 * A fixed, straight-on view, like a point-and-click scene: no orbiting. The
 * camera backs off as the window narrows so the machine always fits. At some
 * steps (the sequence's `closeUp`) it glides in a little: on the vat's top up
 * the ladder, on the basin for the ice cube; and back out after. In the free
 * view (`free`), the visitor turns it round in between.
 */
export function FrontCamera({ free = false }: { free?: boolean }) {
  const get = useThree((state) => state.get)
  const { width, height } = useThree((state) => state.size)
  const sequence = useSequence()
  /** The whole view, and where the camera looks now (the free view's target). */
  const whole = useRef<Shot>({ at: new Vector3(), look: new Vector3() })
  const looking = useRef(new Vector3())
  const glide = useRef<Glide | null>(null)

  useLayoutEffect(() => {
    // Read here, not from a hook's value: three.js cameras are mutated in place.
    const camera = get().camera as PerspectiveCamera
    const distance = fitDistance(FRAME, FOV, width / height)
    whole.current.at.set(FRAME.centerX, FRAME.centerY, FRAME.front + distance)
    whole.current.look.set(FRAME.centerX, FRAME.centerY, FRAME.front)
    camera.fov = FOV
    camera.position.copy(whole.current.at)
    camera.lookAt(whole.current.look)
    camera.updateProjectionMatrix()
    looking.current.copy(whole.current.look)
    // Back to the whole view: any close-up starts over from there.
    glide.current = null
  }, [get, width, height, free])

  /** The shot for a close-up, from the whole view: closer by its zoom, higher by its rise. */
  const shotFor = (closeUp: Readouts['closeUp']): Shot => {
    const { at, look } = whole.current
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
    // The free view's controls hold the point it turns round: they look for it.
    const controls = free
      ? (get().controls as { target: Vector3; update: () => void } | null)
      : null
    const look = controls?.target ?? looking.current
    const closeUp = sequence.readouts.closeUp
    if (closeUp !== (glide.current?.closeUp ?? 'none')) {
      glide.current = {
        closeUp,
        from: { at: camera.position.clone(), look: look.clone() },
        to: shotFor(closeUp),
        t: 0,
      }
    }
    const g = glide.current
    if (!g || g.t >= 1) return
    g.t = Math.min(1, g.t + dt / GLIDE)
    const e = g.t * g.t * (3 - 2 * g.t)
    camera.position.lerpVectors(g.from.at, g.to.at, e)
    look.lerpVectors(g.from.look, g.to.look, e)
    if (controls) controls.update()
    else camera.lookAt(look)
  })

  return null
}

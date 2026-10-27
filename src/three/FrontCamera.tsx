import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { PerspectiveCamera } from 'three'
import { fitDistance } from '@/lib/framing'
import { FRAME } from '@/three/viewFrame'

const FOV = 40

/**
 * A fixed, straight-on view, like a point-and-click scene: no orbiting. The
 * camera backs off as the window narrows so the machine always fits.
 */
export function FrontCamera() {
  const get = useThree((state) => state.get)
  const { width, height } = useThree((state) => state.size)

  useLayoutEffect(() => {
    // Read here, not from a hook's value: three.js cameras are mutated in place.
    const camera = get().camera as PerspectiveCamera
    const distance = fitDistance(FRAME, FOV, width / height)
    camera.fov = FOV
    camera.position.set(FRAME.centerX, FRAME.centerY, FRAME.front + distance)
    camera.lookAt(FRAME.centerX, FRAME.centerY, FRAME.front)
    camera.updateProjectionMatrix()
  }, [get, width, height])

  return null
}

import { type Camera, Plane, Raycaster, Vector2, Vector3 } from 'three'

/** Where a world point falls on the page, in client pixels. */
export function toScreen(point: Vector3, camera: Camera, canvas: HTMLElement) {
  const ndc = point.clone().project(camera)
  const rect = canvas.getBoundingClientRect()
  return {
    x: rect.left + ((ndc.x + 1) / 2) * rect.width,
    y: rect.top + ((1 - ndc.y) / 2) * rect.height,
  }
}

/** Calls `move` on each pointer move and `end` on release, until released. */
function track(move: (e: PointerEvent) => void, end: (e: PointerEvent) => void) {
  const up = (e: PointerEvent) => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    end(e)
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}

/** Signed angle from `from` to `to`, wrapped into (-PI, PI]. */
const angleStep = (from: number, to: number) => {
  const step = (to - from) % (2 * Math.PI)
  return step > Math.PI ? step - 2 * Math.PI : step <= -Math.PI ? step + 2 * Math.PI : step
}

/**
 * Follows the pointer round `center` (client pixels) until released, reporting
 * each step in turns, counterclockwise positive.
 */
export function trackTurn(
  center: { x: number; y: number },
  turn: (turns: number) => void,
  end: () => void,
) {
  // Screen Y runs down: flip it, so counterclockwise comes out positive.
  const angleOf = (e: PointerEvent) => Math.atan2(center.y - e.clientY, e.clientX - center.x)
  let last: number | null = null
  track(
    (e) => {
      const angle = angleOf(e)
      if (last !== null) turn(angleStep(last, angle) / (2 * Math.PI))
      last = angle
    },
    () => end(),
  )
}

/**
 * Follows the pointer with a world point on the plane through `from`, square
 * to the view, and with the pointer in client pixels, until released; then
 * tells where it was let go.
 */
export function trackDrag(
  from: Vector3,
  camera: Camera,
  canvas: HTMLElement,
  move: (point: Vector3, at: { x: number; y: number }) => void,
  drop: (at: { x: number; y: number }) => void,
) {
  const plane = new Plane().setFromNormalAndCoplanarPoint(
    camera.getWorldDirection(new Vector3()).negate(),
    from,
  )
  const raycaster = new Raycaster()
  const point = new Vector3()
  track(
    (e) => {
      const rect = canvas.getBoundingClientRect()
      const ndc = new Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        1 - ((e.clientY - rect.top) / rect.height) * 2,
      )
      raycaster.setFromCamera(ndc, camera)
      if (raycaster.ray.intersectPlane(plane, point)) move(point, { x: e.clientX, y: e.clientY })
    },
    (e) => drop({ x: e.clientX, y: e.clientY }),
  )
}

export interface Frame {
  width: number
  height: number
}

/**
 * How far a front-facing camera must stand back so that a `frame` (in scene
 * units) fits entirely in view, whatever the window's shape.
 */
export function fitDistance(frame: Frame, fovDegrees: number, aspect: number): number {
  const halfTan = Math.tan((fovDegrees * Math.PI) / 360)
  const forHeight = frame.height / 2 / halfTan
  const forWidth = frame.width / 2 / (halfTan * aspect)
  return Math.max(forHeight, forWidth)
}

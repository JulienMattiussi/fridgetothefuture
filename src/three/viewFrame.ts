/** What the view must always show: the whole machine and a strip of floor. */
export const FRAME = { centerX: 0.55, centerY: 1.9, front: 1.1, width: 6.2, height: 4.5 }

/** The point the camera looks at, which the inspection orbit turns around. */
export const FRAME_CENTER = [FRAME.centerX, FRAME.centerY, FRAME.front] as const

import { layout } from '@/three/machine/layout'

/** What the view must always show: the whole machine and a strip of floor. */
export const FRAME = { centerX: 0.55, centerY: 1.9, front: 1.1, width: 6.2, height: 4.5 }

/** The point the camera looks at, which the inspection orbit turns around. */
export const FRAME_CENTER = [FRAME.centerX, FRAME.centerY, FRAME.front] as const

const { vat, ductMouth, bench, teaGlass } = layout
type Point = readonly [number, number, number]

/**
 * The close-ups: the point each closes in on, and how much of the way the
 * camera comes, 0 to 1. Up the ladder, the front of the vat's red cap, its
 * valve below; at the end, between the duct's mouth, the basin under it and
 * the glass of tea, for the ice cube's arrival.
 */
export const CLOSE_UPS: Record<'vat' | 'basin', { focus: Point; zoom: number }> = {
  vat: {
    focus: [vat.x, vat.y + vat.height + vat.cap.height / 2, vat.z + vat.cap.radius],
    zoom: 0.2,
  },
  basin: {
    focus: [(ductMouth[0] + teaGlass.x) / 2, (ductMouth[1] + bench.top) / 2, ductMouth[2]],
    zoom: 0.3,
  },
}

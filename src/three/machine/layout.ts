import type { Vec3 } from '@/lib/geometry'

/**
 * The machine's anchors, in meters (Y up, Z toward the viewer, X to the
 * right as seen in docs/references/machine-face.webp). Marty, about 1.75 m
 * tall in the frame, gives the scale. The parts meet at these points, so
 * moving one here keeps the pipes connected.
 */
export const layout = {
  /** The stable's back wall the machine leans against. */
  wallZ: -1.3,
  /** The front face of the wooden frame's posts. */
  frameFront: 0.25,
  /**
   * The plane where most pipes run: in front of the frame, as in the film
   * (docs/references/video-plan-large.jpg), not tucked behind it.
   */
  pipesZ: 0.45,
  /**
   * The two left wagon wheels share one axle, left-right, and the frame's two
   * front posts there stand on it: the wheels carry that part of the frame.
   */
  wheelAxle: { y: 0.45, z: 0.25, wheels: [-1.55, -0.45], radius: 0.45 },
  /** The upper wooden deck, left of the boiler, over the crank coil. */
  deckY: 2.55,
  deckLeft: -1.45,
  deckRight: -0.1,
  /** The right-hand shelf carrying the tanks. */
  shelfY: 2.2,
  /**
   * The huge grey vat on the right shelf, topped by a red tank (`cap`) where
   * the rising pipes end (docs/references/video-cuve.jpg). It stands at `y`,
   * on the shelf: a straight cylinder.
   */
  vat: {
    x: 2.4,
    y: 2.235,
    z: -0.42,
    radius: 0.85,
    height: 1.0,
    cap: { radius: 0.76, height: 0.8 },
  },
  /** The boiler stands on the workbench, the same table as the basin. */
  boiler: { x: 0.1, z: 0.3, radius: 0.36, bottom: 0.8, height: 0.8 },
  /**
   * The left stand with the coil unit, where Marty stands: a step ahead of the
   * rest, and no deeper than the blocks on it.
   */
  table: { left: -2.15, right: -0.8, back: 1.13, front: 1.57, top: 0.95 },
  /**
   * The coil unit on that table: its depth, its big black block on the left
   * (the long red pipe rises from the middle of its top), its grey block on
   * the right (the blue pipe enters its front), and how far the sliding
   * sleeve sits from the middle of the coil (left negative).
   */
  coilUnit: {
    z: 1.35,
    blackBlock: { left: -2.05, right: -1.6, height: 0.55 },
    greyBlock: { left: -1.2, right: -0.9, depth: 0.36 },
    slide: 0,
  },
  /** The workbench under the boiler, the basin and the glassware. */
  bench: { left: -0.32, right: 1.95, back: -0.12, front: 1.05, top: 0.8 },
  /**
   * The mouth of the cold-air duct, over the basin: the cold vapor gushes out
   * here and the ice cube drops from it (docs/references/video-conduit-froid.jpg).
   */
  ductMouth: [0.63, 1.22, 0.7] as Vec3,
}

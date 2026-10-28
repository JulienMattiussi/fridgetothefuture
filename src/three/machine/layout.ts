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
  wheelAxle: { y: 0.45, z: 0.7, wheels: [-2.05, -0.5], radius: 0.45 },
  /** The upper wooden deck, behind the coil unit. */
  deckY: 2.55,
  deckLeft: -1.95,
  deckRight: -0.6,
  /** The deck's posts, at its two edges: front ones on the wheel axle, back ones on the floor. */
  deckPosts: [-1.85, -0.7] as [number, number],
  /** The deck's front edge, its posts' front: brought forward of the rest of the frame. */
  deckFront: 0.7,
  /** The right-hand shelf carrying the tanks. */
  shelfY: 2.2,
  /**
   * The big timber under the shelf's left edge, back to front: its middle in
   * x, its section, and its front end, jutting out over the red line.
   */
  shelfTimber: { x: 1.52, width: 0.14, height: 0.12, front: 0.7 },
  /**
   * The steam vent: a pipe up from the red line beside that timber, strapped to
   * its right side, ending in a flared mouth where the white plume will gush out.
   */
  steamVent: { x: 1.66, top: 2.35, radius: 0.05 },
  /** A big plank nailed across the right frame's front posts, the valve wheel on it. */
  valvePlank: { y: 1.38, height: 0.18, depth: 0.04 },
  /** A thinner one lower down, under the workbench's bearers, clear of its legs. */
  lowPlank: { y: 0.61, height: 0.1 },
  /**
   * The small pipe from the vat's right that runs under the shelf, level with
   * the red line's run there: its height and depth.
   */
  vatSmallPipe: { y: 1.86, z: -0.1 },
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
  /**
   * The cast-iron stove on the floor between the two shelves, at the back: its
   * body's radius and top, and its big flue rising out of view, through the roof.
   */
  stove: { x: -0.42, z: -0.7, radius: 0.3, top: 1.0, flue: 0.14, flueTop: 9 },
  /** The boiler stands on the workbench, the same table as the basin. */
  boiler: { x: 0.1, z: 0.68, radius: 0.36, bottom: 0.8, height: 0.8 },
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
    blackBlock: { left: -2.05, right: -1.6, height: 0.55, depth: 0.44 },
    greyBlock: { left: -1.2, right: -0.9, depth: 0.36 },
    slide: 0,
  },
  /** The workbench under the boiler, the basin and the glassware. */
  bench: { left: -0.32, right: 1.95, back: 0.31, front: 1.05, top: 0.8 },
  /**
   * The mouth of the cold-air duct, over the basin: the cold vapor gushes out
   * here and the ice cube drops from it (docs/references/video-conduit-froid.jpg).
   */
  ductMouth: [0.72, 1.22, 0.8] as Vec3,
}

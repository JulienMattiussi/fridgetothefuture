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
  /** The upper wooden deck, over the boiler and the control box. */
  deckY: 2.3,
  /** The right-hand shelf carrying the tanks. */
  shelfY: 2.2,
  boiler: { x: 0.1, z: -0.2, radius: 0.36, bottom: 0.45, height: 1.35 },
  /** The left table with the control box, where Marty stands. */
  table: { left: -2.1, right: -0.95, back: -0.35, front: 0.45, top: 0.75 },
  /** The right workbench with the basin and the glassware. */
  bench: { left: 0.3, right: 1.95, back: 0.3, front: 1.0, top: 0.8 },
  /** Where the ice cube drops from, right above the basin. */
  spout: [0.75, 1.05, 0.6] as Vec3,
}

import { BackClutter } from '@/three/machine/clutter/BackClutter'
import { LeftClutter } from '@/three/machine/clutter/LeftClutter'
import { RightClutter } from '@/three/machine/clutter/RightClutter'

/**
 * The jumble the machine stands in, darker than the machine itself: inside
 * the two frames, and at the back between them. Nothing floats,
 * and every pipe ends in something: a tank, the floor, the wall, a board.
 */
export function Clutter() {
  return (
    <group>
      <LeftClutter />
      <RightClutter />
      <BackClutter />
    </group>
  )
}

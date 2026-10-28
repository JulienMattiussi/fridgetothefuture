import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { Crate } from '@/three/parts/Crate'
import { Pipe } from '@/three/parts/Pipe'
import { Sack } from '@/three/parts/Sack'
import { WALL_FACE } from '@/three/machine/clutter/anchors'

/** Planks leaning on the wall: their foot on the floor, out from it, their top against it. */
const LEANING = [
  { x: 0.12, foot: -0.55, top: 1.7 },
  { x: 0.3, foot: -0.6, top: 1.45 },
]

/**
 * The back between the two frames, behind the boiler: the stove's coal bin
 * with planks leaning over it on the wall, and crates stacked left of the
 * back wagon wheel, clear of it and its axle.
 */
export function BackClutter() {
  return (
    <group>
      <Crate position={[0.2, 0, -0.9]} size={[0.42, 0.3, 0.32]} color={palette.shadowIron} />
      <Crate position={[0.7, 0, -0.8]} size={[0.45, 0.45, 0.45]} />
      {/* An iron box on it, piped up the wall and into it. */}
      <Crate position={[0.68, 0.45, -0.85]} size={[0.36, 0.34, 0.32]} color={palette.shadowIron} />
      <Pipe
        points={[
          [0.68, 0.79, -0.85],
          [0.68, 2.0, -0.85],
          [0.68, 2.0, WALL_FACE],
        ]}
        radius={0.04}
        color={palette.shadowSteel}
        flangeStart={[0, -1, 0]}
        flangeEnd={[0, 0, -1]}
      />
      <Sack position={[0.7, 0, -0.42]} rotation={[0, 0.3, 0]} size={0.3} />
      {LEANING.map(({ x, foot, top }) => (
        <Beam
          key={x}
          from={[x, 0.01, foot]}
          // Its back face on the wall's line.
          to={[x, top, WALL_FACE + 0.0125]}
          size={0.16}
          depth={0.025}
          color={palette.shadowWood}
        />
      ))}
    </group>
  )
}

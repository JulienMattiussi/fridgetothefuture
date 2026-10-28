import { evenAngles, onCircle } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Pipe } from '@/three/parts/Pipe'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const { stove, vat } = layout
const LEG = 0.2
const BODY = stove.top - LEG
/** Where the elbow off the red cap's top meets the flue, high up. */
const JOIN_Y = 4.3

/**
 * The pot-bellied stove between the two shelves: a cast-iron drum on four
 * short legs, its fire door to the front, and its big flue rising to the roof.
 * An elbowed pipe from the top of the vat's red cap runs over into the flue.
 */
export function Stove() {
  const { x, z, radius } = stove
  const capTop = vat.y + vat.height + vat.cap.height
  return (
    <group>
      {evenAngles(4, Math.PI / 4).map((angle) => {
        const [lx, lz] = onCircle(radius * 0.8, angle)
        return (
          <Rod
            key={angle}
            from={[x + lx, 0, z + lz]}
            to={[x + lx, LEG + 0.02, z + lz]}
            radius={0.03}
            color={palette.blackIron}
          />
        )
      })}
      <ToonMesh position={[x, LEG + BODY / 2, z]} color={palette.blackIron}>
        <cylinderGeometry args={[radius, radius * 0.92, BODY, 32]} />
      </ToonMesh>
      {/* Its belly band, top plate and fire door. */}
      <ToonMesh
        position={[x, LEG + BODY * 0.55, z]}
        rotation={[Math.PI / 2, 0, 0]}
        color={palette.iron}
      >
        <torusGeometry args={[radius + 0.01, 0.025, 8, 40]} />
      </ToonMesh>
      <ToonMesh position={[x, stove.top + 0.02, z]} color={palette.iron}>
        <cylinderGeometry args={[radius * 0.85, radius + 0.03, 0.06, 32]} />
      </ToonMesh>
      <ToonMesh position={[x, LEG + BODY * 0.3, z + radius - 0.02]} color={palette.iron}>
        <boxGeometry args={[0.2, 0.16, 0.05]} />
      </ToonMesh>
      <Rod
        from={[x, stove.top, z]}
        to={[x, stove.flueTop, z]}
        radius={stove.flue}
        color={palette.steel}
      />
      <Pipe
        points={[
          [vat.x + 0.05, capTop, vat.z - 0.2],
          [vat.x + 0.05, JOIN_Y, vat.z - 0.2],
          [x + stove.flue, JOIN_Y, z],
        ]}
        radius={0.09}
        flangeStart={[0, -1, 0]}
      />
    </group>
  )
}

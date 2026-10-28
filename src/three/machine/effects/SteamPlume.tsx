import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh, MeshToonMaterial } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'

const PUFFS = 5
/** How high a puff rises over its life, and how long it lives, in seconds. */
const RISE = 0.9
const LIFE = 1.6

/**
 * The white steam gushing from a vent's mouth while the engine runs: puffs
 * that rise, swell and fade, one after another, as strong as the sequence's
 * `steam`.
 */
export function SteamPlume({ at }: { at: Vec3 }) {
  const sequence = useSequence()
  const puffs = useRef<(Mesh | null)[]>([])
  const group = useRef<Group>(null)
  useFrame(() => {
    const steam = sequence?.readouts.steam ?? 0
    if (group.current) group.current.visible = steam > 0
    if (!sequence || steam === 0) return
    puffs.current.forEach((puff, i) => {
      if (!puff) return
      const age = (sequence.time / LIFE + i / PUFFS) % 1
      puff.position.set(Math.sin(i * 2.3) * 0.05 * age, age * RISE, 0)
      puff.scale.setScalar(0.4 + age * 1.6)
      ;(puff.material as MeshToonMaterial).opacity = steam * 0.7 * (1 - age)
    })
  })
  return (
    <group ref={group} position={at} visible={false}>
      {Array.from({ length: PUFFS }, (_, i) => (
        <ToonMesh
          key={i}
          ref={(mesh) => {
            puffs.current[i] = mesh
          }}
          color={palette.enamel}
          opacity={0.5}
          outline={0}
        >
          <sphereGeometry args={[0.1, 16, 12]} />
        </ToonMesh>
      ))}
    </group>
  )
}

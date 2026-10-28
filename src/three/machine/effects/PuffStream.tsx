import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh, MeshToonMaterial } from 'three'
import type { Readouts } from '@/lib/readouts'
import type { Vec3 } from '@/lib/geometry'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'
import { ignorePointer } from '@/three/parts/ignorePointer'

interface PuffStreamProps {
  at: Vec3
  count: number
  /** Each puff's life, in seconds: they follow one another, evenly spaced. */
  life: number
  /** One color, or several the puffs take in turn (frosty glints in the cold). */
  color: string | string[]
  /** The puffs' opacity when fresh, at full strength. */
  opacity: number
  /** The age from which they fade out (0, from the start): later keeps the cloud dense. */
  fadeFrom?: number
  /** How strong the stream is, 0 (none) to 1, from what the machine shows. */
  strength: (readouts: Readouts) => number
  /** Where puff `i` is at `age` (0 fresh, 1 gone), from `at`, and how big, as the machine goes. */
  puff: (i: number, age: number, readouts: Readouts) => { position: Vec3; scale: number }
}

/**
 * A stream of vapor: round puffs, one after another, that move off, swell and
 * fade over their life, as strong as `strength`. The plume and the cold jet.
 */
export function PuffStream({
  at,
  count,
  life,
  color,
  opacity,
  fadeFrom = 0,
  strength,
  puff,
}: PuffStreamProps) {
  const sequence = useSequence()
  const puffs = useRef<(Mesh | null)[]>([])
  const group = useRef<Group>(null)
  useFrame(() => {
    const power = sequence ? strength(sequence.readouts) : 0
    if (group.current) group.current.visible = power > 0
    if (!sequence || power === 0) return
    puffs.current.forEach((mesh, i) => {
      if (!mesh) return
      const age = (sequence.time / life + i / count) % 1
      const { position, scale } = puff(i, age, sequence.readouts)
      mesh.position.set(...position)
      mesh.scale.setScalar(scale)
      const fade = Math.min(1, (1 - age) / (1 - fadeFrom))
      ;(mesh.material as MeshToonMaterial).opacity = power * opacity * fade
    })
  })
  return (
    <group ref={group} position={at} visible={false}>
      {Array.from({ length: count }, (_, i) => (
        <ToonMesh
          key={i}
          ref={(mesh) => {
            puffs.current[i] = mesh
          }}
          color={typeof color === 'string' ? color : color[i % color.length]!}
          opacity={0.5}
          // Vapor never catches the pointer: the parts show through it to the mouse.
          raycast={ignorePointer}
          outline={0}
        >
          <sphereGeometry args={[0.1, 16, 12]} />
        </ToonMesh>
      ))}
    </group>
  )
}

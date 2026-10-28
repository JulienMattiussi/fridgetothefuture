import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { type Group, type Mesh, type MeshToonMaterial, Quaternion, Vector3 } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'

/** How far the cold vapor reaches out of the mouth, and how wide it spreads. */
const LENGTH = 0.5
const SPREAD = 0.2

/**
 * The cold vapor gushing out of the duct's mouth, along its axis: a pale
 * flickering cone, as strong as the sequence's `coldJet`.
 */
export function ColdJet({ mouth, along }: { mouth: Vec3; along: Vec3 }) {
  const sequence = useSequence()
  const group = useRef<Group>(null)
  const stretch = useRef<Group>(null)
  const cone = useRef<Mesh>(null)
  // A cone stands along +Y: turn it onto the duct's axis.
  const quaternion = useMemo(
    () =>
      new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(...along).normalize()),
    [along],
  )
  useFrame(() => {
    const jet = sequence?.readouts.coldJet ?? 0
    if (group.current) group.current.visible = jet > 0
    if (!sequence || !cone.current || !stretch.current || jet === 0) return
    const flicker = 1 + 0.08 * Math.sin(sequence.time * 23)
    stretch.current.scale.set(flicker, jet, flicker)
    ;(cone.current.material as MeshToonMaterial).opacity = 0.55 * jet
  })
  return (
    <group ref={group} position={mouth} quaternion={quaternion} visible={false}>
      {/* Stretched from the mouth: the cone sits half its length along its axis. */}
      <group ref={stretch}>
        <ToonMesh
          ref={cone}
          position={[0, LENGTH / 2, 0]}
          color={palette.glass}
          opacity={0.5}
          outline={0}
        >
          <cylinderGeometry args={[SPREAD, 0.1, LENGTH, 24, 1, true]} />
        </ToonMesh>
      </group>
    </group>
  )
}

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'

interface BellowsProps {
  /** The middle of its fixed top disc. */
  top: Vec3
  radius: number
  /** Its height at rest, fully open, the crank pin at the top of its circle. */
  height: number
  folds: number
  /** The crank's axle centre (on the same X and Z) and its throw. */
  crankY: number
  crankZ: number
  throw: number
}

/**
 * A round leather bellows hanging from a fixed disc, its moving disc pushed
 * up and down by a crank on the engine's axle, through a rod.
 */
export function Bellows({
  top,
  radius,
  height,
  folds,
  crankY,
  crankZ,
  throw: reach,
}: BellowsProps) {
  const [, topY, z] = top
  const sequence = useSequence()
  const board = useRef<Group>(null)
  const pleats = useRef<Group>(null)
  const rod = useRef<Group>(null)
  // At rest the crank pin stands at the top of its circle and the bellows is
  // fully open; as it turns the pin drops and pulls the disc down with it.
  useFrame(() => {
    const angle = sequence?.engineAngle ?? 0
    const pinX = Math.sin(angle) * reach
    const pinY = crankY + Math.cos(angle) * reach
    const drop = reach * (1 - Math.cos(angle))
    const boardY = topY - height - drop
    board.current?.position.set(0, boardY - topY, 0)
    pleats.current?.scale.set(1, (height + drop) / height, 1)
    if (rod.current) {
      rod.current.position.set(pinX, pinY - topY, crankZ - z)
      rod.current.scale.set(1, boardY - pinY, 1)
    }
  })
  return (
    <group position={top}>
      <ToonMesh color={palette.woodDark}>
        <cylinderGeometry args={[radius, radius, 0.04, 32]} />
      </ToonMesh>
      <group ref={pleats}>
        {Array.from({ length: folds }, (_, i) => {
          const r = radius - (i % 2 === 0 ? 0.05 : 0.015)
          return (
            <ToonMesh
              key={i}
              position={[0, -((i + 0.5) * height) / folds, 0]}
              color={palette.leather}
            >
              <cylinderGeometry args={[r, r, height / folds, 32]} />
            </ToonMesh>
          )
        })}
      </group>
      <group ref={board} position={[0, -height, 0]}>
        <ToonMesh color={palette.woodDark}>
          <cylinderGeometry args={[radius, radius, 0.04, 32]} />
        </ToonMesh>
      </group>
      {/* The rod, a unit-high cylinder from the crank pin up, stretched each frame. */}
      <group ref={rod} position={[0, crankY + reach - topY, crankZ - z]} scale={[1, height, 1]}>
        <ToonMesh position={[0, 0.5, 0]} color={palette.steel} outline={0}>
          <cylinderGeometry args={[0.014, 0.014, 1, 8]} />
        </ToonMesh>
      </group>
    </group>
  )
}

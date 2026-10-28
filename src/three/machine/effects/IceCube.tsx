import { useFrame } from '@react-three/fiber'
import { type RefObject, useRef } from 'react'
import type { Mesh, Vector3 } from 'three'
import { lerp, type Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'

const SIZE = 0.05
/** How high it sits off the basin's bottom. */
const IN_BASIN = 0.04

interface IceCubeProps {
  /** Where it drops from, where it lands in the basin held up, and where it ends in the glass. */
  mouth: Vec3
  landing: Vec3
  glass: Vec3
  /** Where the basin is, as it moves: the cube rides in it. */
  basin: RefObject<Vector3>
  /** Where the tongs hold it, while they do (Tongs). */
  held: RefObject<Vector3 | null>
}

/** The single ice cube: dropping out of the duct, in the basin, in the tongs, then in Doc's tea. */
export function IceCube({ mouth, landing, glass, basin, held }: IceCubeProps) {
  const sequence = useSequence()
  const cube = useRef<Mesh>(null)
  useFrame(() => {
    if (!cube.current) return
    const { where, fall } = sequence?.readouts.cube ?? { where: 'none', fall: 0 }
    cube.current.visible = where !== 'none'
    if (where === 'basin') {
      if (held.current) cube.current.position.copy(held.current)
      else cube.current.position.copy(basin.current).setY(basin.current.y + IN_BASIN)
    } else cube.current.position.set(...(where === 'glass' ? glass : lerp(mouth, landing, fall)))
    // It tumbles a little as it falls, and lies flat once landed.
    cube.current.rotation.set(fall * 2.5, fall * 1.3, 0)
  })
  return (
    <ToonMesh ref={cube} visible={false} color={palette.glass} opacity={0.85}>
      <boxGeometry args={[SIZE, SIZE, SIZE]} />
    </ToonMesh>
  )
}

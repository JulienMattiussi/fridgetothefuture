import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'
import { lerp, type Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'

const SIZE = 0.05

interface IceCubeProps {
  /** Where it drops from, where it lands in the basin, and where it ends in the glass. */
  mouth: Vec3
  basin: Vec3
  glass: Vec3
}

/** The single ice cube: dropping out of the duct, in the basin, then in Doc's tea. */
export function IceCube({ mouth, basin, glass }: IceCubeProps) {
  const sequence = useSequence()
  const cube = useRef<Mesh>(null)
  useFrame(() => {
    if (!cube.current) return
    const { where, fall } = sequence?.readouts.cube ?? { where: 'none', fall: 0 }
    cube.current.visible = where !== 'none'
    const at = where === 'glass' ? glass : where === 'basin' ? basin : lerp(mouth, basin, fall)
    cube.current.position.set(...at)
    // It tumbles a little as it falls, and lies flat once landed.
    cube.current.rotation.set(fall * 2.5, fall * 1.3, 0)
  })
  return (
    <ToonMesh ref={cube} visible={false} color={palette.glass} opacity={0.85}>
      <boxGeometry args={[SIZE, SIZE, SIZE]} />
    </ToonMesh>
  )
}

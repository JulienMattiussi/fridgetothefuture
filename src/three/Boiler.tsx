import { Outlines } from '@react-three/drei'
import { useToonGradient } from '@/three/useToonGradient'

/** Placeholder for the machine: the rusty boiler at its center. */
export function Boiler() {
  const gradient = useToonGradient()
  return (
    <mesh position={[0, 1.2, 0]}>
      <cylinderGeometry args={[0.6, 0.6, 2.4, 32]} />
      <meshToonMaterial color="#9a5a34" gradientMap={gradient} />
      <Outlines thickness={3} color="#1c140d" screenspace />
    </mesh>
  )
}

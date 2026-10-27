import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Boiler } from '@/three/Boiler'

/** The full-page 3D scene: the livery stable's wall and Doc's machine. */
export function Scene() {
  return (
    <Canvas camera={{ position: [0, 2, 7], fov: 45 }} aria-label="Le réfrigérateur de Doc Brown">
      <color attach="background" args={['#1c140d']} />
      <ambientLight intensity={0.4} />
      {/* Daylight through the stable's planks, from the upper left. */}
      <directionalLight position={[-4, 6, 5]} intensity={2} color="#ffe2b0" />
      <Boiler />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshToonMaterial color="#5a4128" />
      </mesh>
      {/* Bounded orbit: the machine stands against a wall, never seen from behind. */}
      <OrbitControls
        target={[0, 1.2, 0]}
        minDistance={3}
        maxDistance={12}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </Canvas>
  )
}

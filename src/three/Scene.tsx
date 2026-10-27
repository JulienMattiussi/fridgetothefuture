import { Canvas } from '@react-three/fiber'
import { palette } from '@/three/palette'
import { FrontCamera } from '@/three/FrontCamera'
import { Machine } from '@/three/machine/Machine'
import { Stable } from '@/three/stable/Stable'

/** The full-page 3D scene: the livery stable's wall and Doc's machine. */
export function Scene() {
  return (
    // Offset size, not the bounding box: in portrait the page is rotated
    // (index.css), and the bounding box would swap width and height.
    <Canvas aria-label="Le réfrigérateur de Doc Brown" resize={{ offsetSize: true }}>
      <FrontCamera />
      <color attach="background" args={[palette.ink]} />
      <ambientLight intensity={0.6} color="#ffe9c8" />
      {/* Daylight through the stable's planks, from the upper left. */}
      <directionalLight position={[-4, 6, 5]} intensity={2.2} color="#ffe2b0" />
      <Stable />
      <Machine />
    </Canvas>
  )
}

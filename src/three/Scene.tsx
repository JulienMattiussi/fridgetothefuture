import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { palette } from '@/three/palette'
import { FrontCamera } from '@/three/FrontCamera'
import { FRAME_CENTER } from '@/three/viewFrame'
import { Machine } from '@/three/machine/Machine'
import { SequenceClock } from '@/three/sequence/SequenceClock'
import { Stable } from '@/three/stable/Stable'

/**
 * `?orbit` in the URL lets the mouse turn round the machine, to inspect it
 * while modeling; the visitor unlocks the same free view by seeing every
 * ending (`orbit`). Otherwise the scene keeps its fixed front view.
 */
const inspect = new URLSearchParams(window.location.search).has('orbit')

/** The full-page 3D scene: the livery stable's wall and Doc's machine. */
export function Scene({ orbit = false, label }: { orbit?: boolean; label: string }) {
  const free = inspect || orbit
  return (
    // Offset size, not the bounding box: in portrait the page is rotated
    // (index.css), and the bounding box would swap width and height.
    <Canvas aria-label={label} resize={{ offsetSize: true }}>
      <FrontCamera still={free} />
      <SequenceClock />
      {free && <OrbitControls target={[...FRAME_CENTER]} makeDefault />}
      <color attach="background" args={[palette.ink]} />
      <ambientLight intensity={0.6} color="#ffe9c8" />
      {/* Daylight through the stable's planks, from the upper left. */}
      <directionalLight position={[-4, 6, 5]} intensity={2.2} color="#ffe2b0" />
      <Stable />
      <Machine />
    </Canvas>
  )
}

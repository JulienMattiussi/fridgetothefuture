import { Outlines } from '@react-three/drei'
import { useThree, type ThreeElements } from '@react-three/fiber'
import { DataTexture, FrontSide, NearestFilter, RedFormat, type Side } from 'three'
import { toonSteps } from '@/lib/toonSteps'
import { palette } from '@/three/palette'

// One gradient map for every toon material: 3 hard light bands. Nearest
// filtering keeps the bands crisp, which is the whole cell look. It lives as
// long as the page, so it is never disposed.
const steps = toonSteps(3)
const gradient = new DataTexture(steps, steps.length, 1, RedFormat)
gradient.minFilter = NearestFilter
gradient.magFilter = NearestFilter
gradient.needsUpdate = true

type ToonMeshProps = ThreeElements['mesh'] & {
  color: string
  /** Below 1, the material is see-through (glass). */
  opacity?: number
  /** Ink outline in pixels; 0 for none (flat backgrounds). */
  outline?: number
  /** DoubleSide for open shapes seen from inside (a basin). */
  side?: Side
}

/** A cell-shaded mesh with its ink outline. Its children give the geometry. */
export function ToonMesh({
  color,
  opacity = 1,
  outline = 2.5,
  side = FrontSide,
  children,
  ...props
}: ToonMeshProps) {
  const dpr = useThree((state) => state.viewport.dpr)
  return (
    <mesh {...props}>
      {children}
      <meshToonMaterial
        color={color}
        gradientMap={gradient}
        transparent={opacity < 1}
        opacity={opacity}
        depthWrite={opacity === 1}
        side={side}
      />
      {/* drei's `screenspace` flag is inverted: left off, the thickness is in
          drawing-buffer pixels, hence the device pixel ratio. */}
      {outline > 0 && <Outlines thickness={outline * dpr} color={palette.ink} />}
    </mesh>
  )
}

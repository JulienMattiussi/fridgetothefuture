import { useThree } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import { type Group, Matrix4, Quaternion, Vector3 } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Rod } from '@/three/parts/Rod'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { toScreen } from '@/three/sequence/gestures'
import { Handle } from '@/three/sequence/Handle'

/** The arms' length, from the hinge to the tips, and their tips' spread, open or shut on the cube. */
const ARM = 0.27
const OPEN = 0.04
const SHUT = 0.028
/** How near the ice cube on screen, in pixels, the tips must pass to take it. */
const TAKE_REACH = 45
/** Where the cube sits, held: just above the tips. */
const HOLD_LIFT = 0.03

/**
 * Lying on the bench, the arms point left from the tips and spread back to
 * front: local Y (tips to hinge) along -X, local X (the spread) along Z.
 */
const LYING = new Quaternion().setFromRotationMatrix(
  new Matrix4().makeBasis(new Vector3(0, 0, 1), new Vector3(-1, 0, 0), new Vector3(0, -1, 0)),
)
const UPRIGHT = new Quaternion()

interface TongsProps {
  /** Where their tips lie on the bench. */
  rest: Vec3
  /** The ice cube in the basin, and the glass it goes in. */
  cube: Vec3
  glass: Vec3
  /** Tells where they hold the cube, as they move, and null once they let it go. */
  onHold: (at: Vector3 | null) => void
}

/**
 * Doc's tongs, lying open on the bench. Taken up, they stand in for the
 * pointer, tips down; passed over the ice cube in the basin they close on it,
 * and let go over the glass they drop it in. Let go anywhere else, they go
 * back on the bench and the cube back in the basin.
 */
export function Tongs({ rest, cube, glass, onHold }: TongsProps) {
  const { camera, gl } = useThree()
  const tongs = useRef<Group>(null)
  // A ref for the gesture, which keeps the `move` it started with; state to redraw.
  const taking = useRef(false)
  const [hasCube, setHasCube] = useState(false)
  const take = (yes: boolean) => {
    taking.current = yes
    setHasCube(yes)
  }
  const cubeAt = useMemo(() => new Vector3(...cube), [cube])
  const move = (point: Vector3 | null, at?: { x: number; y: number }) => {
    if (!tongs.current) return
    if (!point) {
      tongs.current.position.set(...rest)
      tongs.current.quaternion.copy(LYING)
      onHold(null)
      take(false)
      return
    }
    tongs.current.position.copy(point)
    tongs.current.quaternion.copy(UPRIGHT)
    let taken = taking.current
    if (!taken && at) {
      const onScreen = toScreen(cubeAt, camera, gl.domElement)
      taken = Math.hypot(at.x - onScreen.x, at.y - onScreen.y) < TAKE_REACH
      if (taken) take(true)
    }
    if (taken) onHold(point.clone().setY(point.y + HOLD_LIFT))
  }
  const spread = hasCube ? SHUT : OPEN
  return (
    <Handle actions={['useTongs']} drag={{ target: hasCube ? glass : null, move }}>
      <group ref={tongs} position={rest} quaternion={LYING}>
        {[-1, 1].map((side) => (
          <Rod
            key={side}
            from={[side * spread, 0, 0]}
            to={[0, ARM, 0]}
            radius={0.008}
            color={palette.iron}
          />
        ))}
        {/* The spring loop at the hinge. */}
        <ToonMesh position={[0, ARM + 0.015, 0]} color={palette.iron}>
          <torusGeometry args={[0.015, 0.005, 6, 16]} />
        </ToonMesh>
        {/* A wider, unseen grip, easier to take than the thin arms. */}
        <mesh position={[0, ARM / 2, 0]} visible={false}>
          <boxGeometry args={[0.12, ARM + 0.04, 0.08]} />
        </mesh>
      </group>
    </Handle>
  )
}

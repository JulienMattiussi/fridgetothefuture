import { Html } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Box3, type Group, type Material, type Mesh, Vector3 } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { isTurn, turnWay, type Action } from '@/lib/sequence'
import { useSequence } from '@/three/sequence/context'
import type { SequenceStore } from '@/three/sequence/store'
import { DropSign, type Gesture, GestureSign } from '@/three/sequence/GestureSign'
import { toScreen, trackDrag, trackTurn } from '@/three/sequence/gestures'

interface HandleProps {
  /** What working the part does, by phase: the first one the sequence waits for counts. */
  actions: Action[]
  /**
   * Makes it a part to drag and drop on `target` (a world point) instead of
   * clicking: `move` follows it with the world point its middle should be at,
   * and the pointer on the page, then with null when let go, wherever. A null
   * target takes no drop yet (the tongs, before they hold the ice cube).
   */
  drag?: {
    target: Vec3 | null
    /** What dropping it on the target does, when not just playing its action. */
    drop?: () => void
    /**
     * Whether it is where it should be let go, when the part itself knows
     * better than the pointer's distance to the target (a lever swung down).
     */
    home?: () => boolean
    /** Whether it stays in its own plane, not lifted toward the viewer (a lever on its pivot). */
    inPlace?: boolean
    move: (point: Vector3 | null, at?: { x: number; y: number }) => void
  }
  /** Narrows when it can be worked, past the sequence waiting for its action. */
  when?: (sequence: SequenceStore) => boolean
  children: ReactNode
}

/** The warm glow over a part the visitor can work, under the pointer. */
const GLOW = '#ff9a3c'
const GLOW_INTENSITY = 0.45
/** How near the target, in pixels, a dragged part must be let go. */
const DROP_REACH = 90
/** How far toward the viewer a dragged part comes, in meters. */
const LIFT = 0.8

/** Lights the toon meshes under `group` up, or puts them back. */
function glow(group: Group, on: boolean) {
  group.traverse((object) => {
    const material = (object as Mesh).material as
      (Material & { emissive?: { set(c: string): void }; emissiveIntensity?: number }) | undefined
    if (!material?.emissive) return
    material.emissive.set(on ? GLOW : '#000000')
    material.emissiveIntensity = GLOW_INTENSITY
  })
}

function gestureOf(action: Action, drag: boolean): Gesture {
  if (isTurn(action)) return turnWay(action) === 1 ? 'turnLeft' : 'turnRight'
  return drag ? 'drag' : 'click'
}

/**
 * Wraps a part the visitor works: clicked, dragged onto its target, or turned
 * round by circling the mouse about it, pressed (a valve's wheel, a crank).
 * While the sequence waits for it, it glows under the pointer and a sign over
 * it shows the gesture.
 */
export function Handle({ actions, drag, when, children }: HandleProps) {
  const sequence = useSequence()
  const { camera, gl } = useThree()
  const get = useThree((state) => state.get)
  const group = useRef<Group>(null)
  const latestDrag = useRef(drag)
  useEffect(() => {
    latestDrag.current = drag
  }, [drag])
  const [hovered, setHovered] = useState(false)
  const [held, setHeld] = useState(false)
  /** Whether a dragged part is over its target, where letting go drops it. */
  const [over, setOver] = useState(false)
  const [action, setAction] = useState<Action | null>(null)
  const [signAt, setSignAt] = useState<Vector3 | null>(null)
  const ready = () =>
    sequence && (when?.(sequence) ?? true)
      ? (actions.find((candidate) => sequence.can(candidate)) ?? null)
      : null

  // The phase moves on without this part re-rendering: follow it every frame.
  useFrame(() => {
    const now = ready()
    if (now !== action) setAction(now)
  })
  // A dragged part shows its own colors while carried: only what is turned stays lit.
  const lit = action !== null && (hovered || held) && !(held && drag)
  // In the free view, a part under the pointer takes the mouse: the view
  // holds still while it is worked.
  const working = action !== null && (hovered || held)
  useEffect(() => {
    const controls = get().controls as { enabled: boolean } | null
    if (!controls || !working) return
    controls.enabled = false
    return () => {
      controls.enabled = true
    }
  }, [get, working])
  useEffect(() => {
    if (group.current) glow(group.current, lit)
  }, [lit])
  useEffect(() => {
    if (!hovered && !held) return
    const gesture = action && gestureOf(action, !!drag)
    document.body.style.cursor = held
      ? drag
        ? // The carried part stands in for the pointer.
          'none'
        : 'grabbing'
      : !gesture
        ? ''
        : gesture === 'click'
          ? 'pointer'
          : 'grab'
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered, held, action, drag])

  const middle = () => new Box3().setFromObject(group.current!).getCenter(new Vector3())
  const onOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (!group.current || held) return
    // The sign stands just over the part's top, in the part's own frame.
    const { min, max } = new Box3().setFromObject(group.current)
    const top = new Vector3((min.x + max.x) / 2, max.y + 0.12, (min.z + max.z) / 2)
    setSignAt(group.current.worldToLocal(top))
    setHovered(true)
  }

  const onPress = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    const now = ready()
    if (!now || !sequence || !group.current) return
    const center = middle()
    const release = () => setHeld(false)
    if (isTurn(now)) {
      const onScreen = toScreen(center, camera, gl.domElement)
      trackTurn(onScreen, (turns) => sequence.turn(now, turns), release)
    } else if (drag) {
      // Lifted toward the viewer, so it passes in front of everything on its way.
      const toViewer = camera
        .getWorldDirection(new Vector3())
        .multiplyScalar(drag.inPlace ? 0 : -LIFT)
      // The latest target: it can change on the way.
      const onTarget = (at: { x: number; y: number }) => {
        const home = latestDrag.current?.home
        if (home) return home()
        const goal = latestDrag.current?.target
        if (!goal) return false
        const target = toScreen(new Vector3(...goal), camera, gl.domElement)
        return Math.hypot(at.x - target.x, at.y - target.y) < DROP_REACH
      }
      trackDrag(
        center.clone().add(toViewer),
        camera,
        gl.domElement,
        // Its middle under the pointer: it takes the pointer's place.
        (point, at) => {
          drag.move(point, at)
          setOver(onTarget(at))
        },
        (at) => {
          if (onTarget(at)) {
            if (drag.drop) drag.drop()
            else sequence.act(now)
          }
          drag.move(null)
          setOver(false)
          release()
        },
      )
    } else return
    setHeld(true)
  }

  return (
    <group
      ref={group}
      onPointerOver={onOver}
      onPointerOut={() => setHovered(false)}
      onPointerDown={onPress}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        const now = ready()
        if (now && !isTurn(now) && !drag) sequence?.act(now)
      }}
    >
      {children}
      {lit && signAt && !held && action && (
        <Html position={signAt} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <GestureSign gesture={gestureOf(action, !!drag)} />
        </Html>
      )}
      {/* Where to take a dragged part: the group itself stays put, only its contents move. */}
      {held && drag?.target && (
        <Html position={drag.target} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <DropSign over={over} />
        </Html>
      )}
    </group>
  )
}

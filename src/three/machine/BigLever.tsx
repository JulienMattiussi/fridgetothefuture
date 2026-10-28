import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Vector3 } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { Beam } from '@/three/parts/Beam'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'
import { Handle } from '@/three/sequence/Handle'
import { layout, VALVE_PLANK_FRONT } from '@/three/machine/layout'

/**
 * The big lever behind the gear train (Doc pulls it down in the film): its
 * pivot on the frame's horizontal plank, its wooden handle, and how far it
 * swings toward the viewer: a half turn, from straight up to straight down.
 * It stands right of the big gauge under the shelf, on a short iron arm off
 * the plank, just in front of the small valve's wheel, so it swings clear;
 * electric contacts stop it up and down.
 */
const PIVOT: Vec3 = [2.36, layout.valvePlank.y, VALVE_PLANK_FRONT + 0.25]
const LENGTH = 0.75
const DOWN = Math.PI
const EASE = 0.15
/**
 * Its two stops, up and down: electric contacts the lever's copper blade
 * (this far along it) closes into, each on a wooden batten nailed to the
 * frame's planks, just behind the lever: up, above the plank; down, between
 * the low plank and the small valve's pipe.
 */
const BLADE = 0.6
/** Where its blade comes down to, in the lower contact: the drag's target. */
const BLADE_DOWN: Vec3 = [PIVOT[0], PIVOT[1] - BLADE, PIVOT[2]]
const BATTEN = { width: 0.07, depth: 0.04 }
const STOPS = [
  { y: PIVOT[1] + BLADE, from: layout.valvePlank.y + layout.valvePlank.height / 2, to: 2.05 },
  { y: PIVOT[1] - BLADE, from: layout.lowPlank.y - layout.lowPlank.height / 2, to: 0.88 },
]
/** The contacts' insulator reaches from the batten to just behind the lever's blade. */
const INSULATOR = { from: VALVE_PLANK_FRONT + BATTEN.depth, to: PIVOT[2] - 0.095 }
const JAWS = { depth: 0.035, gap: 0.016 }

/** An electric contact on its batten: a porcelain block, two copper jaws in front. */
function Contact({ y, from, to }: { y: number; from: number; to: number }) {
  const insulator = INSULATOR.to - INSULATOR.from
  return (
    <group>
      <ToonMesh
        position={[PIVOT[0], (from + to) / 2, VALVE_PLANK_FRONT + BATTEN.depth / 2]}
        color={palette.wood}
      >
        <boxGeometry args={[BATTEN.width, to - from, BATTEN.depth]} />
      </ToonMesh>
      <ToonMesh position={[PIVOT[0], y, INSULATOR.from + insulator / 2]} color={palette.enamel}>
        <boxGeometry args={[0.07, 0.06, insulator]} />
      </ToonMesh>
      {[-1, 1].map((side) => (
        <ToonMesh
          key={side}
          position={[PIVOT[0] + side * JAWS.gap, y, INSULATOR.to + JAWS.depth / 2]}
          color={palette.copper}
        >
          <boxGeometry args={[0.01, 0.05, JAWS.depth]} />
        </ToonMesh>
      ))}
    </group>
  )
}

/**
 * The big lever: pulled down into its lower contact, it stays there. Once
 * the big valve is open, that lets the cold out; earlier, it dooms the run.
 * Let go before the contact, it springs back up.
 */
export function BigLever() {
  const sequence = useSequence()
  const lever = useRef<Group>(null)
  const pulled = useRef(false)
  useFrame((_, dt) => {
    if (!lever.current || pulled.current) return
    const goal = DOWN * (sequence?.readouts.lever ?? 0)
    lever.current.rotation.x += (goal - lever.current.rotation.x) * (1 - Math.exp(-dt / EASE))
  })
  const move = (point: Vector3 | null) => {
    pulled.current = point !== null
    if (!point || !lever.current) return
    // Its blade follows the pointer down, into the lower contact: seen from
    // the front, the pointer's height alone tells how far it has swung.
    const rise = Math.min(1, Math.max(-1, (point.y - PIVOT[1]) / BLADE))
    lever.current.rotation.x = Math.min(DOWN, Math.max(0, Math.acos(rise)))
  }
  return (
    <group>
      {/* The iron arm out of the plank, and the fork it pivots in. */}
      <Beam
        from={[PIVOT[0], PIVOT[1], VALVE_PLANK_FRONT]}
        to={[PIVOT[0], PIVOT[1], PIVOT[2]]}
        size={0.05}
        color={palette.iron}
      />
      {STOPS.map((stop) => (
        <Contact key={stop.y} {...stop} />
      ))}
      {[-1, 1].map((side) => (
        <ToonMesh
          key={side}
          position={[PIVOT[0] + side * 0.04, PIVOT[1], PIVOT[2]]}
          color={palette.iron}
        >
          <boxGeometry args={[0.015, 0.08, 0.06]} />
        </ToonMesh>
      ))}
      <Handle
        actions={['pullLever']}
        // Let go anywhere, it counts once swung nearly all the way down, into its contact.
        drag={{
          target: BLADE_DOWN,
          move,
          inPlace: true,
          home: () => (lever.current?.rotation.x ?? 0) > DOWN * 0.85,
        }}
      >
        <group ref={lever} position={PIVOT}>
          <Beam from={[0, -0.03, 0]} to={[0, LENGTH, 0]} size={0.045} color={palette.woodLight} />
          <ToonMesh position={[0, LENGTH, 0]} color={palette.woodDark}>
            <sphereGeometry args={[0.04, 12, 10]} />
          </ToonMesh>
          {/* Its copper blade, through the handle: it closes into the contact
              behind, up as well as down (turned over, its front is behind). */}
          <ToonMesh position={[0, BLADE, 0]} color={palette.copper}>
            <boxGeometry args={[0.014, 0.045, 0.19]} />
          </ToonMesh>
          {/* Its pin, across: it swings toward the viewer. */}
          <ToonMesh rotation={[0, 0, Math.PI / 2]} color={palette.steel}>
            <cylinderGeometry args={[0.02, 0.02, 0.1, 12]} />
          </ToonMesh>
        </group>
      </Handle>
    </group>
  )
}

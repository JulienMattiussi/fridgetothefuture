import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { type Group, Vector3 } from 'three'
import type { Vec3 } from '@/lib/geometry'
import { stoking } from '@/lib/stoking'
import { palette } from '@/three/palette'
import { NumberedLog } from '@/three/parts/NumberedLog'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { useSequence } from '@/three/sequence/context'
import { Handle } from '@/three/sequence/Handle'
import { layout } from '@/three/machine/layout'

const { logPile, stove } = layout
/** Where the logs go: the stove's fire door. */
const DOOR: Vec3 = [stove.x, stove.doorY, stove.z + stove.radius]
/** A log goes in by the open door's mouth, on into the fire box. */
const MOUTH = new Vector3(DOOR[0], DOOR[1], DOOR[2] + 0.2)
const INSIDE = new Vector3(DOOR[0], DOOR[1], DOOR[2] - 0.25)
const WOOD = { radius: 0.055, length: 0.42 }
/** A log's height in the pile, by its row: each row sits in the grooves of the one under it. */
const rowY = (row: number) => WOOD.radius * (1 + 1.75 * row)
/** The plain logs, two rows lying back to front. */
const PLAIN = [
  ...[-0.3, -0.18, -0.06, 0.06, 0.18, 0.3].map((x) => ({ x, row: 0 })),
  ...[-0.24, -0.12, 0, 0.12, 0.24].map((x) => ({ x, row: 1 })),
].map(({ x, row }) => ({
  x,
  y: rowY(row),
  // The top row's right end log rolls off when the machine shakes hard (the left one
  // would roll under the coil stand).
  rolls: row === 1 && x > 0.2 ? 1 : 0,
}))
/** How hard the machine must shake to roll them off, how far they roll, and how long it takes. */
const ROLL = { shaking: 0.7, distance: 0.32, time: 0.8 }

/** A plain log of the pile; one at the top row's end rolls off as the machine shakes hard. */
function PlainLog({ x, y, rolls }: { x: number; y: number; rolls: number }) {
  const sequence = useSequence()
  const log = useRef<Group>(null)
  const started = useRef<number | null>(null)
  useFrame(() => {
    if (!rolls || !sequence || !log.current) return
    const { shaking, logs } = sequence.readouts
    // Back on the pile after a reset (the stove empty again).
    if (logs.length === 0) started.current = null
    else if (started.current === null && shaking >= ROLL.shaking) started.current = sequence.time
    const p =
      started.current === null ? 0 : Math.min(1, (sequence.time - started.current) / ROLL.time)
    const along = rolls * ROLL.distance * p
    log.current.position.set(logPile.x + x + along, y - (y - WOOD.radius) * p * p, logPile.z)
    // Rolling, it turns about its own length (back to front).
    log.current.rotation.z = -along / WOOD.radius
  })
  return (
    <group ref={log} position={[logPile.x + x, y, logPile.z]}>
      <ToonMesh rotation={[Math.PI / 2, 0, 0]} color={palette.woodDark}>
        <cylinderGeometry args={[WOOD.radius, WOOD.radius * 1.05, WOOD.length, 10]} />
      </ToonMesh>
    </group>
  )
}
/**
 * Doc's special logs stacked on top, back to front like the others, to go in
 * in their order: green 1 on top, taken first, over yellow 2 and red 3.
 */
const SPECIAL = [
  { color: palette.logGreen, x: 0, row: 3 },
  { color: '#e0b43a', x: -0.06, row: 2 },
  { color: palette.dialRed, x: 0.06, row: 2 },
].map(({ color, x, row }, i) => ({
  color,
  number: i + 1,
  home: new Vector3(logPile.x + x, rowY(row), logPile.z),
}))

/** On the pile, the logs lie back to front: a quarter turn from the special log's own X. */
const LYING = Math.PI / 2

/** One special log: dragged to the stove door, then sliding in. */
function SpecialLog({ index }: { index: number }) {
  const sequence = useSequence()
  const log = useRef<Group>(null)
  const { color, number, home } = SPECIAL[index]!
  /** Once in: when it went (sequence time), and where and how it lay then. */
  const going = useRef<{ at: number; from: Vector3; turn: number } | null>(null)
  const isIn = () => sequence?.readouts.logs.includes(number) ?? false
  useFrame(() => {
    if (!log.current || !sequence) return
    if (!isIn()) {
      // Back on the pile after a reset.
      if (going.current) {
        going.current = null
        log.current.position.copy(home)
        log.current.rotation.y = LYING
      }
      log.current.visible = true
      return
    }
    going.current ??= {
      at: sequence.time,
      from: log.current.position.clone(),
      turn: log.current.rotation.y,
    }
    const { at, from, turn } = going.current
    const p = stoking(sequence.time - at).log
    log.current.visible = p < 1
    // To the open door's mouth, turning end on, then in through it.
    const toMouth = Math.min(1, p / 0.6)
    const inward = Math.max(0, (p - 0.6) / 0.4)
    log.current.position.lerpVectors(from, MOUTH, toMouth).lerp(INSIDE, inward)
    log.current.rotation.y = turn + (LYING - turn) * toMouth
  })
  return (
    <Handle
      actions={['loadStove']}
      // Any log can go in, till it is in: out of their order, the run is doomed.
      when={() => !isIn()}
      drag={{
        target: DOOR,
        drop: () => sequence?.load(number),
        // Held, it turns square to the view so its number shows; let go, back on
        // the pile, unless it went in (then it slides in from where it was let go).
        move: (point) => {
          if (!log.current || (!point && isIn())) return
          log.current.position.copy(point ?? home)
          log.current.rotation.y = point ? 0 : LYING
        },
      }}
    >
      <NumberedLog
        ref={log}
        position={home}
        rotation={[0, LYING, 0]}
        number={number}
        color={color}
      />
    </Handle>
  )
}

/**
 * The log pile out in front, on the floor: plain logs lying back to front,
 * and Doc's three special numbered ones stacked on top, to take to the stove in turn.
 */
export function LogPile() {
  return (
    <group>
      {PLAIN.map((log) => (
        <PlainLog key={`${log.x}:${log.y}`} {...log} />
      ))}
      {SPECIAL.map((_, i) => (
        <SpecialLog key={i} index={i} />
      ))}
    </group>
  )
}

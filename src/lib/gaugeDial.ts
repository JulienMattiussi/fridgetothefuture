/** How one gauge's dial is drawn: no two gauges in the machine share one. */
export interface DialDesign {
  /** The scale's arc, in radians, centered on straight up. */
  sweep: number
  /** Minor graduations over the arc, and every how many a major one falls. */
  ticks: number
  majorEvery: number
  /** Where the red zone starts along the arc (0 to 1), up to its high end. */
  redFrom: number
  /** A thin ring halfway in, and a little second dial low on the face. */
  innerRing: boolean
  subDial: boolean
  needle: 'plain' | 'arrow' | 'spade'
  /** The rim's thickness, relative to the dial's radius. */
  bezel: number
}

/** A small seeded generator (mulberry32): the same seed, the same dial. */
function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const NEEDLES: DialDesign['needle'][] = ['plain', 'arrow', 'spade']
const MAJOR_EVERY = [4, 5, 10]

export function dialDesign(seed: number): DialDesign {
  const next = random(seed)
  const pick = <T>(list: T[]): T => list[Math.floor(next() * list.length)]!
  const majorEvery = pick(MAJOR_EVERY)
  return {
    sweep: ((240 + Math.round(next() * 60)) * Math.PI) / 180,
    majorEvery,
    ticks: majorEvery * (3 + Math.floor(next() * 4)),
    redFrom: next() < 0.25 ? 1 : 0.65 + next() * 0.25,
    innerRing: next() < 0.5,
    subDial: next() < 0.4,
    needle: pick(NEEDLES),
    bezel: 0.1 + next() * 0.08,
  }
}

/** The graduations: their angles clockwise from straight up, major or not. */
export function dialTicks({ sweep, ticks, majorEvery }: DialDesign) {
  return Array.from({ length: ticks + 1 }, (_, i) => ({
    angle: -sweep / 2 + (sweep * i) / ticks,
    major: i % majorEvery === 0,
  }))
}

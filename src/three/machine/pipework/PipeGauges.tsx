import { atX, lerp } from '@/lib/geometry'
import { palette } from '@/three/palette'
import { MountedGauge, type MountedGaugeProps } from '@/three/parts/MountedGauge'
import {
  coilUnit,
  HIGH_RUN_RADIUS,
  onHighRun,
  onRedLine,
  onThin2Run,
  onThinLastRun,
  RED_DOWN_X,
  RED_LINE_RADIUS,
  RED_LONG_RADIUS,
  RED_LOW,
  RED_TURN,
  RIGHT_SMALL,
  SMALL,
  THIN2_BEND,
  THIN2_RADIUS,
  THIN2_RUN_TO,
  UNDER_SHELF_Y,
  VAT_FRONT_PIPE,
} from '@/three/machine/pipework/anchors'

/**
 * Every gauge standing on a pipe. Each has its own size, so its own dial
 * (see Gauge).
 */
const gauges: MountedGaugeProps[] = [
  // Over the black block, on the second thin pipe's run, in front of the long
  // red diagonal (docs/references/video-bobine.jpg): the big dark one on a
  // stem, the small white one to its right and lower, on a square fitting.
  {
    on: onThin2Run(-1.6),
    side: 'up',
    pipeRadius: THIN2_RADIUS,
    stem: 0.05,
    radius: 0.182,
    face: palette.dialDark,
    needle: palette.dial,
    rod: 0.025,
  },
  {
    on: onThin2Run(-1.36),
    side: 'up',
    pipeRadius: THIN2_RADIUS,
    stem: 0.03,
    radius: 0.118,
    reading: 0.4,
    block: true,
  },
  // On the first thin pipe just out of the black block (the film's white disc).
  { on: [-1.79, 1.07, coilUnit.z + 0.26], side: 'up', stem: 0.04, radius: 0.097, reading: -1.1 },
  // On the thin pipes' last run, right against the boiler.
  { on: onThinLastRun(0.45), side: 'up', stem: 0.08, radius: 0.066, reading: -0.4 },
  // On the second thin pipe's slope over the big blue pipe.
  {
    on: lerp(THIN2_RUN_TO, THIN2_BEND, 0.3),
    side: 'up',
    stem: 0.06,
    radius: 0.081,
    reading: 0.5,
  },
  // On top of the long red diagonal.
  {
    on: atX(RED_LOW, RED_TURN, -0.85),
    side: 'up',
    pipeRadius: RED_LONG_RADIUS,
    stem: 0.06,
    radius: 0.094,
    reading: 0.6,
    rod: 0.014,
  },
  // Out in front of the high run through the deck's frame.
  {
    on: onHighRun(-1.44),
    side: 'front',
    pipeRadius: HIGH_RUN_RADIUS,
    stem: 0.074,
    radius: 0.072,
    reading: -0.3,
  },
  // On the small pipe down the vat's front.
  {
    on: [VAT_FRONT_PIPE.x, 2.85, VAT_FRONT_PIPE.z],
    side: 'front',
    pipeRadius: SMALL,
    stem: 0.06,
    radius: 0.104,
    reading: -0.5,
  },
  // Under the shelf: the big porthole gauge hanging from the red line's run
  // back to the vat, and a small one in front of the right small pipe.
  {
    on: [RED_DOWN_X, UNDER_SHELF_Y, 0.45],
    side: 'down',
    pipeRadius: RED_LINE_RADIUS,
    stem: 0.05,
    radius: 0.168,
    reading: -0.2,
    rod: 0.018,
  },
  {
    on: [2.62, UNDER_SHELF_Y, RIGHT_SMALL.z],
    side: 'front',
    pipeRadius: SMALL,
    stem: 0.065,
    radius: 0.077,
    reading: 1.0,
    rod: 0.01,
  },
  // Hanging under the red line, past where the blue pipe tees in.
  {
    on: onRedLine(1.42),
    side: 'down',
    pipeRadius: RED_LINE_RADIUS,
    stem: 0.04,
    radius: 0.086,
    reading: 0.2,
  },
]

export function PipeGauges() {
  return (
    <group>
      {gauges.map((gauge) => (
        <MountedGauge key={gauge.radius} {...gauge} />
      ))}
    </group>
  )
}

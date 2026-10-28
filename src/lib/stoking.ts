/*
 * A log going into the stove, after it is dropped on the fire door: the door
 * swings open, the log slides in, the door swings shut. Times in seconds from
 * the drop.
 */

const OPEN = { from: 0, to: 0.3 }
const LOG_IN = { from: 0.2, to: 0.85 }
const SHUT = { from: 0.9, to: 1.2 }

const ramp = (t: number, { from, to }: { from: number; to: number }) =>
  Math.min(1, Math.max(0, (t - from) / (to - from)))
/** Eased in and out, so the door and the log start and stop gently. */
const ease = (v: number) => v * v * (3 - 2 * v)

/** How open the door is (0 shut, 1 wide open) and how far in the log is (0 to 1), `t` after the drop. */
export function stoking(t: number) {
  return {
    door: ease(ramp(t, OPEN)) - ease(ramp(t, SHUT)),
    log: ease(ramp(t, LOG_IN)),
  }
}

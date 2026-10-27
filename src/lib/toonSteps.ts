/**
 * The light levels of a cell-shaded material: `count` flat tones, evenly
 * spread from `darkest` to full light (0-255). three.js samples them as a
 * gradient map, which turns smooth lighting into hard bands.
 */
export function toonSteps(count: number, darkest = 64): Uint8Array {
  if (!Number.isInteger(count) || count < 2) {
    throw new RangeError(`A toon gradient needs at least 2 steps, got ${count}`)
  }
  const steps = new Uint8Array(count)
  for (let i = 0; i < count; i++) {
    steps[i] = Math.round(darkest + ((255 - darkest) * i) / (count - 1))
  }
  return steps
}

import { useEffect, useMemo } from 'react'
import { DataTexture, NearestFilter, RedFormat } from 'three'
import { toonSteps } from '@/lib/toonSteps'

/** The gradient map shared by the toon materials: 3 hard light bands. */
export function useToonGradient(): DataTexture {
  const texture = useMemo(() => {
    const steps = toonSteps(3)
    const map = new DataTexture(steps, steps.length, 1, RedFormat)
    // Nearest: no blending between bands, which is the whole cell look.
    map.minFilter = NearestFilter
    map.magFilter = NearestFilter
    map.needsUpdate = true
    return map
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

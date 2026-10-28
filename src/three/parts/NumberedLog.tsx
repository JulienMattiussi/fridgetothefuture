import { type ThreeElements } from '@react-three/fiber'
import { forwardRef, useMemo } from 'react'
import { CanvasTexture, type Group, SRGBColorSpace, Vector2 } from 'three'
import { palette } from '@/three/palette'
import { ToonMesh } from '@/three/parts/ToonMesh'

type NumberedLogProps = ThreeElements['group'] & {
  number: number
  color: string
  length?: number
  radius?: number
}

/** The paint, unrolled: around the log across, along it down. */
const PAINT = { around: 256, along: 128 }
/** The white band's share of the length, in the middle. */
const BAND = 0.36

/**
 * The paint on the log: its color with brown wavy stripes at both ends, and
 * the white band between black lines, the number on it four times round, so one always shows.
 */
function paint(number: number, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = PAINT.around
  canvas.height = PAINT.along
  const g = canvas.getContext('2d')!
  const { around: w, along: h } = PAINT
  g.fillStyle = color
  g.fillRect(0, 0, w, h)
  g.strokeStyle = palette.woodDark
  g.lineWidth = 3
  for (let x = 0; x < w; x += 18) {
    g.beginPath()
    for (let y = 0; y <= h; y += 4) g.lineTo(x + 5 * Math.sin(y / 9 + x), y)
    g.stroke()
  }
  const bandFrom = (h * (1 - BAND)) / 2
  g.fillStyle = palette.enamel
  g.fillRect(0, bandFrom, w, h * BAND)
  g.fillStyle = palette.ink
  g.fillRect(0, bandFrom, w, 3)
  g.fillRect(0, bandFrom + h * BAND - 3, w, 3)
  g.font = `bold ${Math.round(h * BAND * 0.8)}px sans-serif`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  // The one at 0 straddles the seam, facing front: drawn again at 1 to close it.
  for (const u of [0, 0.25, 0.5, 0.75, 1]) {
    // Turned a quarter, to read along the log once it lies down.
    g.save()
    g.translate(u * w, h / 2)
    g.rotate(Math.PI / 2)
    g.fillText(String(number), 0, 0)
    g.restore()
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/**
 * One of Doc's special logs, the Playmobil way: a painted roll, wider at the
 * ends, a numbered white band round its waist. It lies along X.
 */
export const NumberedLog = forwardRef<Group, NumberedLogProps>(function NumberedLog(
  { number, color, length = 0.32, radius = 0.05, ...props },
  ref,
) {
  const map = useMemo(() => paint(number, color), [number, color])
  // The profile, end to end: waisted in the middle, flared at the ends.
  const profile = useMemo(
    () =>
      Array.from({ length: 13 }, (_, i) => {
        const t = i / 12
        return new Vector2(radius * (0.85 + 0.25 * (2 * t - 1) ** 2), length * (t - 0.5))
      }),
    [length, radius],
  )
  return (
    <group ref={ref} {...props}>
      <ToonMesh rotation={[0, 0, Math.PI / 2]} color="#ffffff" map={map}>
        <latheGeometry args={[profile, 24]} />
      </ToonMesh>
      {/* Its two flat ends. */}
      {[-1, 1].map((side) => (
        <ToonMesh
          key={side}
          position={[(side * length) / 2, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          color={color}
          outline={0}
        >
          <cylinderGeometry args={[radius * 1.1, radius * 1.1, 0.002, 24]} />
        </ToonMesh>
      ))}
    </group>
  )
})

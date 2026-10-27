import { fitDistance } from '@/lib/framing'

// At 90 degrees, tan(fov / 2) is 1: the visible height equals twice the distance.
describe('fitDistance', () => {
  it('fits the height on a wide window', () => {
    expect(fitDistance({ width: 4, height: 4 }, 90, 2)).toBeCloseTo(2)
  })

  it('fits the width on a narrow window', () => {
    expect(fitDistance({ width: 4, height: 4 }, 90, 0.5)).toBeCloseTo(4)
  })
})

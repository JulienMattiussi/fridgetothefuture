import { toonSteps } from '@/lib/toonSteps'

describe('toonSteps', () => {
  it('spreads the tones evenly from the darkest to full light', () => {
    expect([...toonSteps(3, 55)]).toEqual([55, 155, 255])
  })

  it('defaults to a dark tone that keeps the shadows readable', () => {
    expect([...toonSteps(2)]).toEqual([64, 255])
  })

  it('refuses a gradient with less than 2 tones', () => {
    expect(() => toonSteps(1)).toThrow(RangeError)
    expect(() => toonSteps(2.5)).toThrow(RangeError)
  })
})

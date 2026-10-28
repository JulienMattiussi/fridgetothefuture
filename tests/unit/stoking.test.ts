import { stoking } from '@/lib/stoking'

describe('stoking', () => {
  it('starts with the door shut and the log out', () => {
    expect(stoking(0)).toEqual({ door: 0, log: 0 })
  })

  it('opens the door before the log goes in', () => {
    const early = stoking(0.15)
    expect(early.door).toBeGreaterThan(0)
    expect(early.log).toBe(0)
  })

  it('holds the door wide open while the log slides in', () => {
    const middle = stoking(0.5)
    expect(middle.door).toBe(1)
    expect(middle.log).toBeGreaterThan(0)
    expect(middle.log).toBeLessThan(1)
  })

  it('shuts the door once the log is in', () => {
    expect(stoking(0.88)).toEqual({ door: 1, log: 1 })
    expect(stoking(1.05).door).toBeGreaterThan(0)
    expect(stoking(1.05).door).toBeLessThan(1)
    expect(stoking(2)).toEqual({ door: 0, log: 1 })
  })
})

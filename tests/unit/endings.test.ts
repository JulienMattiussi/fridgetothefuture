import { ENDINGS, endingNumber, parseSeen, reach } from '@/lib/endings'

describe('endings', () => {
  it('numbers the iced tea first, then each breakdown', () => {
    expect(endingNumber('served')).toBe(1)
    expect(endingNumber('boilerExplodes')).toBe(2)
    expect(new Set(ENDINGS.map(endingNumber)).size).toBe(ENDINGS.length)
  })

  it('reads back the endings seen, dropping anything unknown or broken', () => {
    expect(parseSeen(null)).toEqual([])
    expect(parseSeen('not json')).toEqual([])
    expect(parseSeen('{"a":1}')).toEqual([])
    expect(parseSeen('["water","nope","served"]')).toEqual(['served', 'water'])
  })

  it('tells a new ending from one already seen', () => {
    expect(reach([], 'water')).toEqual({ seen: ['water'], isNew: true })
    expect(reach(['water'], 'water')).toEqual({ seen: ['water'], isNew: false })
  })
})

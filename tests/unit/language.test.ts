import { pickLanguage } from '@/lib/language'

describe('pickLanguage', () => {
  it("keeps the visitor's own choice first", () => {
    expect(pickLanguage('en', ['fr-FR'])).toBe('en')
  })

  it("else takes the first of the browser's languages it speaks", () => {
    expect(pickLanguage(null, ['de-DE', 'fr-CA', 'en'])).toBe('fr')
    expect(pickLanguage('klingon', ['EN-us'])).toBe('en')
  })

  it('falls back on English', () => {
    expect(pickLanguage(null, ['de', 'ja'])).toBe('en')
  })
})

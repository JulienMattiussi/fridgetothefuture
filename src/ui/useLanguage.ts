import { createContext, useContext } from 'react'
import type { Language } from '@/lib/language'
import { TEXTS } from '@/i18n/texts'

export const LanguageContext = createContext<{
  language: Language
  setLanguage: (language: Language) => void
}>({ language: 'en', setLanguage: () => {} })

/** The language, how to change it, and every text in it. */
export function useLanguage() {
  const context = useContext(LanguageContext)
  return { ...context, t: TEXTS[context.language] }
}

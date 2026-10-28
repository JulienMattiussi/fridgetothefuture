import { type ReactNode, useEffect, useState } from 'react'
import { type Language, pickLanguage } from '@/lib/language'
import { TEXTS } from '@/i18n/texts'
import { LanguageContext } from '@/ui/useLanguage'

/** Where the visitor's choice of language is kept, in this browser. */
const KEY = 'fridgetothefuture:language'

function stored() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

/** The page's language: the visitor's choice, kept, else the browser's. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(() => pickLanguage(stored(), navigator.languages))
  useEffect(() => {
    document.documentElement.lang = language
    document.title = TEXTS[language].title
  }, [language])
  const choose = (next: Language) => {
    setLanguage(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Storage off (a private window): the choice holds for this visit only.
    }
  }
  return <LanguageContext value={{ language, setLanguage: choose }}>{children}</LanguageContext>
}

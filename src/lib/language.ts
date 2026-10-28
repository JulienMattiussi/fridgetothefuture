/** The page's languages. */
export type Language = 'fr' | 'en'

const LANGUAGES: Language[] = ['fr', 'en']

/**
 * The language to show: the visitor's own choice if stored, else the first
 * of the browser's languages the page speaks, else English.
 */
export function pickLanguage(stored: string | null, preferred: readonly string[]): Language {
  if (LANGUAGES.includes(stored as Language)) return stored as Language
  for (const tag of preferred) {
    const language = tag.slice(0, 2).toLowerCase() as Language
    if (LANGUAGES.includes(language)) return language
  }
  return 'en'
}

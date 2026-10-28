import type { Language } from '@/lib/language'
import { useLanguage } from '@/ui/useLanguage'

const OPTIONS: { language: Language; label: string }[] = [
  { language: 'fr', label: 'FR' },
  { language: 'en', label: 'EN' },
]

/** The language switch, top right: two brass-framed keys, the chosen one lit. */
export function LanguageSwitch() {
  const { language, setLanguage, t } = useLanguage()
  return (
    <div
      role="group"
      aria-label={t.language}
      className="absolute top-4 right-4 flex rounded-full bg-linear-to-b from-[#f4dc98] via-[#b07d36] to-[#5c3a14] p-[2px] shadow-[0_6px_18px_rgba(0,0,0,0.6)]"
    >
      <div className="flex rounded-full bg-[#1c110a] p-0.5 font-serif">
        {OPTIONS.map((option) => {
          const on = option.language === language
          return (
            <button
              key={option.language}
              type="button"
              lang={option.language}
              aria-pressed={on}
              onClick={() => setLanguage(option.language)}
              className={`rounded-full px-3 py-1 text-sm font-bold tracking-widest transition focus-visible:outline-2 focus-visible:outline-[#f0cf7f] ${
                on
                  ? 'bg-linear-to-b from-[#d9b25f] to-[#8a5a22] text-[#1c110a] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]'
                  : 'text-[#d8c3a0] hover:text-[#f0cf7f]'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

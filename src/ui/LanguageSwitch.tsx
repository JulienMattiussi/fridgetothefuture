import type { Language } from '@/lib/language'
import { useLanguage } from '@/ui/useLanguage'

const OPTIONS: { language: Language; label: string }[] = [
  { language: 'fr', label: 'FR' },
  { language: 'en', label: 'EN' },
]

/** The language switch, top right: two keys in a brass frame, a brass knob sliding under the chosen one. */
export function LanguageSwitch() {
  const { language, setLanguage, t } = useLanguage()
  return (
    <div
      role="group"
      aria-label={t.language}
      className="absolute top-4 right-4 flex rounded-full bg-linear-to-b from-[#f4dc98] via-[#b07d36] to-[#5c3a14] p-[2px] shadow-[0_6px_18px_rgba(0,0,0,0.6)]"
    >
      <div className="relative flex rounded-full bg-[#1c110a] p-0.5 font-serif">
        {/* The brass knob sliding under the chosen language. */}
        <span
          aria-hidden="true"
          className={`absolute top-0.5 bottom-0.5 left-0.5 w-12 rounded-full bg-linear-to-b from-[#d9b25f] to-[#8a5a22] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.6)] transition-transform duration-200 ease-out ${
            language === OPTIONS[0]!.language ? 'translate-x-0' : 'translate-x-12'
          }`}
        />
        {OPTIONS.map((option) => {
          const on = option.language === language
          return (
            <button
              key={option.language}
              type="button"
              lang={option.language}
              aria-pressed={on}
              onClick={() => setLanguage(option.language)}
              className={`relative w-12 rounded-full py-1 text-sm font-bold tracking-widest transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[#f0cf7f] ${
                on ? 'text-[#1c110a]' : 'text-[#d8c3a0] hover:text-[#f0cf7f]'
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

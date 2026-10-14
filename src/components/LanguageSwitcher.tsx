import { useTranslation } from 'react-i18next'
import { getAppLanguage, setAppLanguage, type AppLang } from '../i18n'

/**
 * Industry-standard language toggle built on `react-i18next`.
 * - Persists to localStorage (`vivah-lang`)
 * - Syncs <html lang> + document.title via src/i18n/index.ts
 * - All copy comes from src/i18n/locales/{en,hi}.json
 */
export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()
  const current = getAppLanguage()

  const switchTo = (lng: AppLang) => {
    if (lng !== current) void setAppLanguage(lng)
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-gold-500/40 bg-white/80 p-1 text-xs font-semibold shadow-card backdrop-blur"
      role="group"
      aria-label={t('header.language')}
    >
      {(['en', 'hi'] as const).map((lng) => {
        const active = current === lng
        return (
          <button
            key={lng}
            type="button"
            onClick={() => switchTo(lng)}
            aria-pressed={active}
            className={`rounded-full px-3 py-1.5 transition ${
              active
                ? 'bg-navy-900 text-white shadow'
                : 'text-navy-900/70 hover:bg-gold-100 hover:text-navy-900'
            } ${compact ? 'px-2.5' : ''}`}
          >
            {lng === 'en' ? t('lang.en') : t('lang.hi')}
          </button>
        )
      })}
    </div>
  )
}

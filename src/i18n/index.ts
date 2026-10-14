import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import hi from './locales/hi.json'

export const SUPPORTED_LANGS = ['en', 'hi'] as const
export type AppLang = (typeof SUPPORTED_LANGS)[number]
export const DEFAULT_LANG: AppLang = 'en'
export const LANG_STORAGE_KEY = 'vivah-lang'

function syncDocumentLang(lng: string) {
  // SSR/prerender has no DOM — skip (prerender sets <html lang> itself).
  if (typeof document === 'undefined') return
  const lang: AppLang = lng === 'hi' ? 'hi' : 'en'
  document.documentElement.lang = lang
  document.title =
    lang === 'hi'
      ? (hi.meta.title as string)
      : (en.meta.title as string)
}

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        hi: { translation: hi },
      },
      fallbackLng: DEFAULT_LANG,
      supportedLngs: [...SUPPORTED_LANGS],
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        lookupLocalStorage: LANG_STORAGE_KEY,
        caches: ['localStorage'],
      },
      interpolation: { escapeValue: false },
      returnEmptyString: false,
    })
  syncDocumentLang(i18n.resolvedLanguage ?? i18n.language ?? DEFAULT_LANG)
  i18n.on('languageChanged', syncDocumentLang)
}

export function setAppLanguage(lng: AppLang) {
  localStorage.setItem(LANG_STORAGE_KEY, lng)
  return i18n.changeLanguage(lng)
}

export function getAppLanguage(): AppLang {
  return (i18n.resolvedLanguage === 'hi' ? 'hi' : 'en') as AppLang
}

export default i18n

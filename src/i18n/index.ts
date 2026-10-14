import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import hi from './locales/hi.json'

export const SUPPORTED_LANGS = ['en', 'hi'] as const
export type AppLang = (typeof SUPPORTED_LANGS)[number]
export const DEFAULT_LANG: AppLang = 'en'
export const LANG_STORAGE_KEY = 'vivah-lang'

/**
 * Determines initial language based on URL pathname (e.g., /hi) or saved preference.
 */
function getInitialLanguage(): AppLang {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname.toLowerCase()
    if (pathname === '/hi' || pathname.startsWith('/hi/')) {
      return 'hi'
    }
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    if (stored === 'hi' || stored === 'en') {
      return stored
    }
  }
  return DEFAULT_LANG
}

function syncDocumentLang(lng: string) {
  // SSR/prerender has no DOM — skip (prerender sets <html lang> itself).
  if (typeof document === 'undefined') return
  const lang: AppLang = lng === 'hi' ? 'hi' : 'en'
  document.documentElement.lang = lang
}

if (!i18n.isInitialized) {
  const initialLang = getInitialLanguage()

  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        hi: { translation: hi },
      },
      lng: initialLang,
      fallbackLng: DEFAULT_LANG,
      supportedLngs: [...SUPPORTED_LANGS],
      detection: {
        order: ['path', 'localStorage', 'htmlTag', 'navigator'],
        lookupFromPathIndex: 0,
        lookupLocalStorage: LANG_STORAGE_KEY,
        caches: ['localStorage'],
      },
      interpolation: { escapeValue: false },
      returnEmptyString: false,
    })

  syncDocumentLang(initialLang)
  i18n.on('languageChanged', syncDocumentLang)

  // Listen to browser Back/Forward navigation to sync language with URL
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
      const isHi = window.location.pathname === '/hi' || window.location.pathname.startsWith('/hi/')
      const targetLng: AppLang = isHi ? 'hi' : 'en'
      if (i18n.language !== targetLng) {
        void i18n.changeLanguage(targetLng)
      }
    })
  }
}

/**
 * Changes active language, saves to localStorage, and updates URL path (/ or /hi).
 */
export function setAppLanguage(lng: AppLang) {
  localStorage.setItem(LANG_STORAGE_KEY, lng)
  if (typeof window !== 'undefined') {
    const isHi = lng === 'hi'
    const targetPath = isHi ? '/hi' : '/'
    if (window.location.pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath + window.location.hash)
    }
  }
  return i18n.changeLanguage(lng)
}

export function getAppLanguage(): AppLang {
  if (typeof window !== 'undefined') {
    const isHi = window.location.pathname === '/hi' || window.location.pathname.startsWith('/hi/')
    if (isHi) return 'hi'
  }
  return (i18n.resolvedLanguage === 'hi' || i18n.language === 'hi' ? 'hi' : 'en') as AppLang
}

export default i18n

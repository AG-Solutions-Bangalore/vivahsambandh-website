import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import SmoothScroll from './components/motion/SmoothScroll'
import { getLenis, resolveHashId, scrollToAnchor } from './lib/scroll'
import { DEFERRED_SECTION_IDS, whenSectionReady } from './lib/deferredSections'
import { refreshScrollTriggers } from './lib/gsap-setup'
import HomePage from './module/home/pages/HomePage'
import AboutPage from './module/about/pages/AboutPage'
import ContactPage from './module/contact/pages/ContactPage'
import type { AppLang } from './i18n'

/**
 * URL is the source of truth for language: `/hi*` → Hindi, else English.
 * Covers direct loads, Back/Forward, and language-switch navigations —
 * i18next follows the route instead of fighting it.
 */
function LanguageSync() {
  const { pathname } = useLocation()
  const { i18n } = useTranslation()
  const routeLang: AppLang = pathname === '/hi' || pathname.startsWith('/hi/') ? 'hi' : 'en'

  useEffect(() => {
    if (i18n.language !== routeLang) {
      void i18n.changeLanguage(routeLang)
    }
  }, [i18n, routeLang])

  return null
}

/**
 * Router scroll behavior (React Router ships none by default):
 * - Page change → instant top (no animated sweep across pages).
 * - Hash change → Lenis smooth-scroll to the anchor; deferred home
 *   sections mount on demand first (same flow as the click interceptor).
 * - First paint is skipped — prerendered HTML + HomePage's own deep-link
 *   effect already own the initial position.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (hash) {
      if (!scrollToAnchor(hash)) {
        const id = resolveHashId(hash)
        if (DEFERRED_SECTION_IDS.has(id)) {
          void whenSectionReady(id).then(() => scrollToAnchor(hash))
        }
      }
    } else {
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(0, { immediate: true })
      else window.scrollTo(0, 0)
    }
    refreshScrollTriggers()
  }, [pathname, hash])

  return null
}

export default function App() {
  const { i18n } = useTranslation()

  // Translated copy changes layout heights → re-measure ScrollTriggers.
  useEffect(() => {
    const onLangChange = () => refreshScrollTriggers()
    i18n.on('languageChanged', onLangChange)
    return () => {
      i18n.off('languageChanged', onLangChange)
    }
  }, [i18n])

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-cream-50">
        <LanguageSync />
        <ScrollManager />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hi" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/hi/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/hi/contact" element={<ContactPage />} />
            {/* Unknown paths fall back home (client-side; hosts serving
                static files may still 404 direct hits — see README). */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  )
}

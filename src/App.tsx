import { useEffect, useRef, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import SmoothScroll from './components/motion/SmoothScroll'
import { getLenis, resolveHashId, scrollToAnchor } from './lib/scroll'
import { DEFERRED_SECTION_IDS, whenSectionReady } from './lib/deferredSections'
import { refreshScrollTriggers } from './lib/gsap-setup'
import HomePage from './module/home/pages/HomePage'
import { QueryProvider } from './lib/api/queryClient'
import type { AppLang } from './i18n'

// Code-split non-home routes so the initial homepage bundle is feather-light
const AboutPage = lazy(() => import('./module/about/pages/AboutPage'))
const StoriesPage = lazy(() => import('./module/stories/pages/StoriesPage'))
const MembershipPage = lazy(() => import('./module/membership/pages/MembershipPage'))
const BlogsPage = lazy(() => import('./module/blog/pages/BlogsPage'))
const BlogDetailPage = lazy(() => import('./module/blog/pages/BlogDetailPage'))
const ContactPage = lazy(() => import('./module/contact/pages/ContactPage'))
const PrivacyPage = lazy(() => import('./module/legal/pages/PrivacyPage'))
const TermsPage = lazy(() => import('./module/legal/pages/TermsPage'))
const GuidelinesPage = lazy(() => import('./module/legal/pages/GuidelinesPage'))
const HelpCenterPage = lazy(() => import('./module/legal/pages/HelpCenterPage'))
const RegistrationPage = lazy(() => import('./module/registration/pages/RegistrationPage'))

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
    <QueryProvider>
      <SmoothScroll>
        <div className="min-h-screen bg-cream-50">
          <LanguageSync />
          <ScrollManager />
          <Header />
          <main>
            <Routes>
              {/* Critical Homepage routes stay static & instant */}
              <Route path="/" element={<HomePage />} />
              <Route path="/hi" element={<HomePage />} />

              {/* Other routes split into isolated on-demand chunks */}
              <Route
                path="/about"
                element={
                  <Suspense fallback={null}>
                    <AboutPage />
                  </Suspense>
                }
              />
              <Route
                path="/hi/about"
                element={
                  <Suspense fallback={null}>
                    <AboutPage />
                  </Suspense>
                }
              />
              <Route
                path="/stories"
                element={
                  <Suspense fallback={null}>
                    <StoriesPage />
                  </Suspense>
                }
              />
              <Route
                path="/hi/stories"
                element={
                  <Suspense fallback={null}>
                    <StoriesPage />
                  </Suspense>
                }
              />
              <Route
                path="/success-stories"
                element={
                  <Suspense fallback={null}>
                    <StoriesPage />
                  </Suspense>
                }
              />
              <Route
                path="/hi/success-stories"
                element={
                  <Suspense fallback={null}>
                    <StoriesPage />
                  </Suspense>
                }
              />
              <Route
                path="/membership"
                element={
                  <Suspense fallback={null}>
                    <MembershipPage />
                  </Suspense>
                }
              />
              <Route
                path="/hi/membership"
                element={
                  <Suspense fallback={null}>
                    <MembershipPage />
                  </Suspense>
                }
              />
              <Route
                path="/contact"
                element={
                  <Suspense fallback={null}>
                    <ContactPage />
                  </Suspense>
                }
              />
              <Route
                path="/hi/contact"
                element={
                  <Suspense fallback={null}>
                    <ContactPage />
                  </Suspense>
                }
              />
              <Route
                path="/registration"
                element={
                  <Suspense fallback={null}>
                    <RegistrationPage />
                  </Suspense>
                }
              />
              <Route
                path="/hi/registration"
                element={
                  <Suspense fallback={null}>
                    <RegistrationPage />
                  </Suspense>
                }
              />
              <Route
                path="/register"
                element={
                  <Suspense fallback={null}>
                    <RegistrationPage />
                  </Suspense>
                }
              />
              <Route
                path="/hi/register"
                element={
                  <Suspense fallback={null}>
                    <RegistrationPage />
                  </Suspense>
                }
              />
              <Route
                path="/blogs"
                element={
                  <Suspense fallback={null}>
                    <BlogsPage />
                  </Suspense>
                }
              />
              <Route
                path="/hi/blogs"
                element={
                  <Suspense fallback={null}>
                    <BlogsPage />
                  </Suspense>
                }
              />
              <Route
                path="/blogs/:slug"
                element={
                  <Suspense fallback={null}>
                    <BlogDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="/hi/blogs/:slug"
                element={
                  <Suspense fallback={null}>
                    <BlogDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="/privacy"
                element={
                  <Suspense fallback={null}>
                    <PrivacyPage />
                  </Suspense>
                }
              />
              <Route
                path="/hi/privacy"
                element={
                  <Suspense fallback={null}>
                    <PrivacyPage />
                  </Suspense>
                }
              />
              <Route
                path="/terms"
                element={
                  <Suspense fallback={null}>
                    <TermsPage />
                  </Suspense>
                }
              />
              <Route
                path="/hi/terms"
                element={
                  <Suspense fallback={null}>
                    <TermsPage />
                  </Suspense>
                }
              />
              <Route
                path="/guidelines"
                element={
                  <Suspense fallback={null}>
                    <GuidelinesPage />
                  </Suspense>
                }
              />
              <Route
                path="/hi/guidelines"
                element={
                  <Suspense fallback={null}>
                    <GuidelinesPage />
                  </Suspense>
                }
              />
              <Route
                path="/help-center"
                element={
                  <Suspense fallback={null}>
                    <HelpCenterPage />
                  </Suspense>
                }
              />
              <Route
                path="/hi/help-center"
                element={
                  <Suspense fallback={null}>
                    <HelpCenterPage />
                  </Suspense>
                }
              />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </SmoothScroll>
    </QueryProvider>
  )
}

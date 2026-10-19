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
import AboutPage from './module/about/pages/AboutPage'
import StoriesPage from './module/stories/pages/StoriesPage'
import MembershipPage from './module/membership/pages/MembershipPage'
import BlogsPage from './module/blog/pages/BlogsPage'
import { PrivacyPage, TermsPage, GuidelinesPage, HelpCenterPage } from './module/legal'
import ContactPage from './module/contact/pages/ContactPage'
import RegistrationPage from './module/registration/pages/RegistrationPage'
import AdminRegisterPage from './module/registration/pages/AdminRegisterPage'
import DownloadPage from './module/download/pages/DownloadPage'
import { QueryProvider } from './lib/api/queryClient'
import type { AppLang } from './i18n'

// Dynamic route loaded lazily
const BlogDetailPage = lazy(() => import('./module/blog/pages/BlogDetailPage'))

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

export default function AppServer() {
  const { i18n } = useTranslation()

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
              <Route path="/" element={<HomePage />} />
              <Route path="/hi" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/hi/about" element={<AboutPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/hi/stories" element={<StoriesPage />} />
              <Route path="/success-stories" element={<StoriesPage />} />
              <Route path="/hi/success-stories" element={<StoriesPage />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/hi/membership" element={<MembershipPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/hi/contact" element={<ContactPage />} />
              <Route path="/download" element={<DownloadPage />} />
              <Route path="/hi/download" element={<DownloadPage />} />
              <Route path="/registration" element={<RegistrationPage />} />
              <Route path="/hi/registration" element={<RegistrationPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/hi/register" element={<RegistrationPage />} />
              <Route path="/admin-register" element={<AdminRegisterPage />} />
              <Route path="/hi/admin-register" element={<AdminRegisterPage />} />
              <Route path="/blogs" element={<BlogsPage />} />
              <Route path="/hi/blogs" element={<BlogsPage />} />
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
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/hi/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/hi/terms" element={<TermsPage />} />
              <Route path="/guidelines" element={<GuidelinesPage />} />
              <Route path="/hi/guidelines" element={<GuidelinesPage />} />
              <Route path="/help-center" element={<HelpCenterPage />} />
              <Route path="/hi/help-center" element={<HelpCenterPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </SmoothScroll>
    </QueryProvider>
  )
}

import { useEffect, useRef, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import SmoothScroll from './components/motion/SmoothScroll'
import { getLenis, resolveHashId, scrollToAnchor } from './lib/scroll'
import { DEFERRED_SECTION_IDS, whenSectionReady } from './lib/deferredSections'
import { refreshScrollTriggers } from './lib/gsap-setup'
import HomePage from './module/home/pages/HomePage'
import { QueryProvider } from './lib/api/queryClient'
import {
  SuperAdminAuthProvider,
  SuperAdminGuard,
} from './module/super-admin/context/SuperAdminAuthContext'
import { Toaster } from 'react-hot-toast'
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
const AdminRegisterPage = lazy(() => import('./module/registration/pages/AdminRegisterPage'))
const DownloadPage = lazy(() => import('./module/download/pages/DownloadPage'))

// Code-split Super Admin Panel module routes
const PanelLoginPage = lazy(() => import('./module/super-admin/pages/PanelLoginPage'))
const SuperAdminLayout = lazy(() =>
  import('./module/super-admin/components/SuperAdminLayout').then((m) => ({
    default: m.SuperAdminLayout,
  })),
)
const DashboardOverviewPage = lazy(
  () => import('./module/super-admin/pages/DashboardOverviewPage'),
)
const AdminMembersPage = lazy(
  () => import('./module/super-admin/pages/AdminMembersPage'),
)
const PendingAdminMembersPage = lazy(
  () => import('./module/super-admin/pages/PendingAdminMembersPage'),
)
const MembersPage = lazy(() => import('./module/super-admin/pages/MembersPage'))
const PendingMembersPage = lazy(
  () => import('./module/super-admin/pages/PendingMembersPage'),
)
const FeedbackPage = lazy(() => import('./module/super-admin/pages/FeedbackPage'))
const BlockProfilesPage = lazy(
  () => import('./module/super-admin/pages/BlockProfilesPage'),
)
const NotificationsPage = lazy(
  () => import('./module/super-admin/pages/NotificationsPage'),
)
const PanelBlogsPage = lazy(() => import('./module/super-admin/pages/BlogsPage'))
const PanelBlogGalleryPage = lazy(
  () => import('./module/super-admin/pages/BlogGalleryPage'),
)
const PanelEnquiriesPage = lazy(
  () => import('./module/super-admin/pages/EnquiriesPage'),
)
const PanelFaqsPage = lazy(() => import('./module/super-admin/pages/FaqsPage'))
const PanelTestimonialsPage = lazy(
  () => import('./module/super-admin/pages/TestimonialsPage'),
)
const PanelClientsPage = lazy(
  () => import('./module/super-admin/pages/ClientsPage'),
)

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
  const { pathname } = useLocation()
  const isPanelRoute = pathname.startsWith('/panel') || pathname === '/panel-login'

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
      <SuperAdminAuthProvider>
        <Toaster />
        {isPanelRoute ? (
          <div className="min-h-screen bg-cream-50">
            <Routes>
              {/* Super Admin Login */}
              <Route
                path="/panel-login"
                element={
                  <Suspense fallback={null}>
                    <PanelLoginPage />
                  </Suspense>
                }
              />

              {/* Protected Super Admin Panel Routes */}
              <Route
                path="/panel"
                element={<Navigate to="/panel/dashboard" replace />}
              />
              <Route
                path="/panel/dashboard"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <DashboardOverviewPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/panel/admin-members"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <AdminMembersPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/panel/pending-admin-members"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PendingAdminMembersPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/panel/members"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <MembersPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/panel/pending-members"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PendingMembersPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/panel/feedback"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <FeedbackPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/panel/block-profiles"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <BlockProfilesPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/panel/notifications"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <NotificationsPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              <Route
                path="/panel/blog-gallery"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelBlogGalleryPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/panel/gallery"
                element={<Navigate to="/panel/blog-gallery" replace />}
              />
              <Route
                path="/panel/blogs"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelBlogsPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              <Route
                path="/panel/enquiries"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelEnquiriesPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              <Route
                path="/panel/faqs"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelFaqsPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              <Route
                path="/panel/testimonials"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelTestimonialsPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              <Route
                path="/panel/clients"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelClientsPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              {/* Fallback for unmapped panel URLs */}
              <Route
                path="/panel/*"
                element={<Navigate to="/panel/dashboard" replace />}
              />
            </Routes>
          </div>
        ) : (
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
                    path="/download"
                    element={
                      <Suspense fallback={null}>
                        <DownloadPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/hi/download"
                    element={
                      <Suspense fallback={null}>
                        <DownloadPage />
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
                    path="/admin-register"
                    element={
                      <Suspense fallback={null}>
                        <AdminRegisterPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/hi/admin-register"
                    element={
                      <Suspense fallback={null}>
                        <AdminRegisterPage />
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
        )}
      </SuperAdminAuthProvider>
    </QueryProvider>
  )
}


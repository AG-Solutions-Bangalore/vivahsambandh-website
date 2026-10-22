/**
 * @file src/module/super-admin/index.ts
 * Barrel export for the Super Admin module.
 */

export { default as PanelLoginPage } from './pages/PanelLoginPage'
export { default as DashboardOverviewPage } from './pages/DashboardOverviewPage'
export { default as AdminMembersPage } from './pages/AdminMembersPage'
export { default as PendingAdminMembersPage } from './pages/PendingAdminMembersPage'
export { default as MembersPage } from './pages/MembersPage'
export { default as PendingMembersPage } from './pages/PendingMembersPage'
export { default as FeedbackPage } from './pages/FeedbackPage'
export { default as BlockProfilesPage } from './pages/BlockProfilesPage'
export { default as NotificationsPage } from './pages/NotificationsPage'
export { default as BlogsPage } from './pages/BlogsPage'
export { default as BlogEditorPage } from './pages/BlogEditorPage'
export { default as FaqEditorPage } from './pages/FaqEditorPage'
export { default as BlogGalleryPage } from './pages/BlogGalleryPage'
export { default as FaqsPage } from './pages/FaqsPage'
export { default as TestimonialsPage } from './pages/TestimonialsPage'
export { default as EnquiriesPage } from './pages/EnquiriesPage'
export { default as ClientsPage } from './pages/ClientsPage'
export { default as CategoriesPage } from './pages/CategoriesPage'
export { PANEL_NAV_GROUPS, PANEL_NAV_ITEMS, findNavItem, panelDescription } from './navigation'

export { SuperAdminLayout } from './components/SuperAdminLayout'
export { StatusBadge } from './components/StatusBadge'
export { ConfirmDialog } from './components/ConfirmDialog'
export { PanelCard, PanelCardHeader } from './components/PanelCard'
export { PanelPageHeader } from './components/PanelPageHeader'
export { PanelBanner } from './components/PanelBanner'
export { PanelModal } from './components/PanelModal'
export { PanelSearch } from './components/PanelSearch'
export { PanelPagination } from './components/PanelPagination'
export { PanelFilterSelect } from './components/PanelFilterSelect'
export { CategorySelect } from './components/CategorySelect'
export { PanelEmpty, PanelError } from './components/PanelState'
export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  PanelTableSkeleton,
  PanelListSkeleton,
  PanelStatSkeleton,
} from './components/PanelSkeleton'
export {
  PanelTable,
  PanelTableHeadCell,
  PanelTableFooter,
} from './components/PanelTable'
export { BlogEditorForm, BlogPlacementChips } from './components/BlogEditorForm'
export {
  blogToFormValues,
  emptyBlogForm,
  slugify,
  type BlogFormValues,
} from './components/blogForm'
export { FaqEditorForm } from './components/FaqEditorForm'
export {
  emptyFaqForm,
  faqFormToPayload,
  faqToFormValues,
  type FaqFormValues,
  type FaqSubFormValues,
} from './components/faqForm'

export {
  SuperAdminAuthProvider,
  SuperAdminGuard,
  useSuperAdminAuth,
} from './context/SuperAdminAuthContext'

export * from './services/adminApi'
export * from './services/blogApi'
export * from './services/enquiryApi'
export * from './services/faqApi'
export * from './services/testimonialApi'
export * from './services/clientApi'
export * from './services/galleryApi'
export * from './hook/queryKeys'
export * from './hook/useAdminMembers'
export * from './hook/useMembers'
export * from './hook/useFeedbacks'
export * from './hook/useBlockProfiles'
export * from './hook/useNotifications'
export * from './hook/useBlogs'
export * from './hook/useEnquiries'
export * from './hook/useServerList'
export * from './hook/useFaqs'
export * from './hook/useTestimonials'
export * from './hook/useClients'
export * from './hook/useGalleries'
export * from './hook/useCategories'
export * from './hook/useDashboardOverview'
export * from './types'

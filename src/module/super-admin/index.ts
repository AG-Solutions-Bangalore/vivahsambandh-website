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

export { SuperAdminLayout } from './components/SuperAdminLayout'
export { StatusBadge } from './components/StatusBadge'
export { ConfirmDialog } from './components/ConfirmDialog'

export {
  SuperAdminAuthProvider,
  SuperAdminGuard,
  useSuperAdminAuth,
} from './context/SuperAdminAuthContext'

export * from './services/adminApi'
export * from './types'

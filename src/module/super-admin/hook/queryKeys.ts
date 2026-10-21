/**
 * @file src/module/super-admin/hook/queryKeys.ts
 * Central query-key factory for the Super Admin Panel.
 *
 * Mutations invalidate these keys after they land, so they must live in one
 * place — a typo in a hand-written key silently disables cache invalidation
 * and leaves the panel showing stale rows.
 */

export const superAdminKeys = {
  all: ['super-admin'] as const,
  adminMembers: ['super-admin', 'admin-members'] as const,
  pendingAdminMembers: ['super-admin', 'pending-admin-members'] as const,
  members: ['super-admin', 'members'] as const,
  pendingMembers: ['super-admin', 'pending-members'] as const,
  feedbacks: ['super-admin', 'feedbacks'] as const,
  blockProfiles: ['super-admin', 'block-profiles'] as const,
  notifications: ['super-admin', 'notifications'] as const,
  notification: (id: number | string) =>
    ['super-admin', 'notifications', 'detail', id] as const,
}

/**
 * Panel data changes constantly — keep it fresher than the app-wide default
 * of five minutes, otherwise an admin sees stale rows after a decision.
 */
export const PANEL_STALE_TIME = 30_000

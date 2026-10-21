/**
 * @file src/module/super-admin/hook/useDashboardOverview.ts
 * Aggregated panel metrics. Composes the shared list queries instead of
 * issuing its own — the dashboard and the individual pages therefore read
 * from the same cache entries and never duplicate a request.
 */

import { useAdminMembersQuery, usePendingAdminMembersQuery } from './useAdminMembers'
import { useMembersQuery, usePendingMembersQuery } from './useMembers'
import { useFeedbacksQuery } from './useFeedbacks'
import { useBlockProfilesQuery } from './useBlockProfiles'
import { useNotificationsQuery } from './useNotifications'

export function useDashboardOverview() {
  const admins = useAdminMembersQuery()
  const pendingAdmins = usePendingAdminMembersQuery()
  const members = useMembersQuery()
  const pendingMembers = usePendingMembersQuery()
  const feedbacks = useFeedbacksQuery()
  const blockProfiles = useBlockProfilesQuery()
  const notifications = useNotificationsQuery()

  const queries = [
    admins,
    pendingAdmins,
    members,
    pendingMembers,
    feedbacks,
    blockProfiles,
    notifications,
  ]

  const failedCount = queries.filter((query) => query.isError).length

  return {
    adminCount: admins.data?.length ?? 0,
    pendingAdminCount: pendingAdmins.data?.length ?? 0,
    memberCount: members.data?.length ?? 0,
    pendingMemberCount: pendingMembers.data?.length ?? 0,
    feedbackCount: feedbacks.data?.length ?? 0,
    blockCount: blockProfiles.data?.length ?? 0,
    notificationCount: notifications.data?.length ?? 0,

    recentAdmins: (admins.data ?? []).slice(0, 4),
    recentMembers: (members.data ?? []).slice(0, 4),
    recentNotifications: (notifications.data ?? []).slice(0, 3),

    isLoading: queries.some((query) => query.isLoading),
    isFetching: queries.some((query) => query.isFetching),
    error: queries.find((query) => query.isError)?.error ?? null,
    failedCount,
    totalCount: queries.length,
    refetch: async () => {
      await Promise.all(queries.map((query) => query.refetch()))
    },
  }
}

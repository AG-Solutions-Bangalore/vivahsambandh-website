/**
 * @file src/module/super-admin/hook/useMembers.ts
 * React Query hooks for the matrimonial member directory and the pending
 * member moderation queue.
 */

import { useQuery } from '@tanstack/react-query'
import { fetchMembers, fetchPendingMembers } from '../services/adminApi'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapList } from './errors'

export function useMembersQuery() {
  return useQuery({
    queryKey: superAdminKeys.members,
    queryFn: async () => unwrapList(await fetchMembers()),
    staleTime: PANEL_STALE_TIME,
  })
}

export function usePendingMembersQuery() {
  return useQuery({
    queryKey: superAdminKeys.pendingMembers,
    queryFn: async () => unwrapList(await fetchPendingMembers()),
    staleTime: PANEL_STALE_TIME,
  })
}

export { useRemoveDeviceIdMutation } from './useAdminMembers'


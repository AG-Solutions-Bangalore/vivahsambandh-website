/**
 * @file src/module/super-admin/hook/useAdminMembers.ts
 * React Query hooks for the regional administrator directory and the pending
 * admin approval queue.
 *
 * Status changes move a record between the approved and pending lists, so
 * every list that can contain the record is invalidated after a mutation.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  fetchAdminMembers,
  fetchPendingAdminMembers,
  updateMemberCity,
  updateMemberStatus,
} from '../services/adminApi'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapList } from './errors'
import type { AdminMemberStatus, MemberStatus } from '../types'

export function useAdminMembersQuery() {
  return useQuery({
    queryKey: superAdminKeys.adminMembers,
    queryFn: async () => unwrapList(await fetchAdminMembers()),
    staleTime: PANEL_STALE_TIME,
  })
}

export function usePendingAdminMembersQuery() {
  return useQuery({
    queryKey: superAdminKeys.pendingAdminMembers,
    queryFn: async () => unwrapList(await fetchPendingAdminMembers()),
    staleTime: PANEL_STALE_TIME,
  })
}

interface UpdateStatusVariables {
  id: number | string
  status: AdminMemberStatus | MemberStatus
  /** Optional admin-facing copy that replaces the server message in the toast. */
  successMessage?: string
}

export function useUpdateMemberStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: UpdateStatusVariables) =>
      unwrapAction(await updateMemberStatus(id, status)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.adminMembers }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.pendingAdminMembers }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.members }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.pendingMembers }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateCityVariables {
  id: number | string
  cities: string[] | string
  successMessage?: string
}

export function useUpdateMemberCityMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, cities }: UpdateCityVariables) =>
      unwrapAction(await updateMemberCity(id, cities)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.adminMembers }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.pendingAdminMembers }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

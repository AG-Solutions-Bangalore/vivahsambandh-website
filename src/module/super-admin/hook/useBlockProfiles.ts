/**
 * @file src/module/super-admin/hook/useBlockProfiles.ts
 * React Query hooks for the blocked-profile moderation log.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  deleteBlockProfileRecord,
  fetchBlockProfiles,
} from '../services/adminApi'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapList } from './errors'

export function useBlockProfilesQuery() {
  return useQuery({
    queryKey: superAdminKeys.blockProfiles,
    queryFn: async () => unwrapList(await fetchBlockProfiles()),
    staleTime: PANEL_STALE_TIME,
  })
}

interface DeleteBlockProfileVariables {
  id: number | string
  successMessage?: string
}

export function useDeleteBlockProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteBlockProfileVariables) =>
      unwrapAction(await deleteBlockProfileRecord(id)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.blockProfiles })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

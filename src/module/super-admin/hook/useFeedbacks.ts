/**
 * @file src/module/super-admin/hook/useFeedbacks.ts
 * React Query hooks for member feedback and support enquiries.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { deleteFeedbackRecord, fetchFeedbacks } from '../services/adminApi'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapList } from './errors'

export function useFeedbacksQuery() {
  return useQuery({
    queryKey: superAdminKeys.feedbacks,
    queryFn: async () => unwrapList(await fetchFeedbacks()),
    staleTime: PANEL_STALE_TIME,
  })
}

interface DeleteFeedbackVariables {
  id: number | string
  successMessage?: string
}

export function useDeleteFeedbackMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteFeedbackVariables) =>
      unwrapAction(await deleteFeedbackRecord(id)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.feedbacks })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

/**
 * @file src/module/super-admin/hook/useFeedbacks.ts
 * React Query hooks for member feedback and support enquiries.
 */

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { deleteFeedbackRecord, fetchFeedbacks } from '../services/adminApi'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapList } from './errors'
import {
  DEFAULT_PER_PAGE,
  applyLocalList,
  matchesTerm,
  type ListMeta,
} from './useServerList'
import type { FeedbackRecord, PanelListParams } from '../types'

export function useFeedbacksQuery(params: PanelListParams = {}) {
  const query = useQuery({
    queryKey: [...superAdminKeys.feedbacks, params],
    queryFn: async () => unwrapList(await fetchFeedbacks(params)),
    staleTime: PANEL_STALE_TIME,
  })

  const { search, page, per_page } = params

  const local: { records: FeedbackRecord[]; meta: ListMeta } = useMemo(
    () =>
      applyLocalList(query.data ?? [], {
        searchTerm: search,
        matches: (feedback, term) =>
          matchesTerm(term, feedback.name, feedback.message),
        page,
        perPage: per_page ?? DEFAULT_PER_PAGE,
      }),
    [query.data, search, page, per_page],
  )

  return { ...query, records: local.records, meta: local.meta }
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

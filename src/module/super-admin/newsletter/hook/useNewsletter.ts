/**
 * @file src/module/super-admin/newsletter/hook/useNewsletter.ts
 * React Query hooks for the newsletter subscriber list.
 *
 * The endpoint filters and pages on the server, so the query key carries the
 * search term and the page — a new term is a new request, and the previous
 * page stays on screen while it loads.
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  deleteNewsletterSubscriber,
  fetchNewsletterSubscribers,
} from '../api/newsletter.api'
import { PANEL_STALE_TIME, superAdminKeys } from '../../hook/queryKeys'
import { unwrapAction } from '../../hook/errors'
import type { NewsletterListParams } from '../types/newsletter.types'

export function useNewsletterSubscribersQuery(params: NewsletterListParams = {}) {
  return useQuery({
    queryKey: [...superAdminKeys.newsletter, params],
    queryFn: async () => {
      const result = await fetchNewsletterSubscribers(params)
      if (result.error) throw new Error(result.error)
      return result
    },
    staleTime: PANEL_STALE_TIME,
    placeholderData: keepPreviousData,
  })
}

interface DeleteNewsletterVariables {
  id: number | string
  successMessage?: string
}

export function useDeleteNewsletterSubscriberMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteNewsletterVariables) =>
      unwrapAction(await deleteNewsletterSubscriber(id)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.newsletter })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

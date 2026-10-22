/**
 * @file src/module/super-admin/hook/useFaqs.ts
 * React Query hooks for FAQ management: FAQ group list, single-record
 * inspection, creation, update, status update, sub-question deletion, and group deletion.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createFaq,
  deleteFaq,
  deleteFaqSub,
  fetchFaqById,
  fetchFaqs,
  fetchPageTwoOptions,
  type PageTwoOptionItem,
  updateFaq,
  updateFaqStatus,
} from '../services/faqApi'
import { toListMeta } from '../services/mappers'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapItem } from './errors'
import { EMPTY_LIST_META } from './useServerList'
import type { FaqListParams, FaqPayload, FaqStatus, ListMeta } from '../types'

/**
 * The FAQ list. `/faq` pages its rows and filters them on the server, so
 * the search term and the page number travel with the request.
 */
export function useFaqsQuery(params: FaqListParams = {}) {
  const query = useQuery({
    queryKey: [...superAdminKeys.faqs, params],
    queryFn: async () => {
      const result = await fetchFaqs(params)
      if (result.error) throw new Error(result.error)
      return {
        records: result.data,
        meta: toListMeta(result.raw, {
          page: params.page,
          per_page: params.per_page,
          rowCount: result.data.length,
        }),
      }
    },
    staleTime: PANEL_STALE_TIME,
    // Keep the previous page on screen while the next one loads.
    placeholderData: (previous) => previous,
  })

  const records = query.data?.records ?? []
  const meta: ListMeta = query.data?.meta ?? EMPTY_LIST_META

  return { ...query, records, meta }
}

/**
 * Single FAQ group record with sub-items.
 */
export function useFaqQuery(id: number | string | null) {
  return useQuery({
    queryKey: superAdminKeys.faq(id ?? 'none'),
    queryFn: async () => unwrapItem(await fetchFaqById(id as number)),
    enabled: id !== null && id !== undefined,
    staleTime: PANEL_STALE_TIME,
  })
}

interface CreateFaqVariables {
  payload: FaqPayload
  successMessage?: string
}

export function useCreateFaqMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ payload }: CreateFaqVariables) =>
      unwrapAction(await createFaq(payload)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.faqs })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateFaqVariables {
  id: number | string
  payload: FaqPayload
  successMessage?: string
}

export function useUpdateFaqMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateFaqVariables) =>
      unwrapAction(await updateFaq(id, payload)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.faqs }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.faq(variables.id) }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateFaqStatusVariables {
  id: number | string
  status: FaqStatus
  successMessage?: string
}

export function useUpdateFaqStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: UpdateFaqStatusVariables) =>
      unwrapAction(await updateFaqStatus(id, status)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.faqs }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.faq(variables.id) }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface DeleteFaqSubVariables {
  subId: number | string
  faqId?: number | string
  successMessage?: string
}

export function useDeleteFaqSubMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ subId }: DeleteFaqSubVariables) =>
      unwrapAction(await deleteFaqSub(subId)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      if (variables.faqId) {
        await queryClient.invalidateQueries({ queryKey: superAdminKeys.faq(variables.faqId) })
      }
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.faqs })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface DeleteFaqVariables {
  id: number | string
  successMessage?: string
}

export function useDeleteFaqMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteFaqVariables) =>
      unwrapAction(await deleteFaq(id)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.faqs })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Page options for FAQ page placement from getSitemap / page_two table.
 */
export function usePageTwoOptions() {
  return useQuery({
    queryKey: superAdminKeys.pageTwoOptions,
    queryFn: async () => {
      const res = await fetchPageTwoOptions()
      if (res.error) throw new Error(res.error)
      return res.data
    },
    staleTime: 5 * 60_000,
  })
}

// Convenient aliases for developers who use shorter names
export {
  useFaqQuery as useFaq,
  useFaqsQuery as useFaqs,
  useCreateFaqMutation as useCreateFaq,
  useUpdateFaqMutation as useUpdateFaq,
  useUpdateFaqStatusMutation as useUpdateFaqStatus,
  useDeleteFaqSubMutation as useDeleteFaqSub,
  useDeleteFaqMutation as useDeleteFaq,
}


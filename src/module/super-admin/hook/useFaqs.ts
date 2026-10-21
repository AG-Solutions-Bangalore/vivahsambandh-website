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
  updateFaq,
  updateFaqStatus,
} from '../services/faqApi'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapItem, unwrapList } from './errors'
import type { FaqListParams, FaqPayload, FaqStatus } from '../types'

export function useFaqsQuery(params: FaqListParams = {}) {
  return useQuery({
    queryKey: [...superAdminKeys.faqs, params],
    queryFn: async () => unwrapList(await fetchFaqs(params)),
    staleTime: PANEL_STALE_TIME,
  })
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

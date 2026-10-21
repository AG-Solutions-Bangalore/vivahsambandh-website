/**
 * @file src/module/super-admin/hook/useTestimonials.ts
 * React Query hooks for Testimonial management: testimonial list,
 * single-record inspection, creation, update, status update, and deletion.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createTestimonial,
  deleteTestimonial,
  fetchTestimonialById,
  fetchTestimonials,
  updateTestimonial,
  updateTestimonialStatus,
} from '../services/testimonialApi'
import { toListMeta } from '../services/mappers'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapItem } from './errors'
import { EMPTY_LIST_META } from './useServerList'
import type {
  ListMeta,
  TestimonialListParams,
  TestimonialPayload,
  TestimonialStatus,
} from '../types'

/**
 * The testimonial list. `/testimonial` pages its rows and filters them on
 * the server, so the search term and the page number travel with the
 * request.
 */
export function useTestimonialsQuery(params: TestimonialListParams = {}) {
  const query = useQuery({
    queryKey: [...superAdminKeys.testimonials, params],
    queryFn: async () => {
      const result = await fetchTestimonials(params)
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
 * Single Testimonial record.
 */
export function useTestimonialQuery(id: number | string | null) {
  return useQuery({
    queryKey: superAdminKeys.testimonial(id ?? 'none'),
    queryFn: async () => unwrapItem(await fetchTestimonialById(id as number)),
    enabled: id !== null && id !== undefined,
    staleTime: PANEL_STALE_TIME,
  })
}

interface CreateTestimonialVariables {
  payload: TestimonialPayload
  successMessage?: string
}

export function useCreateTestimonialMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ payload }: CreateTestimonialVariables) =>
      unwrapAction(await createTestimonial(payload)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.testimonials })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateTestimonialVariables {
  id: number | string
  payload: TestimonialPayload
  successMessage?: string
}

export function useUpdateTestimonialMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateTestimonialVariables) =>
      unwrapAction(await updateTestimonial(id, payload)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.testimonials }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.testimonial(variables.id) }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateTestimonialStatusVariables {
  id: number | string
  status: TestimonialStatus
  successMessage?: string
}

export function useUpdateTestimonialStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: UpdateTestimonialStatusVariables) =>
      unwrapAction(await updateTestimonialStatus(id, status)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.testimonials }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.testimonial(variables.id) }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface DeleteTestimonialVariables {
  id: number | string
  successMessage?: string
}

export function useDeleteTestimonialMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteTestimonialVariables) =>
      unwrapAction(await deleteTestimonial(id)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.testimonials })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

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
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapItem, unwrapList } from './errors'
import type {
  TestimonialListParams,
  TestimonialPayload,
  TestimonialStatus,
} from '../types'

export function useTestimonialsQuery(params: TestimonialListParams = {}) {
  return useQuery({
    queryKey: [...superAdminKeys.testimonials, params],
    queryFn: async () => unwrapList(await fetchTestimonials(params)),
    staleTime: PANEL_STALE_TIME,
  })
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

/**
 * @file src/module/category/hook/useCategories.ts
 * React Query hooks for the category module.
 *
 * The panel and the public site read the same taxonomy, so the hooks live
 * with the module instead of with either surface — one cache, one place
 * that knows how the category endpoints answer.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createCategory,
  deleteCategory,
  getActiveCategories,
  getCategories,
  updateCategory,
  updateCategoryStatus,
} from '../api/category.api'
import type {
  Category,
  CategoryListParams,
  CategoryListResult,
  CategoryPayload,
  CategoryStatus,
} from '../types'

export const categoryKeys = {
  all: ['categories'] as const,
  list: (params: CategoryListParams) => ['categories', 'list', params] as const,
  active: ['categories', 'active'] as const,
}

/**
 * Categories change rarely and are read on nearly every panel screen, so
 * they are cached for longer than the panel's default freshness window.
 */
const CATEGORY_STALE_TIME = 5 * 60 * 1000

/**
 * The category list.
 *
 * `/category` pages its rows and filters them on the server, so the search
 * term and the page number travel with the request.
 */
export function useCategoriesQuery(params: CategoryListParams = {}) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => getCategories(params),
    staleTime: CATEGORY_STALE_TIME,
    placeholderData: (previous) => previous,
  })
}

/**
 * Every category, fetched unpaginated.
 *
 * This is what the pickers read: a dropdown has to show the whole
 * taxonomy, and the active list alone would hide a category an existing
 * article already points at.
 */
export function useCategoryOptionsQuery(perPage = 200) {
  return useQuery({
    queryKey: categoryKeys.list({ per_page: perPage }),
    queryFn: () => getCategories({ per_page: perPage }),
    staleTime: CATEGORY_STALE_TIME,
    placeholderData: (previous) => previous,
  })
}

/**
 * The active categories — the list the filters read.
 */
export function useActiveCategoriesQuery() {
  return useQuery({
    queryKey: categoryKeys.active,
    queryFn: () => getActiveCategories(),
    staleTime: CATEGORY_STALE_TIME,
  })
}

interface CreateVariables {
  payload: CategoryPayload | FormData
  successMessage?: string
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ payload }: CreateVariables) => {
      const result = await createCategory(payload)
      if (!result.success) throw new Error(result.message)
      return result.message
    },
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateVariables {
  id: number | string
  payload: CategoryPayload | FormData
  successMessage?: string
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateVariables) => {
      const result = await updateCategory(id, payload)
      if (!result.success) throw new Error(result.message)
      return result.message
    },
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateStatusVariables {
  id: number | string
  category_status: CategoryStatus | string
  successMessage?: string
}

export function useUpdateCategoryStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, category_status }: UpdateStatusVariables) => {
      const result = await updateCategoryStatus(id, category_status)
      if (!result.success) throw new Error(result.message)
      return result.message
    },
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface DeleteVariables {
  id: number | string
  successMessage?: string
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteVariables) => {
      const result = await deleteCategory(id)
      if (!result.success) throw new Error(result.message)
      return result.message
    },
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export type { Category, CategoryListResult }

/**
 * @file src/module/super-admin/hook/useBlogs.ts
 * React Query hooks for blog management: the article list, the single-record
 * endpoint, creation, update, publication state and deletion.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createBlog,
  fetchBlogById,
  fetchBlogs,
  updateBlog,
  updateBlogStatus,
} from '../services/blogApi'
import { bumpBlogBannerRevision } from '../services/blogImageVersion'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapItem } from './errors'
import type {
  BlogListMeta,
  BlogListParams,
  BlogPayload,
  BlogStatus,
} from '../types'

const EMPTY_META: BlogListMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
}

/**
 * The article list. `search`, `page` and `per_page` are handled by the API;
 * the publication state is filtered by the panel, because the API ignores
 * that parameter.
 */
export function useBlogsQuery(params: BlogListParams = {}) {
  const query = useQuery({
    queryKey: [...superAdminKeys.blogs, params],
    queryFn: async () => {
      const result = await fetchBlogs(params)
      if (result.error) throw new Error(result.error)
      return { records: result.data, meta: result.meta }
    },
    staleTime: PANEL_STALE_TIME,
    // Keep the previous page on screen while the next one loads.
    placeholderData: (previous) => previous,
  })

  return {
    ...query,
    records: query.data?.records ?? [],
    meta: query.data?.meta ?? EMPTY_META,
  }
}

/**
 * A single article. `id` is `null` when the inspector is closed, which keeps
 * the request disabled until an admin actually opens a record.
 */
export function useBlogQuery(id: number | string | null) {
  return useQuery({
    queryKey: superAdminKeys.blog(id ?? 'none'),
    queryFn: async () => unwrapItem(await fetchBlogById(id as number)),
    enabled: id !== null && id !== undefined,
    staleTime: PANEL_STALE_TIME,
  })
}

interface BlogMutationVariables {
  payload: BlogPayload
  successMessage?: string
}

export function useCreateBlogMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ payload }: BlogMutationVariables) =>
      unwrapAction(await createBlog(payload)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.blogs })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateBlogVariables {
  id: number | string
  payload: BlogPayload
  successMessage?: string
}

export function useUpdateBlogMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateBlogVariables) =>
      unwrapAction(await updateBlog(id, payload)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      // The banner file keeps its name, so give it a fresh URL — otherwise
      // the browser keeps serving the picture it cached for the old one.
      bumpBlogBannerRevision(variables.id)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.blogs })
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.blog(variables.id) })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateBlogStatusVariables {
  id: number | string
  status: BlogStatus
  successMessage?: string
}

export function useUpdateBlogStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: UpdateBlogStatusVariables) =>
      unwrapAction(await updateBlogStatus(id, status)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.blogs })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}


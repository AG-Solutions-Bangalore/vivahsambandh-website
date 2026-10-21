/**
 * @file src/module/super-admin/hook/useGalleries.ts
 * React Query hooks for Gallery management: gallery list,
 * single-record inspection, creation, update, status update, and deletion.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createGallery,
  deleteGallery,
  fetchActiveGalleries,
  fetchGalleryById,
  fetchGalleries,
  updateGallery,
  updateGalleryStatus,
} from '../services/galleryApi'
import { toListMeta } from '../services/mappers'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapItem } from './errors'
import { EMPTY_LIST_META } from './useServerList'
import type {
  GalleryListParams,
  GalleryPayload,
  GalleryRecord,
  GalleryStatus,
  ListMeta,
} from '../types'

/**
 * The gallery items list. `/gallery` pages its rows and filters them on
 * the server, so search terms and page numbers travel with the request.
 */
export function useGalleriesQuery(params: GalleryListParams = {}) {
  const query = useQuery({
    queryKey: [...superAdminKeys.galleries, params],
    queryFn: async () => {
      const result = await fetchGalleries(params)
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
    placeholderData: (previous) => previous,
  })

  const records = query.data?.records ?? []
  const meta: ListMeta = query.data?.meta ?? EMPTY_LIST_META

  return { ...query, records, meta }
}

/**
 * Single Gallery item inspection.
 */
export function useGalleryQuery(id: number | string | null | undefined) {
  return useQuery<GalleryRecord>({
    queryKey: superAdminKeys.gallery(id ?? 'none'),
    queryFn: async () => unwrapItem(await fetchGalleryById(id as number | string)),
    enabled: id !== null && id !== undefined && id !== '',
    staleTime: PANEL_STALE_TIME,
  })
}

/**
 * Active Galleries list.
 */
export function useActiveGalleriesQuery() {
  return useQuery({
    queryKey: [...superAdminKeys.galleries, 'active'],
    queryFn: async () => {
      const result = await fetchActiveGalleries()
      if (result.error) throw new Error(result.error)
      return result.data
    },
    staleTime: PANEL_STALE_TIME,
  })
}

interface CreateGalleryVariables {
  payload: GalleryPayload | FormData
  successMessage?: string
}

/**
 * Creates a new gallery item.
 */
export function useCreateGalleryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ payload }: CreateGalleryVariables) =>
      unwrapAction(await createGallery(payload)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.galleries })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateGalleryVariables {
  id: number | string
  payload: GalleryPayload | FormData
  successMessage?: string
}

/**
 * Updates an existing gallery item.
 */
export function useUpdateGalleryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateGalleryVariables) =>
      unwrapAction(await updateGallery(id, payload)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.galleries }),
        queryClient.invalidateQueries({
          queryKey: superAdminKeys.gallery(variables.id),
        }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateGalleryStatusVariables {
  id: number | string
  gallery_status: GalleryStatus | string
  successMessage?: string
}

/**
 * Updates gallery item publication status (Active / Inactive).
 */
export function useUpdateGalleryStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, gallery_status }: UpdateGalleryStatusVariables) =>
      unwrapAction(await updateGalleryStatus(id, gallery_status)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.galleries }),
        queryClient.invalidateQueries({
          queryKey: superAdminKeys.gallery(variables.id),
        }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface DeleteGalleryVariables {
  id: number | string
  successMessage?: string
}

/**
 * Deletes a gallery item by ID.
 */
export function useDeleteGalleryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteGalleryVariables) =>
      unwrapAction(await deleteGallery(id)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.galleries })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

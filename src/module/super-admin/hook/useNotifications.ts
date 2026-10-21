/**
 * @file src/module/super-admin/hook/useNotifications.ts
 * React Query hooks for broadcast notifications: the list, the single-record
 * inspection endpoint, creation, and deletion.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createNotification,
  deleteNotificationRecord,
  fetchNotificationById,
  fetchNotifications,
} from '../services/adminApi'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapItem, unwrapList } from './errors'
import type { CreateNotificationPayload } from '../types'

export function useNotificationsQuery() {
  return useQuery({
    queryKey: superAdminKeys.notifications,
    queryFn: async () => unwrapList(await fetchNotifications()),
    staleTime: PANEL_STALE_TIME,
  })
}

/**
 * Single broadcast record. `id` is `null` when the inspector is closed, which
 * keeps the request disabled until an admin actually opens a record.
 */
export function useNotificationQuery(id: number | null) {
  return useQuery({
    queryKey: superAdminKeys.notification(id ?? 'none'),
    queryFn: async () => unwrapItem(await fetchNotificationById(id as number)),
    enabled: id !== null,
    staleTime: PANEL_STALE_TIME,
  })
}

interface CreateNotificationVariables {
  payload: CreateNotificationPayload
  successMessage?: string
}

export function useCreateNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ payload }: CreateNotificationVariables) =>
      unwrapAction(await createNotification(payload)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.notifications })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface DeleteNotificationVariables {
  id: number | string
  successMessage?: string
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteNotificationVariables) =>
      unwrapAction(await deleteNotificationRecord(id)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.notifications })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

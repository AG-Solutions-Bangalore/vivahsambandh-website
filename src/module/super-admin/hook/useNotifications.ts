/**
 * @file src/module/super-admin/hook/useNotifications.ts
 * React Query hooks for broadcast notifications: the list, the single-record
 * inspection endpoint, creation, and deletion.
 */

import { useMemo } from 'react'
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
import {
  DEFAULT_PER_PAGE,
  applyLocalList,
  matchesStatus,
  matchesTerm,
  type ListMeta,
} from './useServerList'
import type {
  CreateNotificationPayload,
  NotificationRecord,
  PanelListParams,
} from '../types'

export interface NotificationListParams extends PanelListParams {
  /** `User` or `Admin` — the audience the broadcast was sent to. */
  target?: string
}

export function useNotificationsQuery(params: NotificationListParams = {}) {
  const query = useQuery({
    queryKey: [...superAdminKeys.notifications, params],
    queryFn: async () => unwrapList(await fetchNotifications(params)),
    staleTime: PANEL_STALE_TIME,
  })

  const { search, target, page, per_page } = params

  const local: { records: NotificationRecord[]; meta: ListMeta } = useMemo(
    () =>
      applyLocalList(query.data ?? [], {
        searchTerm: search,
        matches: (notification, term) =>
          matchesTerm(term, notification.notification_heading, notification.notification_message),
        keep: (notification) => matchesStatus(target, notification.notification_for),
        page,
        perPage: per_page ?? DEFAULT_PER_PAGE,
      }),
    [query.data, search, target, page, per_page],
  )

  return { ...query, records: local.records, meta: local.meta }
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

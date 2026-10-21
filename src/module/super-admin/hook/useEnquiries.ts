/**
 * @file src/module/super-admin/hook/useEnquiries.ts
 * React Query hooks for enquiry management: the list, the single-record
 * endpoint, the status update, deletion and the export report.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  deleteEnquiry,
  fetchEnquiryById,
  fetchEnquiryReport,
  fetchEnquiries,
  updateEnquiryStatus,
} from '../services/enquiryApi'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapItem } from './errors'
import type { EnquiryListParams, EnquiryStatus } from '../types'

const EMPTY_META = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
}

/**
 * The enquiry list. `search`, `page` and `per_page` are handled by the API;
 * the status filter is applied by the panel, because the API ignores it.
 */
export function useEnquiriesQuery(params: EnquiryListParams = {}) {
  const query = useQuery({
    queryKey: [...superAdminKeys.enquiries, params],
    queryFn: async () => {
      const result = await fetchEnquiries(params)
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
 * A single enquiry. `id` is `null` when the inspector is closed, which keeps
 * the request disabled until an admin actually opens a record.
 */
export function useEnquiryQuery(id: number | string | null) {
  return useQuery({
    queryKey: superAdminKeys.enquiry(id ?? 'none'),
    queryFn: async () => unwrapItem(await fetchEnquiryById(id as number)),
    enabled: id !== null && id !== undefined,
    staleTime: PANEL_STALE_TIME,
  })
}

interface UpdateEnquiryStatusVariables {
  id: number | string
  status: EnquiryStatus
  successMessage?: string
}

export function useUpdateEnquiryStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: UpdateEnquiryStatusVariables) =>
      unwrapAction(await updateEnquiryStatus(id, status)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.enquiries })
      await queryClient.invalidateQueries({
        queryKey: superAdminKeys.enquiry(variables.id),
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface DeleteEnquiryVariables {
  id: number | string
  successMessage?: string
}

export function useDeleteEnquiryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteEnquiryVariables) =>
      unwrapAction(await deleteEnquiry(id)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.enquiries })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

/**
 * The flat report used by the CSV export. It is only fetched when an admin
 * asks for the export, so it stays out of the list page's request path.
 */
export function useEnquiryReportQuery(enabled: boolean) {
  return useQuery({
    queryKey: superAdminKeys.enquiryReport,
    queryFn: async () => {
      const result = await fetchEnquiryReport()
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled,
    staleTime: PANEL_STALE_TIME,
  })
}

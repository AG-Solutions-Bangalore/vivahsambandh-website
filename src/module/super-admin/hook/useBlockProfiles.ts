/**
 * @file src/module/super-admin/hook/useBlockProfiles.ts
 * React Query hooks for the blocked-profile moderation log.
 */

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  deleteBlockProfileRecord,
  fetchBlockProfiles,
} from '../services/adminApi'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapList } from './errors'
import {
  DEFAULT_PER_PAGE,
  applyLocalList,
  matchesTerm,
  type ListMeta,
} from './useServerList'
import type { BlockProfileRecord, PanelListParams } from '../types'

export function useBlockProfilesQuery(params: PanelListParams = {}) {
  const query = useQuery({
    queryKey: [...superAdminKeys.blockProfiles, params],
    queryFn: async () => unwrapList(await fetchBlockProfiles(params)),
    staleTime: PANEL_STALE_TIME,
  })

  const { search, page, per_page } = params

  const local: { records: BlockProfileRecord[]; meta: ListMeta } = useMemo(
    () =>
      applyLocalList(query.data ?? [], {
        searchTerm: search,
        matches: (record, term) =>
          matchesTerm(term, record.member_name, record.blocked_by_name, record.reason),
        page,
        perPage: per_page ?? DEFAULT_PER_PAGE,
      }),
    [query.data, search, page, per_page],
  )

  return { ...query, records: local.records, meta: local.meta }
}

interface DeleteBlockProfileVariables {
  id: number | string
  successMessage?: string
}

export function useDeleteBlockProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteBlockProfileVariables) =>
      unwrapAction(await deleteBlockProfileRecord(id)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await queryClient.invalidateQueries({ queryKey: superAdminKeys.blockProfiles })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

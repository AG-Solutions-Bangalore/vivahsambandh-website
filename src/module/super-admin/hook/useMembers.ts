/**
 * @file src/module/super-admin/hook/useMembers.ts
 * React Query hooks for the matrimonial member directory and the pending
 * member moderation queue.
 *
 * The search term is sent to the API. `/member` and `/getPendingMember` do
 * not filter on the server yet, so the same filter is applied to the rows
 * that come back — the request is already server-side and the panel stays
 * correct the day the endpoint honours the parameter.
 */

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMembers, fetchPendingMembers } from '../services/adminApi'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapList } from './errors'
import {
  DEFAULT_PER_PAGE,
  applyLocalList,
  matchesStatus,
  matchesTerm,
  type ListMeta,
} from './useServerList'
import type { Member, PanelListParams } from '../types'

export interface MemberListParams extends PanelListParams {
  status?: string
  gender?: string
}

/** Matches the member search across the columns an admin looks for. */
function memberMatches(member: Member, term: string): boolean {
  return matchesTerm(
    term,
    member.name,
    member.mobile,
    member.user_current_city,
    member.community_name,
    member.gotra_name,
    member.profession_name,
    member.education_name,
  )
}

export function useMembersQuery(params: MemberListParams = {}) {
  const query = useQuery({
    queryKey: [...superAdminKeys.members, params],
    queryFn: async () => unwrapList(await fetchMembers(params)),
    staleTime: PANEL_STALE_TIME,
  })

  const { search, status, gender, page, per_page } = params

  const local: { records: Member[]; meta: ListMeta } = useMemo(
    () =>
      applyLocalList(query.data ?? [], {
        searchTerm: search,
        matches: memberMatches,
        keep: (member) =>
          matchesStatus(status, member.status) && matchesStatus(gender, member.gender),
        page,
        perPage: per_page ?? DEFAULT_PER_PAGE,
      }),
    [query.data, search, status, gender, page, per_page],
  )

  return { ...query, records: local.records, meta: local.meta }
}

export function usePendingMembersQuery(params: MemberListParams = {}) {
  const query = useQuery({
    queryKey: [...superAdminKeys.pendingMembers, params],
    queryFn: async () => unwrapList(await fetchPendingMembers(params)),
    staleTime: PANEL_STALE_TIME,
  })

  const { search, status, gender, page, per_page } = params

  const local: { records: Member[]; meta: ListMeta } = useMemo(
    () =>
      applyLocalList(query.data ?? [], {
        searchTerm: search,
        matches: memberMatches,
        keep: (member) =>
          matchesStatus(status, member.status) && matchesStatus(gender, member.gender),
        page,
        perPage: per_page ?? DEFAULT_PER_PAGE,
      }),
    [query.data, search, status, gender, page, per_page],
  )

  return { ...query, records: local.records, meta: local.meta }
}

/**
 * @file src/module/super-admin/hook/useServerList.ts
 * Shared search and pagination plumbing for the panel lists.
 *
 * Every panel list sends its search term to the API, so the filtering and
 * the paging happen on the server. The CRM endpoints for members, admins,
 * feedback, moderation blocks and notifications ignore those parameters
 * today, so the same filter is also applied to the rows that come back —
 * the request is already server-side, and the panel stays correct the day
 * the endpoint starts honouring the parameter.
 */

import { useEffect, useState } from 'react'
import type { ListMeta } from '../types'

export type { ListMeta }

export const EMPTY_LIST_META: ListMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
}

/** How long the panel waits before it sends a search term to the API. */
export const SEARCH_DEBOUNCE_MS = 350

/** Default page size used by the panel lists. */
export const DEFAULT_PER_PAGE = 10

/**
 * Debounced search term. The raw value drives the input, the debounced
 * value drives the request — so a keystroke does not fire a request per
 * letter.
 */
export function useServerSearch(initial = ''): {
  searchInput: string
  setSearchInput: (value: string) => void
  searchTerm: string
} {
  const [searchInput, setSearchInput] = useState(initial)
  const [searchTerm, setSearchTerm] = useState(initial)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  return { searchInput, setSearchInput, searchTerm }
}

export interface LocalListOptions<T> {
  /** The debounced term the API was asked to filter on. */
  searchTerm?: string
  /** Local matcher, used when the endpoint ignores `search`. */
  matches?: (record: T, term: string) => boolean
  /** Local filter for the columns the API cannot filter on. */
  keep?: (record: T) => boolean
  page?: number
  perPage?: number
}

/**
 * Applies the search term and the page window to a list the API returned
 * unfiltered.
 *
 * Only used for the endpoints that ignore the parameters — for the others
 * the server has already done the work.
 */
export function applyLocalList<T>(
  records: T[],
  options: LocalListOptions<T>,
): { records: T[]; meta: ListMeta } {
  const {
    searchTerm = '',
    matches,
    keep,
    page = 1,
    perPage = DEFAULT_PER_PAGE,
  } = options

  const term = searchTerm.toLowerCase()
  const searched = matches
    ? records.filter((record) => matches(record, term))
    : records
  const kept = keep ? searched.filter(keep) : searched

  const total = kept.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const currentPage = Math.min(Math.max(1, page), lastPage)
  const from = (currentPage - 1) * perPage

  return {
    records: kept.slice(from, from + perPage),
    meta: {
      current_page: currentPage,
      last_page: lastPage,
      per_page: perPage,
      total,
    },
  }
}

/** Matches a term against a list of candidate values. */
export function matchesTerm(term: string, ...values: Array<string | null | undefined>): boolean {
  if (!term) return true
  return values.some((value) => (value ?? '').toLowerCase().includes(term))
}

/**
 * Builds a predicate for a status column. The "All" option disables the
 * filter, and the comparison is case-insensitive.
 */
export function matchesStatus(
  selected: string | undefined,
  current: string | null | undefined,
): boolean {
  if (!selected || selected === 'All') return true
  return (current ?? '').toLowerCase() === selected.toLowerCase()
}

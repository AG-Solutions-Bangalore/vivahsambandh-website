/**
 * @file src/module/super-admin/hook/useCategories.ts
 * Panel-facing hooks for category management.
 *
 * The category module owns the endpoints; this file adapts them to the
 * panel's list contract — `{ records, meta }` — so the pages can page and
 * filter the way every other panel list does.
 */

import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/module/category/api/category.api'
import { categoryKeys } from '@/module/category/hook/useCategories'
import type { CategoryListParams } from '@/module/category/types'
import { PANEL_STALE_TIME } from './queryKeys'
import { DEFAULT_PER_PAGE } from './useServerList'
import type { ListMeta } from '../types'

export {
  categoryKeys,
  useActiveCategoriesQuery,
  useCategoryOptionsQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useUpdateCategoryStatusMutation,
} from '@/module/category/hook/useCategories'

/**
 * The category list.
 *
 * The endpoint pages its rows and filters them on the server, so the
 * search term and the page number travel with the request. The publication
 * state is filtered by the panel, because the API ignores that parameter.
 */
export function useCategoriesListQuery(params: CategoryListParams = {}) {
  const query = useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => getCategories(params),
    staleTime: PANEL_STALE_TIME,
    // Keep the previous page on screen while the next one loads.
    placeholderData: (previous) => previous,
  })

  const records = query.data?.records ?? []
  const total = query.data?.total ?? 0
  const perPage = params.per_page ?? DEFAULT_PER_PAGE
  const lastPage = Math.max(1, Math.ceil(total / perPage))

  const meta: ListMeta = {
    current_page: Math.min(Math.max(1, params.page ?? 1), lastPage),
    last_page: lastPage,
    per_page: perPage,
    total,
  }

  return { ...query, records, meta }
}

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getCategories, getClients } from '../api/home.api'
import type { CategoryResponse, ClientResponse } from '../types'

export const homeQueryKeys = {
  categories: ['categories'] as const,
  clients: ['clients'] as const,
}

export function useCategoryQuery(
  options?: Omit<UseQueryOptions<CategoryResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: homeQueryKeys.categories,
    queryFn: getCategories,
    ...options,
  })
}

export function useClientQuery(
  options?: Omit<UseQueryOptions<ClientResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: homeQueryKeys.clients,
    queryFn: getClients,
    ...options,
  })
}

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getCompany } from '../api/company.api'
import type { CompanyResponse } from '../types'

export const COMPANY_QUERY_KEY = ['company'] as const

export function useCompanyQuery(
  options?: Omit<UseQueryOptions<CompanyResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: COMPANY_QUERY_KEY,
    queryFn: getCompany,
    ...options,
  })
}

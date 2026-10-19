import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getCompany } from '../api/company.api'
import type { CompanyResponse } from '../types'
import { COMPANY, getCompanyAddress } from '../../../constants/company'

export const COMPANY_QUERY_KEY = ['company'] as const

export function useCompanyQuery(
  options?: Omit<UseQueryOptions<CompanyResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: COMPANY_QUERY_KEY,
    queryFn: getCompany,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
    ...options,
  })
}

/**
 * Convenient hook returning live company fields from the API with canonical fallbacks.
 * If API fails or data is not yet returned, falls back seamlessly to canonical COMPANY constants.
 */
export function useCompanyDetails(lang?: string) {
  const { data, isPending, isError } = useCompanyQuery()
  const live = data?.data

  const phone = live?.company_mobile_no ? `+91 ${live.company_mobile_no}` : COMPANY.supportPhoneDisplay
  const phoneLink = live?.company_mobile_no ? `tel:+91${live.company_mobile_no.replace(/\D/g, '')}` : COMPANY.supportPhoneLink
  const landline = live?.company_landline_no || COMPANY.landlineDisplay
  const landlineLink = live?.company_landline_no ? `tel:${live.company_landline_no.replace(/\D/g, '')}` : COMPANY.landlineLink
  const email = live?.company_email?.trim() || COMPANY.supportEmail
  const fallbackAddress = lang ? getCompanyAddress(lang) : COMPANY.address.en
  const address = live?.company_address?.trim() || fallbackAddress
  const name = live?.company_name?.trim() || COMPANY.name

  const companyLogoBase = data?.image_url?.find((img) => img.image_for === 'Company')?.image_url
  const logoUrl = live?.company_logo && companyLogoBase ? `${companyLogoBase}${live.company_logo}` : undefined

  return {
    phone,
    phoneLink,
    landline,
    landlineLink,
    email,
    address,
    name,
    logoUrl,
    raw: live,
    isPending,
    isError,
  }
}


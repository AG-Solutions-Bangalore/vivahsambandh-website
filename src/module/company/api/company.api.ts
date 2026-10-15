import { apiFetch } from '@/lib/api/apiClient'
import type { CompanyResponse } from '../types'

export async function getCompany(): Promise<CompanyResponse> {
  return apiFetch<CompanyResponse>('/getCompany')
}

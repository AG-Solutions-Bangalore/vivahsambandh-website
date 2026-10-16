/**
 * @file src/module/registration/api/registration.api.ts
 * API services for VivahSambandh Registration and CRM integrations.
 */

import { apiFetch, API_BASE_URL } from '@/lib/api/apiClient'
import type {
  ApiResponse,
  EducationItem,
  CommunityItem,
  GotraItem,
  ProfessionItem,
} from '../types'

/**
 * Fetches available education qualifications from CRM.
 */
export async function getEducation(): Promise<EducationItem[]> {
  const res = await apiFetch<ApiResponse<EducationItem[]>>('/getEducation')
  return res.data ?? []
}

/**
 * Fetches available communities from CRM.
 */
export async function getCommunity(): Promise<CommunityItem[]> {
  const res = await apiFetch<ApiResponse<CommunityItem[]>>('/getCommunity')
  return res.data ?? []
}

/**
 * Fetches gotras for a specific community ID from CRM.
 */
export async function getGotra(communityId: number | string): Promise<GotraItem[]> {
  if (!communityId) return []
  const res = await apiFetch<ApiResponse<GotraItem[]>>(`/getGotra/${communityId}`)
  return res.data ?? []
}

/**
 * Fetches profession categories from CRM.
 */
export async function getProfession(): Promise<ProfessionItem[]> {
  const res = await apiFetch<ApiResponse<ProfessionItem[]>>('/getProfession')
  return res.data ?? []
}

/**
 * Submits the completed registration form with cropped photo files to CRM.
 */
export async function createUserRegister(
  formData: FormData,
): Promise<{ success: boolean; message: string; data?: unknown }> {
  const url = `${API_BASE_URL}/create-user-register`

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      throw new Error(
        data?.message || `Server responded with status ${res.status}`,
      )
    }

    return {
      success: true,
      message: data?.message || 'Registration submitted successfully!',
      data,
    }
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : 'Registration submission failed.'
    return {
      success: false,
      message: errorMsg,
    }
  }
}

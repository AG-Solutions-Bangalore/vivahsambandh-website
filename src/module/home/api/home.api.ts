import { apiFetch } from '@/lib/api/apiClient'
import type { CategoryResponse, ClientResponse } from '../types'

/**
 * Fetches all service categories with subcategories and banner assets.
 */
export async function getCategories(): Promise<CategoryResponse> {
  return apiFetch<CategoryResponse>('/getCategory')
}

/**
 * Fetches lending partners / client logos.
 */
export async function getClients(): Promise<ClientResponse> {
  return apiFetch<ClientResponse>('/getClient')
}

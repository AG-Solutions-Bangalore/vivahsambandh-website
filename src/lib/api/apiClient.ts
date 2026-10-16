/**
 * @file src/lib/api/apiClient.ts
 * Native HTTP client for VivahSambandh / CRM API endpoints.
 * Provides GET JSON parsing and FormData POST multipart encoding.
 */

import type { ImageUrlEntry } from './types'

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  'https://vivahsambandh.com/crmapi/public/api'


export const API_SECRET_KEY: string | undefined =
  import.meta.env.VITE_SECRET_KEY as string | undefined

/**
 * Executes a GET request against the primary API host only.
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${cleanEndpoint}`

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(API_SECRET_KEY ? { Authorization: API_SECRET_KEY } : {}),
    ...(options?.headers as Record<string, string> | undefined),
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  if (!res.ok) {
    throw new Error(`API HTTP Error: ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as T
}

/**
 * Standard HTTP POST multipart/form-data helper for form submissions.
 * Conforms to CRM POST specifications requiring native FormData encoding.
 */
export async function apiPostForm<T>(
  endpoint: string,
  fields: Record<string, string | number | boolean | null | undefined>,
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const primaryUrl = `${API_BASE_URL}${cleanEndpoint}`

  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(API_SECRET_KEY ? { Authorization: API_SECRET_KEY } : {}),
  }

  const res = await fetch(primaryUrl, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '')
    throw new Error(
      `POST submission failed with HTTP ${res.status}: ${errorBody || res.statusText}`,
    )
  }

  return (await res.json()) as T
}

/**
 * Resolves a remote image filename to a full HTTPS URL using the backend `image_url` metadata.
 */
export function resolveImageUrl(
  filename: string | null | undefined,
  entries?: ImageUrlEntry[],
  imageFor?: string,
): string | null {
  if (!filename || !filename.trim()) {
    const noImgEntry = entries?.find(
      (e) => e.image_for.toLowerCase() === 'no image',
    )
    return noImgEntry?.image_url ?? null
  }

  const clean = filename.trim()
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean
  }

  if (entries && entries.length > 0) {
    if (imageFor) {
      const match = entries.find(
        (e) => e.image_for.toLowerCase() === imageFor.toLowerCase(),
      )
      if (match?.image_url) {
        const base = match.image_url.endsWith('/')
          ? match.image_url
          : `${match.image_url}/`
        return `${base}${clean}`
      }
    }

    const firstEntry = entries.find((e) => e.image_for.toLowerCase() !== 'no image')
    if (firstEntry?.image_url) {
      const base = firstEntry.image_url.endsWith('/')
        ? firstEntry.image_url
        : `${firstEntry.image_url}/`
      return `${base}${clean}`
    }
  }

  return clean
}

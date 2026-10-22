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
 * Appends a version token to an image URL.
 *
 * The CRM overwrites a banner file in place — `7.webp` always points at the
 * current banner of article 7 — and serves it with `Cache-Control:
 * max-age=31536000`. A browser that already cached the old picture would
 * keep showing it for a year, so the record's update timestamp goes into the
 * URL: it changes on every save, so the URL changes with the content.
 */
export function withImageVersion(
  src: string | null | undefined,
  version: string | null | undefined,
): string | null {
  if (!src) return null
  const clean = src.trim()
  if (!clean) return null

  const token = String(version ?? '').trim()
  if (!token) return clean

  const separator = clean.includes('?') ? '&' : '?'
  return `${clean}${separator}v=${encodeURIComponent(token)}`
}

/**
 * Folder the CRM keeps each kind of upload in. Used when an endpoint omits
 * its `image_url` metadata, so a stored file name still becomes a loadable URL.
 */
const IMAGE_FOLDERS: Record<string, string> = {
  blog: 'blog_images',
  client: 'client_images',
  gallery: 'gallerys_images',
  galleries: 'gallerys_images',
  user: 'users_images',
  member: 'users_images',
  admin: 'users_images',
}

/**
 * Resolves a remote image filename to a full HTTPS URL using the backend `image_url` metadata.
 *
 * `imageFor` may list several accepted `image_for` labels, tried in order.
 * The CRM labels member and administrator photographs "User", while the
 * panel calls them "Member" and "Admin" — passing both keeps a row pointing
 * at the right folder whichever label the endpoint chose.
 */
export function resolveImageUrl(
  filename: string | null | undefined,
  entries?: ImageUrlEntry[],
  imageFor?: string | string[],
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

  const keys = (Array.isArray(imageFor) ? imageFor : imageFor ? [imageFor] : []).map(
    (key) => key.toLowerCase(),
  )

  if (entries && entries.length > 0) {
    for (const key of keys) {
      const match = entries.find((e) => e.image_for.toLowerCase() === key)
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

  // Fallback defaults for known entity types if entries metadata was omitted
  for (const key of keys) {
    const folder = IMAGE_FOLDERS[key]
    if (folder) {
      return `https://vivahsambandh.com/crmapi/public/assets/images/${folder}/${clean.replace(/^\/+/, '')}`
    }
  }

  return clean
}

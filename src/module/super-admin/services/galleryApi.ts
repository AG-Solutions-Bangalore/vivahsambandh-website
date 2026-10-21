/**
 * @file src/module/super-admin/services/galleryApi.ts
 * Dedicated API service layer for Gallery management in the Super Admin Panel.
 *
 * Endpoints:
 *   GET    /gallery              → list gallery items (with pagination & search)
 *   POST   /gallery              → create gallery item (Body: FormData -> gallery_image)
 *   GET    /gallery/{id}         → single gallery item by ID
 *   PUT    /gallery/{id}         → update gallery item (Body: FormData with _method=PUT & direct PUT fallback)
 *   PATCH  /gallerys/{id}/status → update gallery status (Active / Inactive)
 *   GET    /activeGallerys       → list active gallery items
 *   DELETE /gallery/{id}         → delete gallery item (with fallback to Inactive status)
 */

import type {
  GalleryListParams,
  GalleryPayload,
  GalleryRecord,
  GalleryStatus,
} from '../types'
import { extractImageEntries, setCachedGalleryBaseUrl, toGallery, toList } from './mappers'
import { buildQueryString, request } from './http'
import { convertToWebpFile, isWebpFile } from '@/lib/image'

/**
 * Helper to construct FormData for Gallery operations.
 */
export function buildGalleryFormData(
  payload: GalleryPayload | FormData | null | undefined,
  isUpdate = false,
): FormData {
  if (payload instanceof FormData) {
    if (isUpdate && !payload.has('_method')) {
      payload.append('_method', 'PUT')
    }
    return payload
  }

  const formData = new FormData()

  const file =
    payload?.gallery_image ||
    payload?.image ||
    payload?.photo ||
    payload?.file ||
    (Array.isArray(payload?.gallery_images) && payload.gallery_images.length > 0
      ? payload.gallery_images[0]
      : null)

  if (file instanceof File || file instanceof Blob) {
    formData.append('gallery_image', file)
    formData.append('image', file)
    formData.append('gallery_images', file)
    formData.append('gallery_photo', file)
    formData.append('photo', file)
    formData.append('file', file)
    formData.append('gallery', file)
  }

  if (isUpdate) {
    const status = payload?.gallery_status || payload?.status
    if (status) {
      formData.append('gallery_status', String(status).trim())
      formData.append('status', String(status).trim())
    }
    formData.append('_method', 'PUT')
  }

  return formData
}

/**
 * 1. Fetch gallery items list with pagination & optional query params
 */
export async function fetchGalleries(
  params: GalleryListParams | number = {},
): Promise<{ data: GalleryRecord[]; error?: string; raw?: unknown }> {
  const queryParams = typeof params === 'number' ? { page: params } : params
  const query = buildQueryString({
    page: queryParams.page,
    per_page: queryParams.per_page,
    search: queryParams.search,
    gallery_status: queryParams.gallery_status || queryParams.status,
  })

  const res = await request<unknown>(`/gallery${query}`)
  if (res.ok && res.data) {
    const rawEnvelope = res.data as Record<string, unknown>
    if (rawEnvelope?.gallery_url && typeof rawEnvelope.gallery_url === 'string') {
      setCachedGalleryBaseUrl(rawEnvelope.gallery_url)
    }
    const entries = extractImageEntries(res.data)
    return {
      data: toList(res.data, (row) => {
        if (rawEnvelope?.gallery_url && !row.gallery_url) {
          row.gallery_url = rawEnvelope.gallery_url
        }
        return toGallery(row, entries)
      }),
      raw: res.data,
    }
  }
  return { data: [], error: res.message }
}

/** Alias for getGalleries */
export const getGalleries = fetchGalleries

/**
 * 2. Fetch gallery item by ID
 */
export async function fetchGalleryById(
  id: number | string,
): Promise<{ data: GalleryRecord | null; error?: string }> {
  const res = await request<unknown>(`/gallery/${id}`)
  if (res.ok && res.data) {
    const payload = res.data as Record<string, unknown>
    if (payload?.gallery_url && typeof payload.gallery_url === 'string') {
      setCachedGalleryBaseUrl(payload.gallery_url)
    }
    const candidate = payload?.data ?? payload?.gallery ?? payload
    const raw = (Array.isArray(candidate) ? candidate[0] : candidate) as Record<string, unknown>
    if (payload?.gallery_url && !raw.gallery_url) {
      raw.gallery_url = payload.gallery_url
    }
    const entries = extractImageEntries(res.data)
    return { data: toGallery(raw, entries) }
  }
  return { data: null, error: res.message }
}

/** Alias for getGalleryById */
export const getGalleryById = fetchGalleryById

/**
 * 3. Create gallery item (Body: FormData -> gallery_image)
 */
export async function createGallery(
  payload: GalleryPayload | FormData,
): Promise<{ success: boolean; message: string; data?: GalleryRecord }> {
  let effectivePayload = payload

  if (effectivePayload instanceof FormData) {
    const rawImage =
      effectivePayload.get('gallery_image') ||
      effectivePayload.get('image') ||
      effectivePayload.get('file')
    if (rawImage instanceof File && !isWebpFile(rawImage)) {
      const webpFile = await convertToWebpFile(rawImage)
      effectivePayload.set('gallery_image', webpFile)
      effectivePayload.set('image', webpFile)
    }
  } else if (
    effectivePayload?.gallery_image instanceof File &&
    !isWebpFile(effectivePayload.gallery_image)
  ) {
    const webpFile = await convertToWebpFile(effectivePayload.gallery_image)
    effectivePayload = {
      ...effectivePayload,
      gallery_image: webpFile,
    }
  }

  const formData = buildGalleryFormData(effectivePayload, false)

  const res = await request<{ message?: string; data?: unknown }>('/gallery', {
    method: 'POST',
    body: formData,
  })

  if (res.ok) {
    const raw = (res.data?.data ?? res.data) as Record<string, unknown>
    const entries = extractImageEntries(res.data)
    return {
      success: true,
      message: res.data?.message ?? 'Gallery item created successfully.',
      data: raw ? toGallery(raw, entries) : undefined,
    }
  }

  return {
    success: false,
    message: res.message || 'Failed to create gallery item.',
  }
}

/**
 * 4. Update gallery item (Body: FormData -> gallery_image, gallery_status)
 */
export async function updateGallery(
  id: number | string,
  payload: GalleryPayload | FormData,
): Promise<{ success: boolean; message: string; data?: GalleryRecord }> {
  let effectivePayload = payload

  if (effectivePayload instanceof FormData) {
    const rawImage =
      effectivePayload.get('gallery_image') ||
      effectivePayload.get('image') ||
      effectivePayload.get('file')
    if (rawImage instanceof File && !isWebpFile(rawImage)) {
      const webpFile = await convertToWebpFile(rawImage)
      effectivePayload.set('gallery_image', webpFile)
      effectivePayload.set('image', webpFile)
    }
  } else if (
    effectivePayload?.gallery_image instanceof File &&
    !isWebpFile(effectivePayload.gallery_image)
  ) {
    const webpFile = await convertToWebpFile(effectivePayload.gallery_image)
    effectivePayload = {
      ...effectivePayload,
      gallery_image: webpFile,
    }
  }

  const formData = buildGalleryFormData(effectivePayload, true)

  // Try POST with _method=PUT spoofing first
  const spoofRes = await request<{ message?: string; data?: unknown }>(`/gallery/${id}`, {
    method: 'POST',
    body: formData,
  })

  if (spoofRes.ok) {
    const raw = (spoofRes.data?.data ?? spoofRes.data) as Record<string, unknown>
    const entries = extractImageEntries(spoofRes.data)
    return {
      success: true,
      message: spoofRes.data?.message ?? 'Gallery item updated successfully.',
      data: raw ? toGallery(raw, entries) : undefined,
    }
  }

  // Fallback direct PUT
  const directRes = await request<{ message?: string; data?: unknown }>(`/gallery/${id}`, {
    method: 'PUT',
    body: formData,
  })

  if (directRes.ok) {
    const raw = (directRes.data?.data ?? directRes.data) as Record<string, unknown>
    const entries = extractImageEntries(directRes.data)
    return {
      success: true,
      message: directRes.data?.message ?? 'Gallery item updated successfully.',
      data: raw ? toGallery(raw, entries) : undefined,
    }
  }

  // Fallback to /gallerys/{id}
  const pluralRes = await request<{ message?: string; data?: unknown }>(`/gallerys/${id}`, {
    method: 'POST',
    body: formData,
  })

  if (pluralRes.ok) {
    const raw = (pluralRes.data?.data ?? pluralRes.data) as Record<string, unknown>
    const entries = extractImageEntries(pluralRes.data)
    return {
      success: true,
      message: pluralRes.data?.message ?? 'Gallery item updated successfully.',
      data: raw ? toGallery(raw, entries) : undefined,
    }
  }

  return {
    success: false,
    message: spoofRes.message || 'Failed to update gallery item.',
  }
}

/**
 * 5. Update gallery status: Active / Inactive
 */
export async function updateGalleryStatus(
  id: number | string,
  gallery_status: GalleryStatus | string,
): Promise<{ success: boolean; message: string }> {
  const statusVal = String(gallery_status || 'Active').trim()
  const formData = new FormData()
  formData.append('gallery_status', statusVal)

  const res = await request<{ message?: string }>(`/gallerys/${id}/status`, {
    method: 'PATCH',
    body: formData,
  })

  if (res.ok) {
    return {
      success: true,
      message: res.data?.message ?? `Gallery status updated to ${statusVal}.`,
    }
  }

  const jsonRes = await request<{ message?: string }>(`/gallerys/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gallery_status: statusVal }),
  })

  if (jsonRes.ok) {
    return {
      success: true,
      message: jsonRes.data?.message ?? `Gallery status updated to ${statusVal}.`,
    }
  }

  return {
    success: false,
    message: res.message || 'Failed to update gallery status.',
  }
}

/**
 * 6. Fetch active gallery items
 */
export async function fetchActiveGalleries(): Promise<{ data: GalleryRecord[]; error?: string }> {
  const res = await request<unknown>('/activeGallerys')
  if (res.ok && res.data) {
    const entries = extractImageEntries(res.data)
    return {
      data: toList(res.data, (row) => toGallery(row, entries)),
    }
  }
  return { data: [], error: res.message }
}

/** Alias for getActiveGalleries */
export const getActiveGalleries = fetchActiveGalleries

/**
 * 7. Delete gallery item
 */
export async function deleteGallery(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/gallery/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return {
      success: true,
      message: res.data?.message ?? 'Gallery item deleted successfully.',
    }
  }

  // Graceful fallback: deactivate if delete is disallowed
  const fallback = await updateGalleryStatus(id, 'Inactive')
  if (fallback.success) {
    return {
      success: true,
      message: 'Gallery item deactivated successfully.',
    }
  }

  return {
    success: false,
    message: res.message || 'Failed to delete gallery item.',
  }
}

/**
 * @file src/module/super-admin/services/testimonialApi.ts
 * Dedicated API service layer for Testimonial management in the Super Admin Panel.
 *
 * Endpoints:
 *   GET    /testimonial              → list testimonials (with pagination & search)
 *   POST   /testimonial              → create testimonial
 *   GET    /testimonial/{id}         → single testimonial by ID
 *   PUT    /testimonial/{id}         → update testimonial (with FormData _method=PUT & JSON fallback)
 *   PATCH  /testimonials/{id}/status → update testimonial status (Active / Inactive)
 *   DELETE /testimonial/{id}         → delete testimonial (with deactivation fallback)
 */

import type {
  TestimonialListParams,
  TestimonialPayload,
  TestimonialRecord,
  TestimonialStatus,
} from '../types'
import { toList, toTestimonial } from './mappers'
import { buildQueryString, request } from './http'

/**
 * Builds FormData for Testimonial creation or update.
 */
function buildTestimonialFormData(payload: TestimonialPayload, isUpdate = false): FormData {
  const formData = new FormData()

  if (payload.testimonial_for !== undefined && payload.testimonial_for !== null) {
    formData.append('testimonial_for', String(payload.testimonial_for).trim())
  }

  if (payload.testimonial_client_name !== undefined && payload.testimonial_client_name !== null) {
    formData.append('testimonial_client_name', String(payload.testimonial_client_name).trim())
  }

  if (payload.testimonial_description !== undefined && payload.testimonial_description !== null) {
    formData.append('testimonial_description', String(payload.testimonial_description).trim())
  }

  if (payload.testimonial_rating !== undefined && payload.testimonial_rating !== null) {
    formData.append('testimonial_rating', String(payload.testimonial_rating).trim())
  }

  if (payload.testimonial_status !== undefined && payload.testimonial_status !== null) {
    formData.append('testimonial_status', String(payload.testimonial_status).trim())
  }

  if (isUpdate) {
    formData.append('_method', 'PUT')
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ')
    formData.append('testimonial_updated_date', nowStr)
    formData.append('updated_at', nowStr)
  }

  return formData
}

/**
 * 1. Fetch testimonial list with pagination and search
 */
export async function fetchTestimonials(
  params: TestimonialListParams = {},
): Promise<{ data: TestimonialRecord[]; error?: string; raw?: unknown }> {
  const query = buildQueryString({
    page: params.page,
    search: params.search,
    testimonial_for: params.testimonial_for,
    testimonial_status: params.testimonial_status,
  })

  const res = await request<unknown>(`/testimonial${query}`)
  if (res.ok && res.data) {
    return { data: toList(res.data, (row) => toTestimonial(row)), raw: res.data }
  }
  return { data: [], error: res.message }
}

/**
 * 2. Fetch testimonial by ID
 */
export async function fetchTestimonialById(
  id: number | string,
): Promise<{ data: TestimonialRecord | null; error?: string }> {
  const res = await request<unknown>(`/testimonial/${id}`)
  if (res.ok && res.data) {
    const payload = res.data as Record<string, unknown>
    const raw = (payload?.data ?? payload) as Record<string, unknown>
    return { data: toTestimonial(raw) }
  }
  return { data: null, error: res.message }
}

/**
 * 3. Create testimonial (Body: FormData with JSON fallback)
 */
export async function createTestimonial(
  payload: TestimonialPayload,
): Promise<{ success: boolean; message: string; data?: TestimonialRecord }> {
  const formData = buildTestimonialFormData(payload, false)

  let res = await request<Record<string, unknown>>('/testimonial', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    res = await request<Record<string, unknown>>('/testimonial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testimonial_for: String(payload.testimonial_for || '').trim(),
        testimonial_client_name: String(payload.testimonial_client_name || '').trim(),
        testimonial_description: String(payload.testimonial_description || '').trim(),
        testimonial_rating: String(payload.testimonial_rating || '5').trim(),
      }),
    })
  }

  if (res.ok) {
    const raw = (res.data?.data ?? res.data) as Record<string, unknown>
    return {
      success: true,
      message: (res.data?.message as string) || 'Testimonial created successfully.',
      data: raw ? toTestimonial(raw) : undefined,
    }
  }

  return { success: false, message: res.message || 'Failed to create testimonial.' }
}

/**
 * 4. Update testimonial (FormData with _method=PUT or JSON fallback)
 */
export async function updateTestimonial(
  id: number | string,
  payload: TestimonialPayload,
): Promise<{ success: boolean; message: string; data?: TestimonialRecord }> {
  const formData = buildTestimonialFormData(payload, true)
  const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ')

  let res = await request<Record<string, unknown>>(`/testimonial/${id}`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    res = await request<Record<string, unknown>>(`/testimonial/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testimonial_for: String(payload.testimonial_for || '').trim(),
        testimonial_client_name: String(payload.testimonial_client_name || '').trim(),
        testimonial_description: String(payload.testimonial_description || '').trim(),
        testimonial_rating: String(payload.testimonial_rating || '5').trim(),
        testimonial_status: String(payload.testimonial_status || 'Active').trim(),
        testimonial_updated_date: nowStr,
        updated_at: nowStr,
      }),
    })
  }

  if (res.ok) {
    const raw = (res.data?.data ?? res.data) as Record<string, unknown>
    return {
      success: true,
      message: (res.data?.message as string) || 'Testimonial updated successfully.',
      data: raw ? toTestimonial(raw) : undefined,
    }
  }

  return { success: false, message: res.message || 'Failed to update testimonial.' }
}

/**
 * 5. Update testimonial status: Active / Inactive
 */
export async function updateTestimonialStatus(
  id: number | string,
  testimonial_status: TestimonialStatus,
): Promise<{ success: boolean; message: string }> {
  const statusVal = String(testimonial_status || 'Active').trim()
  const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ')

  const formData = new FormData()
  formData.append('testimonial_status', statusVal)
  formData.append('testimonial_updated_date', nowStr)
  formData.append('updated_at', nowStr)

  let res = await request<{ message?: string }>(`/testimonials/${id}/status`, {
    method: 'PATCH',
    body: formData,
  })

  if (!res.ok) {
    res = await request<{ message?: string }>(`/testimonials/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testimonial_status: statusVal,
        testimonial_updated_date: nowStr,
        updated_at: nowStr,
      }),
    })
  }

  if (res.ok) {
    return {
      success: true,
      message: res.data?.message || `Testimonial status updated to ${statusVal}.`,
    }
  }

  return { success: false, message: res.message || 'Failed to update testimonial status.' }
}

/**
 * 6. Delete testimonial by ID (with fallback to deactivation if 500)
 */
export async function deleteTestimonial(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/testimonial/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return {
      success: true,
      message: res.data?.message || 'Testimonial deleted successfully.',
    }
  }

  // Fallback if destroy method fails on server
  if (res.status === 500 || res.message?.includes('destroy')) {
    try {
      await updateTestimonialStatus(id, 'Inactive')
      return { success: true, message: 'Testimonial deactivated successfully.' }
    } catch {
      // ignore fallback error
    }
  }

  return { success: false, message: res.message || 'Failed to delete testimonial.' }
}

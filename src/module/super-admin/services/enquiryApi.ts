/**
 * @file src/module/super-admin/services/enquiryApi.ts
 * Enquiry management API for the Super Admin Panel.
 *
 * Endpoints:
 *   GET    /enquiry            → list (pagination, search)
 *   GET    /enquiry/{id}       → single enquiry
 *   PUT    /enquiry/{id}       → update the enquiry status
 *   DELETE /enquiry/{id}       → delete an enquiry
 *   GET    /getEnquiryReport   → flat list for export and analysis
 *
 * The list endpoint answers with a paginated envelope
 * (`{ data: { current_page, data: [...], total, … } }`) and honours `search`,
 * `page` and `per_page`. It ignores the status filter, so the publication
 * state is filtered by the panel instead.
 */

import type {
  EnquiryListParams,
  EnquiryRecord,
  EnquiryStatus,
  ListMeta,
} from '../types'
import { toEnquiry, toList, toListMeta } from './mappers'
import { buildQueryString, request } from './http'

/**
 * GET /enquiry — fetches enquiries with pagination and search.
 */
export async function fetchEnquiries(
  params: EnquiryListParams = {},
): Promise<{ data: EnquiryRecord[]; meta: ListMeta; error?: string }> {
  const query = buildQueryString({
    page: params.page,
    per_page: params.per_page,
    search: params.search,
  })

  const res = await request<unknown>(`/enquiry${query}`)
  if (res.ok && res.data) {
    return { data: toList(res.data, toEnquiry), meta: toListMeta(res.data, params) }
  }
  return {
    data: [],
    meta: { current_page: 1, last_page: 1, per_page: params.per_page ?? 10, total: 0 },
    error: res.message,
  }
}

/**
 * GET /enquiry/{id} — fetches a single enquiry, including its timestamps.
 */
export async function fetchEnquiryById(
  id: number | string,
): Promise<{ data: EnquiryRecord | null; error?: string }> {
  const res = await request<unknown>(`/enquiry/${id}`)
  if (res.ok && res.data) {
    const payload = res.data as Record<string, unknown>
    const raw = (Array.isArray(payload.data) ? payload.data[0] : payload.data) ?? payload
    return { data: toEnquiry(raw as Record<string, unknown>) }
  }
  return { data: null, error: res.message }
}

/**
 * PUT /enquiry/{id} — updates the enquiry status.
 *
 * Laravel does not read `PUT` bodies sent as multipart, so the status is
 * posted with the `_method=PUT` override first; a real `PUT` with a JSON
 * body is the fallback for deployments that route it differently.
 */
export async function updateEnquiryStatus(
  id: number | string,
  enquiryStatus: EnquiryStatus,
): Promise<{ success: boolean; message: string }> {
  const statusVal = String(enquiryStatus || '').trim()

  const formData = new FormData()
  formData.append('enquiryStatus', statusVal)
  formData.append('_method', 'PUT')

  const res = await request<{ message?: string }>(`/enquiry/${id}`, {
    method: 'POST',
    body: formData,
  })

  if (res.ok) {
    return {
      success: true,
      message: res.data?.message || `Enquiry marked as ${statusVal}.`,
    }
  }

  // The route rejected the spoofed POST — fall back to a real PUT.
  const jsonRes = await request<{ message?: string }>(`/enquiry/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enquiryStatus: statusVal }),
  })

  if (jsonRes.ok) {
    return {
      success: true,
      message: jsonRes.data?.message || `Enquiry marked as ${statusVal}.`,
    }
  }

  return {
    success: false,
    message: jsonRes.message || res.message || 'Failed to update the enquiry status.',
  }
}

/**
 * DELETE /enquiry/{id} — removes an enquiry.
 */
export async function deleteEnquiry(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/enquiry/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'Enquiry deleted successfully.' }
  }
  return { success: false, message: res.message || 'Failed to delete the enquiry.' }
}

/**
 * GET /getEnquiryReport — fetches the flat enquiry list for export.
 *
 * Unlike the list endpoint this one answers with a bare array of every
 * record, so it is the right source for a CSV export.
 */
export async function fetchEnquiryReport(
  params: EnquiryListParams = {},
): Promise<{ data: EnquiryRecord[]; error?: string }> {
  const query = buildQueryString({
    search: params.search,
    status: params.status,
  })

  const res = await request<unknown>(`/getEnquiryReport${query}`)
  if (res.ok && res.data) {
    return { data: toList(res.data, toEnquiry) }
  }
  return { data: [], error: res.message }
}

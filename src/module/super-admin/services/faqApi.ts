/**
 * @file src/module/super-admin/services/faqApi.ts
 * Dedicated API service layer for FAQ management in the Super Admin Panel.
 *
 * Endpoints:
 *   GET    /faq              → list FAQ groups (with pagination & search)
 *   POST   /faq              → create FAQ group with sub-items
 *   GET    /faq/{id}         → single FAQ group with sub-items
 *   PUT    /faq/{id}         → update FAQ group & sub-items (with _method=PUT fallback)
 *   PATCH  /faqs/{id}/status → update parent FAQ status (Active / Inactive)
 *   DELETE /faq-sub/{id}     → delete single FAQ sub-question
 *   DELETE /faq/{id}         → delete FAQ group
 */

import type { FaqListParams, FaqPayload, FaqRecord, FaqStatus } from '../types'
import { toFaq, toList } from './mappers'
import { buildQueryString, request } from './http'

/**
 * 1. Fetch FAQ groups list with pagination and optional search
 */
export async function fetchFaqs(
  params: FaqListParams = {},
): Promise<{ data: FaqRecord[]; error?: string; raw?: unknown }> {
  const query = buildQueryString({
    page: params.page,
    search: params.search,
    faq_for: params.faq_for,
    faq_status: params.faq_status,
  })

  const res = await request<unknown>(`/faq${query}`)
  if (res.ok && res.data) {
    return { data: toList(res.data, (row) => toFaq(row)), raw: res.data }
  }
  return { data: [], error: res.message }
}

/**
 * 2. Fetch single FAQ group by ID with its sub-items
 */
export async function fetchFaqById(
  id: number | string,
): Promise<{ data: FaqRecord | null; error?: string }> {
  const res = await request<unknown>(`/faq/${id}`)
  if (res.ok && res.data) {
    const payload = res.data as Record<string, unknown>
    const raw = (payload?.data ?? payload) as Record<string, unknown>
    return { data: toFaq(raw) }
  }
  return { data: null, error: res.message }
}

/**
 * 3. Create FAQ group with sub-items
 */
export async function createFaq(
  payload: FaqPayload,
): Promise<{ success: boolean; message: string; data?: FaqRecord }> {
  const formattedPayload = {
    faq_for: String(payload.faq_for || '').trim(),
    subs: (payload.subs || []).map((sub, idx) => ({
      faq_sort: Number(sub.faq_sort ?? idx + 1) || idx + 1,
      faq_for: String(sub.faq_for || payload.faq_for || '').trim(),
      faq_heading: String(sub.faq_heading || '').trim(),
      faq_que: String(sub.faq_que || '').trim(),
      faq_ans: String(sub.faq_ans || '').trim(),
      faq_status:
        String(sub.faq_status).toLowerCase() === 'inactive' ||
        sub.faq_status === 0 ||
        sub.faq_status === '0'
          ? 0
          : 1,
    })),
  }

  const res = await request<Record<string, unknown>>('/faq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formattedPayload),
  })

  if (res.ok) {
    const raw = (res.data?.data ?? res.data) as Record<string, unknown>
    return {
      success: true,
      message: (res.data?.message as string) || 'FAQ group created successfully.',
      data: raw ? toFaq(raw) : undefined,
    }
  }

  return { success: false, message: res.message || 'Failed to create FAQ group.' }
}

/**
 * 4. Update FAQ group and sub-items (JSON with fallback _method=PUT)
 */
export async function updateFaq(
  id: number | string,
  payload: FaqPayload,
): Promise<{ success: boolean; message: string; data?: FaqRecord }> {
  const formattedPayload = {
    faq_for: String(payload.faq_for || '').trim(),
    faq_status: String(payload.faq_status || 'Active').trim(),
    subs: (payload.subs || []).map((sub, idx) => {
      const subItem: Record<string, unknown> = {
        faq_sort: Number(sub.faq_sort ?? idx + 1) || idx + 1,
        faq_for: String(sub.faq_for || payload.faq_for || '').trim(),
        faq_heading: String(sub.faq_heading || '').trim(),
        faq_que: String(sub.faq_que || '').trim(),
        faq_ans: String(sub.faq_ans || '').trim(),
        faq_status:
          String(sub.faq_status).toLowerCase() === 'inactive' ||
          sub.faq_status === 0 ||
          sub.faq_status === '0'
            ? 0
            : 1,
      }
      if (sub.id) {
        subItem.id = Number(sub.id) || sub.id
      }
      return subItem
    }),
  }

  let res = await request<Record<string, unknown>>(`/faq/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formattedPayload),
  })

  // Fallback using POST with _method = PUT if PUT fails
  if (!res.ok) {
    res = await request<Record<string, unknown>>(`/faq/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formattedPayload, _method: 'PUT' }),
    })
  }

  if (res.ok) {
    const raw = (res.data?.data ?? res.data) as Record<string, unknown>
    return {
      success: true,
      message: (res.data?.message as string) || 'FAQ group updated successfully.',
      data: raw ? toFaq(raw) : undefined,
    }
  }

  return { success: false, message: res.message || 'Failed to update FAQ group.' }
}

/**
 * 5. Update parent FAQ status (Active / Inactive)
 */
export async function updateFaqStatus(
  id: number | string,
  faq_status: FaqStatus,
): Promise<{ success: boolean; message: string }> {
  const statusVal = String(faq_status || 'Active').trim()

  const formData = new FormData()
  formData.append('faq_status', statusVal)

  let res = await request<{ message?: string }>(`/faqs/${id}/status`, {
    method: 'PATCH',
    body: formData,
  })

  if (!res.ok) {
    res = await request<{ message?: string }>(`/faqs/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faq_status: statusVal }),
    })
  }

  if (res.ok) {
    return {
      success: true,
      message: res.data?.message || `FAQ status updated to ${statusVal}.`,
    }
  }

  return { success: false, message: res.message || 'Failed to update FAQ status.' }
}

/**
 * 6. Delete single FAQ sub-question by sub ID
 */
export async function deleteFaqSub(
  subId: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/faq-sub/${subId}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return {
      success: true,
      message: res.data?.message || 'FAQ question deleted successfully.',
    }
  }

  return { success: false, message: res.message || 'Failed to delete FAQ question.' }
}

/**
 * 7. Delete entire FAQ group by ID (with fallback to deactivation if 500)
 */
export async function deleteFaq(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/faq/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return {
      success: true,
      message: res.data?.message || 'FAQ group deleted successfully.',
    }
  }

  // Fallback: If delete errors on backend (e.g. destroy method missing), deactivate
  if (res.status === 500 || res.message?.includes('destroy')) {
    try {
      await updateFaqStatus(id, 'Inactive')
      return { success: true, message: 'FAQ group deactivated successfully.' }
    } catch {
      // ignore fallback error
    }
  }

  return { success: false, message: res.message || 'Failed to delete FAQ group.' }
}

export interface PageTwoOptionItem {
  id?: number | string
  page_two_url: string
  page_two_name?: string | null
  page_two_type?: string | null
  page_two_status?: string | null
}

/**
 * 8. Fetch dynamic page placement options (sitemap and dynamic pages)
 */
export async function fetchPageTwoOptions(): Promise<{
  data: PageTwoOptionItem[]
  error?: string
}> {
  const res = await request<{ data?: PageTwoOptionItem[]; blog?: PageTwoOptionItem[] }>('/getSitemap')
  if (res.ok && res.data) {
    const pages = Array.isArray(res.data.data) ? res.data.data : []
    const blogs = Array.isArray(res.data.blog) ? res.data.blog : []
    const combined = [...pages, ...blogs].filter(
      (item) => item && typeof item.page_two_url === 'string' && item.page_two_url.trim().length > 0,
    )
    return { data: combined }
  }
  return { data: [], error: res.message }
}

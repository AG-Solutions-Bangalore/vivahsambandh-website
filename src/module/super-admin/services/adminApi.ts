/**
 * @file src/module/super-admin/services/adminApi.ts
 * Dedicated API service layer for Super Admin Panel operations.
 * Wraps existing API client configuration, handles Bearer auth headers,
 * supports multipart form data, and provides resilient state handling.
 */

import { API_BASE_URL, API_SECRET_KEY, resolveImageUrl } from '@/lib/api/apiClient'
import type {
  AdminMember,
  AdminMemberStatus,
  BlockProfileRecord,
  CreateNotificationPayload,
  FeedbackRecord,
  Member,
  MemberStatus,
  NotificationRecord,
  PanelLoginResponse,
  SuperAdminSession,
} from '../types'
import {
  toAdminMember,
  toBlockProfile,
  toFeedback,
  toList,
  toMember,
  toNotification,
} from './mappers'

const AUTH_STORAGE_KEY = 'super_admin_session'

export function getStoredSession(): SuperAdminSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SuperAdminSession
  } catch {
    return null
  }
}

export function saveSession(session: SuperAdminSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

function getAuthHeaders(extra?: HeadersInit): HeadersInit {
  const session = getStoredSession()
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (API_SECRET_KEY) {
    headers['X-Secret-Key'] = API_SECRET_KEY
  }

  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`
  }

  if (extra) {
    if (extra instanceof Headers) {
      extra.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(extra)) {
      extra.forEach(([k, v]) => {
        headers[k] = v
      })
    } else {
      Object.assign(headers, extra)
    }
  }

  return headers
}

/**
 * Turns a raw transport/server message into something an admin can act on.
 *
 * The CRM backend occasionally answers with a raw PHP exception payload
 * ("syntax error, unexpected token \"*\"", file paths, stack frames). Leaking
 * that into the panel is both useless and unsafe, so it is logged for
 * developers and replaced with a plain, retryable message.
 */
function friendlyErrorMessage(
  raw: string | undefined,
  status: number,
  context: string,
): string {
  const detail = raw?.trim() ?? ''

  if (/syntax error|ParseError|Stack trace|#\d+ \/|vendor\/|laravel\.framework/i.test(detail)) {
    console.error(`[super-admin] ${context} failed with a server error:`, detail)
    return 'The server could not process this request. Please try again in a moment.'
  }

  if (status === 401 || status === 403) {
    return 'Your session is no longer valid. Please sign in again.'
  }

  if (status === 404) {
    return 'That record could not be found. It may have been removed already.'
  }

  if (status >= 500) {
    console.error(`[super-admin] ${context} failed (${status}):`, detail)
    return 'The server is having trouble right now. Please try again shortly.'
  }

  if (status === 0) {
    return 'Could not reach the server. Check your connection and try again.'
  }

  return detail || 'Something went wrong. Please try again.'
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ ok: boolean; status: number; data: T | null; message?: string }> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${cleanEndpoint}`

  try {
    const res = await fetch(url, {
      ...options,
      headers: getAuthHeaders(options.headers),
    })

    const text = await res.text()
    let json: unknown = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      json = null
    }

    if (!res.ok) {
      const errObj = json as { message?: string; errors?: Record<string, string[]> } | null
      const firstErr = errObj?.errors ? Object.values(errObj.errors)[0]?.[0] : undefined
      const raw = firstErr || errObj?.message || `HTTP error ${res.status}`
      return {
        ok: false,
        status: res.status,
        data: null,
        message: friendlyErrorMessage(raw, res.status, cleanEndpoint),
      }
    }

    return { ok: true, status: res.status, data: json as T }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network request failed'
    return {
      ok: false,
      status: 0,
      data: null,
      message: friendlyErrorMessage(message, 0, cleanEndpoint),
    }
  }
}

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

export async function superAdminLogin(
  username: string,
  password: string,
): Promise<{ success: boolean; session?: SuperAdminSession; message: string; isInactiveProfile?: boolean }> {
  const url = `${API_BASE_URL}/panel-login`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const data = (await res.json().catch(() => null)) as PanelLoginResponse | null

    // Check if credentials are valid but user account is inactive in DB
    if (data?.message?.toLowerCase().includes('inactive')) {
      return {
        success: false,
        message: data.message || 'Your profile is inactive. Contact admin.',
        isInactiveProfile: true,
      }
    }

    if (!res.ok || (data?.code && data.code >= 400)) {
      return {
        success: false,
        message: data?.message || 'Login failed. Please check credentials.',
      }
    }

    const token = data?.UserInfo?.token || data?.token
    if (token) {
      const session: SuperAdminSession = {
        token,
        user: data?.UserInfo?.user || {
          id: 1,
          name: 'Super Admin',
          username,
          user_type: 'Super Admin',
        },
        expiresAt: data?.UserInfo?.token_expires_at,
      }
      saveSession(session)
      return { success: true, session, message: 'Logged in successfully' }
    }

    return {
      success: false,
      message: data?.message || 'No authentication token received from server.',
    }
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error during login.',
    }
  }
}

// -------------------------------------------------------------
// Admin Members Endpoints
// -------------------------------------------------------------

export async function fetchAdminMembers(): Promise<{
  data: AdminMember[]
  error?: string
}> {
  const res = await request<unknown>('/getAdminMember')
  if (res.ok && res.data) {
    return { data: toList(res.data, toAdminMember) }
  }
  return { data: [], error: res.message }
}

export async function fetchPendingAdminMembers(): Promise<{
  data: AdminMember[]
  error?: string
}> {
  const res = await request<unknown>('/getPendingAdminMember')
  if (res.ok && res.data) {
    return { data: toList(res.data, toAdminMember) }
  }
  return { data: [], error: res.message }
}

export async function updateMemberCity(
  id: number | string,
  cities: string[] | string,
): Promise<{ success: boolean; message: string }> {
  const payload = {
    multiple_city: Array.isArray(cities) ? cities : cities.split(',').map((c) => c.trim()),
  }

  const res = await request<{ message?: string }>(`/members/${id}/city`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'City assignments updated successfully.' }
  }
  return { success: false, message: res.message || 'Failed to update city assignments.' }
}

export async function updateMemberStatus(
  id: number | string,
  status: AdminMemberStatus | MemberStatus,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/members/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || `Status updated to ${status}.` }
  }
  return { success: false, message: res.message || 'Failed to update status.' }
}

// -------------------------------------------------------------
// Members Endpoints
// -------------------------------------------------------------

export async function fetchMembers(): Promise<{
  data: Member[]
  error?: string
}> {
  const res = await request<unknown>('/member')
  if (res.ok && res.data) {
    return { data: toList(res.data, toMember) }
  }
  return { data: [], error: res.message }
}

export async function fetchPendingMembers(): Promise<{
  data: Member[]
  error?: string
}> {
  const res = await request<unknown>('/getPendingMember')
  if (res.ok && res.data) {
    return { data: toList(res.data, toMember) }
  }
  return { data: [], error: res.message }
}

// -------------------------------------------------------------
// Feedback Endpoints
// -------------------------------------------------------------

export async function fetchFeedbacks(): Promise<{
  data: FeedbackRecord[]
  error?: string
}> {
  const res = await request<unknown>('/feedback')
  if (res.ok && res.data) {
    return { data: toList(res.data, toFeedback) }
  }
  return { data: [], error: res.message }
}

export async function deleteFeedbackRecord(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/feedback/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'Feedback deleted successfully.' }
  }
  return { success: false, message: res.message || 'Failed to delete feedback.' }
}

// -------------------------------------------------------------
// Block Profile Endpoints
// -------------------------------------------------------------

export async function fetchBlockProfiles(): Promise<{
  data: BlockProfileRecord[]
  error?: string
}> {
  const res = await request<unknown>('/blockProfile')
  if (res.ok && res.data) {
    return { data: toList(res.data, toBlockProfile) }
  }
  return { data: [], error: res.message }
}

export async function deleteBlockProfileRecord(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/blockProfile/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'Blocked profile record deleted.' }
  }
  return { success: false, message: res.message || 'Failed to delete blocked profile record.' }
}

// -------------------------------------------------------------
// Notification Endpoints
// -------------------------------------------------------------

export async function fetchNotifications(): Promise<{
  data: NotificationRecord[]
  error?: string
}> {
  const res = await request<unknown>('/notification')
  if (res.ok && res.data) {
    return { data: toList(res.data, toNotification) }
  }
  return { data: [], error: res.message }
}

export async function fetchNotificationById(
  id: number | string,
): Promise<{ data: NotificationRecord | null; error?: string }> {
  const res = await request<unknown>(`/notification/${id}`)
  if (res.ok && res.data) {
    const payload = res.data as Record<string, unknown>
    const raw = (Array.isArray(payload.data) ? payload.data[0] : payload.data) ?? payload
    return { data: toNotification(raw as Record<string, unknown>) }
  }
  return { data: null, error: res.message }
}

export async function createNotification(
  payload: CreateNotificationPayload,
): Promise<{ success: boolean; message: string; data?: NotificationRecord }> {
  const formData = new FormData()
  formData.append('notification_date', payload.notification_date)
  formData.append('notification_for', payload.notification_for)
  formData.append('notification_heading', payload.notification_heading)
  formData.append('notification_message', payload.notification_message)
  if (payload.notification_image) {
    formData.append('notification_image', payload.notification_image)
  }

  const url = `${API_BASE_URL}/notification`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    })

    const json = await res.json().catch(() => null)
    if (!res.ok) {
      const errObj = json as { message?: string; errors?: Record<string, string[]> } | null
      const firstErr = errObj?.errors ? Object.values(errObj.errors)[0]?.[0] : undefined
      return {
        success: false,
        message: firstErr || errObj?.message || `Server responded with ${res.status}`,
      }
    }

    return {
      success: true,
      message: json?.message || 'Notification broadcast created successfully.',
      data: json?.data || json,
    }
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to create notification.',
    }
  }
}

export async function deleteNotificationRecord(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/notification/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'Notification removed successfully.' }
  }
  return { success: false, message: res.message || 'Failed to remove notification.' }
}

export { resolveImageUrl }


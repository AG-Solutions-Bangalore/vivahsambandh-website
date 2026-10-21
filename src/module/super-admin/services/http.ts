/**
 * @file src/module/super-admin/services/http.ts
 * Shared transport layer for the Super Admin Panel.
 *
 * Every panel endpoint is authenticated the same way — the stored session
 * token plus the API secret key — and every panel service needs the same
 * "never throw, translate the failure" behaviour. That lives here so each
 * service module only has to describe its own endpoints.
 */

import { API_BASE_URL, API_SECRET_KEY } from '@/lib/api/apiClient'
import type { SuperAdminSession } from '../types'

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

/** Builds the auth headers every panel request carries. */
export function getAuthHeaders(extra?: HeadersInit): HeadersInit {
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
export function friendlyErrorMessage(
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

export interface PanelResponse<T> {
  ok: boolean
  status: number
  data: T | null
  message?: string
}

/**
 * Performs an authenticated panel request. Never throws — failures are
 * returned as `{ ok: false, message }` so the caller can surface them.
 *
 * `FormData` bodies are sent as-is: the browser sets the multipart
 * boundary itself, so no `Content-Type` header is set here.
 */
export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<PanelResponse<T>> {
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

/** Serialises a params object into a query string, skipping empty values. */
export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.append(key, String(value))
  }

  const query = search.toString()
  return query ? `?${query}` : ''
}

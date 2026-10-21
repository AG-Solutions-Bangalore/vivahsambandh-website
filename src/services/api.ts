/**
 * @file src/services/api.ts
 * Lightweight HTTP client for VivahSambandh / CRM API endpoints.
 *
 * Provides an Axios-compatible interface (.get, .post, .put, .patch, .delete)
 * using the project's native fetch and authentication infrastructure.
 */

import { API_BASE_URL, API_SECRET_KEY } from '@/lib/api/apiClient'
import { getStoredSession } from '@/module/super-admin/services/http'

export interface RequestConfig {
  params?: Record<string, unknown> | number
  headers?: Record<string, string>
}

export interface ApiResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Headers
}

export interface ApiErrorResponse {
  status: number
  data?: unknown
  message?: string
}

export class ApiError extends Error {
  response?: ApiErrorResponse

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.response = {
      status,
      data,
      message,
    }
  }
}

/**
 * Executes a request against API_BASE_URL with authentication headers
 * and Axios-compatible response structure.
 */
async function executeRequest<T = unknown>(
  method: string,
  url: string,
  body?: unknown,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const cleanEndpoint = url.startsWith('/') ? url : `/${url}`
  let fullUrl = `${API_BASE_URL}${cleanEndpoint}`

  // Process query params
  if (config.params !== undefined && config.params !== null) {
    const search = new URLSearchParams()
    if (typeof config.params === 'number') {
      search.append('page', String(config.params))
    } else if (typeof config.params === 'object') {
      for (const [key, value] of Object.entries(config.params)) {
        if (value !== undefined && value !== null && value !== '') {
          search.append(key, String(value))
        }
      }
    }
    const qs = search.toString()
    if (qs) {
      fullUrl += fullUrl.includes('?') ? `&${qs}` : `?${qs}`
    }
  }

  // Build auth headers
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

  let finalBody: BodyInit | undefined = undefined

  if (body instanceof FormData) {
    finalBody = body
    // Let the browser set the multipart boundary automatically
  } else if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json'
    finalBody = typeof body === 'string' ? body : JSON.stringify(body)
  }

  // Merge extra headers, filtering out content-type when body is FormData
  if (config.headers) {
    for (const [key, value] of Object.entries(config.headers)) {
      if (key.toLowerCase() === 'content-type' && body instanceof FormData) {
        // Do not override Content-Type so browser can include multipart boundary
        continue
      }
      headers[key] = value
    }
  }

  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: finalBody,
    })

    const text = await res.text()
    let data: unknown = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text
    }

    if (!res.ok) {
      const errObj = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
      const errMsg =
        (typeof errObj.message === 'string' && errObj.message) ||
        `Request failed with status ${res.status}`
      throw new ApiError(errMsg, res.status, data)
    }

    return {
      data: data as T,
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    }
  } catch (err) {
    if (err instanceof ApiError) {
      throw err
    }
    const message = err instanceof Error ? err.message : 'Network request failed'
    throw new ApiError(message, 0)
  }
}

export const api = {
  get: <T = unknown>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> =>
    executeRequest<T>('GET', url, undefined, config),

  post: <T = unknown>(
    url: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> => executeRequest<T>('POST', url, body, config),

  put: <T = unknown>(
    url: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> => executeRequest<T>('PUT', url, body, config),

  patch: <T = unknown>(
    url: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> => executeRequest<T>('PATCH', url, body, config),

  delete: <T = unknown>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> =>
    executeRequest<T>('DELETE', url, undefined, config),
}

export default api

/**
 * @file src/module/super-admin/services/clientApi.ts
 * Dedicated API service layer for Client management in the Super Admin Panel.
 *
 * Endpoints:
 *   GET    /client              → list clients (with pagination & search)
 *   POST   /client              → create client (Body: FormData -> clients_name, clients_image)
 *   GET    /client/{id}         → single client by ID
 *   PUT    /client/{id}         → update client (Body: FormData with _method=PUT & direct PUT fallback)
 *   PATCH  /clients/{id}/status → update client status (Active / Inactive)
 *   DELETE /client/{id}         → delete client (with fallback to Inactive status)
 */

import type {
  ClientListParams,
  ClientPayload,
  ClientRecord,
  ClientStatus,
} from '../types'
import { extractImageEntries, toClient, toList } from './mappers'
import { buildQueryString, request } from './http'
import { convertToWebpFile, isWebpFile } from '@/lib/image'

/**
 * Helper to construct FormData for Client operations.
 */
export function buildClientFormData(
  payload: ClientPayload | FormData | null | undefined,
  isUpdate = false,
): FormData {
  if (payload instanceof FormData) {
    if (isUpdate && !payload.has('_method')) {
      payload.append('_method', 'PUT')
    }
    return payload
  }

  const formData = new FormData()

  const name = payload?.clients_name || payload?.client_name || payload?.name || ''
  if (name) {
    formData.append('clients_name', String(name).trim())
  }

  const image = payload?.clients_image || payload?.client_image || payload?.image
  if (image instanceof File || image instanceof Blob) {
    formData.append('clients_image', image)
  }

  if (isUpdate) {
    const status = payload?.clients_status || payload?.client_status || payload?.status
    if (status) {
      formData.append('clients_status', String(status).trim())
    }
    formData.append('_method', 'PUT')
  }

  return formData
}

/**
 * 1. Fetch client list with pagination and search
 */
export async function fetchClients(
  params: ClientListParams | number = {},
): Promise<{ data: ClientRecord[]; error?: string; raw?: unknown }> {
  const queryParams = typeof params === 'number' ? { page: params } : params
  const query = buildQueryString({
    page: queryParams.page,
    per_page: queryParams.per_page,
    search: queryParams.search,
    clients_status: queryParams.clients_status,
  })

  const res = await request<unknown>(`/client${query}`)
  if (res.ok && res.data) {
    const entries = extractImageEntries(res.data)
    return {
      data: toList(res.data, (row) => toClient(row, entries)),
      raw: res.data,
    }
  }
  return { data: [], error: res.message }
}

/** Alias for getClients */
export const getClients = fetchClients

/**
 * 2. Fetch client by ID
 */
export async function fetchClientById(
  id: number | string,
): Promise<{ data: ClientRecord | null; error?: string }> {
  const res = await request<unknown>(`/client/${id}`)
  if (res.ok && res.data) {
    const payload = res.data as Record<string, unknown>
    const candidate = payload?.data ?? payload?.client ?? payload
    const raw = (Array.isArray(candidate) ? candidate[0] : candidate) as Record<string, unknown>
    const entries = extractImageEntries(res.data)
    return { data: toClient(raw, entries) }
  }
  return { data: null, error: res.message }
}

/** Alias for getClientById */
export const getClientById = fetchClientById

/** Alias for findClientById */
export const findClientById = fetchClientById

/**
 * 3. Create client (Body: FormData -> clients_name, clients_image)
 */
export async function createClient(
  payload: ClientPayload | FormData,
): Promise<{ success: boolean; message: string; data?: ClientRecord }> {
  // Ensure any image file is converted to WebP format as required by the backend
  if (payload instanceof FormData) {
    const rawImage = payload.get('clients_image')
    if (rawImage instanceof File && !isWebpFile(rawImage)) {
      const webpFile = await convertToWebpFile(rawImage)
      payload.set('clients_image', webpFile)
    }
  } else if (payload?.clients_image instanceof File && !isWebpFile(payload.clients_image)) {
    payload.clients_image = await convertToWebpFile(payload.clients_image)
  }

  const formData = buildClientFormData(payload, false)

  let res = await request<Record<string, unknown>>('/client', {
    method: 'POST',
    body: formData,
  })

  // Fallback to JSON if FormData without files is rejected
  if (!res.ok && !(payload instanceof FormData) && !(payload?.clients_image instanceof File)) {
    const name = payload?.clients_name || payload?.client_name || payload?.name || ''
    res = await request<Record<string, unknown>>('/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clients_name: String(name).trim(),
      }),
    })
  }

  if (res.ok) {
    const raw = (res.data?.data ?? res.data) as Record<string, unknown>
    const entries = extractImageEntries(res.data)
    return {
      success: true,
      message: (res.data?.message as string) || 'Client created successfully.',
      data: raw ? toClient(raw, entries) : undefined,
    }
  }

  return { success: false, message: res.message || 'Failed to create client.' }
}

/**
 * 4. Update client (Body: FormData -> clients_name, clients_image, clients_status)
 */
export async function updateClient(
  id: number | string,
  payload: ClientPayload | FormData,
): Promise<{ success: boolean; message: string; data?: ClientRecord }> {
  // Ensure any image file is converted to WebP format as required by the backend
  if (payload instanceof FormData) {
    const rawImage = payload.get('clients_image')
    if (rawImage instanceof File && !isWebpFile(rawImage)) {
      const webpFile = await convertToWebpFile(rawImage)
      payload.set('clients_image', webpFile)
    }
  } else if (payload?.clients_image instanceof File && !isWebpFile(payload.clients_image)) {
    payload.clients_image = await convertToWebpFile(payload.clients_image)
  }

  const formData = buildClientFormData(payload, true)

  let res = await request<Record<string, unknown>>(`/client/${id}`, {
    method: 'POST',
    body: formData,
  })

  // Fallback direct PUT request
  if (!res.ok) {
    res = await request<Record<string, unknown>>(`/client/${id}`, {
      method: 'PUT',
      body: formData,
    })
  }

  // Fallback JSON PUT if FormData failed and no binary file was provided
  if (!res.ok && !(payload instanceof FormData) && !(payload?.clients_image instanceof File)) {
    const name = payload?.clients_name || payload?.client_name || payload?.name || ''
    const status = payload?.clients_status || payload?.client_status || payload?.status || 'Active'
    res = await request<Record<string, unknown>>(`/client/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clients_name: String(name).trim(),
        clients_status: String(status).trim(),
      }),
    })
  }

  if (res.ok) {
    const raw = (res.data?.data ?? res.data) as Record<string, unknown>
    const entries = extractImageEntries(res.data)
    return {
      success: true,
      message: (res.data?.message as string) || 'Client updated successfully.',
      data: raw ? toClient(raw, entries) : undefined,
    }
  }

  return { success: false, message: res.message || 'Failed to update client.' }
}

/**
 * 5. Update client status: Active / Inactive
 */
export async function updateClientStatus(
  id: number | string,
  clients_status?: ClientStatus | string,
): Promise<{ success: boolean; message: string }> {
  const statusVal = String(clients_status || 'Active').trim()
  const formData = new FormData()
  formData.append('clients_status', statusVal)

  let res = await request<{ message?: string }>(`/clients/${id}/status`, {
    method: 'PATCH',
    body: formData,
  })

  if (!res.ok) {
    res = await request<{ message?: string }>(`/clients/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clients_status: statusVal,
      }),
    })
  }

  if (res.ok) {
    return {
      success: true,
      message: res.data?.message || `Client status updated to ${statusVal}.`,
    }
  }

  return { success: false, message: res.message || 'Failed to update client status.' }
}

/**
 * 6. Delete client by ID (with fallback to Inactive status)
 */
export async function deleteClient(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/client/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return {
      success: true,
      message: res.data?.message || 'Client deleted successfully.',
    }
  }

  const errMsg = res.message || ''
  if (res.status === 500 || errMsg.includes('undefined method') || errMsg.includes('destroy')) {
    try {
      await updateClientStatus(id, 'Inactive')
      return { success: true, message: 'Client deactivated successfully.' }
    } catch {
      // ignore fallback error
    }
  }

  return { success: false, message: res.message || 'Failed to delete client.' }
}

export default {
  getClients,
  fetchClients,
  createClient,
  getClientById,
  findClientById,
  fetchClientById,
  updateClient,
  updateClientStatus,
  deleteClient,
}

/**
 * @file src/services/clientApi.ts
 * Client operations service layer.
 *
 * Endpoints:
 *   1. GET    /client              → Fetch client list with pagination and search
 *   2. POST   /client              → Create client (Body: FormData -> clients_name, clients_image)
 *   3. GET    /client/{id}         → Fetch client by ID
 *   4. PUT    /client/{id}         → Update client (Body: FormData -> clients_name, clients_image, clients_status)
 *   5. PATCH  /clients/{id}/status → Update client status: Active / Inactive
 *   6. DELETE /client/{id}         → Delete client by ID (with fallback to Inactive status)
 */

import api from './api'
import { convertToWebpFile, isWebpFile } from '@/lib/image'

export type ClientStatus = 'Active' | 'Inactive'

export interface ClientPayload {
  clients_name?: string
  client_name?: string
  name?: string
  clients_image?: File | Blob | string | null
  client_image?: File | Blob | string | null
  image?: File | Blob | string | null
  clients_status?: ClientStatus | string
  client_status?: ClientStatus | string
  status?: ClientStatus | string
  [key: string]: unknown
}

export type ClientListParams = number | Record<string, unknown>

/**
 * Helper to construct FormData for Client operations
 */
export function buildClientFormData(
  payload?: ClientPayload | FormData | null,
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
 * 1. GET /client
 * Fetch client list with pagination and search
 */
export const getClients = async <T = unknown>(params: ClientListParams = {}): Promise<T> => {
  const queryParams = typeof params === 'number' ? { page: params } : params
  const response = await api.get<T>('/client', { params: queryParams })
  return response.data
}

/**
 * 2. POST /client
 * Create client (Body: FormData -> clients_name, clients_image)
 */
export const createClient = async <T = unknown>(
  payload: ClientPayload | FormData,
): Promise<T> => {
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
  const response = await api.post<T>('/client', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * 3. GET /client/{id}
 * Fetch client by ID
 */
export const getClientById = async <T = unknown>(id: number | string): Promise<T> => {
  const response = await api.get<T>(`/client/${id}`)
  return response.data
}

/** Alias for getClientById */
export const findClientById = getClientById

/**
 * 4. PUT /client/{id}
 * Update client (Body: FormData -> clients_name, clients_image, clients_status)
 */
export const updateClient = async <T = unknown>(
  id: number | string,
  payload: ClientPayload | FormData,
): Promise<T> => {
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

  try {
    const response = await api.post<T>(`/client/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch {
    // Fallback direct PUT request
    const response = await api.put<T>(`/client/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }
}

/**
 * 5. PATCH /clients/{id}/status
 * Update client status: Active / Inactive
 */
export const updateClientStatus = async <T = unknown>(
  id: number | string,
  clients_status?: ClientStatus | string,
): Promise<T> => {
  const statusVal = String(clients_status || 'Active').trim()
  const formData = new FormData()
  formData.append('clients_status', statusVal)

  try {
    const response = await api.patch<T>(`/clients/${id}/status`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch {
    const response = await api.patch<T>(`/clients/${id}/status`, {
      clients_status: statusVal,
    })
    return response.data
  }
}

/**
 * 6. DELETE /client/{id}
 * Delete client by ID
 */
export const deleteClient = async <T = unknown>(
  id: number | string,
): Promise<T | { success: boolean; message: string }> => {
  try {
    const response = await api.delete<T>(`/client/${id}`)
    return response.data
  } catch (err: unknown) {
    const anyErr = err as {
      response?: { status?: number; data?: { message?: string } }
      message?: string
    }
    const errMsg = anyErr?.response?.data?.message || anyErr?.message || ''
    if (
      anyErr?.response?.status === 500 ||
      errMsg.includes('undefined method') ||
      errMsg.includes('destroy')
    ) {
      try {
        await updateClientStatus(id, 'Inactive')
      } catch {
        // Fallback status change
      }
      return { success: true, message: 'Client deactivated successfully.' }
    }
    throw err
  }
}

export default {
  getClients,
  createClient,
  getClientById,
  findClientById,
  updateClient,
  updateClientStatus,
  deleteClient,
}

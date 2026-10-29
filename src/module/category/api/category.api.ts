/**
 * @file src/module/category/api/category.api.ts
 * Category service for the Vivah Sambandh / CRM API.
 *
 * Endpoints:
 *   1. GET    /category              → list (pagination, search, status filter)
 *   2. POST   /category              → create (Body: FormData -> category_name)
 *   3. GET    /category/{id}         → single category by ID
 *   4. PUT    /category/{id}         → update (Body: FormData -> category_name, category_status)
 *   5. PATCH  /categorys/{id}/status → publication state: Active / Inactive
 *   6. GET    /activeCategorys       → active categories only
 *   7. DELETE /category/{id}         → delete (falls back to deactivation)
 *
 * The CRM exposes the same value under several field names, so every read
 * walks the full alias list and every write appends the aliases together —
 * the backend picks whichever key it reads.
 *
 * Reads throw on failure (React Query turns that into an error state);
 * writes report the outcome as `{ success, message }` so the caller can
 * show it without a try/catch.
 */

import api, { ApiError } from '@/services/api'
import type {
  Category,
  CategoryActionResult,
  CategoryListParams,
  CategoryListResult,
  CategoryPayload,
  CategoryStatus,
} from '../types'

type Raw = Record<string, unknown>

/** Reads a trimmed string, or `null` when the value is missing or blank. */
function text(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const str = String(value).trim()
  return str.length ? str : null
}

/** Normalises the publication state the API reports. */
function categoryStatus(value: unknown): CategoryStatus {
  const raw = text(value)?.toLowerCase()
  if (raw === 'inactive' || raw === '0') return 'Inactive'
  return 'Active'
}

/** Normalises one raw category row into the domain shape. */
export function toCategory(raw: Raw): Category {
  return {
    id: Number(raw.id ?? 0),
    name:
      text(raw.category_name) ??
      text(raw.categories) ??
      text(raw.name) ??
      text(raw.category) ??
      '',
    slug: text(raw.category_slug) ?? text(raw.slug),
    description: text(raw.category_description) ?? text(raw.description),
    status: categoryStatus(raw.category_status ?? raw.categories_status ?? raw.status),
    created_at: text(raw.created_at) ?? text(raw.category_created_date),
    updated_at: text(raw.updated_at) ?? text(raw.category_updated_date),
  }
}

/**
 * Pulls the rows out of a CRM list envelope.
 *
 * The list endpoints answer with a bare array, `{ data: [...] }` or the
 * paginated `{ data: { data: [...], total, … } }` — all three are accepted.
 */
export function toCategoryList(payload: unknown): Category[] {
  const raw = payload as Raw | null
  const nested = raw?.data as Raw | undefined
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(raw?.data)
      ? (raw.data as Raw[])
      : Array.isArray(nested?.data)
        ? (nested.data as Raw[])
        : []

  return rows.map((row) => toCategory(row))
}

/** Reads the row count the list envelope reports, when it reports one. */
function readTotal(payload: unknown): number | null {
  const raw = payload as Raw | null
  const nested = raw?.data as Raw | undefined
  const candidates = [nested?.total, raw?.total]

  for (const candidate of candidates) {
    const total = Number(candidate)
    if (Number.isFinite(total)) return total
  }

  return null
}

/** Reads the category name out of a payload, whatever alias it uses. */
function readName(payload: CategoryPayload | FormData): string {
  if (payload instanceof FormData) {
    return String(payload.get('category_name') ?? payload.get('categories') ?? '').trim()
  }

  return String(payload?.category_name ?? payload?.categories ?? payload?.name ?? '').trim()
}

/** Reads the status out of a payload, whatever alias it uses. */
function readStatus(payload: CategoryPayload | FormData): string {
  if (payload instanceof FormData) {
    return String(
      payload.get('category_status') ?? payload.get('categories_status') ?? payload.get('status') ?? '',
    ).trim()
  }

  return String(
    payload?.category_status ?? payload?.categories_status ?? payload?.status ?? 'Active',
  ).trim()
}

/** Turns anything thrown into a message an admin can act on. */
function errorText(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

/** Picks the created/updated record out of a write envelope, if there is one. */
function toCategoryRecord(payload: unknown): Category | undefined {
  const raw = payload as Raw | null
  const candidate = raw?.data ?? raw
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return undefined
  if (Number((candidate as Raw).id ?? 0) === 0) return undefined
  return toCategory(candidate as Raw)
}

/**
 * Builds the multipart body for a category create/update.
 *
 * The name and the status are appended under every alias the CRM has
 * shipped, so one body works against all of them.
 */
export function buildCategoryFormData(
  payload: CategoryPayload | FormData | null | undefined,
  isUpdate = false,
): FormData {
  if (payload instanceof FormData) {
    if (isUpdate && !payload.has('_method')) {
      payload.append('_method', 'PUT')
    }
    return payload
  }

  const formData = new FormData()

  const name = readName(payload ?? {})
  if (name) {
    formData.append('category_name', name)
    formData.append('categories', name)
  }

  if (isUpdate) {
    const status = readStatus(payload ?? {})
    if (status) {
      formData.append('category_status', status)
      formData.append('status', status)
    }
    formData.append('_method', 'PUT')
  }

  return formData
}

/**
 * 1. GET /category — fetches the category list with pagination and search.
 */
export async function getCategories(
  params: CategoryListParams = {},
): Promise<CategoryListResult> {
  const response = await api.get<unknown>('/category', {
    params: {
      page: params.page,
      per_page: params.per_page,
      search: params.search,
      category_status: params.category_status ?? params.status,
    },
  })

  const records = toCategoryList(response.data)

  return {
    records,
    total: readTotal(response.data) ?? records.length,
    raw: response.data,
  }
}

/**
 * 2. POST /category — creates a category (Body: FormData -> category_name).
 */
export async function createCategory(
  payload: CategoryPayload | FormData,
): Promise<CategoryActionResult> {
  const name = readName(payload)
  const formData = buildCategoryFormData(payload, false)

  try {
    const response = await api.post<{ message?: string; data?: unknown }>('/category', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return {
      success: true,
      message: response.data?.message ?? 'Category created successfully.',
      data: toCategoryRecord(response.data),
    }
  } catch (multipartError) {
    // Some deployments only accept a JSON body on this route.
    try {
      const response = await api.post<{ message?: string; data?: unknown }>('/category', {
        category_name: name,
        categories: name,
      })

      return {
        success: true,
        message: response.data?.message ?? 'Category created successfully.',
        data: toCategoryRecord(response.data),
      }
    } catch {
      return {
        success: false,
        message: errorText(multipartError, 'Failed to create the category.'),
      }
    }
  }
}

/**
 * 3. GET /category/{id} — fetches a single category.
 */
export async function getCategoryById(id: number | string): Promise<Category | null> {
  const response = await api.get<unknown>(`/category/${id}`)

  const raw = response.data as Raw | null
  const candidate = raw?.data ?? raw
  if (Array.isArray(candidate)) {
    const first = candidate[0]
    return first ? toCategory(first as Raw) : null
  }
  if (!candidate || typeof candidate !== 'object') return null

  return toCategory(candidate as Raw)
}

/**
 * 4. PUT /category/{id} — updates a category.
 *
 * Laravel does not read `PUT` bodies sent as multipart, so the update is
 * posted with a `_method=PUT` override first and falls back to a real PUT.
 */
export async function updateCategory(
  id: number | string,
  payload: CategoryPayload | FormData,
): Promise<CategoryActionResult> {
  const name = readName(payload)
  const status = readStatus(payload)
  const formData = buildCategoryFormData(payload, true)

  try {
    const response = await api.post<{ message?: string; data?: unknown }>(
      `/category/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )

    return {
      success: true,
      message: response.data?.message ?? 'Category updated successfully.',
      data: toCategoryRecord(response.data),
    }
  } catch (postError) {
    try {
      const response = await api.put<{ message?: string; data?: unknown }>(`/category/${id}`, {
        category_name: name,
        categories: name,
        category_status: status,
        status,
      })

      return {
        success: true,
        message: response.data?.message ?? 'Category updated successfully.',
        data: toCategoryRecord(response.data),
      }
    } catch {
      return {
        success: false,
        message: errorText(postError, 'Failed to update the category.'),
      }
    }
  }
}

/**
 * 5. PATCH /categorys/{id}/status — updates the publication state.
 */
export async function updateCategoryStatus(
  id: number | string,
  category_status: CategoryStatus | string,
): Promise<CategoryActionResult> {
  const statusVal = String(category_status || 'Active').trim()
  const formData = new FormData()
  formData.append('category_status', statusVal)
  formData.append('status', statusVal)

  try {
    const response = await api.patch<{ message?: string }>(
      `/categorys/${id}/status`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )

    return {
      success: true,
      message: response.data?.message ?? `Category marked as ${statusVal}.`,
    }
  } catch (multipartError) {
    try {
      const response = await api.patch<{ message?: string }>(
        `/categorys/${id}/status`,
        { category_status: statusVal, status: statusVal },
      )

      return {
        success: true,
        message: response.data?.message ?? `Category marked as ${statusVal}.`,
      }
    } catch {
      return {
        success: false,
        message: errorText(multipartError, 'Failed to update the category status.'),
      }
    }
  }
}

/**
 * 6. GET /activeCategorys — fetches the active categories.
 *
 * This is the list the dropdowns read: it is not paginated, so a picker
 * always shows the whole active taxonomy.
 */
export async function getActiveCategories(): Promise<Category[]> {
  const response = await api.get<unknown>('/activeCategorys')
  return toCategoryList(response.data)
}

/**
 * 7. DELETE /category/{id} — removes a category.
 *
 * Falls back to deactivation when the deployment has no destroy route.
 */
export async function deleteCategory(
  id: number | string,
): Promise<CategoryActionResult> {
  try {
    const response = await api.delete<{ message?: string }>(`/category/${id}`)

    return {
      success: true,
      message: response.data?.message ?? 'Category deleted successfully.',
    }
  } catch (err) {
    const message = errorText(err, '')
    const status = err instanceof ApiError ? err.response?.status : undefined

    const isMissingDestroy =
      status === 500 ||
      status === 404 ||
      status === 405 ||
      message.includes('undefined method') ||
      message.includes('destroy')

    if (isMissingDestroy) {
      const fallback = await updateCategoryStatus(id, 'Inactive')
      if (fallback.success) {
        return { success: true, message: 'Category deactivated successfully.' }
      }
      return { success: false, message: fallback.message }
    }

    return {
      success: false,
      message: message || 'Failed to delete the category.',
    }
  }
}

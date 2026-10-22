/**
 * @file src/module/category/types/index.ts
 * Domain types for the category module.
 *
 * Categories are the reference table the CRM groups blog articles by. The
 * API exposes the same value under several field names (`category_name`,
 * `categories`, `name`), so the raw row is normalised once — in
 * `api/category.api.ts` — into the shapes below and the UI never has to
 * dig through raw payloads.
 */

export type CategoryStatus = 'Active' | 'Inactive'

/** A category as the application sees it. */
export interface Category {
  id: number
  name: string
  slug?: string | null
  description?: string | null
  status: CategoryStatus
  created_at?: string | null
  updated_at?: string | null
}

/**
 * Fields the API accepts when creating or updating a category.
 *
 * Declared as a type alias rather than an interface so the object stays
 * assignable to the `Record<string, unknown>` the shared HTTP client takes.
 */
export type CategoryPayload = {
  category_name?: string
  categories?: string
  name?: string
  category_description?: string
  description?: string
  category_status?: CategoryStatus | string
  categories_status?: CategoryStatus | string
  status?: CategoryStatus | string
  [key: string]: unknown
}

/** Query parameters accepted by the category list endpoint. */
export type CategoryListParams = {
  page?: number
  per_page?: number
  search?: string
  category_status?: string
  status?: string
}

/** The list endpoint's answer — the rows plus the total the API reports. */
export interface CategoryListResult {
  records: Category[]
  total: number
  raw?: unknown
}

/**
 * The result of a category write.
 *
 * The service layer never throws — a failed write comes back as
 * `{ success: false, message }` so the caller can surface it.
 */
export interface CategoryActionResult {
  success: boolean
  message: string
  data?: Category
}

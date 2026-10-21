/**
 * @file src/module/super-admin/services/blogApi.ts
 * Blog management API for the Super Admin Panel.
 *
 * Endpoints:
 *   GET    /blog              → list (pagination, search, status filters)
 *   POST   /blog              → create
 *   GET    /blog/{id}         → single article
 *   POST   /blog/{id}         → update (Laravel `_method=PUT` spoofing)
 *   PATCH  /blogs/{id}/status → publication state
 *   DELETE /blog/{id}         → delete
 *
 * The CRM exposes the same value under several field names, so every
 * payload is written with its aliases — the backend picks whichever key it
 * reads, and the panel never has to guess which naming a given deployment
 * uses.
 */

import type {
  BlogListParams,
  ListMeta,
  BlogPayload,
  BlogRecord,
  BlogStatus,
} from '../types'
import { extractImageEntries, toBlog, toList, toListMeta } from './mappers'
import { buildQueryString, request } from './http'
import { isWebpFile } from '@/lib/image'

/** Reads a value that may be a `File`, a `Blob` or absent. */
function asFile(value: unknown): Blob | null {
  if (value instanceof File) return value
  if (value instanceof Blob) return value
  return null
}

/** Normalises a boolean-ish value to the `1` / `0` the CRM expects. */
function toFlag(value: unknown): string {
  const isTrue =
    value === true ||
    String(value) === '1' ||
    String(value).toLowerCase() === 'yes' ||
    value === 'Active'
  return isTrue ? '1' : '0'
}

/**
 * Builds the multipart body for a blog create/update.
 *
 * Field aliases are appended together (for example `blog_title`, `title`
 * and `blog_meta_title`) so the same body works against every naming the
 * CRM has shipped.
 */
export function buildBlogFormData(data: BlogPayload | FormData): FormData {
  if (data instanceof FormData) return data

  const formData = new FormData()

  // Core fields
  if (data.blog_title !== undefined && data.blog_title !== null) {
    const title = String(data.blog_title).trim()
    formData.append('blog_title', title)
    formData.append('title', title)
    formData.append('blog_meta_title', title)
  }

  if (data.blog_slug !== undefined && data.blog_slug !== null) {
    const slug = String(data.blog_slug).trim()
    formData.append('blog_slug', slug)
    formData.append('slug', slug)
    formData.append('url_slug', slug)
  }

  if (data.blog_short_description !== undefined && data.blog_short_description !== null) {
    const shortDesc = String(data.blog_short_description).trim()
    formData.append('blog_short_description', shortDesc)
    formData.append('short_description', shortDesc)
    formData.append('blog_meta_description', shortDesc)
  }

  if (data.blog_description !== undefined && data.blog_description !== null) {
    const desc = String(data.blog_description)
    formData.append('blog_description', desc)
    formData.append('description', desc)
    formData.append('content', desc)
  }

  if (data.blog_categories_ids !== undefined && data.blog_categories_ids !== null && data.blog_categories_ids !== '') {
    const catId = String(data.blog_categories_ids).trim()
    formData.append('blog_categories_ids', catId)
    formData.append('category_id', catId)
    formData.append('categories_id', catId)
  }

  if (data.blog_banner_image_alt !== undefined && data.blog_banner_image_alt !== null) {
    const alt = String(data.blog_banner_image_alt).trim()
    formData.append('blog_banner_image_alt', alt)
    formData.append('banner_image_alt', alt)
    formData.append('alt_text', alt)
  }

  if (data.blog_meta_keywords !== undefined && data.blog_meta_keywords !== null) {
    const keywords = String(data.blog_meta_keywords).trim()
    formData.append('blog_meta_keywords', keywords)
    formData.append('meta_keywords', keywords)
  }

  if (data.blog_status !== undefined && data.blog_status !== null) {
    const status = String(data.blog_status).trim()
    formData.append('blog_status', status)
    formData.append('status', status)
  }

  if (data.blog_index !== undefined && data.blog_index !== null) {
    formData.append('blog_index', String(data.blog_index))
    formData.append('index', String(data.blog_index))
  }

  if (data.blog_front !== undefined && data.blog_front !== null) {
    const frontVal = toFlag(data.blog_front)
    formData.append('blog_front', frontVal)
    formData.append('front', frontVal)
    formData.append('is_home', frontVal)
  }

  if (data.blog_featured !== undefined && data.blog_featured !== null) {
    const featuredVal = toFlag(data.blog_featured)
    formData.append('blog_featured', featuredVal)
    formData.append('featured', featuredVal)
    formData.append('is_featured', featuredVal)
  }

  // Handle image file upload (check all possible file keys)
  const loose = data as unknown as Record<string, unknown>
  const imageFile =
    asFile(data.blog_banner_image) ??
    asFile(loose.banner_image) ??
    asFile(loose.image) ??
    asFile(loose.blog_image)

  if (imageFile) {
    formData.append('blog_banner_image', imageFile)
    formData.append('banner_image', imageFile)
    formData.append('image', imageFile)
    formData.append('blog_image', imageFile)
    formData.append('blogs_image', imageFile)
    formData.append('blogs_banner_image', imageFile)
    formData.append('banner', imageFile)
    formData.append('file', imageFile)
  }

  return formData
}

/**
 * GET /blog — fetches the blog list with pagination, search and status
 * filters.
 *
 * The endpoint answers with a paginated envelope
 * (`{ data: { current_page, data: [...], total, … }, image_url: [...] }`).
 * It honours `search`, `page` and `per_page`; the status filter is applied
 * by the panel instead, because the API ignores it.
 */
export async function fetchBlogs(
  params: BlogListParams = {},
): Promise<{ data: BlogRecord[]; meta: ListMeta; error?: string }> {
  const query = buildQueryString({
    page: params.page,
    per_page: params.per_page,
    search: params.search,
    category_id: params.category_id,
  })

  const res = await request<unknown>(`/blog${query}`)
  if (res.ok && res.data) {
    return {
      data: toList(res.data, toBlog),
      meta: toListMeta(res.data, params),
    }
  }
  return {
    data: [],
    meta: { current_page: 1, last_page: 1, per_page: params.per_page ?? 10, total: 0 },
    error: res.message,
  }
}

/**
 * POST /blog — creates a new article.
 */
export async function createBlog(
  payload: BlogPayload,
): Promise<{ success: boolean; message: string; data?: BlogRecord }> {
  // Strictly enforce WebP banner images without client-side conversion
  const loose = payload as unknown as Record<string, unknown>
  const rawFile = loose.blog_banner_image || loose.banner_image || loose.image
  if (rawFile instanceof File && !isWebpFile(rawFile)) {
    return {
      success: false,
      message: 'The blog banner image must be a file of type: webp.',
    }
  }

  const formData = buildBlogFormData(payload)

  const res = await request<{ message?: string; data?: unknown }>('/blog', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    return { success: false, message: res.message || 'Failed to create the article.' }
  }

  const created = (res.data?.data ?? res.data) as Record<string, unknown> | null

  return {
    success: true,
    message: res.data?.message || 'Article created successfully.',
    data:
      created && typeof created === 'object'
        ? toBlog(created, extractImageEntries(res.data))
        : undefined,
  }
}

/**
 * GET /blog/{id} — fetches a single article.
 *
 * Falls back to the list endpoint when the detail route is unavailable on
 * the deployment, so the editor can still open an existing article.
 */
export async function fetchBlogById(
  id: number | string,
): Promise<{ data: BlogRecord | null; error?: string }> {
  const res = await request<unknown>(`/blog/${id}`)

  if (res.ok && res.data) {
    const payload = res.data as Record<string, unknown>
    const raw = (Array.isArray(payload.data) ? payload.data[0] : payload.data) ?? payload
    return { data: toBlog(raw as Record<string, unknown>, extractImageEntries(res.data)) }
  }

  try {
    const fallback = await fetchBlogs()
    const found = fallback.data.find((blog) => String(blog.id) === String(id))
    if (found) return { data: found }
  } catch {
    // Fall through to the original error below.
  }

  return { data: null, error: res.message }
}

/**
 * POST /blog/{id} — updates an article.
 *
 * Laravel does not read `PUT` bodies sent as multipart, so the panel sends
 * a `POST` with the `_method=PUT` override, and falls back to the plural
 * route and to a real `PUT` if the deployment expects one of those.
 */
export async function updateBlog(
  id: number | string,
  payload: BlogPayload,
): Promise<{ success: boolean; message: string; data?: BlogRecord }> {
  // Strictly enforce WebP banner images without client-side conversion
  const loose = payload as unknown as Record<string, unknown>
  const rawFile = loose.blog_banner_image || loose.banner_image || loose.image
  if (rawFile instanceof File && !isWebpFile(rawFile)) {
    return {
      success: false,
      message: 'The blog banner image must be a file of type: webp.',
    }
  }

  const attempts: Array<{ endpoint: string; method: string; spoof: boolean }> = [
    { endpoint: `/blog/${id}`, method: 'POST', spoof: true },
    { endpoint: `/blogs/${id}`, method: 'POST', spoof: true },
    { endpoint: `/blog/${id}`, method: 'PUT', spoof: false },
  ]

  let lastMessage = 'Failed to update the article.'

  for (const attempt of attempts) {
    const formData = buildBlogFormData(payload)
    if (attempt.spoof && !formData.has('_method')) {
      formData.append('_method', 'PUT')
    }

    const res = await request<{ message?: string; data?: unknown }>(attempt.endpoint, {
      method: attempt.method,
      body: formData,
    })

    if (res.ok) {
      const updated = (res.data?.data ?? res.data) as Record<string, unknown> | null
      return {
        success: true,
        message: res.data?.message || 'Article updated successfully.',
        data:
          updated && typeof updated === 'object'
            ? toBlog(updated, extractImageEntries(res.data))
            : undefined,
      }
    }

    lastMessage = res.message || lastMessage

    // A 404 or 405 means this deployment uses a different route — keep
    // trying. Anything else (validation, auth) will fail the same way
    // everywhere.
    if (res.status !== 404 && res.status !== 405) break
  }

  return { success: false, message: lastMessage }
}

/**
 * PATCH /blogs/{id}/status — toggles the publication state of an article.
 *
 * The route expects a JSON body; a multipart body reaches the controller
 * unparsed and the server answers with a 500, so JSON is tried first and
 * multipart is only the fallback.
 */
export async function updateBlogStatus(
  id: number | string,
  blog_status: BlogStatus,
): Promise<{ success: boolean; message: string }> {
  const statusVal = String(blog_status || 'Active').trim()

  const jsonRes = await request<{ message?: string }>(`/blogs/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blog_status: statusVal, status: statusVal }),
  })

  if (jsonRes.ok) {
    return {
      success: true,
      message: jsonRes.data?.message || `Article marked as ${statusVal}.`,
    }
  }

  const formData = new FormData()
  formData.append('blog_status', statusVal)
  formData.append('status', statusVal)

  const formRes = await request<{ message?: string }>(`/blogs/${id}/status`, {
    method: 'PATCH',
    body: formData,
  })

  if (formRes.ok) {
    return {
      success: true,
      message: formRes.data?.message || `Article marked as ${statusVal}.`,
    }
  }

  return {
    success: false,
    message: formRes.message || jsonRes.message || 'Failed to update the status.',
  }
}

/**
 * DELETE /blog/{id} — removes an article.
 * Falls back to status deactivation if controller lacks destroy().
 */
export async function deleteBlog(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/blog/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'Article deleted successfully.' }
  }

  // Fallback: If backend does not implement destroy(), deactivate it via status toggle
  if (res.status === 500 || res.status === 404 || res.status === 405) {
    const statusRes = await updateBlogStatus(id, 'Inactive')
    if (statusRes.success) {
      return { success: true, message: 'Article deactivated successfully.' }
    }
  }

  return { success: false, message: res.message || 'Failed to delete the article.' }
}

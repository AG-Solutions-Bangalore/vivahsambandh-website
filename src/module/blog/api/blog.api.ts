import { apiFetch } from '@/lib/api/apiClient'
import type { BlogListResponse, SingleBlogResponse } from '../types'

/**
 * Fetches curated blog articles configured to display on the front page.
 */
export async function getFrontBlogs(): Promise<BlogListResponse> {
  return apiFetch<BlogListResponse>('/getFrontBlogs')
}

/**
 * Fetches highlighted featured blog posts.
 */
export async function getFeaturedBlogs(): Promise<BlogListResponse> {
  return apiFetch<BlogListResponse>('/getFeaturedBlogs')
}

/**
 * Fetches complete published blog directory.
 */
export async function getBlogs(): Promise<BlogListResponse> {
  return apiFetch<BlogListResponse>('/getBlogs')
}

/**
 * Fetches full content and metadata for an individual blog article by slug.
 */
export async function getBlogBySlug(slug: string): Promise<SingleBlogResponse> {
  const safeSlug = encodeURIComponent(slug.trim())
  try {
    return await apiFetch<SingleBlogResponse>(`/getBlogBySlug/${safeSlug}`)
  } catch {
    // If dedicated slug endpoint is unavailable, fall back to matching from getBlogs
    const all = await getBlogs()
    const found = all.data.find(
      (b) => b.blog_slug === slug || String(b.id) === slug,
    )
    if (!found) {
      throw new Error(`Blog not found for slug: ${slug}`)
    }
    return {
      data: found,
      image_url: all.image_url,
    }
  }
}

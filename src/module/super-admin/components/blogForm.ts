/**
 * @file src/module/super-admin/components/blogForm.ts
 * Form shape and pure helpers for the blog editor.
 *
 * Kept apart from the component file so the editor module only exports
 * components, and so the conversion rules live in one testable place.
 */

import type { BlogRecord, BlogStatus } from '../types'

export interface BlogFormValues {
  blog_title: string
  blog_slug: string
  blog_short_description: string
  blog_description: string
  blog_categories_ids: string
  blog_banner_image_alt: string
  blog_meta_keywords: string
  blog_status: BlogStatus
  blog_index: string
  blog_front: boolean
  blog_featured: boolean
  blog_banner_image: File | null
}

/** A fresh, empty editor state. */
export function emptyBlogForm(): BlogFormValues {
  return {
    blog_title: '',
    blog_slug: '',
    blog_short_description: '',
    blog_description: '',
    blog_categories_ids: '',
    blog_banner_image_alt: '',
    blog_meta_keywords: '',
    blog_status: 'Active',
    blog_index: '',
    blog_front: false,
    blog_featured: false,
    blog_banner_image: null,
  }
}

/** Turns an existing article into the editable form shape. */
export function blogToFormValues(record: BlogRecord): BlogFormValues {
  return {
    blog_title: record.title,
    blog_slug: record.slug,
    blog_short_description: record.short_description ?? '',
    blog_description: record.description ?? '',
    blog_categories_ids: record.categories_id ?? '',
    blog_banner_image_alt: record.banner_image_alt ?? '',
    blog_meta_keywords: record.meta_keywords ?? '',
    blog_status: record.status,
    blog_index: record.index == null ? '' : String(record.index),
    blog_front: record.is_front,
    blog_featured: record.is_featured,
    blog_banner_image: null,
  }
}

/** Builds a URL-safe slug from a title. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

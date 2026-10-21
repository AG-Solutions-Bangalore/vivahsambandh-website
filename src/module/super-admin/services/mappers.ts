/**
 * @file src/module/super-admin/services/mappers.ts
 * Translates raw CRM API payloads into the panel's domain types.
 *
 * The API returns reference tables as nested objects (`community.community_name`)
 * and moderation records as `from_user` / `to_user` pairs. The UI should not
 * know that, so every payload is flattened once, here.
 *
 * Image columns arrive as bare filenames (`1_20261021_141116.jpeg`). The real
 * URL is only knowable from the `image_url` metadata block that every endpoint
 * returns next to `data`, so the mappers resolve filenames to absolute URLs
 * here instead of leaving broken `src` values in the DOM.
 */

import { resolveImageUrl } from '@/lib/api/apiClient'
import type { ImageUrlEntry } from '@/lib/api/types'
import type {
  AdminMember,
  AdminMemberStatus,
  BlockProfileRecord,
  BlogRecord,
  BlogStatus,
  FeedbackRecord,
  Member,
  MemberStatus,
  NotificationRecord,
  FaqRecord,
  TestimonialRecord,
} from '../types'

/* eslint-disable @typescript-eslint/no-explicit-any */

type Raw = Record<string, any>

/** Pulls the `image_url` metadata block out of an API envelope. */
export function extractImageEntries(payload: unknown): ImageUrlEntry[] {
  if (!payload || typeof payload !== 'object') return []
  const entries = (payload as Raw).image_url
  return Array.isArray(entries) ? (entries as ImageUrlEntry[]) : []
}

/**
 * Resolves a stored image filename against the endpoint's `image_url` metadata.
 *
 * Returns `null` when there is no attachment, or when the endpoint did not
 * supply the metadata needed to build a URL — the UI then renders a
 * placeholder instead of a broken image.
 */
function resolveImage(
  filename: string | null | undefined,
  entries: ImageUrlEntry[],
  imageFor: string,
): string | null {
  if (!filename || !filename.trim()) return null
  if (entries.length === 0) return null

  const resolved = resolveImageUrl(filename.trim(), entries, imageFor)
  return resolved && resolved.trim() ? resolved.trim() : null
}

/** Reads a display name from a nested reference object. */
function referenceName(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Raw
  const name =
    record.community_name ?? record.gotra_name ?? record.education_name ?? record.profession_name
  return typeof name === 'string' && name.trim() ? name.trim() : null
}

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const str = String(value).trim()
  return str.length ? str : null
}

function memberStatus(value: unknown): MemberStatus {
  const raw = text(value)?.toLowerCase()
  switch (raw) {
    case 'approved':
      return 'Approved'
    case 'hold':
      return 'Hold'
    case 'married':
      return 'Married'
    case 'cancel':
    case 'cancelled':
      return 'Cancel'
    default:
      return 'Pending'
  }
}

function adminStatus(value: unknown): AdminMemberStatus {
  const raw = text(value)?.toLowerCase()
  if (raw === 'approved') return 'Approved'
  if (raw === 'cancel' || raw === 'cancelled') return 'Cancel'
  return 'Pending'
}

/** Normalises the blog publication state. */
function blogStatus(value: unknown): BlogStatus {
  const raw = text(value)?.toLowerCase()
  if (raw === 'active' || raw === '1' || raw === 'published') return 'Active'
  return 'Inactive'
}

/** Reads a boolean flag the API may send as `1`, `0`, `'yes'` or a boolean. */
function flag(value: unknown): boolean {
  if (value === true) return true
  const raw = text(value)?.toLowerCase()
  return raw === '1' || raw === 'yes' || raw === 'true' || raw === 'active'
}

/** Normalises a `/member` or `/getPendingMember` row. */
export function toMember(raw: Raw, entries: ImageUrlEntry[] = []): Member {
  const faceImageName = text(raw.face_image)

  return {
    id: Number(raw.id ?? 0),
    name: text(raw.name) ?? 'Unknown',
    gender: text(raw.gender) ?? '—',
    status: memberStatus(raw.status),
    mobile: text(raw.mobile) ?? '—',
    date_of_birth: text(raw.date_of_birth),
    height_feet: raw.height_feet ?? null,
    height_inch: raw.height_inch ?? null,
    user_current_city: text(raw.user_current_city),
    married_before: text(raw.married_before),
    contact_name: text(raw.contact_name),
    physical_disablity: text(raw.physical_disablity),
    marry_in_community: text(raw.marry_in_community),
    marry_multi_community: text(raw.marry_multi_community),
    register_date: text(raw.register_date),
    face_image: resolveImage(faceImageName, entries, 'Member'),
    face_image_name: faceImageName,
    user_type: raw.user_type ?? null,
    community_name: referenceName(raw.community),
    gotra_name: referenceName(raw.gotra),
    education_name: referenceName(raw.education),
    profession_name: referenceName(raw.profession),
  }
}

/** Normalises a `/getAdminMember` or `/getPendingAdminMember` row. */
export function toAdminMember(raw: Raw, entries: ImageUrlEntry[] = []): AdminMember {
  const faceImageName = text(raw.face_image)

  return {
    id: Number(raw.id ?? 0),
    name: text(raw.name) ?? 'Unknown',
    status: adminStatus(raw.status),
    mobile: text(raw.mobile),
    email: text(raw.email),
    gender: text(raw.gender),
    user_address: text(raw.user_address),
    user_current_city: text(raw.user_current_city),
    multiple_city: raw.multiple_city ?? null,
    register_date: text(raw.register_date),
    face_image: resolveImage(faceImageName, entries, 'Admin'),
    face_image_name: faceImageName,
    user_type: raw.user_type ?? null,
  }
}

/** Normalises a `/feedback` row. */
export function toFeedback(raw: Raw): FeedbackRecord {
  return {
    id: Number(raw.id ?? 0),
    name: text(raw.from_user?.name) ?? 'Anonymous User',
    message: text(raw.feedback_description) ?? text(raw.message) ?? '',
    created_at: text(raw.feedback_date) ?? text(raw.created_at),
    from_id: raw.from_id ?? null,
  }
}

/** Normalises a `/blockProfile` row. */
export function toBlockProfile(raw: Raw): BlockProfileRecord {
  return {
    id: Number(raw.id ?? 0),
    member_name: text(raw.to_user?.name) ?? text(raw.member_name),
    blocked_by_name: text(raw.from_user?.name) ?? text(raw.blocked_by_name),
    reason:
      text(raw.blockprofile_description) ?? text(raw.reason) ?? 'No reason reported.',
    created_at: text(raw.blockprofile_date) ?? text(raw.created_at),
    member_id: raw.to_id ?? raw.member_id ?? null,
    blocked_user_id: raw.to_id ?? null,
  }
}

/** Normalises a `/notification` row. */
export function toNotification(raw: Raw, entries: ImageUrlEntry[] = []): NotificationRecord {
  const imageName = text(raw.notification_image)

  return {
    id: Number(raw.id ?? 0),
    notification_date: text(raw.notification_date) ?? '',
    notification_for: (text(raw.notification_for) === 'Admin' ? 'Admin' : 'User') as
      | 'User'
      | 'Admin',
    notification_heading: text(raw.notification_heading) ?? '',
    notification_message: text(raw.notification_message) ?? '',
    notification_image: resolveImage(imageName, entries, 'Notification'),
    notification_image_name: imageName,
    created_at: text(raw.created_at),
  }
}

/**
 * Normalises a `/blog` row.
 *
 * The blog endpoints expose the same field under several names (`blog_title`
 * and `title`, `blog_slug` and `slug`, …), so each value is read from the
 * full alias list before it is flattened.
 */
export function toBlog(raw: Raw, entries: ImageUrlEntry[] = []): BlogRecord {
  const bannerName = text(raw.blog_banner_image) ?? text(raw.banner_image)

  return {
    id: Number(raw.id ?? 0),
    title: text(raw.blog_title) ?? text(raw.title) ?? '',
    slug: text(raw.blog_slug) ?? text(raw.slug) ?? '',
    short_description:
      text(raw.blog_short_description) ?? text(raw.short_description),
    description: text(raw.blog_description) ?? text(raw.description),
    banner_image: resolveImage(bannerName, entries, 'Blog'),
    banner_image_name: bannerName,
    banner_image_alt:
      text(raw.blog_banner_image_alt) ?? text(raw.banner_image_alt) ?? text(raw.alt_text),
    categories_id:
      text(raw.blog_categories_ids) ?? text(raw.category_id) ?? text(raw.categories_id),
    categories: text(raw.categories),
    meta_keywords: text(raw.blog_meta_keywords) ?? text(raw.meta_keywords),
    status: blogStatus(raw.blog_status ?? raw.status),
    index: raw.blog_index ?? raw.index ?? null,
    is_front: flag(raw.blog_front ?? raw.front ?? raw.is_home),
    is_featured: flag(raw.blog_featured ?? raw.featured ?? raw.is_featured),
    created_date: text(raw.blog_created_date) ?? text(raw.created_at),
    updated_date: text(raw.blog_updated_date) ?? text(raw.updated_at),
    created_by: text(raw.created_by),
  }
}

/**
 * Normalises an FAQ record.
 */
export function toFaq(raw: Raw): FaqRecord {
  const subs = Array.isArray(raw.subs)
    ? raw.subs.map((s: Raw) => ({
        id: s.id ? Number(s.id) : undefined,
        faq_top_id: s.faq_top_id ? Number(s.faq_top_id) : undefined,
        faq_sort: s.faq_sort ?? '1',
        faq_for: text(s.faq_for) ?? text(raw.faq_for) ?? '',
        faq_heading: text(s.faq_heading) ?? '',
        faq_que: text(s.faq_que) ?? '',
        faq_ans: text(s.faq_ans) ?? '',
        faq_status:
          String(s.faq_status).toLowerCase() === 'inactive' ||
          s.faq_status === 0 ||
          s.faq_status === '0'
            ? 'Inactive'
            : 'Active',
      }))
    : []

  return {
    id: Number(raw.id ?? 0),
    faq_for: text(raw.faq_for) ?? '',
    faq_status:
      String(raw.faq_status).toLowerCase() === 'inactive' ||
      raw.faq_status === 0 ||
      raw.faq_status === '0'
        ? 'Inactive'
        : 'Active',
    subs,
    created_at: text(raw.created_at),
    updated_at: text(raw.updated_at),
    created_by: text(raw.created_by),
    updated_by: text(raw.updated_by),
  }
}

/**
 * Normalises a Testimonial record.
 */
export function toTestimonial(raw: Raw): TestimonialRecord {
  return {
    id: Number(raw.id ?? 0),
    testimonial_for: text(raw.testimonial_for) ?? '',
    testimonial_client_name: text(raw.testimonial_client_name) ?? '',
    testimonial_description: text(raw.testimonial_description) ?? '',
    testimonial_rating: raw.testimonial_rating ?? '5',
    testimonial_status:
      String(raw.testimonial_status).toLowerCase() === 'inactive' ||
      raw.testimonial_status === 0 ||
      raw.testimonial_status === '0'
        ? 'Inactive'
        : 'Active',
    testimonial_created_date: text(raw.testimonial_created_date) ?? text(raw.created_at),
    testimonial_updated_date: text(raw.testimonial_updated_date) ?? text(raw.updated_at),
    created_at: text(raw.created_at),
    updated_at: text(raw.updated_at),
    created_by: text(raw.created_by),
    updated_by: text(raw.updated_by),
  }
}

/**
 * Unwraps the API envelope. Handles bare arrays, `{ data: [...] }`, and
 * paginated envelopes like `{ data: { data: [...] } }`.
 */
export function toList<T>(
  payload: unknown,
  mapper: (row: Raw, entries: ImageUrlEntry[]) => T,
): T[] {
  const rawData = (payload as Raw)?.data
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
        ? rawData.data
        : []
  const entries = extractImageEntries(payload)
  return rows.map((row: Raw) => mapper(row, entries))
}


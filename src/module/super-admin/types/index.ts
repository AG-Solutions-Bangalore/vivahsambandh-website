/**
 * @file src/module/super-admin/types/index.ts
 * Type definitions for Super Admin Panel modules, authentication, and API payloads.
 *
 * The shapes below mirror what the CRM API actually returns — nested
 * reference objects are flattened to their display names by the mappers in
 * `services/mappers.ts`, so the UI never has to dig through raw payloads.
 */

export type AdminMemberStatus = 'Pending' | 'Approved' | 'Cancel'

export type MemberStatus = 'Pending' | 'Approved' | 'Hold' | 'Married' | 'Cancel'

export type NotificationTarget = 'User' | 'Admin'

export interface SuperAdminUser {
  id: number | string
  name: string
  username?: string
  mobile?: string
  email?: string
  user_type?: string
}

export interface SuperAdminSession {
  token: string
  user: SuperAdminUser
  expiresAt?: string
}

/** Matrimonial member profile. */
export interface Member {
  id: number
  name: string
  gender: string
  status: MemberStatus
  mobile: string
  date_of_birth?: string | null
  height_feet?: string | number | null
  height_inch?: string | number | null
  user_current_city?: string | null
  married_before?: string | null
  contact_name?: string | null
  physical_disablity?: string | null
  marry_in_community?: string | null
  marry_multi_community?: string | null
  register_date?: string | null
  /** Absolute URL of the member photograph, resolved from the API metadata. */
  face_image?: string | null
  /** Stored file name of the member photograph, as returned by the API. */
  face_image_name?: string | null
  user_type?: number | null
  community_name?: string | null
  gotra_name?: string | null
  education_name?: string | null
  profession_name?: string | null
}

/** Regional administrator profile. */
export interface AdminMember {
  id: number
  name: string
  status: AdminMemberStatus
  mobile?: string | null
  email?: string | null
  gender?: string | null
  user_address?: string | null
  user_current_city?: string | null
  multiple_city?: string | string[] | null
  register_date?: string | null
  /** Absolute URL of the administrator photograph, resolved from the API metadata. */
  face_image?: string | null
  /** Stored file name of the administrator photograph, as returned by the API. */
  face_image_name?: string | null
  user_type?: number | null
}

/** A member feedback entry. */
export interface FeedbackRecord {
  id: number
  name?: string | null
  message: string
  created_at?: string | null
  from_id?: number | null
}

/** A moderation block record. */
export interface BlockProfileRecord {
  id: number
  member_name?: string | null
  blocked_by_name?: string | null
  reason?: string | null
  created_at?: string | null
  member_id?: number | null
  blocked_user_id?: number | null
}

export interface NotificationRecord {
  id: number
  notification_date: string
  notification_for: NotificationTarget
  notification_heading: string
  notification_message: string
  /** Absolute URL of the banner image, resolved from the API metadata. */
  notification_image?: string | null
  /** Stored file name of the banner image, as returned by the API. */
  notification_image_name?: string | null
  created_at?: string | null
}

export interface CreateNotificationPayload {
  notification_date: string
  notification_for: NotificationTarget
  notification_heading: string
  notification_message: string
  notification_image?: File | null
}

/** Publication state of a blog article. */
export type BlogStatus = 'Active' | 'Inactive'

/** A blog article as the panel sees it — flattened by the blog mapper. */
export interface BlogRecord {
  id: number
  title: string
  slug: string
  short_description?: string | null
  description?: string | null
  /** Absolute URL of the banner image, resolved from the API metadata. */
  banner_image?: string | null
  /** Stored file name of the banner image, as returned by the API. */
  banner_image_name?: string | null
  banner_image_alt?: string | null
  categories_id?: string | null
  /** Display name of the linked category, when the API resolves it. */
  categories?: string | null
  meta_keywords?: string | null
  status: BlogStatus
  index?: string | number | null
  /** Shown on the home page blog rail. */
  is_front: boolean
  /** Highlighted in the featured articles rail. */
  is_featured: boolean
  created_date?: string | null
  updated_date?: string | null
  created_by?: string | null
}

/** Fields the panel can create or update on a blog article. */
export interface BlogPayload {
  blog_title: string
  blog_slug: string
  blog_short_description?: string
  blog_description?: string
  blog_categories_ids?: string
  blog_banner_image_alt?: string
  blog_meta_keywords?: string
  blog_status: BlogStatus
  blog_index?: string | number
  blog_front?: boolean
  blog_featured?: boolean
  blog_banner_image?: File | null
}

/** Query parameters accepted by the blog list endpoint. */
export interface BlogListParams {
  page?: number
  per_page?: number
  search?: string
  blog_status?: string
  category_id?: string
}

/** Pagination block the blog list endpoint wraps its rows in. */
export interface BlogListMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

/** Publication state of an FAQ group or sub-item. */
export type FaqStatus = 'Active' | 'Inactive'

export interface FaqSubItem {
  id?: number
  faq_top_id?: number
  faq_sort: number | string
  faq_for: string
  faq_heading: string
  faq_que: string
  faq_ans: string
  faq_status: FaqStatus | number | string
}

export interface FaqRecord {
  id: number
  faq_for: string
  faq_status: FaqStatus
  subs: FaqSubItem[]
  created_at?: string | null
  updated_at?: string | null
  created_by?: string | null
  updated_by?: string | null
}

export interface FaqPayload {
  faq_for: string
  faq_status?: string
  subs: Array<{
    id?: number
    faq_sort?: number | string
    faq_for?: string
    faq_heading?: string
    faq_que?: string
    faq_ans?: string
    faq_status?: number | string
  }>
}

export interface FaqListParams {
  page?: number
  search?: string
  faq_for?: string
  faq_status?: string
}

/** Publication state of a Testimonial. */
export type TestimonialStatus = 'Active' | 'Inactive'

export interface TestimonialRecord {
  id: number
  testimonial_for: string
  testimonial_client_name: string
  testimonial_description: string
  testimonial_rating: string | number
  testimonial_status: TestimonialStatus
  testimonial_created_date?: string | null
  testimonial_updated_date?: string | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: string | null
  updated_by?: string | null
}

export interface TestimonialPayload {
  testimonial_for: string
  testimonial_client_name: string
  testimonial_description: string
  testimonial_rating: string | number
  testimonial_status?: TestimonialStatus
}

export interface TestimonialListParams {
  page?: number
  search?: string
  testimonial_for?: string
  testimonial_status?: string
}

export interface UpdateCityPayload {
  multiple_city: string[] | string
}

export interface UpdateStatusPayload<T extends string = string> {
  status: T
}

export interface PanelLoginResponse {
  code?: number
  message?: string
  token?: string
  UserInfo?: {
    token: string
    user: SuperAdminUser
    token_expires_at?: string
  }
}

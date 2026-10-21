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

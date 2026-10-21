/**
 * @file src/module/super-admin/types/index.ts
 * Type definitions for Super Admin Panel modules, authentication, and API payloads.
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
  isDevSession?: boolean
}

export interface AdminMember {
  id: number
  name: string
  mobile: string
  email?: string | null
  gender?: string | null
  user_address?: string | null
  user_current_city?: string | null
  multiple_city?: string | string[] | null
  status: AdminMemberStatus
  face_image?: string | null
  created_at?: string
  updated_at?: string
}

export interface Member {
  id: number
  name: string
  gender: string
  date_of_birth?: string
  time_of_birth?: string
  place_of_birth?: string
  email?: string | null
  mobile: string
  alternate_mobile_no?: string | null
  user_current_city?: string | null
  user_address?: string | null
  annual_income?: string | null
  height_feet?: string | number | null
  height_inch?: string | number | null
  father_name?: string | null
  mother_name?: string | null
  community_id?: number | string | null
  community_name?: string | null
  gotra_id?: number | string | null
  gotra_name?: string | null
  education_id?: number | string | null
  education_name?: string | null
  profession_id?: number | string | null
  profession_name?: string | null
  company_name?: string | null
  company_type?: string | null
  house_type?: string | null
  contact_name?: string | null
  alternate_contact_name?: string | null
  is_manglik?: string | null
  will_marry_manglik?: string | null
  married_before?: string | null
  physical_disablity?: string | null
  user_summary?: string | null
  face_image?: string | null
  full_image?: string | null
  status: MemberStatus
  created_at?: string
  updated_at?: string
}

export interface FeedbackRecord {
  id: number
  name?: string | null
  email?: string | null
  mobile?: string | null
  member_id?: number | null
  heading?: string | null
  subject?: string | null
  message: string
  created_at?: string
  updated_at?: string
}

export interface BlockProfileRecord {
  id: number
  member_id?: number | null
  member_name?: string | null
  blocked_user_id?: number | null
  blocked_user_name?: string | null
  blocked_by_name?: string | null
  reason?: string | null
  mobile?: string | null
  created_at?: string
  updated_at?: string
}

export interface NotificationRecord {
  id: number
  notification_date: string
  notification_for: NotificationTarget
  notification_heading: string
  notification_message: string
  notification_image?: string | null
  created_at?: string
  updated_at?: string
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

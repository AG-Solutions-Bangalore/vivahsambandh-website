/**
 * @file src/module/super-admin/services/mappers.ts
 * Translates raw CRM API payloads into the panel's domain types.
 *
 * The API returns reference tables as nested objects (`community.community_name`)
 * and moderation records as `from_user` / `to_user` pairs. The UI should not
 * know that, so every payload is flattened once, here.
 */

import type {
  AdminMember,
  AdminMemberStatus,
  BlockProfileRecord,
  FeedbackRecord,
  Member,
  MemberStatus,
  NotificationRecord,
} from '../types'

/* eslint-disable @typescript-eslint/no-explicit-any */

type Raw = Record<string, any>

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

/** Normalises a `/member` or `/getPendingMember` row. */
export function toMember(raw: Raw): Member {
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
    face_image: text(raw.face_image),
    user_type: raw.user_type ?? null,
    community_name: referenceName(raw.community),
    gotra_name: referenceName(raw.gotra),
    education_name: referenceName(raw.education),
    profession_name: referenceName(raw.profession),
  }
}

/** Normalises a `/getAdminMember` or `/getPendingAdminMember` row. */
export function toAdminMember(raw: Raw): AdminMember {
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
    face_image: text(raw.face_image),
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
export function toNotification(raw: Raw): NotificationRecord {
  return {
    id: Number(raw.id ?? 0),
    notification_date: text(raw.notification_date) ?? '',
    notification_for: (text(raw.notification_for) === 'Admin' ? 'Admin' : 'User') as
      | 'User'
      | 'Admin',
    notification_heading: text(raw.notification_heading) ?? '',
    notification_message: text(raw.notification_message) ?? '',
    notification_image: text(raw.notification_image),
    created_at: text(raw.created_at),
  }
}

/**
 * Unwraps the API envelope. Every list endpoint answers with `{ data: [...] }`,
 * but a few older ones answer with a bare array.
 */
export function toList<T>(payload: unknown, mapper: (row: Raw) => T): T[] {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as Raw)?.data)
      ? (payload as Raw).data
      : []
  return rows.map((row: Raw) => mapper(row))
}

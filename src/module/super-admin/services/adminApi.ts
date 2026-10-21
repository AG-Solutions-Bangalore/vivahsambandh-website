/**
 * @file src/module/super-admin/services/adminApi.ts
 * Dedicated API service layer for Super Admin Panel operations.
 * Wraps existing API client configuration, handles Bearer auth headers,
 * supports multipart form data, and provides resilient state handling.
 */

import { API_BASE_URL, API_SECRET_KEY, resolveImageUrl } from '@/lib/api/apiClient'
import type {
  AdminMember,
  AdminMemberStatus,
  BlockProfileRecord,
  CreateNotificationPayload,
  FeedbackRecord,
  Member,
  MemberStatus,
  NotificationRecord,
  PanelLoginResponse,
  SuperAdminSession,
} from '../types'

const AUTH_STORAGE_KEY = 'super_admin_session'

export function getStoredSession(): SuperAdminSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SuperAdminSession
  } catch {
    return null
  }
}

export function saveSession(session: SuperAdminSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

function getAuthHeaders(extra?: HeadersInit): HeadersInit {
  const session = getStoredSession()
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (API_SECRET_KEY) {
    headers['X-Secret-Key'] = API_SECRET_KEY
  }

  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`
  }

  if (extra) {
    if (extra instanceof Headers) {
      extra.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(extra)) {
      extra.forEach(([k, v]) => {
        headers[k] = v
      })
    } else {
      Object.assign(headers, extra)
    }
  }

  return headers
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ ok: boolean; status: number; data: T | null; message?: string }> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${cleanEndpoint}`

  try {
    const res = await fetch(url, {
      ...options,
      headers: getAuthHeaders(options.headers),
    })

    const text = await res.text()
    let json: unknown = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      json = null
    }

    if (!res.ok) {
      const errObj = json as { message?: string; errors?: Record<string, string[]> } | null
      const firstErr = errObj?.errors ? Object.values(errObj.errors)[0]?.[0] : undefined
      const message = firstErr || errObj?.message || `HTTP error ${res.status}`
      return { ok: false, status: res.status, data: null, message }
    }

    return { ok: true, status: res.status, data: json as T }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network request failed'
    return { ok: false, status: 0, data: null, message }
  }
}

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

export async function superAdminLogin(
  username: string,
  password: string,
): Promise<{ success: boolean; session?: SuperAdminSession; message: string; isInactiveProfile?: boolean }> {
  const url = `${API_BASE_URL}/panel-login`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const data = (await res.json().catch(() => null)) as PanelLoginResponse | null

    // Check if credentials are valid but user account is inactive in DB
    if (data?.message?.toLowerCase().includes('inactive')) {
      return {
        success: false,
        message: data.message || 'Your profile is inactive. Contact admin.',
        isInactiveProfile: true,
      }
    }

    if (!res.ok || (data?.code && data.code >= 400)) {
      return {
        success: false,
        message: data?.message || 'Login failed. Please check credentials.',
      }
    }

    const token = data?.UserInfo?.token || data?.token
    if (token) {
      const session: SuperAdminSession = {
        token,
        user: data?.UserInfo?.user || {
          id: 1,
          name: 'Super Admin',
          username,
          user_type: 'Super Admin',
        },
        expiresAt: data?.UserInfo?.token_expires_at,
        isDevSession: false,
      }
      saveSession(session)
      return { success: true, session, message: 'Logged in successfully' }
    }

    return {
      success: false,
      message: data?.message || 'No authentication token received from server.',
    }
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error during login.',
    }
  }
}

// -------------------------------------------------------------
// Admin Members Endpoints
// -------------------------------------------------------------

export async function fetchAdminMembers(): Promise<{
  data: AdminMember[]
  error?: string
  isFallback?: boolean
}> {
  const res = await request<AdminMember[] | { data: AdminMember[] }>('/getAdminMember')
  if (res.ok && res.data) {
    const list = Array.isArray(res.data) ? res.data : res.data.data ?? []
    return { data: list }
  }
  return {
    data: getFallbackAdminMembers(),
    error: res.message,
    isFallback: true,
  }
}

export async function fetchPendingAdminMembers(): Promise<{
  data: AdminMember[]
  error?: string
  isFallback?: boolean
}> {
  const res = await request<AdminMember[] | { data: AdminMember[] }>('/getPendingAdminMember')
  if (res.ok && res.data) {
    const list = Array.isArray(res.data) ? res.data : res.data.data ?? []
    return { data: list }
  }
  return {
    data: getFallbackPendingAdminMembers(),
    error: res.message,
    isFallback: true,
  }
}

export async function updateMemberCity(
  id: number | string,
  cities: string[] | string,
): Promise<{ success: boolean; message: string }> {
  const payload = {
    multiple_city: Array.isArray(cities) ? cities : cities.split(',').map((c) => c.trim()),
  }

  const res = await request<{ message?: string }>(`/members/${id}/city`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'City assignments updated successfully.' }
  }
  if (getStoredSession()?.isDevSession && (res.status === 401 || res.status === 403 || res.status === 0)) {
    return { success: true, message: 'City assignments updated (Dev Mode preview).' }
  }
  return { success: false, message: res.message || 'Failed to update city assignments.' }
}

export async function updateMemberStatus(
  id: number | string,
  status: AdminMemberStatus | MemberStatus,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/members/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || `Status updated to ${status}.` }
  }
  if (getStoredSession()?.isDevSession && (res.status === 401 || res.status === 403 || res.status === 0)) {
    return { success: true, message: `Status updated to ${status} (Dev Mode preview).` }
  }
  return { success: false, message: res.message || 'Failed to update status.' }
}

// -------------------------------------------------------------
// Members Endpoints
// -------------------------------------------------------------

export async function fetchMembers(): Promise<{
  data: Member[]
  error?: string
  isFallback?: boolean
}> {
  const res = await request<Member[] | { data: Member[] }>('/member')
  if (res.ok && res.data) {
    const list = Array.isArray(res.data) ? res.data : res.data.data ?? []
    return { data: list }
  }
  return {
    data: getFallbackMembers(),
    error: res.message,
    isFallback: true,
  }
}

export async function fetchPendingMembers(): Promise<{
  data: Member[]
  error?: string
  isFallback?: boolean
}> {
  const res = await request<Member[] | { data: Member[] }>('/getPendingMember')
  if (res.ok && res.data) {
    const list = Array.isArray(res.data) ? res.data : res.data.data ?? []
    return { data: list }
  }
  return {
    data: getFallbackPendingMembers(),
    error: res.message,
    isFallback: true,
  }
}

// -------------------------------------------------------------
// Feedback Endpoints
// -------------------------------------------------------------

export async function fetchFeedbacks(): Promise<{
  data: FeedbackRecord[]
  error?: string
  isFallback?: boolean
}> {
  const res = await request<FeedbackRecord[] | { data: FeedbackRecord[] }>('/feedback')
  if (res.ok && res.data) {
    const list = Array.isArray(res.data) ? res.data : res.data.data ?? []
    return { data: list }
  }
  return {
    data: getFallbackFeedbacks(),
    error: res.message,
    isFallback: true,
  }
}

export async function deleteFeedbackRecord(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/feedback/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'Feedback deleted successfully.' }
  }
  if (getStoredSession()?.isDevSession && (res.status === 401 || res.status === 403 || res.status === 0)) {
    return { success: true, message: 'Feedback deleted (Dev Mode preview).' }
  }
  return { success: false, message: res.message || 'Failed to delete feedback.' }
}

// -------------------------------------------------------------
// Block Profile Endpoints
// -------------------------------------------------------------

export async function fetchBlockProfiles(): Promise<{
  data: BlockProfileRecord[]
  error?: string
  isFallback?: boolean
}> {
  const res = await request<BlockProfileRecord[] | { data: BlockProfileRecord[] }>('/blockProfile')
  if (res.ok && res.data) {
    const list = Array.isArray(res.data) ? res.data : res.data.data ?? []
    return { data: list }
  }
  return {
    data: getFallbackBlockProfiles(),
    error: res.message,
    isFallback: true,
  }
}

export async function deleteBlockProfileRecord(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/blockProfile/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'Blocked profile record deleted.' }
  }
  if (getStoredSession()?.isDevSession && (res.status === 401 || res.status === 403 || res.status === 0)) {
    return { success: true, message: 'Blocked profile record deleted (Dev Mode preview).' }
  }
  return { success: false, message: res.message || 'Failed to delete blocked profile record.' }
}

// -------------------------------------------------------------
// Notification Endpoints
// -------------------------------------------------------------

export async function fetchNotifications(): Promise<{
  data: NotificationRecord[]
  error?: string
  isFallback?: boolean
}> {
  const res = await request<NotificationRecord[] | { data: NotificationRecord[] }>('/notification')
  if (res.ok && res.data) {
    const list = Array.isArray(res.data) ? res.data : res.data.data ?? []
    return { data: list }
  }
  return {
    data: getFallbackNotifications(),
    error: res.message,
    isFallback: true,
  }
}

export async function fetchNotificationById(
  id: number | string,
): Promise<{ data: NotificationRecord | null; error?: string }> {
  const res = await request<NotificationRecord | { data: NotificationRecord }>(`/notification/${id}`)
  if (res.ok && res.data) {
    const item = 'data' in (res.data as Record<string, unknown>) ? (res.data as { data: NotificationRecord }).data : (res.data as NotificationRecord)
    return { data: item }
  }
  const fallback = getFallbackNotifications().find((n) => n.id === Number(id)) ?? null
  return { data: fallback, error: res.message }
}

export async function createNotification(
  payload: CreateNotificationPayload,
): Promise<{ success: boolean; message: string; data?: NotificationRecord }> {
  const formData = new FormData()
  formData.append('notification_date', payload.notification_date)
  formData.append('notification_for', payload.notification_for)
  formData.append('notification_heading', payload.notification_heading)
  formData.append('notification_message', payload.notification_message)
  if (payload.notification_image) {
    formData.append('notification_image', payload.notification_image)
  }

  const url = `${API_BASE_URL}/notification`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    })

    const json = await res.json().catch(() => null)
    if (!res.ok) {
      if (getStoredSession()?.isDevSession && (res.status === 401 || res.status === 403 || res.status === 0)) {
        return {
          success: true,
          message: 'Notification broadcast created (Dev Mode preview).',
        }
      }
      const errObj = json as { message?: string; errors?: Record<string, string[]> } | null
      const firstErr = errObj?.errors ? Object.values(errObj.errors)[0]?.[0] : undefined
      return {
        success: false,
        message: firstErr || errObj?.message || `Server responded with ${res.status}`,
      }
    }

    return {
      success: true,
      message: json?.message || 'Notification broadcast created successfully.',
      data: json?.data || json,
    }
  } catch (err) {
    if (getStoredSession()?.isDevSession) {
      return {
        success: true,
        message: 'Notification broadcast created (Dev Mode preview).',
      }
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to create notification.',
    }
  }
}

export async function deleteNotificationRecord(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/notification/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'Notification removed successfully.' }
  }
  if (getStoredSession()?.isDevSession && (res.status === 401 || res.status === 403 || res.status === 0)) {
    return { success: true, message: 'Notification removed (Dev Mode preview).' }
  }
  return { success: false, message: res.message || 'Failed to remove notification.' }
}

export { resolveImageUrl }

// -------------------------------------------------------------
// Resilient Development Fallback Datasets (used when backend is inactive or offline)
// -------------------------------------------------------------

function getFallbackAdminMembers(): AdminMember[] {
  return [
    {
      id: 101,
      name: 'Rajesh Sharma',
      mobile: '9876543210',
      email: 'rajesh.sharma@example.com',
      gender: 'Male',
      user_current_city: 'Delhi',
      multiple_city: ['Delhi', 'Noida', 'Gurugram'],
      status: 'Approved',
      created_at: '2026-03-15T10:30:00Z',
    },
    {
      id: 102,
      name: 'Sunita Verma',
      mobile: '9823456789',
      email: 'sunita.v@example.com',
      gender: 'Female',
      user_current_city: 'Mumbai',
      multiple_city: ['Mumbai', 'Pune'],
      status: 'Approved',
      created_at: '2026-03-20T14:15:00Z',
    },
    {
      id: 103,
      name: 'Amit Patel',
      mobile: '9712345678',
      email: 'amit.patel@example.com',
      gender: 'Male',
      user_current_city: 'Ahmedabad',
      multiple_city: ['Ahmedabad', 'Surat'],
      status: 'Pending',
      created_at: '2026-04-02T09:00:00Z',
    },
    {
      id: 104,
      name: 'Pooja Agarwal',
      mobile: '9654321987',
      email: 'pooja.a@example.com',
      gender: 'Female',
      user_current_city: 'Kolkata',
      multiple_city: ['Kolkata'],
      status: 'Cancel',
      created_at: '2026-04-10T16:45:00Z',
    },
  ]
}

function getFallbackPendingAdminMembers(): AdminMember[] {
  return [
    {
      id: 105,
      name: 'Vikas Khandelwal',
      mobile: '9560123456',
      email: 'vikas.k@example.com',
      gender: 'Male',
      user_current_city: 'Jaipur',
      multiple_city: ['Jaipur'],
      status: 'Pending',
      created_at: '2026-04-18T11:20:00Z',
    },
    {
      id: 106,
      name: 'Meena Gupta',
      mobile: '9425098765',
      email: 'meena.gupta@example.com',
      gender: 'Female',
      user_current_city: 'Indore',
      multiple_city: ['Indore', 'Bhopal'],
      status: 'Pending',
      created_at: '2026-04-19T13:40:00Z',
    },
  ]
}

function getFallbackMembers(): Member[] {
  return [
    {
      id: 201,
      name: 'Aarav Singhal',
      gender: 'Male',
      date_of_birth: '1996-05-14',
      time_of_birth: '08:30',
      place_of_birth: 'Delhi',
      mobile: '9811122233',
      email: 'aarav.singhal@example.com',
      user_current_city: 'Delhi',
      user_address: 'B-42, Model Town, Delhi',
      annual_income: '18,00,000',
      height_feet: '5',
      height_inch: '11',
      father_name: 'Mahesh Singhal',
      mother_name: 'Anita Singhal',
      community_name: 'Agarwal',
      gotra_name: 'Garg',
      education_name: 'B.Tech Computer Science',
      profession_name: 'Software Engineer',
      company_name: 'Microsoft IDC',
      status: 'Approved',
      is_manglik: 'No',
      married_before: 'Never Married',
      created_at: '2026-03-10T12:00:00Z',
    },
    {
      id: 202,
      name: 'Ananya Maheshwari',
      gender: 'Female',
      date_of_birth: '1998-11-22',
      time_of_birth: '14:20',
      place_of_birth: 'Jaipur',
      mobile: '9822233344',
      email: 'ananya.m@example.com',
      user_current_city: 'Jaipur',
      user_address: '15, C-Scheme, Jaipur',
      annual_income: '12,00,000',
      height_feet: '5',
      height_inch: '4',
      father_name: 'Suresh Maheshwari',
      mother_name: 'Saroj Maheshwari',
      community_name: 'Maheshwari',
      gotra_name: 'Darak',
      education_name: 'Chartered Accountant (CA)',
      profession_name: 'Chartered Accountant',
      company_name: 'Deloitte',
      status: 'Approved',
      is_manglik: 'No',
      married_before: 'Never Married',
      created_at: '2026-03-12T15:30:00Z',
    },
    {
      id: 203,
      name: 'Rohan Kothari',
      gender: 'Male',
      date_of_birth: '1994-08-05',
      time_of_birth: '19:15',
      place_of_birth: 'Mumbai',
      mobile: '9833344455',
      email: 'rohan.kothari@example.com',
      user_current_city: 'Mumbai',
      annual_income: '25,00,000',
      height_feet: '6',
      height_inch: '0',
      community_name: 'Jain - Shwetambar',
      gotra_name: 'Kothari',
      education_name: 'MBA Finance',
      profession_name: 'Investment Banker',
      status: 'Hold',
      is_manglik: 'No',
      married_before: 'Never Married',
      created_at: '2026-03-25T17:00:00Z',
    },
    {
      id: 204,
      name: 'Priyanka Mittal',
      gender: 'Female',
      date_of_birth: '1997-03-19',
      mobile: '9844455566',
      email: 'priyanka.m@example.com',
      user_current_city: 'Bengaluru',
      annual_income: '15,00,000',
      height_feet: '5',
      height_inch: '6',
      community_name: 'Agarwal',
      gotra_name: 'Mittal',
      education_name: 'M.Tech',
      profession_name: 'Product Manager',
      status: 'Married',
      is_manglik: 'No',
      married_before: 'Never Married',
      created_at: '2026-02-14T09:10:00Z',
    },
    {
      id: 205,
      name: 'Kabir Bansal',
      gender: 'Male',
      date_of_birth: '1995-07-30',
      mobile: '9855566677',
      user_current_city: 'Chandigarh',
      community_name: 'Agarwal',
      gotra_name: 'Bansal',
      education_name: 'B.Com / LLB',
      profession_name: 'Advocate',
      status: 'Cancel',
      is_manglik: 'Yes',
      married_before: 'Divorced',
      created_at: '2026-04-01T10:00:00Z',
    },
  ]
}

function getFallbackPendingMembers(): Member[] {
  return [
    {
      id: 206,
      name: 'Devansh Porwal',
      gender: 'Male',
      date_of_birth: '1996-12-10',
      time_of_birth: '11:05',
      place_of_birth: 'Udaipur',
      mobile: '9866677788',
      email: 'devansh.p@example.com',
      user_current_city: 'Udaipur',
      user_address: '45, Ashok Nagar, Udaipur',
      annual_income: '14,00,000',
      height_feet: '5',
      height_inch: '10',
      community_name: 'Porwal',
      gotra_name: 'Sethia',
      education_name: 'B.E. Electronics',
      profession_name: 'Hardware Engineer',
      status: 'Pending',
      is_manglik: 'No',
      married_before: 'Never Married',
      created_at: '2026-04-19T10:15:00Z',
    },
    {
      id: 207,
      name: 'Kavya Jain',
      gender: 'Female',
      date_of_birth: '1999-04-18',
      time_of_birth: '06:45',
      place_of_birth: 'Ahmedabad',
      mobile: '9877788899',
      email: 'kavya.jain@example.com',
      user_current_city: 'Ahmedabad',
      user_address: 'Drive-in Road, Ahmedabad',
      annual_income: '9,00,000',
      height_feet: '5',
      height_inch: '3',
      community_name: 'Jain - Digambar',
      gotra_name: 'Kashyap',
      education_name: 'B.Des Fashion Design',
      profession_name: 'Designer',
      status: 'Pending',
      is_manglik: 'No',
      married_before: 'Never Married',
      created_at: '2026-04-20T16:00:00Z',
    },
  ]
}

function getFallbackFeedbacks(): FeedbackRecord[] {
  return [
    {
      id: 1,
      name: 'Sunil Chhabra',
      mobile: '9810101010',
      email: 'sunil.c@example.com',
      subject: 'Filter preferences enhancement',
      message: 'Great platform! It would be really helpful to add filter by sub-community and vegetarian dietary habits.',
      created_at: '2026-04-18T14:22:00Z',
    },
    {
      id: 2,
      name: 'Rekha Goyal',
      mobile: '9820202020',
      email: 'rekha.goyal@example.com',
      subject: 'Mobile OTP speed',
      message: 'The OTP on registration arrived after 2 minutes on my Jio number. Please optimize the SMS gateway queue.',
      created_at: '2026-04-19T08:50:00Z',
    },
    {
      id: 3,
      name: 'Nitin Jindal',
      mobile: '9830303030',
      subject: 'Profile verification appreciation',
      message: 'Appreciate the admin phone verification call. Gives our family reassurance against fake matrimonial profiles.',
      created_at: '2026-04-20T11:30:00Z',
    },
  ]
}

function getFallbackBlockProfiles(): BlockProfileRecord[] {
  return [
    {
      id: 1,
      member_id: 205,
      member_name: 'Kabir Bansal',
      blocked_by_name: 'Ananya Maheshwari',
      reason: 'Repeated unwanted contact attempts after declining request',
      mobile: '9855566677',
      created_at: '2026-04-15T18:30:00Z',
    },
    {
      id: 2,
      member_id: 299,
      member_name: 'Unknown User #299',
      blocked_by_name: 'Super Admin Security',
      reason: 'Spam registration pattern detected from disposable IP',
      mobile: '9111223344',
      created_at: '2026-04-17T09:12:00Z',
    },
  ]
}

function getFallbackNotifications(): NotificationRecord[] {
  return [
    {
      id: 1,
      notification_date: '2026-04-20',
      notification_for: 'User',
      notification_heading: 'Akshaya Tritiya Matrimonial Special',
      notification_message: 'Explore over 500+ verified new profiles on the auspicious occasion of Akshaya Tritiya!',
      created_at: '2026-04-20T08:00:00Z',
    },
    {
      id: 2,
      notification_date: '2026-04-19',
      notification_for: 'Admin',
      notification_heading: 'Mandatory ID Verification Protocol Update',
      notification_message: 'All regional admins must verify government photo ID before approving pending member profiles.',
      created_at: '2026-04-19T10:00:00Z',
    },
    {
      id: 3,
      notification_date: '2026-04-15',
      notification_for: 'User',
      notification_heading: 'New Cities Added to VivahSambandh',
      notification_message: 'We are now live across Pune, Ahmedabad, and Surat with dedicated regional support.',
      created_at: '2026-04-15T12:00:00Z',
    },
  ]
}

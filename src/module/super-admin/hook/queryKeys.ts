/**
 * @file src/module/super-admin/hook/queryKeys.ts
 * Central query-key factory for the Super Admin Panel.
 *
 * Mutations invalidate these keys after they land, so they must live in one
 * place — a typo in a hand-written key silently disables cache invalidation
 * and leaves the panel showing stale rows.
 */

import { categoryKeys } from '@/module/category/hook/useCategories'

export const superAdminKeys = {
  all: ['super-admin'] as const,
  adminMembers: ['super-admin', 'admin-members'] as const,
  pendingAdminMembers: ['super-admin', 'pending-admin-members'] as const,
  members: ['super-admin', 'members'] as const,
  pendingMembers: ['super-admin', 'pending-members'] as const,
  feedbacks: ['super-admin', 'feedbacks'] as const,
  blockProfiles: ['super-admin', 'block-profiles'] as const,
  notifications: ['super-admin', 'notifications'] as const,
  notification: (id: number | string) =>
    ['super-admin', 'notifications', 'detail', id] as const,
  blogs: ['super-admin', 'blogs'] as const,
  blog: (id: number | string) => ['super-admin', 'blogs', 'detail', id] as const,
  faqs: ['super-admin', 'faqs'] as const,
  faq: (id: number | string) => ['super-admin', 'faqs', 'detail', id] as const,
  testimonials: ['super-admin', 'testimonials'] as const,
  testimonial: (id: number | string) =>
    ['super-admin', 'testimonials', 'detail', id] as const,
  enquiries: ['super-admin', 'enquiries'] as const,
  enquiry: (id: number | string) =>
    ['super-admin', 'enquiries', 'detail', id] as const,
  enquiryReport: ['super-admin', 'enquiries', 'report'] as const,
  clients: ['super-admin', 'clients'] as const,
  client: (id: number | string) =>
    ['super-admin', 'clients', 'detail', id] as const,
  galleries: ['super-admin', 'galleries'] as const,
  gallery: (id: number | string) =>
    ['super-admin', 'galleries', 'detail', id] as const,
  /**
   * Categories are a shared module — the public site reads the same
   * taxonomy — so their keys live with the module. This alias keeps the
   * panel's invalidation idiom working.
   */
  categories: categoryKeys.all,
}

/**
 * Panel data changes constantly — keep it fresher than the app-wide default
 * of five minutes, otherwise an admin sees stale rows after a decision.
 */
export const PANEL_STALE_TIME = 30_000

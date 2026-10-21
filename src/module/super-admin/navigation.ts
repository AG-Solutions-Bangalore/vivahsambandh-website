/**
 * @file src/module/super-admin/navigation.ts
 * Single source of truth for the Super Admin Panel navigation.
 *
 * The sidebar renders the full list; the sticky header renders the current
 * section label. Keeping both here stops the two surfaces from drifting
 * apart or from repeating the page title verbatim.
 */

import {
  Ban,
  Bell,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface PanelNavItem {
  label: string
  to: string
  icon: LucideIcon
  /** One-line explanation shown under the page title. */
  description: string
}

export const PANEL_NAV_ITEMS: PanelNavItem[] = [
  {
    label: 'Dashboard Overview',
    to: '/panel/dashboard',
    icon: LayoutDashboard,
    description:
      'Real-time platform overview, moderation queues, and operational metrics.',
  },
  {
    label: 'Admin Members',
    to: '/panel/admin-members',
    icon: ShieldCheck,
    description:
      'View regional administrators, assign multiple coverage cities, and approve or cancel accounts.',
  },
  {
    label: 'Pending Admin Members',
    to: '/panel/pending-admin-members',
    icon: UserCheck,
    description:
      'Admin applications submitted via registration that require Super Admin vetting and city allocation.',
  },
  {
    label: 'Members',
    to: '/panel/members',
    icon: Users,
    description:
      'Browse registered candidates, examine verification biodatas, and update marital and approval statuses.',
  },
  {
    label: 'Pending Members',
    to: '/panel/pending-members',
    icon: UserPlus,
    description:
      'Verify newly submitted matrimonials, validate background claims, and approve profile activation.',
  },
  {
    label: 'Feedback',
    to: '/panel/feedback',
    icon: MessageSquare,
    description:
      'Member responses, user experience reviews, and platform feedback submitted by users.',
  },
  {
    label: 'Block Profiles',
    to: '/panel/block-profiles',
    icon: Ban,
    description:
      'Audit member reports, harassment blocks, and moderation dispute entries.',
  },
  {
    label: 'Notifications',
    to: '/panel/notifications',
    icon: Bell,
    description:
      'Create and broadcast push alerts, announcements, and policy updates to Users or Admins.',
  },
]

const NAV_BY_PATH = new Map(
  PANEL_NAV_ITEMS.map((item) => [item.to, item] as const),
)

/** Resolves the nav entry for a pathname (falls back to the dashboard). */
export function findNavItem(pathname: string): PanelNavItem | undefined {
  if (NAV_BY_PATH.has(pathname)) return NAV_BY_PATH.get(pathname)

  const match = PANEL_NAV_ITEMS.find((item) =>
    pathname.startsWith(`${item.to}/`),
  )
  return match ?? NAV_BY_PATH.get('/panel/dashboard')
}

/** Description for a panel route, used by every page header. */
export function panelDescription(pathname: string): string {
  return findNavItem(pathname)?.description ?? ''
}

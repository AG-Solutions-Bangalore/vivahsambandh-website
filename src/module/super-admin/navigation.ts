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
  Briefcase,
  FileText,
  HelpCircle,
  Images,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Quote,
  ShieldCheck,
  Tags,
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

export interface PanelNavGroup {
  section?: string
  items: PanelNavItem[]
}

export const PANEL_NAV_GROUPS: PanelNavGroup[] = [
  {
    items: [
      {
        label: 'Dashboard',
        to: '/panel/dashboard',
        icon: LayoutDashboard,
        description:
          'Real-time platform overview, moderation queues, and operational metrics.',
      },
    ],
  },
  {
    section: 'Website',
    items: [
      {
        label: 'Blog Gallery',
        to: '/panel/blog-gallery',
        icon: Images,
        description:
          'Browse blog banner images, media assets, and visual attachments.',
      },
      {
        label: 'Blog',
        to: '/panel/blogs',
        icon: FileText,
        description:
          'Create, edit and publish articles, control placement, and manage metadata.',
      },
      {
        label: 'Category',
        to: '/panel/categories',
        icon: Tags,
        description:
          'Manage the categories that group blog articles and drive the category filters.',
      },
      {
        label: 'Client',
        to: '/panel/clients',
        icon: Briefcase,
        description:
          'Manage client partners, brand logos, and collaborator visibility on the platform.',
      },
      {
        label: 'Testimonial',
        to: '/panel/testimonials',
        icon: Quote,
        description:
          'Manage matrimonial success reviews, member feedback quotes, and client ratings.',
      },
      {
        label: 'Faq',
        to: '/panel/faqs',
        icon: HelpCircle,
        description:
          'Manage FAQ groups, target audiences, and structured question-and-answer accordions.',
      },
      {
        label: 'Enquiry',
        to: '/panel/enquiries',
        icon: Inbox,
        description:
          'Review contact-form enquiries, track status, and export full reports.',
      },
      {
        label: 'Newsletter',
        to: '/panel/newsletter',
        icon: Mail,
        description:
          'The mailing audience — every address that signed up for newsletter updates from the site and the app.',
      },
    ],
  },
  {
    section: 'App',
    items: [
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
        label: 'Admin Members',
        to: '/panel/admin-members',
        icon: ShieldCheck,
        description:
          'View regional administrators, assign multiple coverage cities, and approve or cancel accounts.',
      },
      {
        label: 'Pending Admin',
        to: '/panel/pending-admin-members',
        icon: UserCheck,
        description:
          'Admin applications submitted via registration that require Super Admin vetting and city allocation.',
      },
      {
        label: 'Block Profile',
        to: '/panel/block-profiles',
        icon: Ban,
        description:
          'Audit member reports, harassment blocks, and moderation dispute entries.',
      },
      {
        label: 'Feedback',
        to: '/panel/feedback',
        icon: MessageSquare,
        description:
          'Member responses, user experience reviews, and platform feedback submitted by users.',
      },
      {
        label: 'Notification',
        to: '/panel/notifications',
        icon: Bell,
        description:
          'Create and broadcast push alerts, announcements, and policy updates to Users or Admins.',
      },
    ],
  },
]

export const PANEL_NAV_ITEMS: PanelNavItem[] = PANEL_NAV_GROUPS.flatMap(
  (group) => group.items,
)

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

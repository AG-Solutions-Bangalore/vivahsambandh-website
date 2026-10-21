/**
 * @file src/module/super-admin/components/SuperAdminHeader.tsx
 * Top header bar for the Super Admin Panel.
 */

import { Menu, Globe, Shield, Sparkles, ExternalLink } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext'

interface SuperAdminHeaderProps {
  onOpenSidebar: () => void
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/panel': { title: 'Dashboard Overview', subtitle: 'Platform metrics, statistics, and quick operations' },
  '/panel/dashboard': { title: 'Dashboard Overview', subtitle: 'Platform metrics, statistics, and quick operations' },
  '/panel/admin-members': { title: 'Admin Members', subtitle: 'Manage regional administrators, city assignments & approval status' },
  '/panel/pending-admin-members': { title: 'Pending Admin Members', subtitle: 'Review and approve new admin applications' },
  '/panel/members': { title: 'All Registered Members', subtitle: 'Browse matrimonial member profiles and manage account statuses' },
  '/panel/pending-members': { title: 'Pending Member Approvals', subtitle: 'Verify and approve pending matrimonial profiles' },
  '/panel/feedback': { title: 'User Feedback', subtitle: 'Review inquiries, suggestions, and member reviews' },
  '/panel/block-profiles': { title: 'Blocked Profiles', subtitle: 'Monitor flagged accounts and moderation records' },
  '/panel/notifications': { title: 'Notification Broadcasts', subtitle: 'Send announcements and push notifications to Users or Admins' },
}

export function SuperAdminHeader({ onOpenSidebar }: SuperAdminHeaderProps) {
  const { pathname } = useLocation()
  const { session, isDevSession } = useSuperAdminAuth()
  const current = ROUTE_TITLES[pathname] || {
    title: 'Super Admin Panel',
    subtitle: 'VivahSambandh Control Panel',
  }

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-cream-200/90 bg-white/95 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-xl border border-cream-300 p-2 text-ink-600 hover:bg-cream-100 lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold font-display text-navy-900 tracking-tight leading-tight">
            {current.title}
          </h1>
          <p className="hidden sm:block text-xs text-ink-500">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Environment Status Badge */}
        {isDevSession ? (
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/90 px-3 py-1 text-xs font-semibold text-amber-800">
            <Sparkles className="size-3.5 text-amber-600" />
            <span>Dev Preview Mode</span>
          </div>
        ) : (
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Backend Connected</span>
          </div>
        )}

        {/* View Public Website */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-cream-50 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-cream-100 hover:text-navy-900 transition-colors"
          title="Open Public Website"
        >
          <Globe className="size-3.5 text-gold-600" />
          <span className="hidden md:inline">Public Site</span>
          <ExternalLink className="size-3 opacity-60" />
        </Link>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-cream-200">
          <div className="size-9 rounded-full bg-navy-900 text-gold-400 font-bold text-xs flex items-center justify-center shadow-xs">
            <Shield className="size-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-navy-900 leading-tight">
              {session?.user.name || 'Super Admin'}
            </p>
            <p className="text-[0.68rem] text-ink-400 font-medium">
              Authorized
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

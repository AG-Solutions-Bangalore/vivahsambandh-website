/**
 * @file src/module/super-admin/components/SuperAdminHeader.tsx
 * Sticky top bar for the Super Admin Panel.
 *
 * The bar carries orientation and global chrome only — the page owns its own
 * title, so the two never repeat the same words.
 */

import { Menu, Globe, Shield, ExternalLink } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext'
import { findNavItem } from '../navigation'

interface SuperAdminHeaderProps {
  onOpenSidebar: () => void
}

export function SuperAdminHeader({ onOpenSidebar }: SuperAdminHeaderProps) {
  const { pathname } = useLocation()
  const { session } = useSuperAdminAuth()
  const current = findNavItem(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-18 shrink-0 items-center justify-between gap-4 border-b border-gold-500/25 bg-white/90 px-4 backdrop-blur-md sm:px-8">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="cursor-pointer rounded-xl border border-cream-300 p-2 text-ink-600 transition-colors hover:border-gold-500/50 hover:bg-cream-100 hover:text-navy-900 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-[0.68rem] font-bold tracking-[0.16em] text-ink-400 uppercase">
            <li className="hidden shrink-0 sm:block">Super Admin</li>
            <li aria-hidden className="hidden text-gold-600 sm:block">
              /
            </li>
            <li className="truncate text-navy-900">
              {current?.label ?? 'Control Panel'}
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
 

        {/* View Public Website */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-cream-50 px-3 py-1.5 text-xs font-semibold text-ink-600 transition-colors hover:border-gold-500/60 hover:bg-cream-100 hover:text-navy-900 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none"
          title="Open Public Website"
        >
          <Globe className="size-3.5 text-gold-600" aria-hidden />
          <span className="hidden md:inline">Public Site</span>
          <ExternalLink className="size-3 opacity-60" aria-hidden />
        </Link>

        {/* User Badge */}
        <div className="flex items-center gap-2 border-l border-cream-300 pl-2 sm:pl-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-navy-900 font-bold text-gold-400 shadow-card">
            <Shield className="size-4" aria-hidden />
          </span>
          <span className="hidden text-left md:block">
            <span className="block text-xs leading-tight font-bold text-navy-900">
              {session?.user.name || 'Super Admin'}
            </span>
            <span className="block text-[0.68rem] font-medium text-ink-400">
              Authorized
            </span>
          </span>
        </div>
      </div>
    </header>
  )
}

/**
 * @file src/module/super-admin/components/SuperAdminSidebar.tsx
 * Reusable sidebar navigation for the Super Admin Panel.
 */

import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  Users,
  UserPlus,
  MessageSquare,
  Ban,
  Bell,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react'
import { cn } from 'cn'
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext'
import { ConfirmDialog } from './ConfirmDialog'

interface SuperAdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  to: string
  icon: typeof LayoutDashboard
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard Overview',
    to: '/panel/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Admin Members',
    to: '/panel/admin-members',
    icon: ShieldCheck,
  },
  {
    label: 'Pending Admin Members',
    to: '/panel/pending-admin-members',
    icon: UserCheck,
  },
  {
    label: 'Members',
    to: '/panel/members',
    icon: Users,
  },
  {
    label: 'Pending Members',
    to: '/panel/pending-members',
    icon: UserPlus,
  },
  {
    label: 'Feedback',
    to: '/panel/feedback',
    icon: MessageSquare,
  },
  {
    label: 'Block Profiles',
    to: '/panel/block-profiles',
    icon: Ban,
  },
  {
    label: 'Notifications',
    to: '/panel/notifications',
    icon: Bell,
  },
]

export function SuperAdminSidebar({ isOpen, onClose }: SuperAdminSidebarProps) {
  const { session, logout, isDevSession } = useSuperAdminAuth()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    setShowLogoutConfirm(false)
    navigate('/panel-login', { replace: true })
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-xs lg:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy-900 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between px-6 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-tr from-gold-500 to-gold-400 p-0.5 shadow-gold flex items-center justify-center text-navy-900 font-bold font-display text-lg">
              VS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-base tracking-wide text-white">
                  VivahSambandh
                </span>
              </div>
              <span className="text-[0.68rem] tracking-wider uppercase font-semibold text-gold-400">
                Super Admin Panel
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy-300 hover:bg-navy-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Dev Mode Banner in sidebar */}
        {isDevSession && (
          <div className="mx-4 mt-3 rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-2 text-xs text-amber-300 flex items-center gap-2">
            <Sparkles className="size-4 shrink-0 text-amber-400" />
            <span className="leading-tight">
              Dev Mode active (Testing credentials verified)
            </span>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-navy-700">
          <div className="px-3 pb-2 text-[0.68rem] font-bold tracking-wider text-navy-400 uppercase">
            Management Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose()
                }}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 font-bold shadow-md'
                      : 'text-navy-100/90 hover:bg-navy-800/80 hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'size-4.5 shrink-0 transition-colors',
                        isActive
                          ? 'text-navy-950'
                          : 'text-gold-400/80 group-hover:text-gold-300',
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer Admin Info & Logout */}
        <div className="border-t border-navy-800 p-4">
          <div className="rounded-xl bg-navy-800/60 p-3 mb-2 flex items-center gap-3">
            <div className="size-9 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center font-bold text-sm text-gold-400 shrink-0">
              {session?.user.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {session?.user.name || 'Super Admin'}
              </p>
              <p className="text-[0.7rem] text-navy-300 truncate">
                {session?.user.username || session?.user.mobile || '9999999999'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 hover:text-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out from Super Admin"
        description="Are you sure you want to end your Super Admin session? You will need to login again at /panel-login."
        confirmText="Yes, Sign Out"
        cancelText="Stay Signed In"
        variant="danger"
        onConfirm={handleLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  )
}

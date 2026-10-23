/**
 * @file src/module/super-admin/components/SuperAdminSidebar.tsx
 * Reusable sidebar navigation for the Super Admin Panel.
 */

import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { cn } from 'cn'
import CompanyLogo from '@/components/CompanyLogo'
import { useCompanyDetails } from '@/module/company'
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext'
import { PANEL_NAV_GROUPS } from '../navigation'
import { ConfirmDialog } from './ConfirmDialog'

interface SuperAdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function SuperAdminSidebar({ isOpen, onClose }: SuperAdminSidebarProps) {
  const { session, logout } = useSuperAdminAuth()
  const { logoUrl, name } = useCompanyDetails()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    setShowLogoutConfirm(false)
    navigate('/crm', { replace: true })
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="animate-panel-fade fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'panel-scroll fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-navy-900 text-white shadow-lift transition-transform duration-300 ease-in-out print:hidden lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand Header */}
        <div className="flex h-18 shrink-0 items-center justify-between border-b border-navy-800/80 px-6">
          <div className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              <span className="flex h-11 max-w-40 shrink-0 items-center bg-transparent justify-center rounded-lg p-1">
                <CompanyLogo className="h-full w-auto max-w-full" />
              </span>
            ) : (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-600 font-display text-sm font-bold text-white shadow-gold">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <span className="block truncate font-display text-base font-bold tracking-wide text-white">
                {name}
              </span>
              <span className="block truncate text-[0.66rem] font-semibold tracking-[0.18em] text-gold-400 uppercase">
                Super Admin Panel
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-navy-300 transition-colors hover:bg-navy-800 hover:text-white focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="panel-scroll flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {PANEL_NAV_GROUPS.map((group, groupIdx) => (
            <div key={group.section || groupIdx} className="space-y-1">
              {group.section ? (
                <div className="pt-2 pb-1">
                  <p className="px-3 text-[0.66rem] font-bold tracking-[0.18em] text-gold-400/90 uppercase">
                    {group.section}
                  </p>
                </div>
              ) : null}

              {group.items.map((item) => {
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
                        'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none',
                        isActive
                          ? 'bg-gold-600 font-bold text-white shadow-gold'
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
                              ? 'text-white'
                              : 'text-gold-400/80 group-hover:text-gold-300',
                          )}
                          aria-hidden
                        />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer Admin Info & Logout */}
        <div className="mt-auto border-t border-navy-800/80 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-navy-800/60 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-navy-600 bg-navy-700 text-sm font-bold text-gold-400">
              {session?.user.name?.charAt(0) || 'A'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {session?.user.name || 'Super Admin'}
              </p>
              <p className="truncate text-[0.7rem] text-navy-300">
                {session?.user.username || session?.user.mobile || '9999999999'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-maroon-500/30 bg-maroon-600/15 px-3 py-2 text-xs font-semibold text-maroon-200 transition-colors hover:bg-maroon-600/25 hover:text-white focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none"
          >
            <LogOut className="size-4" aria-hidden />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out from Super Admin"
        description="Are you sure you want to end your Super Admin session? You will need to login again at /crm."
        confirmText="Yes, Sign Out"
        cancelText="Stay Signed In"
        variant="danger"
        onConfirm={handleLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  )
}

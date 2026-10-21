/**
 * @file src/module/super-admin/components/SuperAdminLayout.tsx
 * Master layout wrapper for Super Admin Panel with sidebar, header, and content viewport.
 *
 * The shell owns the scroll: the viewport is pinned to `h-screen` and the
 * content column scrolls on its own, so the sidebar and header stay put
 * instead of scrolling away with the records.
 */

import { useState, type ReactNode } from 'react'
import { SuperAdminSidebar } from './SuperAdminSidebar'
import { SuperAdminHeader } from './SuperAdminHeader'

interface SuperAdminLayoutProps {
  children?: ReactNode
}

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="bg-cream-50 font-sans text-ink-700 antialiased lg:flex lg:h-screen lg:overflow-hidden">
      {/* Sidebar Navigation */}
      <SuperAdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-h-screen min-w-0 flex-col lg:min-h-0 lg:flex-1">
        <SuperAdminHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="panel-scroll flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

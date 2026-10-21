/**
 * @file src/module/super-admin/components/SuperAdminLayout.tsx
 * Master layout wrapper for Super Admin Panel with sidebar, header, and content viewport.
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
    <div className="flex min-h-screen bg-cream-50/70 font-sans text-ink-900 antialiased">
      {/* Sidebar Navigation */}
      <SuperAdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <SuperAdminHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

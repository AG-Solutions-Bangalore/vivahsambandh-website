/**
 * @file src/module/super-admin/pages/PanelNotFoundPage.tsx
 * 404 state for Super Admin Panel URLs that do not match a defined route.
 */

import { Link } from 'react-router-dom'
import { Compass, LayoutDashboard } from 'lucide-react'
import { PanelEmpty } from '../components/PanelState'
import { PanelPageHeader } from '../components/PanelPageHeader'

export default function PanelNotFoundPage() {
  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Page not found"
        description="The panel page you requested does not exist or has been moved."
      />

      <div className="card-ring">
        <PanelEmpty
          icon={<Compass className="size-6" aria-hidden />}
          title="404 — This page does not exist"
          description="Check the address in the URL bar or choose a section from the sidebar."
          action={
            <Link
              to="/crm/dashboard"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-cream-300 px-4 py-2 text-xs font-bold text-navy-900 transition-colors hover:border-gold-500/60 hover:bg-cream-100 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none"
            >
              <LayoutDashboard className="size-3.5" aria-hidden />
              Back to dashboard
            </Link>
          }
        />
      </div>
    </div>
  )
}

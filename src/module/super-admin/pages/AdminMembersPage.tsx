/**
 * @file src/module/super-admin/pages/AdminMembersPage.tsx
 * Admin Members management: view administrators, update city assignments (multiple_city), and update status.
 */

import { useEffect, useState, useMemo } from 'react'
import {
  ShieldCheck,
  RefreshCw,
  Edit2,
  CircleCheck,
  CircleX,
  Clock,
  Mail,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { panelDescription } from '../navigation'
import { PanelBanner } from '../components/PanelBanner'
import { PanelSearch } from '../components/PanelSearch'
import { PanelToolbar } from '../components/PanelToolbar'
import { PanelEmpty } from '../components/PanelState'
import { PanelTableSkeleton } from '../components/PanelSkeleton'
import {
  PanelTable,
  PanelTableFooter,
  PanelTableHeadCell,
} from '../components/PanelTable'
import { PanelFilterSelect } from '../components/PanelFilterSelect'
import { StatusActionGroup } from '../components/StatusActionGroup'
import { CityAssignmentModal } from '../components/CityAssignmentModal'
import {
  fetchAdminMembers,
  updateMemberCity,
  updateMemberStatus,
} from '../services/adminApi'
import type { AdminMember, AdminMemberStatus } from '../types'

const STATUS_FILTERS = ['All', 'Approved', 'Pending', 'Cancel'] as const

export default function AdminMembersPage() {
  const [admins, setAdmins] = useState<AdminMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  // Edit City Modal State
  const [editingCityAdmin, setEditingCityAdmin] = useState<AdminMember | null>(null)
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [isUpdatingCity, setIsUpdatingCity] = useState(false)

  // Status Change Confirmation Modal State
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    admin: AdminMember
    nextStatus: AdminMemberStatus
  } | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetchAdminMembers()
      setAdmins(res.data)
      if (res.error) {
        setErrorMessage(res.error)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load admin members.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  // Filtered admin records
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchesSearch =
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (admin.mobile ?? '').includes(searchQuery) ||
        (admin.email && admin.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (admin.user_current_city &&
          admin.user_current_city.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus =
        statusFilter === 'All' ||
        admin.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [admins, searchQuery, statusFilter])

  // Open Edit City modal
  const handleOpenCityModal = (admin: AdminMember) => {
    setEditingCityAdmin(admin)
    let initial: string[] = []
    if (Array.isArray(admin.multiple_city)) {
      initial = [...admin.multiple_city]
    } else if (typeof admin.multiple_city === 'string' && admin.multiple_city.trim()) {
      initial = admin.multiple_city.split(',').map((c) => c.trim()).filter(Boolean)
    } else if (admin.user_current_city) {
      initial = [admin.user_current_city]
    }
    setSelectedCities(initial)
  }

  // Toggle city in selection
  const handleToggleCity = (cityName: string) => {
    setSelectedCities((prev) =>
      prev.includes(cityName)
        ? prev.filter((c) => c !== cityName)
        : [...prev, cityName],
    )
  }

  // Add custom city
  const handleAddCustomCity = (city: string) => {
    if (city && !selectedCities.includes(city)) {
      setSelectedCities((prev) => [...prev, city])
    }
  }

  // Save City Assignments
  const handleSaveCity = async () => {
    if (!editingCityAdmin) return
    setIsUpdatingCity(true)
    try {
      const res = await updateMemberCity(editingCityAdmin.id, selectedCities)
      if (res.success) {
        setSuccessBanner(`Cities updated successfully for ${editingCityAdmin.name}.`)
        setEditingCityAdmin(null)
        // Optimistically update local list
        setAdmins((prev) =>
          prev.map((a) =>
            a.id === editingCityAdmin.id
              ? { ...a, multiple_city: selectedCities }
              : a,
          ),
        )
      } else {
        setErrorMessage(res.message)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update city.')
    } finally {
      setIsUpdatingCity(false)
    }
  }

  // Execute Status Change
  const handleConfirmStatusChange = async () => {
    if (!statusChangeTarget) return
    const { admin, nextStatus } = statusChangeTarget
    setIsUpdatingStatus(true)
    try {
      const res = await updateMemberStatus(admin.id, nextStatus)
      if (res.success) {
        setSuccessBanner(`Status of ${admin.name} updated to ${nextStatus}.`)
        setStatusChangeTarget(null)
        // Optimistically update local list
        setAdmins((prev) =>
          prev.map((a) => (a.id === admin.id ? { ...a, status: nextStatus } : a)),
        )
      } else {
        setErrorMessage(res.message)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update status.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Admin Members Management"
        description={panelDescription('/panel/admin-members')}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadData()}
            disabled={isLoading}
            className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
          >
            <RefreshCw className={isLoading ? 'size-3.5 animate-spin' : 'size-3.5'} aria-hidden />
            <span>Refresh</span>
          </Button>
        }
      />

      {successBanner && (
        <PanelBanner
          tone="success"
          message={successBanner}
          onDismiss={() => setSuccessBanner(null)}
        />
      )}

      {errorMessage && (
        <PanelBanner
          tone="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Data Table Card */}
      <PanelCard flush>
        <PanelToolbar
          search={
            <PanelSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, mobile, email, or city…"
            />
          }
        >
          <PanelFilterSelect
            id="filter-admin-status"
            label="Status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
            showStatusDots
          />
        </PanelToolbar>

        {isLoading ? (
          <PanelTableSkeleton rows={6} columns={6} />
        ) : filteredAdmins.length === 0 ? (
          <PanelEmpty
            icon={<ShieldCheck className="size-6" />}
            title="No Admin Members Found"
            description={
              searchQuery || statusFilter !== 'All'
                ? 'Try adjusting your search query or status filter.'
                : 'No admin members are currently registered in the database.'
            }
            action={
              searchQuery || statusFilter !== 'All' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('All')
                  }}
                  className="mt-4 cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <PanelTable
            caption="Regional administrators with contact details, assigned cities and status"
            head={
              <>
                <PanelTableHeadCell>Admin Name</PanelTableHeadCell>
                <PanelTableHeadCell>Contact</PanelTableHeadCell>
                <PanelTableHeadCell>Current City</PanelTableHeadCell>
                <PanelTableHeadCell>Assigned Cities</PanelTableHeadCell>
                <PanelTableHeadCell>Status</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
              </>
            }
          >
            {filteredAdmins.map((admin) => {
              const assignedCities = Array.isArray(admin.multiple_city)
                ? admin.multiple_city
                : typeof admin.multiple_city === 'string' && admin.multiple_city.trim()
                  ? admin.multiple_city.split(',').map((c) => c.trim())
                  : []

              return (
                <tr key={admin.id} className="transition-colors hover:bg-cream-50/70">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-900">
                        {admin.name.charAt(0)}
                      </span>
                      <div>
                        <p className="font-bold text-navy-900">{admin.name}</p>
                        <p className="text-[0.68rem] text-ink-400">
                          {admin.gender || 'Administrator'}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="space-y-0.5">
                      <p className="flex items-center gap-1.5 font-medium text-navy-900">
                        <Phone className="size-3 text-ink-400" aria-hidden />
                        {admin.mobile || '—'}
                      </p>
                      {admin.email && (
                        <p className="flex items-center gap-1.5 text-ink-500">
                          <Mail className="size-3 text-ink-400" aria-hidden />
                          {admin.email}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-medium text-ink-700">
                      {admin.user_current_city || '—'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex max-w-xs flex-wrap items-center gap-1">
                      {assignedCities.length > 0 ? (
                        assignedCities.map((city) => (
                          <span
                            key={city}
                            className="inline-flex items-center rounded-md border border-gold-200 bg-gold-50 px-2 py-0.5 text-[0.68rem] font-semibold text-gold-800"
                          >
                            {city}
                          </span>
                        ))
                      ) : (
                        <span className="text-[0.7rem] text-ink-400 italic">
                          None assigned
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenCityModal(admin)}
                        title="Edit City Assignments"
                        className="ml-1 inline-flex cursor-pointer items-center gap-1 text-[0.68rem] font-bold text-gold-700 transition-colors hover:text-gold-600 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none"
                      >
                        <Edit2 className="size-3" aria-hidden />
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusBadge status={admin.status} />
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusActionGroup
                      compact
                      currentStatus={admin.status}
                      onSelect={(next) =>
                        setStatusChangeTarget({
                          admin,
                          nextStatus: next as AdminMemberStatus,
                        })
                      }
                      actions={[
                        {
                          status: 'Approved',
                          label: 'Approve',
                          icon: <CircleCheck className="size-3 text-emerald-600" aria-hidden />,
                          tone: 'success',
                        },
                        {
                          status: 'Pending',
                          label: 'Pending',
                          icon: <Clock className="size-3 text-amber-600" aria-hidden />,
                          tone: 'warn',
                        },
                        {
                          status: 'Cancel',
                          label: 'Cancel',
                          icon: <CircleX className="size-3 text-maroon-600" aria-hidden />,
                          tone: 'danger',
                        },
                      ]}
                    />
                  </td>
                </tr>
              )
            })}
          </PanelTable>
        )}

        <PanelTableFooter>
          <span>
            Showing <strong>{filteredAdmins.length}</strong> of{' '}
            <strong>{admins.length}</strong> admin accounts
          </span>
        </PanelTableFooter>
      </PanelCard>

      {/* Edit Multiple City Assignment Modal */}
      <CityAssignmentModal
        isOpen={Boolean(editingCityAdmin)}
        adminName={editingCityAdmin?.name ?? ''}
        selectedCities={selectedCities}
        isSaving={isUpdatingCity}
        onToggleCity={handleToggleCity}
        onAddCustomCity={handleAddCustomCity}
        onSave={() => void handleSaveCity()}
        onClose={() => setEditingCityAdmin(null)}
      />

      {/* Status Change Confirmation Dialog */}
      {statusChangeTarget && (
        <ConfirmDialog
          isOpen={true}
          title={`Update Status to "${statusChangeTarget.nextStatus}"`}
          description={`Are you sure you want to change the status of ${statusChangeTarget.admin.name} to ${statusChangeTarget.nextStatus}?`}
          confirmText={`Yes, Set to ${statusChangeTarget.nextStatus}`}
          variant={
            statusChangeTarget.nextStatus === 'Cancel'
              ? 'danger'
              : statusChangeTarget.nextStatus === 'Approved'
                ? 'success'
                : 'primary'
          }
          isLoading={isUpdatingStatus}
          onConfirm={handleConfirmStatusChange}
          onClose={() => setStatusChangeTarget(null)}
        />
      )}
    </div>
  )
}

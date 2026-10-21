/**
 * @file src/module/super-admin/pages/AdminMembersPage.tsx
 * Admin Members management: view administrators, update city assignments (multiple_city), and update status.
 */

import { useState, useMemo } from 'react'
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
import { PanelSearch } from '../components/PanelSearch'
import { PanelToolbar } from '../components/PanelToolbar'
import { PanelEmpty, PanelError } from '../components/PanelState'
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
  useAdminMembersQuery,
  useUpdateMemberCityMutation,
  useUpdateMemberStatusMutation,
} from '../hook/useAdminMembers'
import { errorMessage } from '../hook/errors'
import type { AdminMemberStatus } from '../types'

const STATUS_FILTERS = ['All', 'Approved', 'Pending', 'Cancel'] as const

export default function AdminMembersPage() {
  const {
    data: admins = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminMembersQuery()
  const cityMutation = useUpdateMemberCityMutation()
  const statusMutation = useUpdateMemberStatusMutation()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  // Edit City Modal State
  const [editingCityAdminId, setEditingCityAdminId] = useState<number | null>(null)
  const [selectedCities, setSelectedCities] = useState<string[]>([])

  // Status Change Confirmation Modal State
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    adminId: number
    adminName: string
    nextStatus: AdminMemberStatus
  } | null>(null)

  const editingCityAdmin = useMemo(
    () => admins.find((a) => a.id === editingCityAdminId) ?? null,
    [admins, editingCityAdminId],
  )

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
  const handleOpenCityModal = (adminId: number) => {
    const admin = admins.find((a) => a.id === adminId)
    if (!admin) return

    setEditingCityAdminId(adminId)
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
  const handleSaveCity = () => {
    if (!editingCityAdmin) return
    const adminId = editingCityAdmin.id
    const adminName = editingCityAdmin.name

    cityMutation.mutate(
      {
        id: adminId,
        cities: selectedCities,
        successMessage: `Cities updated successfully for ${adminName}.`,
      },
      {
        onSuccess: () => setEditingCityAdminId(null),
      },
    )
  }

  // Execute Status Change
  const handleConfirmStatusChange = () => {
    if (!statusChangeTarget) return
    const { adminId, adminName, nextStatus } = statusChangeTarget

    statusMutation.mutate(
      {
        id: adminId,
        status: nextStatus,
        successMessage: `Status of ${adminName} updated to ${nextStatus}.`,
      },
      {
        onSuccess: () => setStatusChangeTarget(null),
      },
    )
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
            onClick={() => void refetch()}
            disabled={isFetching}
            className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
          >
            <RefreshCw className={isFetching ? 'size-3.5 animate-spin' : 'size-3.5'} aria-hidden />
            <span>Refresh</span>
          </Button>
        }
      />

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
        ) : error ? (
          <PanelError
            title="Could not load admin members"
            message={errorMessage(error, 'Failed to load the admin directory.')}
            onRetry={() => void refetch()}
          />
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
                        onClick={() => handleOpenCityModal(admin.id)}
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
                          adminId: admin.id,
                          adminName: admin.name,
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
        isSaving={cityMutation.isPending}
        onToggleCity={handleToggleCity}
        onAddCustomCity={handleAddCustomCity}
        onSave={handleSaveCity}
        onClose={() => setEditingCityAdminId(null)}
      />

      {/* Status Change Confirmation Dialog */}
      {statusChangeTarget && (
        <ConfirmDialog
          isOpen={true}
          title={`Update Status to "${statusChangeTarget.nextStatus}"`}
          description={`Are you sure you want to change the status of ${statusChangeTarget.adminName} to ${statusChangeTarget.nextStatus}?`}
          confirmText={`Yes, Set to ${statusChangeTarget.nextStatus}`}
          variant={
            statusChangeTarget.nextStatus === 'Cancel'
              ? 'danger'
              : statusChangeTarget.nextStatus === 'Approved'
                ? 'success'
                : 'primary'
          }
          isLoading={statusMutation.isPending}
          onConfirm={handleConfirmStatusChange}
          onClose={() => setStatusChangeTarget(null)}
        />
      )}
    </div>
  )
}

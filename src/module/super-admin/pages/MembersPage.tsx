/**
 * @file src/module/super-admin/pages/MembersPage.tsx
 * Matrimonial Members directory: search, filter, view complete biodata profile, and update status.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  RefreshCw,
  Eye,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { panelDescription } from '../navigation'
import { PanelPagination } from '../components/PanelPagination'
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
import { ProfileAvatar } from '../components/ProfileAvatar'
import { RowStatusSelect } from '../components/RowStatusSelect'
import { useMembersQuery } from '../hook/useMembers'
import {
  useRemoveDeviceIdMutation,
  useUpdateMemberStatusMutation,
} from '../hook/useAdminMembers'
import { errorMessage } from '../hook/errors'
import { DEFAULT_PER_PAGE, useServerSearch } from '../hook/useServerList'
import { formatDate } from '../utils/format'
import type { MemberStatus } from '../types'

const STATUS_FILTERS = ['All', 'Approved', 'Pending', 'Hold', 'Married', 'Cancel'] as const
const GENDER_FILTERS = ['All', 'Male', 'Female'] as const

const STATUS_OPTIONS = STATUS_FILTERS.filter(
  (status): status is MemberStatus => status !== 'All',
)

export default function MembersPage() {
  const navigate = useNavigate()
  const { searchInput, setSearchInput, searchTerm } = useServerSearch()
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [genderFilter, setGenderFilter] = useState<string>('All')
  const [page, setPage] = useState(1)

  const {
    records: members,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useMembersQuery({
    search: searchTerm || undefined,
    status: statusFilter === 'All' ? undefined : statusFilter,
    gender: genderFilter === 'All' ? undefined : genderFilter,
    page,
    per_page: DEFAULT_PER_PAGE,
  })
  const statusMutation = useUpdateMemberStatusMutation()
  const removeDeviceMutation = useRemoveDeviceIdMutation()

  // Profile Detail Page — the row keeps only the id; the detail page loads
  // the full record with every field and the photograph.

  // Status Change State
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    memberId: number
    memberName: string
    nextStatus: MemberStatus
  } | null>(null)

  // Remove Device State
  const [removeDeviceTarget, setRemoveDeviceTarget] = useState<{
    id: number | string
    name: string
  } | null>(null)

  const handleConfirmStatusChange = () => {
    if (!statusChangeTarget) return
    const { memberId, memberName, nextStatus } = statusChangeTarget

    statusMutation.mutate(
      {
        id: memberId,
        status: nextStatus,
        successMessage: `Member ${memberName} status updated to ${nextStatus}.`,
      },
      {
        onSuccess: () => setStatusChangeTarget(null),
      },
    )
  }

  const handleConfirmRemoveDevice = () => {
    if (!removeDeviceTarget) return
    const { id, name } = removeDeviceTarget

    removeDeviceMutation.mutate(
      {
        id,
        successMessage: `Device ID removed successfully for ${name}.`,
      },
      {
        onSuccess: () => setRemoveDeviceTarget(null),
      },
    )
  }

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Matrimonial Members Directory"
        description={panelDescription('/crm/members')}
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
            <span>Refresh List</span>
          </Button>
        }
      />

      {/* Members Table */}
      <PanelCard flush>
        <PanelToolbar
          search={
            <PanelSearch
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search name, mobile, community…"
            />
          }
        >
          <PanelFilterSelect
            id="filter-member-status"
            label="Status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
            showStatusDots
          />
          <PanelFilterSelect
            id="filter-member-gender"
            label="Gender"
            options={GENDER_FILTERS}
            value={genderFilter}
            onChange={setGenderFilter}
          />
        </PanelToolbar>

        {isLoading ? (
          <PanelTableSkeleton rows={7} columns={6} />
        ) : error ? (
          <PanelError
            title="Could not load members"
            message={errorMessage(error, 'Failed to load the member directory.')}
            onRetry={() => void refetch()}
          />
        ) : members.length === 0 ? (
          <PanelEmpty
            icon={<Users className="size-6" />}
            title="No Members Match"
            description="No profiles found matching your current search and filters."
            action={
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => {
                  setSearchInput('')
                  setStatusFilter('All')
                  setGenderFilter('All')
                }}
                className="mt-4 cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <PanelTable
            caption="Registered matrimonial members with profile details, status and moderation actions"
            head={
              <>
                <PanelTableHeadCell>Candidate Profile</PanelTableHeadCell>
                <PanelTableHeadCell>Community & Gotra</PanelTableHeadCell>
                <PanelTableHeadCell>Education & Profession</PanelTableHeadCell>
                <PanelTableHeadCell>Location</PanelTableHeadCell>
                <PanelTableHeadCell>Status</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Quick Actions</PanelTableHeadCell>
              </>
            }
          >
            {members.map((member) => (
              <tr key={member.id} className="transition-colors hover:bg-cream-50/70">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      src={member.face_image}
                      name={member.name}
                      size="lg"
                      tone="gold"
                    />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-bold text-navy-900">
                        {member.name}
                        <span className="rounded-sm bg-cream-200 px-1.5 py-0.2 text-[0.68rem] font-normal text-ink-600">
                          {member.gender}
                        </span>
                      </p>
                      <p className="text-[0.68rem] text-ink-500">
                        {member.mobile} • DOB: {formatDate(member.date_of_birth)}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <p className="font-semibold text-navy-900">
                    {member.community_name || 'Community N/A'}
                  </p>
                  <p className="text-[0.68rem] text-ink-500">
                    Gotra: {member.gotra_name || 'N/A'}
                  </p>
                </td>

                <td className="px-4 py-3.5">
                  <p className="font-medium text-navy-900">
                    {member.profession_name || 'Profession N/A'}
                  </p>
                  <p className="max-w-xs truncate text-[0.68rem] text-ink-500">
                    {member.education_name || 'Education N/A'}
                  </p>
                </td>

                <td className="px-4 py-3.5">
                  <span className="font-medium text-ink-700">
                    {member.user_current_city || '—'}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <RowStatusSelect
                    value={member.status}
                    options={STATUS_OPTIONS}
                    label={`Change status for ${member.name}`}
                    onSelect={(next) =>
                      setStatusChangeTarget({
                        memberId: member.id,
                        memberName: member.name,
                        nextStatus: next,
                      })
                    }
                  />
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      onClick={() => navigate(`/crm/members/${member.id}`)}
                      title="View Full Profile Details"
                      aria-label="View full profile details"
                      className="cursor-pointer rounded-full border-navy-200 text-navy-700 hover:bg-navy-50"
                    >
                      <Eye className="size-3.5 text-navy-700" aria-hidden />
                    </Button>

                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      onClick={() =>
                        setRemoveDeviceTarget({
                          id: member.id,
                          name: member.name,
                        })
                      }
                      title="Remove Registered Device ID"
                      aria-label="Remove registered device ID"
                      className="cursor-pointer rounded-full border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100"
                    >
                      <Smartphone className="size-3.5 text-amber-700" aria-hidden />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </PanelTable>
        )}

        <PanelTableFooter>
          <PanelPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={isFetching}
            summary={
              <span>
                Displaying <strong>{members.length}</strong> of{' '}
                <strong>{meta.total}</strong> total member profiles
              </span>
            }
          />
        </PanelTableFooter>
      </PanelCard>

      {/* Status Confirmation Modal */}
      {statusChangeTarget && (
        <ConfirmDialog
          isOpen={true}
          title={`Update Member Status to "${statusChangeTarget.nextStatus}"`}
          description={`Are you sure you want to change the status of ${statusChangeTarget.memberName} to ${statusChangeTarget.nextStatus}?`}
          confirmText={`Yes, Set Status to ${statusChangeTarget.nextStatus}`}
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

      {/* Remove Device Confirmation Dialog */}
      {removeDeviceTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Remove Device ID"
          description={`Are you sure you want to remove the registered device ID for "${removeDeviceTarget.name}"? This unlinks their current device and requires re-authentication.`}
          confirmText="Yes, Remove Device"
          cancelText="Cancel"
          variant="danger"
          isLoading={removeDeviceMutation.isPending}
          onConfirm={handleConfirmRemoveDevice}
          onClose={() => setRemoveDeviceTarget(null)}
        />
      )}
    </div>
  )
}

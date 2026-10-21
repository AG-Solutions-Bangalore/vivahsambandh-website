/**
 * @file src/module/super-admin/pages/MembersPage.tsx
 * Matrimonial Members directory: search, filter, view complete biodata profile, and update status.
 */

import { useState, useMemo } from 'react'
import {
  Users,
  RefreshCw,
  Eye,
  CircleCheck,
  CircleX,
  CirclePause,
  HeartHandshake,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { panelDescription } from '../navigation'
import { PanelModal } from '../components/PanelModal'
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
import { ProfileDetails } from '../components/ProfileDetails'
import { StatusActionGroup } from '../components/StatusActionGroup'
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

export default function MembersPage() {
  const { searchInput, setSearchInput, searchTerm } = useServerSearch()
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [genderFilter, setGenderFilter] = useState<string>('All')
  const [page, setPage] = useState(1)

  const {
    data: allMembers = [],
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

  // Profile Detail Modal State — only the id is stored so the modal always
  // renders the freshest record from the query cache.
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null)

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

  const activeProfile = useMemo(
    () => allMembers.find((m) => m.id === activeProfileId) ?? null,
    [allMembers, activeProfileId],
  )

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
        description={panelDescription('/panel/members')}
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
                  <StatusBadge status={member.status} />
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setActiveProfileId(member.id)}
                      title="View Full Profile Details"
                      className="cursor-pointer rounded-full border-navy-200 text-[0.7rem] text-navy-900 hover:bg-navy-50"
                    >
                      <Eye className="size-3 text-navy-700" aria-hidden />
                      <span>View</span>
                    </Button>

                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() =>
                        setRemoveDeviceTarget({
                          id: member.id,
                          name: member.name,
                        })
                      }
                      title="Remove Registered Device ID"
                      className="cursor-pointer gap-1 rounded-full border-amber-300 bg-amber-50/70 text-[0.7rem] font-medium text-amber-900 hover:bg-amber-100"
                    >
                      <Smartphone className="size-3 text-amber-700" aria-hidden />
                      <span>Reset Device</span>
                    </Button>

                    <StatusActionGroup
                      compact
                      currentStatus={member.status}
                      onSelect={(next) =>
                        setStatusChangeTarget({
                          memberId: member.id,
                          memberName: member.name,
                          nextStatus: next as MemberStatus,
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
                          status: 'Hold',
                          label: 'Hold',
                          icon: <CirclePause className="size-3 text-navy-600" aria-hidden />,
                          tone: 'warn',
                        },
                        {
                          status: 'Married',
                          label: 'Married',
                          icon: <HeartHandshake className="size-3 text-gold-600" aria-hidden />,
                          tone: 'info',
                        },
                        {
                          status: 'Cancel',
                          label: 'Cancel',
                          icon: <CircleX className="size-3 text-maroon-600" aria-hidden />,
                          tone: 'danger',
                        },
                      ]}
                    />
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

      {/* Member Full Biodata Profile Modal */}
      <PanelModal
        isOpen={Boolean(activeProfile)}
        title={activeProfile?.name ?? ''}
        description={
          activeProfile
            ? `${activeProfile.gender} • ${
                activeProfile.married_before && activeProfile.married_before !== 'No'
                  ? activeProfile.married_before
                  : 'Never Married'
              }`
            : undefined
        }
        icon={
          activeProfile ? (
            <ProfileAvatar
              src={activeProfile.face_image}
              name={activeProfile.name}
              size="md"
              tone="navy"
            />
          ) : null
        }
        size="lg"
        onClose={() => setActiveProfileId(null)}
        footer={
          activeProfile ? (
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setRemoveDeviceTarget({
                    id: activeProfile.id,
                    name: activeProfile.name,
                  })
                }
                className="cursor-pointer gap-1.5 rounded-full border-amber-300 bg-amber-50/70 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              >
                <Smartphone className="size-3.5 text-amber-700" aria-hidden />
                <span>Remove Device ID</span>
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-[0.7rem] font-bold text-ink-500">
                  Change status:
                </span>
                <StatusActionGroup
                  size="sm"
                  currentStatus={activeProfile.status}
                  onSelect={(next) =>
                    setStatusChangeTarget({
                      memberId: activeProfile.id,
                      memberName: activeProfile.name,
                      nextStatus: next as MemberStatus,
                    })
                  }
                  actions={[
                    { status: 'Approved', label: 'Approved', tone: 'success' },
                    { status: 'Pending', label: 'Pending', tone: 'warn' },
                    { status: 'Hold', label: 'Hold', tone: 'info' },
                    { status: 'Married', label: 'Married', tone: 'info' },
                    { status: 'Cancel', label: 'Cancel', tone: 'danger' },
                  ]}
                  className="justify-start"
                />
              </div>
            </div>
          ) : null
        }
      >
        {activeProfile ? (
          <>
            <div className="mb-4">
              <StatusBadge status={activeProfile.status} />
            </div>
            <ProfileDetails member={activeProfile} variant="full" />
          </>
        ) : null}
      </PanelModal>

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

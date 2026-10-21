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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { panelDescription } from '../navigation'
import { PanelModal } from '../components/PanelModal'
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
import { ProfileDetails } from '../components/ProfileDetails'
import { StatusActionGroup } from '../components/StatusActionGroup'
import { useMembersQuery } from '../hook/useMembers'
import { useUpdateMemberStatusMutation } from '../hook/useAdminMembers'
import { errorMessage } from '../hook/errors'
import { formatDate } from '../utils/format'
import type { MemberStatus } from '../types'

const STATUS_FILTERS = ['All', 'Approved', 'Pending', 'Hold', 'Married', 'Cancel'] as const
const GENDER_FILTERS = ['All', 'Male', 'Female'] as const

export default function MembersPage() {
  const {
    data: members = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useMembersQuery()
  const statusMutation = useUpdateMemberStatusMutation()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [genderFilter, setGenderFilter] = useState<string>('All')

  // Profile Detail Modal State — only the id is stored so the modal always
  // renders the freshest record from the query cache.
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null)

  // Status Change State
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    memberId: number
    memberName: string
    nextStatus: MemberStatus
  } | null>(null)

  const activeProfile = useMemo(
    () => members.find((m) => m.id === activeProfileId) ?? null,
    [members, activeProfileId],
  )

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mobile.includes(searchQuery) ||
        (m.user_current_city &&
          m.user_current_city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.community_name &&
          m.community_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.gotra_name &&
          m.gotra_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.profession_name &&
          m.profession_name.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus =
        statusFilter === 'All' ||
        m.status.toLowerCase() === statusFilter.toLowerCase()

      const matchesGender =
        genderFilter === 'All' ||
        (m.gender && m.gender.toLowerCase() === genderFilter.toLowerCase())

      return matchesSearch && matchesStatus && matchesGender
    })
  }, [members, searchQuery, statusFilter, genderFilter])

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
              value={searchQuery}
              onChange={setSearchQuery}
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
        ) : filteredMembers.length === 0 ? (
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
                  setSearchQuery('')
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
            {filteredMembers.map((member) => (
              <tr key={member.id} className="transition-colors hover:bg-cream-50/70">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold-200 bg-gold-100 text-xs font-bold text-gold-900">
                      {member.name.charAt(0)}
                    </span>
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
          <span>
            Displaying <strong>{filteredMembers.length}</strong> of{' '}
            <strong>{members.length}</strong> total member profiles
          </span>
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
          <span className="font-display text-lg font-bold text-navy-950">
            {activeProfile?.name.charAt(0)}
          </span>
        }
        size="lg"
        onClose={() => setActiveProfileId(null)}
        footer={
          activeProfile ? (
            <>
              <span className="mr-auto text-[0.7rem] font-bold text-ink-500">
                Change status to
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
            </>
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
    </div>
  )
}

/**
 * @file src/module/super-admin/pages/PendingMembersPage.tsx
 * Moderation queue for reviewing and approving newly registered matrimonial members.
 */

import { useState, useMemo } from 'react'
import {
  UserPlus,
  RefreshCw,
  Eye,
  CircleCheck,
  CircleX,
  CirclePause,
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
import { ProfileAvatar } from '../components/ProfileAvatar'
import { ProfileDetails } from '../components/ProfileDetails'
import { StatusActionGroup } from '../components/StatusActionGroup'
import { usePendingMembersQuery } from '../hook/useMembers'
import { useUpdateMemberStatusMutation } from '../hook/useAdminMembers'
import { errorMessage } from '../hook/errors'
import { DEFAULT_PER_PAGE, useServerSearch } from '../hook/useServerList'
import { formatDate } from '../utils/format'
import type { MemberStatus } from '../types'

export default function PendingMembersPage() {
  const { searchInput, setSearchInput, searchTerm } = useServerSearch()
  const [page, setPage] = useState(1)

  const {
    data: allPendingMembers = [],
    records: pendingMembers,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePendingMembersQuery({
    search: searchTerm || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
  })
  const statusMutation = useUpdateMemberStatusMutation()

  // Profile Drawer / Modal — only the id is kept so the modal always renders
  // the freshest record from the query cache.
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null)

  // Decision Modal
  const [decisionTarget, setDecisionTarget] = useState<{
    memberId: number
    memberName: string
    nextStatus: MemberStatus
  } | null>(null)

  const activeProfile = useMemo(
    () => allPendingMembers.find((m) => m.id === activeProfileId) ?? null,
    [allPendingMembers, activeProfileId],
  )

  const handleConfirmDecision = () => {
    if (!decisionTarget) return
    const { memberId, memberName, nextStatus } = decisionTarget

    statusMutation.mutate(
      {
        id: memberId,
        status: nextStatus,
        successMessage: `Profile for ${memberName} marked as ${nextStatus}.`,
      },
      {
        onSuccess: () => {
          setDecisionTarget(null)
          setActiveProfileId(null)
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Pending Member Profiles"
        description={panelDescription('/panel/pending-members')}
        chip={
          <span className="rounded-full border border-gold-300 bg-gold-50 px-2.5 py-0.5 text-xs font-bold text-gold-800">
            {pendingMembers.length} Awaiting Approval
          </span>
        }
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
            <span>Refresh Queue</span>
          </Button>
        }
      />

      {/* Table */}
      <PanelCard flush>
        <PanelToolbar
          search={
            <PanelSearch
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search candidate name, mobile, community…"
            />
          }
        />

        {isLoading ? (
          <PanelTableSkeleton rows={7} columns={6} />
        ) : error ? (
          <PanelError
            title="Could not load the moderation queue"
            message={errorMessage(error, 'Failed to load pending member profiles.')}
            onRetry={() => void refetch()}
          />
        ) : pendingMembers.length === 0 ? (
          <PanelEmpty
            icon={<UserPlus className="size-6" />}
            title="Queue is Clear!"
            description="There are no pending member profiles awaiting moderation at this time."
          />
        ) : (
          <PanelTable
            caption="Member profiles awaiting verification with moderation actions"
            head={
              <>
                <PanelTableHeadCell>Candidate Profile</PanelTableHeadCell>
                <PanelTableHeadCell>Community & Gotra</PanelTableHeadCell>
                <PanelTableHeadCell>Education & Career</PanelTableHeadCell>
                <PanelTableHeadCell>Location</PanelTableHeadCell>
                <PanelTableHeadCell>Status</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Moderation Actions</PanelTableHeadCell>
              </>
            }
          >
            {pendingMembers.map((member) => (
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
                  <p className="text-[0.68rem] text-ink-500">
                    {member.education_name || 'Education N/A'}
                  </p>
                </td>

                <td className="px-4 py-3.5">
                  <span className="font-medium text-ink-700">
                    {member.user_current_city || '—'}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <StatusBadge status="Pending" />
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      onClick={() => setActiveProfileId(member.id)}
                      title="Inspect full biodata"
                      aria-label="Inspect full biodata"
                      className="cursor-pointer rounded-full border-navy-200 text-navy-700 hover:bg-navy-50"
                    >
                      <Eye className="size-3.5 text-navy-700" aria-hidden />
                    </Button>

                    <StatusActionGroup
                      compact
                      currentStatus="Pending"
                      onSelect={(next) =>
                        setDecisionTarget({
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
                          status: 'Cancel',
                          label: 'Reject',
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
                Pending verification: <strong>{meta.total}</strong> profiles
              </span>
            }
          />
        </PanelTableFooter>
      </PanelCard>

      {/* Profile Inspection Modal */}
      <PanelModal
        isOpen={Boolean(activeProfile)}
        title={activeProfile?.name ?? ''}
        description={
          activeProfile
            ? `${activeProfile.gender} • Registered for review`
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
            <StatusActionGroup
              size="sm"
              currentStatus="Pending"
              onSelect={(next) =>
                setDecisionTarget({
                  memberId: activeProfile.id,
                  memberName: activeProfile.name,
                  nextStatus: next as MemberStatus,
                })
              }
              actions={[
                { status: 'Cancel', label: 'Reject Profile', tone: 'danger' },
                { status: 'Hold', label: 'Put on Hold', tone: 'warn' },
                { status: 'Approved', label: 'Approve & Publish', tone: 'success' },
              ]}
            />
          ) : null
        }
      >
        {activeProfile ? (
          <>
            <div className="mb-4">
              <StatusBadge status="Pending" />
            </div>
            <ProfileDetails member={activeProfile} />
          </>
        ) : null}
      </PanelModal>

      {/* Decision Confirmation Modal */}
      {decisionTarget && (
        <ConfirmDialog
          isOpen={true}
          title={
            decisionTarget.nextStatus === 'Approved'
              ? `Approve Profile: ${decisionTarget.memberName}`
              : `Set Status to ${decisionTarget.nextStatus} for ${decisionTarget.memberName}`
          }
          description={
            decisionTarget.nextStatus === 'Approved'
              ? `This will publish and verify the profile of ${decisionTarget.memberName} on the VivahSambandh platform, making it discoverable by matching candidates.`
              : `Are you sure you want to mark this candidate profile as ${decisionTarget.nextStatus}?`
          }
          confirmText={
            decisionTarget.nextStatus === 'Approved'
              ? 'Confirm & Publish Profile'
              : `Confirm ${decisionTarget.nextStatus}`
          }
          variant={
            decisionTarget.nextStatus === 'Cancel'
              ? 'danger'
              : decisionTarget.nextStatus === 'Approved'
                ? 'success'
                : 'primary'
          }
          isLoading={statusMutation.isPending}
          onConfirm={handleConfirmDecision}
          onClose={() => setDecisionTarget(null)}
        />
      )}
    </div>
  )
}

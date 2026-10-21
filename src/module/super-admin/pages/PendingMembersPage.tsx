/**
 * @file src/module/super-admin/pages/PendingMembersPage.tsx
 * Moderation queue for reviewing and approving newly registered matrimonial members.
 */

import { useEffect, useState, useMemo } from 'react'
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
import { PanelBanner } from '../components/PanelBanner'
import { PanelModal } from '../components/PanelModal'
import { PanelSearch } from '../components/PanelSearch'
import { PanelToolbar } from '../components/PanelToolbar'
import { PanelEmpty } from '../components/PanelState'
import { PanelTableSkeleton } from '../components/PanelSkeleton'
import {
  PanelTable,
  PanelTableFooter,
  PanelTableHeadCell,
} from '../components/PanelTable'
import { ProfileDetails } from '../components/ProfileDetails'
import { StatusActionGroup } from '../components/StatusActionGroup'
import { fetchPendingMembers, updateMemberStatus } from '../services/adminApi'
import { formatDate } from '../utils/format'
import type { Member, MemberStatus } from '../types'

export default function PendingMembersPage() {
  const [pendingMembers, setPendingMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Profile Drawer / Modal
  const [activeProfile, setActiveProfile] = useState<Member | null>(null)

  // Decision Modal
  const [decisionTarget, setDecisionTarget] = useState<{
    member: Member
    nextStatus: MemberStatus
  } | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetchPendingMembers()
      setPendingMembers(res.data)
      if (res.error) setErrorMessage(res.error)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load pending members.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filtered = useMemo(() => {
    return pendingMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mobile.includes(searchQuery) ||
        (m.community_name &&
          m.community_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.user_current_city &&
          m.user_current_city.toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }, [pendingMembers, searchQuery])

  const handleConfirmDecision = async () => {
    if (!decisionTarget) return
    const { member, nextStatus } = decisionTarget
    setIsUpdatingStatus(true)
    try {
      const res = await updateMemberStatus(member.id, nextStatus)
      if (res.success) {
        setSuccessBanner(`Profile for ${member.name} marked as ${nextStatus}.`)
        setDecisionTarget(null)
        if (activeProfile?.id === member.id) {
          setActiveProfile(null)
        }
        // Remove from pending list
        setPendingMembers((prev) => prev.filter((m) => m.id !== member.id))
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
            onClick={() => void loadData()}
            disabled={isLoading}
            className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
          >
            <RefreshCw className={isLoading ? 'size-3.5 animate-spin' : 'size-3.5'} aria-hidden />
            <span>Refresh Queue</span>
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

      {/* Table */}
      <PanelCard flush>
        <PanelToolbar
          search={
            <PanelSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search candidate name, mobile, community…"
            />
          }
        />

        {isLoading ? (
          <PanelTableSkeleton rows={7} columns={6} />
        ) : filtered.length === 0 ? (
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
            {filtered.map((member) => (
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
                      size="xs"
                      variant="outline"
                      onClick={() => setActiveProfile(member)}
                      title="Inspect full biodata"
                      className="cursor-pointer rounded-full border-navy-200 text-[0.7rem] text-navy-900 hover:bg-navy-50"
                    >
                      <Eye className="size-3 text-navy-700" aria-hidden />
                      <span>Inspect</span>
                    </Button>

                    <StatusActionGroup
                      compact
                      currentStatus="Pending"
                      onSelect={(next) =>
                        setDecisionTarget({
                          member,
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
          <span>
            Pending verification: <strong>{filtered.length}</strong> profiles
          </span>
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
          <span className="font-display text-lg font-bold text-navy-950">
            {activeProfile?.name.charAt(0)}
          </span>
        }
        size="lg"
        onClose={() => setActiveProfile(null)}
        footer={
          activeProfile ? (
            <StatusActionGroup
              size="sm"
              currentStatus="Pending"
              onSelect={(next) =>
                setDecisionTarget({
                  member: activeProfile,
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
              ? `Approve Profile: ${decisionTarget.member.name}`
              : `Set Status to ${decisionTarget.nextStatus} for ${decisionTarget.member.name}`
          }
          description={
            decisionTarget.nextStatus === 'Approved'
              ? `This will publish and verify the profile of ${decisionTarget.member.name} on the VivahSambandh platform, making it discoverable by matching candidates.`
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
          isLoading={isUpdatingStatus}
          onConfirm={handleConfirmDecision}
          onClose={() => setDecisionTarget(null)}
        />
      )}
    </div>
  )
}

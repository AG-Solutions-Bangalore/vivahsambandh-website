/**
 * @file src/module/super-admin/pages/PendingMembersPage.tsx
 * Moderation queue for reviewing and approving newly registered matrimonial members.
 */

import { useEffect, useState, useMemo } from 'react'
import {
  UserPlus,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  PauseCircle,
  AlertCircle,
  X,
  MapPin,
  Briefcase,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { fetchPendingMembers, updateMemberStatus } from '../services/adminApi'
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
        (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
      {/* Title & Queue Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
              Pending Member Profiles
            </h2>
            <span className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-bold border border-purple-200">
              {pendingMembers.length} Awaiting Approval
            </span>
          </div>
          <p className="text-xs text-ink-500 mt-0.5">
            Verify newly submitted matrimonials, validate background claims, and approve profile activation.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void loadData()}
          disabled={isLoading}
          className="rounded-full text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </Button>
      </div>

      {/* Success banner */}
      {successBanner && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Error banner */}
      {errorMessage && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 p-1"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="rounded-2xl bg-white p-3 border border-cream-200/90 shadow-xs">
        <div className="relative">
          <Search className="absolute inset-y-0 left-3 my-auto size-4 text-ink-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search pending members by candidate name, mobile, community, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9.5 text-xs bg-cream-50/50 border-cream-200 rounded-xl"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-cream-200/90 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-cream-100 text-navy-800 animate-spin mb-3">
              <RefreshCw className="size-5" />
            </div>
            <p className="text-xs font-semibold text-ink-500">
              Loading pending profile queue...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <UserPlus className="mx-auto size-12 text-purple-400 mb-2" />
            <p className="text-sm font-bold text-navy-900">Queue is Clear!</p>
            <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto">
              There are no pending member profiles awaiting moderation at this time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50/80 text-[0.7rem] uppercase font-bold tracking-wider text-ink-500">
                  <th className="py-3.5 px-4">Candidate Profile</th>
                  <th className="py-3.5 px-4">Community & Gotra</th>
                  <th className="py-3.5 px-4">Education & Career</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filtered.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-cream-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-purple-100 text-purple-900 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-navy-900 flex items-center gap-1.5">
                            {member.name}
                            <span className="text-[0.68rem] px-1.5 py-0.2 rounded-sm bg-cream-200 font-normal text-ink-600">
                              {member.gender}
                            </span>
                          </p>
                          <p className="text-[0.68rem] text-ink-500">
                            {member.mobile} • Age/DOB: {member.date_of_birth || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-navy-900">
                        {member.community_name || 'Community N/A'}
                      </p>
                      <p className="text-[0.68rem] text-ink-500">
                        Gotra: {member.gotra_name || 'N/A'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-navy-900">
                        {member.profession_name || 'Profession N/A'}
                      </p>
                      <p className="text-[0.68rem] text-ink-500">
                        {member.education_name || 'Education N/A'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-ink-700 flex items-center gap-1">
                        <MapPin className="size-3 text-ink-400" />
                        {member.user_current_city || '—'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status="Pending" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => setActiveProfile(member)}
                          className="rounded-full text-navy-900 border-navy-200 hover:bg-navy-50 text-[0.7rem] px-2.5 cursor-pointer"
                        >
                          <Eye className="size-3 text-navy-700" />
                          <span>Inspect</span>
                        </Button>

                        <Button
                          type="button"
                          size="xs"
                          onClick={() =>
                            setDecisionTarget({ member, nextStatus: 'Approved' })
                          }
                          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[0.7rem] px-2.5 shadow-xs cursor-pointer"
                        >
                          <CheckCircle className="size-3" />
                          <span>Approve</span>
                        </Button>

                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            setDecisionTarget({ member, nextStatus: 'Hold' })
                          }
                          className="rounded-full text-blue-700 border-blue-300 hover:bg-blue-50 text-[0.7rem] px-2 cursor-pointer"
                          title="Place on Hold"
                        >
                          <PauseCircle className="size-3" />
                        </Button>

                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            setDecisionTarget({ member, nextStatus: 'Cancel' })
                          }
                          className="rounded-full text-rose-700 border-rose-300 hover:bg-rose-50 text-[0.7rem] px-2 cursor-pointer"
                          title="Reject / Cancel Profile"
                        >
                          <XCircle className="size-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-cream-200 px-4 py-3 bg-cream-50/50 text-[0.7rem] text-ink-500">
          <span>
            Pending verification: <strong>{filtered.length}</strong> profiles
          </span>
          <span>Endpoint: /getPendingMember</span>
        </div>
      </div>

      {/* Profile Inspection Modal */}
      {activeProfile && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-cream-200">
            <button
              type="button"
              onClick={() => setActiveProfile(null)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-ink-400 hover:bg-cream-100 hover:text-ink-700 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-cream-200 pb-5">
              <div className="size-16 rounded-2xl bg-gradient-to-tr from-gold-500 to-gold-400 p-0.5 shadow-gold flex items-center justify-center text-navy-950 font-bold font-display text-2xl">
                {activeProfile.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-display text-navy-900">
                    {activeProfile.name}
                  </h3>
                  <StatusBadge status="Pending" />
                </div>
                <p className="text-xs text-ink-500 mt-1">
                  Candidate ID #{activeProfile.id} • {activeProfile.gender} • Registered for Review
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-6 text-xs">
              <div>
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[0.7rem] text-gold-700 mb-2 flex items-center gap-1.5">
                  <User className="size-3.5" />
                  Basic Bio Data
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl bg-cream-50/70 p-4 border border-cream-200/80">
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Date of Birth</span>
                    <span className="font-semibold text-navy-900">{activeProfile.date_of_birth || '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Time / Place</span>
                    <span className="font-semibold text-navy-900">
                      {activeProfile.time_of_birth || '—'} ({activeProfile.place_of_birth || '—'})
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Community / Gotra</span>
                    <span className="font-semibold text-navy-900">
                      {activeProfile.community_name || '—'} / {activeProfile.gotra_name || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Manglik Status</span>
                    <span className="font-semibold text-navy-900">{activeProfile.is_manglik || 'No'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Marital History</span>
                    <span className="font-semibold text-navy-900">{activeProfile.married_before || 'Never Married'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Height</span>
                    <span className="font-semibold text-navy-900">
                      {activeProfile.height_feet ? `${activeProfile.height_feet}' ${activeProfile.height_inch || 0}"` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[0.7rem] text-gold-700 mb-2 flex items-center gap-1.5">
                  <Briefcase className="size-3.5" />
                  Career & Background
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl bg-cream-50/70 p-4 border border-cream-200/80">
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Qualification</span>
                    <span className="font-semibold text-navy-900">{activeProfile.education_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Profession</span>
                    <span className="font-semibold text-navy-900">{activeProfile.profession_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Annual Income</span>
                    <span className="font-semibold text-navy-900">
                      {activeProfile.annual_income ? `₹ ${activeProfile.annual_income} / Yr` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Mobile</span>
                    <span className="font-semibold text-navy-900">{activeProfile.mobile}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">City</span>
                    <span className="font-semibold text-navy-900">{activeProfile.user_current_city || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-cream-200 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDecisionTarget({ member: activeProfile, nextStatus: 'Cancel' })}
                className="rounded-full text-rose-700 border-rose-300 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
              >
                Reject Profile
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDecisionTarget({ member: activeProfile, nextStatus: 'Hold' })}
                className="rounded-full text-blue-700 border-blue-300 hover:bg-blue-50 text-xs font-semibold cursor-pointer"
              >
                Put on Hold
              </Button>
              <Button
                type="button"
                onClick={() => setDecisionTarget({ member: activeProfile, nextStatus: 'Approved' })}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 cursor-pointer"
              >
                Approve & Publish
              </Button>
            </div>
          </div>
        </div>
      )}

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

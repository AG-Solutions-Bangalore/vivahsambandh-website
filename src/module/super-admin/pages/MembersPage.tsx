/**
 * @file src/module/super-admin/pages/MembersPage.tsx
 * Matrimonial Members directory: search, filter, view complete biodata profile, and update status.
 */

import { useEffect, useState, useMemo } from 'react'
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  PauseCircle,
  HeartHandshake,
  AlertCircle,
  X,
  MapPin,
  GraduationCap,
  Home,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { fetchMembers, updateMemberStatus } from '../services/adminApi'
import type { Member, MemberStatus } from '../types'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [genderFilter, setGenderFilter] = useState<string>('All')

  // Profile Detail Modal State
  const [activeProfile, setActiveProfile] = useState<Member | null>(null)

  // Status Change State
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    member: Member
    nextStatus: MemberStatus
  } | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetchMembers()
      setMembers(res.data)
      if (res.error) setErrorMessage(res.error)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load members.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mobile.includes(searchQuery) ||
        (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
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

  const handleConfirmStatusChange = async () => {
    if (!statusChangeTarget) return
    const { member, nextStatus } = statusChangeTarget
    setIsUpdatingStatus(true)
    try {
      const res = await updateMemberStatus(member.id, nextStatus)
      if (res.success) {
        setSuccessBanner(`Member ${member.name} status updated to ${nextStatus}.`)
        setStatusChangeTarget(null)
        // If modal was open for this member, update it as well
        if (activeProfile?.id === member.id) {
          setActiveProfile((prev) => (prev ? { ...prev, status: nextStatus } : null))
        }
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m)),
        )
      } else {
        setErrorMessage(res.message)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update member status.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
            Matrimonial Members Directory
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Browse registered candidates, examine verification biodatas, and update marital/approval statuses.
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
          <span>Refresh List</span>
        </Button>
      </div>

      {/* Success Notification */}
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

      {/* Error Banner */}
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 rounded-2xl bg-white p-3.5 border border-cream-200/90 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-3 my-auto size-4 text-ink-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by name, contact, community, gotra, profession, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9.5 text-xs bg-cream-50/50 border-cream-200 rounded-xl"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-[0.68rem] uppercase font-bold text-ink-400 shrink-0 mr-1">
            Status:
          </span>
          {['All', 'Approved', 'Pending', 'Hold', 'Married', 'Cancel'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-navy-900 text-white'
                  : 'bg-cream-100 text-ink-600 hover:bg-cream-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Gender Filter */}
        <div className="flex items-center gap-1.5 border-t lg:border-t-0 lg:border-l border-cream-200 pt-2 lg:pt-0 lg:pl-3">
          <span className="text-[0.68rem] uppercase font-bold text-ink-400 shrink-0">
            Gender:
          </span>
          {['All', 'Male', 'Female'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenderFilter(g)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                genderFilter === g
                  ? 'bg-gold-500 text-navy-950 font-bold'
                  : 'bg-cream-100 text-ink-600 hover:bg-cream-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-2xl border border-cream-200/90 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-cream-100 text-navy-800 animate-spin mb-3">
              <RefreshCw className="size-5" />
            </div>
            <p className="text-xs font-semibold text-ink-500">
              Loading members directory...
            </p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto size-12 text-ink-300 mb-2" />
            <p className="text-sm font-bold text-navy-900">No Members Match</p>
            <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto">
              No profiles found matching your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50/80 text-[0.7rem] uppercase font-bold tracking-wider text-ink-500">
                  <th className="py-3.5 px-4">Candidate Profile</th>
                  <th className="py-3.5 px-4">Community & Gotra</th>
                  <th className="py-3.5 px-4">Education & Profession</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-cream-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gold-100 text-gold-900 font-bold text-xs flex items-center justify-center shrink-0 border border-gold-200">
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
                            {member.mobile} • DOB: {member.date_of_birth || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-navy-900">
                        {member.community_name || 'Community N/A'}
                      </p>
                      <p className="text-[0.68rem] text-ink-500">
                        Gotra: {member.gotra_name || 'N/A'}{' '}
                        {member.is_manglik === 'Yes' ? '• Manglik' : ''}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-navy-900">
                        {member.profession_name || 'Profession N/A'}
                      </p>
                      <p className="text-[0.68rem] text-ink-500 truncate max-w-xs">
                        {member.education_name || 'Education N/A'}{' '}
                        {member.annual_income ? `• ₹${member.annual_income}/yr` : ''}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-ink-700 flex items-center gap-1">
                        <MapPin className="size-3 text-ink-400" />
                        {member.user_current_city || '—'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={member.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => setActiveProfile(member)}
                          className="rounded-full text-navy-900 border-navy-200 hover:bg-navy-50 text-[0.7rem] px-2.5 cursor-pointer"
                          title="View Full Profile Details"
                        >
                          <Eye className="size-3 text-navy-700" />
                          <span>View</span>
                        </Button>

                        {/* Status Change Dropdown / Direct Options */}
                        <div className="flex items-center gap-1">
                          {member.status !== 'Approved' && (
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                setStatusChangeTarget({ member, nextStatus: 'Approved' })
                              }
                              className="rounded-full text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-[0.7rem] px-2 cursor-pointer"
                              title="Approve Member"
                            >
                              <CheckCircle className="size-3 text-emerald-600" />
                            </Button>
                          )}

                          {member.status !== 'Hold' && (
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                setStatusChangeTarget({ member, nextStatus: 'Hold' })
                              }
                              className="rounded-full text-blue-700 border-blue-300 hover:bg-blue-50 text-[0.7rem] px-2 cursor-pointer"
                              title="Put on Hold"
                            >
                              <PauseCircle className="size-3 text-blue-600" />
                            </Button>
                          )}

                          {member.status !== 'Married' && (
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                setStatusChangeTarget({ member, nextStatus: 'Married' })
                              }
                              className="rounded-full text-purple-700 border-purple-300 hover:bg-purple-50 text-[0.7rem] px-2 cursor-pointer"
                              title="Mark Married"
                            >
                              <HeartHandshake className="size-3 text-purple-600" />
                            </Button>
                          )}

                          {member.status !== 'Cancel' && (
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                setStatusChangeTarget({ member, nextStatus: 'Cancel' })
                              }
                              className="rounded-full text-rose-700 border-rose-300 hover:bg-rose-50 text-[0.7rem] px-2 cursor-pointer"
                              title="Cancel Profile"
                            >
                              <XCircle className="size-3 text-rose-600" />
                            </Button>
                          )}
                        </div>
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
            Displaying <strong>{filteredMembers.length}</strong> of{' '}
            <strong>{members.length}</strong> total member profiles
          </span>
          <span>Endpoint: /member • Status: /members/:id/status</span>
        </div>
      </div>

      {/* Member Full Biodata Profile Modal */}
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

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-cream-200 pb-5">
              <div className="size-16 rounded-2xl bg-gradient-to-tr from-gold-500 to-gold-400 p-0.5 shadow-gold flex items-center justify-center text-navy-950 font-bold font-display text-2xl">
                {activeProfile.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold font-display text-navy-900">
                    {activeProfile.name}
                  </h3>
                  <StatusBadge status={activeProfile.status} />
                </div>
                <p className="text-xs text-ink-500 mt-1">
                  Profile ID #{activeProfile.id} • {activeProfile.gender} • Marital Status:{' '}
                  {activeProfile.married_before || 'Never Married'}
                </p>
              </div>
            </div>

            {/* Profile Sections Grid */}
            <div className="mt-6 space-y-6 text-xs">
              {/* Personal Details */}
              <div>
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[0.7rem] text-gold-700 mb-2 flex items-center gap-1.5">
                  <User className="size-3.5" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl bg-cream-50/70 p-4 border border-cream-200/80">
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Date of Birth</span>
                    <span className="font-semibold text-navy-900">{activeProfile.date_of_birth || '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Time / Place of Birth</span>
                    <span className="font-semibold text-navy-900">
                      {activeProfile.time_of_birth || '—'} ({activeProfile.place_of_birth || '—'})
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Height</span>
                    <span className="font-semibold text-navy-900">
                      {activeProfile.height_feet ? `${activeProfile.height_feet}' ${activeProfile.height_inch || 0}"` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Community</span>
                    <span className="font-semibold text-navy-900">{activeProfile.community_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Gotra</span>
                    <span className="font-semibold text-navy-900">{activeProfile.gotra_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Manglik</span>
                    <span className="font-semibold text-navy-900">{activeProfile.is_manglik || 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Education & Career */}
              <div>
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[0.7rem] text-gold-700 mb-2 flex items-center gap-1.5">
                  <GraduationCap className="size-3.5" />
                  Education & Profession
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl bg-cream-50/70 p-4 border border-cream-200/80">
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Education Qualification</span>
                    <span className="font-semibold text-navy-900">{activeProfile.education_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Profession</span>
                    <span className="font-semibold text-navy-900">{activeProfile.profession_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Company / Workplace</span>
                    <span className="font-semibold text-navy-900">{activeProfile.company_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Annual Income</span>
                    <span className="font-semibold text-navy-900">
                      {activeProfile.annual_income ? `₹ ${activeProfile.annual_income} / Year` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Family & Contact */}
              <div>
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[0.7rem] text-gold-700 mb-2 flex items-center gap-1.5">
                  <Home className="size-3.5" />
                  Family & Contact Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl bg-cream-50/70 p-4 border border-cream-200/80">
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Father&apos;s Name</span>
                    <span className="font-semibold text-navy-900">{activeProfile.father_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Mother&apos;s Name</span>
                    <span className="font-semibold text-navy-900">{activeProfile.mother_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Contact Mobile</span>
                    <span className="font-semibold text-navy-900">{activeProfile.mobile}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Alternate Contact</span>
                    <span className="font-semibold text-navy-900">{activeProfile.alternate_mobile_no || '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Current City</span>
                    <span className="font-semibold text-navy-900">{activeProfile.user_current_city || '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block text-[0.68rem]">Residential Address</span>
                    <span className="font-semibold text-navy-900">{activeProfile.user_address || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Status Change Controls */}
            <div className="mt-8 pt-4 border-t border-cream-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[0.7rem] font-bold text-ink-500">
                Change Status to:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {(['Approved', 'Pending', 'Hold', 'Married', 'Cancel'] as MemberStatus[]).map((st) => (
                  <Button
                    key={st}
                    type="button"
                    size="xs"
                    variant={activeProfile.status === st ? 'default' : 'outline'}
                    onClick={() =>
                      setStatusChangeTarget({ member: activeProfile, nextStatus: st })
                    }
                    disabled={activeProfile.status === st}
                    className="rounded-full text-xs font-semibold cursor-pointer"
                  >
                    {st}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {statusChangeTarget && (
        <ConfirmDialog
          isOpen={true}
          title={`Update Member Status to "${statusChangeTarget.nextStatus}"`}
          description={`Are you sure you want to change the status of ${statusChangeTarget.member.name} to ${statusChangeTarget.nextStatus}?`}
          confirmText={`Yes, Set Status to ${statusChangeTarget.nextStatus}`}
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

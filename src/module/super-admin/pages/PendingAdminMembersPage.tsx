/**
 * @file src/module/super-admin/pages/PendingAdminMembersPage.tsx
 * Dedicated queue for reviewing, assigning cities, and approving pending admin members.
 */

import { useEffect, useState, useMemo } from 'react'
import {
  UserCheck,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  MapPin,
  AlertCircle,
  Phone,
  Mail,
  X,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import {
  fetchPendingAdminMembers,
  updateMemberCity,
  updateMemberStatus,
} from '../services/adminApi'
import type { AdminMember, AdminMemberStatus } from '../types'
import { CITIES } from '@/module/home/data/cities'

export default function PendingAdminMembersPage() {
  const [pendingAdmins, setPendingAdmins] = useState<AdminMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // City Assignment State
  const [editingCityAdmin, setEditingCityAdmin] = useState<AdminMember | null>(null)
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [customCityInput, setCustomCityInput] = useState('')
  const [isUpdatingCity, setIsUpdatingCity] = useState(false)

  // Status Action State
  const [actionTarget, setActionTarget] = useState<{
    admin: AdminMember
    nextStatus: AdminMemberStatus
  } | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetchPendingAdminMembers()
      setPendingAdmins(res.data)
      if (res.error) setErrorMessage(res.error)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load pending admin members.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filtered = useMemo(() => {
    return pendingAdmins.filter(
      (a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.mobile.includes(searchQuery) ||
        (a.email && a.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.user_current_city &&
          a.user_current_city.toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }, [pendingAdmins, searchQuery])

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
    setCustomCityInput('')
  }

  const handleToggleCity = (cityName: string) => {
    setSelectedCities((prev) =>
      prev.includes(cityName)
        ? prev.filter((c) => c !== cityName)
        : [...prev, cityName],
    )
  }

  const handleAddCustomCity = () => {
    const val = customCityInput.trim()
    if (val && !selectedCities.includes(val)) {
      setSelectedCities((prev) => [...prev, val])
      setCustomCityInput('')
    }
  }

  const handleSaveCity = async () => {
    if (!editingCityAdmin) return
    setIsUpdatingCity(true)
    try {
      const res = await updateMemberCity(editingCityAdmin.id, selectedCities)
      if (res.success) {
        setSuccessBanner(`Cities updated for ${editingCityAdmin.name}.`)
        setEditingCityAdmin(null)
        setPendingAdmins((prev) =>
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
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update cities.')
    } finally {
      setIsUpdatingCity(false)
    }
  }

  const handleConfirmStatus = async () => {
    if (!actionTarget) return
    const { admin, nextStatus } = actionTarget
    setIsUpdatingStatus(true)
    try {
      const res = await updateMemberStatus(admin.id, nextStatus)
      if (res.success) {
        setSuccessBanner(`Admin ${admin.name} has been ${nextStatus}.`)
        setActionTarget(null)
        // Remove from pending queue
        setPendingAdmins((prev) => prev.filter((a) => a.id !== admin.id))
      } else {
        setErrorMessage(res.message)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update status.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const allCityOptions = CITIES.map((c) => c.defaultName)

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
              Pending Admin Member Approvals
            </h2>
            <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold border border-amber-200">
              {pendingAdmins.length} Awaiting Review
            </span>
          </div>
          <p className="text-xs text-ink-500 mt-0.5">
            Admin applications submitted via registration that require Super Admin vetting and city allocation.
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
            placeholder="Search pending applications by name, mobile, city..."
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
              Fetching pending admin applications...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <UserCheck className="mx-auto size-12 text-emerald-500/70 mb-2" />
            <p className="text-sm font-bold text-navy-900">
              No Pending Admin Members
            </p>
            <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'No pending applications match your search query.'
                : 'All admin registration applications have been processed and reviewed.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50/80 text-[0.7rem] uppercase font-bold tracking-wider text-ink-500">
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Current Location</th>
                  <th className="py-3.5 px-4">City Allocation</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Decision Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filtered.map((admin) => {
                  const assignedCities = Array.isArray(admin.multiple_city)
                    ? admin.multiple_city
                    : typeof admin.multiple_city === 'string' && admin.multiple_city.trim()
                    ? admin.multiple_city.split(',').map((c) => c.trim())
                    : []

                  return (
                    <tr
                      key={admin.id}
                      className="hover:bg-cream-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                            {admin.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-navy-900">{admin.name}</p>
                            <p className="text-[0.68rem] text-ink-400">
                              App ID: #{admin.id} {admin.gender ? `• ${admin.gender}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-navy-900 flex items-center gap-1.5">
                            <Phone className="size-3 text-ink-400" />
                            {admin.mobile}
                          </p>
                          {admin.email && (
                            <p className="text-ink-500 flex items-center gap-1.5">
                              <Mail className="size-3 text-ink-400" />
                              {admin.email}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-ink-700">
                          {admin.user_current_city || '—'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                          {assignedCities.length > 0 ? (
                            assignedCities.map((city) => (
                              <span
                                key={city}
                                className="inline-flex items-center rounded-md bg-cream-100 border border-cream-200/80 px-2 py-0.5 text-[0.68rem] font-semibold text-ink-700"
                              >
                                {city}
                              </span>
                            ))
                          ) : (
                            <span className="text-amber-700 font-medium text-[0.7rem] bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                              No cities set
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenCityModal(admin)}
                            className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-gold-600 hover:text-gold-700 ml-1 cursor-pointer"
                          >
                            <MapPin className="size-3" />
                            <span>Set Cities</span>
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status="Pending" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              setActionTarget({ admin, nextStatus: 'Approved' })
                            }
                            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 shadow-xs cursor-pointer"
                          >
                            <CheckCircle className="size-3.5" />
                            <span>Approve</span>
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setActionTarget({ admin, nextStatus: 'Cancel' })
                            }
                            className="rounded-full text-rose-700 border-rose-300 hover:bg-rose-50 text-xs font-semibold px-3 cursor-pointer"
                          >
                            <XCircle className="size-3.5" />
                            <span>Reject</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-cream-200 px-4 py-3 bg-cream-50/50 text-[0.7rem] text-ink-500">
          <span>
            Total pending: <strong>{filtered.length}</strong> applications
          </span>
          <span>Endpoint: /getPendingAdminMember</span>
        </div>
      </div>

      {/* City Assignment Modal */}
      {editingCityAdmin && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-cream-200">
            <button
              type="button"
              onClick={() => setEditingCityAdmin(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-ink-400 hover:bg-cream-100 hover:text-ink-700"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
                <MapPin className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-navy-900">
                  Assign Cities Before Approval
                </h3>
                <p className="text-xs text-ink-500">
                  Allocate coverage territories for {editingCityAdmin.name}
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-xl bg-cream-50 p-3 border border-cream-200">
              <span className="block text-[0.7rem] uppercase font-bold text-ink-400 mb-2">
                Allocated Cities ({selectedCities.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCities.length === 0 ? (
                  <span className="text-xs text-ink-400 italic">No cities allocated yet.</span>
                ) : (
                  selectedCities.map((city) => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-1 rounded-full bg-navy-900 text-white px-3 py-1 text-xs font-semibold"
                    >
                      {city}
                      <button
                        type="button"
                        onClick={() => handleToggleCity(city)}
                        className="hover:text-gold-300"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="mb-4">
              <span className="block text-[0.7rem] uppercase font-bold text-ink-400 mb-2">
                Choose Available Cities
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {allCityOptions.map((c) => {
                  const isSelected = selectedCities.includes(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleToggleCity(c)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-gold-500 text-navy-950 border-gold-600'
                          : 'bg-white text-ink-700 border-cream-300 hover:bg-cream-100'
                      }`}
                    >
                      {isSelected ? `✓ ${c}` : `+ ${c}`}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mb-6 flex gap-2">
              <Input
                type="text"
                placeholder="Or type custom city..."
                value={customCityInput}
                onChange={(e) => setCustomCityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomCity()
                  }
                }}
                className="h-9 text-xs rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomCity}
                className="rounded-xl px-3 text-xs font-semibold shrink-0 cursor-pointer"
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-cream-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCityAdmin(null)}
                disabled={isUpdatingCity}
                className="rounded-full text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveCity}
                disabled={isUpdatingCity}
                className="rounded-full bg-navy-900 text-white text-xs font-semibold cursor-pointer"
              >
                {isUpdatingCity ? 'Saving...' : 'Save Cities'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {actionTarget && (
        <ConfirmDialog
          isOpen={true}
          title={
            actionTarget.nextStatus === 'Approved'
              ? `Approve Admin: ${actionTarget.admin.name}`
              : `Reject Admin Application: ${actionTarget.admin.name}`
          }
          description={
            actionTarget.nextStatus === 'Approved'
              ? `This will activate administrator privileges for ${actionTarget.admin.name}. They will be able to log in and manage member registrations in assigned cities.`
              : `Are you sure you want to reject this admin application? The status will be set to Cancel.`
          }
          confirmText={actionTarget.nextStatus === 'Approved' ? 'Confirm Approval' : 'Confirm Rejection'}
          variant={actionTarget.nextStatus === 'Approved' ? 'success' : 'danger'}
          isLoading={isUpdatingStatus}
          onConfirm={handleConfirmStatus}
          onClose={() => setActionTarget(null)}
        />
      )}
    </div>
  )
}

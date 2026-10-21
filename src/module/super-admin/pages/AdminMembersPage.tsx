/**
 * @file src/module/super-admin/pages/AdminMembersPage.tsx
 * Admin Members management: view administrators, update city assignments (multiple_city), and update status.
 */

import { useEffect, useState, useMemo } from 'react'
import {
  ShieldCheck,
  Search,
  Filter,
  MapPin,
  RefreshCw,
  Edit2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  X,
  Phone,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import {
  fetchAdminMembers,
  updateMemberCity,
  updateMemberStatus,
} from '../services/adminApi'
import type { AdminMember, AdminMemberStatus } from '../types'
import { CITIES } from '@/module/home/data/cities'

export default function AdminMembersPage() {
  const [admins, setAdmins] = useState<AdminMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  // Edit City Modal State
  const [editingCityAdmin, setEditingCityAdmin] = useState<AdminMember | null>(null)
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [customCityInput, setCustomCityInput] = useState('')
  const [isUpdatingCity, setIsUpdatingCity] = useState(false)

  // Status Change Confirmation Modal State
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    admin: AdminMember
    nextStatus: AdminMemberStatus
  } | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Success Notification banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

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
        admin.mobile.includes(searchQuery) ||
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
    setCustomCityInput('')
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
  const handleAddCustomCity = () => {
    const val = customCityInput.trim()
    if (val && !selectedCities.includes(val)) {
      setSelectedCities((prev) => [...prev, val])
      setCustomCityInput('')
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

  const allCityOptions = CITIES.map((c) => c.defaultName)

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
            Admin Members Management
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            View regional administrators, assign multiple coverage cities, and approve/cancel accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadData()}
            disabled={isLoading}
            className="rounded-full text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
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

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-2xl bg-white p-3 border border-cream-200/90 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-3 my-auto size-4 text-ink-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by name, mobile, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9.5 text-xs bg-cream-50/50 border-cream-200 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-ink-400" />
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Approved', 'Pending', 'Cancel'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-navy-900 text-white'
                    : 'bg-cream-100 text-ink-600 hover:bg-cream-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="rounded-2xl border border-cream-200/90 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-cream-100 text-navy-800 animate-spin mb-3">
              <RefreshCw className="size-5" />
            </div>
            <p className="text-xs font-semibold text-ink-500">
              Loading admin members from API...
            </p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck className="mx-auto size-12 text-ink-300 mb-2" />
            <p className="text-sm font-bold text-navy-900">No Admin Members Found</p>
            <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'All'
                ? 'Try adjusting your search query or status filter.'
                : 'No admin members are currently registered in the database.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50/80 text-[0.7rem] uppercase font-bold tracking-wider text-ink-500">
                  <th className="py-3.5 px-4">Admin Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Current City</th>
                  <th className="py-3.5 px-4">Assigned Cities</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredAdmins.map((admin) => {
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
                          <div className="size-9 rounded-full bg-navy-100 text-navy-900 font-bold text-xs flex items-center justify-center shrink-0">
                            {admin.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-navy-900">{admin.name}</p>
                            <p className="text-[0.68rem] text-ink-400">
                              ID: #{admin.id} {admin.gender ? `• ${admin.gender}` : ''}
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
                            <span className="text-ink-400 italic text-[0.7rem]">
                              None assigned
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenCityModal(admin)}
                            className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-gold-600 hover:text-gold-700 ml-1 cursor-pointer"
                            title="Edit City Assignments"
                          >
                            <Edit2 className="size-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={admin.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {admin.status !== 'Approved' && (
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                setStatusChangeTarget({ admin, nextStatus: 'Approved' })
                              }
                              className="rounded-full text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                              title="Approve Admin"
                            >
                              <CheckCircle className="size-3 text-emerald-600" />
                              <span>Approve</span>
                            </Button>
                          )}

                          {admin.status !== 'Pending' && (
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                setStatusChangeTarget({ admin, nextStatus: 'Pending' })
                              }
                              className="rounded-full text-amber-700 border-amber-300 hover:bg-amber-50 cursor-pointer"
                              title="Set Pending"
                            >
                              <Clock className="size-3 text-amber-600" />
                              <span>Pending</span>
                            </Button>
                          )}

                          {admin.status !== 'Cancel' && (
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                setStatusChangeTarget({ admin, nextStatus: 'Cancel' })
                              }
                              className="rounded-full text-rose-700 border-rose-300 hover:bg-rose-50 cursor-pointer"
                              title="Cancel / Reject"
                            >
                              <XCircle className="size-3 text-rose-600" />
                              <span>Cancel</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-cream-200 px-4 py-3 bg-cream-50/50 text-[0.7rem] text-ink-500">
          <span>
            Showing <strong>{filteredAdmins.length}</strong> of{' '}
            <strong>{admins.length}</strong> admin accounts
          </span>
          <span>Endpoint: /getAdminMember • Status: /members/:id/status</span>
        </div>
      </div>

      {/* Edit Multiple City Assignment Modal */}
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
                  Assign Cities for {editingCityAdmin.name}
                </h3>
                <p className="text-xs text-ink-500">
                  Select all regions this admin is authorized to oversee (multiple_city)
                </p>
              </div>
            </div>

            {/* Selected Pills */}
            <div className="mb-4 rounded-xl bg-cream-50 p-3 border border-cream-200">
              <span className="block text-[0.7rem] uppercase font-bold text-ink-400 mb-2">
                Currently Assigned ({selectedCities.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCities.length === 0 ? (
                  <span className="text-xs text-ink-400 italic">No cities selected yet.</span>
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

            {/* Quick Available Cities */}
            <div className="mb-4">
              <span className="block text-[0.7rem] uppercase font-bold text-ink-400 mb-2">
                Quick Select Available Cities
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

            {/* Add Custom City */}
            <div className="mb-6 flex gap-2">
              <Input
                type="text"
                placeholder="Or type another custom city..."
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
                className="rounded-xl px-3 text-xs font-semibold cursor-pointer shrink-0"
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            </div>

            {/* Action buttons */}
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
                {isUpdatingCity ? 'Saving changes...' : 'Save City Assignments'}
              </Button>
            </div>
          </div>
        </div>
      )}

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

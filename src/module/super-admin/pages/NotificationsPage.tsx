/**
 * @file src/module/super-admin/pages/NotificationsPage.tsx
 * Comprehensive Notification Broadcast management: listing, creation modal (with image upload & target audience),
 * inspection using GET /notification/{id}, and deletion.
 */

import { useEffect, useState, useMemo, useRef, type ChangeEvent, type FormEvent } from 'react'
import {
  Bell,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon,
  Users,
  Shield,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '../components/ConfirmDialog'
import {
  createNotification,
  deleteNotificationRecord,
  fetchNotificationById,
  fetchNotifications,
  resolveImageUrl,
} from '../services/adminApi'
import type {
  CreateNotificationPayload,
  NotificationRecord,
  NotificationTarget,
} from '../types'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [targetFilter, setTargetFilter] = useState<string>('All')

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState<{
    notification_date: string
    notification_for: NotificationTarget
    notification_heading: string
    notification_message: string
    notification_image: File | null
    imagePreview: string
  }>(() => ({
    notification_date: new Date().toISOString().split('T')[0],
    notification_for: 'User',
    notification_heading: '',
    notification_message: '',
    notification_image: null,
    imagePreview: '',
  }))
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Details Modal State (using GET /notification/{id})
  const [inspectingId, setInspectingId] = useState<number | null>(null)
  const [inspectedRecord, setInspectedRecord] = useState<NotificationRecord | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<NotificationRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetchNotifications()
      setNotifications(res.data)
      if (res.error) setErrorMessage(res.error)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load notifications.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filtered = useMemo(() => {
    return notifications.filter((item) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        item.notification_heading.toLowerCase().includes(q) ||
        item.notification_message.toLowerCase().includes(q)

      const matchesTarget =
        targetFilter === 'All' ||
        item.notification_for.toLowerCase() === targetFilter.toLowerCase()

      return matchesSearch && matchesTarget
    })
  }, [notifications, searchQuery, targetFilter])

  // Handle Image Selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFormErrors((prev) => ({ ...prev, notification_image: 'Please select a valid image file.' }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, notification_image: 'Image size must be less than 5MB.' }))
      return
    }

    setFormErrors((prev) => {
      const next = { ...prev }
      delete next.notification_image
      return next
    })

    const previewUrl = URL.createObjectURL(file)
    setCreateForm((prev) => ({
      ...prev,
      notification_image: file,
      imagePreview: previewUrl,
    }))
  }

  const handleClearImage = () => {
    if (createForm.imagePreview) {
      URL.revokeObjectURL(createForm.imagePreview)
    }
    setCreateForm((prev) => ({
      ...prev,
      notification_image: null,
      imagePreview: '',
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle Create Submit
  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    if (!createForm.notification_heading.trim()) {
      errors.notification_heading = 'Notification heading is required.'
    }
    if (!createForm.notification_message.trim()) {
      errors.notification_message = 'Notification message is required.'
    }
    if (!createForm.notification_date) {
      errors.notification_date = 'Notification date is required.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setIsSubmitting(true)

    try {
      const payload: CreateNotificationPayload = {
        notification_date: createForm.notification_date,
        notification_for: createForm.notification_for,
        notification_heading: createForm.notification_heading.trim(),
        notification_message: createForm.notification_message.trim(),
        notification_image: createForm.notification_image,
      }

      const res = await createNotification(payload)

      if (res.success) {
        setSuccessBanner('Notification broadcast created successfully!')
        setIsCreateModalOpen(false)
        handleClearImage()
        setCreateForm({
          notification_date: new Date().toISOString().split('T')[0],
          notification_for: 'User',
          notification_heading: '',
          notification_message: '',
          notification_image: null,
          imagePreview: '',
        })
        // Refresh list
        void loadData()
      } else {
        setErrorMessage(res.message)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create notification.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Detail modal using GET /notification/{id}
  const handleInspect = async (id: number) => {
    setInspectingId(id)
    setIsLoadingDetail(true)
    setInspectedRecord(null)
    try {
      const res = await fetchNotificationById(id)
      setInspectedRecord(res.data)
      if (res.error) setErrorMessage(res.error)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to retrieve notification details.')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await deleteNotificationRecord(deleteTarget.id)
      if (res.success) {
        setSuccessBanner(`Notification #${deleteTarget.id} deleted successfully.`)
        setDeleteTarget(null)
        if (inspectedRecord?.id === deleteTarget.id) {
          setInspectingId(null)
          setInspectedRecord(null)
        }
        setNotifications((prev) => prev.filter((n) => n.id !== deleteTarget.id))
      } else {
        setErrorMessage(res.message)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete notification.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
            Notification Broadcasts
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Create and broadcast push alerts, announcements, and policy updates to Users or Admins.
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

          <Button
            type="button"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-bold text-xs shadow-gold cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Create Notification</span>
          </Button>
        </div>
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

      {/* Search & Target Audience Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-2xl bg-white p-3 border border-cream-200/90 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-3 my-auto size-4 text-ink-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search notification heading or message content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9.5 text-xs bg-cream-50/50 border-cream-200 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[0.68rem] uppercase font-bold text-ink-400 shrink-0">
            Target Audience:
          </span>
          {['All', 'User', 'Admin'].map((aud) => (
            <button
              key={aud}
              type="button"
              onClick={() => setTargetFilter(aud)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                targetFilter === aud
                  ? 'bg-navy-900 text-white'
                  : 'bg-cream-100 text-ink-600 hover:bg-cream-200'
              }`}
            >
              {aud}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Table */}
      <div className="rounded-2xl border border-cream-200/90 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-cream-100 text-navy-800 animate-spin mb-3">
              <RefreshCw className="size-5" />
            </div>
            <p className="text-xs font-semibold text-ink-500">
              Loading broadcast notifications...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="mx-auto size-12 text-ink-300 mb-2" />
            <p className="text-sm font-bold text-navy-900">No Notifications Found</p>
            <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto">
              {searchQuery || targetFilter !== 'All'
                ? 'No notifications match your current filter criteria.'
                : 'No announcements have been dispatched yet. Click "Create Notification" to compose one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50/80 text-[0.7rem] uppercase font-bold tracking-wider text-ink-500">
                  <th className="py-3.5 px-4">Heading & Content</th>
                  <th className="py-3.5 px-4">Audience</th>
                  <th className="py-3.5 px-4">Broadcast Date</th>
                  <th className="py-3.5 px-4">Attachment</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-cream-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="font-bold text-navy-900 text-sm">
                        {item.notification_heading}
                      </p>
                      <p className="text-ink-600 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.notification_message}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.notification_for === 'Admin'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.notification_for === 'Admin' ? (
                          <Shield className="size-3" />
                        ) : (
                          <Users className="size-3" />
                        )}
                        <span>{item.notification_for}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-ink-500 flex items-center gap-1.5 font-medium">
                        <Calendar className="size-3.5 text-ink-400" />
                        {item.notification_date || '—'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.notification_image ? (
                        <span className="inline-flex items-center gap-1 text-[0.7rem] text-gold-700 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded-md font-semibold">
                          <ImageIcon className="size-3" />
                          Image Attached
                        </span>
                      ) : (
                        <span className="text-ink-400 text-[0.7rem] italic">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => void handleInspect(item.id)}
                          className="rounded-full text-navy-900 border-navy-200 hover:bg-navy-50 text-[0.7rem] px-2.5 cursor-pointer"
                          title="View Details via GET /notification/{id}"
                        >
                          <Eye className="size-3 text-navy-700" />
                          <span>Details</span>
                        </Button>

                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => setDeleteTarget(item)}
                          className="rounded-full text-rose-700 border-rose-300 hover:bg-rose-50 text-[0.7rem] px-2 cursor-pointer"
                          title="Delete Notification"
                        >
                          <Trash2 className="size-3" />
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
            Total notifications: <strong>{filtered.length}</strong>
          </span>
          <span>
            Endpoints: GET /notification • POST /notification • GET /notification/:id • DELETE /notification/:id
          </span>
        </div>
      </div>

      {/* Create Notification Modal */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-cream-200">
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting) {
                  setIsCreateModalOpen(false)
                  handleClearImage()
                }
              }}
              className="absolute right-5 top-5 rounded-full p-1.5 text-ink-400 hover:bg-cream-100 hover:text-ink-700 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="size-11 rounded-2xl bg-gold-100 text-gold-700 flex items-center justify-center">
                <Bell className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-navy-900">
                  Compose Broadcast Notification
                </h3>
                <p className="text-xs text-ink-500">
                  Send structured announcement using POST /notification
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Target Audience Dropdown */}
              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                  Notification For <span className="text-rose-500">*</span>
                </label>
                <select
                  value={createForm.notification_for}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      notification_for: e.target.value as NotificationTarget,
                    }))
                  }
                  className="w-full h-10 px-3 text-xs bg-cream-50/70 border border-cream-300 rounded-xl font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
                >
                  <option value="User">User (Matrimonial Members)</option>
                  <option value="Admin">Admin (Regional Administrators)</option>
                </select>
              </div>

              {/* Broadcast Date */}
              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                  Notification Date <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  value={createForm.notification_date}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      notification_date: e.target.value,
                    }))
                  }
                  required
                  className="h-10 text-xs rounded-xl"
                />
                {formErrors.notification_date && (
                  <p className="mt-1 text-[0.7rem] text-rose-600">
                    {formErrors.notification_date}
                  </p>
                )}
              </div>

              {/* Heading */}
              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                  Notification Heading <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Festival Season Matrimonial Special"
                  value={createForm.notification_heading}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      notification_heading: e.target.value,
                    }))
                  }
                  required
                  className="h-10 text-xs rounded-xl"
                />
                {formErrors.notification_heading && (
                  <p className="mt-1 text-[0.7rem] text-rose-600">
                    {formErrors.notification_heading}
                  </p>
                )}
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                  Notification Message Body <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  placeholder="Write clear, informative announcement message..."
                  rows={4}
                  value={createForm.notification_message}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      notification_message: e.target.value,
                    }))
                  }
                  required
                  className="text-xs rounded-xl"
                />
                {formErrors.notification_message && (
                  <p className="mt-1 text-[0.7rem] text-rose-600">
                    {formErrors.notification_message}
                  </p>
                )}
              </div>

              {/* Notification Image File Upload */}
              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                  Notification Banner Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  id="notification-file-input"
                />

                {createForm.imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-cream-300 max-h-40 bg-navy-900">
                    <img
                      src={createForm.imagePreview}
                      alt="Banner Preview"
                      className="w-full h-36 object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute top-2 right-2 rounded-full bg-navy-950/80 p-1 text-white hover:bg-rose-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="notification-file-input"
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50/50 p-4 text-center cursor-pointer hover:bg-cream-100/70 transition-colors"
                  >
                    <Upload className="size-6 text-ink-400 mb-1" />
                    <span className="text-xs font-semibold text-navy-900">
                      Click to upload banner image
                    </span>
                    <span className="text-[0.68rem] text-ink-400 mt-0.5">
                      PNG, JPG, WebP up to 5MB
                    </span>
                  </label>
                )}
                {formErrors.notification_image && (
                  <p className="mt-1 text-[0.7rem] text-rose-600">
                    {formErrors.notification_image}
                  </p>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    handleClearImage()
                  }}
                  disabled={isSubmitting}
                  className="rounded-full text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs px-5 shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Broadcasting...
                    </span>
                  ) : (
                    <span>Publish Notification</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Notification Modal (GET /notification/{id}) */}
      {inspectingId !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-cream-200">
            <button
              type="button"
              onClick={() => {
                setInspectingId(null)
                setInspectedRecord(null)
              }}
              className="absolute right-5 top-5 rounded-full p-1.5 text-ink-400 hover:bg-cream-100 hover:text-ink-700 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {isLoadingDetail ? (
              <div className="py-16 text-center">
                <div className="inline-flex size-10 items-center justify-center rounded-full bg-cream-100 text-navy-800 animate-spin mb-3">
                  <RefreshCw className="size-5" />
                </div>
                <p className="text-xs font-semibold text-ink-500">
                  Retrieving notification #{inspectingId} from API...
                </p>
              </div>
            ) : inspectedRecord ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-11 rounded-2xl bg-navy-100 text-navy-900 flex items-center justify-center">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-display text-navy-900">
                      Notification Details (GET /notification/{inspectedRecord.id})
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.68rem] font-bold ${
                          inspectedRecord.notification_for === 'Admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Target: {inspectedRecord.notification_for}
                      </span>
                      <span className="text-xs text-ink-500">
                        Date: {inspectedRecord.notification_date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-4 text-xs">
                  <div>
                    <span className="text-[0.68rem] uppercase font-bold text-ink-400 block mb-1">
                      Heading
                    </span>
                    <p className="font-bold text-navy-900 text-sm">
                      {inspectedRecord.notification_heading}
                    </p>
                  </div>

                  <div>
                    <span className="text-[0.68rem] uppercase font-bold text-ink-400 block mb-1">
                      Message Body
                    </span>
                    <div className="rounded-2xl bg-cream-50 p-4 border border-cream-200 text-ink-800 leading-relaxed whitespace-pre-wrap">
                      {inspectedRecord.notification_message}
                    </div>
                  </div>

                  {inspectedRecord.notification_image && (
                    <div>
                      <span className="text-[0.68rem] uppercase font-bold text-ink-400 block mb-1">
                        Attachment Image
                      </span>
                      <div className="rounded-2xl overflow-hidden border border-cream-200 bg-navy-900 max-h-48">
                        <img
                          src={
                            resolveImageUrl(inspectedRecord.notification_image) ||
                            inspectedRecord.notification_image
                          }
                          alt="Notification Attachment"
                          className="w-full h-44 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-cream-200">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setDeleteTarget(inspectedRecord)
                    }}
                    className="rounded-full text-xs font-semibold cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete Broadcast</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInspectingId(null)
                      setInspectedRecord(null)
                    }}
                    className="rounded-full text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-ink-500">
                Notification record could not be found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Notification Broadcast"
          description={`Are you sure you want to permanently delete notification "${deleteTarget.notification_heading}"? This will remove the broadcast from recipient feeds.`}
          confirmText="Yes, Delete Notification"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

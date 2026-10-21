/**
 * @file src/module/super-admin/pages/NotificationsPage.tsx
 * Comprehensive Notification Broadcast management: listing, creation modal (with image upload & target audience),
 * inspection using GET /notification/{id}, and deletion.
 */

import { useState, useMemo, useRef, type ChangeEvent, type FormEvent } from 'react'
import {
  Bell,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  Eye,
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
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { panelDescription } from '../navigation'
import { PanelModal } from '../components/PanelModal'
import { PanelPagination } from '../components/PanelPagination'
import { PanelSearch } from '../components/PanelSearch'
import { PanelToolbar } from '../components/PanelToolbar'
import { PanelEmpty, PanelError } from '../components/PanelState'
import { PanelTableSkeleton, SkeletonText } from '../components/PanelSkeleton'
import {
  PanelTable,
  PanelTableFooter,
  PanelTableHeadCell,
} from '../components/PanelTable'
import { PanelFilterSelect } from '../components/PanelFilterSelect'
import { RemoteImage } from '../components/RemoteImage'
import { cn } from 'cn'
import {
  useCreateNotificationMutation,
  useDeleteNotificationMutation,
  useNotificationsQuery,
  useNotificationQuery,
} from '../hook/useNotifications'
import { errorMessage } from '../hook/errors'
import { DEFAULT_PER_PAGE, useServerSearch } from '../hook/useServerList'
import type { NotificationTarget } from '../types'

const AUDIENCE_FILTERS = ['All', 'User', 'Admin'] as const

/** Fresh composer state — the date is recomputed on every reset. */
const emptyCreateForm = () => ({
  notification_date: new Date().toISOString().split('T')[0],
  notification_for: 'User' as NotificationTarget,
  notification_heading: '',
  notification_message: '',
  notification_image: null as File | null,
  imagePreview: '',
})

export default function NotificationsPage() {
  const { searchInput, setSearchInput, searchTerm } = useServerSearch()
  const [targetFilter, setTargetFilter] = useState<string>('All')
  const [page, setPage] = useState(1)

  const {
    records: notifications,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useNotificationsQuery({
    search: searchTerm || undefined,
    target: targetFilter === 'All' ? undefined : targetFilter,
    page,
    per_page: DEFAULT_PER_PAGE,
  })
  const createMutation = useCreateNotificationMutation()
  const deleteMutation = useDeleteNotificationMutation()

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Details Modal State (using GET /notification/{id})
  const [inspectingId, setInspectingId] = useState<number | null>(null)
  const {
    data: inspectedRecord,
    isLoading: isLoadingDetail,
    error: inspectError,
  } = useNotificationQuery(inspectingId)

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const deleteTarget = useMemo(
    () => notifications.find((n) => n.id === deleteTargetId) ?? null,
    [notifications, deleteTargetId],
  )


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

  const resetCreateForm = () => {
    if (createForm.imagePreview) {
      URL.revokeObjectURL(createForm.imagePreview)
    }
    setCreateForm(emptyCreateForm())
    setFormErrors({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle Create Submit
  const handleCreateSubmit = (e: FormEvent) => {
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

    createMutation.mutate(
      {
        payload: {
          notification_date: createForm.notification_date,
          notification_for: createForm.notification_for,
          notification_heading: createForm.notification_heading.trim(),
          notification_message: createForm.notification_message.trim(),
          notification_image: createForm.notification_image,
        },
        successMessage: 'Notification broadcast created successfully!',
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false)
          resetCreateForm()
        },
      },
    )
  }

  // Handle Delete
  const handleDelete = () => {
    if (!deleteTarget) return
    const targetId = deleteTarget.id

    deleteMutation.mutate(
      {
        id: targetId,
        successMessage: 'Notification deleted successfully.',
      },
      {
        onSuccess: () => {
          setDeleteTargetId(null)
          setInspectingId(null)
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Notification Broadcasts"
        description={panelDescription('/panel/notifications')}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              <RefreshCw className={isFetching ? 'size-3.5 animate-spin' : 'size-3.5'} aria-hidden />
              <span>Refresh</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="cursor-pointer rounded-full bg-gold-600 text-xs font-bold text-white shadow-gold hover:bg-gold-700"
            >
              <Plus className="size-4" aria-hidden />
              <span>Create Notification</span>
            </Button>
          </>
        }
      />

      {/* Notifications Table */}
      <PanelCard flush>
        <PanelToolbar
          search={
            <PanelSearch
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search heading or message content…"
            />
          }
        >
          <PanelFilterSelect
            id="filter-notification-audience"
            label="Audience"
            options={AUDIENCE_FILTERS}
            value={targetFilter}
            onChange={setTargetFilter}
          />
        </PanelToolbar>

        {isLoading ? (
          <PanelTableSkeleton rows={6} columns={5} />
        ) : error ? (
          <PanelError
            title="Could not load notifications"
            message={errorMessage(error, 'Failed to load broadcast notifications.')}
            onRetry={() => void refetch()}
          />
        ) : notifications.length === 0 ? (
          <PanelEmpty
            icon={<Bell className="size-6" />}
            title="No Notifications Found"
            description={
              searchInput || targetFilter !== 'All'
                ? 'No notifications match your current filter criteria.'
                : 'No announcements have been dispatched yet. Create one to notify your audience.'
            }
            action={
              searchInput || targetFilter !== 'All' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setSearchInput('')
                    setTargetFilter('All')
                  }}
                  className="mt-4 cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <PanelTable
            caption="Broadcast notifications with audience, date and attachment"
            head={
              <>
                <PanelTableHeadCell>Heading & Content</PanelTableHeadCell>
                <PanelTableHeadCell>Audience</PanelTableHeadCell>
                <PanelTableHeadCell>Broadcast Date</PanelTableHeadCell>
                <PanelTableHeadCell>Attachment</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
              </>
            }
          >
            {notifications.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-cream-50/70">
                <td className="max-w-md px-4 py-3.5">
                  <p className="text-sm font-bold text-navy-900">
                    {item.notification_heading}
                  </p>
                  <p className="mt-0.5 line-clamp-2 leading-relaxed text-ink-600">
                    {item.notification_message}
                  </p>
                </td>

                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold',
                      item.notification_for === 'Admin'
                        ? 'border-navy-200 bg-navy-50 text-navy-800'
                        : 'border-gold-300 bg-gold-50 text-gold-800',
                    )}
                  >
                    {item.notification_for === 'Admin' ? (
                      <Shield className="size-3" aria-hidden />
                    ) : (
                      <Users className="size-3" aria-hidden />
                    )}
                    <span>{item.notification_for}</span>
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-1.5 font-medium text-ink-500">
                    <Calendar className="size-3.5 text-ink-400" aria-hidden />
                    {item.notification_date || '—'}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  {item.notification_image ? (
                    <div className="flex flex-col items-start gap-1">
                      <a
                        href={item.notification_image}
                        target="_blank"
                        rel="noreferrer"
                        title="Open the attachment in a new tab"
                        className="block overflow-hidden rounded-lg"
                      >
                        <RemoteImage
                          src={item.notification_image}
                          alt={
                            item.notification_image_name ?? 'Notification attachment'
                          }
                          className="h-12 w-16 rounded-lg border border-cream-300 object-cover"
                          fallback={
                            <span className="inline-flex items-center gap-1 rounded-md border border-gold-200 bg-gold-50 px-2 py-0.5 text-[0.7rem] font-semibold text-gold-800">
                              <ImageIcon className="size-3" aria-hidden />
                              Image Attached
                            </span>
                          }
                        />
                      </a>
                      {item.notification_image_name ? (
                        <span className="max-w-20 truncate text-[0.65rem] text-ink-400">
                          {item.notification_image_name}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-[0.7rem] text-ink-400 italic">None</span>
                  )}
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setInspectingId(item.id)}
                      title="View notification details"
                      className="cursor-pointer rounded-full border-navy-200 text-[0.7rem] text-navy-900 hover:bg-navy-50"
                    >
                      <Eye className="size-3 text-navy-700" aria-hidden />
                      <span>Details</span>
                    </Button>

                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setDeleteTargetId(item.id)}
                      title="Delete Notification"
                      className="cursor-pointer rounded-full border-maroon-200 bg-maroon-50 text-[0.7rem] text-maroon-800 hover:bg-maroon-100"
                    >
                      <Trash2 className="size-3" aria-hidden />
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
                Total notifications: <strong>{meta.total}</strong>
              </span>
            }
          />
        </PanelTableFooter>
      </PanelCard>

      {/* Create Notification Modal */}
      <PanelModal
        isOpen={isCreateModalOpen}
        title="Compose Broadcast Notification"
        description="Send a structured announcement to the selected audience."
        icon={<Bell className="size-5" />}
        onClose={() => {
          if (!createMutation.isPending) {
            setIsCreateModalOpen(false)
            resetCreateForm()
          }
        }}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false)
                resetCreateForm()
              }}
              disabled={createMutation.isPending}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                void handleCreateSubmit(event as unknown as FormEvent)
              }}
              disabled={createMutation.isPending}
              className="cursor-pointer rounded-full bg-navy-900 px-5 text-xs font-bold text-white hover:bg-navy-700"
            >
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Broadcasting…
                </span>
              ) : (
                <span>Publish Notification</span>
              )}
            </Button>
          </>
        }
      >
        <form
          onSubmit={handleCreateSubmit}
          className="space-y-4"
          id="notification-create-form"
        >
          {/* Target Audience */}
          <div>
            <label
              htmlFor="notification-for"
              className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase"
            >
              Notification For <span className="text-maroon-600">*</span>
            </label>
            <select
              id="notification-for"
              value={createForm.notification_for}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  notification_for: e.target.value as NotificationTarget,
                }))
              }
              className="h-10 w-full cursor-pointer rounded-xl border border-cream-300 bg-cream-50/70 px-3 text-xs font-semibold text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
            >
              <option value="User">User (Matrimonial Members)</option>
              <option value="Admin">Admin (Regional Administrators)</option>
            </select>
          </div>

          {/* Broadcast Date */}
          <div>
            <label
              htmlFor="notification-date"
              className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase"
            >
              Notification Date <span className="text-maroon-600">*</span>
            </label>
            <Input
              id="notification-date"
              type="date"
              value={createForm.notification_date}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  notification_date: e.target.value,
                }))
              }
              required
              className="h-10 rounded-xl border-cream-300 text-xs"
            />
            {formErrors.notification_date && (
              <p className="mt-1 text-[0.7rem] text-maroon-600">
                {formErrors.notification_date}
              </p>
            )}
          </div>

          {/* Heading */}
          <div>
            <label
              htmlFor="notification-heading"
              className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase"
            >
              Notification Heading <span className="text-maroon-600">*</span>
            </label>
            <Input
              id="notification-heading"
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
              className="h-10 rounded-xl border-cream-300 text-xs"
            />
            {formErrors.notification_heading && (
              <p className="mt-1 text-[0.7rem] text-maroon-600">
                {formErrors.notification_heading}
              </p>
            )}
          </div>

          {/* Message Body */}
          <div>
            <label
              htmlFor="notification-message"
              className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase"
            >
              Notification Message Body <span className="text-maroon-600">*</span>
            </label>
            <Textarea
              id="notification-message"
              placeholder="Write clear, informative announcement message…"
              rows={4}
              value={createForm.notification_message}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  notification_message: e.target.value,
                }))
              }
              required
              className="rounded-xl border-cream-300 text-xs"
            />
            {formErrors.notification_message && (
              <p className="mt-1 text-[0.7rem] text-maroon-600">
                {formErrors.notification_message}
              </p>
            )}
          </div>

          {/* Notification Image File Upload */}
          <div>
            <span className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase">
              Notification Banner Image (Optional)
            </span>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              id="notification-file-input"
            />

            {createForm.imagePreview ? (
              <div className="relative max-h-40 overflow-hidden rounded-2xl border border-cream-300 bg-navy-900">
                <img
                  src={createForm.imagePreview}
                  alt="Banner preview"
                  className="h-36 w-full object-contain"
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-2 right-2 cursor-pointer rounded-full bg-navy-950/80 p-1 text-white transition-colors hover:bg-maroon-600"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ) : (
              <label
                htmlFor="notification-file-input"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50/50 p-4 text-center transition-colors hover:border-gold-500/60 hover:bg-gold-100/70"
              >
                <Upload className="mb-1 size-6 text-gold-600" aria-hidden />
                <span className="text-xs font-semibold text-navy-900">
                  Click to upload banner image
                </span>
                <span className="mt-0.5 text-[0.68rem] text-ink-400">
                  PNG, JPG, WebP up to 5MB
                </span>
              </label>
            )}
            {formErrors.notification_image && (
              <p className="mt-1 text-[0.7rem] text-maroon-600">
                {formErrors.notification_image}
              </p>
            )}
          </div>
        </form>
      </PanelModal>

      {/* Inspect Notification Modal (GET /notification/{id}) */}
      <PanelModal
        isOpen={inspectingId !== null}
        title="Notification Details"
        description="Broadcast record retrieved from the notification endpoint."
        icon={<FileText className="size-5" />}
        onClose={() => setInspectingId(null)}
        footer={
          inspectedRecord ? (
            <>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDeleteTargetId(inspectedRecord.id)
                }}
                className="mr-auto cursor-pointer rounded-full text-xs font-semibold"
              >
                <Trash2 className="size-3.5" aria-hidden />
                <span>Delete Broadcast</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInspectingId(null)}
                className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
              >
                Close
              </Button>
            </>
          ) : null
        }
      >
        {isLoadingDetail ? (
          <SkeletonText lines={5} className="py-6" />
        ) : inspectError ? (
          <p className="py-8 text-center text-xs text-maroon-600">
            {errorMessage(inspectError, 'Could not retrieve the notification record.')}
          </p>
        ) : inspectedRecord ? (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.68rem] font-bold',
                  inspectedRecord.notification_for === 'Admin'
                    ? 'border-navy-200 bg-navy-50 text-navy-800'
                    : 'border-gold-300 bg-gold-50 text-gold-800',
                )}
              >
                Target: {inspectedRecord.notification_for}
              </span>
              <span className="text-xs text-ink-500">
                Date: {inspectedRecord.notification_date}
              </span>
            </div>

            <div>
              <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                Heading
              </span>
              <p className="text-sm font-bold text-navy-900">
                {inspectedRecord.notification_heading}
              </p>
            </div>

            <div>
              <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                Message Body
              </span>
              <div className="whitespace-pre-wrap rounded-2xl border border-cream-300/80 bg-cream-50/70 p-4 leading-relaxed text-ink-700">
                {inspectedRecord.notification_message}
              </div>
            </div>

            {inspectedRecord.notification_image && (
              <div>
                <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Attachment Image
                </span>
                <div className="max-h-48 overflow-hidden rounded-2xl border border-cream-300 bg-navy-900">
                  <RemoteImage
                    src={inspectedRecord.notification_image}
                    alt={
                      inspectedRecord.notification_image_name ?? 'Notification attachment'
                    }
                    className="h-44 w-full object-contain"
                  />
                </div>
                {inspectedRecord.notification_image_name ? (
                  <p className="mt-1.5 text-[0.68rem] text-ink-400">
                    File: {inspectedRecord.notification_image_name}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-xs text-ink-500">
            Notification record could not be found.
          </p>
        )}
      </PanelModal>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Notification Broadcast"
          description={`Are you sure you want to permanently delete notification "${deleteTarget.notification_heading}"? This will remove the broadcast from recipient feeds.`}
          confirmText="Yes, Delete Notification"
          cancelText="Cancel"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={handleDelete}
          onClose={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  )
}

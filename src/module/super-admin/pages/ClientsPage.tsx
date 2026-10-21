/**
 * @file src/module/super-admin/pages/ClientsPage.tsx
 * Client management for the Super Admin Panel:
 * list client brands/partners, upload client logos, edit names and statuses,
 * toggle visibility, and delete records.
 */

import { useMemo, useState, useRef } from 'react'
import {
  Briefcase,
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from 'cn'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
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
import { StatusBadge } from '../components/StatusBadge'
import { panelDescription } from '../navigation'
import { errorMessage } from '../hook/errors'
import { DEFAULT_PER_PAGE, useServerSearch } from '../hook/useServerList'
import { formatDate } from '../utils/format'
import {
  useClientQuery,
  useClientsQuery,
  useCreateClientMutation,
  useDeleteClientMutation,
  useUpdateClientMutation,
  useUpdateClientStatusMutation,
} from '../hook/useClients'
import { convertToWebpFile, isWebpFile } from '@/lib/image'
import type { ClientRecord, ClientStatus } from '../types'

const STATUS_FILTERS = ['All', 'Active', 'Inactive'] as const

interface ClientFormState {
  clients_name: string
  clients_image: File | null
  existing_image_url?: string | null
  clients_status: ClientStatus
}

const DEFAULT_FORM: ClientFormState = {
  clients_name: '',
  clients_image: null,
  existing_image_url: null,
  clients_status: 'Active',
}

export default function ClientsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('All')

  // Search input state with debounced server query
  const { searchInput, setSearchInput, searchTerm } = useServerSearch()

  // Query parameters sent to GET /client
  const queryParams = useMemo(
    () => ({
      page,
      per_page: DEFAULT_PER_PAGE,
      search: searchTerm || undefined,
      clients_status: statusFilter === 'All' ? undefined : statusFilter,
    }),
    [page, searchTerm, statusFilter],
  )

  const {
    records: clients,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useClientsQuery(queryParams)

  // Modals state
  const [inspectId, setInspectId] = useState<number | string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ClientRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ClientRecord | null>(null)

  // Direct single-client query: executes GET /client/{id}
  const {
    data: inspectedClient,
    isLoading: isInspectLoading,
    error: inspectError,
  } = useClientQuery(inspectId)

  // Use the image URL from the list as the primary preview source
  const clientFromList = useMemo(
    () => (inspectId ? clients.find((c) => String(c.id) === String(inspectId)) : null),
    [clients, inspectId],
  )

  const inspectedImage =
    clientFromList?.clients_image ||
    (inspectedClient?.clients_image && inspectedClient.clients_image.startsWith('http')
      ? inspectedClient.clients_image
      : null) ||
    (inspectedClient?.clients_image
      ? `https://vivahsambandh.com/crmapi/public/assets/images/client_images/${inspectedClient.clients_image.replace(/^\/+/, '')}`
      : null)

  // Form states
  const [createForm, setCreateForm] = useState<ClientFormState>(DEFAULT_FORM)
  const [editForm, setEditForm] = useState<ClientFormState>(DEFAULT_FORM)

  // File input refs
  const createFileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Mutations
  const createMutation = useCreateClientMutation()
  const updateMutation = useUpdateClientMutation()
  const statusMutation = useUpdateClientStatusMutation()
  const deleteMutation = useDeleteClientMutation()

  // Reset pagination on filter change
  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val as (typeof STATUS_FILTERS)[number])
    setPage(1)
  }

  const [isConvertingImage, setIsConvertingImage] = useState(false)

  // Handle file selection with automatic WebP conversion
  const handleFileChange = async (file: File | null, isEdit = false) => {
    if (!file) {
      if (isEdit) {
        setEditForm((prev) => ({ ...prev, clients_image: null }))
      } else {
        setCreateForm((prev) => ({ ...prev, clients_image: null }))
      }
      return
    }

    try {
      setIsConvertingImage(true)
      const webpFile = await convertToWebpFile(file)
      if (isEdit) {
        setEditForm((prev) => ({ ...prev, clients_image: webpFile }))
      } else {
        setCreateForm((prev) => ({ ...prev, clients_image: webpFile }))
      }
    } finally {
      setIsConvertingImage(false)
    }
  }

  // Open Edit Modal
  const handleOpenEdit = (client: ClientRecord) => {
    setEditTarget(client)
    setEditForm({
      clients_name: client.clients_name,
      clients_image: null,
      existing_image_url: client.clients_image,
      clients_status: client.clients_status,
    })
  }

  // Handle Form Submission for Creating Client
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.clients_name.trim() || isConvertingImage) return

    let imageFile = createForm.clients_image
    if (imageFile && !isWebpFile(imageFile)) {
      imageFile = await convertToWebpFile(imageFile)
    }

    const formData = new FormData()
    formData.append('clients_name', createForm.clients_name.trim())
    if (imageFile) {
      formData.append('clients_image', imageFile)
    }

    createMutation.mutate(
      {
        payload: formData,
        successMessage: 'Client created successfully.',
      },
      {
        onSuccess: () => {
          setCreateModalOpen(false)
          setCreateForm(DEFAULT_FORM)
          if (createFileInputRef.current) createFileInputRef.current.value = ''
        },
      },
    )
  }

  // Handle Form Submission for Updating Client
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget || !editForm.clients_name.trim() || isConvertingImage) return

    let imageFile = editForm.clients_image
    if (imageFile && !isWebpFile(imageFile)) {
      imageFile = await convertToWebpFile(imageFile)
    }

    const formData = new FormData()
    formData.append('clients_name', editForm.clients_name.trim())
    formData.append('clients_status', editForm.clients_status)
    formData.append('_method', 'PUT')

    if (imageFile) {
      formData.append('clients_image', imageFile)
    }

    updateMutation.mutate(
      {
        id: editTarget.id,
        payload: formData,
        successMessage: 'Client updated successfully.',
      },
      {
        onSuccess: () => {
          setEditTarget(null)
          setEditForm(DEFAULT_FORM)
          if (editFileInputRef.current) editFileInputRef.current.value = ''
        },
      },
    )
  }

  // Toggle quick status
  const handleToggleStatus = (client: ClientRecord) => {
    const nextStatus: ClientStatus = client.clients_status === 'Active' ? 'Inactive' : 'Active'
    statusMutation.mutate({
      id: client.id,
      clients_status: nextStatus,
      successMessage: `Client marked as ${nextStatus}.`,
    })
  }

  // Confirm delete action
  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(
      {
        id: deleteTarget.id,
        successMessage: 'Client deleted successfully.',
      },
      {
        onSuccess: () => setDeleteTarget(null),
      },
    )
  }

  // Pagination display stats
  const firstRow = meta.total ? (meta.current_page - 1) * meta.per_page + 1 : 0
  const lastRow = meta.total ? Math.min(meta.total, meta.current_page * meta.per_page) : 0

  const hasFilters = Boolean(searchTerm) || statusFilter !== 'All'

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Clients"
        description={panelDescription('/panel/clients')}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="cursor-pointer gap-2 rounded-full border-cream-300 bg-cream-50 text-xs font-semibold text-navy-900 hover:bg-cream-100/70"
            >
              <RefreshCw className={cn('size-3.5 text-navy-700', isFetching && 'animate-spin')} />
              <span>Refresh</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                setCreateForm(DEFAULT_FORM)
                setCreateModalOpen(true)
              }}
              className="cursor-pointer gap-2 rounded-full bg-gold-600 text-xs font-bold text-white shadow-gold hover:bg-gold-700"
            >
              <Plus className="size-4" />
              <span>Add Client</span>
            </Button>
          </div>
        }
      />

      <PanelCard flush>
        <PanelToolbar
          search={
            <PanelSearch
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search by client name…"
            />
          }
        >
          <PanelFilterSelect
            id="filter-client-status"
            label="Status"
            value={statusFilter}
            options={STATUS_FILTERS}
            onChange={handleStatusFilterChange}
            showStatusDots
          />
        </PanelToolbar>

        {isLoading ? (
          <PanelTableSkeleton rows={5} columns={3} />
        ) : error ? (
          <PanelError
            message={errorMessage(error, 'Could not load clients.')}
            onRetry={() => void refetch()}
          />
        ) : clients.length === 0 ? (
          <PanelEmpty
            title={hasFilters ? 'No matching clients found' : 'No clients added yet'}
            description={
              hasFilters
                ? 'Try adjusting your search terms or filter selection.'
                : 'Add client partners and brand logos to showcase them on the platform.'
            }
            action={
              hasFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchInput('')
                    setStatusFilter('All')
                    setPage(1)
                  }}
                  className="rounded-full border-cream-300 text-xs"
                >
                  Reset filters
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setCreateForm(DEFAULT_FORM)
                    setCreateModalOpen(true)
                  }}
                  className="rounded-full bg-gold-600 text-xs text-white hover:bg-gold-700"
                >
                  <Plus className="mr-1.5 size-3.5" />
                  Add First Client
                </Button>
              )
            }
          />
        ) : (
          <PanelTable
            head={
              <>
                <PanelTableHeadCell>Client</PanelTableHeadCell>
                <PanelTableHeadCell>Status</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
              </>
            }
          >
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-cream-200/80 transition-colors hover:bg-cream-50/50"
              >
                {/* Client image & name */}
                <td className="px-4 py-3 text-xs text-navy-900">
                  <div className="flex items-center gap-3">
                    <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-cream-300 bg-cream-50 flex items-center justify-center shadow-xs">
                      {client.clients_image ? (
                        <img
                          src={client.clients_image}
                          alt={client.clients_name}
                          className="size-full object-contain p-1"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.parentElement?.classList.add('bg-cream-100')
                          }}
                        />
                      ) : (
                        <ImageIcon className="size-5 text-ink-300" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="block truncate font-semibold text-navy-950 text-sm">
                        {client.clients_name || 'Unnamed Client'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-xs">
                  <StatusBadge status={client.clients_status} size="sm" />
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Inspect details */}
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setInspectId(client.id)}
                      title="View details"
                      className="cursor-pointer rounded-full border-cream-300 bg-white text-[0.7rem] text-navy-700 hover:bg-cream-100"
                    >
                      <Eye className="size-3" aria-hidden />
                    </Button>

                    {/* Edit client */}
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => handleOpenEdit(client)}
                      title="Edit client"
                      className="cursor-pointer rounded-full border-cream-300 bg-white text-[0.7rem] text-navy-700 hover:bg-cream-100"
                    >
                      <Pencil className="size-3" aria-hidden />
                    </Button>

                    {/* Status toggle */}
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => handleToggleStatus(client)}
                      disabled={statusMutation.isPending}
                      title={
                        client.clients_status === 'Active'
                          ? 'Deactivate client'
                          : 'Activate client'
                      }
                      className={cn(
                        'cursor-pointer rounded-full text-[0.7rem]',
                        client.clients_status === 'Active'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                      )}
                    >
                      {client.clients_status === 'Active' ? (
                        <CheckCircle2 className="size-3 text-emerald-600" aria-hidden />
                      ) : (
                        <XCircle className="size-3 text-slate-500" aria-hidden />
                      )}
                    </Button>

                    {/* Delete */}
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setDeleteTarget(client)}
                      title="Delete client"
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
                Showing <strong>{firstRow}</strong>–<strong>{lastRow}</strong> of{' '}
                <strong>{meta.total}</strong> clients
              </span>
            }
          />
        </PanelTableFooter>
      </PanelCard>

      {/* Inspect Modal (Calls GET /client/{id}) */}
      <PanelModal
        isOpen={inspectId !== null}
        title={inspectedClient?.clients_name ? `Client: ${inspectedClient.clients_name}` : 'Client Details'}
        description="Detailed record fetched directly from /client/{id}."
        icon={<Briefcase className="size-5" />}
        size="md"
        onClose={() => setInspectId(null)}
        footer={
          <Button
            type="button"
            variant="outline"
            onClick={() => setInspectId(null)}
            className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
          >
            Close
          </Button>
        }
      >
        {isInspectLoading ? (
          <div className="space-y-4 py-6">
            <SkeletonText lines={5} />
          </div>
        ) : inspectError ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-maroon-700">
              {errorMessage(inspectError, 'Could not find client by ID.')}
            </p>
            <p className="mt-1 text-xs text-ink-500">
              Please check if the client ID exists in the database.
            </p>
          </div>
        ) : inspectedClient ? (
          <div className="space-y-5 text-xs">
            {/* Logo Preview */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-cream-300 bg-cream-50/70 p-6">
              <div className="size-28 overflow-hidden rounded-2xl border border-cream-300 bg-white p-2 shadow-xs flex items-center justify-center">
                {inspectedImage ? (
                  <img
                    src={inspectedImage}
                    alt={inspectedClient.clients_name}
                    className="size-full object-contain"
                    onError={(e) => {
                      if (
                        clientFromList?.clients_image &&
                        e.currentTarget.src !== clientFromList.clients_image
                      ) {
                        e.currentTarget.src = clientFromList.clients_image
                      } else {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement?.classList.add('bg-cream-100')
                      }
                    }}
                  />
                ) : (
                  <ImageIcon className="size-12 text-ink-300" />
                )}
              </div>
              <h3 className="mt-3 text-base font-bold text-navy-950">
                {inspectedClient.clients_name}
              </h3>
              <div className="mt-1">
                <StatusBadge status={inspectedClient.clients_status} size="sm" />
              </div>
            </div>

            {/* Metadata attributes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-cream-300 bg-white p-3">
                <span className="text-[0.66rem] font-bold tracking-wider text-ink-400 uppercase">
                  Client ID
                </span>
                <p className="mt-1 font-semibold text-navy-900">
                  {inspectedClient.id}
                </p>
              </div>

              <div className="rounded-xl border border-cream-300 bg-white p-3">
                <span className="text-[0.66rem] font-bold tracking-wider text-ink-400 uppercase">
                  Status
                </span>
                <p className="mt-1 font-semibold text-navy-900">
                  {inspectedClient.clients_status}
                </p>
              </div>

              <div className="rounded-xl border border-cream-300 bg-white p-3">
                <span className="text-[0.66rem] font-bold tracking-wider text-ink-400 uppercase">
                  Created Date
                </span>
                <p className="mt-1 font-semibold text-navy-900">
                  {formatDate(inspectedClient.created_at)}
                </p>
              </div>

              <div className="rounded-xl border border-cream-300 bg-white p-3">
                <span className="text-[0.66rem] font-bold tracking-wider text-ink-400 uppercase">
                  Updated Date
                </span>
                <p className="mt-1 font-semibold text-navy-900">
                  {formatDate(inspectedClient.updated_at)}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </PanelModal>


      {/* Add Client Modal */}
      <PanelModal
        isOpen={createModalOpen}
        title="Add Client"
        description="Add a new client name and upload their brand logo."
        icon={<Plus className="size-5" />}
        size="md"
        onClose={() => setCreateModalOpen(false)}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateSubmit}
              disabled={createMutation.isPending || !createForm.clients_name.trim()}
              className="cursor-pointer rounded-full bg-maroon-700 px-5 text-xs font-bold text-white hover:bg-maroon-800 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving…' : 'Create Client'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-950">
              Client Name <span className="text-maroon-600">*</span>
            </label>
            <Input
              type="text"
              value={createForm.clients_name}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, clients_name: e.target.value }))
              }
              placeholder="e.g. Acme Corporation"
              required
              className="rounded-xl border-cream-300 bg-white text-xs"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-navy-950">
                Client Logo / Image
              </label>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[0.66rem] font-bold text-amber-800">
                WebP Required (.webp)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={createFileInputRef}
                type="file"
                accept="image/webp,.webp,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  void handleFileChange(file, false)
                }}
                className="hidden"
                id="create-client-image"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isConvertingImage}
                onClick={() => createFileInputRef.current?.click()}
                className="cursor-pointer gap-2 rounded-xl border-dashed border-cream-400 bg-cream-50 text-xs font-medium text-navy-800 hover:bg-cream-100"
              >
                <Upload className="size-3.5" />
                <span>
                  {isConvertingImage
                    ? 'Converting to WebP…'
                    : createForm.clients_image
                      ? 'Change File'
                      : 'Choose Logo'}
                </span>
              </Button>

              {createForm.clients_image && (
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span className="max-w-[180px] truncate font-semibold">
                    {createForm.clients_image.name}
                  </span>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-700">
                    (WebP)
                  </span>
                </div>
              )}
            </div>

            <p className="mt-2 text-[0.7rem] text-ink-500">
              The backend requires images in <strong>.webp</strong> format. If you choose a PNG or JPG, it is automatically converted to .webp before uploading.
            </p>

            {createForm.clients_image && (
              <div className="mt-3 size-20 overflow-hidden rounded-xl border border-cream-300 bg-white p-1 shadow-xs">
                <img
                  src={URL.createObjectURL(createForm.clients_image)}
                  alt="Preview"
                  className="size-full object-contain"
                />
              </div>
            )}
          </div>
        </form>
      </PanelModal>

      {/* Edit Client Modal */}
      <PanelModal
        isOpen={editTarget !== null}
        title="Edit Client"
        description="Update client brand name, logo image, or visibility status."
        icon={<Pencil className="size-5" />}
        size="md"
        onClose={() => setEditTarget(null)}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditTarget(null)}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEditSubmit}
              disabled={updateMutation.isPending || !editForm.clients_name.trim()}
              className="cursor-pointer rounded-full bg-maroon-700 px-5 text-xs font-bold text-white hover:bg-maroon-800 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-950">
              Client Name <span className="text-maroon-600">*</span>
            </label>
            <Input
              type="text"
              value={editForm.clients_name}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, clients_name: e.target.value }))
              }
              placeholder="e.g. Acme Corporation"
              required
              className="rounded-xl border-cream-300 bg-white text-xs"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-navy-950">
                Client Logo / Image
              </label>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[0.66rem] font-bold text-amber-800">
                WebP Required (.webp)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/webp,.webp,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  void handleFileChange(file, true)
                }}
                className="hidden"
                id="edit-client-image"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isConvertingImage}
                onClick={() => editFileInputRef.current?.click()}
                className="cursor-pointer gap-2 rounded-xl border-dashed border-cream-400 bg-cream-50 text-xs font-medium text-navy-800 hover:bg-cream-100"
              >
                <Upload className="size-3.5" />
                <span>
                  {isConvertingImage
                    ? 'Converting to WebP…'
                    : editForm.clients_image
                      ? 'Change File'
                      : editForm.existing_image_url
                        ? 'Replace Logo'
                        : 'Choose Logo'}
                </span>
              </Button>

              {editForm.clients_image && (
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span className="max-w-[180px] truncate font-semibold">
                    {editForm.clients_image.name}
                  </span>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-700">
                    (WebP)
                  </span>
                </div>
              )}
            </div>

            <p className="mt-2 text-[0.7rem] text-ink-500">
              The backend requires images in <strong>.webp</strong> format. If you choose a PNG or JPG, it is automatically converted to .webp before uploading.
            </p>

            {/* Existing or new image preview */}
            <div className="mt-3 flex items-center gap-3">
              {editForm.clients_image ? (
                <div className="size-20 overflow-hidden rounded-xl border border-cream-300 bg-white p-1 shadow-xs">
                  <img
                    src={URL.createObjectURL(editForm.clients_image)}
                    alt="New Preview"
                    className="size-full object-contain"
                  />
                </div>
              ) : editForm.existing_image_url ? (
                <div className="size-20 overflow-hidden rounded-xl border border-cream-300 bg-white p-1 shadow-xs">
                  <img
                    src={editForm.existing_image_url}
                    alt="Current Logo"
                    className="size-full object-contain"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-950">
              Status
            </label>
            <select
              value={editForm.clients_status}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  clients_status: e.target.value as ClientStatus,
                }))
              }
              className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs font-medium text-navy-900 focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </PanelModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        description={
          deleteTarget
            ? `Are you sure you want to permanently delete "${deleteTarget.clients_name}"? If the database prohibits deletion, it will be automatically deactivated.`
            : ''
        }
        confirmText={deleteMutation.isPending ? 'Deleting…' : 'Delete Client'}
        variant="danger"
      />
    </div>
  )
}

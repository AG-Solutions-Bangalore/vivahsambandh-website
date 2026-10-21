/**
 * @file src/module/super-admin/pages/EnquiriesPage.tsx
 * Enquiry management for the Super Admin Panel: list contact-form
 * enquiries, search them, move them through the Pending → Processing →
 * Completed lifecycle, inspect a record and delete it.
 */

import { useMemo, useState } from 'react'
import {
  CircleCheck,
  CircleX,
  Clock,
  Download,
  Eye,
  Inbox,
  RefreshCw,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
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
import { StatusActionGroup } from '../components/StatusActionGroup'
import { StatusBadge } from '../components/StatusBadge'
import { panelDescription } from '../navigation'
import { errorMessage } from '../hook/errors'
import { DEFAULT_PER_PAGE, useServerSearch } from '../hook/useServerList'
import {
  useDeleteEnquiryMutation,
  useEnquiriesQuery,
  useEnquiryQuery,
  useEnquiryReportQuery,
  useUpdateEnquiryStatusMutation,
} from '../hook/useEnquiries'
import { formatDate } from '../utils/format'
import type { EnquiryRecord, EnquiryStatus } from '../types'

const STATUS_FILTERS = ['All', 'Pending', 'Processing', 'Completed', 'Cancel'] as const


interface StatusChangeTarget {
  id: number
  label: string
  nextStatus: EnquiryStatus
}

/** Escapes a value for a CSV cell. */
function csvCell(value: string | number | null | undefined): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

/** Builds the CSV body used by the export. */
function toCsv(rows: EnquiryRecord[]): string {
  // The report endpoint does not always carry the timestamps, so the
  // "Received" column is only written when there is something to put in it.
  const hasReceived = rows.some((row) => row.created_at)

  const headers = [
    'ID',
    'Name',
    'Mobile',
    'Email',
    'Service',
    'Source',
    'Message',
    'Status',
    'UTM Medium',
    'UTM Source',
    'UTM Campaign',
    ...(hasReceived ? ['Received'] : []),
  ]

  const lines = [headers.map(csvCell).join(',')]

  for (const row of rows) {
    const columns = [
      row.id,
      row.full_name,
      row.mobile,
      row.email,
      row.service,
      row.source,
      row.message,
      row.status,
      row.utm_medium,
      row.utm_source,
      row.utm_campaign,
      ...(hasReceived ? [row.created_at] : []),
    ]

    lines.push(columns.map(csvCell).join(','))
  }

  return lines.join('\r\n')
}

/** Hands a CSV string to the browser as a download. */
function downloadCsv(rows: EnquiryRecord[]): void {
  // The BOM keeps Excel from reading UTF-8 names as mojibake.
  const blob = new Blob(['\uFEFF' + toCsv(rows)], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function EnquiriesPage() {
  const { searchInput, setSearchInput, searchTerm } = useServerSearch()
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [page, setPage] = useState(1)

  const {
    records: enquiries,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useEnquiriesQuery({
    search: searchTerm || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
  })

  const statusMutation = useUpdateEnquiryStatusMutation()
  const deleteMutation = useDeleteEnquiryMutation()
  const reportQuery = useEnquiryReportQuery(false)

  // Inspector state
  const [inspectingId, setInspectingId] = useState<number | null>(null)
  const {
    data: inspectedRecord,
    isLoading: isLoadingDetail,
    error: inspectError,
  } = useEnquiryQuery(inspectingId)

  // Status change confirmation
  const [statusTarget, setStatusTarget] = useState<StatusChangeTarget | null>(null)

  // Delete state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const deleteTarget = useMemo(
    () => enquiries.find((enquiry) => enquiry.id === deleteTargetId) ?? null,
    [enquiries, deleteTargetId],
  )

  // The API ignores the status parameter, so the lifecycle state is filtered
  // here.
  const filtered = useMemo(
    () =>
      statusFilter === 'All'
        ? enquiries
        : enquiries.filter((enquiry) => enquiry.status === (statusFilter as EnquiryStatus)),
    [enquiries, statusFilter],
  )

  const hasFilters = searchInput.trim() !== '' || statusFilter !== 'All'

  const handleStatusChange = () => {
    if (!statusTarget) return
    const target = statusTarget

    statusMutation.mutate(
      {
        id: target.id,
        status: target.nextStatus,
        successMessage: `Enquiry marked as ${target.nextStatus}.`,
      },
      {
        onSuccess: () => {
          setStatusTarget(null)
          if (inspectingId === target.id) setInspectingId(null)
        },
      },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    const target = deleteTarget

    deleteMutation.mutate(
      {
        id: target.id,
        successMessage: 'Enquiry deleted successfully.',
      },
      {
        onSuccess: () => {
          setDeleteTargetId(null)
          if (inspectingId === target.id) setInspectingId(null)
        },
      },
    )
  }

  const handleExport = async () => {
    const result = await reportQuery.refetch()
    const rows = result.data ?? []

    if (!rows.length) {
      toast.error('There are no enquiries to export.')
      return
    }

    downloadCsv(rows)
    toast.success(`Exported ${rows.length} enquiries.`)
  }

  const firstRow = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const lastRow = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Enquiries"
        description={panelDescription('/panel/enquiries')}
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
              <RefreshCw
                className={isFetching ? 'size-3.5 animate-spin' : 'size-3.5'}
                aria-hidden
              />
              <span>Refresh</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleExport()}
              disabled={reportQuery.isFetching}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              <Download
                className={reportQuery.isFetching ? 'size-3.5 animate-pulse' : 'size-3.5'}
                aria-hidden
              />
              <span>Export CSV</span>
            </Button>
          </>
        }
      />

      <PanelCard flush>
        <PanelToolbar
          search={
            <PanelSearch
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search name, mobile, email or message…"
            />
          }
        >
          <PanelFilterSelect
            id="filter-enquiry-status"
            label="Status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
            showStatusDots
          />
        </PanelToolbar>

        {isLoading ? (
          <PanelTableSkeleton rows={6} columns={5} />
        ) : error ? (
          <PanelError
            title="Could not load enquiries"
            message={errorMessage(error, 'Failed to load the enquiry list.')}
            onRetry={() => void refetch()}
          />
        ) : filtered.length === 0 ? (
          <PanelEmpty
            icon={<Inbox className="size-6" />}
            title="No Enquiries Found"
            description={
              hasFilters
                ? 'No enquiries match your current filter criteria.'
                : 'No contact-form enquiries have come in yet.'
            }
            action={
              hasFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setSearchInput('')
                    setStatusFilter('All')
                    setPage(1)
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
            caption="Contact-form enquiries with contact details, source and status"
            head={
              <>
                <PanelTableHeadCell>Contact</PanelTableHeadCell>
                <PanelTableHeadCell>Enquiry</PanelTableHeadCell>
                <PanelTableHeadCell>Source</PanelTableHeadCell>
                <PanelTableHeadCell>Status</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
              </>
            }
          >
            {filtered.map((enquiry) => (
              <tr key={enquiry.id} className="transition-colors hover:bg-cream-50/70">
                <td className="max-w-xs px-4 py-3.5">
                  <p className="text-sm font-bold text-navy-900">
                    {enquiry.full_name || 'Anonymous'}
                  </p>
                  {enquiry.mobile ? (
                    <p className="mt-0.5 text-[0.7rem] text-ink-500">{enquiry.mobile}</p>
                  ) : null}
                  {enquiry.email ? (
                    <p className="mt-0.5 truncate text-[0.7rem] text-ink-500">
                      {enquiry.email}
                    </p>
                  ) : null}
                </td>

                <td className="max-w-md px-4 py-3.5">
                  {enquiry.service ? (
                    <span className="mb-1 inline-flex items-center rounded-full border border-gold-300 bg-gold-50 px-2 py-0.5 text-[0.68rem] font-bold text-gold-800">
                      {enquiry.service}
                    </span>
                  ) : null}
                  {enquiry.message ? (
                    <p className="line-clamp-2 leading-relaxed text-ink-600">
                      {enquiry.message}
                    </p>
                  ) : (
                    <span className="text-[0.7rem] text-ink-400 italic">No message</span>
                  )}
                </td>

                <td className="px-4 py-3.5">
                  <p className="text-ink-600">{enquiry.source || '—'}</p>
                  {enquiry.utm_source || enquiry.utm_campaign ? (
                    <p className="mt-0.5 text-[0.68rem] text-ink-400">
                      {[enquiry.utm_source, enquiry.utm_campaign].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                </td>

                <td className="px-4 py-3.5">
                  <StatusBadge status={enquiry.status} size="sm" />
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setInspectingId(enquiry.id)}
                      title="View enquiry details"
                      className="cursor-pointer rounded-full border-navy-200 text-[0.7rem] text-navy-900 hover:bg-navy-50"
                    >
                      <Eye className="size-3 text-navy-700" aria-hidden />
                      <span>View</span>
                    </Button>

                    <StatusActionGroup
                      compact
                      currentStatus={enquiry.status}
                      onSelect={(next) =>
                        setStatusTarget({
                          id: enquiry.id,
                          label: enquiry.full_name || enquiry.email || 'this enquiry',
                          nextStatus: next as EnquiryStatus,
                        })
                      }
                      actions={[
                        {
                          status: 'Pending',
                          label: 'Pending',
                          icon: <RotateCcw className="size-3 text-ink-500" aria-hidden />,
                          tone: 'warn',
                        },
                        {
                          status: 'Processing',
                          label: 'Processing',
                          icon: <Clock className="size-3 text-gold-600" aria-hidden />,
                          tone: 'info',
                        },
                        {
                          status: 'Completed',
                          label: 'Completed',
                          icon: <CircleCheck className="size-3 text-emerald-600" aria-hidden />,
                          tone: 'success',
                        },
                        {
                          status: 'Cancel',
                          label: 'Cancel',
                          icon: <CircleX className="size-3 text-maroon-600" aria-hidden />,
                          tone: 'danger',
                        },
                      ]}
                    />

                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setDeleteTargetId(enquiry.id)}
                      title="Delete enquiry"
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
                <strong>{meta.total}</strong> enquiries
              </span>
            }
          />
        </PanelTableFooter>
      </PanelCard>

      {/* Inspect Enquiry Modal (GET /enquiry/{id}) */}
      <PanelModal
        isOpen={inspectingId !== null}
        title={
          inspectedRecord
            ? inspectedRecord.full_name || 'Enquiry'
            : `Enquiry #${inspectingId ?? ''}`
        }
        description="Contact-form enquiry retrieved from the enquiry endpoint."
        icon={<Inbox className="size-5" />}
        onClose={() => setInspectingId(null)}
        footer={
          <>
            {inspectedRecord ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteTargetId(inspectedRecord.id)}
                className="mr-auto cursor-pointer rounded-full text-xs font-semibold"
              >
                <Trash2 className="size-3.5" aria-hidden />
                <span>Delete Enquiry</span>
              </Button>
            ) : null}
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
        }
      >
        {isLoadingDetail ? (
          <SkeletonText lines={6} className="py-6" />
        ) : inspectError ? (
          <p className="py-8 text-center text-xs text-maroon-600">
            {errorMessage(inspectError, 'Could not retrieve the enquiry record.')}
          </p>
        ) : inspectedRecord ? (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={inspectedRecord.status} size="sm" />
              {inspectedRecord.service ? (
                <span className="inline-flex items-center rounded-full border border-gold-300 bg-gold-50 px-2 py-0.5 text-[0.68rem] font-bold text-gold-800">
                  {inspectedRecord.service}
                </span>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Name
                </span>
                <p className="text-ink-700">{inspectedRecord.full_name || '—'}</p>
              </div>
              <div>
                <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Mobile
                </span>
                <p className="text-ink-700">{inspectedRecord.mobile || '—'}</p>
              </div>
              <div>
                <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Email
                </span>
                <p className="break-all text-ink-700">{inspectedRecord.email || '—'}</p>
              </div>
              <div>
                <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Source
                </span>
                <p className="text-ink-700">{inspectedRecord.source || '—'}</p>
              </div>
            </div>

            <div>
              <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                Message
              </span>
              <div className="whitespace-pre-wrap rounded-2xl border border-cream-300/80 bg-cream-50/70 p-4 leading-relaxed text-ink-700">
                {inspectedRecord.message || 'No message recorded.'}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Campaign
                </span>
                <p className="text-ink-700">
                  {[inspectedRecord.utm_source, inspectedRecord.utm_medium, inspectedRecord.utm_campaign]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </p>
              </div>
              <div>
                <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Received
                </span>
                <p className="text-ink-700">
                  {formatDate(inspectedRecord.created_at)}
                </p>
              </div>
            </div>

            {inspectedRecord.status !== 'Completed' &&
            inspectedRecord.status !== 'Cancel' ? (
              <div className="flex flex-wrap items-center gap-2 border-t border-cream-300/80 pt-4">
                <span className="text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Move to
                </span>
                <StatusActionGroup
                  currentStatus={inspectedRecord.status}
                  onSelect={(next) =>
                    setStatusTarget({
                      id: inspectedRecord.id,
                      label:
                        inspectedRecord.full_name ||
                        inspectedRecord.email ||
                        'this enquiry',
                      nextStatus: next as EnquiryStatus,
                    })
                  }
                  actions={[
                    {
                      status: 'Pending',
                      label: 'Pending',
                      icon: <RotateCcw className="size-3 text-ink-500" aria-hidden />,
                      tone: 'warn',
                    },
                    {
                      status: 'Processing',
                      label: 'Processing',
                      icon: <Clock className="size-3 text-gold-600" aria-hidden />,
                      tone: 'info',
                    },
                    {
                      status: 'Completed',
                      label: 'Completed',
                      icon: <CircleCheck className="size-3 text-emerald-600" aria-hidden />,
                      tone: 'success',
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
            ) : null}
          </div>
        ) : (
          <p className="py-8 text-center text-xs text-ink-500">
            Enquiry record could not be found.
          </p>
        )}
      </PanelModal>

      {/* Status Change Confirmation */}
      {statusTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Update Enquiry Status"
          description={`Move "${statusTarget.label}" to "${statusTarget.nextStatus}"? The visitor record keeps every field; only the pipeline state changes.`}
          confirmText={`Yes, mark ${statusTarget.nextStatus}`}
          cancelText="Cancel"
          variant={
            statusTarget.nextStatus === 'Cancel' ? 'danger' : 'primary'
          }
          isLoading={statusMutation.isPending}
          onConfirm={handleStatusChange}
          onClose={() => setStatusTarget(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Enquiry"
          description={`Are you sure you want to permanently delete the enquiry from "${deleteTarget.full_name || deleteTarget.email || 'this visitor'}"? This cannot be undone.`}
          confirmText="Yes, Delete Enquiry"
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

/**
 * @file src/module/super-admin/pages/EnquiriesPage.tsx
 * Enquiry management for the Super Admin Panel: list contact-form
 * enquiries, search them, move them through the Pending → Processing →
 * Completed lifecycle, inspect a record and delete it.
 */

import { useMemo, useState } from 'react'
import {
  BarChart3,
  CircleCheck,
  CircleX,
  Clock,
  Download,
  Eye,
  FileJson,
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
import { RowStatusSelect } from '../components/RowStatusSelect'
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
import {
  downloadEnquiriesCsv,
  downloadEnquiriesJson,
  summariseEnquiries,
} from '../utils/enquiryExport'
import type { EnquiryStatus } from '../types'

const STATUS_FILTERS = ['All', 'Pending', 'Processing', 'Completed', 'Cancel'] as const

const STATUS_OPTIONS = STATUS_FILTERS.filter(
  (status): status is EnquiryStatus => status !== 'All',
)


interface StatusChangeTarget {
  id: number
  label: string
  nextStatus: EnquiryStatus
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

  // The report is fetched from `GET /getEnquiryReport` — only when an admin
  // asks for the report or a download.
  const [isReportOpen, setIsReportOpen] = useState(false)
  const reportQuery = useEnquiryReportQuery(isReportOpen)

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

  /**
   * The report rows with the panel's own filters applied.
   *
   * `/getEnquiryReport` ignores every query parameter and answers with the
   * complete list, so the search term and the status filter are applied
   * here — the download then matches what the admin is looking at.
   */
  const reportRows = useMemo(() => {
    const rows = reportQuery.data ?? []
    const term = searchTerm.toLowerCase()

    return rows.filter((enquiry) => {
      const matchesSearch =
        !term ||
        (enquiry.full_name ?? '').toLowerCase().includes(term) ||
        (enquiry.mobile ?? '').toLowerCase().includes(term) ||
        (enquiry.email ?? '').toLowerCase().includes(term) ||
        (enquiry.service ?? '').toLowerCase().includes(term) ||
        (enquiry.source ?? '').toLowerCase().includes(term) ||
        (enquiry.message ?? '').toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === 'All' || enquiry.status === (statusFilter as EnquiryStatus)

      return matchesSearch && matchesStatus
    })
  }, [reportQuery.data, searchTerm, statusFilter])

  const reportSummary = useMemo(() => summariseEnquiries(reportRows), [reportRows])

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

  /**
   * Downloads the report rows.
   *
   * The report is re-read from `GET /getEnquiryReport` first so the file
   * always reflects the server, then the panel's filters are applied so the
   * download matches the rows the admin is looking at.
   */
  const handleDownload = async (format: 'csv' | 'json') => {
    const result = await reportQuery.refetch()
    const rows = result.data ?? []

    if (!rows.length) {
      toast.error('There are no enquiries to export.')
      return
    }

    const term = searchTerm.toLowerCase()
    const filteredRows = rows.filter((enquiry) => {
      const matchesSearch =
        !term ||
        (enquiry.full_name ?? '').toLowerCase().includes(term) ||
        (enquiry.mobile ?? '').toLowerCase().includes(term) ||
        (enquiry.email ?? '').toLowerCase().includes(term) ||
        (enquiry.service ?? '').toLowerCase().includes(term) ||
        (enquiry.source ?? '').toLowerCase().includes(term) ||
        (enquiry.message ?? '').toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === 'All' || enquiry.status === (statusFilter as EnquiryStatus)

      return matchesSearch && matchesStatus
    })

    if (!filteredRows.length) {
      toast.error('No enquiries match the current filters.')
      return
    }

    if (format === 'json') {
      downloadEnquiriesJson(filteredRows)
    } else {
      downloadEnquiriesCsv(filteredRows)
    }

    toast.success(`Downloaded ${filteredRows.length} enquiries.`)
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
              onClick={() => setIsReportOpen(true)}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              <BarChart3 className="size-3.5" aria-hidden />
              <span>Report</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleDownload('csv')}
              disabled={reportQuery.isFetching}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              <Download
                className={reportQuery.isFetching ? 'size-3.5 animate-pulse' : 'size-3.5'}
                aria-hidden
              />
              <span>Download CSV</span>
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
                      size="icon-xs"
                      variant="outline"
                      onClick={() => setInspectingId(enquiry.id)}
                      title="View enquiry details"
                      aria-label="View enquiry details"
                      className="cursor-pointer rounded-full border-navy-200 text-navy-700 hover:bg-navy-50"
                    >
                      <Eye className="size-3.5 text-navy-700" aria-hidden />
                    </Button>

                    <RowStatusSelect
                      value={enquiry.status as EnquiryStatus}
                      options={STATUS_OPTIONS}
                      label={`Change status for ${enquiry.full_name || enquiry.email || 'this enquiry'}`}
                      onSelect={(nextStatus) =>
                        setStatusTarget({
                          id: enquiry.id,
                          label:
                            enquiry.full_name || enquiry.email || 'this enquiry',
                          nextStatus,
                        })
                      }
                    />

                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      onClick={() => setDeleteTargetId(enquiry.id)}
                      title="Delete enquiry"
                      aria-label="Delete enquiry"
                      className="cursor-pointer rounded-full border-maroon-200 bg-maroon-50 text-maroon-800 hover:bg-maroon-100"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
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

      {/* Enquiry Report (GET /getEnquiryReport) */}
      <PanelModal
        isOpen={isReportOpen}
        title="Enquiry Report"
        description="Figures and downloads built from the enquiry report endpoint."
        icon={<BarChart3 className="size-5" />}
        size="lg"
        onClose={() => setIsReportOpen(false)}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleDownload('json')}
              disabled={reportQuery.isFetching || !reportRows.length}
              className="mr-auto cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              <FileJson className="size-3.5" aria-hidden />
              <span>Download JSON</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReportOpen(false)}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => void handleDownload('csv')}
              disabled={reportQuery.isFetching || !reportRows.length}
              className="cursor-pointer rounded-full bg-navy-900 px-5 text-xs font-bold text-white hover:bg-navy-700"
            >
              <Download className="size-3.5" aria-hidden />
              <span>Download CSV</span>
            </Button>
          </>
        }
      >
        {reportQuery.isLoading ? (
          <SkeletonText lines={6} className="py-6" />
        ) : reportQuery.error ? (
          <p className="py-8 text-center text-xs text-maroon-600">
            {errorMessage(reportQuery.error, 'Could not load the enquiry report.')}
          </p>
        ) : (
          <div className="space-y-5 text-xs">
            <p className="rounded-xl border border-cream-300/80 bg-cream-50/70 px-3 py-2 text-ink-500">
              {reportSummary.total} of {(reportQuery.data ?? []).length} enquiries
              {hasFilters ? ' match the current search and status filter' : ''}. The
              downloads contain exactly these rows.
            </p>

            {/* Headline figure */}
            <div className="rounded-2xl border border-gold-500/25 bg-gold-50/60 p-4">
              <span className="text-[0.66rem] font-bold tracking-[0.14em] text-ink-500 uppercase">
                Enquiries in report
              </span>
              <p className="mt-2 font-display text-4xl font-bold tabular-nums text-navy-900">
                {reportSummary.total}
              </p>
            </div>

            {/* Status breakdown */}
            <div>
              <span className="mb-2 block text-[0.66rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                By status
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {reportSummary.byStatus.map((entry) => (
                  <div
                    key={entry.status}
                    className="rounded-xl border border-cream-300 bg-white px-3 py-2"
                  >
                    <StatusBadge status={entry.status} size="sm" />
                    <p className="mt-1.5 font-display text-xl font-bold tabular-nums text-navy-900">
                      {entry.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Source / campaign breakdown */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-2 block text-[0.66rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Top sources
                </span>
                {reportSummary.bySource.length ? (
                  <ul className="space-y-1.5">
                    {reportSummary.bySource.slice(0, 5).map((entry) => (
                      <li
                        key={entry.label}
                        className="flex items-center justify-between gap-3 rounded-lg border border-cream-300/80 bg-cream-50/60 px-3 py-1.5"
                      >
                        <span className="truncate text-ink-700">{entry.label}</span>
                        <span className="font-display text-sm font-bold tabular-nums text-navy-900">
                          {entry.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ink-400 italic">No source recorded.</p>
                )}
              </div>

              <div>
                <span className="mb-2 block text-[0.66rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Campaigns &amp; channels
                </span>
                {reportSummary.byCampaign.length || reportSummary.byMedium.length ? (
                  <ul className="space-y-1.5">
                    {reportSummary.byCampaign.slice(0, 3).map((entry) => (
                      <li
                        key={`campaign-${entry.label}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-cream-300/80 bg-cream-50/60 px-3 py-1.5"
                      >
                        <span className="truncate text-ink-700">
                          {entry.label}
                          <span className="ml-1 text-ink-400">campaign</span>
                        </span>
                        <span className="font-display text-sm font-bold tabular-nums text-navy-900">
                          {entry.count}
                        </span>
                      </li>
                    ))}
                    {reportSummary.byMedium.slice(0, 3).map((entry) => (
                      <li
                        key={`medium-${entry.label}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-cream-300/80 bg-cream-50/60 px-3 py-1.5"
                      >
                        <span className="truncate text-ink-700">
                          {entry.label}
                          <span className="ml-1 text-ink-400">medium</span>
                        </span>
                        <span className="font-display text-sm font-bold tabular-nums text-navy-900">
                          {entry.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ink-400 italic">No campaign recorded.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </PanelModal>

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

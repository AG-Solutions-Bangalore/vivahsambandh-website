/**
 * @file src/module/super-admin/pages/FaqsPage.tsx
 * FAQ management for the Super Admin Panel: list FAQ groups, view nested Q&As,
 * toggle status, and delete.
 *
 * Creating and editing happen on their own screens — a group holds a whole
 * stack of questions, which is far too much to edit inside a dialog — so
 * this page only links to them.
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { PanelModal } from '../components/PanelModal'
import { PanelPagination } from '../components/PanelPagination'
import { PanelSearch } from '../components/PanelSearch'
import { PanelToolbar } from '../components/PanelToolbar'
import { PanelEmpty, PanelError } from '../components/PanelState'
import { PanelTableSkeleton } from '../components/PanelSkeleton'
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
import {
  useDeleteFaqMutation,
  useFaqQuery,
  useFaqsQuery,
  useUpdateFaqStatusMutation,
} from '../hook/useFaqs'
import type { FaqRecord, FaqStatus } from '../types'

const STATUS_FILTERS = ['All', 'Active', 'Inactive'] as const

const LIST_PATH = '/panel/faqs'

export default function FaqsPage() {
  const navigate = useNavigate()
  const { searchInput, setSearchInput, searchTerm } = useServerSearch()
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [page, setPage] = useState(1)

  const {
    records: faqs,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFaqsQuery({
    search: searchTerm || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
  })

  const statusMutation = useUpdateFaqStatusMutation()
  const deleteMutation = useDeleteFaqMutation()

  // Inspector state
  const [inspectingId, setInspectingId] = useState<number | null>(null)
  const {
    data: inspectedRecord,
    isLoading: isLoadingDetail,
  } = useFaqQuery(inspectingId)

  // Delete FAQ group state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const deleteTarget = useMemo(
    () => faqs.find((f) => f.id === deleteTargetId) ?? null,
    [faqs, deleteTargetId],
  )

  // The API filters the search on the server; the status column is not
  // filterable there yet, so it is applied to the rows of the current page.
  const filtered = useMemo(
    () =>
      statusFilter === 'All'
        ? faqs
        : faqs.filter((item) => item.faq_status.toLowerCase() === statusFilter.toLowerCase()),
    [faqs, statusFilter],
  )

  // Status toggle
  const handleToggleStatus = (record: FaqRecord) => {
    const nextStatus: FaqStatus = record.faq_status === 'Active' ? 'Inactive' : 'Active'
    statusMutation.mutate({
      id: record.id,
      status: nextStatus,
      successMessage: `FAQ group set to ${nextStatus}.`,
    })
  }

  // Confirm delete group
  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    deleteMutation.mutate(
      {
        id,
        successMessage: 'FAQ group deleted successfully.',
      },
      {
        onSuccess: () => {
          setDeleteTargetId(null)
          if (inspectingId === id) setInspectingId(null)
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="FAQ Management"
        description={panelDescription('/panel/faqs')}
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
                className={cn('size-3.5', isFetching && 'animate-spin')}
                aria-hidden
              />
              <span>Refresh</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => navigate(`${LIST_PATH}/new`)}
              className="cursor-pointer rounded-full bg-gold-600 text-xs font-bold text-white shadow-gold hover:bg-gold-700"
            >
              <Plus className="size-4" aria-hidden />
              <span>Add FAQ Group</span>
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
              placeholder="Search by target area or questions…"
            />
          }
        >
          <PanelFilterSelect
            id="filter-faq-status"
            label="Status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
            showStatusDots
          />
        </PanelToolbar>

        {isLoading ? (
          <PanelTableSkeleton rows={5} columns={5} />
        ) : error ? (
          <PanelError
            message={errorMessage(error, 'Could not load FAQs.')}
            onRetry={() => void refetch()}
          />
        ) : filtered.length === 0 ? (
          <PanelEmpty
            title="No FAQ groups found"
            description={
              searchInput || statusFilter !== 'All'
                ? 'Try adjusting your search query or filter.'
                : 'Get started by creating your first FAQ accordion group.'
            }
            action={
              <Button
                type="button"
                size="sm"
                onClick={() => navigate(`${LIST_PATH}/new`)}
                className="cursor-pointer rounded-full bg-gold-600 text-xs font-bold text-white shadow-gold hover:bg-gold-700"
              >
                <Plus className="size-4" aria-hidden />
                <span>Create FAQ Group</span>
              </Button>
            }
          />
        ) : (
          <PanelTable
            head={
              <>
                <PanelTableHeadCell>SI/NO</PanelTableHeadCell>
                <PanelTableHeadCell>Target Section</PanelTableHeadCell>
                <PanelTableHeadCell>Accordion Structure</PanelTableHeadCell>
                <PanelTableHeadCell>Status</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
              </>
            }
          >
            {filtered.map((item, index) => {
              return (
                <tr key={item.id} className="transition-colors hover:bg-cream-100/40">
                  <td className="px-4 py-3 text-xs font-bold text-navy-800">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-navy-900">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold-300 bg-gold-50/90 px-2.5 py-1 text-xs font-bold text-gold-900 shadow-2xs">
                      <Layers className="size-3 text-gold-600" aria-hidden />
                      {item.faq_for}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-600">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-cream-50 px-2.5 py-0.5 text-xs font-semibold text-navy-800">
                      <Layers className="size-3 text-gold-600" />
                      <span>Multi-Q&A Accordion</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.faq_status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => setInspectingId(item.id)}
                        title="View Questions"
                        className="cursor-pointer rounded-full border-navy-200 text-[0.7rem] text-navy-900 hover:bg-navy-50"
                      >
                        <Eye className="size-3 text-navy-700" aria-hidden />
                        <span>View</span>
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => navigate(`${LIST_PATH}/${item.id}/edit`)}
                        title="Edit FAQ Group"
                        className="cursor-pointer rounded-full border-gold-300 bg-gold-50/50 text-[0.7rem] font-bold text-gold-900 hover:bg-gold-100"
                      >
                        <Pencil className="size-3" aria-hidden />
                        <span>Edit</span>
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => handleToggleStatus(item)}
                        disabled={statusMutation.isPending}
                        title={`Set to ${item.faq_status === 'Active' ? 'Inactive' : 'Active'}`}
                        className={cn(
                          'cursor-pointer rounded-full text-[0.7rem] font-bold',
                          item.faq_status === 'Active'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            : 'border-cream-300 bg-cream-50 text-ink-500 hover:bg-cream-100',
                        )}
                      >
                        {item.faq_status === 'Active' ? (
                          <span className="flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-emerald-600" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-ink-400" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => setDeleteTargetId(item.id)}
                        title="Delete FAQ Group"
                        className="cursor-pointer rounded-full border-maroon-200 bg-maroon-50 text-[0.7rem] text-maroon-800 hover:bg-maroon-100"
                      >
                        <Trash2 className="size-3" aria-hidden />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </PanelTable>
        )}

        <PanelTableFooter>
          <PanelPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={isFetching}
            summary={
              <span>
                Showing <strong>{filtered.length}</strong> of{' '}
                <strong>{meta.total}</strong> FAQ groups
              </span>
            }
          />
        </PanelTableFooter>
      </PanelCard>

      {/* Inspect/View Modal */}
      <PanelModal
        isOpen={inspectingId !== null}
        onClose={() => setInspectingId(null)}
        title={
          inspectedRecord
            ? `FAQ Group: ${inspectedRecord.faq_for}`
            : 'FAQ Group Details'
        }
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const target = inspectedRecord
                setInspectingId(null)
                if (target) setDeleteTargetId(target.id)
              }}
              className="cursor-pointer gap-1.5 rounded-full border-maroon-200 bg-maroon-50 text-xs font-bold text-maroon-800 hover:bg-maroon-100"
            >
              <Trash2 className="size-3.5" />
              <span>Delete Group</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = inspectedRecord
                  setInspectingId(null)
                  if (target) navigate(`${LIST_PATH}/${target.id}/edit`)
                }}
                className="cursor-pointer gap-1.5 rounded-full border-gold-300 bg-gold-50 text-xs font-bold text-gold-900 hover:bg-gold-100"
              >
                <Pencil className="size-3.5" />
                <span>Edit Group</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setInspectingId(null)}
                className="cursor-pointer rounded-full bg-navy-900 px-5 text-xs font-bold text-white hover:bg-navy-700"
              >
                Done
              </Button>
            </div>
          </div>
        }
      >
        {isLoadingDetail ? (
          <div className="space-y-4 py-12 text-center text-xs text-ink-500">
            <RefreshCw className="mx-auto size-5 animate-spin text-gold-600" />
            Loading FAQ details…
          </div>
        ) : inspectedRecord ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div>
                <span className="text-xs font-semibold text-ink-500">Target Area:</span>
                <span className="ml-2 font-bold text-navy-900">{inspectedRecord.faq_for}</span>
              </div>
              <StatusBadge status={inspectedRecord.faq_status} />
            </div>

            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <h4 className="text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase">
                Questions & Answers ({inspectedRecord.subs?.length ?? 0})
              </h4>
              {!inspectedRecord.subs || inspectedRecord.subs.length === 0 ? (
                <p className="text-xs text-ink-500 italic">No questions in this group.</p>
              ) : (
                inspectedRecord.subs.map((sub, idx) => (
                  <div
                    key={sub.id ?? idx}
                    className="rounded-xl border border-cream-200 bg-cream-50/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {sub.faq_heading && (
                          <span className="mb-1 block text-[10px] font-bold tracking-wider text-gold-700 uppercase">
                            {sub.faq_heading}
                          </span>
                        )}
                        <h5 className="text-xs font-bold text-navy-900 leading-snug">
                          {idx + 1}. {sub.faq_que}
                        </h5>
                      </div>
                      <span className="shrink-0 rounded-md border border-cream-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-ink-600 shadow-2xs">
                        Order {sub.faq_sort}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-ink-800 whitespace-pre-wrap">
                      {sub.faq_ans}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </PanelModal>

      {/* Delete Group Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Delete FAQ Group"
          description={`Are you sure you want to delete the FAQ group for "${deleteTarget.faq_for}"? This will delete all ${deleteTarget.subs?.length ?? 0} questions inside it.`}
          confirmText="Yes, Delete Group"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  )
}

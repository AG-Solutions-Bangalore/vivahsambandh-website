/**
 * @file src/module/super-admin/pages/FaqsPage.tsx
 * FAQ management for the Super Admin Panel: list FAQ groups, view nested Q&As,
 * create new FAQ groups with sub-items, edit questions, toggle status, and delete.
 */

import { useMemo, useState } from 'react'
import {
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from 'cn'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { PanelModal } from '../components/PanelModal'
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
import {
  useCreateFaqMutation,
  useDeleteFaqMutation,
  useDeleteFaqSubMutation,
  useFaqQuery,
  useFaqsQuery,
  useUpdateFaqMutation,
  useUpdateFaqStatusMutation,
} from '../hook/useFaqs'
import { fetchFaqById } from '../services/faqApi'
import type { FaqPayload, FaqRecord, FaqStatus } from '../types'

const STATUS_FILTERS = ['All', 'Active', 'Inactive'] as const

interface SubFormState {
  id?: number
  faq_sort: number | string
  faq_heading: string
  faq_que: string
  faq_ans: string
  faq_status: FaqStatus
}

interface FaqFormState {
  faq_for: string
  faq_status: FaqStatus
  subs: SubFormState[]
}

const DEFAULT_SUB: SubFormState = {
  faq_sort: 1,
  faq_heading: '',
  faq_que: '',
  faq_ans: '',
  faq_status: 'Active',
}

const DEFAULT_FORM: FaqFormState = {
  faq_for: 'home',
  faq_status: 'Active',
  subs: [{ ...DEFAULT_SUB }],
}

export default function FaqsPage() {
  const {
    data: faqs = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFaqsQuery()

  const createMutation = useCreateFaqMutation()
  const updateMutation = useUpdateFaqMutation()
  const statusMutation = useUpdateFaqStatusMutation()
  const deleteMutation = useDeleteFaqMutation()
  const deleteSubMutation = useDeleteFaqSubMutation()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<FaqRecord | null>(null)
  const [formState, setFormState] = useState<FaqFormState>(DEFAULT_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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

  // Filtered rows
  const filtered = useMemo(() => {
    return faqs.filter((item) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.faq_for.toLowerCase().includes(q) ||
        item.subs?.some(
          (s) =>
            s.faq_que.toLowerCase().includes(q) ||
            s.faq_ans.toLowerCase().includes(q) ||
            s.faq_heading.toLowerCase().includes(q),
        )

      const matchesStatus =
        statusFilter === 'All' ||
        item.faq_status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [faqs, searchQuery, statusFilter])

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormState({
      faq_for: 'home',
      faq_status: 'Active',
      subs: [{ ...DEFAULT_SUB, faq_sort: 1 }],
    })
    setFormErrors({})
    setIsCreateOpen(true)
  }

  const [isLoadingEdit, setIsLoadingEdit] = useState(false)

  // Open Edit Modal
  const handleOpenEdit = async (record: FaqRecord) => {
    setIsCreateOpen(false)
    setFormErrors({})
    setEditingRecord(record)
    setIsLoadingEdit(true)

    setFormState({
      faq_for: record.faq_for,
      faq_status: record.faq_status,
      subs:
        record.subs && record.subs.length > 0
          ? record.subs.map((s, idx) => ({
              id: s.id,
              faq_sort: s.faq_sort ?? idx + 1,
              faq_heading: s.faq_heading || '',
              faq_que: s.faq_que || '',
              faq_ans: s.faq_ans || '',
              faq_status: (s.faq_status as FaqStatus) || 'Active',
            }))
          : [{ ...DEFAULT_SUB, faq_sort: 1 }],
    })

    try {
      const res = await fetchFaqById(record.id)
      if (res.data) {
        const full = res.data
        setEditingRecord(full)
        setFormState({
          faq_for: full.faq_for,
          faq_status: full.faq_status,
          subs:
            full.subs && full.subs.length > 0
              ? full.subs.map((s, idx) => ({
                  id: s.id,
                  faq_sort: s.faq_sort ?? idx + 1,
                  faq_heading: s.faq_heading || '',
                  faq_que: s.faq_que || '',
                  faq_ans: s.faq_ans || '',
                  faq_status: (s.faq_status as FaqStatus) || 'Active',
                }))
              : [{ ...DEFAULT_SUB, faq_sort: 1 }],
        })
      }
    } catch {
      // Keep existing state
    } finally {
      setIsLoadingEdit(false)
    }
  }

  // Sub-items management in form
  const handleAddSub = () => {
    setFormState((prev) => ({
      ...prev,
      subs: [
        ...prev.subs,
        {
          faq_sort: prev.subs.length + 1,
          faq_heading: '',
          faq_que: '',
          faq_ans: '',
          faq_status: 'Active',
        },
      ],
    }))
  }

  const handleUpdateSub = (index: number, patch: Partial<SubFormState>) => {
    setFormState((prev) => {
      const nextSubs = [...prev.subs]
      nextSubs[index] = { ...nextSubs[index], ...patch }
      return { ...prev, subs: nextSubs }
    })
  }

  const handleRemoveSub = async (index: number) => {
    const sub = formState.subs[index]
    if (sub.id && editingRecord) {
      if (!confirm('Are you sure you want to permanently delete this sub-question?')) {
        return
      }
      try {
        await deleteSubMutation.mutateAsync({
          subId: sub.id,
          faqId: editingRecord.id,
          successMessage: 'Sub-question deleted.',
        })
      } catch {
        return
      }
    }
    setFormState((prev) => {
      const next = prev.subs.filter((_, i) => i !== index)
      return {
        ...prev,
        subs: next.length > 0 ? next : [{ ...DEFAULT_SUB, faq_sort: 1 }],
      }
    })
  }

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formState.faq_for.trim()) {
      errors.faq_for = 'Section/Target (e.g. "home") is required.'
    }

    if (formState.subs.length === 0) {
      errors.subs = 'At least one question is required.'
    } else {
      formState.subs.forEach((sub, i) => {
        if (!sub.faq_que.trim()) {
          errors[`sub_${i}_que`] = `Question ${i + 1} is required.`
        }
        if (!sub.faq_ans.trim()) {
          errors[`sub_${i}_ans`] = `Answer ${i + 1} is required.`
        }
      })
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save Create
  const handleCreateSubmit = async () => {
    if (!validateForm()) return

    const payload: FaqPayload = {
      faq_for: formState.faq_for.trim(),
      faq_status: formState.faq_status,
      subs: formState.subs.map((s, idx) => ({
        faq_sort: s.faq_sort || idx + 1,
        faq_for: formState.faq_for.trim(),
        faq_heading: s.faq_heading.trim(),
        faq_que: s.faq_que.trim(),
        faq_ans: s.faq_ans.trim(),
        faq_status: s.faq_status === 'Active' ? 1 : 0,
      })),
    }

    try {
      await createMutation.mutateAsync({
        payload,
        successMessage: `FAQ group for "${payload.faq_for}" created successfully!`,
      })
      setIsCreateOpen(false)
    } catch {
      // toast shown by mutation
    }
  }

  // Save Edit
  const handleEditSubmit = async () => {
    if (!editingRecord || !validateForm()) return

    const payload: FaqPayload = {
      faq_for: formState.faq_for.trim(),
      faq_status: formState.faq_status,
      subs: formState.subs.map((s, idx) => ({
        id: s.id,
        faq_sort: s.faq_sort || idx + 1,
        faq_for: formState.faq_for.trim(),
        faq_heading: s.faq_heading.trim(),
        faq_que: s.faq_que.trim(),
        faq_ans: s.faq_ans.trim(),
        faq_status: s.faq_status === 'Active' ? 1 : 0,
      })),
    }

    try {
      await updateMutation.mutateAsync({
        id: editingRecord.id,
        payload,
        successMessage: `FAQ group for "${payload.faq_for}" updated successfully!`,
      })
      setEditingRecord(null)
    } catch {
      // toast shown by mutation
    }
  }

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
              onClick={handleOpenCreate}
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
              value={searchQuery}
              onChange={setSearchQuery}
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
              searchQuery || statusFilter !== 'All'
                ? 'Try adjusting your search query or filter.'
                : 'Get started by creating your first FAQ accordion group.'
            }
            action={
              <Button
                type="button"
                size="sm"
                onClick={handleOpenCreate}
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
                <PanelTableHeadCell>ID</PanelTableHeadCell>
                <PanelTableHeadCell>Target Section</PanelTableHeadCell>
                <PanelTableHeadCell>Accordion Structure</PanelTableHeadCell>
                <PanelTableHeadCell>Status</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
              </>
            }
          >
            {filtered.map((item) => {
              return (
                <tr key={item.id} className="transition-colors hover:bg-cream-100/40">
                  <td className="px-4 py-3 text-xs font-bold text-navy-900">
                    {item.id}
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
                        onClick={() => void handleOpenEdit(item)}
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
          <span>
            Showing <strong>{filtered.length}</strong> of{' '}
            <strong>{faqs.length}</strong> FAQ groups
          </span>
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
                  if (target) void handleOpenEdit(target)
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

      {/* Create / Edit Modal */}
      <PanelModal
        isOpen={isCreateOpen || editingRecord !== null}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingRecord(null)
        }}
        title={editingRecord ? 'Edit FAQ Group' : 'Create FAQ Group'}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false)
                setEditingRecord(null)
              }}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={editingRecord ? handleEditSubmit : handleCreateSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || isLoadingEdit}
              className="cursor-pointer rounded-full bg-gold-600 px-5 text-xs font-bold text-white shadow-gold hover:bg-gold-700"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : null}
              <span>{editingRecord ? 'Save Changes' : 'Create FAQ Group'}</span>
            </Button>
          </div>
        }
      >
        {isLoadingEdit ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <RefreshCw className="mb-2 size-6 animate-spin text-gold-600" />
            <p className="text-xs font-semibold text-navy-900">Loading existing questions…</p>
          </div>
        ) : (
          <div className="space-y-6">
          {/* Group Level Fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase">
                Section / Target (e.g. "home", "about") <span className="text-maroon-600">*</span>
              </label>
              <Input
                value={formState.faq_for}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, faq_for: e.target.value }))
                }
                placeholder="e.g. home"
                className="h-10 rounded-xl border border-cream-300 bg-cream-50/70 px-3 text-xs font-medium text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
              />
              {formErrors.faq_for && (
                <p className="mt-1 text-xs text-maroon-600">{formErrors.faq_for}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase">
                Group Status
              </label>
              <select
                value={formState.faq_status}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    faq_status: e.target.value as FaqStatus,
                  }))
                }
                className="h-10 w-full cursor-pointer rounded-xl border border-cream-300 bg-cream-50/70 px-3 text-xs font-semibold text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
              >
                <option value="Active">Active (Visible)</option>
                <option value="Inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Sub-items builder */}
          <div className="space-y-4 border-t border-cream-200 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase">
                  Questions & Answers ({formState.subs.length})
                </h4>
                <p className="text-[11px] text-ink-500">
                  Add questions that will appear in this section's accordion.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSub}
                className="cursor-pointer rounded-full border-gold-400 bg-gold-50/70 text-xs font-bold text-navy-900 hover:bg-gold-100"
              >
                <Plus className="size-3.5" />
                <span>Add Question</span>
              </Button>
            </div>

            {formErrors.subs && (
              <p className="text-xs text-maroon-600">{formErrors.subs}</p>
            )}

            <div className="space-y-4">
              {formState.subs.map((sub, idx) => (
                <div
                  key={sub.id ?? idx}
                  className="rounded-xl border border-cream-300 bg-cream-50/40 p-4 shadow-xs"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-cream-200/80 pb-2">
                    <span className="text-xs font-bold text-navy-900">
                      Question {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSub(idx)}
                      disabled={formState.subs.length === 1}
                      className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-maroon-200 bg-maroon-50 px-2.5 py-0.5 text-[0.7rem] font-bold text-maroon-700 hover:bg-maroon-100 disabled:opacity-40"
                    >
                      <Trash2 className="size-3" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-bold text-ink-700">
                        Heading / Category (Optional)
                      </label>
                      <Input
                        value={sub.faq_heading}
                        onChange={(e) =>
                          handleUpdateSub(idx, { faq_heading: e.target.value })
                        }
                        placeholder="e.g. Account Security"
                        className="h-9 rounded-xl border border-cream-300 bg-white px-3 text-xs font-medium text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-ink-700">
                        Sort Order
                      </label>
                      <Input
                        type="number"
                        value={sub.faq_sort}
                        onChange={(e) =>
                          handleUpdateSub(idx, { faq_sort: e.target.value })
                        }
                        className="h-9 rounded-xl border border-cream-300 bg-white px-3 text-xs font-medium text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="mb-1 block text-[11px] font-bold text-ink-700">
                      Question <span className="text-maroon-600">*</span>
                    </label>
                    <Input
                      value={sub.faq_que}
                      onChange={(e) =>
                        handleUpdateSub(idx, { faq_que: e.target.value })
                      }
                      placeholder="e.g. How does profile verification work?"
                      className="h-9 rounded-xl border border-cream-300 bg-white px-3 text-xs font-medium text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
                    />
                    {formErrors[`sub_${idx}_que`] && (
                      <p className="mt-1 text-[11px] text-maroon-600">
                        {formErrors[`sub_${idx}_que`]}
                      </p>
                    )}
                  </div>

                  <div className="mt-3">
                    <label className="mb-1 block text-[11px] font-bold text-ink-700">
                      Answer <span className="text-maroon-600">*</span>
                    </label>
                    <Textarea
                      rows={3}
                      value={sub.faq_ans}
                      onChange={(e) =>
                        handleUpdateSub(idx, { faq_ans: e.target.value })
                      }
                      placeholder="Write comprehensive, clear answer..."
                      className="rounded-xl border border-cream-300 bg-white p-3 text-xs font-medium text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
                    />
                    {formErrors[`sub_${idx}_ans`] && (
                      <p className="mt-1 text-[11px] text-maroon-600">
                        {formErrors[`sub_${idx}_ans`]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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

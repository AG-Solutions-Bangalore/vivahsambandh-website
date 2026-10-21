/**
 * @file src/module/super-admin/pages/FeedbackPage.tsx
 * Member feedback and inquiry management: view, search, and delete records with confirmation dialog.
 */

import { useState, useMemo } from 'react'
import { MessageSquare, RefreshCw, Trash2, Calendar, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { panelDescription } from '../navigation'
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
import {
  useDeleteFeedbackMutation,
  useFeedbacksQuery,
} from '../hook/useFeedbacks'
import { errorMessage } from '../hook/errors'
import { formatDate } from '../utils/format'

export default function FeedbackPage() {
  const {
    data: feedbacks = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFeedbacksQuery()
  const deleteMutation = useDeleteFeedbackMutation()

  const [searchQuery, setSearchQuery] = useState('')

  // View Modal — only the id is kept so the modal renders the cached record.
  const [viewingFeedbackId, setViewingFeedbackId] = useState<number | null>(null)

  // Delete Modal
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const viewingFeedback = useMemo(
    () => feedbacks.find((fb) => fb.id === viewingFeedbackId) ?? null,
    [feedbacks, viewingFeedbackId],
  )

  const deleteTarget = useMemo(
    () => feedbacks.find((fb) => fb.id === deleteTargetId) ?? null,
    [feedbacks, deleteTargetId],
  )

  const filtered = useMemo(() => {
    return feedbacks.filter((fb) => {
      const q = searchQuery.toLowerCase()
      return (
        (fb.name && fb.name.toLowerCase().includes(q)) ||
        (fb.message && fb.message.toLowerCase().includes(q))
      )
    })
  }, [feedbacks, searchQuery])

  const handleDelete = () => {
    if (!deleteTarget) return
    const targetId = deleteTarget.id

    deleteMutation.mutate(
      {
        id: targetId,
        successMessage: 'Feedback record deleted successfully.',
      },
      {
        onSuccess: () => {
          setDeleteTargetId(null)
          setViewingFeedbackId(null)
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="User Feedback & Support Reviews"
        description={panelDescription('/panel/feedback')}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
          >
            <RefreshCw className={isFetching ? 'size-3.5 animate-spin' : 'size-3.5'} aria-hidden />
            <span>Refresh List</span>
          </Button>
        }
      />

      {/* Feedback Records Table */}
      <PanelCard flush>
        <PanelToolbar
          search={
            <PanelSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by member name or message text…"
            />
          }
        />

        {isLoading ? (
          <PanelTableSkeleton rows={6} columns={5} />
        ) : error ? (
          <PanelError
            title="Could not load feedback"
            message={errorMessage(error, 'Failed to load feedback records.')}
            onRetry={() => void refetch()}
          />
        ) : filtered.length === 0 ? (
          <PanelEmpty
            icon={<MessageSquare className="size-6" />}
            title="No Feedback Records"
            description={
              searchQuery
                ? 'No feedback entries matched your search keywords.'
                : 'No feedback submissions found in the database.'
            }
            action={
              searchQuery ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setSearchQuery('')}
                  className="mt-4 cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
                >
                  Clear search
                </Button>
              ) : undefined
            }
          />
        ) : (
          <PanelTable
            caption="Member feedback and enquiries with contact details and submission date"
            head={
              <>
                <PanelTableHeadCell>Submitter</PanelTableHeadCell>
                <PanelTableHeadCell>Message</PanelTableHeadCell>
                <PanelTableHeadCell>Submitted Date</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
              </>
            }
          >
            {filtered.map((fb) => (
              <tr key={fb.id} className="transition-colors hover:bg-cream-50/70">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-900">
                      {fb.name?.charAt(0) || 'U'}
                    </span>
                    <div>
                      <p className="font-bold text-navy-900">
                        {fb.name || 'Anonymous User'}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="max-w-md px-4 py-3.5">
                  <p className="line-clamp-2 leading-relaxed text-ink-600">
                    {fb.message}
                  </p>
                </td>

                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-1.5 text-ink-500">
                    <Calendar className="size-3 text-ink-400" aria-hidden />
                    {fb.created_at ? formatDate(fb.created_at) : 'Recent'}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setViewingFeedbackId(fb.id)}
                      className="cursor-pointer rounded-full border-navy-200 text-[0.7rem] text-navy-900 hover:bg-navy-50"
                    >
                      <Eye className="size-3 text-navy-700" aria-hidden />
                      <span>Read</span>
                    </Button>

                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setDeleteTargetId(fb.id)}
                      title="Delete Feedback Record"
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
          <span>
            Total feedbacks: <strong>{filtered.length}</strong>
          </span>
        </PanelTableFooter>
      </PanelCard>

      {/* Read Feedback Modal */}
      <PanelModal
        isOpen={Boolean(viewingFeedback)}
        title="Feedback Details"
        description={
          viewingFeedback
            ? `From: ${viewingFeedback.name || 'Anonymous User'}`
            : undefined
        }
        icon={<MessageSquare className="size-5" />}
        onClose={() => setViewingFeedbackId(null)}
        footer={
          <>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (viewingFeedback) setDeleteTargetId(viewingFeedback.id)
              }}
              className="mr-auto cursor-pointer rounded-full text-xs font-semibold"
            >
              <Trash2 className="size-3.5" aria-hidden />
              <span>Delete Record</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setViewingFeedbackId(null)}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              Close
            </Button>
          </>
        }
      >
        {viewingFeedback ? (
          <div className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-xl border border-cream-300/80 bg-cream-50/70 p-4 text-xs leading-relaxed text-ink-700">
            {viewingFeedback.message}
          </div>
        ) : null}
      </PanelModal>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Feedback Record"
          description={`Are you sure you want to delete this feedback from "${deleteTarget.name || 'User'}"? This action cannot be reversed.`}
          confirmText="Yes, Delete Feedback"
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

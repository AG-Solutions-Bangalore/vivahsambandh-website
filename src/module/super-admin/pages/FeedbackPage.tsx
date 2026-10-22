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
import { PanelPagination } from '../components/PanelPagination'
import { PanelSearch } from '../components/PanelSearch'
import { PanelToolbar } from '../components/PanelToolbar'
import { PanelEmpty, PanelError } from '../components/PanelState'
import { PanelTableSkeleton } from '../components/PanelSkeleton'
import { ProfileAvatar } from '../components/ProfileAvatar'
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
import { DEFAULT_PER_PAGE, useServerSearch } from '../hook/useServerList'
import { formatDate } from '../utils/format'

export default function FeedbackPage() {
  const { searchInput, setSearchInput, searchTerm } = useServerSearch()
  const [page, setPage] = useState(1)

  const {
    data: allFeedbacks = [],
    records: feedbacks,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFeedbacksQuery({
    search: searchTerm || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
  })
  const deleteMutation = useDeleteFeedbackMutation()

  // View Modal — only the id is kept so the modal renders the cached record.
  const [viewingFeedbackId, setViewingFeedbackId] = useState<number | null>(null)

  // Delete Modal
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const viewingFeedback = useMemo(
    () => allFeedbacks.find((fb) => fb.id === viewingFeedbackId) ?? null,
    [allFeedbacks, viewingFeedbackId],
  )

  const deleteTarget = useMemo(
    () => allFeedbacks.find((fb) => fb.id === deleteTargetId) ?? null,
    [allFeedbacks, deleteTargetId],
  )

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
              value={searchInput}
              onChange={setSearchInput}
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
        ) : feedbacks.length === 0 ? (
          <PanelEmpty
            icon={<MessageSquare className="size-6" />}
            title="No Feedback Records"
            description={
              searchInput
                ? 'No feedback entries matched your search keywords.'
                : 'No feedback submissions found in the database.'
            }
            action={
              searchInput ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setSearchInput('')}
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
            {feedbacks.map((fb) => (
              <tr key={fb.id} className="transition-colors hover:bg-cream-50/70">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <ProfileAvatar
                      src={fb.face_image}
                      name={fb.name}
                      size="sm"
                      tone="navy"
                    />
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
                      size="icon-xs"
                      variant="outline"
                      onClick={() => setViewingFeedbackId(fb.id)}
                      title="Read feedback"
                      aria-label="Read feedback"
                      className="cursor-pointer rounded-full border-navy-200 text-navy-700 hover:bg-navy-50"
                    >
                      <Eye className="size-3.5 text-navy-700" aria-hidden />
                    </Button>

                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      onClick={() => setDeleteTargetId(fb.id)}
                      title="Delete Feedback Record"
                      aria-label="Delete feedback record"
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
                Total feedbacks: <strong>{meta.total}</strong>
              </span>
            }
          />
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

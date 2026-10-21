/**
 * @file src/module/super-admin/pages/FeedbackPage.tsx
 * Member feedback and inquiry management: view, search, and delete records with confirmation dialog.
 */

import { useEffect, useState, useMemo } from 'react'
import {
  MessageSquare,
  Search,
  RefreshCw,
  Trash2,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { deleteFeedbackRecord, fetchFeedbacks } from '../services/adminApi'
import type { FeedbackRecord } from '../types'

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // View Modal
  const [viewingFeedback, setViewingFeedback] = useState<FeedbackRecord | null>(null)

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<FeedbackRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetchFeedbacks()
      setFeedbacks(res.data)
      if (res.error) setErrorMessage(res.error)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load feedbacks.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filtered = useMemo(() => {
    return feedbacks.filter((fb) => {
      const q = searchQuery.toLowerCase()
      return (
        (fb.name && fb.name.toLowerCase().includes(q)) ||
        (fb.mobile && fb.mobile.includes(q)) ||
        (fb.email && fb.email.toLowerCase().includes(q)) ||
        (fb.subject && fb.subject.toLowerCase().includes(q)) ||
        (fb.message && fb.message.toLowerCase().includes(q))
      )
    })
  }, [feedbacks, searchQuery])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await deleteFeedbackRecord(deleteTarget.id)
      if (res.success) {
        setSuccessBanner(`Feedback #${deleteTarget.id} deleted successfully.`)
        setDeleteTarget(null)
        if (viewingFeedback?.id === deleteTarget.id) {
          setViewingFeedback(null)
        }
        // Remove from list without reload
        setFeedbacks((prev) => prev.filter((f) => f.id !== deleteTarget.id))
      } else {
        setErrorMessage(res.message)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete feedback.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
            User Feedback & Support Reviews
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Member responses, user experience reviews, and platform feedback submitted by users.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void loadData()}
          disabled={isLoading}
          className="rounded-full text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </Button>
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

      {/* Search Bar */}
      <div className="rounded-2xl bg-white p-3 border border-cream-200/90 shadow-xs">
        <div className="relative">
          <Search className="absolute inset-y-0 left-3 my-auto size-4 text-ink-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search feedback by name, contact, subject, or message text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9.5 text-xs bg-cream-50/50 border-cream-200 rounded-xl"
          />
        </div>
      </div>

      {/* Feedback Records Table */}
      <div className="rounded-2xl border border-cream-200/90 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-cream-100 text-navy-800 animate-spin mb-3">
              <RefreshCw className="size-5" />
            </div>
            <p className="text-xs font-semibold text-ink-500">
              Loading user feedbacks from API...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="mx-auto size-12 text-ink-300 mb-2" />
            <p className="text-sm font-bold text-navy-900">No Feedback Records</p>
            <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'No feedback entries matched your search keywords.'
                : 'No feedback submissions found in the database.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50/80 text-[0.7rem] uppercase font-bold tracking-wider text-ink-500">
                  <th className="py-3.5 px-4">Submitter</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Subject & Message</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filtered.map((fb) => (
                  <tr
                    key={fb.id}
                    className="hover:bg-cream-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0">
                          {fb.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-navy-900">{fb.name || 'Anonymous User'}</p>
                          <p className="text-[0.68rem] text-ink-400">ID: #{fb.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {fb.mobile && (
                          <p className="font-medium text-navy-900 flex items-center gap-1.5">
                            <Phone className="size-3 text-ink-400" />
                            {fb.mobile}
                          </p>
                        )}
                        {fb.email && (
                          <p className="text-ink-500 flex items-center gap-1.5">
                            <Mail className="size-3 text-ink-400" />
                            {fb.email}
                          </p>
                        )}
                        {!fb.mobile && !fb.email && <span className="text-ink-400">—</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-md">
                      {fb.subject && (
                        <p className="font-semibold text-navy-900 mb-0.5">
                          {fb.subject}
                        </p>
                      )}
                      <p className="text-ink-600 line-clamp-2 leading-relaxed">
                        {fb.message}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-ink-500 flex items-center gap-1.5">
                        <Calendar className="size-3 text-ink-400" />
                        {fb.created_at
                          ? new Date(fb.created_at).toLocaleDateString()
                          : 'Recent'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => setViewingFeedback(fb)}
                          className="rounded-full text-navy-900 border-navy-200 hover:bg-navy-50 text-[0.7rem] px-2.5 cursor-pointer"
                        >
                          <Eye className="size-3 text-navy-700" />
                          <span>Read</span>
                        </Button>

                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => setDeleteTarget(fb)}
                          className="rounded-full text-rose-700 border-rose-300 hover:bg-rose-50 text-[0.7rem] px-2 cursor-pointer"
                          title="Delete Feedback Record"
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
            Total feedbacks: <strong>{filtered.length}</strong>
          </span>
          <span>Endpoints: GET /feedback • DELETE /feedback/:id</span>
        </div>
      </div>

      {/* Read Feedback Modal */}
      {viewingFeedback && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-cream-200">
            <button
              type="button"
              onClick={() => setViewingFeedback(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-ink-400 hover:bg-cream-100 hover:text-ink-700"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-navy-900">
                  {viewingFeedback.subject || 'Feedback Details'}
                </h3>
                <p className="text-xs text-ink-500">
                  From: {viewingFeedback.name || 'Anonymous User'}{' '}
                  {viewingFeedback.mobile ? `(${viewingFeedback.mobile})` : ''}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-cream-50/80 p-4 border border-cream-200 text-xs text-ink-800 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
              {viewingFeedback.message}
            </div>

            <div className="mt-6 flex items-center justify-between pt-3 border-t border-cream-200">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDeleteTarget(viewingFeedback)
                }}
                className="rounded-full text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Delete Record</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewingFeedback(null)}
                className="rounded-full text-xs font-semibold cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Feedback Record"
          description={`Are you sure you want to delete this feedback from "${deleteTarget.name || 'User'}"? This action cannot be reversed.`}
          confirmText="Yes, Delete Feedback"
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

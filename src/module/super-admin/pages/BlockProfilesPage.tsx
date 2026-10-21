/**
 * @file src/module/super-admin/pages/BlockProfilesPage.tsx
 * Blocked Profiles moderation: inspect flagged or blocked member accounts and delete records.
 */

import { useEffect, useState, useMemo } from 'react'
import {
  Ban,
  Search,
  RefreshCw,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Phone,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '../components/ConfirmDialog'
import {
  deleteBlockProfileRecord,
  fetchBlockProfiles,
} from '../services/adminApi'
import type { BlockProfileRecord } from '../types'

export default function BlockProfilesPage() {
  const [records, setRecords] = useState<BlockProfileRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<BlockProfileRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetchBlockProfiles()
      setRecords(res.data)
      if (res.error) setErrorMessage(res.error)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load blocked profiles.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filtered = useMemo(() => {
    return records.filter((rec) => {
      const q = searchQuery.toLowerCase()
      const blockedName = rec.member_name || rec.blocked_user_name || ''
      return (
        blockedName.toLowerCase().includes(q) ||
        (rec.blocked_by_name && rec.blocked_by_name.toLowerCase().includes(q)) ||
        (rec.reason && rec.reason.toLowerCase().includes(q)) ||
        (rec.mobile && rec.mobile.includes(q))
      )
    })
  }, [records, searchQuery])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await deleteBlockProfileRecord(deleteTarget.id)
      if (res.success) {
        setSuccessBanner(`Blocked profile record #${deleteTarget.id} deleted.`)
        setDeleteTarget(null)
        setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      } else {
        setErrorMessage(res.message)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete record.')
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
            Blocked Profiles Management
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Audit member reports, harassment blocks, and moderation dispute entries.
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
          <span>Refresh Records</span>
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
            placeholder="Search by blocked candidate, reporting user, reason, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9.5 text-xs bg-cream-50/50 border-cream-200 rounded-xl"
          />
        </div>
      </div>

      {/* Blocked Profiles Table */}
      <div className="rounded-2xl border border-cream-200/90 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-cream-100 text-navy-800 animate-spin mb-3">
              <RefreshCw className="size-5" />
            </div>
            <p className="text-xs font-semibold text-ink-500">
              Loading blocked profiles from API...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Ban className="mx-auto size-12 text-ink-300 mb-2" />
            <p className="text-sm font-bold text-navy-900">No Blocked Profiles Found</p>
            <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'No blocked records match your current search query.'
                : 'No accounts are currently flagged as blocked in the database.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50/80 text-[0.7rem] uppercase font-bold tracking-wider text-ink-500">
                  <th className="py-3.5 px-4">Blocked Candidate</th>
                  <th className="py-3.5 px-4">Reported By</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4">Date Logged</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filtered.map((rec) => {
                  const targetName = rec.member_name || rec.blocked_user_name || 'Restricted Profile'
                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-cream-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0">
                            <ShieldAlert className="size-4" />
                          </div>
                          <div>
                            <p className="font-bold text-navy-900">{targetName}</p>
                            <p className="text-[0.68rem] text-ink-400">
                              Record #{rec.id}{' '}
                              {rec.member_id ? `• Member ID: #${rec.member_id}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-navy-900">
                          {rec.blocked_by_name || 'System / Platform Admin'}
                        </p>
                        {rec.mobile && (
                          <p className="text-[0.68rem] text-ink-500 flex items-center gap-1 mt-0.5">
                            <Phone className="size-3" />
                            {rec.mobile}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="text-ink-700 leading-relaxed font-medium">
                          {rec.reason || 'No specific reason reported.'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-ink-500 flex items-center gap-1.5">
                          <Calendar className="size-3 text-ink-400" />
                          {rec.created_at
                            ? new Date(rec.created_at).toLocaleDateString()
                            : 'Logged'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => setDeleteTarget(rec)}
                          className="rounded-full text-rose-700 border-rose-300 hover:bg-rose-50 text-[0.7rem] px-2.5 cursor-pointer"
                          title="Delete Block Record"
                        >
                          <Trash2 className="size-3" />
                          <span>Delete</span>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-cream-200 px-4 py-3 bg-cream-50/50 text-[0.7rem] text-ink-500">
          <span>
            Total blocked records: <strong>{filtered.length}</strong>
          </span>
          <span>Endpoints: GET /blockProfile • DELETE /blockProfile/:id</span>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Blocked Profile Entry"
          description={`Are you sure you want to delete the block record for "${
            deleteTarget.member_name || deleteTarget.blocked_user_name || 'this member'
          }"? This will remove the moderation block entry from the database.`}
          confirmText="Yes, Delete Record"
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

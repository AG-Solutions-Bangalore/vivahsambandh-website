/**
 * @file src/module/super-admin/pages/BlockProfilesPage.tsx
 * Blocked Profiles moderation: inspect flagged or blocked member accounts and delete records.
 */

import { useState, useMemo } from 'react'
import { Ban, RefreshCw, Trash2, Calendar, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { panelDescription } from '../navigation'
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
  useBlockProfilesQuery,
  useDeleteBlockProfileMutation,
} from '../hook/useBlockProfiles'
import { errorMessage } from '../hook/errors'
import { formatDate } from '../utils/format'

export default function BlockProfilesPage() {
  const {
    data: records = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useBlockProfilesQuery()
  const deleteMutation = useDeleteBlockProfileMutation()

  const [searchQuery, setSearchQuery] = useState('')

  // Delete Target
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const deleteTarget = useMemo(
    () => records.find((rec) => rec.id === deleteTargetId) ?? null,
    [records, deleteTargetId],
  )

  const filtered = useMemo(() => {
    return records.filter((rec) => {
      const q = searchQuery.toLowerCase()
      const blockedName = rec.member_name || ''
      return (
        blockedName.toLowerCase().includes(q) ||
        (rec.blocked_by_name && rec.blocked_by_name.toLowerCase().includes(q)) ||
        (rec.reason && rec.reason.toLowerCase().includes(q))
      )
    })
  }, [records, searchQuery])

  const handleDelete = () => {
    if (!deleteTarget) return
    const targetId = deleteTarget.id

    deleteMutation.mutate(
      {
        id: targetId,
        successMessage: 'Blocked profile record deleted.',
      },
      {
        onSuccess: () => setDeleteTargetId(null),
      },
    )
  }

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Blocked Profiles Management"
        description={panelDescription('/panel/block-profiles')}
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
            <span>Refresh Records</span>
          </Button>
        }
      />

      {/* Blocked Profiles Table */}
      <PanelCard flush>
        <PanelToolbar
          search={
            <PanelSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search candidate, reporter, or reason…"
            />
          }
        />

        {isLoading ? (
          <PanelTableSkeleton rows={6} columns={5} />
        ) : error ? (
          <PanelError
            title="Could not load blocked profiles"
            message={errorMessage(error, 'Failed to load blocked profile records.')}
            onRetry={() => void refetch()}
          />
        ) : filtered.length === 0 ? (
          <PanelEmpty
            icon={<Ban className="size-6" />}
            title="No Blocked Profiles Found"
            description={
              searchQuery
                ? 'No blocked records match your current search query.'
                : 'No accounts are currently flagged as blocked in the database.'
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
            caption="Blocked and flagged member accounts with reporter, reason and date"
            head={
              <>
                <PanelTableHeadCell>Blocked Candidate</PanelTableHeadCell>
                <PanelTableHeadCell>Reported By</PanelTableHeadCell>
                <PanelTableHeadCell>Reason / Notes</PanelTableHeadCell>
                <PanelTableHeadCell>Date Logged</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
              </>
            }
          >
            {filtered.map((rec) => {
              const targetName =
                rec.member_name || 'Restricted Profile'
              return (
                <tr key={rec.id} className="transition-colors hover:bg-cream-50/70">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-maroon-200 bg-maroon-50 text-maroon-600">
                        <ShieldAlert className="size-4" aria-hidden />
                      </span>
                      <div>
                        <p className="font-bold text-navy-900">{targetName}</p>
                        <p className="text-[0.68rem] text-ink-400">Blocked account</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-navy-900">
                      {rec.blocked_by_name || 'System / Platform Admin'}
                    </p>
                  </td>

                  <td className="max-w-sm px-4 py-3.5">
                    <p className="font-medium leading-relaxed text-ink-700">
                      {rec.reason || 'No specific reason reported.'}
                    </p>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1.5 text-ink-500">
                      <Calendar className="size-3 text-ink-400" aria-hidden />
                      {rec.created_at ? formatDate(rec.created_at) : 'Logged'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setDeleteTargetId(rec.id)}
                      title="Delete Block Record"
                      className="cursor-pointer rounded-full border-maroon-200 bg-maroon-50 text-[0.7rem] text-maroon-800 hover:bg-maroon-100"
                    >
                      <Trash2 className="size-3" aria-hidden />
                      <span>Delete</span>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </PanelTable>
        )}

        <PanelTableFooter>
          <span>
            Total blocked records: <strong>{filtered.length}</strong>
          </span>
        </PanelTableFooter>
      </PanelCard>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Blocked Profile Entry"
          description={`Are you sure you want to delete the block record for "${
            deleteTarget.member_name || 'this member'
          }"? This will remove the moderation block entry from the database.`}
          confirmText="Yes, Delete Record"
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

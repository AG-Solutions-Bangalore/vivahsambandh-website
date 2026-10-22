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
  useBlockProfilesQuery,
  useDeleteBlockProfileMutation,
} from '../hook/useBlockProfiles'
import { errorMessage } from '../hook/errors'
import { DEFAULT_PER_PAGE, useServerSearch } from '../hook/useServerList'
import { formatDate } from '../utils/format'

export default function BlockProfilesPage() {
  const { searchInput, setSearchInput, searchTerm } = useServerSearch()
  const [page, setPage] = useState(1)

  const {
    data: allRecords = [],
    records,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useBlockProfilesQuery({
    search: searchTerm || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
  })
  const deleteMutation = useDeleteBlockProfileMutation()

  // Delete Target
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const deleteTarget = useMemo(
    () => allRecords.find((rec) => rec.id === deleteTargetId) ?? null,
    [allRecords, deleteTargetId],
  )

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
              value={searchInput}
              onChange={setSearchInput}
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
        ) : records.length === 0 ? (
          <PanelEmpty
            icon={<Ban className="size-6" />}
            title="No Blocked Profiles Found"
            description={
              searchInput
                ? 'No blocked records match your current search query.'
                : 'No accounts are currently flagged as blocked in the database.'
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
            {records.map((rec) => {
              const targetName =
                rec.member_name || 'Restricted Profile'
              return (
                <tr key={rec.id} className="transition-colors hover:bg-cream-50/70">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        src={rec.face_image}
                        name={rec.member_name}
                        size="md"
                        tone="maroon"
                      />
                      <div>
                        <p className="font-bold text-navy-900">{targetName}</p>
                        <p className="flex items-center gap-1 text-[0.68rem] text-ink-400">
                          <ShieldAlert className="size-3" aria-hidden />
                          Blocked account
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <ProfileAvatar
                        src={rec.blocked_by_image}
                        name={rec.blocked_by_name}
                        size="sm"
                        tone="navy"
                      />
                      <p className="font-semibold text-navy-900">
                        {rec.blocked_by_name || 'System / Platform Admin'}
                      </p>
                    </div>
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
                    <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        onClick={() => setDeleteTargetId(rec.id)}
                        title="Delete Block Record"
                        aria-label="Delete block record"
                        className="cursor-pointer rounded-full border-maroon-200 bg-maroon-50 text-maroon-800 hover:bg-maroon-100"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
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
                Total blocked records: <strong>{meta.total}</strong>
              </span>
            }
          />
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

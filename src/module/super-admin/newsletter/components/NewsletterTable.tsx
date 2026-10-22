/**
 * @file src/module/super-admin/newsletter/components/NewsletterTable.tsx
 * The subscriber table for the newsletter list.
 *
 * It renders the panel's own table primitives, so the list reads like every
 * other panel list — same header strip, same row rhythm, same footer.
 */

import { useState } from 'react'
import { Calendar, Mail, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PanelTable, PanelTableHeadCell } from '../../components/PanelTable'
import { formatDate } from '../../utils/format'
import { useDeleteNewsletterSubscriberMutation } from '../hook/useNewsletter'
import type { NewsletterSubscriber } from '../types/newsletter.types'

interface NewsletterTableProps {
  subscribers: NewsletterSubscriber[]
  /** The row number of the first row on this page. */
  startIndex: number
  onRemoved: () => void
}

export function NewsletterTable({
  subscribers,
  startIndex,
  onRemoved,
}: NewsletterTableProps) {
  const deleteMutation = useDeleteNewsletterSubscriberMutation()
  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriber | null>(null)

  const handleDelete = () => {
    if (!deleteTarget) return

    deleteMutation.mutate(
      {
        id: deleteTarget.id,
        successMessage: `"${deleteTarget.newsletter_email}" removed from the newsletter list.`,
      },
      {
        onSuccess: () => {
          setDeleteTarget(null)
          onRemoved()
        },
      },
    )
  }

  return (
    <>
      <PanelTable
        caption="Newsletter subscribers with the date they subscribed"
        head={
          <>
            <PanelTableHeadCell>SI/NO</PanelTableHeadCell>
            <PanelTableHeadCell>Subscriber Email</PanelTableHeadCell>
            <PanelTableHeadCell>Subscribed On</PanelTableHeadCell>
            <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
          </>
        }
      >
        {subscribers.map((subscriber, index) => (
          <tr
            key={subscriber.id}
            className="transition-colors hover:bg-cream-50/70"
          >
            <td className="px-4 py-3.5 text-xs font-bold text-navy-800">
              {startIndex + index}
            </td>

            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-700">
                  <Mail className="size-3.5" aria-hidden />
                </span>
                <p className="font-bold break-all text-navy-900">
                  {subscriber.newsletter_email || '—'}
                </p>
              </div>
            </td>

            <td className="px-4 py-3.5">
              <span className="flex items-center gap-1.5 text-ink-500">
                <Calendar className="size-3 text-ink-400" aria-hidden />
                {subscriber.newsletter_created
                  ? formatDate(subscriber.newsletter_created)
                  : '—'}
              </span>
            </td>

            <td className="px-4 py-3.5">
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  type="button"
                  size="icon-xs"
                  variant="outline"
                  onClick={() => setDeleteTarget(subscriber)}
                  title="Remove subscriber"
                  aria-label="Remove subscriber"
                  className="cursor-pointer rounded-full border-maroon-200 bg-maroon-50 text-maroon-800 hover:bg-maroon-100"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </PanelTable>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Remove Subscriber"
        description={
          deleteTarget
            ? `Are you sure you want to remove "${deleteTarget.newsletter_email}" from the newsletter list? They will stop receiving the mailing and the record is removed permanently.`
            : ''
        }
        confirmText={deleteMutation.isPending ? 'Removing…' : 'Remove Subscriber'}
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  )
}

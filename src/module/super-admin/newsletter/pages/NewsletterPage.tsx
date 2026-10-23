/**
 * @file src/module/super-admin/newsletter/pages/NewsletterPage.tsx
 * Newsletter subscriber management for the Super Admin Panel.
 *
 * The list is the mailing audience: every address that signed up through the
 * website or the app. It is read-only apart from removing a subscription —
 * a subscriber leaves the list by unsubscribing, not by being archived.
 *
 * The CRM pages and filters the list on the server, so the search term and
 * the page window travel with the request.
 */

import { useState } from 'react'
import { Mail, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PanelCard } from '../../components/PanelCard'
import { PanelPageHeader } from '../../components/PanelPageHeader'
import { PanelPagination } from '../../components/PanelPagination'
import { PanelSearch } from '../../components/PanelSearch'
import { PanelToolbar } from '../../components/PanelToolbar'
import { PanelEmpty, PanelError } from '../../components/PanelState'
import { PanelTableSkeleton } from '../../components/PanelSkeleton'
import { PanelTableFooter } from '../../components/PanelTable'
import { panelDescription } from '../../navigation'
import { errorMessage } from '../../hook/errors'
import {
  DEFAULT_PER_PAGE,
  EMPTY_LIST_META,
  useServerSearch,
} from '../../hook/useServerList'
import { NewsletterTable } from '../components/NewsletterTable'
import { useNewsletterSubscribersQuery } from '../hook/useNewsletter'

export default function NewsletterPage() {
  const { searchInput, setSearchInput: setSearchValue, searchTerm } = useServerSearch()
  const [page, setPage] = useState(1)

  // A new search term starts the list again from the first page.
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    setPage(1)
  }

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useNewsletterSubscribersQuery({
    search: searchTerm || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
  })

  const subscribers = data?.data ?? []
  const meta = data?.meta ?? EMPTY_LIST_META
  const hasFilters = searchTerm !== ''

  // Removing the last row of the last page would leave the admin on an empty
  // page — step back instead.
  const handleRemoved = () => {
    if (subscribers.length <= 1 && page > 1) setPage(page - 1)
  }

  const firstRow = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Newsletter Subscribers"
        description={panelDescription('/crm/newsletter')}
        chip={
          <span className="rounded-full border border-gold-300 bg-gold-50 px-2.5 py-0.5 text-xs font-bold text-gold-800">
            {meta.total} Subscribed
          </span>
        }
        actions={
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
            <span>Refresh List</span>
          </Button>
        }
      />

      <PanelCard flush>
        <PanelToolbar
          search={
            <PanelSearch
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by subscriber email…"
            />
          }
        />

        {isLoading ? (
          <PanelTableSkeleton rows={6} columns={4} />
        ) : error ? (
          <PanelError
            title="Could not load subscribers"
            message={errorMessage(error, 'Failed to load the newsletter subscribers.')}
            onRetry={() => void refetch()}
          />
        ) : subscribers.length === 0 ? (
          <PanelEmpty
            icon={<Mail className="size-6" />}
            title="No Subscribers Yet"
            description={
              hasFilters
                ? 'No subscriber matched your search term.'
                : 'Addresses that sign up through the website or the app appear here.'
            }
            action={
              hasFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => handleSearchChange('')}
                  className="mt-4 cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
                >
                  Clear search
                </Button>
              ) : undefined
            }
          />
        ) : (
          <NewsletterTable
            subscribers={subscribers}
            startIndex={firstRow}
            onRemoved={handleRemoved}
          />
        )}

        <PanelTableFooter>
          <PanelPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={isFetching}
            summary={
              <span>
                Total subscribers: <strong>{meta.total}</strong>
              </span>
            }
          />
        </PanelTableFooter>
      </PanelCard>
    </div>
  )
}

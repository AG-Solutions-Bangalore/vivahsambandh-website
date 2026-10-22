/**
 * @file src/module/super-admin/pages/BlogsPage.tsx
 * Blog management for the Super Admin Panel: list articles, search and filter
 * them, publish or unpublish, and inspect a record.
 *
 * Creating and editing happen on their own screens — the article form is
 * too long for a dialog — so this page only links to them.
 *
 * There is no delete: the CRM has no `BlogController::destroy()`, so
 * `DELETE /blog/{id}` always fails. Unpublishing is the way to take an
 * article off the site until the backend implements the route.
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  FileText,
  Image as ImageIcon,
  Pencil,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { PanelModal } from '../components/PanelModal'
import { PanelPagination } from '../components/PanelPagination'
import { PanelSearch } from '../components/PanelSearch'
import { PanelToolbar } from '../components/PanelToolbar'
import { PanelEmpty, PanelError } from '../components/PanelState'
import { PanelTableSkeleton, SkeletonText } from '../components/PanelSkeleton'
import {
  PanelTable,
  PanelTableFooter,
  PanelTableHeadCell,
} from '../components/PanelTable'
import { PanelFilterSelect } from '../components/PanelFilterSelect'
import { CategorySelect } from '../components/CategorySelect'
import { StatusBadge } from '../components/StatusBadge'
import { BlogPlacementChips } from '../components/BlogEditorForm'
import { panelDescription } from '../navigation'
import { errorMessage } from '../hook/errors'
import { DEFAULT_PER_PAGE, useServerSearch } from '../hook/useServerList'
import {
  useBlogQuery,
  useBlogsQuery,
  useUpdateBlogStatusMutation,
} from '../hook/useBlogs'
import { formatDate } from '../utils/format'
import type { BlogRecord, BlogStatus } from '../types'

const STATUS_FILTERS = ['All', 'Active', 'Inactive'] as const

const LIST_PATH = '/panel/blogs'

export default function BlogsPage() {
  const navigate = useNavigate()
  const { searchInput, setSearchInput, searchTerm } = useServerSearch()
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [page, setPage] = useState(1)

  const {
    records: blogs,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useBlogsQuery({
    search: searchTerm || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
    category_id: categoryFilter || undefined,
  })

  const statusMutation = useUpdateBlogStatusMutation()

  // Inspector state
  const [inspectingId, setInspectingId] = useState<number | null>(null)
  const {
    data: inspectedRecord,
    isLoading: isLoadingDetail,
    error: inspectError,
  } = useBlogQuery(inspectingId)

  // The API ignores the status parameter, so the publication state is
  // filtered here.
  const filtered = useMemo(
    () =>
      statusFilter === 'All'
        ? blogs
        : blogs.filter((blog) => blog.status === (statusFilter as BlogStatus)),
    [blogs, statusFilter],
  )

  const hasFilters =
    searchInput.trim() !== '' || statusFilter !== 'All' || categoryFilter !== ''

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value)
    setPage(1)
  }

  const handleToggleStatus = (blog: BlogRecord) => {
    const nextStatus: BlogStatus = blog.status === 'Active' ? 'Inactive' : 'Active'

    statusMutation.mutate(
      {
        id: blog.id,
        status: nextStatus,
        successMessage: `"${blog.title}" marked as ${nextStatus}.`,
      },
      {
        onSuccess: () => {
          if (inspectingId === blog.id) setInspectingId(null)
        },
      },
    )
  }

  const firstRow = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const lastRow = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Blog Management"
        description={panelDescription('/panel/blogs')}
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
                className={isFetching ? 'size-3.5 animate-spin' : 'size-3.5'}
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
              <span>New Article</span>
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
              placeholder="Search article titles and content…"
            />
          }
        >
          <PanelFilterSelect
            id="filter-blog-status"
            label="Status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
            showStatusDots
          />
          <CategorySelect
            id="filter-blog-category"
            label="Category"
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
            includeAll
            className="w-full sm:w-52"
          />
        </PanelToolbar>

        {isLoading ? (
          <PanelTableSkeleton rows={6} columns={5} />
        ) : error ? (
          <PanelError
            title="Could not load articles"
            message={errorMessage(error, 'Failed to load the blog list.')}
            onRetry={() => void refetch()}
          />
        ) : filtered.length === 0 ? (
          <PanelEmpty
            icon={<FileText className="size-6" />}
            title="No Articles Found"
            description={
              hasFilters
                ? 'No articles match your current filter criteria.'
                : 'No articles have been published yet. Create one to get started.'
            }
            action={
              hasFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setSearchInput('')
                    setStatusFilter('All')
                    setCategoryFilter('')
                    setPage(1)
                  }}
                  className="mt-4 cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <PanelTable
            caption="Blog articles with placement, status and banner"
            head={
              <>
                <PanelTableHeadCell>SI/NO</PanelTableHeadCell>
                <PanelTableHeadCell>Article</PanelTableHeadCell>
                <PanelTableHeadCell>Placement</PanelTableHeadCell>
                <PanelTableHeadCell>Status</PanelTableHeadCell>
                <PanelTableHeadCell>Banner</PanelTableHeadCell>
                <PanelTableHeadCell>Last Updated</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
              </>
            }
          >
            {filtered.map((blog, index) => (
              <tr key={blog.id} className="transition-colors hover:bg-cream-50/70">
                <td className="px-4 py-3.5 text-xs font-bold text-navy-800">
                  {index + 1}
                </td>

                <td className="max-w-md px-4 py-3.5">
                  <p className="text-sm font-bold text-navy-900">
                    {blog.title || 'Untitled'}
                  </p>
                  {blog.categories ? (
                    <p className="mt-0.5 text-[0.7rem] text-ink-500">
                      {blog.categories}
                    </p>
                  ) : null}
                  {blog.short_description ? (
                    <p className="mt-1 line-clamp-2 leading-relaxed text-ink-600">
                      {blog.short_description}
                    </p>
                  ) : null}
                </td>

                <td className="px-4 py-3.5">
                  <BlogPlacementChips
                    isFront={blog.is_front}
                    isFeatured={blog.is_featured}
                  />
                </td>

                <td className="px-4 py-3.5">
                  <StatusBadge status={blog.status} size="sm" />
                </td>

                <td className="px-4 py-3.5">
                  {blog.banner_image ? (
                    <img
                      src={blog.banner_image}
                      alt={blog.banner_image_alt ?? blog.banner_image_name ?? 'Article banner'}
                      className="h-12 w-20 rounded-lg border border-cream-300 object-cover"
                    />
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md border border-cream-300 bg-cream-50 px-2 py-0.5 text-[0.7rem] text-ink-400 italic">
                      <ImageIcon className="size-3" aria-hidden />
                      None
                    </span>
                  )}
                </td>

                <td className="px-4 py-3.5 text-ink-500">
                  {formatDate(blog.updated_date ?? blog.created_date)}
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setInspectingId(blog.id)}
                      title="View article details"
                      className="cursor-pointer rounded-full border-navy-200 text-[0.7rem] text-navy-900 hover:bg-navy-50"
                    >
                      <Eye className="size-3 text-navy-700" aria-hidden />
                      <span>View</span>
                    </Button>

                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => navigate(`${LIST_PATH}/${blog.id}/edit`)}
                      title="Edit article"
                      className="cursor-pointer rounded-full border-gold-300 bg-gold-50 text-[0.7rem] text-gold-800 hover:bg-gold-100"
                    >
                      <Pencil className="size-3" aria-hidden />
                      <span>Edit</span>
                    </Button>

                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => handleToggleStatus(blog)}
                      disabled={statusMutation.isPending}
                      title={blog.status === 'Active' ? 'Mark as inactive' : 'Mark as active'}
                      className={cn(
                        'cursor-pointer rounded-full text-[0.7rem]',
                        blog.status === 'Active'
                          ? 'border-maroon-200 bg-maroon-50 text-maroon-800 hover:bg-maroon-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
                      )}
                    >
                      {blog.status === 'Active' ? 'Unpublish' : 'Publish'}
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
                Showing <strong>{firstRow}</strong>–<strong>{lastRow}</strong> of{' '}
                <strong>{meta.total}</strong> articles
              </span>
            }
          />
        </PanelTableFooter>
      </PanelCard>

      {/* Inspect Article Modal (GET /blog/{id}) */}
      <PanelModal
        isOpen={inspectingId !== null}
        title={
          inspectedRecord ? inspectedRecord.title : 'Article Details'
        }
        description="Article record retrieved from the blog endpoint."
        icon={<FileText className="size-5" />}
        size="lg"
        onClose={() => setInspectingId(null)}
        footer={
          <Button
            type="button"
            variant="outline"
            onClick={() => setInspectingId(null)}
            className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
          >
            Close
          </Button>
        }
      >
        {isLoadingDetail ? (
          <SkeletonText lines={6} className="py-6" />
        ) : inspectError ? (
          <p className="py-8 text-center text-xs text-maroon-600">
            {errorMessage(inspectError, 'Could not retrieve the article record.')}
          </p>
        ) : inspectedRecord ? (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={inspectedRecord.status} size="sm" />
              <BlogPlacementChips
                isFront={inspectedRecord.is_front}
                isFeatured={inspectedRecord.is_featured}
              />
              <span className="text-ink-500">/{inspectedRecord.slug}</span>
            </div>

            {inspectedRecord.banner_image ? (
              <div className="max-h-52 overflow-hidden rounded-2xl border border-cream-300 bg-navy-900">
                <img
                  src={inspectedRecord.banner_image}
                  alt={
                    inspectedRecord.banner_image_alt ??
                    inspectedRecord.banner_image_name ??
                    'Article banner'
                  }
                  className="h-48 w-full object-contain"
                />
              </div>
            ) : null}

            {inspectedRecord.short_description ? (
              <div>
                <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Short Description
                </span>
                <p className="leading-relaxed text-ink-700">
                  {inspectedRecord.short_description}
                </p>
              </div>
            ) : null}

            <div>
              <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                Article Content
              </span>
              <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-cream-300/80 bg-cream-50/70 p-4 leading-relaxed text-ink-700">
                {inspectedRecord.description || 'No content recorded.'}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Meta Keywords
                </span>
                <p className="text-ink-700">{inspectedRecord.meta_keywords || '—'}</p>
              </div>
              <div>
                <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Category
                </span>
                <p className="text-ink-700">
                  {inspectedRecord.categories ?? '—'}
                </p>
              </div>
              <div>
                <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Created
                </span>
                <p className="text-ink-700">{formatDate(inspectedRecord.created_date)}</p>
              </div>
              <div>
                <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                  Last Updated
                </span>
                <p className="text-ink-700">{formatDate(inspectedRecord.updated_date)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-xs text-ink-500">
            Article record could not be found.
          </p>
        )}
      </PanelModal>
    </div>
  )
}

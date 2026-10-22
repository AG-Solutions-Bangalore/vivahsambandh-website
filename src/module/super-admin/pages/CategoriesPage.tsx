/**
 * @file src/module/super-admin/pages/CategoriesPage.tsx
 * Category management for the Super Admin Panel: list the taxonomy that
 * groups the blog articles, add new categories, rename them, publish or
 * unpublish them, and delete them.
 *
 * The categories created here are the ones the blog editor offers in its
 * category picker and the ones the article list filters by, so the names
 * an admin types here are what visitors read on the public site.
 */

import { useMemo, useState } from 'react'
import { Pencil, Plus, RefreshCw, Tags, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from 'cn'
import type { Category, CategoryStatus } from '@/module/category/types'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { PanelModal } from '../components/PanelModal'
import { PanelPagination } from '../components/PanelPagination'
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
import { StatusSwitch } from '../components/StatusSwitch'
import { panelDescription } from '../navigation'
import { errorMessage } from '../hook/errors'
import { DEFAULT_PER_PAGE, useServerSearch } from '../hook/useServerList'
import {
  useCategoriesListQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useUpdateCategoryStatusMutation,
} from '../hook/useCategories'

const STATUS_FILTERS = ['All', 'Active', 'Inactive'] as const

interface CategoryFormState {
  category_name: string
  category_status: CategoryStatus
}

const DEFAULT_FORM: CategoryFormState = {
  category_name: '',
  category_status: 'Active',
}

export default function CategoriesPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const { searchInput, setSearchInput, searchTerm } = useServerSearch()

  const {
    records: categories,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useCategoriesListQuery({
    page,
    per_page: DEFAULT_PER_PAGE,
    search: searchTerm || undefined,
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryFormState>(DEFAULT_FORM)

  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()
  const statusMutation = useUpdateCategoryStatusMutation()
  const deleteMutation = useDeleteCategoryMutation()

  // The API ignores the status parameter, so the publication state is
  // filtered here. The search term is sent to the server as well, and the
  // name is matched again on the rows that come back.
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase()

    return categories.filter((category) => {
      if (statusFilter !== 'All' && category.status !== statusFilter) return false
      if (term && !category.name.toLowerCase().includes(term)) return false
      return true
    })
  }, [categories, searchTerm, statusFilter])

  const hasFilters = searchTerm !== '' || statusFilter !== 'All'

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const handleOpenCreate = () => {
    setForm(DEFAULT_FORM)
    setCreateOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditTarget(category)
    setForm({
      category_name: category.name,
      category_status: category.status,
    })
  }

  const handleCreateSubmit = () => {
    const name = form.category_name.trim()
    if (!name) return

    createMutation.mutate(
      {
        payload: {
          category_name: name,
          category_status: form.category_status,
        },
        successMessage: `Category "${name}" created successfully.`,
      },
      {
        onSuccess: () => {
          setCreateOpen(false)
          setForm(DEFAULT_FORM)
        },
      },
    )
  }

  const handleEditSubmit = () => {
    if (!editTarget) return
    const name = form.category_name.trim()
    if (!name) return

    updateMutation.mutate(
      {
        id: editTarget.id,
        payload: {
          category_name: name,
          category_status: form.category_status,
        },
        successMessage: `Category "${name}" updated successfully.`,
      },
      {
        onSuccess: () => {
          setEditTarget(null)
          setForm(DEFAULT_FORM)
        },
      },
    )
  }

  const handleToggleStatus = async (
    category: Category,
    nextStatus: CategoryStatus,
  ) => {
    await statusMutation.mutateAsync({
      id: category.id,
      category_status: nextStatus,
      successMessage: `"${category.name}" marked as ${nextStatus}.`,
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return

    deleteMutation.mutate(
      {
        id: deleteTarget.id,
        successMessage: `"${deleteTarget.name}" deleted successfully.`,
      },
      {
        onSuccess: () => setDeleteTarget(null),
      },
    )
  }

  const firstRow = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const lastRow = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Categories"
        description={panelDescription('/panel/categories')}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="cursor-pointer gap-2 rounded-full border-cream-300 bg-cream-50 text-xs font-semibold text-navy-900 hover:bg-cream-100/70"
            >
              <RefreshCw className={cn('size-3.5 text-navy-700', isFetching && 'animate-spin')} />
              <span>Refresh</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleOpenCreate}
              className="cursor-pointer gap-2 rounded-full bg-gold-600 text-xs font-bold text-white shadow-gold hover:bg-gold-700"
            >
              <Plus className="size-4" />
              <span>Add Category</span>
            </Button>
          </div>
        }
      />

      <PanelCard flush>
        <PanelToolbar
          search={
            <PanelSearch
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search categories…"
            />
          }
        >
          <PanelFilterSelect
            id="filter-category-status"
            label="Status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={handleStatusFilterChange}
            showStatusDots
          />
        </PanelToolbar>

        {isLoading ? (
          <PanelTableSkeleton rows={5} columns={3} />
        ) : error ? (
          <PanelError
            message={errorMessage(error, 'Could not load the categories.')}
            onRetry={() => void refetch()}
          />
        ) : filtered.length === 0 ? (
          <PanelEmpty
            icon={<Tags className="size-6" />}
            title={hasFilters ? 'No matching categories' : 'No categories yet'}
            description={
              hasFilters
                ? 'Try a different search term or clear the status filter.'
                : 'Categories group the blog articles — add the first one to get started.'
            }
            action={
              hasFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchInput('')
                    setStatusFilter('All')
                    setPage(1)
                  }}
                  className="mt-4 cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
                >
                  Clear filters
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleOpenCreate}
                  className="mt-4 cursor-pointer rounded-full bg-gold-600 text-xs font-bold text-white hover:bg-gold-700"
                >
                  <Plus className="mr-1.5 size-3.5" />
                  Add First Category
                </Button>
              )
            }
          />
        ) : (
          <PanelTable
            caption="Categories available for blog articles"
            head={
              <>
                <PanelTableHeadCell>SI/NO</PanelTableHeadCell>
                <PanelTableHeadCell>Category</PanelTableHeadCell>
                <PanelTableHeadCell>Status</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
              </>
            }
          >
            {filtered.map((category, index) => (
              <tr
                key={category.id}
                className="transition-colors hover:bg-cream-50/70"
              >
                <td className="px-4 py-3.5 text-xs font-bold text-navy-800">
                  {index + 1}
                </td>

                <td className="px-4 py-3.5">
                  <p className="text-sm font-bold text-navy-900">
                    {category.name || 'Untitled category'}
                  </p>
                  {category.description ? (
                    <p className="mt-1 line-clamp-2 leading-relaxed text-ink-600">
                      {category.description}
                    </p>
                  ) : null}
                </td>

                <td className="px-4 py-3.5">
                  <StatusSwitch
                    status={category.status}
                    onStatusChange={(nextStatus) =>
                      handleToggleStatus(category, nextStatus)
                    }
                  />
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      onClick={() => handleOpenEdit(category)}
                      title="Edit category"
                      aria-label="Edit category"
                      className="cursor-pointer rounded-full border-gold-300 bg-gold-50 text-gold-800 hover:bg-gold-100"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                    </Button>

                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      onClick={() => setDeleteTarget(category)}
                      title="Delete category"
                      aria-label="Delete category"
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
                Showing <strong>{firstRow}</strong>–<strong>{lastRow}</strong> of{' '}
                <strong>{meta.total}</strong> categories
              </span>
            }
          />
        </PanelTableFooter>
      </PanelCard>

      {/* Create Category Modal */}
      <PanelModal
        isOpen={createOpen}
        title="Add Category"
        description="Categories group the blog articles and drive the category filters."
        icon={<Plus className="size-5" />}
        size="sm"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createMutation.isPending}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateSubmit}
              disabled={createMutation.isPending || !form.category_name.trim()}
              className="cursor-pointer rounded-full bg-navy-900 px-5 text-xs font-bold text-white hover:bg-navy-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving…' : 'Create Category'}
            </Button>
          </>
        }
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleCreateSubmit()
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="create-category-name"
              className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase"
            >
              Category Name <span className="text-maroon-600">*</span>
            </label>
            <Input
              id="create-category-name"
              type="text"
              value={form.category_name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, category_name: event.target.value }))
              }
              placeholder="e.g. Wedding Planning"
              required
              className="h-10 rounded-xl border-cream-300 text-xs"
            />
          </div>
        </form>
      </PanelModal>

      {/* Edit Category Modal */}
      <PanelModal
        isOpen={editTarget !== null}
        title={editTarget ? `Edit "${editTarget.name}"` : 'Edit Category'}
        description="Rename the category or change whether it is published."
        icon={<Pencil className="size-5" />}
        size="sm"
        onClose={() => setEditTarget(null)}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={updateMutation.isPending}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEditSubmit}
              disabled={updateMutation.isPending || !form.category_name.trim()}
              className="cursor-pointer rounded-full bg-navy-900 px-5 text-xs font-bold text-white hover:bg-navy-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleEditSubmit()
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="edit-category-name"
              className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase"
            >
              Category Name <span className="text-maroon-600">*</span>
            </label>
            <Input
              id="edit-category-name"
              type="text"
              value={form.category_name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, category_name: event.target.value }))
              }
              required
              className="h-10 rounded-xl border-cream-300 text-xs"
            />
          </div>

          <div>
            <label
              htmlFor="edit-category-status"
              className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase"
            >
              Status
            </label>
            <select
              id="edit-category-status"
              value={form.category_status}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  category_status: event.target.value as CategoryStatus,
                }))
              }
              className="h-10 w-full cursor-pointer rounded-xl border border-cream-300 bg-cream-50/70 px-3 text-xs font-semibold text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </PanelModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? Articles linked to it will lose their category. If the database prohibits deletion, the category is deactivated instead.`
            : ''
        }
        confirmText={deleteMutation.isPending ? 'Deleting…' : 'Delete Category'}
        variant="danger"
      />
    </div>
  )
}

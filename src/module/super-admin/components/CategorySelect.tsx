/**
 * @file src/module/super-admin/components/CategorySelect.tsx
 * Category picker for the Super Admin Panel.
 *
 * Categories are a reference table, so the panel never types an id by hand
 * any more: it picks the category by name from a searchable dropdown. The
 * whole taxonomy is fetched once and cached, and the value that travels
 * back to the caller is still the id the API expects.
 */

import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { useCategoryOptionsQuery } from '@/module/category/hook/useCategories'
import { PanelSelect, type PanelSelectOption } from './PanelSelect'

/** Sentinel the filters use for "no category selected". */
const ALL_CATEGORIES = 'all'

interface CategorySelectProps {
  id: string
  /** The selected category id, as a string. Empty means "not selected". */
  value: string
  onChange: (value: string) => void
  /** Accessible name; also the visible prefix inside the trigger. */
  label?: string
  /** Hides the inline prefix so an external `<label>` can name the field. */
  showLabel?: boolean
  /** Offers an "All categories" entry that clears the selection. */
  includeAll?: boolean
  allLabel?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CategorySelect({
  id,
  value,
  onChange,
  label = 'Category',
  showLabel = true,
  includeAll = false,
  allLabel = 'All categories',
  placeholder = 'Select a category',
  className,
  disabled = false,
}: CategorySelectProps) {
  const { data, isLoading, isError } = useCategoryOptionsQuery()

  const categories = useMemo(() => data?.records ?? [], [data])

  const options = useMemo<PanelSelectOption<string>[]>(
    () => [
      ...(includeAll
        ? [{ value: ALL_CATEGORIES, label: allLabel }]
        : []),
      ...categories.map((category) => ({
        value: String(category.id),
        label: category.name || `Category ${category.id}`,
      })),
    ],
    [allLabel, categories, includeAll],
  )

  const handleChange = (next: string) => {
    onChange(includeAll && next === ALL_CATEGORIES ? '' : next)
  }

  const triggerLabel = isLoading
    ? 'Loading categories…'
    : isError
      ? 'Categories unavailable'
      : placeholder

  return (
    <div className={className}>
      <PanelSelect
        id={id}
        label={label}
        value={includeAll && !value ? ALL_CATEGORIES : value}
        options={options}
        onChange={handleChange}
        showLabel={showLabel}
        searchable
        searchPlaceholder="Search categories…"
        placeholder={triggerLabel}
        emptyText={isError ? 'Could not load the categories.' : 'No category matches.'}
        disabled={disabled || isLoading}
      />
      {isLoading ? (
        <p className="mt-1 flex items-center gap-1.5 text-[0.7rem] text-ink-400">
          <Loader2 className="size-3 animate-spin" aria-hidden />
          Loading categories…
        </p>
      ) : null}
    </div>
  )
}

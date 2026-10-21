/**
 * @file src/module/super-admin/components/BlogEditorForm.tsx
 * The shared create/edit form for blog articles.
 *
 * Both the "new article" and "edit article" dialogs render this component,
 * so the field set, the validation rules and the slug behaviour cannot drift
 * apart between the two flows.
 */

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Upload } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/ckeditor'
import { cn } from 'cn'
import type { BlogPayload, BlogStatus } from '../types'
import { slugify, type BlogFormValues } from './blogForm'

/** Field label used across the form. */
const LABEL_CLASS =
  'mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase'

const INPUT_CLASS = 'h-10 rounded-xl border-cream-300 text-xs'

const ERROR_CLASS = 'mt-1 text-[0.7rem] text-maroon-600'

interface BlogEditorFormProps {
  /** Identifies the `<form>` so the modal footer can submit it natively. */
  formId: string
  initialValues: BlogFormValues
  /** Existing banner image, shown until a new file is picked. */
  currentBannerUrl?: string | null
  /** Auto-fills the slug from the title while the slug is untouched. */
  autoSlug?: boolean
  /**
   * The API rejects a create without a banner image. An update may keep the
   * image it already has, so the requirement is opt-in.
   */
  requireBanner?: boolean
  isSubmitting?: boolean
  onSubmit: (payload: BlogPayload) => void
}

export function BlogEditorForm({
  formId,
  initialValues,
  currentBannerUrl,
  autoSlug = false,
  requireBanner = false,
  isSubmitting = false,
  onSubmit,
}: BlogEditorFormProps) {
  const [values, setValues] = useState<BlogFormValues>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState('')
  const [slugTouched, setSlugTouched] = useState(!autoSlug)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Release the object URL when it is replaced or the form unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const update = <K extends keyof BlogFormValues>(
    key: K,
    value: BlogFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value
    setValues((prev) => ({
      ...prev,
      blog_title: title,
      blog_slug: autoSlug && !slugTouched ? slugify(title) : prev.blog_slug,
    }))
  }

  const handleSlugChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true)
    update('blog_slug', event.target.value)
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        blog_banner_image: 'Please select a valid image file.',
      }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        blog_banner_image: 'Image size must be less than 5MB.',
      }))
      return
    }

    setErrors((prev) => {
      const next = { ...prev }
      delete next.blog_banner_image
      return next
    })

    setPreview(URL.createObjectURL(file))
    update('blog_banner_image', file)
  }

  const handleClearImage = () => {
    setPreview('')
    update('blog_banner_image', null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}

    if (!values.blog_title.trim()) {
      next.blog_title = 'Article title is required.'
    }
    if (!values.blog_slug.trim()) {
      next.blog_slug = 'Article slug is required.'
    }
    if (!values.blog_short_description.trim()) {
      next.blog_short_description = 'A short description is required.'
    }
    if (!values.blog_description.trim()) {
      next.blog_description = 'Article content is required.'
    }
    if (!values.blog_banner_image_alt.trim()) {
      next.blog_banner_image_alt = 'Banner alt text is required.'
    }
    if (requireBanner && !values.blog_banner_image && !currentBannerUrl) {
      next.blog_banner_image = 'A banner image is required.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return
    if (!validate()) return

    onSubmit({
      blog_title: values.blog_title.trim(),
      blog_slug: values.blog_slug.trim(),
      blog_short_description: values.blog_short_description.trim(),
      blog_description: values.blog_description,
      blog_categories_ids: values.blog_categories_ids.trim(),
      blog_banner_image_alt: values.blog_banner_image_alt.trim(),
      blog_meta_keywords: values.blog_meta_keywords.trim(),
      blog_status: values.blog_status,
      blog_index: values.blog_index.trim(),
      blog_front: values.blog_front,
      blog_featured: values.blog_featured,
      blog_banner_image: values.blog_banner_image,
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      {/* Title + Slug */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="blog-title" className={LABEL_CLASS}>
            Title <span className="text-maroon-600">*</span>
          </label>
          <Input
            id="blog-title"
            type="text"
            placeholder="e.g. Choosing the Right Life Partner"
            value={values.blog_title}
            onChange={handleTitleChange}
            className={INPUT_CLASS}
          />
          {errors.blog_title ? (
            <p className={ERROR_CLASS}>{errors.blog_title}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="blog-slug" className={LABEL_CLASS}>
            Slug <span className="text-maroon-600">*</span>
          </label>
          <Input
            id="blog-slug"
            type="text"
            placeholder="choosing-the-right-life-partner"
            value={values.blog_slug}
            onChange={handleSlugChange}
            className={INPUT_CLASS}
          />
          {errors.blog_slug ? (
            <p className={ERROR_CLASS}>{errors.blog_slug}</p>
          ) : null}
        </div>
      </div>

      {/* Short description */}
      <div>
        <label htmlFor="blog-short-description" className={LABEL_CLASS}>
          Short Description <span className="text-maroon-600">*</span>
        </label>
        <Textarea
          id="blog-short-description"
          rows={2}
          placeholder="One or two lines shown on the listing cards…"
          value={values.blog_short_description}
          onChange={(event) =>
            update('blog_short_description', event.target.value)
          }
          className="rounded-xl border-cream-300 text-xs"
        />
        {errors.blog_short_description ? (
          <p className={ERROR_CLASS}>{errors.blog_short_description}</p>
        ) : null}
      </div>

      {/* Body */}
      <div>
        <span className={LABEL_CLASS}>
          Article Content <span className="text-maroon-600">*</span>
        </span>
        <RichTextEditor
          id={`${formId}-content`}
          value={values.blog_description}
          onChange={(html) => update('blog_description', html)}
          placeholder="Write the full article…"
          ariaLabel="Article content"
        />
        {errors.blog_description ? (
          <p className={ERROR_CLASS}>{errors.blog_description}</p>
        ) : null}
      </div>

      {/* Category + Index */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="blog-category" className={LABEL_CLASS}>
            Category ID
          </label>
          <Input
            id="blog-category"
            type="text"
            placeholder="e.g. 4"
            value={values.blog_categories_ids}
            onChange={(event) =>
              update('blog_categories_ids', event.target.value)
            }
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="blog-index" className={LABEL_CLASS}>
            Display Order
          </label>
          <Input
            id="blog-index"
            type="text"
            placeholder="e.g. 12"
            value={values.blog_index}
            onChange={(event) => update('blog_index', event.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Meta keywords */}
      <div>
        <label htmlFor="blog-meta-keywords" className={LABEL_CLASS}>
          Meta Keywords
        </label>
        <Input
          id="blog-meta-keywords"
          type="text"
          placeholder="matrimonial, wedding tips, shadi"
          value={values.blog_meta_keywords}
          onChange={(event) => update('blog_meta_keywords', event.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      {/* Banner image */}
      <div>
        <span className={LABEL_CLASS}>
          Banner Image{' '}
          {requireBanner ? <span className="text-maroon-600">*</span> : null}
        </span>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          id={`${formId}-file-input`}
        />

        {preview || currentBannerUrl ? (
          <div className="relative max-h-40 overflow-hidden rounded-2xl border border-cream-300 bg-navy-900">
            <img
              src={preview || currentBannerUrl || ''}
              alt="Banner preview"
              className="h-36 w-full object-contain"
            />
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute top-2 right-2 cursor-pointer rounded-full bg-navy-950/80 p-1 text-white transition-colors hover:bg-maroon-600"
              title="Remove image"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ) : (
          <label
            htmlFor={`${formId}-file-input`}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50/50 p-4 text-center transition-colors hover:border-gold-500/60 hover:bg-gold-100/70"
          >
            <Upload className="mb-1 size-6 text-gold-600" aria-hidden />
            <span className="text-xs font-semibold text-navy-900">
              Click to upload banner image
            </span>
            <span className="mt-0.5 text-[0.68rem] text-ink-400">
              PNG, JPG, WebP up to 5MB
            </span>
          </label>
        )}
        {errors.blog_banner_image ? (
          <p className={ERROR_CLASS}>{errors.blog_banner_image}</p>
        ) : null}
      </div>

      {/* Banner alt text */}
      <div>
        <label htmlFor="blog-banner-alt" className={LABEL_CLASS}>
          Banner Alt Text <span className="text-maroon-600">*</span>
        </label>
        <Input
          id="blog-banner-alt"
          type="text"
          placeholder="Describe the banner image for screen readers and search engines"
          value={values.blog_banner_image_alt}
          onChange={(event) => update('blog_banner_image_alt', event.target.value)}
          className={INPUT_CLASS}
        />
        {errors.blog_banner_image_alt ? (
          <p className={ERROR_CLASS}>{errors.blog_banner_image_alt}</p>
        ) : null}
      </div>

      {/* Status + placement */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="blog-status" className={LABEL_CLASS}>
            Status
          </label>
          <select
            id="blog-status"
            value={values.blog_status}
            onChange={(event) =>
              update('blog_status', event.target.value as BlogStatus)
            }
            className="h-10 w-full cursor-pointer rounded-xl border border-cream-300 bg-cream-50/70 px-3 text-xs font-semibold text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <label
          htmlFor="blog-front"
          className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-cream-300 bg-cream-50/70 px-3 text-xs font-semibold text-navy-900"
        >
          <input
            id="blog-front"
            type="checkbox"
            checked={values.blog_front}
            onChange={(event) => update('blog_front', event.target.checked)}
            className="size-4 accent-gold-600"
          />
          <span>Show on home page</span>
        </label>

        <label
          htmlFor="blog-featured"
          className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-cream-300 bg-cream-50/70 px-3 text-xs font-semibold text-navy-900"
        >
          <input
            id="blog-featured"
            type="checkbox"
            checked={values.blog_featured}
            onChange={(event) => update('blog_featured', event.target.checked)}
            className="size-4 accent-gold-600"
          />
          <span>Featured article</span>
        </label>
      </div>

      {isSubmitting ? (
        <p className="text-[0.7rem] text-ink-400">
          Saving the article — please keep this dialog open.
        </p>
      ) : null}
    </form>
  )
}

/** Placement chips shown in the article list and the inspector. */
export function BlogPlacementChips({
  isFront,
  isFeatured,
}: {
  isFront: boolean
  isFeatured: boolean
}) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {isFront ? (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border border-gold-300 bg-gold-50 px-2 py-0.5 text-[0.68rem] font-bold text-gold-800',
          )}
        >
          Home
        </span>
      ) : null}
      {isFeatured ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-navy-200 bg-navy-50 px-2 py-0.5 text-[0.68rem] font-bold text-navy-800">
          Featured
        </span>
      ) : null}
      {!isFront && !isFeatured ? (
        <span className="text-[0.7rem] text-ink-400 italic">Standard</span>
      ) : null}
    </span>
  )
}

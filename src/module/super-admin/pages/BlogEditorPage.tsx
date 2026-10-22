/**
 * @file src/module/super-admin/pages/BlogEditorPage.tsx
 * Create/edit screen for a blog article.
 *
 * The article form is long — a rich-text body, a banner upload and the
 * metadata block — so it gets a page of its own instead of a dialog that
 * has to be scrolled inside a modal.
 */

import { ArrowLeft, FileText, RefreshCw, Save } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { PanelError } from '../components/PanelState'
import { SkeletonText } from '../components/PanelSkeleton'
import { BlogEditorForm } from '../components/BlogEditorForm'
import { blogToFormValues, emptyBlogForm } from '../components/blogForm'
import { errorMessage } from '../hook/errors'
import {
  useBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
} from '../hook/useBlogs'
import type { BlogPayload } from '../types'

const FORM_ID = 'blog-editor-form'

const LIST_PATH = '/panel/blogs'

export default function BlogEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const isEdit = Boolean(id)
  const recordId = isEdit ? Number(id) : null

  const createMutation = useCreateBlogMutation()
  const updateMutation = useUpdateBlogMutation()

  const {
    data: record,
    isLoading,
    error,
  } = useBlogQuery(recordId)

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (payload: BlogPayload) => {
    if (isEdit && record) {
      updateMutation.mutate(
        {
          id: record.id,
          payload,
          successMessage: `Article "${payload.blog_title}" updated successfully.`,
        },
        { onSuccess: () => navigate(LIST_PATH) },
      )
      return
    }

    createMutation.mutate(
      { payload, successMessage: 'Article created successfully!' },
      { onSuccess: () => navigate(LIST_PATH) },
    )
  }

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6">
        <PanelPageHeader title="Edit Article" />
        <PanelCard>
          <SkeletonText lines={8} className="py-6" />
        </PanelCard>
      </div>
    )
  }

  if (isEdit && error) {
    return (
      <div className="space-y-6">
        <PanelPageHeader title="Edit Article" />
        <PanelCard>
          <PanelError
            message={errorMessage(error, 'Could not load the article for editing.')}
            onRetry={() => navigate(LIST_PATH)}
          />
        </PanelCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title={isEdit ? 'Edit Article' : 'New Article'}
        description={
          isEdit
            ? 'Update the article content, placement and publication state.'
            : 'Publish a new article to the blog, the home page rail or both.'
        }
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(LIST_PATH)}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              <span>Back to list</span>
            </Button>

            <Button
              type="submit"
              form={FORM_ID}
              disabled={isSubmitting}
              className="cursor-pointer rounded-full bg-navy-900 px-5 text-xs font-bold text-white hover:bg-navy-700 disabled:opacity-60"
            >
              {isSubmitting ? (
                <RefreshCw className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Save className="size-3.5" aria-hidden />
              )}
              <span>{isEdit ? 'Save Changes' : 'Publish Article'}</span>
            </Button>
          </>
        }
      />

      <PanelCard>
        {isEdit && record ? (
          <BlogEditorForm
            key={`edit-${record.id}`}
            formId={FORM_ID}
            initialValues={blogToFormValues(record)}
            currentBannerUrl={record.banner_image ?? null}
            isEdit
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        ) : (
          <BlogEditorForm
            key="create"
            formId={FORM_ID}
            initialValues={emptyBlogForm()}
            autoSlug
            requireBanner
            isEdit={false}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        )}
      </PanelCard>

      <p className="flex items-center gap-1.5 text-[0.7rem] text-ink-400">
        <FileText className="size-3" aria-hidden />
        Saving an article updates the blog listing and the public site.
      </p>
    </div>
  )
}

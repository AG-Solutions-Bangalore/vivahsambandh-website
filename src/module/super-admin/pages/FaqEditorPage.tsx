/**
 * @file src/module/super-admin/pages/FaqEditorPage.tsx
 * Create/edit screen for an FAQ group.
 *
 * A group is a stack of questions and answers, which is far too much to
 * edit inside a dialog — so the editor gets a page of its own.
 */

import { ArrowLeft, HelpCircle, RefreshCw, Save } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { PanelError } from '../components/PanelState'
import { SkeletonText } from '../components/PanelSkeleton'
import { FaqEditorForm } from '../components/FaqEditorForm'
import { emptyFaqForm, faqToFormValues } from '../components/faqForm'
import { errorMessage } from '../hook/errors'
import {
  useCreateFaqMutation,
  useFaqQuery,
  useUpdateFaqMutation,
} from '../hook/useFaqs'
import type { FaqPayload } from '../types'

const FORM_ID = 'faq-editor-form'

const LIST_PATH = '/panel/faqs'

export default function FaqEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const isEdit = Boolean(id)
  const recordId = isEdit ? Number(id) : null

  const createMutation = useCreateFaqMutation()
  const updateMutation = useUpdateFaqMutation()

  const {
    data: record,
    isLoading,
    error,
  } = useFaqQuery(recordId)

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (payload: FaqPayload) => {
    if (isEdit && record) {
      updateMutation.mutate(
        {
          id: record.id,
          payload,
          successMessage: `FAQ group for "${payload.faq_for}" updated successfully!`,
        },
        { onSuccess: () => navigate(LIST_PATH) },
      )
      return
    }

    createMutation.mutate(
      {
        payload,
        successMessage: `FAQ group for "${payload.faq_for}" created successfully!`,
      },
      { onSuccess: () => navigate(LIST_PATH) },
    )
  }

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6">
        <PanelPageHeader title="Edit FAQ Group" />
        <PanelCard>
          <SkeletonText lines={8} className="py-6" />
        </PanelCard>
      </div>
    )
  }

  if (isEdit && error) {
    return (
      <div className="space-y-6">
        <PanelPageHeader title="Edit FAQ Group" />
        <PanelCard>
          <PanelError
            message={errorMessage(error, 'Could not load the FAQ group for editing.')}
            onRetry={() => navigate(LIST_PATH)}
          />
        </PanelCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title={isEdit ? 'Edit FAQ Group' : 'New FAQ Group'}
        description={
          isEdit
            ? 'Update the questions and answers of this accordion group.'
            : 'Create an accordion group for a page section and add its questions.'
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
              <span>{isEdit ? 'Save Changes' : 'Create FAQ Group'}</span>
            </Button>
          </>
        }
      />

      <PanelCard>
        {isEdit && record ? (
          <FaqEditorForm
            key={`edit-${record.id}`}
            formId={FORM_ID}
            initialValues={faqToFormValues(record)}
            groupId={record.id}
            isEdit
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        ) : (
          <FaqEditorForm
            key="create"
            formId={FORM_ID}
            initialValues={emptyFaqForm()}
            isEdit={false}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        )}
      </PanelCard>

      <p className="flex items-center gap-1.5 text-[0.7rem] text-ink-400">
        <HelpCircle className="size-3" aria-hidden />
        Saved groups appear on the public site wherever the target section is used.
      </p>
    </div>
  )
}

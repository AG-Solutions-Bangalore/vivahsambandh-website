/**
 * @file src/module/super-admin/components/faqForm.ts
 * Form shape and pure helpers for the FAQ editor.
 *
 * Kept apart from the component file so the editor module only exports
 * components, and so the conversion rules live in one testable place.
 */

import type { FaqPayload, FaqRecord, FaqStatus } from '../types'

export interface FaqSubFormValues {
  id?: number
  faq_sort: number | string
  faq_heading: string
  faq_que: string
  faq_ans: string
  faq_status: FaqStatus
}

export interface FaqFormValues {
  faq_for: string
  faq_status: FaqStatus
  subs: FaqSubFormValues[]
}

/** A blank question row. */
export const DEFAULT_FAQ_SUB: FaqSubFormValues = {
  faq_sort: 1,
  faq_heading: '',
  faq_que: '',
  faq_ans: '',
  faq_status: 'Active',
}

/** A fresh, empty editor state. */
export function emptyFaqForm(): FaqFormValues {
  return {
    faq_for: 'home',
    faq_status: 'Active',
    subs: [{ ...DEFAULT_FAQ_SUB, faq_sort: 1 }],
  }
}

/** Turns an existing FAQ group into the editable form shape. */
export function faqToFormValues(record: FaqRecord): FaqFormValues {
  const subs =
    record.subs && record.subs.length > 0
      ? record.subs.map((sub, index) => ({
          id: sub.id,
          faq_sort: sub.faq_sort ?? index + 1,
          faq_heading: sub.faq_heading || '',
          faq_que: sub.faq_que || '',
          faq_ans: sub.faq_ans || '',
          faq_status: (sub.faq_status as FaqStatus) || 'Active',
        }))
      : [{ ...DEFAULT_FAQ_SUB, faq_sort: 1 }]

  return {
    faq_for: record.faq_for,
    faq_status: record.faq_status,
    subs,
  }
}

/** Builds the API payload out of the editor state. */
export function faqFormToPayload(values: FaqFormValues): FaqPayload {
  const faqFor = values.faq_for.trim()

  return {
    faq_for: faqFor,
    faq_status: values.faq_status,
    subs: values.subs.map((sub, index) => ({
      id: sub.id,
      faq_sort: sub.faq_sort || index + 1,
      faq_for: faqFor,
      faq_heading: sub.faq_heading.trim(),
      faq_que: sub.faq_que.trim(),
      faq_ans: sub.faq_ans.trim(),
      faq_status: sub.faq_status === 'Active' ? 1 : 0,
    })),
  }
}

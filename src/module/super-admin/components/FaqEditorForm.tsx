/**
 * @file src/module/super-admin/components/FaqEditorForm.tsx
 * The shared create/edit form for an FAQ group.
 *
 * A group holds a stack of questions and answers, so the editor is a
 * repeating builder rather than a fixed set of fields. Both the "new
 * group" and the "edit group" screens render this component, so the field
 * set and the validation rules cannot drift apart between the two flows.
 */

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { normalizePageSlug, PAGE_SLUG_ALIASES } from "@/lib/page-slug";
import type { FaqPayload, FaqStatus } from "../types";
import { useDeleteFaqSubMutation, usePageTwoOptions } from "../hook/useFaqs";
import {
  DEFAULT_FAQ_SUB,
  faqFormToPayload,
  type FaqFormValues,
  type FaqSubFormValues,
} from "./faqForm";

/** Human labels for the canonical routes the site renders. */
const ROUTE_LABELS: Record<string, string> = {
  home: "Home",
  about: "About Us",
  blogs: "Blogs",
  contact: "Contact",
  download: "Download",
  stories: "Success Stories",
  membership: "Membership",
  registration: "Registration",
};

/** Field label used across the form. */
const LABEL_CLASS =
  "mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase";

const SUB_LABEL_CLASS = "mb-1 block text-[11px] font-bold text-ink-700";

const ERROR_CLASS = "mt-1 text-[11px] text-maroon-600";

interface FaqEditorFormProps {
  /** Identifies the `<form>` so the page actions can submit it natively. */
  formId: string;
  initialValues: FaqFormValues;
  /** The group being edited — set so saved questions can be deleted. */
  groupId?: number;
  isSubmitting?: boolean;
  onSubmit: (payload: FaqPayload) => void;
}

export function FaqEditorForm({
  formId,
  initialValues,
  groupId,
  isSubmitting = false,
  onSubmit,
}: FaqEditorFormProps) {
  const [values, setValues] = useState<FaqFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const deleteSubMutation = useDeleteFaqSubMutation();
  const { data: pageOptions = [] } = usePageTwoOptions();

  const pageSlugs = useMemo(
    () =>
      pageOptions.map((p) => {
        const slug = normalizePageSlug(p.page_two_url);
        return {
          value: slug,
          label: `${p.page_two_name || slug} (${slug})`,
        };
      }),
    [pageOptions],
  );

  const placementOptions = useMemo(() => {
    // Every page the site renders must be selectable, otherwise an FAQ group
    // can never be placed on Stories / Membership. The CRM sitemap only
    // exposes a subset, so the canonical route list fills the gaps.
    const canonical = Object.entries(PAGE_SLUG_ALIASES).map(([route, aliases]) => ({
      value: aliases[0],
      label: `${ROUTE_LABELS[route] ?? route} (${aliases[0]})`,
    }));

    const list = [...canonical];
    for (const option of pageSlugs) {
      if (!list.some((o) => o.value === option.value)) list.push(option);
    }

    const currentFaqFor = normalizePageSlug(values.faq_for);
    if (currentFaqFor && !list.some((o) => o.value === currentFaqFor)) {
      list.unshift({
        value: currentFaqFor,
        label: `${currentFaqFor} (${currentFaqFor})`,
      });
    }
    return list;
  }, [pageSlugs, values.faq_for]);

  const update = <K extends keyof FaqFormValues>(
    key: K,
    value: FaqFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddSub = () => {
    setValues((prev) => ({
      ...prev,
      subs: [
        ...prev.subs,
        {
          ...DEFAULT_FAQ_SUB,
          faq_sort: prev.subs.length + 1,
        },
      ],
    }));
  };

  const handleUpdateSub = (index: number, patch: Partial<FaqSubFormValues>) => {
    setValues((prev) => {
      const nextSubs = [...prev.subs];
      nextSubs[index] = { ...nextSubs[index], ...patch };
      return { ...prev, subs: nextSubs };
    });
  };

  const handleRemoveSub = async (index: number) => {
    const sub = values.subs[index];

    if (sub.id && groupId) {
      const confirmed = window.confirm(
        "Are you sure you want to permanently delete this sub-question?",
      );
      if (!confirmed) return;

      try {
        await deleteSubMutation.mutateAsync({
          subId: sub.id,
          faqId: groupId,
          successMessage: "Sub-question deleted.",
        });
      } catch {
        return;
      }
    }

    setValues((prev) => {
      const next = prev.subs.filter((_, i) => i !== index);
      return {
        ...prev,
        subs: next.length > 0 ? next : [{ ...DEFAULT_FAQ_SUB, faq_sort: 1 }],
      };
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!values.faq_for.trim()) {
      next.faq_for = "Please select a page placement.";
    }

    if (values.subs.length === 0) {
      next.subs = "At least one question is required.";
    } else {
      values.subs.forEach((sub, index) => {
        if (!sub.faq_que.trim()) {
          next[`sub_${index}_que`] = `Question ${index + 1} is required.`;
        }
        if (!sub.faq_ans.trim()) {
          next[`sub_${index}_ans`] = `Answer ${index + 1} is required.`;
        }
      });
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    onSubmit(
      faqFormToPayload({
        ...values,
        faq_for: normalizePageSlug(values.faq_for),
      }),
    );
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Group level fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="faq-for" className={LABEL_CLASS}>
            Page Placement (faq_for){" "}
            <span className="text-maroon-600">*</span>
          </label>
          <SearchableSelect
            id="faq-for"
            value={normalizePageSlug(values.faq_for)}
            onChange={(val) => update("faq_for", normalizePageSlug(val))}
            options={placementOptions}
            placeholder="Search or select page..."
            error={Boolean(errors.faq_for)}
          />
          <p className="mt-1 text-[11px] text-ink-500">
            Select which website page displays this FAQ group. Type to search
            by page name or URL slug.
          </p>
          {errors.faq_for ? (
            <p className={ERROR_CLASS}>{errors.faq_for}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="faq-status" className={LABEL_CLASS}>
            Group Status
          </label>
          <select
            id="faq-status"
            value={values.faq_status}
            onChange={(event) =>
              update("faq_status", event.target.value as FaqStatus)
            }
            className="h-10 w-full cursor-pointer rounded-xl border border-cream-300 bg-cream-50/70 px-3 text-xs font-semibold text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
          >
            <option value="Active">Active (Visible)</option>
            <option value="Inactive">Inactive (Hidden)</option>
          </select>
          <p className="mt-1 text-[11px] text-ink-500">
            Set active to display on the live website.
          </p>
        </div>
      </div>

      {/* Question builder */}
      <div className="space-y-4 border-t border-cream-200 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className={LABEL_CLASS}>
              Questions &amp; Answers ({values.subs.length})
            </h3>
            <p className="text-[11px] text-ink-500">
              Add questions that will appear in this section's accordion.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSub}
            className="cursor-pointer rounded-full border-gold-400 bg-gold-50/70 text-xs font-bold text-navy-900 hover:bg-gold-100"
          >
            <Plus className="size-3.5" aria-hidden />
            <span>Add Question</span>
          </Button>
        </div>

        {errors.subs ? <p className={ERROR_CLASS}>{errors.subs}</p> : null}

        <div className="space-y-4">
          {values.subs.map((sub, index) => (
            <div
              key={sub.id ?? index}
              className="rounded-xl border border-cream-300 bg-cream-50/40 p-4 shadow-xs"
            >
              <div className="mb-3 flex items-center justify-between border-b border-cream-200/80 pb-2">
                <span className="text-xs font-bold text-navy-900">
                  Question {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => void handleRemoveSub(index)}
                  disabled={values.subs.length === 1}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-maroon-200 bg-maroon-50 px-2.5 py-0.5 text-[0.7rem] font-bold text-maroon-700 hover:bg-maroon-100 disabled:opacity-40"
                >
                  <Trash2 className="size-3" aria-hidden />
                  <span>Remove</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label
                    htmlFor={`faq-sub-heading-${index}`}
                    className={SUB_LABEL_CLASS}
                  >
                    Heading (Optional)
                  </label>
                  <Input
                    id={`faq-sub-heading-${index}`}
                    type="text"
                    value={sub.faq_heading}
                    onChange={(event) =>
                      handleUpdateSub(index, {
                        faq_heading: event.target.value,
                      })
                    }
                    placeholder="e.g. Account Security"
                    className="h-9 rounded-xl border border-cream-300 bg-white px-3 text-xs font-medium text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`faq-sub-sort-${index}`}
                    className={SUB_LABEL_CLASS}
                  >
                    Sort Order
                  </label>
                  <Input
                    id={`faq-sub-sort-${index}`}
                    type="number"
                    value={sub.faq_sort}
                    onChange={(event) =>
                      handleUpdateSub(index, { faq_sort: event.target.value })
                    }
                    className="h-9 rounded-xl border border-cream-300 bg-white px-3 text-xs font-medium text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label
                  htmlFor={`faq-sub-que-${index}`}
                  className={SUB_LABEL_CLASS}
                >
                  Question <span className="text-maroon-600">*</span>
                </label>
                <Input
                  id={`faq-sub-que-${index}`}
                  type="text"
                  value={sub.faq_que}
                  onChange={(event) =>
                    handleUpdateSub(index, { faq_que: event.target.value })
                  }
                  placeholder="e.g. How does profile verification work?"
                  className="h-9 rounded-xl border border-cream-300 bg-white px-3 text-xs font-medium text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
                />
                {errors[`sub_${index}_que`] ? (
                  <p className={ERROR_CLASS}>{errors[`sub_${index}_que`]}</p>
                ) : null}
              </div>

              <div className="mt-3">
                <label
                  htmlFor={`faq-sub-ans-${index}`}
                  className={SUB_LABEL_CLASS}
                >
                  Answer <span className="text-maroon-600">*</span>
                </label>
                <Textarea
                  id={`faq-sub-ans-${index}`}
                  rows={3}
                  value={sub.faq_ans}
                  onChange={(event) =>
                    handleUpdateSub(index, { faq_ans: event.target.value })
                  }
                  placeholder="Write comprehensive, clear answer..."
                  className="rounded-xl border border-cream-300 bg-white p-3 text-xs font-medium text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
                />
                {errors[`sub_${index}_ans`] ? (
                  <p className={ERROR_CLASS}>{errors[`sub_${index}_ans`]}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isSubmitting ? (
        <p className="text-[0.7rem] text-ink-400">
          Saving the FAQ group — please keep this page open.
        </p>
      ) : null}
    </form>
  );
}

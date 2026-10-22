/**
 * @file src/module/super-admin/pages/TestimonialsPage.tsx
 * Testimonial & Success Stories management for the Super Admin Panel:
 * list reviews, search and filter, create new testimonials, edit existing
 * reviews, toggle status, and delete records.
 */

import { useMemo, useState } from "react";
import {
  Quote,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Star,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "cn";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PanelCard } from "../components/PanelCard";
import { PanelPageHeader } from "../components/PanelPageHeader";
import { PanelModal } from "../components/PanelModal";
import { PanelPagination } from "../components/PanelPagination";
import { PanelSearch } from "../components/PanelSearch";
import { PanelToolbar } from "../components/PanelToolbar";
import { PanelEmpty, PanelError } from "../components/PanelState";
import { PanelTableSkeleton } from "../components/PanelSkeleton";
import {
  PanelTable,
  PanelTableFooter,
  PanelTableHeadCell,
} from "../components/PanelTable";
import { PanelFilterSelect } from "../components/PanelFilterSelect";
import { StatusSwitch } from "../components/StatusSwitch";
import { panelDescription } from "../navigation";
import { errorMessage } from "../hook/errors";
import { DEFAULT_PER_PAGE, useServerSearch } from "../hook/useServerList";
import { formatDate } from "../utils/format";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { normalizePageSlug, PAGE_SLUG_ALIASES } from "@/lib/page-slug";
import { usePageTwoOptions } from "../hook/useFaqs";
import {
  useCreateTestimonialMutation,
  useDeleteTestimonialMutation,
  useTestimonialsQuery,
  useUpdateTestimonialMutation,
  useUpdateTestimonialStatusMutation,
} from "../hook/useTestimonials";
import type {
  TestimonialPayload,
  TestimonialRecord,
  TestimonialStatus,
} from "../types";

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

const STATUS_FILTERS = ["All", "Active", "Inactive"] as const;

interface TestimonialFormState {
  testimonial_client_name: string;
  testimonial_for: string;
  testimonial_rating: number;
  testimonial_description: string;
  testimonial_status: TestimonialStatus;
}

const DEFAULT_FORM: TestimonialFormState = {
  testimonial_client_name: "",
  testimonial_for: "home",
  testimonial_rating: 5,
  testimonial_description: "",
  testimonial_status: "Active",
};

/** Star rating display and interactive picker */
function StarRating({
  rating,
  onChange,
  size = "md",
  interactive = false,
}: {
  rating: number;
  onChange?: (val: number) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const current = hoverRating ?? Math.round(Number(rating) || 5);

  const sizeClasses = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-5",
  }[size];

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role={interactive ? "radiogroup" : undefined}
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((starVal) => {
        const isFilled = starVal <= current;
        return (
          <button
            key={starVal}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starVal)}
            onMouseEnter={() => interactive && setHoverRating(starVal)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            className={cn(
              "transition-transform focus:outline-none",
              interactive &&
                "cursor-pointer hover:scale-125 focus-visible:scale-125",
              !interactive && "cursor-default",
            )}
          >
            <Star
              className={cn(
                sizeClasses,
                isFilled
                  ? "fill-amber-400 text-amber-400 drop-shadow-2xs"
                  : "fill-cream-200 text-cream-300",
              )}
            />
          </button>
        );
      })}
      <span className="ml-1.5 font-bold text-navy-900 tabular-nums">
        {Number(rating).toFixed(1)}
      </span>
    </div>
  );
}

export default function TestimonialsPage() {
  const { searchInput, setSearchInput, searchTerm } = useServerSearch();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);

  const {
    records: testimonials,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useTestimonialsQuery({
    search: searchTerm || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
  });

  const createMutation = useCreateTestimonialMutation();
  const updateMutation = useUpdateTestimonialMutation();
  const statusMutation = useUpdateTestimonialStatusMutation();
  const deleteMutation = useDeleteTestimonialMutation();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TestimonialRecord | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<TestimonialRecord | null>(
    null,
  );

  // Form State
  const [formState, setFormState] =
    useState<TestimonialFormState>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    const canonical = Object.entries(PAGE_SLUG_ALIASES).map(
      ([route, aliases]) => ({
        value: aliases[0],
        label: `${ROUTE_LABELS[route] ?? route} (${aliases[0]})`,
      }),
    );

    const list = [...canonical];
    for (const option of pageSlugs) {
      if (!list.some((o) => o.value === option.value)) list.push(option);
    }

    const currentTarget = normalizePageSlug(formState.testimonial_for);
    if (currentTarget && !list.some((o) => o.value === currentTarget)) {
      list.unshift({
        value: currentTarget,
        label: `${currentTarget} (${currentTarget})`,
      });
    }
    return list;
  }, [pageSlugs, formState.testimonial_for]);

  // The API filters the search on the server; the status column is not
  // filterable there yet, so it is applied to the rows of the current page.
  const filtered = useMemo(
    () =>
      statusFilter === "All"
        ? testimonials
        : testimonials.filter((t) => t.testimonial_status === statusFilter),
    [testimonials, statusFilter],
  );

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormState(DEFAULT_FORM);
    setFormErrors({});
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (record: TestimonialRecord) => {
    setEditingRecord(record);
    setFormState({
      testimonial_client_name: record.testimonial_client_name || "",
      testimonial_for: record.testimonial_for || "home",
      testimonial_rating: Number(record.testimonial_rating) || 5,
      testimonial_description: record.testimonial_description || "",
      testimonial_status: record.testimonial_status || "Active",
    });
    setFormErrors({});
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formState.testimonial_client_name.trim()) {
      errors.testimonial_client_name = "Client name is required.";
    }
    if (!formState.testimonial_for.trim()) {
      errors.testimonial_for = "Please select a page placement.";
    }
    if (!formState.testimonial_description.trim()) {
      errors.testimonial_description =
        "Testimonial quote/description is required.";
    } else if (formState.testimonial_description.trim().length < 10) {
      errors.testimonial_description =
        "Description should be at least 10 characters.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Create
  const handleCreateSubmit = async () => {
    if (!validateForm()) return;

    const payload: TestimonialPayload = {
      testimonial_client_name: formState.testimonial_client_name.trim(),
      testimonial_for: normalizePageSlug(formState.testimonial_for.trim()),
      testimonial_rating: formState.testimonial_rating,
      testimonial_description: formState.testimonial_description.trim(),
      testimonial_status: formState.testimonial_status,
    };

    try {
      await createMutation.mutateAsync({
        payload,
        successMessage: `Testimonial for "${payload.testimonial_client_name}" added successfully!`,
      });
      setIsCreateOpen(false);
    } catch {
      // Toast handled by mutation
    }
  };

  // Save Edit
  const handleEditSubmit = async () => {
    if (!editingRecord || !validateForm()) return;

    const payload: TestimonialPayload = {
      testimonial_client_name: formState.testimonial_client_name.trim(),
      testimonial_for: normalizePageSlug(formState.testimonial_for.trim()),
      testimonial_rating: formState.testimonial_rating,
      testimonial_description: formState.testimonial_description.trim(),
      testimonial_status: formState.testimonial_status,
    };

    try {
      await updateMutation.mutateAsync({
        id: editingRecord.id,
        payload,
        successMessage: "Testimonial updated successfully!",
      });
      setEditingRecord(null);
    } catch {
      // Toast handled by mutation
    }
  };

  // Toggle status
  const handleToggleStatus = async (
    record: TestimonialRecord,
    nextStatus: TestimonialStatus,
  ) => {
    await statusMutation.mutateAsync({
      id: record.id,
      status: nextStatus,
      successMessage: `Testimonial marked as ${nextStatus}.`,
    });
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;

    deleteMutation.mutate(
      {
        id,
        successMessage: "Testimonial removed successfully.",
      },
      {
        onSuccess: () => {
          setDeleteTarget(null);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Testimonials & Client Reviews"
        description={panelDescription("/panel/testimonials")}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="cursor-pointer rounded-full border-cream-300 bg-cream-50 text-xs font-semibold text-navy-900 hover:bg-cream-100/70"
            >
              <RefreshCw
                className={cn(
                  "size-3.5 text-navy-700",
                  isFetching && "animate-spin",
                )}
                aria-hidden
              />
              <span>Refresh</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleOpenCreate}
              className="cursor-pointer gap-2 rounded-full bg-gold-600 text-xs font-bold text-white shadow-gold hover:bg-gold-700"
            >
              <Plus className="size-4" aria-hidden />
              <span>Add Testimonial</span>
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
              placeholder="Search by client name, quote or section…"
            />
          }
        >
          <PanelFilterSelect
            id="filter-testimonial-status"
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTERS}
            showStatusDots
          />
        </PanelToolbar>

        {isLoading ? (
          <PanelTableSkeleton rows={5} columns={6} />
        ) : error ? (
          <PanelError
            message={errorMessage(error, "Could not load testimonials.")}
            onRetry={() => void refetch()}
          />
        ) : filtered.length === 0 ? (
          <PanelEmpty
            icon={<Quote className="size-6 text-gold-600" />}
            title={
              searchInput || statusFilter !== "All"
                ? "No matching testimonials"
                : "No testimonials found"
            }
            description={
              searchInput || statusFilter !== "All"
                ? "Try adjusting your search query or filter."
                : "Start showcasing authentic matrimonial matches and client reviews by creating one."
            }
            action={
              <Button
                type="button"
                size="sm"
                onClick={handleOpenCreate}
                className="mt-4 cursor-pointer rounded-full bg-gold-600 text-xs font-bold text-white shadow-gold hover:bg-gold-700"
              >
                <Plus className="size-4" />
                Add First Testimonial
              </Button>
            }
          />
        ) : (
          <PanelTable
            head={
              <>
                <PanelTableHeadCell>SI/NO</PanelTableHeadCell>
                <PanelTableHeadCell>Client / Couple</PanelTableHeadCell>
                <PanelTableHeadCell>Target Section</PanelTableHeadCell>
                <PanelTableHeadCell>Rating</PanelTableHeadCell>
                <PanelTableHeadCell className="max-w-md">
                  Review Excerpt
                </PanelTableHeadCell>
                <PanelTableHeadCell>Status</PanelTableHeadCell>
                <PanelTableHeadCell>Date</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
              </>
            }
          >
            {filtered.map((item, index) => {
              const initial = (item.testimonial_client_name || "C")
                .trim()
                .charAt(0)
                .toUpperCase();
              const ratingNum = Number(item.testimonial_rating) || 5;

              return (
                <tr
                  key={item.id}
                  className="group transition-colors hover:bg-cream-50/70"
                >
                  <td className="px-4 py-3.5 text-xs font-bold text-navy-800">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-500 font-serif text-xs font-bold text-white shadow-2xs">
                        {initial}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-navy-900 group-hover:text-gold-700">
                          {item.testimonial_client_name || "Anonymous Client"}
                        </div>
                        <div className="text-[11px] font-medium text-ink-500">
                          Verified Story
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold-300 bg-gold-50/90 px-2.5 py-1 text-xs font-bold text-gold-900 shadow-2xs">
                      <Layers className="size-3 text-gold-600" aria-hidden />
                      {item.testimonial_for || "home"}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StarRating rating={ratingNum} size="sm" />
                  </td>

                  <td className="max-w-md px-4 py-3.5">
                    <p className="line-clamp-2 text-xs leading-relaxed font-normal text-ink-800">
                      "{item.testimonial_description}"
                    </p>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusSwitch
                      status={item.testimonial_status}
                      onStatusChange={(nextStatus) =>
                        handleToggleStatus(item, nextStatus)
                      }
                    />
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-xs font-medium text-ink-500">
                    {formatDate(
                      item.testimonial_created_date || item.created_at,
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Testimonial"
                        aria-label="Edit testimonial"
                        className="cursor-pointer rounded-full border-gold-300 bg-gold-50/50 text-gold-900 hover:bg-gold-100"
                      >
                        <Pencil className="size-3.5" aria-hidden />
                      </Button>

                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        onClick={() => setDeleteTarget(item)}
                        title="Delete Testimonial"
                        aria-label="Delete testimonial"
                        className="cursor-pointer rounded-full border-maroon-200 bg-maroon-50 text-maroon-800 hover:bg-maroon-100"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </PanelTable>
        )}

        <PanelTableFooter>
          <PanelPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={isFetching}
            summary={
              <span>
                Showing <strong>{filtered.length}</strong> of{" "}
                <strong>{meta.total}</strong> reviews
              </span>
            }
          />
        </PanelTableFooter>
      </PanelCard>

      {/* CREATE MODAL */}
      <PanelModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Testimonial"
        description="Publish a couple review or client testimonial on the platform."
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateSubmit}
              disabled={createMutation.isPending}
              className="cursor-pointer rounded-full bg-gold-600 px-5 text-xs font-bold text-white shadow-gold hover:bg-gold-700"
            >
              {createMutation.isPending ? "Publishing…" : "Create Testimonial"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase">
              Client / Couple Name <span className="text-maroon-600">*</span>
            </label>
            <Input
              value={formState.testimonial_client_name}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  testimonial_client_name: e.target.value,
                }))
              }
              placeholder="e.g. Rahul & Sunita Mittal"
              className={cn(
                "h-10 rounded-xl border-cream-300 bg-cream-50/70 text-xs font-medium text-navy-900 focus-visible:border-gold-500 focus-visible:ring-gold-500/40",
                formErrors.testimonial_client_name &&
                  "border-maroon-400 focus-visible:ring-maroon-400",
              )}
            />
            {formErrors.testimonial_client_name && (
              <p className="mt-1 text-xs text-maroon-600">
                {formErrors.testimonial_client_name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="create-testimonial-for"
              className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase"
            >
              Page Placement <span className="text-maroon-600">*</span>
            </label>
            <SearchableSelect
              id="create-testimonial-for"
              value={normalizePageSlug(formState.testimonial_for)}
              onChange={(val) =>
                setFormState((prev) => ({
                  ...prev,
                  testimonial_for: normalizePageSlug(val),
                }))
              }
              options={placementOptions}
              placeholder="Search or select page..."
              error={Boolean(formErrors.testimonial_for)}
            />
            <p className="mt-1 text-[11px] text-ink-500">
              Select which website page displays this testimonial. Type to
              search by page name or URL slug.
            </p>
            {formErrors.testimonial_for ? (
              <p className="mt-1 text-xs text-maroon-600">
                {formErrors.testimonial_for}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase">
              Star Rating
            </label>
            <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-cream-300 bg-cream-50/70 px-4 py-2.5">
              <StarRating
                rating={formState.testimonial_rating}
                interactive
                size="lg"
                onChange={(val) =>
                  setFormState((prev) => ({ ...prev, testimonial_rating: val }))
                }
              />
              <span className="text-xs font-medium text-ink-600">
                Click a star to modify rating (1 to 5)
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase">
              Review Quote / Story <span className="text-maroon-600">*</span>
            </label>
            <Textarea
              value={formState.testimonial_description}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  testimonial_description: e.target.value,
                }))
              }
              rows={4}
              placeholder="Write the matrimonial review or success experience shared by the client..."
              className={cn(
                "rounded-xl border border-cream-300 bg-cream-50/70 p-3 text-xs font-medium text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none",
                formErrors.testimonial_description &&
                  "border-maroon-400 focus-visible:ring-maroon-400",
              )}
            />
            {formErrors.testimonial_description && (
              <p className="mt-1 text-xs text-maroon-600">
                {formErrors.testimonial_description}
              </p>
            )}
          </div>
        </div>
      </PanelModal>

      {/* EDIT MODAL */}
      <PanelModal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        title="Edit Testimonial"
        description="Update client name, rating, placement, or quote."
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingRecord(null)}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEditSubmit}
              disabled={updateMutation.isPending}
              className="cursor-pointer rounded-full bg-gold-600 px-5 text-xs font-bold text-white shadow-gold hover:bg-gold-700"
            >
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase">
              Client / Couple Name <span className="text-maroon-600">*</span>
            </label>
            <Input
              value={formState.testimonial_client_name}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  testimonial_client_name: e.target.value,
                }))
              }
              placeholder="e.g. Rahul & Sunita Mittal"
              className={cn(
                "h-10 rounded-xl border-cream-300 bg-cream-50/70 text-xs font-medium text-navy-900 focus-visible:border-gold-500 focus-visible:ring-gold-500/40",
                formErrors.testimonial_client_name &&
                  "border-maroon-400 focus-visible:ring-maroon-400",
              )}
            />
            {formErrors.testimonial_client_name && (
              <p className="mt-1 text-xs text-maroon-600">
                {formErrors.testimonial_client_name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-testimonial-for"
                className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase"
              >
                Page Placement (faq_for){" "}
                <span className="text-maroon-600">*</span>
              </label>
              <SearchableSelect
                id="edit-testimonial-for"
                value={normalizePageSlug(formState.testimonial_for)}
                onChange={(val) =>
                  setFormState((prev) => ({
                    ...prev,
                    testimonial_for: normalizePageSlug(val),
                  }))
                }
                options={placementOptions}
                placeholder="Search or select page..."
                error={Boolean(formErrors.testimonial_for)}
              />
              <p className="mt-1 text-[11px] text-ink-500">
                Select which website page displays this testimonial. Type to
                search by page name or URL slug.
              </p>
              {formErrors.testimonial_for ? (
                <p className="mt-1 text-xs text-maroon-600">
                  {formErrors.testimonial_for}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase">
                Publication Status
              </label>
              <select
                value={formState.testimonial_status}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    testimonial_status: e.target.value as TestimonialStatus,
                  }))
                }
                className="h-10 w-full cursor-pointer rounded-xl border border-cream-300 bg-cream-50/70 px-3 text-xs font-semibold text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
              >
                <option value="Active">Active (Visible)</option>
                <option value="Inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase">
              Star Rating
            </label>
            <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-cream-300 bg-cream-50/70 px-4 py-2.5">
              <StarRating
                rating={formState.testimonial_rating}
                interactive
                size="lg"
                onChange={(val) =>
                  setFormState((prev) => ({ ...prev, testimonial_rating: val }))
                }
              />
              <span className="text-xs font-medium text-ink-600">
                Click a star to modify rating
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-navy-900 uppercase">
              Review Quote / Story <span className="text-maroon-600">*</span>
            </label>
            <Textarea
              value={formState.testimonial_description}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  testimonial_description: e.target.value,
                }))
              }
              rows={4}
              className={cn(
                "rounded-xl border border-cream-300 bg-cream-50/70 p-3 text-xs font-medium text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none",
                formErrors.testimonial_description &&
                  "border-maroon-400 focus-visible:ring-maroon-400",
              )}
            />
            {formErrors.testimonial_description && (
              <p className="mt-1 text-xs text-maroon-600">
                {formErrors.testimonial_description}
              </p>
            )}
          </div>
        </div>
      </PanelModal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Testimonial?"
        description={
          deleteTarget
            ? `Are you sure you want to permanently delete the review by "${deleteTarget.testimonial_client_name}"? If the database prohibits deletion, it will be automatically deactivated.`
            : ""
        }
        confirmText={
          deleteMutation.isPending ? "Deleting…" : "Delete Testimonial"
        }
        variant="danger"
      />
    </div>
  );
}

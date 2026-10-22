/**
 * @file src/module/super-admin/pages/BlogGalleryPage.tsx
 * Gallery management for the Super Admin Panel:
 * Visual media gallery of photos and image assets, with WebP upload,
 * status controls, copyable image links, image inspection, and deletion.
 */

import { useMemo, useState, useRef } from "react";
import {
  Images,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PanelCard } from "../components/PanelCard";
import { PanelPageHeader } from "../components/PanelPageHeader";
import { PanelModal } from "../components/PanelModal";
import { PanelPagination } from "../components/PanelPagination";
import { PanelSearch } from "../components/PanelSearch";
import { PanelToolbar } from "../components/PanelToolbar";
import { PanelEmpty, PanelError } from "../components/PanelState";
import { SkeletonText } from "../components/PanelSkeleton";
import { PanelFilterSelect } from "../components/PanelFilterSelect";
import { StatusBadge } from "../components/StatusBadge";
import { panelDescription } from "../navigation";
import { errorMessage } from "../hook/errors";
import { DEFAULT_PER_PAGE, useServerSearch } from "../hook/useServerList";
import {
  useGalleriesQuery,
  useGalleryQuery,
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
  useUpdateGalleryStatusMutation,
  useDeleteGalleryMutation,
} from "../hook/useGalleries";
import { convertToWebpFile, isWebpFile } from "@/lib/image";
import { resolveGalleryImageUrl } from "../services/mappers";
import type { GalleryRecord, GalleryStatus } from "../types";

const STATUS_FILTERS = ["All", "Active", "Inactive"] as const;

interface GalleryFormState {
  gallery_image: File | null;
  existing_image_url?: string | null;
  gallery_status: GalleryStatus;
  title: string;
}

const DEFAULT_FORM: GalleryFormState = {
  gallery_image: null,
  existing_image_url: null,
  gallery_status: "Active",
  title: "",
};

export default function BlogGalleryPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("All");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Search input state with debounced server query
  const { searchInput, setSearchInput, searchTerm } = useServerSearch();

  const queryParams = useMemo(
    () => ({
      page,
      per_page: DEFAULT_PER_PAGE,
      search: searchTerm || undefined,
      gallery_status: statusFilter === "All" ? undefined : statusFilter,
    }),
    [page, searchTerm, statusFilter],
  );

  const {
    records: galleryItems,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGalleriesQuery(queryParams);

  // Modals state
  const [inspectId, setInspectId] = useState<number | string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<GalleryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryRecord | null>(null);

  const {
    data: inspectedItem,
    isLoading: isInspectLoading,
    error: inspectError,
  } = useGalleryQuery(inspectId);

  // Derive preview from list if detail doesn't include full image_url
  const itemFromList = useMemo(
    () =>
      inspectId
        ? galleryItems.find((g) => String(g.id) === String(inspectId))
        : null,
    [galleryItems, inspectId],
  );

  const inspectedImage =
    inspectedItem?.gallery_image ||
    itemFromList?.gallery_image ||
    (inspectedItem?.gallery_image
      ? resolveGalleryImageUrl(inspectedItem.gallery_image)
      : null);

  // Form states
  const [createForm, setCreateForm] = useState<GalleryFormState>(DEFAULT_FORM);
  const [editForm, setEditForm] = useState<GalleryFormState>(DEFAULT_FORM);
  const [isConvertingImage, setIsConvertingImage] = useState(false);

  // File input refs
  const createFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Mutations
  const createMutation = useCreateGalleryMutation();
  const updateMutation = useUpdateGalleryMutation();
  const statusMutation = useUpdateGalleryStatusMutation();
  const deleteMutation = useDeleteGalleryMutation();

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      // Ignore copy error
    }
  };

  // Handle file selection with automatic WebP conversion
  const handleFileChange = async (file: File | null, isEdit = false) => {
    if (!file) {
      if (isEdit) {
        setEditForm((prev) => ({ ...prev, gallery_image: null }));
      } else {
        setCreateForm((prev) => ({ ...prev, gallery_image: null }));
      }
      return;
    }

    try {
      setIsConvertingImage(true);
      const webpFile = await convertToWebpFile(file);
      if (isEdit) {
        setEditForm((prev) => ({ ...prev, gallery_image: webpFile }));
      } else {
        setCreateForm((prev) => ({ ...prev, gallery_image: webpFile }));
      }
    } finally {
      setIsConvertingImage(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: GalleryRecord) => {
    setEditTarget(item);
    setEditForm({
      gallery_image: null,
      existing_image_url: item.gallery_image,
      gallery_status: item.gallery_status,
      title: item.title || "",
    });
  };

  // Handle Form Submission for Creating Gallery Item
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.gallery_image || isConvertingImage) return;

    let imageFile = createForm.gallery_image;
    if (!isWebpFile(imageFile)) {
      imageFile = await convertToWebpFile(imageFile);
    }

    const formData = new FormData();
    formData.append("gallery_image", imageFile);
    formData.append("image", imageFile);
    formData.append("file", imageFile);
    if (createForm.title.trim()) {
      formData.append("title", createForm.title.trim());
    }

    createMutation.mutate(
      {
        payload: formData,
        successMessage: "Gallery photo added successfully.",
      },
      {
        onSuccess: () => {
          setCreateModalOpen(false);
          setCreateForm(DEFAULT_FORM);
          if (createFileInputRef.current) createFileInputRef.current.value = "";
        },
      },
    );
  };

  // Handle Form Submission for Updating Gallery Item
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || isConvertingImage) return;

    let imageFile = editForm.gallery_image;
    if (imageFile && !isWebpFile(imageFile)) {
      imageFile = await convertToWebpFile(imageFile);
    }

    const formData = new FormData();
    formData.append("gallery_status", editForm.gallery_status);
    formData.append("status", editForm.gallery_status);
    formData.append("_method", "PUT");

    if (imageFile) {
      formData.append("gallery_image", imageFile);
      formData.append("image", imageFile);
      formData.append("file", imageFile);
    }

    if (editForm.title.trim()) {
      formData.append("title", editForm.title.trim());
    }

    updateMutation.mutate(
      {
        id: editTarget.id,
        payload: formData,
        successMessage: "Gallery item updated successfully.",
      },
      {
        onSuccess: () => {
          setEditTarget(null);
          setEditForm(DEFAULT_FORM);
          if (editFileInputRef.current) editFileInputRef.current.value = "";
        },
      },
    );
  };

  // Toggle quick status
  const handleToggleStatus = (item: GalleryRecord) => {
    const nextStatus: GalleryStatus =
      item.gallery_status === "Active" ? "Inactive" : "Active";
    statusMutation.mutate({
      id: item.id,
      gallery_status: nextStatus,
      successMessage: `Gallery photo marked as ${nextStatus}.`,
    });
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      {
        id: deleteTarget.id,
        successMessage: "Gallery photo deleted successfully.",
      },
      {
        onSuccess: () => setDeleteTarget(null),
      },
    );
  };

  const hasFilters = Boolean(searchTerm) || statusFilter !== "All";

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Blog Gallery"
        description={panelDescription("/panel/blog-gallery")}
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
              <RefreshCw
                className={cn(
                  "size-3.5 text-navy-700",
                  isFetching && "animate-spin",
                )}
              />
              <span>Refresh</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                setCreateForm(DEFAULT_FORM);
                setCreateModalOpen(true);
              }}
              className="cursor-pointer gap-2 rounded-full bg-gold-600 text-xs font-bold text-white shadow-gold hover:bg-gold-700"
            >
              <Plus className="size-4" />
              <span>Add Image</span>
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
              placeholder="Search gallery images…"
            />
          }
        >
          <PanelFilterSelect
            id="filter-gallery-status"
            label="Status"
            value={statusFilter}
            options={STATUS_FILTERS}
            onChange={(val) => {
              setStatusFilter(val as (typeof STATUS_FILTERS)[number]);
              setPage(1);
            }}
            showStatusDots
          />
        </PanelToolbar>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-cream-200 bg-white p-3 space-y-3"
              >
                <div className="aspect-square w-full rounded-xl bg-cream-100 animate-pulse" />
                <SkeletonText lines={1} />
              </div>
            ))}
          </div>
        ) : error ? (
          <PanelError
            message={errorMessage(error, "Could not load gallery items.")}
            onRetry={() => void refetch()}
          />
        ) : galleryItems.length === 0 ? (
          <PanelEmpty
            title={
              hasFilters
                ? "No matching images found"
                : "No gallery photos added yet"
            }
            description={
              hasFilters
                ? "Try adjusting your search terms or filter selection."
                : "Upload and organize high-resolution gallery images to feature across the website."
            }
            action={
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setCreateForm(DEFAULT_FORM);
                  setCreateModalOpen(true);
                }}
                className="rounded-full bg-gold-600 text-xs font-bold text-white hover:bg-gold-700"
              >
                <Plus className="mr-1.5 size-3.5" />
                Add First Photo
              </Button>
            }
          />
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {galleryItems.map((item, index) => {
                const imageUrl = item.gallery_image;
                const isCopied = imageUrl ? copiedUrl === imageUrl : false;

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-gold-400 hover:shadow-card"
                  >
                    {/* Media thumbnail */}
                    <div className="relative aspect-square w-full overflow-hidden bg-cream-50 flex items-center justify-center p-2">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.title || `Gallery image ${item.id}`}
                          className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.classList.add("bg-cream-100");
                              const fallback =
                                parent.querySelector(".img-fallback");
                              if (fallback)
                                (fallback as HTMLElement).classList.remove(
                                  "hidden",
                                );
                            }
                          }}
                        />
                      ) : null}

                      <div
                        className={cn(
                          "img-fallback flex flex-col items-center justify-center gap-1.5 text-center text-ink-400",
                          imageUrl ? "hidden" : "flex",
                        )}
                      >
                        <ImageIcon className="size-8 text-ink-300" />
                        <span className="text-[11px] font-medium text-ink-400">
                          Preview unavailable
                        </span>
                      </div>

                      {/* Status badge overlay */}
                      <div className="absolute top-2.5 left-2.5">
                        <StatusBadge status={item.gallery_status} size="sm" />
                      </div>

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-navy-950/45 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center gap-2">
                        {imageUrl ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setInspectId(item.id)}
                              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white text-navy-900 shadow-lift transition-transform hover:scale-110 hover:bg-gold-50"
                              title="Inspect image details"
                            >
                              <Eye className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleCopyUrl(imageUrl)}
                              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white text-navy-900 shadow-lift transition-transform hover:scale-110 hover:bg-gold-50"
                              title="Copy image URL"
                            >
                              {isCopied ? (
                                <Check className="size-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                          </>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white text-navy-900 shadow-lift transition-transform hover:scale-110 hover:bg-gold-50"
                          title="Edit gallery item"
                        >
                          <Pencil className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={cn(
                            "flex size-8 cursor-pointer items-center justify-center rounded-full bg-white shadow-lift transition-transform hover:scale-110",
                            item.gallery_status === "Active"
                              ? "text-emerald-700 hover:bg-emerald-50"
                              : "text-slate-600 hover:bg-slate-50",
                          )}
                          title={
                            item.gallery_status === "Active"
                              ? "Deactivate"
                              : "Activate"
                          }
                        >
                          {item.gallery_status === "Active" ? (
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="size-3.5 text-slate-500" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white text-maroon-700 shadow-lift transition-transform hover:scale-110 hover:bg-maroon-50"
                          title="Delete photo"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata card footer */}
                    <div className="flex items-center justify-between border-t border-cream-200/80 px-3.5 py-2.5 text-[0.7rem] text-ink-500">
                      <span className="font-semibold text-navy-950">
                        {item.title || 'Untitled image'}
                      </span>
                      <span className="text-[0.66rem] text-ink-400">
                        SI/NO: {index + 1}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t border-cream-200/80 px-6 py-4">
          <PanelPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={isFetching}
          />
        </div>
      </PanelCard>

      {/* Inspect Modal */}
      <PanelModal
        isOpen={inspectId !== null}
        title={
          inspectedItem?.title
            ? `Photo: ${inspectedItem.title}`
            : `Photo #${inspectId || ""}`
        }
        description="Detailed record from /gallery/{id}."
        icon={<Images className="size-5" />}
        size="md"
        onClose={() => setInspectId(null)}
        footer={
          <div className="flex w-full items-center justify-between">
            {inspectedImage ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleCopyUrl(inspectedImage)}
                className="cursor-pointer gap-1.5 rounded-full border-cream-300 text-xs font-semibold"
              >
                {copiedUrl === inspectedImage ? (
                  <>
                    <Check className="size-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy Image URL</span>
                  </>
                )}
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setInspectId(null)}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              Close
            </Button>
          </div>
        }
      >
        {isInspectLoading ? (
          <div className="space-y-4 py-6">
            <SkeletonText lines={4} />
          </div>
        ) : inspectError ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-maroon-700">
              {errorMessage(inspectError, "Could not find gallery item.")}
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {inspectedImage ? (
              <div className="overflow-hidden rounded-2xl border border-cream-300 bg-black/5 flex items-center justify-center max-h-[50vh] p-2">
                <img
                  src={inspectedImage}
                  alt="Gallery preview"
                  className="max-h-[48vh] w-auto object-contain rounded-xl"
                />
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-cream-300 bg-white p-3">
                <span className="text-[0.66rem] font-bold tracking-wider text-ink-400 uppercase">
                  Photo ID
                </span>
                <p className="mt-1 font-semibold text-navy-900">
                  {inspectedItem?.id || inspectId}
                </p>
              </div>

              <div className="rounded-xl border border-cream-300 bg-white p-3">
                <span className="text-[0.66rem] font-bold tracking-wider text-ink-400 uppercase">
                  Status
                </span>
                <p className="mt-1 font-semibold text-navy-900">
                  {inspectedItem?.gallery_status ||
                    itemFromList?.gallery_status ||
                    "Active"}
                </p>
              </div>
            </div>

            {inspectedImage ? (
              <div className="rounded-xl border border-cream-200 bg-cream-50 p-3">
                <span className="block text-[0.66rem] font-bold tracking-wider text-ink-400 uppercase">
                  Asset Full URL
                </span>
                <p className="mt-1 font-mono text-[0.72rem] text-navy-900 break-all select-all">
                  {inspectedImage}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </PanelModal>

      {/* Add Photo Modal */}
      <PanelModal
        isOpen={createModalOpen}
        title="Add Gallery Photo"
        description="Upload a high-quality gallery image for the website."
        icon={<Plus className="size-5" />}
        size="md"
        onClose={() => setCreateModalOpen(false)}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateSubmit}
              disabled={
                createMutation.isPending ||
                !createForm.gallery_image ||
                isConvertingImage
              }
              className="cursor-pointer rounded-full bg-maroon-700 px-5 text-xs font-bold text-white hover:bg-maroon-800 disabled:opacity-50"
            >
              {createMutation.isPending ? "Uploading…" : "Upload Photo"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-950">
              Title / Caption (Optional)
            </label>
            <Input
              type="text"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Wedding Reception Highlights"
              className="rounded-xl border-cream-300 bg-white text-xs"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-navy-950">
                Photo File <span className="text-maroon-600">*</span>
              </label>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[0.66rem] font-bold text-amber-800">
                WebP Auto-Converted
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={createFileInputRef}
                type="file"
                accept="image/webp,.webp,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  void handleFileChange(file, false);
                }}
                className="hidden"
                id="create-gallery-image"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => createFileInputRef.current?.click()}
                disabled={isConvertingImage}
                className="cursor-pointer gap-2 rounded-xl border-dashed border-cream-400 bg-cream-50 text-xs font-semibold hover:bg-cream-100"
              >
                <Upload className="size-3.5" />
                <span>
                  {isConvertingImage
                    ? "Converting to WebP…"
                    : createForm.gallery_image
                      ? "Change Selected File"
                      : "Choose Image File"}
                </span>
              </Button>

              {createForm.gallery_image && (
                <span className="text-xs font-medium text-emerald-700">
                  ✓ {createForm.gallery_image.name}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[0.7rem] text-ink-500">
              Images will be automatically formatted to <code>.webp</code> to
              comply with CRM storage requirements.
            </p>
          </div>
        </form>
      </PanelModal>

      {/* Edit Photo Modal */}
      <PanelModal
        isOpen={editTarget !== null}
        title="Edit Gallery Photo"
        description="Update status or replace the photo."
        icon={<Pencil className="size-5" />}
        size="md"
        onClose={() => setEditTarget(null)}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditTarget(null)}
              className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEditSubmit}
              disabled={updateMutation.isPending || isConvertingImage}
              className="cursor-pointer rounded-full bg-maroon-700 px-5 text-xs font-bold text-white hover:bg-maroon-800 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Updating…" : "Save Changes"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-950">
              Title / Caption
            </label>
            <Input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Wedding Reception Highlights"
              className="rounded-xl border-cream-300 bg-white text-xs"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-950">
              Status
            </label>
            <select
              value={editForm.gallery_status}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  gallery_status: e.target.value as GalleryStatus,
                }))
              }
              className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-navy-950">
                Replace Photo (Optional)
              </label>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[0.66rem] font-bold text-amber-800">
                WebP Auto-Converted
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/webp,.webp,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  void handleFileChange(file, true);
                }}
                className="hidden"
                id="edit-gallery-image"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => editFileInputRef.current?.click()}
                disabled={isConvertingImage}
                className="cursor-pointer gap-2 rounded-xl border-dashed border-cream-400 bg-cream-50 text-xs font-semibold hover:bg-cream-100"
              >
                <Upload className="size-3.5" />
                <span>
                  {isConvertingImage
                    ? "Converting…"
                    : editForm.gallery_image
                      ? "Change File"
                      : "Choose New File"}
                </span>
              </Button>

              {editForm.gallery_image && (
                <span className="text-xs font-medium text-emerald-700">
                  ✓ {editForm.gallery_image.name}
                </span>
              )}
            </div>
          </div>
        </form>
      </PanelModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete Gallery Photo"
        description={`Are you sure you want to delete photo #${deleteTarget?.id}? This action will permanently remove it from the gallery.`}
        confirmText="Yes, Delete Photo"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

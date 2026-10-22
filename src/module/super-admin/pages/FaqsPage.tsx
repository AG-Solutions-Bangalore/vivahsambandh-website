/**
 * @file src/module/super-admin/pages/FaqsPage.tsx
 * FAQ management for the Super Admin Panel: list FAQ groups, toggle status,
 * and delete.
 *
 * Creating and editing happen on their own screens — a group holds a whole
 * stack of questions, which is far too much to edit inside a dialog — so
 * this page only links to them.
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Pencil, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PanelCard } from "../components/PanelCard";
import { PanelPageHeader } from "../components/PanelPageHeader";
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
import {
  useDeleteFaqMutation,
  useFaqsQuery,
  useUpdateFaqStatusMutation,
} from "../hook/useFaqs";
import type { FaqRecord, FaqStatus } from "../types";

const STATUS_FILTERS = ["All", "Active", "Inactive"] as const;

const LIST_PATH = "/panel/faqs";

export default function FaqsPage() {
  const navigate = useNavigate();
  const { searchInput, setSearchInput, searchTerm } = useServerSearch();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);

  const {
    records: faqs,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFaqsQuery({
    search: searchTerm || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
  });

  const statusMutation = useUpdateFaqStatusMutation();
  const deleteMutation = useDeleteFaqMutation();

  // Delete FAQ group state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const deleteTarget = useMemo(
    () => faqs.find((f) => f.id === deleteTargetId) ?? null,
    [faqs, deleteTargetId],
  );

  // The API filters the search on the server; the status column is not
  // filterable there yet, so it is applied to the rows of the current page.
  const filtered = useMemo(
    () =>
      statusFilter === "All"
        ? faqs
        : faqs.filter(
            (item) =>
              item.faq_status.toLowerCase() === statusFilter.toLowerCase(),
          ),
    [faqs, statusFilter],
  );

  // Status toggle
  const handleToggleStatus = async (
    record: FaqRecord,
    nextStatus: FaqStatus,
  ) => {
    await statusMutation.mutateAsync({
      id: record.id,
      status: nextStatus,
      successMessage: `FAQ group set to ${nextStatus}.`,
    });
  };

  // Confirm delete group
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    deleteMutation.mutate(
      {
        id,
        successMessage: "FAQ group deleted successfully.",
      },
      {
        onSuccess: () => {
          setDeleteTargetId(null);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="FAQ Management"
        description={panelDescription("/panel/faqs")}
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
                className={cn("size-3.5", isFetching && "animate-spin")}
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
              <span>Add FAQ Group</span>
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
              placeholder="Search by target area or questions…"
            />
          }
        >
          <PanelFilterSelect
            id="filter-faq-status"
            label="Status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
            showStatusDots
          />
        </PanelToolbar>

        {isLoading ? (
          <PanelTableSkeleton rows={5} columns={5} />
        ) : error ? (
          <PanelError
            message={errorMessage(error, "Could not load FAQs.")}
            onRetry={() => void refetch()}
          />
        ) : filtered.length === 0 ? (
          <PanelEmpty
            title="No FAQ groups found"
            description={
              searchInput || statusFilter !== "All"
                ? "Try adjusting your search query or filter."
                : "Get started by creating your first FAQ accordion group."
            }
            action={
              <Button
                type="button"
                size="sm"
                onClick={() => navigate(`${LIST_PATH}/new`)}
                className="cursor-pointer rounded-full bg-gold-600 text-xs font-bold text-white shadow-gold hover:bg-gold-700"
              >
                <Plus className="size-4" aria-hidden />
                <span>Create FAQ Group</span>
              </Button>
            }
          />
        ) : (
          <PanelTable
            head={
              <>
                <PanelTableHeadCell>SI/NO</PanelTableHeadCell>
                <PanelTableHeadCell>Page Placement</PanelTableHeadCell>

                <PanelTableHeadCell>Status</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
              </>
            }
          >
            {filtered.map((item, index) => {
              return (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-cream-100/40"
                >
                  <td className="px-4 py-3 text-xs font-bold text-navy-800">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-navy-900">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold-300 bg-gold-50/90 px-2.5 py-1 text-xs font-bold text-gold-900 shadow-2xs">
                      <Layers className="size-3 text-gold-600" aria-hidden />
                      {item.faq_for}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusSwitch
                      status={item.faq_status}
                      onStatusChange={(nextStatus) =>
                        handleToggleStatus(item, nextStatus)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        onClick={() => navigate(`${LIST_PATH}/${item.id}/edit`)}
                        title="Edit FAQ Group"
                        aria-label="Edit FAQ group"
                        className="cursor-pointer rounded-full border-gold-300 bg-gold-50/50 text-gold-900 hover:bg-gold-100"
                      >
                        <Pencil className="size-3.5" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        onClick={() => setDeleteTargetId(item.id)}
                        title="Delete FAQ Group"
                        aria-label="Delete FAQ group"
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
                <strong>{meta.total}</strong> FAQ groups
              </span>
            }
          />
        </PanelTableFooter>
      </PanelCard>

      {/* Delete Group Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Delete FAQ Group"
          description={`Are you sure you want to delete the FAQ group for "${deleteTarget.faq_for}"? This will delete all ${deleteTarget.subs?.length ?? 0} questions inside it.`}
          confirmText="Yes, Delete Group"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  useGetPlanDataQuery,
  useDeletePlanMutation,
} from "@/redux/Apis/admin/planApi/planApi";
import useToast from "@/hooks/useToast";
import DeleteConfirmationModal from "@/components/common/deleteconfirmation/deleteConfirmationModal";

const PAGE_SIZES = [5, 10, 20, 50];

/** Normalize API response to plans array (supports data or data.data) */
function normalizePlansResponse(response) {
  if (!response) return [];
  const raw = response.data?.data ?? response.data;
  return Array.isArray(raw) ? raw : [];
}

function SubscriptionPlanList({ onEdit }) {
  const toast = useToast();
  const [deletePlan, { isLoading: isDeletingPlan }] = useDeletePlanMutation();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const { data: response, isLoading, isFetching } = useGetPlanDataQuery();

  const plans = useMemo(() => normalizePlansResponse(response), [response]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const totalItems = plans.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPlans = useMemo(
    () => plans.slice(startIndex, endIndex),
    [plans, startIndex, endIndex],
  );

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleEdit = (plan) => {
    onEdit?.(plan);
  };

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    const id = planToDelete.id ?? planToDelete._id;
    if (!id) {
      toast.error("Cannot delete plan: missing id.");
      setDeleteModalOpen(false);
      setPlanToDelete(null);
      return;
    }
    try {
      await deletePlan({ id }).unwrap();
      toast.success("Plan deleted successfully.");
      setDeleteModalOpen(false);
      setPlanToDelete(null);
    } catch (err) {
      const msg =
        err?.data?.message ?? err?.message ?? "Failed to delete plan.";
      toast.error(msg);
    }
  };

  const handleStatusToggle = (planId) => {
    // TODO: wire to API when plan status update is available
  };

  const planId = (p) => p.id ?? p._id ?? "";
  const planName = (p) => p.name ?? p.title ?? "";
  const planFeatures = (p) => {
    const f = p.features ?? p.featureList ?? p.featuresList;
    if (Array.isArray(f)) return f.join(", ");
    return typeof f === "string" ? f : "";
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">
        Subscription Plan List
      </h1>
      <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-200">
              <TableHead className="text-gray-700 font-medium">
                Plan ID
              </TableHead>
              <TableHead className="text-gray-700 font-medium">
                Plan Name
              </TableHead>
              <TableHead className="text-gray-700 font-medium">
                Duration
              </TableHead>
              <TableHead className="text-gray-700 font-medium">Price</TableHead>
              <TableHead className="text-gray-700 font-medium">
                Features
              </TableHead>
              <TableHead className="text-gray-700 font-medium">
                Active User
              </TableHead>
              <TableHead className="text-gray-700 font-medium">
                Status
              </TableHead>
              <TableHead className="text-gray-700 font-medium text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-gray-500"
                >
                  Loading plans...
                </TableCell>
              </TableRow>
            ) : paginatedPlans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-gray-500"
                >
                  No plans found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedPlans.map((plan) => (
                <TableRow
                  key={planId(plan)}
                  className="border-b border-gray-100 hover:bg-gray-50/50"
                >
                  <TableCell className="text-gray-900 font-medium">
                    {planId(plan)}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {planName(plan)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {plan.duration ?? ""}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {plan.price ?? ""}
                  </TableCell>
                  <TableCell className="text-gray-600 max-w-[200px] truncate">
                    {planFeatures(plan)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {plan.activeUsers ?? plan.scheduleBookingCount ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      className="data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-gray-300"
                      checked={Boolean(plan.status ?? plan.isActive)}
                      onCheckedChange={() => handleStatusToggle(planId(plan))}
                    />
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(plan)}
                      className="text-amber-600 hover:text-amber-700 underline font-medium text-sm cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(plan)}
                      className="text-red-600 hover:text-red-700 underline font-medium text-sm cursor-pointer"
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Showing {startIndex + 1}-{endIndex} of {totalItems}
            </span>
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[70px] h-8 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <span className="text-sm text-gray-600 min-w-[80px] text-center">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        openModal={deleteModalOpen}
        setOpenModal={setDeleteModalOpen}
        title="Delete plan"
        body={
          planToDelete
            ? `Are you sure you want to delete "${planName(planToDelete)}"? This action cannot be undone.`
            : "Are you sure you want to delete this plan? This action cannot be undone."
        }
        onConfirm={handleConfirmDelete}
        isLoading={isDeletingPlan}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default SubscriptionPlanList;

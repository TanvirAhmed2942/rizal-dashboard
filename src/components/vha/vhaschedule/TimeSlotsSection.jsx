"use client";

import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { utcISOToLocalDateTimeDisplay } from "@/utils/FormatDate/formateTime";

/** Format slot for table: Start Time (Local), End Time (Local) — e.g. "02 Mar 2026, 2:00 PM" */
function formatSlotStartEnd(slot) {
  if (!slot || typeof slot !== "object") return { start: "", end: "" };
  return {
    start: utcISOToLocalDateTimeDisplay(slot.startTime) || "",
    end: utcISOToLocalDateTimeDisplay(slot.endTime) || "",
  };
}

function SlotRow({ index, slot, onEdit, onDelete, isActionLoading, variant = "available" }) {
  const [isHovered, setIsHovered] = useState(false);
  const canEditDelete = Boolean(slot?._id ?? slot?.id);
  const { start, end } = formatSlotStartEnd(slot);

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canEditDelete && !isActionLoading) onEdit?.();
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canEditDelete && !isActionLoading) onDelete?.();
  };

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "border-b border-amber-200/60 transition-colors",
        variant === "booked" && "bg-amber-50/50",
        isHovered && "bg-amber-100/60",
      )}
    >
      <td className="py-2.5 pl-3 pr-2 text-sm text-gray-600 tabular-nums">{index}</td>
      <td className="py-2.5 px-2 text-sm text-gray-800">{start || "—"}</td>
      <td className="py-2.5 px-2 text-sm text-gray-800">{end || "—"}</td>
      <td className="py-2.5 pr-3 pl-1 text-right">
        {canEditDelete && (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={handleEdit}
              disabled={isActionLoading}
              className="size-7 flex items-center justify-center rounded-md bg-amber-200 hover:bg-amber-300 text-amber-800 disabled:opacity-50 transition-colors"
              aria-label="Edit slot"
              title="Edit"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isActionLoading}
              className="size-7 flex items-center justify-center rounded-md bg-red-200 hover:bg-red-300 text-red-700 disabled:opacity-50 transition-colors"
              aria-label="Delete slot"
              title="Delete"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

/** Selected date label: e.g. "Mon, Mar 2, 2026" */
function formatSelectedDateLabel(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SlotsTable({ title, slotsRaw, onEditSlot, onDeleteSlot, isActionLoading, variant }) {
  if (!Array.isArray(slotsRaw) || slotsRaw.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">No slots</p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="overflow-x-auto rounded-lg border border-amber-200/60 bg-white">
        <table className="w-full min-w-[400px] text-left">
          <thead>
            <tr className="border-b border-amber-200/60 bg-amber-50/80 text-xs font-medium uppercase tracking-wider text-gray-600">
              <th className="py-2.5 pl-3 pr-2 w-10">#</th>
              <th className="py-2.5 px-2">Start Time (Local)</th>
              <th className="py-2.5 px-2">End Time (Local)</th>
              <th className="py-2.5 pr-3 pl-1 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slotsRaw.map((slot, i) => (
              <SlotRow
                key={slot?._id ?? slot?.id ?? `row-${i}`}
                index={i + 1}
                slot={slot}
                onEdit={() => onEditSlot?.(slot)}
                onDelete={() => onDeleteSlot?.(slot)}
                isActionLoading={isActionLoading}
                variant={variant}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TimeSlotsSection({
  selectedDate = null,
  bookedSlots = [],
  availableSlots = [],
  bookingSlotsRaw = [],
  availableSlotsRaw = [],
  noSlotsForDay = false,
  onEditSlot,
  onDeleteSlot,
  isActionLoading = false,
  className,
}) {
  if (noSlotsForDay) {
    return (
      <section
        className={cn(
          "rounded-lg border border-amber-200/60 bg-amber-50/50 p-4",
          className,
        )}
      >
        {selectedDate && (
          <p className="text-sm font-medium text-gray-800 mb-2">
            {formatSelectedDateLabel(selectedDate)}
          </p>
        )}
        <p className="text-sm text-gray-600 text-center py-4">
          No slots available on this day.
        </p>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-lg border border-amber-200/60 bg-amber-50/50 p-4 space-y-6",
        className,
      )}
    >
      {selectedDate && (
        <p className="text-sm font-medium text-gray-800">
          Slots for {formatSelectedDateLabel(selectedDate)}
        </p>
      )}
      <SlotsTable
        title="Booked Slots"
        slotsRaw={bookingSlotsRaw}
        onEditSlot={onEditSlot}
        onDeleteSlot={onDeleteSlot}
        isActionLoading={isActionLoading}
        variant="booked"
      />
      <SlotsTable
        title="Available Slots"
        slotsRaw={availableSlotsRaw}
        onEditSlot={onEditSlot}
        onDeleteSlot={onDeleteSlot}
        isActionLoading={isActionLoading}
        variant="available"
      />
    </section>
  );
}

"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function formatDateDDMMYYYY(date) {
  if (!date) return "";
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
}

export default function DateTimeSelectionCard({
  selectedDate,
  startTime,
  endTime,
  onEdit,
  onDelete,
  className,
}) {
  const dayName = selectedDate ? DAY_NAMES[selectedDate.getDay()] : "";
  const dateStr = formatDateDDMMYYYY(selectedDate);

  return (
    <section
      className={cn(
        "rounded-lg border border-gray-200 bg-gray-50 p-4 relative",
        className
      )}
    >
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          className="size-8 flex items-center justify-center rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors"
          aria-label="Edit"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="size-8 flex items-center justify-center rounded-md bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 pr-20">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Date</label>
          <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900">
            {dateStr || "—"}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Day</label>
          <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900">
            {dayName || "—"}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Start Time</label>
          <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900">
            {startTime || "—"}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">End Time</label>
          <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900">
            {endTime || "—"}
          </div>
        </div>
      </div>
    </section>
  );
}

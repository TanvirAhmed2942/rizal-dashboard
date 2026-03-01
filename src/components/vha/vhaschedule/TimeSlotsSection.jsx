"use client";

import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function SlotCard({ label, slotId, onEdit, onDelete, isActionLoading }) {
  const [isHovered, setIsHovered] = useState(false);
  const canEditDelete = Boolean(slotId);

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canEditDelete && !isActionLoading) onEdit?.();
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canEditDelete && !isActionLoading) onDelete?.();
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-lg bg-amber-100/80 border border-amber-200/60 pl-3 pr-2 py-2 text-sm text-gray-700 min-w-[180px] cursor-default transition-colors",
        isHovered && "bg-amber-200/90 border-amber-300/80",
      )}
    >
      <span className="flex-1 min-w-0 truncate">{label}</span>
      {(isHovered || canEditDelete) && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleEditClick}
            disabled={!canEditDelete || isActionLoading}
            className="size-7 flex items-center justify-center rounded-md bg-amber-200 hover:bg-amber-300 text-amber-800 disabled:opacity-50 transition-colors"
            aria-label="Edit slot"
            title="Edit"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={!canEditDelete || isActionLoading}
            className="size-7 flex items-center justify-center rounded-md bg-red-200 hover:bg-red-300 text-red-700 disabled:opacity-50 transition-colors"
            aria-label="Delete slot"
            title="Delete"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function TimeSlotsSection({
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
        <p className="text-sm text-gray-600 text-center py-4">
          No bookings or slot available on this day.
        </p>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-lg border border-amber-200/60 bg-amber-50/50 p-4 space-y-4",
        className,
      )}
    >
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Booked Slots
        </h3>
        <div className="flex flex-wrap gap-2">
          {bookedSlots.length === 0 ? (
            <span className="text-sm text-gray-500">No booked slots</span>
          ) : (
            bookedSlots.map((label, i) => {
              const slot = bookingSlotsRaw[i];
              const slotId = slot?._id ?? slot?.id ?? null;
              return (
                <SlotCard
                  key={slotId || `booked-${i}`}
                  label={label}
                  slotId={slotId}
                  onEdit={() => onEditSlot?.(slot)}
                  onDelete={() => onDeleteSlot?.(slot)}
                  isActionLoading={isActionLoading}
                />
              );
            })
          )}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Available Slots
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableSlots.length === 0 ? (
            <span className="text-sm text-gray-500">No available slots</span>
          ) : (
            availableSlots.map((label, i) => {
              const slot = availableSlotsRaw[i];
              const slotId = slot?._id ?? slot?.id ?? null;
              return (
                <SlotCard
                  key={slotId || `avail-${i}`}
                  label={label}
                  slotId={slotId}
                  onEdit={() => onEditSlot?.(slot)}
                  onDelete={() => onDeleteSlot?.(slot)}
                  isActionLoading={isActionLoading}
                />
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

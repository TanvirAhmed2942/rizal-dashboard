"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function TimeSlotsSection({
  bookedSlots = [],
  availableSlots = [],
  noSlotsForDay = false,
  className,
}) {
  if (noSlotsForDay) {
    return (
      <section
        className={cn(
          "rounded-lg border border-amber-200/60 bg-amber-50/50 p-4",
          className
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
        className
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
            bookedSlots.map((slot, i) => (
              <span
                key={`booked-${i}`}
                className="inline-flex items-center rounded-md bg-amber-100/80 border border-amber-200/60 px-3 py-1.5 text-sm text-gray-700"
              >
                {slot}
              </span>
            ))
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
            availableSlots.map((slot, i) => (
              <span
                key={`avail-${i}`}
                className="inline-flex items-center rounded-md bg-amber-100/80 border border-amber-200/60 px-3 py-1.5 text-sm text-gray-700"
              >
                {slot}
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

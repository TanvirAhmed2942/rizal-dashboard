"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetAvialableSlotsForRescheduleQuery,
  useGetTimeSlotsForRescheduleQuery,
  useRescheduleSessionMutation,
} from "@/redux/Apis/bha/sessionmanagementApi/sessionmanagementApi";
import { utcISOToLocalTimeDisplay } from "@/utils/FormatDate/formateTime";

function RescheduleModal({
  isOpen,
  onClose,
  initialDate,
  onSlotSelect,
  bookingId,
  title = "Reschedule Session",
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const scheduledDate = useMemo(() => {
    if (!initialDate) return null;
    const d = new Date(initialDate);
    if (isNaN(d)) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }, [initialDate]);

  const [selectedDate, setSelectedDate] = useState(() => {
    const init = initialDate ? new Date(initialDate) : new Date();
    if (isNaN(init)) return today;
    init.setHours(0, 0, 0, 0);
    return init < today ? today : init;
  });
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [viewMonth, setViewMonth] = useState(() => new Date());

  // Keep selected date in sync with parent-provided initialDate
  useEffect(() => {
    if (initialDate) {
      const parsed = new Date(initialDate);
      if (!isNaN(parsed)) {
        parsed.setHours(0, 0, 0, 0);
        setSelectedDate(parsed < today ? today : parsed);
      }
    }
  }, [initialDate, today]);

  // First of viewed month in UTC ISO for fetching available dates
  const firstOfViewMonthISO = useMemo(() => {
    if (!viewMonth || isNaN(viewMonth)) return "";
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    return new Date(Date.UTC(y, m, 1)).toISOString();
  }, [viewMonth]);

  // Fetch available dates to show on calendar (response: { data: ["2026-02-18T09:00:00.000Z", ...] })
  const {
    data: availableDatesData,
    isFetching: isFetchingDates,
    isLoading: isLoadingDates,
    isError: isDatesError,
    error: datesError,
    refetch: refetchDates,
  } = useGetAvialableSlotsForRescheduleQuery(
    { date: firstOfViewMonthISO },
    { skip: !isOpen || !firstOfViewMonthISO }
  );

  // Parse available dates from API into Date[] for calendar modifiers (UTC day → local midnight Date)
  const availableDatesForCalendar = useMemo(() => {
    const raw = availableDatesData?.data;
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return raw
      .filter((item) => typeof item === "string")
      .map((iso) => {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return null;
        return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      })
      .filter(Boolean);
  }, [availableDatesData?.data]);

  // Selected date → start/end of day in UTC for time-slots API
  const { startTime: dayStartTime, endTime: dayEndTime } = useMemo(() => {
    if (!selectedDate || isNaN(selectedDate)) return { startTime: "", endTime: "" };
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth();
    const d = selectedDate.getDate();
    const start = new Date(Date.UTC(y, m, d)).toISOString();
    const end = new Date(Date.UTC(y, m, d, 23, 59, 59, 999)).toISOString();
    return { startTime: start, endTime: end };
  }, [selectedDate]);

  const {
    data: timeSlotsData,
    isFetching,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTimeSlotsForRescheduleQuery(
    { startTime: dayStartTime, endTime: dayEndTime },
    { skip: !isOpen || !dayStartTime || !dayEndTime }
  );

  // Response: { data: { data: {...}, availableSlots: [...], bookingSlots: [...] } } — use availableSlots for selection
  const availableSlots = useMemo(
    () =>
      Array.isArray(timeSlotsData?.data?.availableSlots)
        ? timeSlotsData.data.availableSlots
        : [],
    [timeSlotsData],
  );
  const showNoSlots =
    !isLoading && !isFetching && (!dayStartTime || isError || availableSlots.length === 0);

  const [rescheduleSession, { isLoading: isSaving }] =
    useRescheduleSessionMutation();

  const handleSlotClick = (slot) => {
    setSelectedSlotId(slot.startTime);
    onSlotSelect?.({ date: dayStartTime, slot });
  };

  const handleConfirm = async () => {
    const slot = availableSlots.find((s) => s.startTime === selectedSlotId);
    if (!slot || !bookingId || !dayStartTime) return;
    try {
      await rescheduleSession({
        bookingId,
        data: {
          bookingDate: dayStartTime,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      }).unwrap();
      onSlotSelect?.({ date: dayStartTime, slot });
      handleClose();
    } catch (err) {
      console.error("Failed to reschedule", err);
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Calendar */}
          <div className="p-3 border rounded-lg">
            <Calendar
              mode="single"
              selected={selectedDate}
              fromDate={today}
              month={viewMonth}
              onMonthChange={(month) => month && setViewMonth(month)}
              disabled={(date) => date < today}
              modifiers={{
                scheduled: scheduledDate ? [scheduledDate] : [],
                available: availableDatesForCalendar,
              }}
              modifiersClassNames={{
                scheduled:
                  "border-2 border-blue-500 bg-blue-50 text-blue-900 rounded-md",
                available:
                  "ring-2 ring-teal-400 ring-inset bg-teal-50/50 text-teal-900 rounded-md",
              }}
              onSelect={(date) => {
                if (!date || isNaN(date)) return;
                const normalized = new Date(date);
                normalized.setHours(0, 0, 0, 0);
                if (normalized < today) return;
                setSelectedDate(normalized);
                setSelectedSlotId(null);
              }}
              className="mx-auto"
            />
            <div className="mt-3 text-sm text-gray-500 space-y-1">
              <div>Dates with a teal ring have availability. Choose a date to see slots.</div>
            </div>
          </div>

          {/* Right: Slots */}
          <div className="p-3 border rounded-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">Available Slots</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching || isLoading || !dayStartTime}
              >
                {isFetching ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            <ScrollArea className="h-64 pr-2">
              {isFetching || isLoading ? (
                <div className="text-sm text-gray-500">Loading slots...</div>
              ) : showNoSlots ? (
                <div className="text-sm text-gray-500">
                  No slots available for this date.
                  {isError && error?.data?.message && (
                    <span className="block text-xs text-gray-400">
                      {error.data.message}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.startTime;
                    const startDisplay = utcISOToLocalTimeDisplay(slot.startTime) || slot.startTime;
                    const endDisplay = utcISOToLocalTimeDisplay(slot.endTime) || slot.endTime;
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => handleSlotClick(slot)}
                        className={`w-full text-left border rounded-lg px-3 py-2 transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {startDisplay} – {endDisplay}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              {selectedSlotId && (
                <Button onClick={handleConfirm} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Use This Slot"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RescheduleModal;

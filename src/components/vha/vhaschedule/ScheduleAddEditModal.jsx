"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Clock, Check, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useUpdateBhaAvailabilityMutation,
  useDoctorSlotsUpdateDeleteMutation,
} from "@/redux/Apis/bha/scheuleApi/scheduleApi";
import useToast from "@/hooks/useToast";
import { cn } from "@/lib/utils";

/** Weekday labels in user's locale */
function getLocaleWeekdayLabels() {
  return [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const d = new Date(2020, 0, 5 + i);
    return d.toLocaleDateString(undefined, { weekday: "short" });
  });
}

/** Same calendar day in local timezone */
function isSameDayLocal(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Calendar grid in local time (year/month = displayed month in user locale) */
function getCalendarGridLocal(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();
  const grid = [];
  const totalCells = 42;
  const startOffset = startWeekday;
  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - startOffset + 1;
    let date;
    let isCurrentMonth;
    if (dayNumber < 1) {
      date = new Date(year, month - 1, dayNumber);
      isCurrentMonth = false;
    } else if (dayNumber > daysInMonth) {
      date = new Date(year, month + 1, dayNumber - daysInMonth);
      isCurrentMonth = false;
    } else {
      date = new Date(year, month, dayNumber);
      isCurrentMonth = true;
    }
    grid.push({ date, isCurrentMonth });
  }
  return grid;
}

function CustomCalendar({ selectedDate, onSelect }) {
  const now = new Date();
  const viewInitial = selectedDate
    ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const [viewDate, setViewDate] = useState(viewInitial);
  useEffect(() => {
    if (selectedDate)
      setViewDate(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
      );
  }, [selectedDate]);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const grid = useMemo(() => getCalendarGridLocal(year, month), [year, month]);
  const weekdayLabels = useMemo(() => getLocaleWeekdayLabels(), []);

  const goPrev = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const goNext = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-900">
          {viewDate.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            className="size-8 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="size-8 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="text-center text-[0.7rem] font-medium text-gray-500 py-1"
          >
            {label}
          </div>
        ))}
        {grid.map(({ date, isCurrentMonth }, i) => {
          const selected = isSameDayLocal(date, selectedDate);
          const isToday = isSameDayLocal(date, todayLocal);
          const isPast = date.getTime() < todayLocal.getTime();
          return (
            <button
              key={i}
              type="button"
              onClick={() => !isPast && onSelect(date)}
              disabled={isPast}
              className={cn(
                "aspect-square flex items-center justify-center text-sm rounded-full transition-colors",
                !isCurrentMonth && "text-gray-400",
                isCurrentMonth && "text-gray-900",
                selected && "bg-teal-500 text-white hover:bg-teal-600",
                !selected && isCurrentMonth && "hover:bg-gray-100",
                isToday && !selected && "bg-gray-100 text-gray-900",
                isPast && "opacity-45 cursor-not-allowed hover:bg-transparent",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Generate time options: 8:00 AM to 10:00 PM, 15-min steps
function buildTimeOptions() {
  const options = [];
  for (let hour = 8; hour <= 22; hour++) {
    for (let min of [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]) {
      if (hour === 22 && min > 0) break;
      const h12 = hour % 12 || 12;
      const hStr = h12 < 10 ? `0${h12}` : String(h12);
      const mStr = String(min).padStart(2, "0");
      const ampm = hour < 12 ? "AM" : "PM";
      options.push(`${hStr}:${mStr} ${ampm}`);
    }
  }
  return options;
}

const TIME_OPTIONS = buildTimeOptions();

/** End time shown to user = start + 50 min (e.g. 8:00 → 8:50); same 50 min sent in payload */
const END_TIME_DISPLAY_MINUTES = 50;
const MINUTES_PER_SLOT = 5; // TIME_OPTIONS step
const SLOTS_FOR_END_DISPLAY = END_TIME_DISPLAY_MINUTES / MINUTES_PER_SLOT; // 10 → 50 min

function getEndTimeForStartTime(startTime) {
  if (!startTime) return "";
  const idx = TIME_OPTIONS.indexOf(startTime);
  if (idx === -1) return "";
  const endIdx = Math.min(idx + SLOTS_FOR_END_DISPLAY, TIME_OPTIONS.length - 1);
  return TIME_OPTIONS[endIdx];
}

/**
 * User selects time in LOCAL format (e.g. "02:00 PM").
 * Selected date is in local; we build local date+time and convert to UTC ISO for the API.
 */
function displayTimeToUTCISO(displayTime, date) {
  if (!displayTime || typeof displayTime !== "string" || !date) return "";
  const match = displayTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "";
  let hour = parseInt(match[1], 10);
  const min = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  return new Date(y, m, day, hour, min, 0, 0).toISOString();
}

/**
 * Parse API time (ISO string, timestamp, or "HH:MM AM/PM") to display string in TIME_OPTIONS.
 * Rounds to nearest 5 min so result is always in TIME_OPTIONS.
 */
function parseStartTimeToDisplay(utcTime) {
  if (utcTime == null) return "";
  if (typeof utcTime === "string") {
    const trimmed = utcTime.trim();
    if (TIME_OPTIONS.includes(trimmed)) return trimmed;
  }
  const parsed =
    typeof utcTime === "number"
      ? new Date(utcTime)
      : new Date(String(utcTime).trim());
  if (Number.isNaN(parsed.getTime())) return "";
  const hour24 = parsed.getHours();
  const min = parsed.getMinutes();
  const minRounded = Math.round(min / 5) * 5;
  const totalMins = hour24 * 60 + (minRounded === 60 ? 60 : minRounded);
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  const hStr = String(hour12).padStart(2, "0");
  const mStr = String(m).padStart(2, "0");
  const display = `${hStr}:${mStr} ${ampm}`;
  return TIME_OPTIONS.includes(display) ? display : "";
}

/** @deprecated use parseStartTimeToDisplay */
function utcTimeStringToDisplay(utcTime) {
  return parseStartTimeToDisplay(utcTime);
}

const ScheduleAddEditModal = ({
  openModal,
  setOpenModal,
  scheduleData = null,
  initialSelectedDate = null,
  onSuccess,
}) => {
  const toast = useToast();
  const [updateAvailability, { isLoading: isAddLoading }] =
    useUpdateBhaAvailabilityMutation();
  const [slotsUpdateDelete, { isLoading: isUpdateDeleteLoading }] =
    useDoctorSlotsUpdateDeleteMutation();
  const isLoading = isAddLoading || isUpdateDeleteLoading;

  const isEdit = Boolean(
    scheduleData && (scheduleData.date ?? scheduleData.startTime),
  );
  const [selectedDate, setSelectedDate] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  });
  const [startTime, setStartTime] = useState("");
  const endTime = getEndTimeForStartTime(startTime);

  useEffect(() => {
    if (!openModal) return;
    /** UTC or local date → local midnight for calendar display */
    const toLocalMidnight = (d) => {
      const x = d instanceof Date ? d : new Date(d);
      return new Date(x.getFullYear(), x.getMonth(), x.getDate());
    };
    const rawStart =
      scheduleData?.startTime ?? scheduleData?.start_time ?? "";
    const hasEditData =
      scheduleData && (rawStart || scheduleData.date) && scheduleData.id;

    if (hasEditData) {
      const date =
        scheduleData.date instanceof Date
          ? scheduleData.date
          : scheduleData.date
            ? new Date(scheduleData.date)
            : new Date();
      setSelectedDate(toLocalMidnight(date));
      const startDisplay =
        parseStartTimeToDisplay(rawStart) ||
        (typeof rawStart === "string" &&
        TIME_OPTIONS.includes(rawStart.trim())
          ? rawStart.trim()
          : "");
      setStartTime(startDisplay || "");
    } else {
      const initial = initialSelectedDate
        ? new Date(initialSelectedDate)
        : new Date();
      setSelectedDate(toLocalMidnight(initial));
      setStartTime("");
    }
  }, [
    openModal,
    scheduleData,
    scheduleData?.id,
    scheduleData?.startTime,
    scheduleData?.start_time,
    scheduleData?.date,
    initialSelectedDate,
  ]);

  const handleSubmit = async () => {
    if (!startTime || !endTime) {
      toast.error("Please select start time and end time");
      return;
    }
    const startIndex = TIME_OPTIONS.indexOf(startTime);
    const endIndex = TIME_OPTIONS.indexOf(endTime);
    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      toast.error("End time must be after start time");
      return;
    }

    const startTimeUTC = displayTimeToUTCISO(startTime, selectedDate);
    // End = start + 50 min (user sees 8:00 → 8:50); send same in payload
    const endTimeUTC = displayTimeToUTCISO(endTime, selectedDate);

    try {
      if (isEdit && scheduleData?.id) {
        await slotsUpdateDelete({
          action: "update",
          id: scheduleData.id,
          startTime: startTimeUTC,
          endTime: endTimeUTC,
        }).unwrap();
        toast.success("Schedule updated successfully");
        onSuccess?.();
      } else {
        const payload = {
          startTime: startTimeUTC,
          endTime: endTimeUTC, // start + 50 min
        };
        await updateAvailability(payload).unwrap();
        toast.success("Schedule added successfully");
        onSuccess?.();
      }
      setOpenModal(false);
    } catch (error) {
      toast.error(
        error?.data?.message ||
          (isEdit
            ? "Failed to update schedule"
            : "Failed to update availability"),
      );
    }
  };

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="sm:max-w-md rounded-lg gap-0 p-0 border bg-white shadow-lg">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {isEdit ? "Edit Schedule" : "Add New Schedule"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          <CustomCalendar
            selectedDate={selectedDate}
            onSelect={(date) => setSelectedDate(date)}
          />
          {selectedDate && (
            <p className="text-sm text-gray-600">
              Date:{" "}
              {selectedDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              {startTime && endTime && (
                <span className="ml-1">
                  · Start: {startTime} → End: {endTime}
                </span>
              )}
            </p>
          )}

          {/* Start Time & End Time (Local) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Start Time
              </Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger
                  className={cn(
                    "w-full bg-gray-50 border-gray-200 rounded-md h-10",
                    !startTime && "text-gray-500",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                    <SelectValue placeholder="Select Time" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                End Time
              </Label>
              <div
                className={cn(
                  "w-full bg-gray-100 border border-gray-200 rounded-md h-10 flex items-center gap-2 px-3 text-sm text-gray-700",
                  !endTime && "text-gray-500",
                )}
              >
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                {endTime || "—"}
              </div>
            </div>
          </div>

          {/* Add / Update button */}
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              {isLoading ? (
                "Saving..."
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2 text-white" />
                  {isEdit ? "Update" : "Add"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleAddEditModal;

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
import { useUpdateBhaAvailabilityMutation } from "@/redux/Apis/bha/scheuleApi/scheduleApi";
import useToast from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getCalendarGrid(year, month) {
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
      const prevMonth = new Date(year, month, 0);
      date = new Date(year, month - 1, prevMonth.getDate() + dayNumber);
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
  const [viewDate, setViewDate] = useState(selectedDate || new Date());
  useEffect(() => {
    if (selectedDate) setViewDate(selectedDate);
  }, [selectedDate]);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();

  const grid = useMemo(() => getCalendarGrid(year, month), [year, month]);

  const goPrev = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  };
  const goNext = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-900">
          {MONTH_NAMES[month]} {year}
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
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[0.7rem] font-medium text-gray-500 py-1"
          >
            {label}
          </div>
        ))}
        {grid.map(({ date, isCurrentMonth }, i) => {
          const selected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(date)}
              className={cn(
                "aspect-square flex items-center justify-center text-sm rounded-full transition-colors",
                !isCurrentMonth && "text-gray-400",
                isCurrentMonth && "text-gray-900",
                selected && "bg-teal-500 text-white hover:bg-teal-600",
                !selected && isCurrentMonth && "hover:bg-gray-100",
                isToday && !selected && "bg-gray-100 text-gray-900",
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

const SLOT_DURATION_MINUTES = 45;
const MINUTES_PER_SLOT = 5; // TIME_OPTIONS step
const SLOTS_FOR_DURATION = SLOT_DURATION_MINUTES / MINUTES_PER_SLOT; // 9

function getEndTimeForStartTime(startTime) {
  if (!startTime) return "";
  const idx = TIME_OPTIONS.indexOf(startTime);
  if (idx === -1) return "";
  const endIdx = Math.min(idx + SLOTS_FOR_DURATION, TIME_OPTIONS.length - 1);
  return TIME_OPTIONS[endIdx];
}

function toDateISO(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  return new Date(y, m, day).toISOString();
}

const ScheduleAddEditModal = ({
  openModal,
  setOpenModal,
  scheduleData = null,
  initialSelectedDate = null,
}) => {
  const toast = useToast();
  const [updateAvailability, { isLoading }] =
    useUpdateBhaAvailabilityMutation();

  const isEdit = Boolean(
    scheduleData && (scheduleData.date ?? scheduleData.startTime),
  );
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (!openModal) return;
    if (isEdit && scheduleData) {
      const date =
        scheduleData.date instanceof Date
          ? scheduleData.date
          : scheduleData.date
            ? new Date(scheduleData.date)
            : new Date();
      setSelectedDate(date);
      setStartTime(scheduleData.startTime ?? "");
      setEndTime(scheduleData.endTime ?? "");
    } else {
      setSelectedDate(initialSelectedDate ? new Date(initialSelectedDate) : new Date());
      setStartTime("");
      setEndTime("");
    }
  }, [openModal, isEdit, scheduleData, initialSelectedDate]);

  const handleSubmit = async () => {
    if (!startTime || !endTime) {
      toast.error("Please select start time and end time");
      return;
    }
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    const payload = {
      date: toDateISO(selectedDate),
      startTime,
      endTime,
    };

    try {
      await updateAvailability(payload).unwrap();
      toast.success(
        isEdit
          ? "Schedule updated successfully"
          : "Schedule added successfully",
      );
      setOpenModal(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update availability");
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

          {/* Start Time & End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Start Time
              </Label>
              <Select
                value={startTime}
                onValueChange={(value) => {
                  setStartTime(value);
                  setEndTime(getEndTimeForStartTime(value));
                }}
              >
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
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger
                  className={cn(
                    "w-full bg-gray-50 border-gray-200 rounded-md h-10",
                    !endTime && "text-gray-500",
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
          </div>

          {/* Add / Update button */}
          <div className="flex justify-end">
            <Button
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

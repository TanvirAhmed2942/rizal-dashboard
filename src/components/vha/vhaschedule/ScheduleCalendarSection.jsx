"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetBhaScheduleSlotDateQuery } from "@/redux/Apis/bha/scheuleApi/scheduleApi";

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

function toYYYYMMDD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseAvailableDates(data) {
  if (!Array.isArray(data)) return new Set();
  return new Set(
    data.map((iso) => {
      try {
        const date = new Date(iso);
        return toYYYYMMDD(date);
      } catch {
        return null;
      }
    }).filter(Boolean)
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

export default function ScheduleCalendarSection({ selectedDate, onSelect }) {
  const [viewDate, setViewDate] = useState(selectedDate || new Date());
  useEffect(() => {
    if (selectedDate) setViewDate(selectedDate);
  }, [selectedDate]);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();

  const monthParam = useMemo(() => {
    const d = new Date(year, month, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, [year, month]);
  const { data: availableDatesResponse } = useGetBhaScheduleSlotDateQuery(
    { month: monthParam },
    { skip: !monthParam }
  );
  const availableDatesSet = useMemo(
    () => parseAvailableDates(availableDatesResponse?.data),
    [availableDatesResponse?.data]
  );

  const grid = useMemo(() => getCalendarGrid(year, month), [year, month]);

  const goPrev = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  };
  const goNext = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  };

  return (
    <section className="w-full bg-gray-50 border border-gray-200 rounded-md p-3">
      <div className="flex items-center justify-center mb-3 ">
        <div className="flex items-center gap-1 ">
          <button
            type="button"
            onClick={goPrev}
            className="size-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-medium text-gray-900">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="size-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
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
            className="text-left text-[0.7rem] font-medium text-gray-500 py-1 pl-3"
          >
            {label}
          </div>
        ))}
        {grid.map(({ date, isCurrentMonth }, i) => {
          const selected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const isAvailable = availableDatesSet.has(toYYYYMMDD(date));
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(date)}
              className={cn(
                "aspect-[5] flex items-center justify-center text-sm rounded-full transition-colors w-10 h-10",
                !isCurrentMonth && "text-gray-400",
                isCurrentMonth && "text-gray-900",
                selected && "bg-teal-500 text-white hover:bg-teal-600",
                !selected && isCurrentMonth && "hover:bg-gray-100",
                isToday && !selected && "bg-gray-100 text-gray-900",
                isAvailable && !selected && isCurrentMonth && "ring-2 ring-teal-400 ring-inset",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}

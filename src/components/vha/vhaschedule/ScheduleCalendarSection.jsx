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

function isSameDayUTC(a, b) {
  if (!a || !b) return false;
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function toYYYYMMDDUTC(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Selected calendar date → UTC ISO for API params (e.g. "2026-02-15T00:00:00.000Z") */
function toDateParamUTC(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
}

function parseAvailableDates(data) {
  if (!Array.isArray(data)) return new Set();
  return new Set(
    data.map((iso) => {
      try {
        const date = new Date(iso);
        return toYYYYMMDDUTC(date);
      } catch {
        return null;
      }
    }).filter(Boolean)
  );
}

function getCalendarGridUTC(year, month) {
  const first = new Date(Date.UTC(year, month, 1));
  const last = new Date(Date.UTC(year, month + 1, 0));
  const startWeekday = first.getUTCDay();
  const daysInMonth = last.getUTCDate();
  const grid = [];
  const totalCells = 42;
  const startOffset = startWeekday;
  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - startOffset + 1;
    let date;
    let isCurrentMonth;
    if (dayNumber < 1) {
      const prevMonth = new Date(Date.UTC(year, month - 1, 0));
      date = new Date(Date.UTC(year, month - 1, prevMonth.getUTCDate() + dayNumber));
      isCurrentMonth = false;
    } else if (dayNumber > daysInMonth) {
      date = new Date(Date.UTC(year, month + 1, dayNumber - daysInMonth));
      isCurrentMonth = false;
    } else {
      date = new Date(Date.UTC(year, month, dayNumber));
      isCurrentMonth = true;
    }
    grid.push({ date, isCurrentMonth });
  }
  return grid;
}

export default function ScheduleCalendarSection({ selectedDate, onSelect }) {
  const now = new Date();
  const viewInitial = selectedDate
    ? new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), 1))
    : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const [viewDate, setViewDate] = useState(viewInitial);
  useEffect(() => {
    if (selectedDate)
      setViewDate(new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), 1)));
  }, [selectedDate]);
  const year = viewDate.getUTCFullYear();
  const month = viewDate.getUTCMonth();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const dateParamUTC = useMemo(
    () => toDateParamUTC(new Date(Date.UTC(year, month, 1))),
    [year, month]
  );
  const { data: availableDatesResponse } = useGetBhaScheduleSlotDateQuery(
    { date: dateParamUTC },
    { skip: !dateParamUTC }
  );
  const availableDatesSet = useMemo(
    () => parseAvailableDates(availableDatesResponse?.data),
    [availableDatesResponse?.data]
  );

  const grid = useMemo(() => getCalendarGridUTC(year, month), [year, month]);

  const goPrev = () => {
    setViewDate((d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)));
  };
  const goNext = () => {
    setViewDate((d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)));
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
          const selected = isSameDayUTC(date, selectedDate);
          const isToday = isSameDayUTC(date, todayUTC);
          const isAvailable = availableDatesSet.has(toYYYYMMDDUTC(date));
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
              {date.getUTCDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}

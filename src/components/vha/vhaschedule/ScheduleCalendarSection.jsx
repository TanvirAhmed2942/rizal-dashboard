"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetBhaScheduleSlotDateQuery } from "@/redux/Apis/bha/scheuleApi/scheduleApi";

/** Weekday labels in user's locale (e.g. Sun, Mon) */
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

/** Local date string YYYY-MM-DD (user's timezone) for matching */
function toLocalYYYYMMDD(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** API data array of ISO strings → Set of local YYYY-MM-DD for calendar */
function parseAvailableDatesToLocalSet(data) {
  if (!Array.isArray(data)) return new Set();
  return new Set(
    data
      .map((iso) => {
        try {
          const date = new Date(String(iso).trim());
          if (Number.isNaN(date.getTime())) return null;
          return toLocalYYYYMMDD(date);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
  );
}

/** First of month UTC ISO for API (year/month = calendar month in local) */
function toDateParamUTC(year, month) {
  return new Date(Date.UTC(year, month, 1)).toISOString();
}

/** Calendar grid in local time; year/month = displayed month in user locale */
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

export default function ScheduleCalendarSection({ selectedDate, onSelect }) {
  const now = new Date();
  const viewInitial = selectedDate
    ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const [viewDate, setViewDate] = useState(viewInitial);
  useEffect(() => {
    if (selectedDate)
      setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dateParamUTC = useMemo(() => toDateParamUTC(year, month), [year, month]);
  const { data: availableDatesResponse } = useGetBhaScheduleSlotDateQuery(
    { date: dateParamUTC },
    { skip: !dateParamUTC }
  );
  const availableDatesSet = useMemo(
    () => parseAvailableDatesToLocalSet(availableDatesResponse?.data),
    [availableDatesResponse?.data]
  );

  const grid = useMemo(() => getCalendarGridLocal(year, month), [year, month]);
  const weekdayLabels = useMemo(() => getLocaleWeekdayLabels(), []);

  const goPrev = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const goNext = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
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
            {viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
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
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="text-left text-[0.7rem] font-medium text-gray-500 py-1 pl-3"
          >
            {label}
          </div>
        ))}
        {grid.map(({ date, isCurrentMonth }, i) => {
          const selected = isSameDayLocal(date, selectedDate);
          const isToday = isSameDayLocal(date, todayLocal);
          const isAvailable = availableDatesSet.has(toLocalYYYYMMDD(date));
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

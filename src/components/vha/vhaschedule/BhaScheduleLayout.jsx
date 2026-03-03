"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HiPlus } from "react-icons/hi";
import ScheduleCalendarSection from "./ScheduleCalendarSection";
import TimeSlotsSection from "./TimeSlotsSection";
import ScheduleAddEditModal from "./ScheduleAddEditModal";
import {
  useGetBhaDoctorAvailableSlotsQuery,
  useDoctorSlotsUpdateDeleteMutation,
} from "@/redux/Apis/bha/scheuleApi/scheduleApi";
import useToast from "@/hooks/useToast";
import { utcISOToLocalTimeDisplay } from "@/utils/FormatDate/formateTime";

/** Selected date (local day) → start of that day in local, then ISO for API */
function toStartOfDayISO(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  return new Date(y, m, day, 0, 0, 0, 0).toISOString();
}

/** Selected date (local day) → end of that day in local, then ISO for API */
function toEndOfDayISO(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  return new Date(y, m, day, 23, 59, 59, 999).toISOString();
}

/** Current month (local) → start of first day in local, then ISO for API */
function toStartOfCurrentMonthISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  return new Date(y, m, 1, 0, 0, 0, 0).toISOString();
}

/** Current month (local) → end of last day in local, then ISO for API */
function toEndOfCurrentMonthISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  return new Date(y, m + 1, 0, 23, 59, 59, 999).toISOString();
}

function formatSlot(slot) {
  if (!slot || typeof slot !== "object") return "";
  const start =
    (utcISOToLocalTimeDisplay(slot.startTime) || slot.startTime) ?? "";
  const end = (utcISOToLocalTimeDisplay(slot.endTime) || slot.endTime) ?? "";
  return start && end ? `${start} - ${end}` : "";
}

/** True if slot's startTime (UTC ISO) falls on the given local date (year, month, day). */
function slotIsOnDate(slot, localDate) {
  if (!slot?.startTime || !localDate) return false;
  const d = localDate instanceof Date ? localDate : new Date(localDate);
  const slotDate = new Date(slot.startTime);
  return (
    d.getFullYear() === slotDate.getFullYear() &&
    d.getMonth() === slotDate.getMonth() &&
    d.getDate() === slotDate.getDate()
  );
}

/** Local YYYY-MM-DD for a date (for calendar matching). */
function toLocalYYYYMMDD(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** From month slots, get unique local dates (YYYY-MM-DD) that have at least one slot, sorted. */
function getAvailableDatesFromSlots(availableSlotsMonth, bookingSlotsMonth) {
  const set = new Set();
  for (const slot of [
    ...(availableSlotsMonth || []),
    ...(bookingSlotsMonth || []),
  ]) {
    if (slot?.startTime) {
      const d = new Date(slot.startTime);
      set.add(toLocalYYYYMMDD(d));
    }
  }
  return Array.from(set).sort();
}

function BhaScheduleLayout() {
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [slotsUpdateDelete, { isLoading: isSlotsActionLoading }] =
    useDoctorSlotsUpdateDeleteMutation();

  const startTimeParam = useMemo(() => toStartOfCurrentMonthISO(), []);
  const endTimeParam = useMemo(() => toEndOfCurrentMonthISO(), []);
  const {
    data: slotsResponse,
    error: slotsError,
    refetch,
  } = useGetBhaDoctorAvailableSlotsQuery(
    { startTime: startTimeParam, endTime: endTimeParam },
    { skip: !startTimeParam || !endTimeParam },
  );

  /** API indicates no slots: "Date not found" or "No available slot found!" (response or error body) */
  const noSlotsFromApi = (() => {
    const msgFromResponse =
      slotsResponse?.success === false ? slotsResponse?.message : undefined;
    const msgFromError =
      slotsError?.data?.success === false
        ? slotsError?.data?.message
        : undefined;
    const isNoSlotsMessage = (m) =>
      typeof m === "string" &&
      (m.includes("Date not found") || m.includes("No available slot found!"));
    return isNoSlotsMessage(msgFromResponse) || isNoSlotsMessage(msgFromError);
  })();

  // API returns month-wide: data.data, availableSlots, bookingSlots — filter by selected date
  const availableSlotsRawMonth = noSlotsFromApi
    ? []
    : (slotsResponse?.data?.availableSlots ?? []);
  const bookingSlotsRawMonth = noSlotsFromApi
    ? []
    : (slotsResponse?.data?.bookingSlots ?? []);

  /** Unique local dates (YYYY-MM-DD) that have slots this month (for calendar dots). */
  const availableDates = useMemo(
    () =>
      getAvailableDatesFromSlots(availableSlotsRawMonth, bookingSlotsRawMonth),
    [availableSlotsRawMonth, bookingSlotsRawMonth],
  );
  const availableDatesSet = useMemo(
    () => new Set(availableDates),
    [availableDates],
  );

  const availableSlotsRaw = useMemo(
    () =>
      availableSlotsRawMonth.filter((slot) => slotIsOnDate(slot, selectedDate)),
    [availableSlotsRawMonth, selectedDate],
  );
  const bookingSlotsRaw = useMemo(
    () =>
      bookingSlotsRawMonth.filter((slot) => slotIsOnDate(slot, selectedDate)),
    [bookingSlotsRawMonth, selectedDate],
  );

  const bookedSlots = useMemo(
    () => bookingSlotsRaw.map(formatSlot).filter(Boolean),
    [bookingSlotsRaw],
  );
  const availableSlots = useMemo(
    () => availableSlotsRaw.map(formatSlot).filter(Boolean),
    [availableSlotsRaw],
  );

  /** No slots for selected day: we have response and both filtered lists for that day are empty */
  const noSlotsForDay =
    startTimeParam &&
    endTimeParam &&
    (noSlotsFromApi ||
      (slotsResponse != null &&
        availableSlotsRaw.length === 0 &&
        bookingSlotsRaw.length === 0));

  /** When month data loads, if selected date has no slots, select first available (Flutter: onDaySelected(availableDate.first)). */
  useEffect(() => {
    if (availableDates.length === 0) return;
    const currentKey = toLocalYYYYMMDD(selectedDate);
    if (availableDatesSet.has(currentKey)) return;
    const [first] = availableDates;
    if (!first) return;
    const [y, m, d] = first.split("-").map(Number);
    setSelectedDate(new Date(y, m - 1, d));
  }, [availableDates, availableDatesSet, selectedDate]);

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const handleEditSlot = useCallback(
    (slot) => {
      if (!slot?.startTime && !slot?._id) return;
      const id = slot._id ?? slot.id;
      setEditingSchedule({
        id,
        date: selectedDate,
        startTime: slot.startTime ?? "",
        endTime: slot.endTime ?? "",
      });
      setIsModalOpen(true);
    },
    [selectedDate],
  );

  const handleDeleteSlot = useCallback(
    async (slot) => {
      const id = slot?._id ?? slot?.id;
      if (!id) {
        toast.error("No schedule slot to delete");
        return;
      }
      if (
        !window.confirm("Are you sure you want to delete this schedule slot?")
      ) {
        return;
      }
      try {
        const result = await slotsUpdateDelete({
          action: "delete",
          id,
          slotId: id,
        }).unwrap();
        toast.success(result?.message || "Schedule deleted successfully");
        refetch();
      } catch (err) {
        const msg =
          err?.data?.message ?? err?.message ?? "Failed to delete schedule";
        toast.error(msg);
      }
    },
    [slotsUpdateDelete, toast, refetch],
  );

  const setOpenModal = useCallback((open) => {
    setIsModalOpen(open);
    if (!open) setEditingSchedule(null);
  }, []);

  const handleAddSchedule = useCallback(() => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header: page info + Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Available Schedule
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create New Available Schedule here.
          </p>
        </div>
        <Button
          onClick={handleAddSchedule}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <HiPlus size={18} className="mr-2" />
          Add Schedule
        </Button>
      </div>

      {/* 1. Calendar Section — availableDates = days that have slots (from month response) */}
      <ScheduleCalendarSection
        selectedDate={selectedDate}
        onSelect={handleDateSelect}
        availableDates={availableDatesSet}
      />

      {/* 2. Time Slots Section (Booked / Available) for selected date */}
      <TimeSlotsSection
        selectedDate={selectedDate}
        bookedSlots={bookedSlots}
        availableSlots={availableSlots}
        bookingSlotsRaw={bookingSlotsRaw}
        availableSlotsRaw={availableSlotsRaw}
        noSlotsForDay={noSlotsForDay}
        onEditSlot={handleEditSlot}
        onDeleteSlot={handleDeleteSlot}
        isActionLoading={isSlotsActionLoading}
      />

      {/* Add/Edit Modal (optional – for edit flow from card) */}
      <ScheduleAddEditModal
        openModal={isModalOpen}
        setOpenModal={setOpenModal}
        scheduleData={editingSchedule}
        initialSelectedDate={selectedDate}
        onSuccess={refetch}
      />
    </div>
  );
}

export default BhaScheduleLayout;

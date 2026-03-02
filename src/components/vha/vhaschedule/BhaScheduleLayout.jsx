"use client";

import React, { useState, useCallback, useMemo } from "react";
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

function formatSlot(slot) {
  if (!slot || typeof slot !== "object") return "";
  const start =
    (utcISOToLocalTimeDisplay(slot.startTime) || slot.startTime) ?? "";
  const end = (utcISOToLocalTimeDisplay(slot.endTime) || slot.endTime) ?? "";
  return start && end ? `${start} - ${end}` : "";
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

  const startTimeParam = useMemo(
    () => toStartOfDayISO(selectedDate),
    [selectedDate],
  );
  const endTimeParam = useMemo(
    () => toEndOfDayISO(selectedDate),
    [selectedDate],
  );
  const {
    data: slotsResponse,
    error: slotsError,
    refetch,
  } = useGetBhaDoctorAvailableSlotsQuery(
    { startTime: startTimeParam, endTime: endTimeParam },
    { skip: !startTimeParam || !endTimeParam },
  );

  const dateNotFound =
    (slotsResponse?.success === false &&
      slotsResponse?.message?.includes("Date not found")) ||
    (slotsError?.data?.success === false &&
      slotsError?.data?.message?.includes("Date not found"));

  // API returns data.data as array of slots [{ startTime, endTime, _id }, ...]
  const dataSlotsArray = slotsResponse?.data?.data;
  const slotData =
    dateNotFound || !Array.isArray(dataSlotsArray) || dataSlotsArray.length === 0
      ? null
      : dataSlotsArray[0];
  const availableSlotsRaw = dateNotFound
    ? []
    : (slotsResponse?.data?.availableSlots ?? []);
  const bookingSlotsRaw = dateNotFound
    ? []
    : (slotsResponse?.data?.bookingSlots ?? []);

  const bookedSlots = useMemo(
    () => bookingSlotsRaw.map(formatSlot).filter(Boolean),
    [bookingSlotsRaw],
  );
  const availableSlots = useMemo(
    () => availableSlotsRaw.map(formatSlot).filter(Boolean),
    [availableSlotsRaw],
  );

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
      if (!window.confirm("Are you sure you want to delete this schedule slot?")) {
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
          err?.data?.message ??
          err?.message ??
          "Failed to delete schedule";
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

      {/* 1. Calendar Section */}
      <ScheduleCalendarSection
        selectedDate={selectedDate}
        onSelect={handleDateSelect}
      />

      {/* 2. Time Slots Section (Booked / Available) */}
      <TimeSlotsSection
        bookedSlots={bookedSlots}
        availableSlots={availableSlots}
        bookingSlotsRaw={bookingSlotsRaw}
        availableSlotsRaw={availableSlotsRaw}
        noSlotsForDay={dateNotFound}
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

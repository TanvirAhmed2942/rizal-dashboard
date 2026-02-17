"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { HiPlus } from "react-icons/hi";
import ScheduleCalendarSection from "./ScheduleCalendarSection";
import DateTimeSelectionCard from "./DateTimeSelectionCard";
import TimeSlotsSection from "./TimeSlotsSection";
import ScheduleAddEditModal from "./ScheduleAddEditModal";
import {
  useGetBhaDoctorAvailableSlotsQuery,
  useDoctorSlotsUpdateDeleteMutation,
} from "@/redux/Apis/bha/scheuleApi/scheduleApi";
import useToast from "@/hooks/useToast";

function toDateISO(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}T00:00:00.000Z`;
}

function formatSlot(slot) {
  if (!slot || typeof slot !== "object") return "";
  const start = slot.startTime ?? "";
  const end = slot.endTime ?? "";
  return start && end ? `${start} - ${end}` : "";
}

function BhaScheduleLayout() {
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(() => {
    const n = new Date();
    return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [slotsUpdateDelete, { isLoading: isSlotsActionLoading }] =
    useDoctorSlotsUpdateDeleteMutation();

  const dateParam = useMemo(() => toDateISO(selectedDate), [selectedDate]);
  const { data: slotsResponse, error: slotsError } = useGetBhaDoctorAvailableSlotsQuery(
    { date: dateParam },
    { skip: !dateParam },
  );

  const dateNotFound =
    (slotsResponse?.success === false && slotsResponse?.message?.includes("Date not found")) ||
    (slotsError?.data?.success === false && slotsError?.data?.message?.includes("Date not found"));

  const slotData = dateNotFound ? null : (slotsResponse?.data?.data ?? null);
  const availableSlotsRaw = dateNotFound ? [] : (slotsResponse?.data?.availableSlots ?? []);
  const bookingSlotsRaw = dateNotFound ? [] : (slotsResponse?.data?.bookingSlots ?? []);

  const slotId = slotData?._id ?? null;
  const startTime = slotData?.startTime ?? "";
  const endTime = slotData?.endTime ?? "";
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

  const handleEditCard = useCallback(() => {
    if (!slotId) return;
    setEditingSchedule({
      id: slotId,
      date: selectedDate,
      startTime,
      endTime,
    });
    setIsModalOpen(true);
  }, [selectedDate, startTime, endTime, slotId]);

  const handleDeleteCard = useCallback(async () => {
    if (!slotId) return;
    try {
      await slotsUpdateDelete({ action: "delete", id: slotId }).unwrap();
      toast.success("Schedule deleted successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete schedule");
    }
  }, [slotId, slotsUpdateDelete, toast]);

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

      {/* 2. Date & Time Selection Card */}
      <DateTimeSelectionCard
        selectedDate={selectedDate}
        startTime={startTime}
        endTime={endTime}
        slotId={slotId}
        onEdit={handleEditCard}
        onDelete={handleDeleteCard}
        isActionLoading={isSlotsActionLoading}
      />

      {/* 3. Time Slots Section (Booked / Available) */}
      <TimeSlotsSection
        bookedSlots={bookedSlots}
        availableSlots={availableSlots}
        noSlotsForDay={dateNotFound}
      />

      {/* Add/Edit Modal (optional – for edit flow from card) */}
      <ScheduleAddEditModal
        openModal={isModalOpen}
        setOpenModal={setOpenModal}
        scheduleData={editingSchedule}
        initialSelectedDate={selectedDate}
      />
    </div>
  );
}

export default BhaScheduleLayout;

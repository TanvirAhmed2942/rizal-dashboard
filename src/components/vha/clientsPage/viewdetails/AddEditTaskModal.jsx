"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

import { Loader, CalendarIcon, ChevronDown } from "lucide-react";
import { useGetAllTargetDomainsQuery } from "@/redux/Apis/admin/targetdomainApi/targetdomainApi";
import { TimePickerInput } from "@/components/ui/shadcn-io/rating/timepickerinput";
import { Checkbox } from "@/components/ui/checkbox";

const SCHEDULE_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

const WEEKDAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];
const AddEditTaskModal = ({
  openModal,
  setOpenModal,
  onSave,
  initialData = null,
  isLoading = false,
}) => {
  // Fetch all categories

  const { data: targetDomainsData, isLoading: isTargetDomainsLoading } =
    useGetAllTargetDomainsQuery();
  const [formData, setFormData] = useState({
    taskTitle: "",
    taskDescription: "",
    categoryId: "",
    targetDomainId: "",
    type: "daily",
    days: [],
    startDateTime: null,
    endDateTime: null,
  });
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [isDaysOpen, setIsDaysOpen] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  const targetDomains = targetDomainsData?.data || [];

  const updateField = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "type" && value === "daily") {
        next.days = [];
      }
      return next;
    });
    setScheduleError("");
  };

  const toggleWeekday = (dayValue) => {
    setFormData((prev) => {
      const has = prev.days.includes(dayValue);
      const days = has
        ? prev.days.filter((d) => d !== dayValue)
        : [...prev.days, dayValue];
      return { ...prev, days };
    });
    setScheduleError("");
  };

  const weekdaysSummary =
    formData.days.length === 0
      ? "Select days"
      : formData.days
          .map(
            (d) => WEEKDAYS.find((w) => w.value === d)?.label ?? d
          )
          .join(", ");

  const parseDateTime = (dateVal, timeVal) => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    if (timeVal && /^\d{1,2}:\d{2}$/.test(timeVal)) {
      const [h, m] = timeVal.split(":").map(Number);
      d.setHours(h, m, 0, 0);
    }
    return d;
  };

  // Load data when editing
  useEffect(() => {
    if (openModal) {
      setFormData({
        taskTitle: initialData?.taskName || "",
        taskDescription: initialData?.taskDescription || "",
        categoryId: initialData?.categoryId || "",
        targetDomainId:
          initialData?.targetDomainId || initialData?.targetedDomainId || "",
        type: initialData?.type === "weekly" ? "weekly" : "daily",
        days: Array.isArray(initialData?.days)
          ? initialData.days.filter(Boolean)
          : [],
        startDateTime: parseDateTime(
          initialData?.startDate,
          initialData?.startTime
        ),
        endDateTime: parseDateTime(initialData?.endDate, initialData?.endTime),
      });
      setScheduleError("");
    }
  }, [openModal, initialData]);

  const handleSave = () => {
    if (!formData.taskTitle.trim()) return;
    if (formData.type === "weekly" && formData.days.length === 0) {
      setScheduleError("Select at least one day for weekly schedule.");
      return;
    }
    const payload = {
      id: initialData?.id,
      title: formData.taskTitle,
      description: formData.taskDescription,
      categoryId: formData.categoryId,
      targetDomainId: formData.targetDomainId,
      type: formData.type,
      ...(formData.type === "weekly" ? { days: formData.days } : {}),
      startTime: formData.startDateTime
        ? format(formData.startDateTime, "HH:mm")
        : "",
      endTime: formData.endDateTime
        ? format(formData.endDateTime, "HH:mm")
        : "",
      startDate: formData.startDateTime
        ? format(formData.startDateTime, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        : "",
      endDate: formData.endDateTime
        ? format(formData.endDateTime, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        : "",
    };
    if (onSave) onSave(payload);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-left">
            {initialData ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-2 space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Task Title
            </label>
            <Input
              placeholder="Enter your session..."
              value={formData.taskTitle}
              onChange={(e) => updateField("taskTitle", e.target.value)}
              className="bg-gray-100"
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Task Description
            </label>
            <Textarea
              placeholder="Type your task description..."
              value={formData.taskDescription}
              onChange={(e) => updateField("taskDescription", e.target.value)}
              className="bg-gray-100 min-h-[140px]"
            />
          </div>

          {/* Schedule type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Type</label>
            <Select
              value={formData.type}
              onValueChange={(val) => updateField("type", val)}
            >
              <SelectTrigger className="bg-gray-100 w-full">
                <SelectValue placeholder="Select schedule type" />
              </SelectTrigger>
              <SelectContent>
                {SCHEDULE_TYPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weekly days (dropdown-style popover) */}
          {formData.type === "weekly" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Days</label>
              <Popover open={isDaysOpen} onOpenChange={setIsDaysOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between bg-gray-100 border-gray-200 font-normal"
                  >
                    <span
                      className={
                        formData.days.length === 0
                          ? "text-gray-500"
                          : "text-left truncate"
                      }
                    >
                      {weekdaysSummary}
                    </span>
                    <ChevronDown className="size-4 shrink-0 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3" align="start">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {WEEKDAYS.map((d) => (
                      <label
                        key={d.value}
                        className="flex items-center gap-2 text-sm cursor-pointer rounded-md px-1 py-1.5 hover:bg-muted/60"
                      >
                        <Checkbox
                          checked={formData.days.includes(d.value)}
                          onCheckedChange={() => toggleWeekday(d.value)}
                        />
                        <span>{d.label}</span>
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {scheduleError ? (
                <p className="text-sm text-destructive">{scheduleError}</p>
              ) : null}
            </div>
          )}

          {/* Target Domain */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Target Domain
            </label>
            <Select
              value={formData.targetDomainId}
              onValueChange={(val) => updateField("targetDomainId", val)}
            >
              <SelectTrigger className="bg-gray-100 w-full">
                <SelectValue
                  placeholder={
                    isTargetDomainsLoading
                      ? "Loading..."
                      : "Select target domain"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isTargetDomainsLoading ? (
                  <SelectItem value="" disabled>
                    Loading target domains...
                  </SelectItem>
                ) : targetDomains.length === 0 ? (
                  <SelectItem value="" disabled>
                    No target domains available
                  </SelectItem>
                ) : (
                  targetDomains.map((domain) => (
                    <SelectItem key={domain._id} value={domain._id}>
                      {domain.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* From Date & Time / To Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* From Date & Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                From Date & Time
              </label>
              <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 bg-gray-100 border-gray-200 text-left font-normal"
                  >
                    <CalendarIcon className="size-4 shrink-0 text-gray-500" />
                    {formData.startDateTime ? (
                      format(formData.startDateTime, "PPP HH:mm")
                    ) : (
                      <span className="text-gray-500">
                        Select date and time
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.startDateTime
                        ? formData.startDateTime
                        : undefined
                    }
                    onSelect={(day) => {
                      const base = formData.startDateTime ?? new Date();
                      const next = day
                        ? new Date(
                            day.getFullYear(),
                            day.getMonth(),
                            day.getDate(),
                            base.getHours(),
                            base.getMinutes(),
                            base.getSeconds()
                          )
                        : new Date();
                      updateField("startDateTime", next);
                    }}
                    initialFocus
                  />
                  <div className="flex items-center gap-2 border-t border-gray-200 p-3">
                    <TimePickerInput
                      picker="hours"
                      date={formData.startDateTime ?? new Date()}
                      setDate={(d) => updateField("startDateTime", d ?? null)}
                      onRightFocus={() => {}}
                    />
                    <span className="text-gray-400 font-medium">:</span>
                    <TimePickerInput
                      picker="minutes"
                      date={formData.startDateTime ?? new Date()}
                      setDate={(d) => updateField("startDateTime", d ?? null)}
                      onLeftFocus={() => {}}
                      onRightFocus={() => {}}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date & Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                To Date & Time
              </label>
              <Popover open={isToOpen} onOpenChange={setIsToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 bg-gray-100 border-gray-200 text-left font-normal"
                  >
                    <CalendarIcon className="size-4 shrink-0 text-gray-500" />
                    {formData.endDateTime ? (
                      format(formData.endDateTime, "PPP HH:mm")
                    ) : (
                      <span className="text-gray-500">
                        Select date and time
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.endDateTime ? formData.endDateTime : undefined
                    }
                    onSelect={(day) => {
                      const base = formData.endDateTime ?? new Date();
                      const next = day
                        ? new Date(
                            day.getFullYear(),
                            day.getMonth(),
                            day.getDate(),
                            base.getHours(),
                            base.getMinutes(),
                            base.getSeconds()
                          )
                        : new Date();
                      updateField("endDateTime", next);
                    }}
                    initialFocus
                  />
                  <div className="flex items-center gap-2 border-t border-gray-200 p-3">
                    <TimePickerInput
                      picker="hours"
                      date={formData.endDateTime ?? new Date()}
                      setDate={(d) => updateField("endDateTime", d ?? null)}
                      onRightFocus={() => {}}
                    />
                    <span className="text-gray-400 font-medium">:</span>
                    <TimePickerInput
                      picker="minutes"
                      date={formData.endDateTime ?? new Date()}
                      setDate={(d) => updateField("endDateTime", d ?? null)}
                      onLeftFocus={() => {}}
                      onRightFocus={() => {}}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Saving...{" "}
                <Loader className="w-4 h-4 animate-spin ml-2 text-white" />
              </>
            ) : initialData ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditTaskModal;

"use client";

import React, { useState } from "react";
import TodaySession from "./TodaySession";
import SmallPageInfo from "@/components/common/SmallPageInfo";
import { Calendar } from "@/components/ui/calendar";
import { useGetTodaysSessionDataQuery } from "@/redux/Apis/bha/todaysessionApi/todaysessionApi";

function CalendarLayout() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Format date to ISO string (date only, with T00:00:00.000Z) for API
  const formatDateForApi = (date) => {
    if (!date) return new Date().toISOString().split("T")[0] + "T00:00:00.000Z";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T00:00:00.000Z`;
  };

  const formattedDate = formatDateForApi(selectedDate);

  const {
    data: sessionData,
    isLoading,
    isFetching,
  } = useGetTodaysSessionDataQuery({
    date: formattedDate,
  });

  const sessions = sessionData?.data || [];

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <SmallPageInfo
          title="Calendar"
          description="Here is an overview of your calendar"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-10 w-full">
        <CalenderComponent
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <TodaySession
          sessions={sessions}
          isLoading={isLoading || isFetching}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}

export default CalendarLayout;

const CalenderComponent = ({ selectedDate, setSelectedDate }) => {
  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={(date) => date && setSelectedDate(date)}
      className="rounded-lg border w-auto aspect-square size-auto"
      classNames={{
        today:
          "bg-gray-200  text-accent-foreground rounded-md data-[selected=true]:rounded-full",
        day_selected: "bg-sky-500 text-white hover:bg-sky-600 focus:bg-sky-600",
      }}
    />
  );
};

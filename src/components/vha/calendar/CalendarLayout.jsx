"use client";

import React, { useState } from "react";
import TodaySession from "./TodaySession";
import SmallPageInfo from "@/components/common/SmallPageInfo";
import { Calendar } from "@/components/ui/calendar";
import { useGetTodaysSessionDataQuery } from "@/redux/Apis/bha/todaysessionApi/todaysessionApi";

function CalendarLayout() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Selected date → day start/end in UTC for API (e.g. 24th → dayStartTime=2026-02-24T00:00:00.000Z, dayEndTime=2026-02-24T23:59:59.999Z)
  const dayStartTime = React.useMemo(() => {
    if (!selectedDate) return "";
    const d = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    return new Date(Date.UTC(y, m, day)).toISOString();
  }, [selectedDate]);

  const dayEndTime = React.useMemo(() => {
    if (!selectedDate) return "";
    const d = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    return new Date(Date.UTC(y, m, day, 23, 59, 59, 999)).toISOString();
  }, [selectedDate]);

  const {
    data: sessionData,
    isLoading,
    isFetching,
  } = useGetTodaysSessionDataQuery(
    { dayStartTime, dayEndTime },
    { skip: !dayStartTime || !dayEndTime },
  );

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

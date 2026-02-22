"use client";
import SearchFilterButton from "@/components/common/SearchFilterButton";
import SmallPageInfo from "@/components/common/SmallPageInfo";
import { ClientTaskTable } from "./ClientTaskTable";
import React, { useState, useMemo } from "react";
import { useGetSessionManagementDataQuery } from "@/redux/Apis/bha/sessionmanagementApi/sessionmanagementApi";
import formatDate from "@/utils/FormatDate/formatDate";
import { utcISOToLocalTimeDisplay } from "@/utils/FormatDate/formateTime";
import { getImageUrl } from "@/utils/getImageUrl";

function ClientPgaeLayout() {
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const limit = 10;

  const { startTime, endTime } = useMemo(() => {
    if (!selectedDate || typeof selectedDate !== "string")
      return { startTime: "", endTime: "" };
    const d = new Date(selectedDate);
    if (Number.isNaN(d.getTime())) return { startTime: "", endTime: "" };
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    const start = new Date(Date.UTC(y, m, day)).toISOString();
    const end = new Date(Date.UTC(y, m, day, 23, 59, 59, 999)).toISOString();
    return { startTime: start, endTime: end };
  }, [selectedDate]);

  const { data: sessionManagementData, isLoading: isSessionManagementLoading } =
    useGetSessionManagementDataQuery({
      page: currentPage,
      limit,
      search: searchText,
      status,
      startTime,
      endTime,
    });

  const sessionManagementInfoData =
    sessionManagementData?.data?.map((item) => ({
      id: item._id,
      clientName: item.userId?.fullName || "N/A",
      clientEmail: item.userId?.email || "N/A",
      clientProfilePicture: getImageUrl(item.userId?.profile),
      bookingDate: item.startTime
        ? formatDate(item.startTime)
        : formatDate(item.bookingDate),
      startTime: utcISOToLocalTimeDisplay(item.startTime),
      endTime: utcISOToLocalTimeDisplay(item.endTime),
      duration: `${item.scheduledDuration} min`,
      status: item.status,
    })) || [];

  const paginationMeta = sessionManagementData?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 1,
  };

  return (
    <div className="space-y-4">
      <SmallPageInfo
        title="Client Session Management"
        description="Here is an overview of your client session management"
      />
      <SearchFilterButton
        showAddButton={false}
        selectOptions={[
          "All Status",
          "Pending",
          "Completed",
          "Missed",
          "Confirmed",
          "Rescheduled",
          "Overdue",
          "Cancelled",
        ]}
        placeholder="Search Client by Name or Email"
        searchText={searchText}
        setSearchText={(value) => {
          setSearchText(value);
          setCurrentPage(1);
        }}
        status={status}
        setStatus={(value) => {
          setStatus(value);
          setCurrentPage(1);
        }}
        searchByDate={true}
        selectedDate={selectedDate}
        setSelectedDate={(value) => {
          setSelectedDate(value);
          setCurrentPage(1);
        }}
      />
      <ClientTaskTable
        sessionManagementInfoData={sessionManagementInfoData}
        paginationMeta={paginationMeta}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoading={isSessionManagementLoading}
      />
    </div>
  );
}

export default ClientPgaeLayout;

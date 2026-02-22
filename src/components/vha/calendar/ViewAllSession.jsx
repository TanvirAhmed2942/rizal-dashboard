"use client";

import React, { useState } from "react";
import BackButton from "@/components/common/backButton/backButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetAllSessionDataQuery } from "@/redux/Apis/bha/todaysessionApi/todaysessionApi";
import formatDate from "@/utils/FormatDate/formatDate";
import { utcISOToLocalTimeDisplay } from "@/utils/FormatDate/formateTime";
import { Badge } from "@/components/ui/badge";
import SearchFilterButton from "@/components/common/SearchFilterButton";

const ViewAllSession = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("All Status");
  const limit = 10;

  const { data: sessionData, isLoading } = useGetAllSessionDataQuery({
    page: currentPage,
    limit,
    search: searchText,
    status,
  });

  const sessions = sessionData?.data || [];
  const paginationMeta = sessionData?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 1,
  };

  const handleView = (id) => {
    router.push(`/bha/clients/details/${id}`);
  };

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () =>
    setCurrentPage((p) => Math.min(paginationMeta.totalPage, p + 1));

  return (
    <div className="space-y-4">
      <BackButton showText={true} text="View All Session" />

      <SearchFilterButton
        placeholder="Search by name or email"
        showAddButton={false}
        selectOptions={[
          "All Status",
          "Confirmed",
          "Completed",
          "Cancelled",
          "Pending",
        ]}
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
      />

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No sessions found
          </div>
        ) : (
          sessions.map((session) => (
            <Card key={session._id} className="border border-gray-200">
              <CardContent className="p-4 flex items-center justify-between gap-4 bg-white">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-gray-900">
                    {session.userId?.fullName || "N/A"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`capitalize ${
                        session.status === "confirmed"
                          ? "bg-blue-100 text-blue-600 border-blue-200"
                          : session.status === "completed"
                          ? "bg-green-100 text-green-600 border-green-200"
                          : session.status === "cancelled"
                          ? "bg-red-100 text-red-600 border-red-200"
                          : "bg-yellow-100 text-yellow-600 border-yellow-200"
                      }`}
                    >
                      {session.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {session.scheduledDuration} min
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />{" "}
                      {(utcISOToLocalTimeDisplay(session.startTime) || session.startTime) ?? "—"} -{" "}
                      {(utcISOToLocalTimeDisplay(session.endTime) || session.endTime) ?? "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />{" "}
                      {(session.startTime ? formatDate(session.startTime) : formatDate(session.bookingDate)) ?? "—"}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handleView(session._id)}
                  className="bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200"
                >
                  View
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {paginationMeta.totalPage > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {(currentPage - 1) * limit + 1} to{" "}
            {Math.min(currentPage * limit, paginationMeta.total)} of{" "}
            {paginationMeta.total} results
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="text-gray-700"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {paginationMeta.totalPage}
            </span>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentPage === paginationMeta.totalPage}
              className="text-gray-700"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllSession;

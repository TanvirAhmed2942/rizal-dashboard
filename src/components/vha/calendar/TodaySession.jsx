"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TbWallpaper } from "react-icons/tb";
import { CardTitle, CardAction } from "@/components/ui/card";
import formatDate from "@/utils/FormatDate/formatDate";
import { utcISOToLocalTimeDisplay } from "@/utils/FormatDate/formateTime";
import { Badge } from "@/components/ui/badge";

function TodaySession({ sessions = [], isLoading = false, selectedDate }) {
  const router = useRouter();

  const handleView = (id) => {
    router.push(`/bha/clients/details/${id}`);
  };

  // Format the selected date for display
  const displayDate = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Today";

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <TbWallpaper size={20} />
          Sessions for {displayDate}
        </CardTitle>
        <CardAction>
          <p
            onClick={() => router.push("/bha/calendar/view-details")}
            className="font-semibold underline text-sky-500 cursor-pointer text-sm sm:text-base"
          >
            View All Session
          </p>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4">
        <ScrollArea className="h-[660px] pr-2">
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No sessions scheduled for this date
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between gap-4 border border-gray-200 rounded-lg px-4 py-3 bg-white"
                >
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
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />{" "}
                        {(utcISOToLocalTimeDisplay(session.startTime) || session.startTime) ?? "—"} -{" "}
                        {(utcISOToLocalTimeDisplay(session.endTime) || session.endTime) ?? "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {formatDate(session.bookingDate)}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleView(session._id)}
                    className="bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200"
                  >
                    View
                  </Button>
                </div>
              ))
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default TodaySession;

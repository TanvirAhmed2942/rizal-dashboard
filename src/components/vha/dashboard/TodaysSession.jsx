"use client";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TbWallpaper } from "react-icons/tb";
import { Clock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import formatDate from "@/utils/FormatDate/formatDate";
import { utcISOToLocalTimeDisplay } from "@/utils/FormatDate/formateTime";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

function TodaysSession({ sessionData }) {
  const router = useRouter();
  const todaysSessions = useMemo(() => {
    const list = sessionData ?? [];
    const sorted = [...list].sort((a, b) => {
      const t1 = a.startTime ? new Date(a.startTime).getTime() : 0;
      const t2 = b.startTime ? new Date(b.startTime).getTime() : 0;
      return t1 - t2;
    });
    return sorted.map((session) => ({
      id: session._id || session.id,
      startAt:
        (utcISOToLocalTimeDisplay(session.startTime) || session.startTime) ??
        "—",
      endAt:
        (utcISOToLocalTimeDisplay(session.endTime) || session.endTime) ?? "—",
      date:
        (session.startTime
          ? formatDate(session.startTime)
          : formatDate(session.bookingDate)) ?? "—",
      name: session.userId?.fullName,
      status: session.status,
      session: "Session",
      viewLink: `/vha/session/${session._id || session.id}`,
    }));
  }, [sessionData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TbWallpaper size={20} />
          Todays Session
        </CardTitle>
        <CardAction
          className="font-semibold underline text-sky-500 cursor-pointer"
          onClick={() => router.push("/bha/calendar/view-details")}
        >
          View All
        </CardAction>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[330px] pr-2">
          {todaysSessions.length > 0 ? (
            todaysSessions.map((session, index) => (
              <div
                key={session.id || index}
                className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg mb-3 px-4 py-3"
              >
                <div className="flex flex-col items-start gap-1 flex-1">
                  <h3 className="font-bold text-gray-900">{session.name}</h3>
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-gray-600">{session.session}</p>•
                    <Badge
                      className={`${
                        session.status.toLowerCase() === "confirmed"
                          ? "bg-blue-500 text-white"
                          : session.status.toLowerCase() === "completed"
                            ? "bg-lime-500 text-white"
                            : session.status.toLowerCase() === "cancelled"
                              ? "bg-red-500 text-white"
                              : "bg-gray-500 text-white"
                      }`}
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-500" />
                      <p className="text-sm text-gray-500">{session.startAt}</p>
                    </div>
                    -
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-500" />
                      <p className="text-sm text-gray-500">{session.endAt}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-500" />
                      <p className="text-sm text-gray-500">{session.date}</p>
                    </div>
                  </div>
                </div>
                <Button
                  className="bg-sky-100 hover:bg-sky-200 text-sky-600 border-0"
                  onClick={() =>
                    router.push(`/bha/clients/details/${session.id}`)
                  }
                >
                  View
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No sessions scheduled for today
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default TodaysSession;

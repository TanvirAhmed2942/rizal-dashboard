"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import getImageUrl from "@/utils/getImageUrl";
import { Badge } from "@/components/ui/badge";
import RescheduleModal from "./Reschedule/RescheduleModal";
import { useJoinSessionNowMutation } from "@/redux/Apis/bha/scheuleApi/scheduleApi";
import VideoContainer from "./JoinSession/VideoContainer";
import useToast from "@/hooks/useToast";
import { utcISOToLocalTimeDisplay } from "@/utils/FormatDate/formateTime";

const ClientDetailsLayout = ({ clientInfo }) => {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const initialSessionDate = clientInfo?.sessionDateRaw
    ? new Date(clientInfo.sessionDateRaw)
    : new Date();

  console.log("clientInfo-----><---", clientInfo);

  return (
    <>
      <div className="flex flex-col md:flex-row items-center  md:items-start lg:justify-between gap-4 md:gap-6 bg-white border border-gray-300 rounded-lg p-4 md:p-6">
        <ClientProfile clientInfo={clientInfo} />
        <div className="w-full lg:w-1/2">
          <Session
            clientInfo={clientInfo}
            onOpenReschedule={() => setIsRescheduleOpen(true)}
          />
        </div>
      </div>

      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        initialDate={initialSessionDate}
        bookingId={clientInfo?.bookingId}
      />
    </>
  );
};

export default ClientDetailsLayout;

const ClientProfile = ({ clientInfo }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto md:min-w-[280px]">
      <Avatar className="size-16 sm:size-20 flex-shrink-0">
        <AvatarImage src={getImageUrl(clientInfo.clientProfilePicture)} />
        <AvatarFallback>{clientInfo.clientName?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <p className="text-xl sm:text-2xl font-bold">{clientInfo.clientName}</p>
        <p className="text-sm text-gray-500">{clientInfo.clientEmail}</p>
      </div>
    </div>
  );
};

const Session = ({ clientInfo, onOpenReschedule }) => {
  const sessionData = useMemo(
    () => ({
      startTime: (utcISOToLocalTimeDisplay(clientInfo.startTime) || clientInfo.startTime) ?? "",
      endTime: (utcISOToLocalTimeDisplay(clientInfo.endTime) || clientInfo.endTime) ?? "",
      date: clientInfo.sessionDate,
    }),
    [clientInfo.startTime, clientInfo.endTime, clientInfo.sessionDate],
  );
  const [joinSessionNow, { isLoading: isJoining }] = useJoinSessionNowMutation();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [sessionResponseData, setSessionResponseData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const toast = useToast();

  // Update current time every minute to check if we're in the time window
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Convert time string (e.g., "10:00 AM") to minutes since midnight
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (period?.toUpperCase() === "PM" && hours !== 12) {
      totalMinutes += 12 * 60;
    }
    if (period?.toUpperCase() === "AM" && hours === 12) {
      totalMinutes -= 12 * 60;
    }
    return totalMinutes;
  };

  // Check if current date matches session date
  const isTodaySession = useMemo(() => {
    if (!clientInfo.sessionDateRaw) return false;
    const sessionDate = new Date(clientInfo.sessionDateRaw);
    const today = new Date();
    
    return (
      sessionDate.getFullYear() === today.getFullYear() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getDate() === today.getDate()
    );
  }, [clientInfo.sessionDateRaw, currentTime]);

  // Check if current time is within session time window (supports UTC ISO or "10:00 AM" format)
  const isWithinTimeWindow = useMemo(() => {
    if (!isTodaySession || !clientInfo.startTime || !clientInfo.endTime) {
      return false;
    }
    const startStr = clientInfo.startTime;
    const endStr = clientInfo.endTime;
    if (typeof startStr === "string" && (startStr.includes("T") || startStr.endsWith("Z"))) {
      const startMs = new Date(startStr).getTime();
      const endMs = new Date(endStr).getTime();
      const nowMs = currentTime.getTime();
      if (Number.isNaN(startMs) || Number.isNaN(endMs)) return false;
      return nowMs >= startMs && nowMs <= endMs;
    }
    const startMinutes = timeToMinutes(startStr);
    const endMinutes = timeToMinutes(endStr);
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    if (startMinutes === null || endMinutes === null) return false;
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }, [isTodaySession, clientInfo.startTime, clientInfo.endTime, currentTime]);

  // Join button should be enabled only if it's today and within time window
  const canJoin = isTodaySession && isWithinTimeWindow;

  // Reschedule button should be enabled only if status is "confirmed" or "pending"
  const canReschedule = useMemo(() => {
    const status = clientInfo.status?.toLowerCase();
    return status === "confirmed" || status === "pending";
  }, [clientInfo.status]);

  const handleJoinNow = async () => {
    try {
      const response = await joinSessionNow({ bookingId: clientInfo.bookingId });
      if (response.data?.success) {
        toast.success(response.data.message);
        setSessionResponseData(response.data.data);
        setIsVideoOpen(true);
      } else {
        toast.error(response.data?.message || "Failed to join session");
      }
    } catch (error) {
      console.log("error----->", error);
      toast.error("Failed to join session");
    }
  };

  const currentUser = {
    name: clientInfo.clientName,
    profilePicture: clientInfo.clientProfilePicture,
  };

  return (
    <>
      <div className="bg-gray-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            Coaching Session{" "}
            <Badge
              variant="outline"
              className={`text-xs bg-blue-500/50 ${clientInfo.status === "completed" ? "bg-green-500" : "bg-blue-500/50"} text-white`}
            >
              {clientInfo.status}
            </Badge>
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-gray-700 flex-shrink-0" />
              <p className="text-sm text-gray-700">{sessionData.startTime}</p>
            </div>
            -
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-gray-700 flex-shrink-0" />
              <p className="text-sm text-gray-700">{sessionData.endTime}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-gray-700 flex-shrink-0" />
              <p className="text-sm text-gray-700">{sessionData.date}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onOpenReschedule}
            disabled={isJoining || !canReschedule}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reschedule
          </Button>
          <Button
            onClick={handleJoinNow}
            disabled={isJoining || !canJoin}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? "Joining..." : "Join Now"}
          </Button>
        </div>
      </div>

      <VideoContainer
        isOpen={isVideoOpen}
        onClose={() => {
          setIsVideoOpen(false);
          setSessionResponseData(null);
        }}
        sessionData={sessionResponseData}
        bookingId={clientInfo.bookingId}
        currentUser={currentUser}
      />
    </>
  );
};

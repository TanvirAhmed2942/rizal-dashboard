"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAgora } from "./hooks/useAgora";
import VideoControls from "./VideoControls";
import VideoTimer from "./VideoTimer";
import VideoParticipant from "./VideoParticipant";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useLeaveSessionNowMutation,
  useExtendSessionFiveMinutesMutation,
} from "@/redux/Apis/bha/scheuleApi/scheduleApi";
import useToast from "@/hooks/useToast";
import { utcISOToLocalTimeDisplay } from "@/utils/FormatDate/formateTime";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

function formatMsToTimeDisplay(ms) {
  if (ms == null || Number.isNaN(ms)) return "—";
  const d = new Date(ms);
  const hour24 = d.getHours();
  const min = d.getMinutes();
  const ampm = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(min).padStart(2, "0")} ${ampm}`;
}

function VideoContainer({
  isOpen,
  onClose,
  sessionData,
  currentUser,
  bookingId,
  sessionEndTime,
  sessionStartTime,
}) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callStartTime] = useState(Date.now());
  const containerRef = useRef(null);
  const [leaveSessionNow, { isLoading: isLeaving }] =
    useLeaveSessionNowMutation();
  const [extendSessionFiveMinutes, { isLoading: isExtending }] =
    useExtendSessionFiveMinutesMutation();
  const [isExtended, setIsExtended] = useState(false);
  const { success, error } = useToast();

  const [effectiveEndTimeMs, setEffectiveEndTimeMs] = useState(null);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && sessionEndTime) {
      const ms = new Date(String(sessionEndTime).trim()).getTime();
      if (!Number.isNaN(ms) && !prevOpenRef.current) {
        setEffectiveEndTimeMs(ms);
      }
      prevOpenRef.current = true;
    } else {
      prevOpenRef.current = false;
    }
  }, [isOpen, sessionEndTime]);

  const {
    isJoined,
    isVideoEnabled,
    isAudioEnabled,
    remoteUsers,
    localVideoElementRef,
    remoteVideoElementsRef,
    toggleVideo,
    toggleAudio,
    leaveChannel,
  } = useAgora({
    appId: sessionData?.appId,
    token: sessionData?.token,
    channelName: sessionData?.channelName,
    uid: sessionData?.uid,
  });

  console.log("sessionData-----><---", sessionData);
  console.log("bookingId-----><---", bookingId);

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.closest("button")) return; // Don't drag if clicking a button
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep within viewport bounds
    const maxX = window.innerWidth - (containerRef.current?.offsetWidth || 400);
    const maxY =
      window.innerHeight - (containerRef.current?.offsetHeight || 300);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleEndCall = useCallback(async () => {
    await leaveChannel();
    if (bookingId) {
      try {
        await leaveSessionNow({ bookingId }).unwrap();
      } catch {
        // Still close the modal on error so user can leave the UI
      }
    }
    onClose?.();
  }, [leaveChannel, bookingId, leaveSessionNow, onClose]);

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleSettings = () => {
    // TODO: Implement settings
    console.log("Settings clicked");
  };

  const handleParticipants = () => {
    // TODO: Implement participants view
    console.log("Participants clicked");
  };

  const handleExtendCall = async () => {
    if (isExtended || !bookingId) return;
    try {
      const res = await extendSessionFiveMinutes({ bookingId }).unwrap();
      if (res?.success) {
        setIsExtended(true);
        setEffectiveEndTimeMs((prev) =>
          prev != null ? prev + FIVE_MINUTES_MS : prev
        );
        success(res?.message ?? "Session extended by 5 minutes.");
      } else {
        error(res?.message ?? "Failed to extend session.");
      }
    } catch (err) {
      error(err?.data?.message ?? err?.message ?? "Failed to extend session.");
    }
  };

  useEffect(() => {
    if (!isOpen || effectiveEndTimeMs == null) return;
    const interval = setInterval(() => {
      if (Date.now() >= effectiveEndTimeMs) {
        handleEndCall();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, effectiveEndTimeMs, handleEndCall]);

  if (!isOpen || !sessionData) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 bg-gray-800 border-2 border-gray-600 rounded-lg overflow-hidden shadow-2xl ${
        isFullscreen
          ? "w-screen h-screen"
          : "w-[90vw] sm:w-[500px] h-[400px] sm:h-[500px]"
      }`}
      style={{
        left: isFullscreen ? 0 : `${position.x}px`,
        top: isFullscreen ? 0 : `${position.y}px`,
        cursor: isDragging ? "grabbing" : "default",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header - Draggable area */}
      <div className="bg-gray-700 px-4 py-2 flex items-center justify-between cursor-move">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-white text-sm font-medium">Video Call</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEndCall}
          disabled={isLeaving}
          className="w-6 h-6 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLeaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Video Area */}
      <div className="relative w-full h-[calc(100%-120px)] bg-black">
        {/* Show remote user if available, otherwise show local */}
        {remoteUsers.length > 0 ? (
          remoteUsers.map((user) => (
            <div key={user.uid} className="absolute inset-0">
              <div
                ref={(el) => {
                  if (el) {
                    remoteVideoElementsRef.current[user.uid] = el;
                    if (user.videoTrack) {
                      user.videoTrack.play(el);
                    }
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>
          ))
        ) : (
          <VideoParticipant
            name={currentUser?.name || "You"}
            profilePicture={currentUser?.profilePicture}
            videoElementRef={localVideoElementRef}
            isLocal={true}
            isVideoEnabled={isVideoEnabled}
          />
        )}

        {/* Timer */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-1">
          <div className="bg-black/50 px-3 py-2 rounded flex flex-col items-center min-w-[120px]">
            <VideoTimer startTime={callStartTime} />
            <div className="text-[10px] sm:text-xs text-gray-400 mt-1.5 flex flex-col items-center gap-0.5">
              <span>
                Start: {sessionStartTime ? utcISOToLocalTimeDisplay(sessionStartTime) : "—"}
              </span>
              <span>
                End: {effectiveEndTimeMs != null ? formatMsToTimeDisplay(effectiveEndTimeMs) : "—"}
              </span>
            </div>
          </div>
          {isExtended && (
            <span className="text-green-400 font-bold text-sm sm:text-base bg-green-500/20 px-2 py-0.5 rounded">
              5+ extended
            </span>
          )}
        </div>

        {/* Controls */}
        <VideoControls
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          onToggleVideo={toggleVideo}
          onToggleAudio={toggleAudio}
          onEndCall={handleEndCall}
          onSettings={handleSettings}
          onFullscreen={handleFullscreen}
          onParticipants={handleParticipants}
          onExtendCall={handleExtendCall}
          isExtended={isExtended}
          isExtending={isExtending}
          isLeaving={isLeaving}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-gray-700 px-4 py-2 text-xs text-gray-300 flex items-center justify-between">
        <span>{sessionData?.channelName || "Connecting..."}</span>
        <span className={isJoined ? "text-green-400" : "text-yellow-400"}>
          {isJoined ? "Connected" : "Connecting..."}
        </span>
      </div>
    </div>
  );
}

export default VideoContainer;

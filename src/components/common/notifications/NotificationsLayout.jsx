"use client";
import React, { useState, useEffect } from "react";
import SmallPageInfo from "../SmallPageInfo";
import AllNotifications from "./AllNotifications";
import { useGetNotificationsQuery } from "@/redux/Apis/noticationApi/notificationApi";
import { socket } from "@/socket/socket";
import { getCookie } from "@/utils/cookies";

function NotificationsLayout() {
  const [page, setPage] = useState(1);
  const limit = 10;

  // Use useState to ensure stable values and prevent dependency array size changes
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  // Read cookies once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(getCookie("userRole") || "");
      setCurrentUserId(getCookie("user_id") || "");
    }
  }, []);

  const roleWiseEndpoint =
    userRole === "admin" || userRole === "super_admin" ? "/admin-all" : "";

  const {
    data: notificationsData,
    isLoading: isNotificationsLoading,
    refetch,
  } = useGetNotificationsQuery({
    page,
    limit,
    roleWiseEndpoint,
  });

  useEffect(() => {
    // Guard against SSR
    if (typeof window === "undefined") return;
    if (!userRole && !currentUserId) return; // Wait for cookies to be available

    socket.connect();

    const handleNotification = () => {
      // Refetch notifications immediately when a new one arrives
      refetch();
    };

    const eventName =
      userRole === "admin" || userRole === "super_admin"
        ? "notification"
        : `notification::${currentUserId}`;

    socket.on(eventName, handleNotification);

    return () => {
      socket.off(eventName, handleNotification);
      socket.disconnect();
    };
  }, [refetch, currentUserId, userRole]);

  const notifications = notificationsData?.data || [];
  const meta = notificationsData?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 1,
  };
  return (
    <div className="space-y-4">
      <SmallPageInfo
        title="Notifications"
        description="Here is an overview of your notifications"
      />
      <AllNotifications
        notifications={notifications}
        userRole={userRole}
        isLoading={isNotificationsLoading}
        meta={meta}
        page={page}
        setPage={setPage}
      />
    </div>
  );
}

export default NotificationsLayout;

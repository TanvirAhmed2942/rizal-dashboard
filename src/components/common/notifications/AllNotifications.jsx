import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";
import { TbBellRinging2 } from "react-icons/tb";
import { HiOutlineBell } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import {
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/redux/Apis/noticationApi/notificationApi";
import useToast from "@/hooks/useToast";
import formatTimeAgo from "@/utils/FormatDate/xtimesAgo";
import { Loader } from "lucide-react";

function AllNotifications({
  notifications = [],
  isLoading = false,
  meta = {},
  page = 1,
  setPage,
  userRole,
}) {
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAllAsRead }] =
    useMarkAllAsReadMutation();
  const [markingNotificationId, setMarkingNotificationId] = useState(null);
  const toast = useToast();

  const rawList = notifications?.result ?? [];
  const displayList = rawList;

  const totalPages = meta?.totalPage || 1;
  const total = meta?.total || 0;

  const handleMarkAsRead = async (notificationId) => {
    try {
      setMarkingNotificationId(notificationId);
      const response = await markAsRead(notificationId).unwrap();
      if (response?.success) {
        toast.success(response.message || "Notification marked as read");
      }
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to mark notification as read";
      toast.error(errorMessage);
    } finally {
      setMarkingNotificationId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllAsRead().unwrap();
      if (response?.success) {
        toast.success(response.message || "All notifications marked as read");
      }
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to mark all notifications as read";
      toast.error(errorMessage);
    }
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePageClick = (pageNum) => {
    setPage(pageNum);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (isLoading) {
    return (
      <Card className="bg-transparent min-h-[calc(100vh-11.5rem)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TbBellRinging2 size={20} />
            All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent min-h-[calc(100vh-11.5rem)] ">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TbBellRinging2 size={20} />
          All Notifications
        </CardTitle>
        <CardAction>
          <Button
            className=""
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllAsRead || displayList.length === 0}
          >
            {isMarkingAllAsRead ? (
              <>
                Marking...{" "}
                <Loader className="w-4 h-4 animate-spin text-primary" />
              </>
            ) : (
              "Mark all as read"
            )}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayList.length > 0 ? (
          <>
            {displayList.map((notification) => (
              <div
                key={notification?._id}
                className={`flex items-start md:items-center justify-between gap-2 border bg-white p-2 rounded-lg ${
                  !notification?.isRead ? "border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <HiOutlineBell size={20} className="mt-1" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      {notification?.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(notification?.createdAt)}
                    </p>
                  </div>
                </div>

                {!notification?.isRead &&
                  userRole !== "admin" &&
                  userRole !== "super_admin" && (
                    <Button
                      variant="outline"
                      className="bg-white"
                      onClick={() => handleMarkAsRead(notification?._id)}
                      disabled={markingNotificationId === notification?._id}
                    >
                      {markingNotificationId === notification?._id ? (
                        <>
                          Marking...{" "}
                          <Loader className="w-4 h-4 animate-spin text-primary" />
                        </>
                      ) : (
                        "Mark as read"
                      )}
                    </Button>
                  )}
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                >
                  Previous
                </Button>

                {getPageNumbers().map((pageNum, index) =>
                  pageNum === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-gray-500"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageClick(pageNum)}
                      className="min-w-[40px]"
                    >
                      {pageNum}
                    </Button>
                  ),
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">No notifications found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AllNotifications;

// <div className="flex items-center gap-2">
//   <div className="w-3 h-3 rounded-full bg-green-500"></div>
//   <p className="bg-white p-2 rounded-lg">You have a new notification</p>
// </div>;

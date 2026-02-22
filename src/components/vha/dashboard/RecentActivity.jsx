"use client";
import React, { useMemo } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LuActivity } from "react-icons/lu";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { TiUser } from "react-icons/ti";
import formatTimeAgo from "@/utils/FormatDate/xtimesAgo";

function RecentActivity({ recentActivityData }) {
  const recentActivity = useMemo(() => {
    const list = recentActivityData ?? [];
    const sorted = [...list].sort((a, b) => {
      const t1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const t2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return t2 - t1;
    });
    return sorted.map((activity) => ({
      title: activity.title,
      user: activity.userId?.fullName,
      timeAgo: formatTimeAgo(activity.createdAt),
      viewLink: `/vha/task/${activity.taskId}`,
      status: activity.status,
    }));
  }, [recentActivityData]);
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LuActivity size={20} />
          Recent Activity
        </CardTitle>
        <CardAction
          className="font-semibold underline text-sky-500 cursor-pointer"
          onClick={() => router.push("/bha/tasks-and-goals")}
        >
          View All
        </CardAction>
      </CardHeader>
      <CardContent>
        {recentActivity.length > 0 ? (
          recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4  bg-gray-100 rounded-lg mb-2 px-4 py-2"
            >
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="flex flex-col items-start gap-1  ">
                  <div>
                    <h3 className="flex items-center  gap-2">
                      <TiUser size={15} className="text-gray-500 mt-0.5" />
                      {activity.user}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <p className="text-sm ">{activity.title}</p>•
                      <p className="text-sm ">{activity.timeAgo}</p>
                    </div>
                  </div>
                </div>
              </div>
              <Badge
                className={`${
                  activity.status.toLowerCase() === "completed"
                    ? "bg-green-500 text-white"
                    : activity.status.toLowerCase() === "pending"
                      ? "bg-yellow-500 text-white"
                      : activity.status.toLowerCase() === "overdue"
                        ? "bg-red-500 text-white"
                        : "bg-gray-500 text-white"
                }`}
              >
                {activity.status}
              </Badge>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <p className="text-sm">No recent activity found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentActivity;

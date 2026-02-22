"use client";
import React from "react";
import { LuUserRound } from "react-icons/lu";
import { CardSection } from "../../common/Card";
import RecentActivity from "./RecentActivity";
import TodaysSession from "./TodaysSession";
import SmallPageInfo from "@/components/common/SmallPageInfo";
import { useGetBhaDashboardDataQuery } from "@/redux/Apis/bha/dashboard/bhadashboard";

function VhaDashboard() {
  const { data: bhaDashboardData, isLoading } = useGetBhaDashboardDataQuery();
  console.log("bhaDashboardData:", bhaDashboardData?.data);

  const statsData = {
    totalClients: bhaDashboardData?.data?.totalClient,
    upcomingSessions: bhaDashboardData?.data?.totalUpcomingSession,
    overdueTasks: bhaDashboardData?.data?.totalOverdueTask,
    totalTasks: bhaDashboardData?.data?.totalTaskCount,
  };

  const recentActivityData = bhaDashboardData?.data?.recentTaskActivity || [];
  const todaysSessionData = bhaDashboardData?.data?.todaySession || [];
  console.log("todaysSessionData:", todaysSessionData);

  const vhaCards = [
    {
      title: "Total Clients",
      value: statsData?.totalClients,
      icon: <LuUserRound size={20} />,
      status: "Added 4 New Last Week",
    },
    {
      title: "Upcoming Sessions",
      value: statsData?.upcomingSessions,
      icon: <LuUserRound size={20} />,
      status: "Added 4 New Last Week",
    },

    {
      title: "Overdue Task",
      value: statsData?.overdueTasks,
      icon: <LuUserRound size={20} />,
      status: "Added 4 New Last Week",
    },
    {
      title: "Total Tasks",
      value: statsData?.totalTasks,
      icon: <LuUserRound size={20} />,
      goto: "Added 4 New Last Week",
      underline: true,
    },
  ];
  return (
    <div className="space-y-4">
      <SmallPageInfo
        title="Welcome Back !"
        description="Here is an overview of your store"
      />
      <CardSection cards={vhaCards} footer={false} />
      <ActivitySection
        recentActivityData={recentActivityData}
        todaysSessionData={todaysSessionData}
      />
      {/* <PrioritySection /> */}
    </div>
  );
}

export default VhaDashboard;

const ActivitySection = ({ recentActivityData, todaysSessionData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
      <RecentActivity recentActivityData={recentActivityData} />
      <TodaysSession sessionData={todaysSessionData} />
    </div>
  );
};

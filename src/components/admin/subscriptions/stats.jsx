import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

function Stats({ plans = [] }) {
  const totalActivePlans = plans.filter((p) => Boolean(p.status ?? p.isActive)).length;
  const totalSubscribers = plans.reduce(
    (sum, p) => sum + (p.activeUsers ?? p.scheduleBookingCount ?? 0),
    0,
  );
  const monthlyRevenue = plans.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (p.activeUsers ?? p.scheduleBookingCount ?? 0),
    0,
  );

  const stats = [
    { title: "Total Active Plans", value: totalActivePlans },
    { title: "Total Subscribers", value: totalSubscribers },
    { title: "Monthly Revenue", value: `$${monthlyRevenue.toLocaleString()}` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 w-full md:w-auto lg:w-1/2">
      {stats.map((stat) => (
        <Card key={stat.title} className="border border-cyan-500">
          <CardHeader>
            <CardTitle>{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default Stats;

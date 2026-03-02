import React from "react";
import { Card } from "@/components/ui/card";
import { CardHeader, CardContent } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";

function Stats() {
  const stats = [
    {
      title: "Total Active Plans",
      value: 4,
    },
    {
      title: "Total Subscribers",
      value: 4,
    },
    {
      title: "Monthly Revenue",
      value: "$1000",
    },
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

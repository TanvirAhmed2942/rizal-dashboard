"use client";
import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IoNotificationsOutline } from "react-icons/io5";
import { Trash2 } from "lucide-react";

const PrioritySection = ({ pathname }) => {
  const notifications = [
    {
      subscriberName: "Jordan",
      appointmentType: "FIRST consultation",
      date: "Fri, 12:30pm",
    },
    {
      subscriberName: "Sarah",
      appointmentType: "FOLLOW-UP consultation",
      date: "Sat, 2:00pm",
    },
    {
      subscriberName: "Michael",
      appointmentType: "FIRST consultation",
      date: "Sun, 10:15am",
    },
    {
      subscriberName: "Emily",
      appointmentType: "REGULAR consultation",
      date: "Mon, 3:45pm",
    },
  ];

  const handleDelete = (index) => {
    console.log("Delete notification:", index);
    // Handle delete logic here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IoNotificationsOutline />
          <span>Priority</span>
        </CardTitle>
        <CardAction>
          <p className="font-semibold text-sky-500 underline cursor-pointer">
            View All
          </p>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className="flex items-center gap-4 bg-blue-50 rounded-lg p-4"
          >
            {/* Blue square icon with bell */}
            <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <IoNotificationsOutline className="text-white" size={24} />
            </div>

            {/* Notification text */}
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">
                You have been assigned to a new subscriber,{" "}
                <span className="font-medium">
                  {notification.subscriberName}
                </span>{" "}
                for their{" "}
                <span className="font-semibold uppercase">
                  {notification.appointmentType}
                </span>{" "}
                appointment on
              </p>
              <p className="text-sm text-gray-500 mt-1">{notification.date}</p>
            </div>

            {/* Delete icon */}
            <button
              onClick={() => handleDelete(index)}
              className="flex-shrink-0 w-8 h-8 border border-red-500 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
              aria-label="Delete notification"
            >
              <Trash2 className="text-red-500" size={16} />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PrioritySection;

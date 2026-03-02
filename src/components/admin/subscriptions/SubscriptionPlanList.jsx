"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const MOCK_PLANS = [
  {
    id: "PLN-01",
    name: "Ignite",
    duration: "1 month",
    price: "69",
    features: "Initial consultation with dedicated coach, personalized plan...",
    activeUsers: 12,
    status: true,
  },
  {
    id: "PLN-02",
    name: "Accelerate",
    duration: "1 month",
    price: "149",
    features: "Initial consultation with dedicated coach, personalized plan...",
    activeUsers: 12,
    status: true,
  },
  {
    id: "PLN-03",
    name: "Ascend",
    duration: "1 month",
    price: "269",
    features: "Initial consultation with dedicated coach, personalized plan...",
    activeUsers: 12,
    status: true,
  },
  {
    id: "PLN-04",
    name: "Elevate",
    duration: "1 month",
    price: "429",
    features: "Initial consultation with dedicated coach, personalized plan...",
    activeUsers: 12,
    status: true,
  },
];

function SubscriptionPlanList({ onEdit }) {
  const [plans, setPlans] = useState(MOCK_PLANS);

  const handleStatusToggle = (planId) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, status: !p.status } : p)),
    );
  };

  const handleEdit = (plan) => {
    onEdit?.(plan);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">
        Subscription Plan List
      </h1>
      <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-200">
              <TableHead className="text-gray-700 font-medium">
                Plan ID
              </TableHead>
              <TableHead className="text-gray-700 font-medium">
                Plan Name
              </TableHead>
              <TableHead className="text-gray-700 font-medium">
                Duration
              </TableHead>
              <TableHead className="text-gray-700 font-medium">Price</TableHead>
              <TableHead className="text-gray-700 font-medium">
                Features
              </TableHead>
              <TableHead className="text-gray-700 font-medium">
                Active User
              </TableHead>
              <TableHead className="text-gray-700 font-medium">
                Status
              </TableHead>
              <TableHead className="text-gray-700 font-medium text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow
                key={plan.id}
                className="border-b border-gray-100 hover:bg-gray-50/50"
              >
                <TableCell className="text-gray-900 font-medium">
                  {plan.id}
                </TableCell>
                <TableCell className="text-gray-900">{plan.name}</TableCell>
                <TableCell className="text-gray-600">{plan.duration}</TableCell>
                <TableCell className="text-gray-900">{plan.price}</TableCell>
                <TableCell className="text-gray-600 max-w-[200px] truncate">
                  {plan.features}
                </TableCell>
                <TableCell className="text-gray-600">
                  {plan.activeUsers}
                </TableCell>
                <TableCell>
                  <Switch
                    className="data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-gray-300"
                    checked={plan.status}
                    onCheckedChange={() => handleStatusToggle(plan.id)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={() => handleEdit(plan)}
                    className="text-amber-600 hover:text-amber-700 underline font-medium text-sm"
                  >
                    Edit
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default SubscriptionPlanList;

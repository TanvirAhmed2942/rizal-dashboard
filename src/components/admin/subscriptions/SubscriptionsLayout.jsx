"use client";

import SmallPageInfo from "@/components/common/SmallPageInfo";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { HiPlus } from "react-icons/hi";
import Stats from "./stats";
import SubscriptionPlanList from "./SubscriptionPlanList";
import TransactionList from "./TransactionList";
import SubscriptionAddEditModal from "./SubscriptionAddEditModa";

function SubscriptionsLayout() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const handleAddPlan = useCallback(() => {
    setEditingPlan(null);
    setModalOpen(true);
  }, []);

  const handleEditPlan = useCallback((plan) => {
    setEditingPlan(plan);
    setModalOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 items-start justify-between">
        <SmallPageInfo
          title="Subscriptions"
          description="create, edit, and manage your subscriptions"
        />
        <Button onClick={handleAddPlan}>
          <HiPlus size={15} /> Add New Plan
        </Button>
      </div>
      <Stats />
      <SubscriptionPlanList onEdit={handleEditPlan} />
      <TransactionList />
      <SubscriptionAddEditModal
        openModal={modalOpen}
        setOpenModal={(open) => {
          setModalOpen(open);
          if (!open) setEditingPlan(null);
        }}
        planData={editingPlan}
      />
    </div>
  );
}

export default SubscriptionsLayout;

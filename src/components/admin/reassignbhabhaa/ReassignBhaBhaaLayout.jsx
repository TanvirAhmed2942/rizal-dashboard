"use client";

import React, { useState } from "react";
import SmallPageInfo from "@/components/common/SmallPageInfo";
import AssignRequestTable from "./AssignRequestTable";
import RequestApporveModal from "./RequestApporveModal";
import { useApproveRequestForAssignReassignMutation } from "@/redux/Apis/admin/assignreassignApi/assignreassingApi";
import useToast from "@/hooks/useToast";

function ReassignBhaBhaaLayout({ type = "user-requested" }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approveRequest, { isLoading: isAssigning }] =
    useApproveRequestForAssignReassignMutation();
  const { success, error: showError } = useToast();

  const getTitle = () => {
    if (type === "user-requested") {
      return "User Requested BHA & BHAA";
    }
    return "Admin By Assign";
  };

  const getDescription = () => {
    if (type === "user-requested") {
      return "Displays all reassignment requests submitted by users.";
    }
    return "Displays all BHA & BHAA assignments/reassignments performed directly by admins.";
  };

  const handleAssignClick = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleModalAssign = async (request, selectedPerson) => {
    const id = request?._id;
    const assignId = selectedPerson?._id;
    if (!id || !assignId) {
      showError("Please select a person to assign.");
      return;
    }
    try {
      const res = await approveRequest({ id, assignId }).unwrap();
      if (res?.success) {
        success(res?.message ?? "Assigned successfully.");
        setModalOpen(false);
        setSelectedRequest(null);
      } else {
        showError(res?.message ?? "Failed to assign.");
      }
    } catch (err) {
      showError(err?.data?.message ?? err?.message ?? "Failed to assign.");
    }
  };

  return (
    <div className="space-y-4">
      <SmallPageInfo
        title={getTitle()}
        description={getDescription()}
      />
      <AssignRequestTable onAssign={handleAssignClick} type={type} />
      <RequestApporveModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        request={selectedRequest}
        onAssign={handleModalAssign}
        isLoading={isAssigning}
      />
    </div>
  );
}

export default ReassignBhaBhaaLayout;

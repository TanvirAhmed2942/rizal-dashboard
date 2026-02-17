"use client";

import React, { useState } from "react";
import SmallPageInfo from "@/components/common/SmallPageInfo";
import AdminManagementTable from "./AdminManagementTable";
import AdminAddModal from "./AdminAddModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { HiPlus } from "react-icons/hi";
import { useGetAdminManagementDataQueryQuery } from "@/redux/Apis/admin/adminmanagementApi/adminmanagementApi";
import { useCreateAdminMutation } from "@/redux/Apis/admin/adminmanagementApi/adminmanagementApi";
import useToast from "@/hooks/useToast";
import { getCookie } from "@/utils/cookies";
function AdminManagementLayout() {
  const currentUserRole = getCookie("userRole");
  const isSuperAdmin = currentUserRole === "super_admin";

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [createAdmin, { isLoading: isCreatingAdmin }] =
    useCreateAdminMutation();
  const { success, error } = useToast();
  const { data: adminManagementData, isLoading: isAdminManagementLoading } =
    useGetAdminManagementDataQueryQuery({ page: 1, limit: 10 });
  const admins = adminManagementData?.data || [];
  const handleAddAdmin = async (data) => {
    try {
      await createAdmin(data).unwrap();
      success("Admin added successfully");
      setAddModalOpen(false);
    } catch (err) {
      error(err?.data?.message || err?.message || "Error adding admin");
    }
  };

  const paginationMeta = adminManagementData?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 1,
  };

  const totalAdmins = paginationMeta.total ?? admins.length;
  const canAddAdmin = totalAdmins < 5;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 items-start justify-between">
        <SmallPageInfo
          title="Admin Management"
          description="Here is an overview of your admin management"
        />
        {canAddAdmin && isSuperAdmin && (
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button type="button">
                <HiPlus /> Add Admin
              </Button>
            </DialogTrigger>
            <AdminAddModal
              onOpenChange={setAddModalOpen}
              onSubmit={handleAddAdmin}
              isSubmitting={isCreatingAdmin}
            />
          </Dialog>
        )}
      </div>
      <AdminManagementTable
        admins={admins}
        paginationMeta={paginationMeta}
        isLoading={isAdminManagementLoading}
      />
    </div>
  );
}

export default AdminManagementLayout;

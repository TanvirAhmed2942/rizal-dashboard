"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scrollbar } from "@radix-ui/react-scroll-area";

import { HiOutlineRectangleStack } from "react-icons/hi2";
import CommonuserModal from "@/components/common/commonusermodal/CommonuserModal";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import formatDate from "@/utils/FormatDate/formatDate";
import { useBlockUserMutation } from "@/redux/Apis/admin/usermanagementApi/usermanagementApi";
import useToast from "@/hooks/useToast";
export function ClinetStatusOverview({ userInfoData }) {
  const router = useRouter();
  const toast = useToast();
  const [openModal, setOpenModal] = useState(false);
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [selectedClient, setSelectedClient] = useState(null);
  const [blockingUserId, setBlockingUserId] = useState(null);

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedClient(null);
  };
  const handleViewAll = () => {
    router.push("/admin/client-management");
  };
  const handleBlockUser = async (client) => {
    const userId = client._id || client.id;
    setBlockingUserId(userId);
    try {
      const response = await blockUser({ id: userId }).unwrap();
      if (response?.success) {
        // isActive: true = user is active, we're blocking them
        // isActive: false = user is blocked, we're unblocking them
        const isCurrentlyActive =
          client.isActive !== undefined
            ? client.isActive === true
            : client.status === true;
        toast.success(
          isCurrentlyActive
            ? "User blocked successfully"
            : "User unblocked successfully",
        );
      } else {
        toast.error(response?.message || "Failed to update user status");
      }
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to update user status",
      );
    } finally {
      setBlockingUserId(null);
    }
  };
  return (
    <>
      <ScrollArea className="w-full rounded-md border whitespace-nowrap">
        <Table className="bg-white">
          <TableHeader>
            <TableRow>
              <TableHead colSpan={6} className="py-2">
                <div className="flex items-center w-full justify-between">
                  <div className="flex items-center gap-2">
                    <HiOutlineRectangleStack size={20} />
                    <p className="text-sm font-medium">User Status Overview</p>
                  </div>
                  <p
                    className="font-semibold text-normal text-orange-500 underline cursor-pointer"
                    onClick={() => handleViewAll()}
                  >
                    View All
                  </p>
                </div>
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="w-1/6">Client Name</TableHead>
              <TableHead className="w-1/6">Role</TableHead>
              <TableHead className="w-1/6">Join Date</TableHead>
              <TableHead className="w-1/6">Status</TableHead>
              <TableHead className="w-1/6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userInfoData && userInfoData.length > 0 ? (
              userInfoData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium w-1/6">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-9">
                        <AvatarImage
                          src={
                            data.profilePicture ||
                            "https://github.com/shadcn.png"
                          }
                        />
                        <AvatarFallback>
                          {data.fullName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "CN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {data.fullName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {data.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="w-1/6">{data.role}</TableCell>
                  <TableCell className="w-1/6">
                    {formatDate(data.joinedOn)}
                  </TableCell>
                  <TableCell className="w-1/6">
                    <p
                      className={`${
                        data.status === true
                          ? "bg-lime-500/50 text-black"
                          : "bg-red-500/50 text-white"
                      } px-2 py-1 rounded-full text-center font-medium text-xs inline-block w-20  shadow-md`}
                    >
                      {data.status === true ? "Active" : "Inactive"}
                    </p>
                  </TableCell>

                  <TableCell className="w-auto flex justify-end gap-2 text-right ">
                    <Button
                      variant="outline"
                      className="border border-gray-400 h-8"
                      onClick={() => handleViewDetails(data)}
                    >
                      Details
                    </Button>
                    {(() => {
                      // isActive: true = user is active, show Block button
                      // isActive: false = user is blocked, show Unblock button
                      const isActive =
                        data.isActive !== undefined
                          ? data.isActive === true
                          : data.status === true;
                      const userId = data._id || data.id;
                      const isCurrentlyBlocking = blockingUserId === userId;
                      return (
                        <Button
                          variant="outline"
                          className={
                            isActive
                              ? "border border-red-400 h-8 text-red-500"
                              : "border border-lime-500 h-8 text-lime-600"
                          }
                          onClick={() => handleBlockUser(data)}
                          disabled={isCurrentlyBlocking}
                        >
                          {isCurrentlyBlocking ? (
                            isActive ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Loader className="w-4 h-4 animate-spin" />
                            )
                          ) : isActive ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </Button>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  No user data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter></TableFooter>
        </Table>
        <Scrollbar orientation="horizontal" className="h-2 w-full" />
      </ScrollArea>
      <CommonuserModal
        openModal={openModal}
        setOpenModal={handleCloseModal}
        title="View Details"
        onSave={null}
      >
        <ClientDetailsModal selectedClient={selectedClient} />
      </CommonuserModal>
    </>
  );
}

export default ClinetStatusOverview;

export const ClientDetailsModal = ({ selectedClient }) => {
  if (!selectedClient) return null;

  const getInitials = (name) => {
    if (!name) return "CN";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formattedDate = formatDate(selectedClient.joinedOn);

  const statusText = selectedClient.status === true ? "Active" : "Inactive";
  const statusClass =
    selectedClient.status === true
      ? "bg-lime-500/50 text-black"
      : "bg-red-500/50 text-white";

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="flex flex-col items-center gap-4">
        <Avatar className="size-24">
          <AvatarImage
            src={
              selectedClient.profilePicture || "https://github.com/shadcn.png"
            }
          />
          <AvatarFallback>
            {getInitials(selectedClient.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-1">
          <p className="text-xl font-bold text-gray-900">
            {selectedClient.fullName || "N/A"}
          </p>
          <p className="text-sm text-gray-500">
            {selectedClient.email || "N/A"}
          </p>
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-4">
        {/* Role */}
        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">Role:</span>
          <span className="text-sm font-semibold text-gray-900">
            {selectedClient.role || "N/A"}
          </span>
        </div>

        {/* Join Date */}
        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">Join Date:</span>
          <span className="text-sm font-semibold text-gray-900">
            {formattedDate}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">Status:</span>
          <span
            className={`${statusClass} px-2 py-1 rounded-full text-center font-medium text-xs inline-block w-20 shadow-md`}
          >
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
};

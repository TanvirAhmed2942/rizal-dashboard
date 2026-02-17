"use client";
import React, { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import formatDate from "@/utils/FormatDate/formatDate";
import CommonuserModal from "@/components/common/commonusermodal/CommonuserModal";
import { ClientDetailsModal } from "../dashboard/ClinetStatusOverview";
import {
  useBlockUserMutation,
  useDeleteUserMutation,
} from "@/redux/Apis/admin/usermanagementApi/usermanagementApi";
import useToast from "@/hooks/useToast";
import { Loader } from "lucide-react";
import { useCallback } from "react";
// import Loader from "@/components/common/loader/Loader";

function ClientManagementTable({
  userInfoData = [],
  isLoading = false,
  paginationMeta = { page: 1, limit: 10, total: 0, totalPage: 1 },
  currentPage = 1,
  setCurrentPage,
}) {
  const toast = useToast();
  const [blockUser] = useBlockUserMutation();
  const [deleteUser, { isLoading: isDeleteLoading }] = useDeleteUserMutation();
  const [blockingUserId, setBlockingUserId] = useState(null);

  const getInitials = (name) => {
    if (!name) return "CN";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  const [openModal, setOpenModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedClient(null);
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

  const handleDeleteUser = useCallback(
    async (id) => {
      try {
        await deleteUser({ id }).unwrap();
        toast.success("User deleted successfully");
        setOpenModal(false);
      } catch (error) {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "An error occurred while deleting user. Please try again.";
        toast.error(errorMessage);
        console.error("Delete user error:", error);
      }
    },
    [deleteUser, toast],
  );

  const renderPaginationButtons = () => {
    const { totalPage } = paginationMeta;
    const buttons = [];

    if (totalPage <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPage; i++) {
        buttons.push(
          <Button
            key={i}
            variant="outline"
            className={`h-8 w-8 ${
              currentPage === i
                ? "bg-black text-white border-black"
                : "bg-gray-100 text-gray-600 border-gray-300"
            }`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </Button>,
        );
      }
    } else {
      // Show first page
      buttons.push(
        <Button
          key={1}
          variant="outline"
          className={`h-8 w-8 ${
            currentPage === 1
              ? "bg-black text-white border-black"
              : "bg-gray-100 text-gray-600 border-gray-300"
          }`}
          onClick={() => setCurrentPage(1)}
        >
          1
        </Button>,
      );

      // Show ellipsis and pages around current page
      if (currentPage > 3) {
        buttons.push(
          <span key="ellipsis1" className="px-2 text-gray-600">
            ...
          </span>,
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPage - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPage) {
          buttons.push(
            <Button
              key={i}
              variant="outline"
              className={`h-8 w-8 ${
                currentPage === i
                  ? "bg-black text-white border-black"
                  : "bg-gray-100 text-gray-600 border-gray-300"
              }`}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </Button>,
          );
        }
      }

      if (currentPage < totalPage - 2) {
        buttons.push(
          <span key="ellipsis2" className="px-2 text-gray-600">
            ...
          </span>,
        );
      }

      // Show last page
      if (totalPage > 1) {
        buttons.push(
          <Button
            key={totalPage}
            variant="outline"
            className={`h-8 w-8 ${
              currentPage === totalPage
                ? "bg-black text-white border-black"
                : "bg-gray-100 text-gray-600 border-gray-300"
            }`}
            onClick={() => setCurrentPage(totalPage)}
          >
            {totalPage}
          </Button>,
        );
      }
    }

    return buttons;
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="w-full rounded-md border whitespace-nowrap">
        <Table className="bg-white">
          <TableHeader>
            <TableRow className="bg-gray-200">
              <TableHead className="w-1/6">User Name</TableHead>
              <TableHead className="w-1/6">Role</TableHead>
              <TableHead className="w-1/6">Joined Date</TableHead>
              <TableHead className="w-1/6">Status</TableHead>
              <TableHead className="w-1/6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : userInfoData && userInfoData.length > 0 ? (
              userInfoData.map((data, index) => {
                // isActive: true = user is active, show Block button
                // isActive: false = user is blocked, show Unblock button
                const isActive =
                  data.isActive !== undefined
                    ? data.isActive === true
                    : data.status === true;
                const userId = data._id || data.id;
                const isCurrentlyBlocking = blockingUserId === userId;

                return (
                  <TableRow key={userId || index}>
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
                            {getInitials(data.fullName)}
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
                    <TableCell className="w-1/6">
                      {data.role?.charAt(0).toUpperCase() +
                        data.role?.slice(1) || "N/A"}
                    </TableCell>
                    <TableCell className="w-1/6">
                      {formatDate(data.joinedOn)}
                    </TableCell>
                    <TableCell className="w-1/6">
                      <p
                        className={`${
                          isActive
                            ? "bg-lime-500/50 text-black"
                            : "bg-red-500/50 text-white"
                        } px-2 py-1 rounded-full text-center font-medium text-xs inline-block w-20`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </p>
                    </TableCell>
                    <TableCell className="w-1/6 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          className="border border-gray-400 h-8"
                          onClick={() => handleViewDetails(data)}
                        >
                          Details
                        </Button>
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
                        <Button
                          variant="outline"
                          className="border border-red-400 h-8 text-red-500"
                          onClick={() => handleDeleteUser(data.id)}
                          disabled={isDeleteLoading}
                        >
                          {isDeleteLoading ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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

      {/* Pagination */}
      {paginationMeta.totalPage > 1 && (
        <div className="flex items-center justify-center gap-2 py-4 border-t">
          <Button
            variant="outline"
            className="bg-gray-100 text-gray-600 border-gray-300 h-8"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {renderPaginationButtons()}
          </div>
          <Button
            variant="outline"
            className="bg-black text-white border-black hover:bg-black/80 h-8"
            disabled={currentPage === paginationMeta.totalPage}
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(paginationMeta.totalPage, prev + 1),
              )
            }
          >
            Next
          </Button>
        </div>
      )}

      <CommonuserModal
        openModal={openModal}
        setOpenModal={handleCloseModal}
        title="View Details"
        onSave={null}
      >
        <ClientDetailsModal selectedClient={selectedClient} />
      </CommonuserModal>
    </div>
  );
}

export default ClientManagementTable;

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
import { Loader } from "lucide-react";
import formatDate from "@/utils/FormatDate/formatDate";
import { getImageUrl } from "@/utils/getImageUrl";
import { useBlockBhaaMutation } from "@/redux/Apis/admin/bhaamanagementApi/bhaamanagementApi";
import useToast from "@/hooks/useToast";
import CommonuserModal from "@/components/common/commonusermodal/CommonuserModal";
import { ClientDetailsModal } from "../dashboard/ClinetStatusOverview";
import { GrGroup } from "react-icons/gr";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function BhaaTable({
  bhaaInfoData = [],
  isLoading = false,
  paginationMeta = { page: 1, limit: 10, total: 0, totalPage: 1 },
  currentPage = 1,
  setCurrentPage,
}) {
  const toast = useToast();
  const [blockBhaa] = useBlockBhaaMutation();
  const [blockingUserId, setBlockingUserId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedBhaa, setSelectedBhaa] = useState(null);

  const handleViewDetails = (bhaa) => {
    setSelectedBhaa(bhaa);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBhaa(null);
  };

  const getInitials = (name) => {
    if (!name) return "BA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleBlockUser = async (user) => {
    const userId = user.id;
    setBlockingUserId(userId);
    try {
      const response = await blockBhaa({ id: userId }).unwrap();
      if (response?.success) {
        const isCurrentlyActive = user.status === true;
        toast.success(
          isCurrentlyActive
            ? "BHAA blocked successfully"
            : "BHAA unblocked successfully",
        );
      } else {
        toast.error(response?.message || "Failed to update BHAA status");
      }
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to update BHAA status",
      );
    } finally {
      setBlockingUserId(null);
    }
  };

  const renderPaginationButtons = () => {
    const { totalPage } = paginationMeta;
    const buttons = [];

    if (totalPage <= 7) {
      for (let i = 1; i <= totalPage; i++) {
        buttons.push(
          <Button
            key={i}
            variant="outline"
            className={`h-8 w-8 ${
              currentPage === i
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-gray-100 text-gray-600 border-gray-300"
            }`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </Button>,
        );
      }
    } else {
      buttons.push(
        <Button
          key={1}
          variant="outline"
          className={`h-8 w-8 ${
            currentPage === 1
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-gray-100 text-gray-600 border-gray-300"
          }`}
          onClick={() => setCurrentPage(1)}
        >
          1
        </Button>,
      );

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
                  ? "bg-orange-500 text-white border-orange-500"
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

      if (totalPage > 1) {
        buttons.push(
          <Button
            key={totalPage}
            variant="outline"
            className={`h-8 w-8 ${
              currentPage === totalPage
                ? "bg-orange-500 text-white border-orange-500"
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
              <TableHead className="w-1/6">Name</TableHead>
              <TableHead className="w-1/6">Email</TableHead>
              <TableHead className="w-1/6">Address</TableHead>
              <TableHead className="w-1/6">Contact Number</TableHead>
              <TableHead className="w-1/6">Join Date</TableHead>
              <TableHead className="w-1/6">Status</TableHead>
              <TableHead className="w-1/6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : bhaaInfoData && bhaaInfoData.length > 0 ? (
              bhaaInfoData.map((data) => {
                const isActive = data.status === true;
                const isCurrentlyBlocking = blockingUserId === data.id;

                return (
                  <TableRow key={data.id}>
                    <TableCell className="font-medium w-1/6">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-9">
                          <AvatarImage src={getImageUrl(data.profilePicture)} />
                          <AvatarFallback>
                            {getInitials(data.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        {data.fullName}
                      </div>
                    </TableCell>
                    <TableCell className="w-1/6">{data.email}</TableCell>
                    <TableCell className="w-1/6">
                      {data.address || "N/A"}
                    </TableCell>
                    <TableCell className="w-1/6">
                      {data.phone || "N/A"}
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
                        {isActive ? "Active" : "Blocked"}
                      </p>
                    </TableCell>

                    <TableCell className="w-1/6 text-right">
                      <div className="flex gap-2 justify-end">
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
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : isActive ? (
                            "Deactivate"
                          ) : (
                            "Activate"
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
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No BHAA data available
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
            className="bg-orange-500 text-white border-orange-500 hover:bg-orange-600 h-8"
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
        <ClientDetailsModal selectedClient={selectedBhaa} />
      </CommonuserModal>
    </div>
  );
}

export default BhaaTable;

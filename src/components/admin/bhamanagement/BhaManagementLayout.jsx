"use client";
import SearchFilterButton from "@/components/common/SearchFilterButton";
import SmallPageInfo from "@/components/common/SmallPageInfo";
import { Button } from "@/components/ui/button";
import React, { useState, useCallback } from "react";
import { HiPlus } from "react-icons/hi";
import BhaCreateModal from "./BhaCreateModal";
import BhaManagementTable from "./BhaManagementTable";
import { useGetBhaManagementDataQueryQuery } from "@/redux/Apis/admin/bhamanagementApi/bhamanagementApi";

function BhaManagementLayout() {
  const [openBhaCreateModal, setOpenBhaCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const handleOpenModal = useCallback(() => {
    setOpenBhaCreateModal(true);
  }, []);

  const { data: bhaManagementData, isLoading: isBhaManagementLoading } =
    useGetBhaManagementDataQueryQuery({
      page: currentPage,
      limit: limit,
      search: searchText,
      status: statusFilter,
    });

  const bhaInfoData =
    bhaManagementData?.data && bhaManagementData?.data.length > 0
      ? bhaManagementData?.data.map((item) => ({
          id: item._id,
          fullName: item.fullName,
          email: item.email,
          role: item.role,
          status: item.isActive,
          joinedOn: item.createdAt,
          profilePicture: item.profile,
          phone: item.phone,
          address: item.address,
        }))
      : [];

  const paginationMeta = bhaManagementData?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 1,
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 items-start justify-between">
        <SmallPageInfo
          title="BHA Management"
          description="Here is an overview of your BHA management"
        />
        <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
          <Button onClick={handleOpenModal}>
            <HiPlus size={15} /> Create BHA Account
          </Button>
        </div>
      </div>
      <SearchFilterButton
        showAddButton={false}
        selectOptions={["All Status", "Active", "Inactive"]}
        placeholder="Search BHA By Name or Email"
        searchText={searchText}
        setSearchText={handleSearch}
        status={statusFilter}
        setStatus={handleStatusFilter}
      />
      <BhaManagementTable
        bhaInfoData={bhaInfoData}
        isLoading={isBhaManagementLoading}
        paginationMeta={paginationMeta}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <BhaCreateModal
        openModal={openBhaCreateModal}
        setOpenModal={setOpenBhaCreateModal}
      />
    </div>
  );
}

export default BhaManagementLayout;

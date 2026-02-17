"use client";
import SearchFilterButton from "@/components/common/SearchFilterButton";
import SmallPageInfo from "@/components/common/SmallPageInfo";
import { Button } from "@/components/ui/button";
import React, { useState, useCallback } from "react";
import { HiPlus } from "react-icons/hi";
import BhaaCreateModal from "./BhaaCreateModal";
import { useGetBhaaManagementDataQueryQuery } from "@/redux/Apis/admin/bhaamanagementApi/bhaamanagementApi";
import BhaaTable from "./BhaaTable";
function BhaaManagementLayout() {
  const [openBhaaCreateModal, setOpenBhaaCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const { data: bhaaManagementData, isLoading: isBhaaManagementLoading } =
    useGetBhaaManagementDataQueryQuery({
      page: currentPage,
      limit: limit,
      search: searchText,
      status: statusFilter,
    });
  const bhaaInfoData =
    bhaaManagementData?.data && bhaaManagementData?.data.length > 0
      ? bhaaManagementData?.data.map((item) => ({
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
  const paginationMeta = bhaaManagementData?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 1,
  };
  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  const handleOpenModal = useCallback(() => {
    setOpenBhaaCreateModal(true);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <SmallPageInfo
          title="BHAA Management"
          description="Here is an overview of your BHAA management"
        />
        <div className="flex items-center gap-2">
          <Button onClick={handleOpenModal}>
            <HiPlus size={15} /> Create BHAA Account
          </Button>
        </div>
      </div>
      <SearchFilterButton
        showAddButton={false}
        selectOptions={["All Status", "Active", "Inactive"]}
        placeholder="Search BHAA By Name or Email"
        searchText={searchText}
        setSearchText={handleSearch}
        status={statusFilter}
        setStatus={handleStatusFilter}
      />
      <BhaaTable
        bhaaInfoData={bhaaInfoData}
        isLoading={isBhaaManagementLoading}
        paginationMeta={paginationMeta}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <BhaaCreateModal
        openModal={openBhaaCreateModal}
        setOpenModal={setOpenBhaaCreateModal}
      />
    </div>
  );
}

export default BhaaManagementLayout;

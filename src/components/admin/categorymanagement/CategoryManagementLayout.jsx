"use client";
import SmallPageInfo from "@/components/common/SmallPageInfo";
import React, { useState } from "react";
import { HiPlus } from "react-icons/hi";
import { LuPencilLine } from "react-icons/lu";
import { HiTrash } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import SearchFilterButton from "@/components/common/SearchFilterButton";
import Image from "next/image";
import CategoryAddEditModal from "./CategoryAddEditModal";
import {
  useDeleteCategoryMutation,
  useGetCategoryDataQuery,
} from "@/redux/Apis/admin/categoryApi/categoryApi";
import { baseUrl } from "@/redux/store/baseUrl";
import DeleteConfirmationModal from "@/components/common/deleteconfirmation/deleteConfirmationModal";
import useToast from "@/hooks/useToast";

function CategoryManagementLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCategoryData, setEditCategoryData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteCategoryData, setDeleteCategoryData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12);
  const toast = useToast();

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoryDataQuery({ page: currentPage, limit, searchText });
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const handleAddClick = () => {
    setIsEditMode(false);
    setEditCategoryData(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (categoryData) => {
    setIsEditMode(true);
    setEditCategoryData(categoryData);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (categoryData) => {
    setDeleteCategoryData(categoryData);
    setIsDeleteModalOpen(true);
  };

  const handleSearchChange = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCategoryData?._id) return;
    try {
      const response = await deleteCategory({
        id: deleteCategoryData._id,
      }).unwrap();
      if (response?.success) {
        toast.success(response.message || "Category deleted successfully");
      } else {
        toast.error(response?.message || "Failed to delete category");
      }
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to delete category";
      toast.error(errorMessage);
      console.error("Delete category error:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteCategoryData(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SmallPageInfo
          title="Category Management"
          description="Here is an overview of your category management"
        />
        <Button
          className="bg-black hover:bg-black/80 text-white"
          onClick={handleAddClick}
        >
          <HiPlus /> Add Category
        </Button>
      </div>
      <CategorySection
        onEditClick={handleEditClick}
        categoryData={categoryData}
        isLoading={isCategoryLoading}
        paginationMeta={
          categoryData?.meta || { page: 1, limit, total: 0, totalPage: 1 }
        }
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onDeleteClick={handleDeleteClick}
        searchText={searchText}
        onSearchChange={handleSearchChange}
      />
      <CategoryAddEditModal
        openModal={isModalOpen}
        setOpenModal={setIsModalOpen}
        isEdit={isEditMode}
        categoryData={editCategoryData}
      />
      <DeleteConfirmationModal
        openModal={isDeleteModalOpen}
        setOpenModal={setIsDeleteModalOpen}
        body={`Are you sure you want to delete "${
          deleteCategoryData?.name || "this category"
        }"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Category"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default CategoryManagementLayout;

const CategorySection = ({
  onEditClick,
  onDeleteClick,
  categoryData,
  isLoading,
  paginationMeta,
  currentPage,
  setCurrentPage,
  searchText,
  onSearchChange,
}) => {
  const categories = categoryData?.data || [];

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
      // Show first page
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

      // Show last page
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
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <p className="text-lg font-bold">Uploaded Category</p>
      <SearchFilterButton
        showAddButton={false}
        showFilterButton={false}
        searchText={searchText}
        setSearchText={onSearchChange}
        placeholder="Search Category"
      />
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No categories available
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-stretch">
            {categories.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </div>

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
        </>
      )}
    </div>
  );
};

const FALLBACK_IMAGE = "/admin/category/category.png";

const CategoryCard = ({ category, onEditClick, onDeleteClick }) => {
  const [imgError, setImgError] = useState(false);

  const handleEdit = (e) => {
    e.stopPropagation();
    onEditClick(category);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDeleteClick) {
      onDeleteClick(category);
    }
  };

  // Handle image URL - check if it's a full URL or relative path
  const getImageUrl = () => {
    if (!category.image) return "/admin/category/cat_1.ico";

    // If it's already a full URL (http or https), return as is
    if (
      category.image.startsWith("http://") ||
      category.image.startsWith("https://")
    ) {
      return category.image;
    }

    // If it's a relative path, normalize it and prepend the base URL
    // Convert backslashes to forward slashes and ensure it starts with a slash
    let normalizedPath = category.image.replace(/\\/g, "/");
    if (!normalizedPath.startsWith("/")) {
      normalizedPath = "/" + normalizedPath;
    }

    // Construct full URL with base URL
    const apiBaseUrl =
      baseUrl ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://10.10.7.79:3001";
    return `${apiBaseUrl}${normalizedPath}`;
  };

  const imageSrc = imgError ? FALLBACK_IMAGE : getImageUrl();

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md group hover:shadow-lg transition-shadow relative flex flex-col h-full min-h-[220px]">
      {/* Title row: fixed min-height so all cards align; title and actions in one line */}
      <div className="flex items-start justify-end gap-2  shrink-0 ">
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleEdit}
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer p-1"
            aria-label="Edit category"
          >
            <LuPencilLine className="size-4" />
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer p-1"
            aria-label="Delete category"
          >
            <HiTrash className="size-4" />
          </button>
        </div>
      </div>

      {/* Icon area: same height on every card, image centered */}
      <div className="flex-1 flex items-start justify-center w-full py-2 max-h-[7rem] ">
        <Image
          src={imageSrc}
          alt={category.name}
          width={80}
          height={80}
          className="w-20 h-20 object-cover object-center rounded-full mx-auto block"
          onError={() => setImgError(true)}
        />
      </div>
      <div className="flex items-center justify-center">
        <p className="text-md font-semibold">{category.name}</p>
      </div>
    </div>
  );
};

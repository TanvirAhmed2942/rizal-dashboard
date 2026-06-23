"use client";
import { Loader, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useToast from "@/hooks/useToast";
import { useGetAllCategoriesQuery } from "@/redux/Apis/admin/categoryApi/categoryApi";
import {
  useCreateCourseMutation,
  useUpdateCourseMutation,
} from "@/redux/Apis/admin/courseApi/courseApi";

const AddNewMaterialModal = React.memo(function AddNewMaterialModal({
  openModal,
  setOpenModal,
  isEdit = false,
  materialData = null,
}) {
  const form = useForm({
    defaultValues: {
      materialTitle: "",
      materialDescription: "",
      categoryId: "",
      courseImage: null,
      courseVideo: null,
    },
  });

  const [imagePreview, setImagePreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const imagePreviewRef = useRef("");
  const videoPreviewRef = useRef("");
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Fetch all categories for dropdown
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetAllCategoriesQuery();
  const categories = categoriesData?.data || [];

  // Mutations for create and update
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const toast = useToast();

  const isSubmitting = isCreating || isUpdating;

  // Load material data when in edit mode
  useEffect(() => {
    if (isEdit && materialData && openModal) {
      form.reset({
        materialTitle: materialData.title || "",
        materialDescription: materialData.description || "",
        categoryId: materialData.categoryId || "",
        courseImage: null, // Keep as null, user can upload new image
        courseVideo: null, // Keep as null, user can upload new video
      });

      // Set previews if URLs are provided (these are regular URLs, not object URLs)
      if (materialData.imageUrl) {
        setImagePreview(materialData.imageUrl);
        // Don't set imagePreviewRef for regular URLs
      }
      if (materialData.videoUrl) {
        setVideoPreview(materialData.videoUrl);
        // Don't set videoPreviewRef for regular URLs
      }
    }
  }, [isEdit, materialData, openModal, form]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewRef.current) {
        URL.revokeObjectURL(imagePreviewRef.current);
      }
      if (videoPreviewRef.current) {
        URL.revokeObjectURL(videoPreviewRef.current);
      }
    };
  }, []);

  const handleImageChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        // Revoke previous object URL if exists
        if (imagePreviewRef.current) {
          URL.revokeObjectURL(imagePreviewRef.current);
        }
        // Create new object URL for preview
        const objectUrl = URL.createObjectURL(file);
        imagePreviewRef.current = objectUrl;
        setImagePreview(objectUrl);
        form.setValue("courseImage", file);
      }
    },
    [form]
  );

  const handleVideoChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        // Revoke previous object URL if exists
        if (videoPreviewRef.current) {
          URL.revokeObjectURL(videoPreviewRef.current);
        }
        // Create new object URL for preview
        const objectUrl = URL.createObjectURL(file);
        videoPreviewRef.current = objectUrl;
        setVideoPreview(objectUrl);
        form.setValue("courseVideo", file);
      }
    },
    [form]
  );

  const onSubmit = useCallback(
    async (data) => {
      try {
        // Create FormData for file upload
        const formData = new FormData();

        // Append title
        formData.append("title", data.materialTitle || "");

        // Append description
        formData.append("description", data.materialDescription || "");

        // Append categoryId
        if (data.categoryId) {
          formData.append("categoryId", data.categoryId);
        }

        // Append video file if provided
        const videoFile = form.getValues("courseVideo");
        if (videoFile && videoFile instanceof File) {
          formData.append("video", videoFile);
        }

        // Append thumbnail (image) file if provided
        const imageFile = form.getValues("courseImage");
        if (imageFile && imageFile instanceof File) {
          formData.append("thumbnail", imageFile);
        }

        // Debug: Log FormData contents
        console.log("FormData entries:");
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(key, "File:", value.name, value.size, "bytes");
          } else {
            console.log(key, value);
          }
        }

        let response;
        if (isEdit && materialData?._id) {
          // Update course
          response = await updateCourse({
            id: materialData._id,
            formData,
          }).unwrap();
        } else {
          // Create course
          response = await createCourse(formData).unwrap();
        }

        // Check if response is successful
        if (response?.success) {
          toast.success(
            response.message ||
            (isEdit
              ? "Course updated successfully"
              : "Course created successfully")
          );
          setOpenModal(false);
          // Form will be reset by useEffect when openModal becomes false
        } else {
          throw new Error(
            response?.message || "An error occurred. Please try again."
          );
        }
      } catch (error) {
        // Handle error
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "An error occurred. Please try again.";
        toast.error(errorMessage);
        console.log("Course operation error:", error);
      }
    },
    [
      setOpenModal,
      isEdit,
      materialData,
      form,
      createCourse,
      updateCourse,
      toast,
    ]
  );

  const resetForm = useCallback(() => {
    // Clean up object URLs only (not regular URLs from edit mode)
    if (
      imagePreviewRef.current &&
      imagePreviewRef.current.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreviewRef.current);
      imagePreviewRef.current = "";
    }
    if (
      videoPreviewRef.current &&
      videoPreviewRef.current.startsWith("blob:")
    ) {
      URL.revokeObjectURL(videoPreviewRef.current);
      videoPreviewRef.current = "";
    }
    setImagePreview("");
    setVideoPreview("");
    form.reset({
      materialTitle: "",
      materialDescription: "",
      categoryId: "",
      courseImage: null,
      courseVideo: null,
    });
    // Reset file inputs
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  }, [form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!openModal) {
      resetForm();
    }
  }, [openModal, resetForm]);

  const handleClose = useCallback(() => {
    setOpenModal(false);
    // Form will be reset by useEffect when openModal becomes false
  }, [setOpenModal]);

  const handleOpenChange = useCallback(
    (open) => {
      setOpenModal(open);
      // Form will be reset by useEffect when open becomes false
    },
    [setOpenModal]
  );

  return (
    <Dialog open={openModal} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col max-w-[90vw] sm:max-w-lg md:max-w-2xl max-h-[90vh] sm:max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {isEdit ? "Edit Course Material" : "Upload Course Media"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the course material details below."
              : "Enter the details to upload a new course media."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 py-4">
            <Form {...form}>
              <form
                id="upload-course-media-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="materialTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="materialDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className={"w-full"}>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isCategoriesLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                isCategoriesLoading
                                  ? "Loading categories..."
                                  : "Select a category"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="courseImage"
                  render={() => (
                    <FormItem>
                      <FormLabel>Course Image/Thumbnail</FormLabel>
                      <FormControl>
                        <Input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {imagePreview && (
                  <div className="relative w-full h-48 rounded-md overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Course image preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (imagePreviewRef.current) {
                          URL.revokeObjectURL(imagePreviewRef.current);
                          imagePreviewRef.current = "";
                        }
                        setImagePreview("");
                        form.setValue("courseImage", null);
                        if (imageInputRef.current) {
                          imageInputRef.current.value = "";
                        }
                      }}
                      className="absolute top-2 right-2 p-1 bg-gray-300 text-destructive-foreground rounded-full hover:bg-gray-500 transition-colors z-10"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="courseVideo"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Course Video{" "}
                        <span className="text-xs text-gray-500">
                          Maximum file size: 300MB
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleVideoChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {videoPreview && (
                  <div className="relative w-full rounded-md overflow-hidden border bg-black">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-auto max-h-96"
                      preload="metadata"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (videoPreviewRef.current) {
                          URL.revokeObjectURL(videoPreviewRef.current);
                          videoPreviewRef.current = "";
                        }
                        setVideoPreview("");
                        form.setValue("courseVideo", null);
                        if (videoInputRef.current) {
                          videoInputRef.current.value = "";
                        }
                      }}
                      className="absolute top-2 right-2 p-1 bg-gray-300 text-destructive-foreground rounded-full hover:bg-gray-500 transition-colors z-10"
                      aria-label="Remove video"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </ScrollArea>
        <DialogFooter className="flex-shrink-0 border-t px-6 py-4 bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="upload-course-media-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              isEdit ? (
                <>
                  Updating...{" "}
                  <Loader className="w-4 h-4 animate-spin text-white" />
                </>
              ) : (
                <>
                  Creating...{" "}
                  <Loader className="w-4 h-4 animate-spin text-white" />
                </>
              )
            ) : isEdit ? (
              "Update"
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default AddNewMaterialModal;

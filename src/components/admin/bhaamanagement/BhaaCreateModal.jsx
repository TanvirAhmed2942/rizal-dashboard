"use client";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBhaaMutation } from "@/redux/Apis/admin/bhaamanagementApi/bhaamanagementApi";
import useToast from "@/hooks/useToast";
import { Loader } from "lucide-react";

const BhaaCreateModal = React.memo(function BhaaCreateModal({
  openModal,
  setOpenModal,
}) {
  const [createBhaa, { isLoading }] = useCreateBhaaMutation();
  const toast = useToast();
  const form = useForm({
    defaultValues: {
      bhaaName: "",
      bhaaEmail: "",
      bhaaPhoneNumber: "",
      bhaaAddress: "",
      role: "assistant",
    },
  });

  const onSubmit = useCallback(
    async (data) => {
      try {
        // Map form data to API payload format
        const payload = {
          fullName: data.bhaaName,
          email: data.bhaaEmail,
          phone: data.bhaaPhoneNumber,
          address: data.bhaaAddress,
          role: data.role || "assistant", // Default to "assistant" if not specified
        };

        const response = await createBhaa(payload).unwrap();

        if (response?.success) {
          toast.success(response.message || "BHAA created successfully");
          form.reset();
          setOpenModal(false);
        } else {
          throw new Error(response?.message || "Failed to create BHAA");
        }
      } catch (error) {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "An error occurred while creating BHAA. Please try again.";
        toast.error(errorMessage);
        console.error("Create BHAA error:", error);
      }
    },
    [createBhaa, form, setOpenModal, toast],
  );

  const handleClose = useCallback(() => {
    setOpenModal(false);
  }, [setOpenModal]);

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create BHAA Account</DialogTitle>
          <DialogDescription>
            Enter the details to create a new BHAA account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="bhaa-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="bhaaName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BHAA Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bhaaEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bhaaPhoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bhaaAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create"}
                {isLoading && <Loader className="w-4 h-4 animate-spin ml-2" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

export default BhaaCreateModal;

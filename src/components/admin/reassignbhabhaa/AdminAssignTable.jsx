"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import useToast from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import {
  useGetAllUsersQuery,
  useReassignBhaBhaaAdminMutation,
} from "@/redux/Apis/admin/adminmanagementApi/adminmanagementApi";
import { getImageUrl } from "@/utils/getImageUrl";
import {
  Check,
  ChevronsUpDown,
  CircleX,
  Loader2,
  Search,
  Stethoscope,
  UserCog,
  UserPlus,
  Users
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/* ─── Avatar + Name Cell ─── */
function UserCell({ name, email, image, role }) {
  const initial = name ? name.trim().charAt(0).toUpperCase() : "?";
  const roleLabel = role
    ? String(role).charAt(0).toUpperCase() + String(role).slice(1)
    : null;
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-10 shrink-0 rounded-full bg-muted">
        <AvatarImage src={getImageUrl(image)} alt={name} />
        <AvatarFallback className="rounded-full bg-muted text-muted-foreground text-sm font-medium">
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-foreground truncate">
          {name || "—"}
          {roleLabel && (
            <span className="text-muted-foreground font-normal">
              {" "}
              ({roleLabel})
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {email || "—"}
        </span>
      </div>
    </div>
  );
}

/* ─── Searchable Combobox Component ─── */
function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  isLoading = false,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((option) =>
    option.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={(openState) => !disabled && setOpen(openState)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-11 px-4 border shadow-sm transition-all duration-200",
            "hover:border-orange-300 hover:bg-orange-50/30",
            "focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500",
            disabled && "cursor-not-allowed opacity-50 bg-muted"
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate text-sm font-medium">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            ) : value ? (
              <span className="text-foreground truncate">
                {options.find((opt) => opt._id === value)?.fullName}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-40 text-orange-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 shadow-xl border-orange-100 rounded-xl overflow-hidden" align="start">
        <div className="bg-muted/30 p-2 border-b">
          <div className="relative">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 border-none shadow-none focus-visible:ring-0 pl-9 bg-transparent"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
          <div className="space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option._id}
                  type="button"
                  onClick={() => {
                    onChange(option._id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all duration-200 mb-0.5",
                    value === option._id ? "bg-orange-50 text-orange-700" : "hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center h-5 w-5 rounded-full border transition-all duration-200",
                    value === option._id ? "border-orange-500 bg-orange-500 text-white" : "border-muted-foreground/20"
                  )}>
                    {value === option._id && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <UserCell
                      name={option.fullName}
                      email={option.email}
                      image={option.profile}
                      role={option.role}
                    />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ─── Assign Modal ─── */
function AssignModal({
  open,
  onOpenChange,
  user: initialUser,
  users,
  doctors,
  assistants,
  isUsersLoading,
  isDoctorsLoading,
  isAssistantsLoading,
  onAssign,
  isSubmitting,
}) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedAssistant, setSelectedAssistant] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});

  // Reset modal state only when it opens OR the initial user ID changes
  useEffect(() => {
    if (open) {
      if (initialUser) {
        setSelectedUser(initialUser);
        setSelectedDoctor(initialUser.assignDoctorId || "");
        setSelectedAssistant(initialUser.assignAssistantId || "");
      } else {
        setSelectedUser(null);
        setSelectedDoctor("");
        setSelectedAssistant("");
      }
      setReason("");
      setErrors({});
    }
  }, [open, initialUser?._id]); // Only run when open or user ID changes

  const handleClearAll = () => {
    setSelectedUser(null);
    setSelectedDoctor("");
    setSelectedAssistant("");
    setReason("");
    setErrors({});
  };

  const handleDoctorChange = (id) => {
    setSelectedDoctor(id);
    // If you want them to be mutually exclusive, uncomment this:
    // setSelectedAssistant("");
  };

  const handleAssistantChange = (id) => {
    setSelectedAssistant(id);
    // If you want them to be mutually exclusive, uncomment this:
    // setSelectedDoctor("");
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!selectedUser) {
      toast.error("Please select a user first");
      return;
    }

    if (!selectedDoctor && !selectedAssistant) {
      toast.error("Please select at least one provider to assign");
      return;
    }

    if (!reason.trim()) {
      newErrors.reason = "Reason is required for assignment";
      setErrors(newErrors);
      return;
    }

    // Clear errors 
    setErrors({});

    // Determine what actually changed
    const changes = {
      userId: selectedUser._id,
      reason: reason.trim(),
      doctorId: (selectedDoctor !== (initialUser?.assignDoctorId || "")) ? (selectedDoctor || null) : undefined,
      assistantId: (selectedAssistant !== (initialUser?.assignAssistantId || "")) ? (selectedAssistant || null) : undefined
    };

    // If nothing changed, just close the modal
    if (changes.doctorId === undefined && changes.assistantId === undefined) {
      onOpenChange(false);
      return;
    }

    // Call onAssign with only what changed
    onAssign(changes);
  };

  const canSubmit = selectedUser && (selectedDoctor || selectedAssistant) && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
        <div className=" p-6 text-white">
          <div className="flex items-center justify-between">
            <DialogHeader className="text-left">
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-black">
                <UserPlus className="h-6 w-6" />
                Assign BHA / BHAA
              </DialogTitle>
              <DialogDescription className="text-black mt-1">
                Manage doctor and assistant assignments for users.
              </DialogDescription>
            </DialogHeader>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-black gap-1.5"
            >
              <CircleX className="h-4 w-4" />
              Clear All
            </Button> */}
          </div>
        </div>

        <div className="p-6 space-y-6 bg-background">
          {/* User Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              Select User
            </Label>
            {initialUser ? (
              <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3 ring-1 ring-orange-500/10">
                <Avatar className="size-11 shrink-0 rounded-full border-2 border-orange-100">
                  <AvatarImage src={getImageUrl(selectedUser?.profile)} alt={selectedUser?.fullName} />
                  <AvatarFallback className="bg-orange-50 text-orange-600 text-sm font-bold">
                    {selectedUser?.fullName ? selectedUser.fullName.trim().charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-foreground truncate">
                    {selectedUser?.fullName || "—"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {selectedUser?.email || "—"}
                  </span>
                </div>
                <Badge variant="secondary" className="ml-auto bg-orange-50 text-orange-700 hover:bg-orange-100 border-none">
                  {selectedUser?.role?.toUpperCase()}
                </Badge>
              </div>
            ) : (
              <Combobox
                options={users}
                value={selectedUser?._id}
                onChange={(id) => {
                  const u = users.find(u => u._id === id);
                  setSelectedUser(u);
                  setSelectedDoctor(u?.assignDoctorId || "");
                  setSelectedAssistant(u?.assignAssistantId || "");
                }}
                placeholder="Search for a user..."
                isLoading={isUsersLoading}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Doctor Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-blue-500" />
                  Doctor (BHA)
                </Label>
                {selectedDoctor && (
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor("")}
                    className="text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                )}
              </div>
              <Combobox
                options={doctors}
                value={selectedDoctor}
                onChange={handleDoctorChange}
                placeholder="Select Doctor"
                isLoading={isDoctorsLoading}
              />
            </div>

            {/* Assistant Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-purple-500" />
                  Assistant (BHAA)
                </Label>
                {selectedAssistant && (
                  <button
                    type="button"
                    onClick={() => setSelectedAssistant("")}
                    className="text-[10px] uppercase font-bold text-purple-600 hover:text-purple-800"
                  >
                    Clear
                  </button>
                )}
              </div>
              <Combobox
                options={assistants}
                value={selectedAssistant}
                onChange={handleAssistantChange}
                placeholder="Select Assistant"
                isLoading={isAssistantsLoading}
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label className={cn("text-sm font-bold", errors.reason && "text-destructive")}>
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="Please provide a clear reason for this assignment..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) {
                  setErrors(prev => ({ ...prev, reason: null }));
                }
              }}
              className={cn(
                "min-h-[100px] resize-none focus-visible:ring-orange-500/50 rounded-xl transition-all duration-200",
                errors.reason ? "border-destructive focus-visible:ring-destructive/20" : "focus-visible:border-orange-500"
              )}
            />
            {errors.reason && (
              <p className="text-xs font-medium text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-200">
                <CircleX className="h-3.5 w-3.5" />
                {errors.reason}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-black text-white rounded-xl px-8 "
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Save Assignment"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Table ─── */
function AdminAssignTable() {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submittingIds, setSubmittingIds] = useState(new Set());
  const limit = 10;

  // Get users, doctors, and assistants
  const { data: usersData, isLoading: isUsersLoading } = useGetAllUsersQuery({
    role: "user",
    page,
    limit,
  });
  // Separate query for the search dropdown in the modal
  const { data: searchUsersData, isLoading: isSearchUsersLoading } = useGetAllUsersQuery({
    role: "user",
    limit: 1000,
  });
  const { data: doctorsData, isLoading: isDoctorsLoading } = useGetAllUsersQuery({
    role: "doctor",
    limit: 100,
  });
  const { data: assistantsData, isLoading: isAssistantsLoading } =
    useGetAllUsersQuery({ role: "assistant", limit: 100 });
  const [reassignBhaBhaaAdmin] = useReassignBhaBhaaAdminMutation();
  const toast = useToast();

  const users = usersData?.data || [];
  const searchUsers = searchUsersData?.data || [];
  const doctors = doctorsData?.data || [];
  const assistants = assistantsData?.data || [];
  const paginationMeta = usersData?.meta || { page: 1, limit, total: 0, totalPage: 1 };
  const totalPages = paginationMeta.totalPage || 1;

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // Wrapped in useCallback to ensure stability, though not strictly necessary for simple cases
  const handleAssign = useCallback(async ({ userId, doctorId, assistantId, reason }) => {
    if (!doctorId && !assistantId) {
      toast.error("Please select a doctor or assistant before assigning");
      return;
    }

    setSubmittingIds((prev) => new Set([...prev, userId]));

    try {
      // We only update if the ID was explicitly passed (meaning it changed)
      // Note: doctorId/assistantId will be 'undefined' if unchanged, 
      // 'null' if cleared, and a string ID if newly selected.

      if (doctorId !== undefined) {
        const res = await reassignBhaBhaaAdmin({ userId, assignId: doctorId, reason }).unwrap();
        if (!res?.success) throw new Error(res?.message || "Doctor assignment failed");
      }

      if (assistantId !== undefined) {
        const res = await reassignBhaBhaaAdmin({ userId, assignId: assistantId, reason }).unwrap();
        if (!res?.success) throw new Error(res?.message || "Assistant assignment failed");
      }

      toast.success("Care team updated successfully");
      setModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      const apiErrorMessage =
        error?.data?.message ||
        (Array.isArray(error?.data?.errorSources) &&
          error.data.errorSources[0]?.message) ||
        error?.message ||
        "Failed to assign";
      toast.error(apiErrorMessage);
      console.error("Assign error:", error);
    } finally {
      setSubmittingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  }, [reassignBhaBhaaAdmin, toast]); // Added proper dependencies

  const getDoctorName = (user) => {
    const doc = doctors.find((d) => d._id === user.assignDoctorId);
    return doc?.fullName || null;
  };

  const getAssistantName = (user) => {
    const asst = assistants.find((a) => a._id === user.assignAssistantId);
    return asst?.fullName || null;
  };

  const renderPaginationButtons = () => {
    const buttons = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <Button
            key={i}
            variant="outline"
            className={`h-8 w-8 ${page === i
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-gray-100 text-gray-600 border-gray-300"
              }`}
            onClick={() => setPage(i)}
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
          className={`h-8 w-8 ${page === 1
            ? "bg-orange-500 text-white border-orange-500"
            : "bg-gray-100 text-gray-600 border-gray-300"
            }`}
          onClick={() => setPage(1)}
        >
          1
        </Button>,
      );

      if (page > 3) {
        buttons.push(
          <span key="ellipsis1" className="px-2 text-gray-600">
            ...
          </span>,
        );
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          buttons.push(
            <Button
              key={i}
              variant="outline"
              className={`h-8 w-8 ${page === i
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-gray-100 text-gray-600 border-gray-300"
                }`}
              onClick={() => setPage(i)}
            >
              {i}
            </Button>,
          );
        }
      }

      if (page < totalPages - 2) {
        buttons.push(
          <span key="ellipsis2" className="px-2 text-gray-600">
            ...
          </span>,
        );
      }

      buttons.push(
        <Button
          key={totalPages}
          variant="outline"
          className={`h-8 w-8 ${page === totalPages
            ? "bg-orange-500 text-white border-orange-500"
            : "bg-gray-100 text-gray-600 border-gray-300"
            }`}
          onClick={() => setPage(totalPages)}
        >
          {totalPages}
        </Button>,
      );
    }

    return buttons;
  };

  if (isUsersLoading || isDoctorsLoading || isAssistantsLoading) {
    return (
      <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
        Loading users...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
        No users found.
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-foreground">Users List</h2>
            <p className="text-xs text-muted-foreground">Manage service provider assignments</p>
          </div>
        </div>

      </div>

      <div className="rounded-xl overflow-clip border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
              <TableHead className="h-10 px-4 font-medium text-foreground">
                User Name
              </TableHead>
              <TableHead className="h-10 px-4 font-medium text-foreground">
                Assigned Doctor
              </TableHead>
              <TableHead className="h-10 px-4 font-medium text-foreground">
                Assigned Assistant
              </TableHead>
              <TableHead className="h-10 px-4 font-medium text-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const doctorName = getDoctorName(user);
              const assistantName = getAssistantName(user);

              return (
                <TableRow key={user._id} className="border-b bg-card">
                  <TableCell className="px-4 py-3 align-middle">
                    <UserCell
                      name={user.fullName}
                      email={user.email}
                      image={user.profile}
                      role={user.role}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    {doctorName ? (
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-blue-700 gap-1.5 font-medium"
                      >
                        <Stethoscope className="h-3 w-3" />
                        {doctorName}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    {assistantName ? (
                      <Badge
                        variant="outline"
                        className="border-purple-200 bg-purple-50 text-purple-700 gap-1.5 font-medium"
                      >
                        <UserCog className="h-3 w-3" />
                        {assistantName}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "rounded-md border-orange-300 bg-orange-50 text-orange-700",
                        "hover:bg-orange-100 hover:text-orange-800 hover:border-orange-400",
                        "transition-all duration-200",
                      )}
                      onClick={() => handleOpenModal(user)}
                    >
                      <UserPlus className="h-4 w-4 mr-1.5" />
                      Assign
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 border-t bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages} • Showing {users.length} of {paginationMeta.total} users
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-8 w-24"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {renderPaginationButtons()}
              </div>
              <Button
                variant="outline"
                className="h-8 w-24"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      <AssignModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={selectedUser}
        users={searchUsers}
        doctors={doctors}
        assistants={assistants}
        isUsersLoading={isSearchUsersLoading}
        isDoctorsLoading={isDoctorsLoading}
        isAssistantsLoading={isAssistantsLoading}
        onAssign={handleAssign}
        isSubmitting={selectedUser ? submittingIds.has(selectedUser._id) : false}
      />
    </>
  );
}

export default AdminAssignTable;

"use client";

import SearchFilterButton from "@/components/common/SearchFilterButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useToast from "@/hooks/useToast";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetAssignTaskDataQuery,
} from "@/redux/Apis/bha/assigntaskApi/assignTaskApi";
import { useGetSessionManagementDataByIdQuery } from "@/redux/Apis/bha/sessionmanagementApi/sessionmanagementApi";
import formatDate from "@/utils/FormatDate/formatDate";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import { Eye, Loader2, Sparkles, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import AddEditTaskModal from "./viewdetails/AddEditTaskModal";
import GenerateAiTaskModal from "./viewdetails/GenerateAiTaskModal";
import ViewTaskModal from './ViewTaskModal';


function AssignTaskLayout() {
  const { id } = useParams();
  const toast = useToast();
  const {
    data: assignTaskData,
    isLoading: isAssignTaskDataLoading,
    refetch,
  } = useGetAssignTaskDataQuery({ id });

  const { data: bookingDetailsData } = useGetSessionManagementDataByIdQuery({ id }, { skip: !id });

  console.log("assign Tast data", assignTaskData)

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // New state for view modal
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null); // State for viewing task
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [localTasks, setLocalTasks] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Sync local tasks with API data when it loads
  useEffect(() => {
    if (assignTaskData?.data) {
      setLocalTasks(assignTaskData.data);
    }
  }, [assignTaskData]);

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "N/A";
    }
  };

  const formatDaysList = (days) => {
    if (!Array.isArray(days) || days.length === 0) return "—";
    return days
      .map((d) =>
        typeof d === "string"
          ? d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()
          : d
      )
      .join(", ");
  };

  // Map API data to table format
  const tasks =
    localTasks?.map((task) => ({
      id: task._id,
      taskName: task.title,
      taskDescription: task.description,
      targetDomain: task.domain || task.targetDomain,
      targetDomainId: task.targetDomainId,
      type: task.type === "weekly" ? "weekly" : "daily",
      days: Array.isArray(task.days) ? task.days : [],
      daysLabel: formatDaysList(task.days),
      startDate: formatDate(task.startDate),
      endDate: formatDate(task.endDate),
      startTime: formatTime(task.startTime),
      endTime: formatTime(task.endDate),
      status: task.status,
      userId: task.userId?._id,
      userName: task.userId?.fullName,
      doctorBookingId: task.doctorBookingId,
      // Include all original data for view modal
      originalData: task,
    })) || [];

  // Get user name from booking details or tasks if available
  const userName =
    bookingDetailsData?.data?.userId?.fullName ||
    assignTaskData?.data?.[0]?.userId?.fullName ||
    "Client";

  const clientUser = bookingDetailsData?.data?.userId;
  // If isAiGenerated is false and subscriptionPlanType is paid, show Generate AI button
  const showGenerateAiButton =
    clientUser &&
    clientUser.isAiGenerated === false &&
    clientUser.subscriptionPlanType === "paid";

  const handleAddClick = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleViewClick = (task) => {
    setViewingTask(task);
    setIsViewModalOpen(true);
  };

  const handleDelete = (taskId) => {
    setDeletingId(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    // First, update local state for instant UI update
    setLocalTasks((prev) => prev.filter((task) => task._id !== deletingId));

    try {
      const result = await deleteTask({ id: deletingId }).unwrap();
      if (result.success) {
        toast.success("Task deleted successfully");
        await refetch(); // Refetch to sync localTasks with server
      }
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (error) {
      // If delete fails, revert local state to original data
      if (assignTaskData?.data) {
        setLocalTasks(assignTaskData.data);
      }
      toast.error(error?.data?.message || error?.message || "Failed to delete task");
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const handleSave = async (taskData) => {
    try {
      // Create new task
      const payload = {
        doctorBookingId: id,
        title: taskData.title,
        description: taskData.description,
        targetDomainId: taskData.targetDomainId,
        days: Array.isArray(taskData.days) ? taskData.days : [],
        startDate: taskData.startDate,
        endDate: taskData.endDate,
      };

      const result = await createTask(payload).unwrap();
      if (result.success) {
        toast.success("Task created successfully");
        await refetch(); // Refetch to sync localTasks
        setIsModalOpen(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Failed to create task");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-3 flex-wrap">
        {showGenerateAiButton && (
          <Button
            className="bg-[#FF8045] hover:bg-[#E56A2E] text-white flex items-center gap-1.5 font-medium transition-all duration-200"
            onClick={() => setIsAiModalOpen(true)}
          >
            <Sparkles className="size-4" />
            Generate AI Task
          </Button>
        )}
        <Button
          className="bg-sky-500 text-white hover:bg-sky-600"
          onClick={handleAddClick}
        >
          Add New Task
        </Button>
      </div>
      <p className="text-lg font-bold">{userName}</p>
      <p className="text-lg font-bold">Task Details</p>

      <SearchFilterButton
        showAddButton={false}
        placeholder="Search Task"
        searchByDate={true}
        showFilterButton={false}
        searchText={searchText}
        setSearchText={setSearchText}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <TaskDetailsTable
        tasks={
          tasks.filter((task) => {
            // Search filter
            const matchesSearch =
              !searchText ||
              task.taskName.toLowerCase().includes(searchText.toLowerCase()) ||
              (task.taskDescription && task.taskDescription.toLowerCase().includes(searchText.toLowerCase()));

            // Date filter: check if task starts or ends on selected date
            const matchesDate =
              !selectedDate ||
              (task.startDate && task.startDate.includes(selectedDate)) ||
              (task.endDate && task.endDate.includes(selectedDate));

            return matchesSearch && matchesDate;
          })
        }
        onEdit={handleEditClick}
        onView={handleViewClick}
        onDelete={handleDelete}
        deletingId={deletingId}
        isLoading={isAssignTaskDataLoading}
      />
      <AddEditTaskModal
        openModal={isModalOpen}
        setOpenModal={setIsModalOpen}
        onSave={handleSave}
        initialData={editingTask}
        isLoading={isCreating}
        doctorBookingId={id}
      />
      <GenerateAiTaskModal
        openModal={isAiModalOpen}
        setOpenModal={setIsAiModalOpen}
        userId={clientUser?._id || assignTaskData?.data?.[0]?.userId?._id || (typeof assignTaskData?.data?.[0]?.userId === "string" ? assignTaskData?.data?.[0]?.userId : null)}
        doctorBookingId={id}
        onGenerate={(data) => {
          console.log("Generating AI strategy with details:", data);
        }}
      />

      {/* View Task Modal */}
      <ViewTaskModal
        openModal={isViewModalOpen}
        setOpenModal={setIsViewModalOpen}
        taskData={viewingTask}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AssignTaskLayout;

export function TaskDetailsTable({ tasks, onEdit, onView, onDelete, deletingId, isLoading }) {
  if (isLoading) {
    return (
      <div className="w-full rounded-md border p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          <span className="ml-2 text-gray-500">Loading tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full rounded-md border whitespace-nowrap">
      <Table>
        <TableCaption className="text-lg font-bold">
          Assigned Task lists
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Task Name</TableHead>
            <TableHead>Task Description</TableHead>
            <TableHead>Target Domain</TableHead>
            <TableHead>Type</TableHead>

            <TableHead>Start Date</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Date</TableHead>

            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                No tasks assigned yet
              </TableCell>
            </TableRow>
          ) : (
            [...tasks]?.reverse().map((data) => (
              <TableRow key={data.id}>
                <TableCell className="font-medium">{data.taskName}</TableCell>
                <TableCell className="font-medium">
                  {data.taskDescription?.slice(0, 50)}
                  {(data.taskDescription?.length ?? 0) > 50 ? "..." : ""}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-red-500/50 text-black h-7"
                  >
                    {data.targetDomain}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{data.type || "—"}</TableCell>

                <TableCell>{data.startDate}</TableCell>
                <TableCell>{data.startTime}</TableCell>
                <TableCell>{data.endDate}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${data.status === "pending"
                      ? "bg-yellow-500 text-white border-yellow-500"
                      : data.status === "completed"
                        ? "bg-lime-500 text-white border-lime-500"
                        : data.status === "overdue"
                          ? "bg-red-500 text-white border-red-500"
                          : data.status === "in-progress"
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-gray-500 text-white border-gray-500"
                      } px-2 py-1 text-center font-medium text-xs inline-block w-20 capitalize`}
                  >
                    {data.status}
                  </Badge>
                </TableCell>
                <TableCell className="w-auto flex justify-end gap-2 text-right">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onView && onView(data)}
                    className="hover:bg-blue-50"
                  >
                    <Eye size={20} className="text-blue-500" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onDelete && onDelete(data.id)}
                    disabled={deletingId === data.id}
                  >
                    {deletingId === data.id ? (
                      <Loader2 className="animate-spin" size={20} color="red" />
                    ) : (
                      <Trash2 size={20} color="red" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter></TableFooter>
      </Table>
      <Scrollbar orientation="horizontal" className="h-2 w-full" />
    </ScrollArea>
  );
}
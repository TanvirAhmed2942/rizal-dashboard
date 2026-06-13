"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import SearchFilterButton from "@/components/common/SearchFilterButton";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import { Badge } from "@/components/ui/badge";
import AddEditTaskModal from "./viewdetails/AddEditTaskModal";
import { useParams } from "next/navigation";
import {
  useGetAssignTaskDataQuery,
  useCreateTaskMutation,
  useDeleteTaskMutation,
} from "@/redux/Apis/bha/assigntaskApi/assignTaskApi";
import formatDate from "@/utils/FormatDate/formatDate";
import useToast from "@/hooks/useToast";
import { Loader2 } from "lucide-react";
import { Trash2 } from "lucide-react";

function AssignTaskLayout() {
  const { id } = useParams();
  const toast = useToast();
  const {
    data: assignTaskData,
    isLoading: isAssignTaskDataLoading,
    refetch,
  } = useGetAssignTaskDataQuery({ id });
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
    assignTaskData?.data?.map((task) => ({
      id: task._id,
      taskName: task.title,
      taskDescription: task.description,
      targetDomain: task.targetDomain,
      targetDomainId: task.targetDomainId,
      type: task.type === "weekly" ? "weekly" : "daily",
      days: Array.isArray(task.days) ? task.days : [],
      daysLabel: formatDaysList(task.days),
      startDate: formatDate(task.startDate),
      endDate: formatDate(task.endDate),
      startTime: formatTime(task.startDate),
      endTime: formatTime(task.endDate),
      status: task.status,
      userId: task.userId?._id,
      userName: task.userId?.fullName,
      doctorBookingId: task.doctorBookingId,
    })) || [];

  // Get user name from the first task if available
  const userName = assignTaskData?.data?.[0]?.userId?.fullName || "Client";

  const handleAddClick = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (taskId) => {
    try {
      setDeletingId(taskId);
      await deleteTask({ id: taskId }).unwrap();
      toast.success("Task deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete task");
    } finally {
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

      await createTask(payload).unwrap();
      toast.success("Task created successfully");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create task");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          className="bg-sky-500 text-white hover:bg-sky-600"
          onClick={handleAddClick}
        >
          Add New Task
        </Button>
      </div>
      <p className="text-lg font-bold">{userName}</p>
      <p className="text-lg font-bold">Task Details</p>
      {isAssignTaskDataLoading && (
        <p className="text-gray-500">Loading tasks...</p>
      )}
      <SearchFilterButton
        showAddButton={false}
        placeholder="Search Task"
        searchByDate={true}
        showFilterButton={false}
      />
      <TaskDetailsTable
        tasks={tasks}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
      <AddEditTaskModal
        openModal={isModalOpen}
        setOpenModal={setIsModalOpen}
        onSave={handleSave}
        initialData={editingTask}
        isLoading={isCreating}
        doctorBookingId={id}
      />
    </div>
  );
}

export default AssignTaskLayout;

export function TaskDetailsTable({ tasks, onEdit, onDelete, deletingId }) {
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
            <TableHead>Days</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>End Time</TableHead>
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
            tasks.map((data) => (
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
                <TableCell className="max-w-[160px] text-sm">
                  {data.type === "weekly" ? data.daysLabel : "—"}
                </TableCell>
                <TableCell>{data.startDate}</TableCell>
                <TableCell>{data.startTime}</TableCell>
                <TableCell>{data.endDate}</TableCell>
                <TableCell>{data.endTime}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${
                      data.status === "pending"
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
                  {/* <Button
                    variant="outline"
                    onClick={() => onEdit && onEdit(data)}
                  >
                    <FiEdit3 size={20} />
                  </Button> */}
                  <Button
                    variant="outline"
                    onClick={() => onDelete && onDelete(data.id)}
                    disabled={deletingId === data.id}
                  >
                    {deletingId === data.id ? (
                      <Loader2 className="animate-spin" size={20} color="red" />
                    ) : (
                      <Trash2 size={20} color="red" />
                    )}{" "}
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

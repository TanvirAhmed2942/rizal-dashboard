// viewdetails/ViewTaskModal.jsx
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, CalendarDays, Clock, FileText, Target, User } from "lucide-react";

function ViewTaskModal({ openModal, setOpenModal, taskData }) {
  if (!taskData) return null;

  // Get original data for more details
  console.log(taskData);

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-sky-500" />
            Task Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Task Name & Status */}
          <div className="flex items-start justify-between border-b pb-4">
            <div>
              <h3 className="text-xl font-semibold">{taskData.taskName}</h3>
              <p className="text-sm text-gray-500 mt-1">Task ID: {taskData.id}</p>
            </div>
            <Badge
              className={`${taskData.status === "pending"
                ? "bg-yellow-500 text-white"
                : taskData.status === "completed"
                  ? "bg-lime-500 text-white"
                  : taskData.status === "overdue"
                    ? "bg-red-500 text-white"
                    : taskData.status === "in-progress"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-500 text-white"
                } px-3 py-1 text-sm font-medium capitalize`}
            >
              {taskData.status}
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </h4>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
              {taskData.taskDescription || "No description provided"}
            </p>
          </div>

          {/* Grid Layout for details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Domain */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Target Domain
              </h4>
              <Badge variant="outline" className="bg-red-500/10">
                {taskData.targetDomain || "—"}
              </Badge>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Type
              </h4>
              <p className="capitalize">{taskData.type || "—"}</p>
            </div>

            {/* Days (if weekly) */}
            {taskData.days && taskData.days.length > 0 && (
              <div className="space-y-1 md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Days</h4>
                <div className="flex flex-wrap gap-2">
                  {taskData.days.map((day, index) => (
                    <Badge key={index} variant="secondary">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Start Date */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </h4>
              <p>{taskData.startDate || "—"}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date
              </h4>
              <p>{taskData.endDate || "—"}</p>
            </div>

            {/* Start Time */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </h4>
              <p>{taskData.startTime || "—"}</p>
            </div>

            {/* End Date */}

            {/* User/Client */}
            {taskData.userName && (
              <div className="space-y-1 md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assigned To
                </h4>
                <p>{taskData.userName}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewTaskModal;
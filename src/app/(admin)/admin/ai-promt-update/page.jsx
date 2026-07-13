"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import useToast from "@/hooks/useToast";
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "@/redux/Apis/profileApi/profileApi";
import { Loader, RotateCcw, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function AiPromptUpdatePage() {
  const { data: profileData, isLoading } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateMyProfileMutation();
  const toast = useToast();

  const [formData, setFormData] = useState({
    taskTitleLength: "",
    taskTitleInstruction: "",
    descriptionInstruction: "",
    goalInstruction: "",
    additionalInstructions: "",
  });

  // Populate form when API data loads
  useEffect(() => {
    if (profileData?.data) {
      const d = profileData.data;
      setFormData({
        taskTitleLength: d.taskTitleLength || "",
        taskTitleInstruction: d.taskTitleInstruction || "",
        descriptionInstruction: d.descriptionInstruction || "",
        goalInstruction: d.goalInstruction || "",
        additionalInstructions: d.additionalInstructions || "",
      });
    }
  }, [profileData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    if (profileData?.data) {
      const d = profileData.data;
      setFormData({
        taskTitleLength: d.taskTitleLength || "",
        taskTitleInstruction: d.taskTitleInstruction || "",
        descriptionInstruction: d.descriptionInstruction || "",
        goalInstruction: d.goalInstruction || "",
        additionalInstructions: d.additionalInstructions || "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      payload.append("taskTitleLength", formData.taskTitleLength);
      payload.append("taskTitleInstruction", formData.taskTitleInstruction);
      payload.append("descriptionInstruction", formData.descriptionInstruction);
      payload.append("goalInstruction", formData.goalInstruction);
      payload.append("additionalInstructions", formData.additionalInstructions);

      const response = await updateProfile(payload).unwrap();

      if (response?.success) {
        toast.success(response.message || "AI prompts updated successfully");
      } else {
        throw new Error(response?.message || "Failed to update AI prompts");
      }
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Check if form has been modified
  const hasChanges = profileData?.data
    ? formData.taskTitleLength !== (profileData.data.taskTitleLength || "") ||
    formData.taskTitleInstruction !==
    (profileData.data.taskTitleInstruction || "") ||
    formData.descriptionInstruction !==
    (profileData.data.descriptionInstruction || "") ||
    formData.goalInstruction !== (profileData.data.goalInstruction || "") ||
    formData.additionalInstructions !==
    (profileData.data.additionalInstructions || "")
    : false;

  return (
    <div className='p-5'>
      {/* Page Header */}


      {/* Form Card */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
                <Sparkles className="w-4 h-4" />
              </div>
              Prompt Settings
            </CardTitle>

          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Task Title Instruction */}
              <div className="space-y-2">
                <Label
                  htmlFor="taskTitleInstruction"
                  className="text-sm font-medium text-gray-700"
                >
                  Task Title Instruction
                </Label>
                <Textarea
                  id="taskTitleInstruction"
                  placeholder="Provide instructions for how AI should generate task titles..."
                  value={formData.taskTitleInstruction}
                  onChange={(e) =>
                    handleChange("taskTitleInstruction", e.target.value)
                  }
                  className="min-h-[100px] resize-y"
                />
              </div>

              {/* Description Instruction */}
              <div className="space-y-2">
                <Label
                  htmlFor="descriptionInstruction"
                  className="text-sm font-medium text-gray-700"
                >
                  Description Instruction
                </Label>
                <Textarea
                  id="descriptionInstruction"
                  placeholder="Provide instructions for how AI should generate task descriptions..."
                  value={formData.descriptionInstruction}
                  onChange={(e) =>
                    handleChange("descriptionInstruction", e.target.value)
                  }
                  className="min-h-[120px] resize-y"
                />
              </div>

              {/* Goal Instruction */}
              <div className="space-y-2">
                <Label
                  htmlFor="goalInstruction"
                  className="text-sm font-medium text-gray-700"
                >
                  Goal Instruction
                </Label>
                <Textarea
                  id="goalInstruction"
                  placeholder="Provide instructions for how AI should generate task goals..."
                  value={formData.goalInstruction}
                  onChange={(e) =>
                    handleChange("goalInstruction", e.target.value)
                  }
                  className="min-h-[120px] resize-y"
                />
              </div>

              {/* Additional Instructions */}
              <div className="space-y-2">
                <Label
                  htmlFor="additionalInstructions"
                  className="text-sm font-medium text-gray-700"
                >
                  Additional Instructions
                </Label>
                <Textarea
                  id="additionalInstructions"
                  placeholder="Any extra instructions or context for the AI..."
                  value={formData.additionalInstructions}
                  onChange={(e) =>
                    handleChange("additionalInstructions", e.target.value)
                  }
                  className="min-h-[120px] resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasChanges || isUpdating}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="bg-black/70 hover:bg-black text-white hover:text-white font-medium px-6 transition-all duration-200 hover:shadow-lg hover:shadow-secondary/25 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                  disabled={isUpdating || !hasChanges}
                >
                  {isUpdating ? (
                    <>
                      Saving...
                      <Loader className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
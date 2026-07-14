"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import useToast from "@/hooks/useToast";
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "@/redux/Apis/profileApi/profileApi";
import { Eye, Loader, RotateCcw, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";


const AiPrompt = {
  "task_domain": "Planning and Problem-Solving",
  "task_title": "Drink more water daily",
  "task_description": "Carry a reusable water bottle and refill it at least three times throughout the day to ensure adequate hydration.",
  "task_goal": "Increase daily water intake to improve overall health and energy levels."
}



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

  // Generate JSON preview data
  const jsonPreview = {
    taskTitleInstruction: formData.taskTitleInstruction || "Drink water every morning",
    descriptionInstruction: formData.descriptionInstruction || "Start your day by drinking a glass of water right after you wake up to hydrate your body.",
    goalInstruction: formData.goalInstruction || "Increase daily water intake for better hydration.",
    additionalInstructions: formData.additionalInstructions || "Focus on drinking at least 8 glasses of water throughout the day."
  };


  return (
    <div className='p-5'>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Form Section */}
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
                  <Input
                    id="taskTitleInstruction"
                    placeholder="Provide instructions for how AI should generate task titles..."
                    value={formData.taskTitleInstruction}
                    onChange={(e) =>
                      handleChange("taskTitleInstruction", e.target.value)
                    }
                    className="w-full"
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
                  <Input
                    id="descriptionInstruction"
                    placeholder="Provide instructions for how AI should generate task descriptions..."
                    value={formData.descriptionInstruction}
                    onChange={(e) =>
                      handleChange("descriptionInstruction", e.target.value)
                    }
                    className="w-full"
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
                  <Input
                    id="goalInstruction"
                    placeholder="Provide instructions for how AI should generate task goals..."
                    value={formData.goalInstruction}
                    onChange={(e) =>
                      handleChange("goalInstruction", e.target.value)
                    }
                    className="w-full"
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
                  <Input
                    id="additionalInstructions"
                    placeholder="Any extra instructions or context for the AI..."
                    value={formData.additionalInstructions}
                    onChange={(e) =>
                      handleChange("additionalInstructions", e.target.value)
                    }
                    className="w-full"
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

          {/* JSON Preview Section */}
          <div className='flex flex-col gap-5'>

            <Card className="lg:sticky lg:top-5 h-fit">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                      <Eye className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      JSON Preview
                    </CardTitle>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Preview of your prompts
                </p>
              </CardHeader>

              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-[500px]">
                  <pre className="text-sm font-mono text-black whitespace-pre-wrap break-words">
                    {JSON.stringify(jsonPreview, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:sticky lg:top-5 h-fit">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                      <Eye className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      AI Task Generated Preview
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-[500px]">
                  <pre className="text-sm font-mono text-black whitespace-pre-wrap break-words">
                    {JSON.stringify(AiPrompt, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>


          </div>


        </div>
      )}
    </div>
  );
}
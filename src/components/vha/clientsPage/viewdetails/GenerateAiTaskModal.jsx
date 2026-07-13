"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useToast from "@/hooks/useToast";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronDown, ChevronLeft, ChevronRight, Info, Loader, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCreateByDoctorMutation, useGenerateByAiMutation, useGenerateGetAPiQuery } from '../../../../redux/Apis/bha/assigntaskApi/assignTaskApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';

const DOMAIN_OPTIONS = [
  {
    id: "executive_inhibition",
    label: "Executive Inhibition (Self-Restraint)",
    description: "I talk over others or say too much during conversations. I am pacing or shifting around, even when I know I should stay still. When I try to focus, my own irrelevant thoughts or things around distract me. I make decisions about things like money, work, or relationships before considering the consequences.",
  },
  {
    id: "goal_directed",
    label: "Goal-Directed Persistence (Self-Motivation)",
    description: "It’s hard to keep going on a task, even if they’re important to me.",
  },
  {
    id: "planning_problem_solving",
    label: "Planning and Problem-Solving",
    description: "I get stuck when things don’t go as planned and don’t know how to adjust.",
  },
  {
    id: "self_awareness",
    label: "Self-Awareness (Meta-Cognition)",
    description: "I don’t notice when I’m off-task or making mistakes.",
  },
  {
    id: "verbal_working_memory",
    label: "Verbal Working Memory",
    description: "I forget what I want to say or do unless I write it down.",
  },
  {
    id: "non_verbal_working_memory",
    label: "Non-Verbal Working Memory",
    description: "I forget where I put things or what I was about to do.",
  },
  {
    id: "emotional_dysregulation",
    label: "Emotional Dysregulation",
    description: "I struggle to calm myself down once a strong emotion starts.",
  },
  {
    id: "other_areas",
    label: "Other Areas (General Life Management)",
    description: "I have a hard time keeping up with things like my space, health, or relationships.",
  },
];

const WEEKDAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const GenerateAiTaskModal = ({ openModal, setOpenModal, userId, doctorBookingId, onGenerate }) => {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [descriptions, setDescriptions] = useState({});
  const [descriptionStepIndex, setDescriptionStepIndex] = useState(0);

  // AI Generated tasks configuration state
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [generatedTaskIndex, setGeneratedTaskIndex] = useState(0);

  // Fetch already assigned domains for the user - skips when modal is closed or userId is not present
  const { data: domains, isLoading: domainsLoading } = useGenerateGetAPiQuery(userId, { skip: !openModal || !userId });
  const [generateByAi, { isLoading: generateByAiLoading }] = useGenerateByAiMutation();
  const [createByDoctor, { isLoading: createByDoctorLoading }] = useCreateByDoctorMutation();

  const isDomainAlreadyAssigned = (label) => {
    if (!domains?.data || !Array.isArray(domains.data)) return false;
    return domains.data.includes(label);
  };

  const allThreeDomainsFound = domains?.data && Array.isArray(domains.data) && domains.data.length >= 3;

  // Reset modal state
  const resetForm = () => {
    setStep(1);
    setSelectedDomains([]);
    setDescriptions({});
    setDescriptionStepIndex(0);
    setGeneratedTasks([]);
    setGeneratedTaskIndex(0);
  };

  const handleOpenChange = (open) => {
    if (!open) {
      resetForm();
    }
    setOpenModal(open);
  };

  const handleDomainToggle = (domainId) => {
    setSelectedDomains((prev) => {
      if (prev.includes(domainId)) {
        return prev.filter((id) => id !== domainId);
      } else {
        if (prev.length >= 3) {
          toast.error("You can select up to 3 domains only.");
          return prev;
        }
        return [...prev, domainId];
      }
    });
  };

  const handleNextStep2 = () => {
    if (selectedDomains.length === 0) {
      toast.error("Please select at least 1 domain to proceed.");
      return;
    }
    setStep(3);
    setDescriptionStepIndex(0);
  };

  const handleDescriptionSubmit = async () => {
    const currentDomainId = selectedDomains[descriptionStepIndex];
    const currentText = descriptions[currentDomainId] || "";

    if (!currentText.trim()) {
      toast.error("Please describe your difficulty before proceeding.");
      return;
    }

    if (descriptionStepIndex < selectedDomains.length - 1) {
      setDescriptionStepIndex((prev) => prev + 1);
    } else {
      // Final Submit -> call generate by AI
      try {
        const payload = selectedDomains.map((id) => {
          const option = DOMAIN_OPTIONS.find((d) => d.id === id);
          return {
            name: option.label,
            definition: option.description,
            userText: descriptions[id] || "",
          };
        });

        const response = await generateByAi(payload).unwrap();
        if (response?.success && response?.data) {
          toast.success("AI strategies generated successfully!");

          const mapped = response.data.map((item) => ({
            name: item.name || "",
            goal: item.goal || "",
            task: item.task || "",
            description: item.description || "",
            days: [],
            startDateTime: null,
            endDateTime: null,
          }));

          setGeneratedTasks(mapped);
          setStep(4);
          setGeneratedTaskIndex(0);
        } else {
          toast.error("Failed to generate task from AI.");
        }
      } catch (err) {
        toast.error(err?.data?.message || err?.message || "Failed to generate strategies via AI.");
      }
    }
  };

  const handleDescriptionBack = () => {
    if (descriptionStepIndex > 0) {
      setDescriptionStepIndex((prev) => prev - 1);
    } else {
      setStep(2);
    }
  };

  const updateGeneratedTaskField = (index, field, value) => {
    setGeneratedTasks((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  const handleConfigNextOrSubmit = async () => {
    const current = generatedTasks[generatedTaskIndex];

    if (!current.name.trim()) {
      toast.error("Domain Name is required.");
      return;
    }
    if (!current.goal.trim()) {
      toast.error("Goal is required.");
      return;
    }
    if (!current.task.trim()) {
      toast.error("Task Title is required.");
      return;
    }
    if (!current.description.trim()) {
      toast.error("Description is required.");
      return;
    }
    if (current.days.length === 0) {
      toast.error("Please select at least one day.");
      return;
    }
    if (!current.startDateTime) {
      toast.error("Please select start date and time.");
      return;
    }
    if (!current.endDateTime) {
      toast.error("Please select end date.");
      return;
    }

    if (generatedTaskIndex < generatedTasks.length - 1) {
      setGeneratedTaskIndex((prev) => prev + 1);
    } else {
      try {
        const payload = generatedTasks.map((t) => {
          const dStart = new Date(t.startDateTime);
          const startDate = new Date(Date.UTC(dStart.getFullYear(), dStart.getMonth(), dStart.getDate(), 0, 0, 0, 0)).toISOString();

          const dEnd = new Date(t.endDateTime);
          const endDate = new Date(Date.UTC(dEnd.getFullYear(), dEnd.getMonth(), dEnd.getDate(), 0, 0, 0, 0)).toISOString();

          const startTime = t.startDateTime.toISOString();

          return {
            name: t.name,
            goal: t.goal,
            task: t.task,
            days: t.days,
            startTime,
            startDate,
            endDate,
            description: t.description,
            userId: userId,
            doctorBookingId: doctorBookingId,
          };
        });

        const response = await createByDoctor(payload).unwrap();
        if (response?.success) {
          toast.success("Tasks created successfully!");
          handleOpenChange(false);
          if (onGenerate) {
            onGenerate(response.data);
          }
        } else {
          toast.error("Failed to create tasks.");
        }
      } catch (err) {
        toast.error(err?.data?.message || err?.message || "Failed to create tasks.");
      }
    }
  };

  // Get current domain being described in step 3
  const currentDomainId = selectedDomains[descriptionStepIndex];
  const currentDomain = DOMAIN_OPTIONS.find((d) => d.id === currentDomainId);

  // Get current task being configured in step 4
  const currentTask = generatedTasks[generatedTaskIndex];

  return (
    <Dialog open={openModal} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-lg w-[92vw] sm:w-full rounded-3xl border-0 shadow-2xl transition-all duration-300">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {step === 1 ? "Choose Domain" : step === 2 ? "Select Domains" : step === 3 ? "Generate Strategy" : "Configure Task"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Welcome / Explanation screen */}
        {step === 1 && (
          <div className="bg-[#EBF3F6] p-8 flex flex-col items-center relative text-center min-h-[580px] justify-between">

            {/* Content Container */}
            <div className="flex-1 flex flex-col justify-center py-6">
              <h2 className="text-3xl font-bold font-serif text-[#1C2C3F] leading-tight mb-4">
                Choose Your First/<br />Second/Third Domain
              </h2>
              <h3 className="text-lg font-semibold text-[#30506D] mb-6">
                Why focus on just 3 areas?
              </h3>
              <p className="text-[#4E677F] leading-relaxed text-sm text-justify px-4">
                Building new habits works best when you keep it simple. Research shows that
                trying to change too many things at once can feel overwhelming and lead to
                burnout.
                <br /><br />
                That&apos;s why we help you focus on just three areas at a time. This makes it
                easier to stay consistent, see progress, and build real momentum.
                <br /><br />
                Don&apos;t worry - you can always update your focus areas anytime as your goals
                change.
              </p>
            </div>

            {/* Bottom Button */}
            <div className="w-full mt-4">
              <Button
                onClick={() => setStep(2)}
                className="w-full py-6 rounded-full bg-white hover:bg-gray-50 text-[#1C2C3F] font-bold text-base shadow-sm hover:shadow transition-all group flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="size-4 text-sky-500 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: List checkboxes screen */}
        {step === 2 && (
          <div className="bg-[#F1ECF6] p-8 flex flex-col items-center relative min-h-[580px] justify-between">
            {/* Top Back & Close buttons */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center px-2">
              <button
                onClick={() => setStep(1)}
                className="text-gray-500 cursor-pointer hover:text-gray-900 transition-colors p-1"
              >
                <ChevronLeft className="size-5" />
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 w-full flex flex-col justify-center py-6 mt-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-serif text-[#2B1B3D] leading-tight mb-2">
                  8 Domains of Life<br />Management Difficulties
                </h2>
                {domainsLoading ? (
                  <span className="inline-block bg-[#E5DDF0] text-[#694894] px-4 py-1 rounded-full text-xs font-semibold animate-pulse">
                    Checking active domains...
                  </span>
                ) : (
                  <span className="inline-block bg-[#E5DDF0] text-[#694894] px-4 py-1 rounded-full text-xs font-semibold">
                    Choose up to 3 (Selected: {selectedDomains.length}/3)
                  </span>
                )}
              </div>

              {/* Checkboxes List */}
              <TooltipProvider>
                <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
                  {DOMAIN_OPTIONS.map((domain) => {
                    const isSelected = selectedDomains.includes(domain.id);
                    const isAssigned = isDomainAlreadyAssigned(domain.label);
                    const isDisabled = isAssigned || allThreeDomainsFound;
                    return (
                      <div
                        key={domain.id}
                        onClick={() => {
                          if (!isDisabled) handleDomainToggle(domain.id);
                        }}
                        className={`flex items-center justify-between m-2 p-3.5 rounded-2xl transition-all border ${isDisabled
                          ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200"
                          : isSelected
                            ? "bg-white border-[#8D6BBA] shadow-sm transform scale-[1.01] cursor-pointer"
                            : "bg-[#FAF7FD] border-transparent hover:bg-white hover:border-purple-200 cursor-pointer"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            disabled={isDisabled}
                            className="rounded border-[#A691C2] text-[#8D6BBA] focus:ring-[#8D6BBA] pointer-events-none"
                          />
                          <span className={`text-xs sm:text-sm font-medium ${isDisabled ? "text-gray-400" : "text-[#2B1B3D]"}`}>
                            {domain.label}
                          </span>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#A691C2] hover:text-[#8D6BBA] transition-colors p-1"
                            >
                              <Info className="size-4 shrink-0" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs bg-slate-900 text-white p-3 rounded-lg text-xs leading-relaxed shadow-lg">
                            <p>{domain.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>

            {/* Bottom Button */}
            <div className="w-full mt-4">
              <Button
                onClick={handleNextStep2}
                disabled={selectedDomains.length === 0 || allThreeDomainsFound}
                className={`w-full py-6 rounded-full font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 ${selectedDomains.length > 0 && !allThreeDomainsFound
                  ? "bg-white hover:bg-gray-50 text-[#2B1B3D]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Next
                {selectedDomains.length > 0 && !allThreeDomainsFound && <ChevronRight className="size-4 text-[#8D6BBA]" />}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Write descriptions step-by-step for selected domains */}
        {step === 3 && currentDomain && (
          <div className="bg-[#FAF9F5] p-8 flex flex-col items-center relative min-h-[580px] justify-between">
            {/* Top Back & Close buttons */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center px-2">
              <button
                onClick={handleDescriptionBack}
                disabled={generateByAiLoading}
                className="text-gray-500 hover:text-gray-900 cursor-pointer transition-colors p-1"
              >
                <ChevronLeft className="size-5" />
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 w-full flex flex-col justify-center py-6 mt-4">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <Sparkles className="size-4 text-orange-500" />
                  <h2 className="text-2xl font-bold font-serif text-[#3D3A35] leading-tight">
                    Generate Strategy
                  </h2>
                </div>
                <p className="text-[#706B62] text-xs sm:text-sm leading-relaxed px-2">
                  In your own words, how do you experience these difficulties? Please be as
                  specific as you can to ensure that the recommended strategies target your goals.
                </p>
                {/* Step indicator bubbles */}
                <div className="flex justify-center gap-1.5 mt-4">
                  {selectedDomains.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === descriptionStepIndex ? "w-6 bg-orange-500" : "w-1.5 bg-gray-300"
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Text Area Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#3D3A35] flex items-center gap-1.5">
                    {currentDomain.label}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[#A59F95] hover:text-[#3D3A35] p-1">
                          <Info className="size-4 shrink-0" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-slate-900 text-white p-3 rounded-lg text-xs leading-relaxed">
                        <p>{currentDomain.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <Textarea
                  value={descriptions[currentDomainId] || ""}
                  disabled={generateByAiLoading}
                  onChange={(e) =>
                    setDescriptions((prev) => ({
                      ...prev,
                      [currentDomainId]: e.target.value,
                    }))
                  }
                  placeholder={`Example: I struggle to finish tasks when they get complicated and often get distracted mid-way...`}
                  className="w-full bg-white border border-[#EBE7DF] rounded-2xl p-4 min-h-[160px] text-[#3D3A35] placeholder-[#B5B0A6] focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus-visible:ring-0 shadow-inner"
                />
              </div>
            </div>

            {/* Bottom Button */}
            <div className="w-full mt-4">
              <Button
                onClick={handleDescriptionSubmit}
                disabled={generateByAiLoading}
                className="w-full py-6 rounded-full bg-[#FF8045] hover:bg-[#E56A2E] text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {generateByAiLoading ? (
                  <>
                    Generating Strategy...
                    <Loader className="size-4 text-white animate-spin" />
                  </>
                ) : descriptionStepIndex === selectedDomains.length - 1 ? (
                  <>
                    Submit
                    <Check className="size-4 text-white" />
                  </>
                ) : (
                  <>
                    Next Domain
                    <ChevronRight className="size-4 text-white" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Configure generated tasks */}
        {step === 4 && currentTask && (
          <div className="bg-[#FAF9F5] p-6 flex flex-col items-center relative min-h-[580px] justify-between max-h-[85vh] overflow-y-auto overflow-x-hidden w-full">
            {/* Top Back & Close buttons */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center px-2">
              <button
                onClick={() => {
                  if (generatedTaskIndex > 0) {
                    setGeneratedTaskIndex((prev) => prev - 1);
                  } else {
                    setStep(3);
                    setDescriptionStepIndex(selectedDomains.length - 1);
                  }
                }}
                disabled={createByDoctorLoading}
                className="text-gray-500 hover:text-gray-900 cursor-pointer transition-colors p-1"
              >
                <ChevronLeft className="size-5" />
              </button>
            </div>

            {/* Content Container */}
            <div className="w-full flex-1 flex flex-col justify-start py-6 mt-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold font-serif text-[#3D3A35] leading-tight">
                  Configure Created Task
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Task {generatedTaskIndex + 1} of {generatedTasks.length}
                </p>
              </div>

              {/* Form scrollable container to prevent modal overflow */}
              <div className="max-h-[550px] overflow-y-auto overflow-x-hidden px-1 py-1 rounded-lg p-3 shadow-sm bg-white w-full">
                {/* Domain Name */}
                <div className="flex flex-col gap-2 p-3">
                  <label className="  text-base text-gray-800 font-medium">
                    Domain Name
                  </label>
                  <div className="text-base font-normal text-gray-500">
                    {currentTask.name}
                  </div>
                </div>

                {/* Task goal */}
                <div className="flex flex-col p-3">
                  <label className="text-base text-gray-800 font-medium">
                    Goal
                  </label>
                  <div className="text-base font-normal text-gray-500">
                    {currentTask.goal}
                  </div>
                </div>

                {/* Task Name */}
                <div className="flex flex-col p-3">
                  <label className="text-base text-gray-800 font-medium">
                    Task Title / Name
                  </label>
                  <div className="text-base font-normal text-gray-500">
                    {currentTask.task}
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col p-3">
                  <label className="text-base text-gray-800 font-medium">
                    Description
                  </label>
                  <div className="text-base font-normal text-gray-500">
                    {currentTask.description}
                  </div>
                </div>

                {/* Days */}
                <div className="flex flex-col p-3">
                  <label className="text-base text-gray-800 font-medium mb-1">
                    Days <span className="text-destructive">*</span>
                  </label>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between bg-white border-gray-200 font-normal text-left text-sm"
                      >
                        <span className={currentTask.days.length === 0 ? "text-gray-400" : "truncate"}>
                          {currentTask.days.length === 0
                            ? "Select days"
                            : currentTask.days
                              .map((d) => WEEKDAYS.find((w) => w.value === d)?.label ?? d)
                              .join(", ")}
                        </span>
                        <ChevronDown className="size-4 shrink-0 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3" align="start">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {WEEKDAYS.map((d) => (
                          <label
                            key={d.value}
                            className="flex items-center gap-2 text-sm cursor-pointer rounded-md px-1 py-1.5 hover:bg-muted/60"
                          >
                            <Checkbox
                              checked={currentTask.days.includes(d.value)}
                              onCheckedChange={() => {
                                const list = currentTask.days;
                                const has = list.includes(d.value);
                                const updatedDays = has
                                  ? list.filter((day) => day !== d.value)
                                  : [...list, d.value];
                                updateGeneratedTaskField(generatedTaskIndex, "days", updatedDays);
                              }}
                            />
                            <span>{d.label}</span>
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time, From Date & To Date */}
                <div className="">
                  {/* Time */}
                  <div className="flex flex-col p-3">
                    <label className="text-base text-gray-800 font-medium mb-1">
                      Time <span className="text-destructive">*</span>
                    </label>
                    <div className="flex items-center gap-2 ">
                      {/* Hour Select */}
                      <Select
                        value={
                          currentTask.startDateTime
                            ? format(currentTask.startDateTime, "h")
                            : ""
                        }
                        onValueChange={(hourValue) => {
                          // Initialize with today's date if no date set yet
                          const currentDate = currentTask.startDateTime || new Date();
                          const newDate = new Date(currentDate);
                          const isPM = currentDate.getHours() >= 12;
                          let newHour = parseInt(hourValue, 10);
                          if (newHour === 12) {
                            newHour = isPM ? 12 : 0;
                          } else {
                            newHour = isPM ? newHour + 12 : newHour;
                          }
                          newDate.setHours(newHour);
                          updateGeneratedTaskField(generatedTaskIndex, "startDateTime", newDate);
                        }}
                      >
                        <SelectTrigger className="w-full bg-white border-gray-200">
                          <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                            <SelectItem key={hour} value={hour.toString()}>
                              {hour.toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <span className="text-gray-400 font-medium">:</span>

                      {/* Minute Select */}
                      <Select
                        value={
                          currentTask.startDateTime
                            ? format(currentTask.startDateTime, "mm")
                            : ""
                        }
                        onValueChange={(minuteValue) => {
                          // Initialize with today's date if no date set yet
                          const currentDate = currentTask.startDateTime || new Date();
                          const newDate = new Date(currentDate);
                          newDate.setMinutes(parseInt(minuteValue, 10));
                          updateGeneratedTaskField(generatedTaskIndex, "startDateTime", newDate);
                        }}
                      >
                        <SelectTrigger className="w-full bg-white border-gray-200">
                          <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                            <SelectItem key={minute} value={minute.toString().padStart(2, "0")}>
                              {minute.toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* AM/PM Select */}
                      <Select
                        value={
                          currentTask.startDateTime
                            ? format(currentTask.startDateTime, "aaa").toUpperCase()
                            : ""
                        }
                        onValueChange={(period) => {
                          // Initialize with today's date if no date set yet
                          const currentDate = currentTask.startDateTime || new Date();
                          const newDate = new Date(currentDate);
                          let currentHours = newDate.getHours();
                          if (period === "AM" && currentHours >= 12) {
                            currentHours = currentHours === 12 ? 0 : currentHours - 12;
                            newDate.setHours(currentHours);
                          } else if (period === "PM" && currentHours < 12) {
                            currentHours = currentHours === 0 ? 12 : currentHours + 12;
                            newDate.setHours(currentHours);
                          }
                          updateGeneratedTaskField(generatedTaskIndex, "startDateTime", newDate);
                        }}
                      >
                        <SelectTrigger className="w-full bg-white border-gray-200">
                          <SelectValue placeholder="AM/PM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* From Date */}
                  <div className='grid grid-cols-2'>
                    <div className="flex flex-col p-3">
                      <label className="text-base text-gray-800 font-medium mb-1">
                        Starting Date  <span className="text-destructive">*</span>
                      </label>
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-2 bg-white border-gray-200 text-left font-normal text-sm"
                          >
                            <CalendarIcon className="size-4 shrink-0 text-gray-500" />
                            {currentTask.startDateTime ? (
                              format(currentTask.startDateTime, "PPP")
                            ) : (
                              <span className="text-gray-400 text-sm">Select date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={currentTask.startDateTime || undefined}
                            onSelect={(day) => {
                              const base = currentTask.startDateTime ?? new Date();
                              const next = day
                                ? new Date(
                                  day.getFullYear(),
                                  day.getMonth(),
                                  day.getDate(),
                                  base.getHours(),
                                  base.getMinutes(),
                                  base.getSeconds()
                                )
                                : new Date();
                              updateGeneratedTaskField(generatedTaskIndex, "startDateTime", next);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* To Date */}
                    <div className="flex flex-col p-3">
                      <label className="text-base text-gray-800 font-medium mb-1">
                        End Date <span className="text-destructive">*</span>
                      </label>
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-2 bg-white border-gray-200 text-left font-normal text-sm"
                          >
                            <CalendarIcon className="size-4 shrink-0 text-gray-500" />
                            {currentTask.endDateTime ? (
                              format(currentTask.endDateTime, "PPP")
                            ) : (
                              <span className="text-gray-400 text-sm">Select date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={currentTask.endDateTime || undefined}
                            onSelect={(day) => {
                              updateGeneratedTaskField(generatedTaskIndex, "endDateTime", day || null);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="w-full mt-4">
              <Button
                onClick={handleConfigNextOrSubmit}
                disabled={createByDoctorLoading}
                className="w-full py-6 rounded-full bg-[#FF8045] hover:bg-[#E56A2E] text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {createByDoctorLoading ? (
                  <>
                    Creating Task...
                    <Loader className="size-4 text-white animate-spin" />
                  </>
                ) : generatedTaskIndex === generatedTasks.length - 1 ? (
                  <>
                    Create Tasks
                    <Check className="size-4 text-white" />
                  </>
                ) : (
                  <>
                    Configure Next Task
                    <ChevronRight className="size-4 text-white" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GenerateAiTaskModal;

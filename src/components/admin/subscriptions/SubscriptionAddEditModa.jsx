"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import useToast from "@/hooks/useToast";
import {
  useCreatePlanMutation,
  useGetPlanByIdQuery,
  useUpdatePlanMutation,
} from "@/redux/Apis/admin/planApi/planApi";
import { getImageUrl } from "@/utils/getImageUrl";
import { Check, ChevronsUpDown, Pencil, Upload, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SketchPicker = dynamic(
  () => import("react-color").then((m) => m.SketchPicker),
  { ssr: false },
);

const PLATFORM_OPTIONS = [
  { value: "apple", label: "Apple" },
  { value: "google", label: "Google" },
];

const DURATION_OPTIONS = [
  { value: "1 month", label: "1 month" },
  { value: "3 months", label: "3 months" },
  { value: "6 months", label: "6 months" },
  { value: "1 year", label: "1 year" },
];

const DEFAULT_BG = "#e0f2fe";
const DEFAULT_BUTTON = "#1e40af";
const DEFAULT_BUTTON_TEXT = "#ffffff";

const fieldHeight = "h-9";

/** ARGB32 bit-shift: ((a << 24) | (r << 16) | (g << 8) | b) >>> 0 */
function hexToDecimal(a, r, g, b) {
  return ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
}

/** Convert hex color string to ARGB32 integer (alpha = 255 by default) */
function colorToDecimal(hex, alpha = 255) {
  if (!hex || typeof hex !== "string") return hexToDecimal(alpha, 0, 0, 0);
  const cleaned = hex.replace(/^#/, "").trim().padEnd(6, "0").slice(0, 6);
  const num = parseInt(cleaned, 16);
  if (Number.isNaN(num)) return hexToDecimal(alpha, 0, 0, 0);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return hexToDecimal(alpha, r, g, b);
}



/** Convert ARGB32 integer (or decimal string) from API back to hex for color picker */
function decimalToHex(dec) {
  if (dec == null) return "";
  const num = typeof dec === "string" ? parseInt(dec, 10) : Number(dec);
  if (Number.isNaN(num)) return "";
  const rgb = num & 0xffffff;
  return `#${rgb.toString(16).padStart(6, "0")}`;
}

function ColorPickerField({ label, color, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium text-gray-700 leading-tight shrink-0">
        {label}
      </Label>
      <div className="flex items-center min-h-[36px]">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md border border-gray-200 p-1.5 hover:bg-gray-50 h-9 min-w-[2.25rem]"
            >
              <span
                className="h-6 w-6 rounded-full border border-gray-200 shadow-inner shrink-0"
                style={{ backgroundColor: color }}
              />
              <Pencil className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-0" align="start">
            <SketchPicker
              color={color}
              onChange={(c) => onChange(c.hex)}
              disableAlpha
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

/** Normalize API plan response — handles data.data (double-nested) or data */
function normalizePlanForForm(plan) {
  if (!plan) return null;
  const raw = plan?.data?.data ?? plan?.data ?? plan;
  return raw && typeof raw === "object" ? raw : plan;
}

function SubscriptionAddEditModal({
  openModal,
  setOpenModal,
  planData = null,
  onSuccess,
}) {
  const toast = useToast();
  const [createPlan, { isLoading: isCreateLoading }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdateLoading }] = useUpdatePlanMutation();
  const planId = planData?.id ?? planData?._id ?? null;
  const isEdit = Boolean(planId);

  const { data: planByIdResponse, isLoading: isLoadingPlan } =
    useGetPlanByIdQuery(
      { id: planId },
      { skip: !openModal || !planId },
    );

  const fullPlan = normalizePlanForForm(planByIdResponse) ?? planData;

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("1 month");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BG);
  const [buttonColor, setButtonColor] = useState(DEFAULT_BUTTON);
  const [buttonTextColor, setButtonTextColor] = useState(DEFAULT_BUTTON_TEXT);
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState([]);
  const [productId, setProductId] = useState("");
  const [totalBookings, setTotalBookings] = useState("");
  const [platform, setPlatform] = useState("");
  const [platformOpen, setPlatformOpen] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!openModal) return;
    if (isEdit && fullPlan) {
      setTitle(fullPlan.name ?? fullPlan.title ?? "");
      setSubtitle(fullPlan.subtitle ?? "");
      setPrice(String(fullPlan.price ?? ""));
      setDuration(fullPlan.duration ?? "1 month");
      const bg = fullPlan.backgroundColor ?? fullPlan.background_color;
      setBackgroundColor(
        typeof bg === "number" || (typeof bg === "string" && /^\d+$/.test(bg))
          ? decimalToHex(bg) || DEFAULT_BG
          : bg ?? DEFAULT_BG,
      );
      const btn = fullPlan.buttonColor ?? fullPlan.button_color;
      setButtonColor(
        typeof btn === "number" || (typeof btn === "string" && /^\d+$/.test(btn))
          ? decimalToHex(btn) || DEFAULT_BUTTON
          : btn ?? DEFAULT_BUTTON,
      );
      const btnTxt = fullPlan.buttonTextColor ?? fullPlan.button_text_color;
      setButtonTextColor(
        typeof btnTxt === "number" ||
          (typeof btnTxt === "string" && /^\d+$/.test(btnTxt))
          ? decimalToHex(btnTxt) || DEFAULT_BUTTON_TEXT
          : btnTxt ?? DEFAULT_BUTTON_TEXT,
      );
      const featureList =
        fullPlan.featureList ??
        fullPlan.featuresList ??
        fullPlan.features;
      setFeatures(
        Array.isArray(featureList)
          ? [...featureList]
          : typeof featureList === "string"
            ? featureList.split(";").filter(Boolean)
            : [],
      );
      setProductId(fullPlan.productId ?? "");
      setTotalBookings(
        String(
          fullPlan.scheduleBookingCount ??
          fullPlan.totalBookings ??
          fullPlan.schedule_booking_count ??
          "",
        ),
      );
      setPlatform(fullPlan.platform ?? "");
      setIsAiGenerated(Boolean(fullPlan.isAiGenerated));
      const imgRaw =
        fullPlan.image ?? fullPlan.imageUrl ?? fullPlan.image_url;
      const img =
        typeof imgRaw === "string"
          ? imgRaw
          : imgRaw && typeof imgRaw === "object" && imgRaw.url
            ? imgRaw.url
            : "";
      setImagePreview(img ? getImageUrl(img) : "");
    } else if (!isEdit) {
      setTitle("");
      setSubtitle("");
      setPrice("");
      setDuration("1 month");
      setBackgroundColor(DEFAULT_BG);
      setButtonColor(DEFAULT_BUTTON);
      setButtonTextColor(DEFAULT_BUTTON_TEXT);
      setFeatureInput("");
      setFeatures([]);
      setProductId("");
      setTotalBookings("");
      setPlatform("");
      setIsAiGenerated(false);
      setImagePreview("");
      setImageFile(null);
    }
    setErrors({});
  }, [openModal, isEdit, planByIdResponse, planData]);

  const handleAddFeature = () => {
    const text = featureInput.trim();
    if (!text) return;
    setFeatures((prev) => [...prev, text]);
    setFeatureInput("");
  };

  const handleRemoveFeature = (index) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const buildPlanFormData = () => {
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("subtitle", subtitle.trim());
    formData.append("price", price.trim() || "0");
    formData.append("backgroundColor", colorToDecimal(backgroundColor));
    formData.append("buttonColor", colorToDecimal(buttonColor));
    formData.append("buttonTextColor", colorToDecimal(buttonTextColor));
    formData.append("duration", duration);
    formData.append("scheduleBookingCount", totalBookings.trim() || "0");
    formData.append("productId", productId.trim());
    formData.append("platform", platform);
    formData.append("isAiGenerated", String(isAiGenerated));
    features.forEach((f) => formData.append("featureList", f.trim()));
    if (imageFile) formData.append("image", imageFile);
    return formData;
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Plan title is required.";
    if (!price.trim()) errs.price = "Price is required.";
    if (!platform) errs.platform = "Please select a platform.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const formData = buildPlanFormData();
    try {
      if (isEdit && planId) {
        await updatePlan({ id: planId, formData }).unwrap();
        toast.success("Plan updated successfully.");
      } else {
        await createPlan(formData).unwrap();
        toast.success("Plan created successfully.");
      }
      setOpenModal(false);
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.data?.message ?? err?.message ?? (isEdit ? "Failed to update plan." : "Failed to create plan.");
      toast.error(msg);
    }
  };

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-center text-lg font-semibold">
            {isEdit
              ? `${title || "Plan"} Plan`
              : "Create New Subscription Plan"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col min-h-0 flex-1 overflow-hidden"
        >
          <ScrollArea className="flex-1 min-h-0 overflow-auto">
            <div className="px-6 py-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Plan Title <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Enter your subscription plan name"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
                  className={`border-gray-200 ${fieldHeight} ${errors.title ? "border-red-500" : ""}`}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Plan Subtitle</Label>
                <Input
                  placeholder="Enter your subscription plan subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className={`border-gray-200 ${fieldHeight}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Price <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Enter plan price..."
                    value={price}
                    onChange={(e) => { setPrice(e.target.value); setErrors((p) => ({ ...p, price: "" })); }}
                    type="number"
                    min="0"
                    className={`border-gray-200 w-full ${fieldHeight} ${errors.price ? "border-red-500" : ""}`}
                  />
                  {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger
                      className={`w-full border-gray-200 ${fieldHeight}`}
                    >
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Image</Label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Upload className="h-7 w-7 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Upload image
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4 items-end">
                <ColorPickerField
                  label="Select Background Color"
                  color={backgroundColor}
                  onChange={setBackgroundColor}
                />
                <ColorPickerField
                  label="Select Button Color"
                  color={buttonColor}
                  onChange={setButtonColor}
                />
                <ColorPickerField
                  label="Select Button Text Color"
                  color={buttonTextColor}
                  onChange={setButtonTextColor}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Feature</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Add new feature here..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddFeature())
                    }
                    className={`flex-1 border-gray-200 ${fieldHeight}`}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className={`bg-gray-800 text-white hover:bg-gray-700 shrink-0 ${fieldHeight} px-4`}
                    onClick={handleAddFeature}
                  >
                    Add
                  </Button>
                </div>
                {features.length > 0 && (
                  <ScrollArea className="h-24 w-full rounded-md border border-gray-200 p-2 mt-2">
                    <div className="flex flex-wrap gap-2">
                      {features.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800"
                        >
                          {f}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(i)}
                            className="rounded p-0.5 hover:bg-gray-200"
                            aria-label="Remove"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Product ID</Label>
                <Input
                  placeholder="Enter product id here..."
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className={`border-gray-200 ${fieldHeight}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Chosen Platform <span className="text-red-500">*</span></Label>
                  <Popover open={platformOpen} onOpenChange={setPlatformOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={platformOpen}
                        className={`w-full justify-between border-gray-200 font-normal ${fieldHeight} ${errors.platform ? "border-red-500" : ""}`}
                      >
                        {platform
                          ? PLATFORM_OPTIONS.find((o) => o.value === platform)?.label
                          : "Select platform..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-1 w-[var(--radix-popover-trigger-width)]">
                      {PLATFORM_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100"
                          onClick={() => {
                            setPlatform(opt.value === platform ? "" : opt.value);
                            setPlatformOpen(false);
                            setErrors((p) => ({ ...p, platform: "" }));
                          }}
                        >
                          <Check
                            className={`h-4 w-4 shrink-0 ${platform === opt.value ? "opacity-100" : "opacity-0"}`}
                          />
                          {opt.label}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                  {errors.platform && <p className="text-xs text-red-500">{errors.platform}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">AI Generated Task</Label>
                  <div className={`flex items-center gap-3 border border-gray-200 rounded-md px-3 ${fieldHeight}`}>
                    <Switch
                      checked={isAiGenerated}
                      onCheckedChange={setIsAiGenerated}
                      id="isAiGenerated"
                    />
                    <label
                      htmlFor="isAiGenerated"
                      className="text-sm text-gray-600 cursor-pointer select-none"
                    >
                      {isAiGenerated ? "Enabled" : "Disabled"}
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Total Bookings</Label>
                <Input
                  placeholder="e.g. 2"
                  value={totalBookings}
                  onChange={(e) => setTotalBookings(e.target.value)}
                  type="number"
                  min="0"
                  className={`border-gray-200 ${fieldHeight}`}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t shrink-0 flex flex-row items-center justify-end">
            <Button
              type="submit"
              disabled={isCreateLoading || isUpdateLoading || (isEdit && isLoadingPlan)}
              className="bg-gray-800 hover:bg-gray-700 text-white h-9 px-4"
            >
              {isCreateLoading
                ? "Creating..."
                : isUpdateLoading
                  ? "Saving..."
                  : isEdit && isLoadingPlan
                    ? "Loading..."
                    : isEdit
                      ? "Save Changes"
                      : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionAddEditModal;

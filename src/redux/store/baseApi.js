import { getCookie } from "@/utils/cookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "./baseUrl";

//ok no problem 

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { endpoint, type, originalArgs }) => {
      // Get all tokens from cookies
      const accessToken = getCookie("accessToken");
      const token = getCookie("token");
      const verifyToken = getCookie("verifyToken");
      const forgetToken = getCookie("forgetToken");
      const resetPassToken = getCookie("resetPassToken");

      // Set Authorization header with accessToken (for authenticated requests)
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      // Set token header for specific auth endpoints
      // resendOtp and verifyEmail use forgetToken
      if (endpoint === "resendOtp" || endpoint === "verifyEmail") {
        if (forgetToken) {
          headers.set("token", forgetToken);
        }
      }

      // resetPassword uses resetPassToken
      if (endpoint === "resetPassword") {
        if (resetPassToken) {
          headers.set("token", resetPassToken);
        }
      }

      // Legacy token support (if needed)
      if (token && !accessToken) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      // Legacy verifyToken support (if needed)
      if (verifyToken) {
        headers.set("resettoken", verifyToken);
      }

      // RTK Query automatically handles FormData and won't set Content-Type for it
      // Only set Content-Type for JSON requests (not for FormData)
      // List of endpoints that use FormData
      const formDataEndpoints = [
        "updateMyProfile",
        "createCategory",
        "updateCategory",
        "createCourse",
        "updateCourse",
        "createArticle",
        "updateArticle",
        "sendMessage",
        "createPlan",
        "updatePlan",
      ];

      // Check if request body is FormData (dynamic detection)
      const isFormDataBody =
        originalArgs instanceof FormData ||
        originalArgs?.body instanceof FormData ||
        originalArgs?.formData instanceof FormData;

      const isFormDataRequest =
        formDataEndpoints.includes(endpoint) || isFormDataBody;

      // IMPORTANT: Do NOT set Content-Type for FormData requests.
      // fetchBaseQuery automatically sets 'multipart/form-data' with the correct boundary.
      // If we explicitly set 'application/json', it overrides and breaks FormData.
      if (!isFormDataRequest && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      return headers;
    },
  }),
  tagTypes: [
    "Auth",
    "Profile",
    "Dashboard",
    "UserManagement",
    "Course",
    "Category",
    "Article",
    "Post",
    "Faq",
    "Policy",
    "Report",
    "AdminManagement",
    "BhaManagement",
    "BhaaManagement",
    "BhaaClient",
    "BHaDashboard",
    "BHaaOverview",
    "SessionManagement",
    "AssignTask",
    "BhaReport",
    "TodaysSession",
    "BhaScheduleSlot",
    "Chat",
    "task",
    "Message",
    "Notification",
    "TargetDomain",
    "AssignReassign",
    "Plan",
  ],
  endpoints: () => ({}),
});

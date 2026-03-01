import { baseApi } from "@/redux/store/baseApi";

export const bhaScheduleSlotApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBhaScheduleSlotData: builder.query({
      query: () => ({
        url: `/doctor/me`,
        method: "GET",
      }),
      providesTags: ["BhaScheduleSlot", "SessionManagement"],
    }),
    getBhaScheduleSlotDate: builder.query({
      query: ({ date }) => ({
        url: `/doctor-booking/my-doctor-available-date`,
        method: "GET",
        params: { date },
      }),
      providesTags: ["BhaScheduleSlot", "SessionManagement"],
    }),
    getBhaDoctorAvailableSlots: builder.query({
      query: ({ startTime, endTime }) => ({
        url: `/doctor-booking/my-doctor-available-slots`,
        method: "GET",
        params: { startTime, endTime },
      }),
      providesTags: ["BhaScheduleSlot", "SessionManagement"],
    }),

    // Update availability - body: { startTime, endTime } (UTC ISO e.g. "2026-02-18T09:00:00.000Z")
    updateBhaAvailability: builder.mutation({
      query: (body) => ({
        url: `/doctor/update-availability`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["BhaScheduleSlot", "SessionManagement"],
    }),

    // Update or delete a slot - body: { action: "update"|"delete", id, startTime?, endTime? } (startTime/endTime only for update)
    doctorSlotsUpdateDelete: builder.mutation({
      query: (body) => ({
        url: `/doctor/slots-upate-delete`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["BhaScheduleSlot", "SessionManagement"],
    }),

    // Join the session
    joinSessionNow: builder.mutation({
      query: ({ bookingId }) => ({
        url: `/doctor-booking/agora-token`,
        method: "POST",
        body: {
          bookingSheduleId: bookingId,
        },
      }),
      invalidatesTags: ["SessionManagement", "BhaScheduleSlot"],
    }),

    leaveSessionNow: builder.mutation({
      query: ({ bookingId }) => ({
        url: `/doctor-booking/booking-session-close/${bookingId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["SessionManagement", "BhaScheduleSlot"],
    }),
    extendSessionFiveMinutes: builder.mutation({
      query: ({ bookingId }) => ({
        url: `/doctor-booking/extent-time`,
        method: "POST",
        body: {
          doctorBookingId: bookingId,
        },
      }),
      invalidatesTags: ["SessionManagement", "BhaScheduleSlot"],
    }),
  }),
});

export const {
  useGetBhaScheduleSlotDataQuery,
  useGetBhaScheduleSlotDateQuery,
  useGetBhaDoctorAvailableSlotsQuery,
  useUpdateBhaAvailabilityMutation,
  useDoctorSlotsUpdateDeleteMutation,
  useJoinSessionNowMutation,
  useLeaveSessionNowMutation,
  useExtendSessionFiveMinutesMutation,
} = bhaScheduleSlotApi;

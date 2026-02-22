import { baseApi } from "@/redux/store/baseApi";

export const sessionmanagementApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSessionManagementData: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        status = "All Status",
        startTime = "",
        endTime = "",
      } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (search) {
          params.append("searchTerm", search);
        }

        if (status && status !== "All Status") {
          params.append("status", status.toLowerCase());
        }

        if (startTime) {
          params.append("dayStartTime", startTime);
        }
        if (endTime) {
          params.append("dayEndTime", endTime);
        }

        return {
          url: `/doctor-booking/my-booking?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["SessionManagement"],
    }),
    getSessionManagementDataById: builder.query({
      query: ({ id }) => ({
        url: `/doctor-booking/${id}`,
        method: "GET",
      }),
      providesTags: ["SessionManagement"],
    }),
    getAvialableSlotsForReschedule: builder.query({
      query: ({ date }) => ({
        url: `/doctor-booking/my-doctor-available-date?date=${date}`,
        method: "GET",
      }),
      providesTags: ["SessionManagement"],
    }),
    rescheduleSession: builder.mutation({
      query: ({ bookingId, data }) => ({
        url: `/doctor-booking/reschedule-booking/${bookingId}`,
        method: "PATCH",
        body: data,
      }),

      invalidatesTags: ["SessionManagement"],
    }),

    getTimeSlotsForReschedule: builder.query({
      query: ({ startTime, endTime }) => ({
        url: `/doctor-booking/my-doctor-available-slots`,
        method: "GET",
        params: { startTime, endTime },
      }),
      providesTags: ["SessionManagement"],
    }),
  }),
});

export const {
  useGetSessionManagementDataQuery,
  useGetSessionManagementDataByIdQuery,
  useGetAvialableSlotsForRescheduleQuery,
  useRescheduleSessionMutation,
  useGetTimeSlotsForRescheduleQuery,
} = sessionmanagementApi;

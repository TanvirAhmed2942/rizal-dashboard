import { baseApi } from "@/redux/store/baseApi";

export const bhaamanagementApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBhaaManagementDataQuery: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        status = "All Status",
      } = {}) => {
        // Build query parameters
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        // Add search term if provided
        if (search) {
          params.append("searchTerm", search);
        }

        // Add isActive filter only if status is not "All Status"
        if (status !== "All Status") {
          const isActive = status === "Active" ? "true" : "false";
          params.append("isActive", isActive);
        }

        return {
          url: `/users/all-users?role=assistant&${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["BhaaManagement"],
    }),

    createBhaa: builder.mutation({
      query: (data) => ({
        url: `/users/create-doctor-assistant`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["BhaaManagement"],
    }),

    blockBhaa: builder.mutation({
      query: ({ id }) => ({
        url: `/users/blocked/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["BhaaManagement", "Dashboard"],
    }),
    deleteBhaa: builder.mutation({
      query: ({ id }) => ({
        url: `users/delete-account-by-admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BhaaManagement", "Dashboard"],
    }),
  }),
});

export const {
  useGetBhaaManagementDataQueryQuery,
  useBlockBhaaMutation,
  useCreateBhaaMutation,
  useDeleteBhaaMutation,
} = bhaamanagementApi;

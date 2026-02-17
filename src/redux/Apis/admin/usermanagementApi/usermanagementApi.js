import { baseApi } from "@/redux/store/baseApi";

export const usermanagementApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUserManagementData: builder.query({
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
          url: `/users/all-users?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["UserManagement"],
    }),
    blockUser: builder.mutation({
      query: ({ id }) => ({
        url: `/users/blocked/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["UserManagement", "Dashboard"],
    }),
    deleteUser: builder.mutation({
      query: ({ id }) => ({
        url: `users/delete-account-by-admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UserManagement", "Dashboard"],
    }),
  }),
});

export const {
  useGetUserManagementDataQuery,
  useBlockUserMutation,
  useDeleteUserMutation,
} = usermanagementApi;

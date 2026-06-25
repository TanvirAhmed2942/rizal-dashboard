import { baseApi } from "@/redux/store/baseApi";

export const adminmanagementApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminManagementDataQuery: builder.query({
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
          url: `/users/all-users?role=admin&${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["AdminManagement"],
    }),

    createAdmin: builder.mutation({
      query: (data) => ({
        url: `/users/create-doctor-assistant`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AdminManagement"],
    }),

    blockAdmin: builder.mutation({
      query: ({ id }) => ({
        url: `/users/blocked/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminManagement", "Dashboard"],
    }),
    deleteAdmin: builder.mutation({
      query: ({ id }) => ({
        url: `/users/delete-account-by-admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminManagement", "Dashboard"],
    }),

    getAllUsers: builder.query({
      query: ({ role, page = 1, limit = 10, search = "" } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (role) params.append("role", role);
        if (search) params.append("searchTerm", search);
        return {
          url: `/users/all-users?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["AdminManagement"],
    }),

    reassignBhaBhaaAdmin: builder.mutation({
      query: (data) => ({
        url: `/bha-bhaa-reassign/reassign-by-admin`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AdminManagement", "AssignReassign"],
    }),
  }),
});

export const {
  useGetAdminManagementDataQueryQuery,
  useBlockAdminMutation,
  useCreateAdminMutation,
  useDeleteAdminMutation,
  useGetAllUsersQuery,
  useReassignBhaBhaaAdminMutation,
} = adminmanagementApi;

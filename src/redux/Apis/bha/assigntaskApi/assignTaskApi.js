import { baseApi } from "@/redux/store/baseApi";

export const assignTaskApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAssignTaskData: builder.query({
      query: ({ id }) => ({
        url: `/task/schedule/${id}`,
        method: "GET",
      }),
      providesTags: ["AssignTask"],
    }),
    getAllTasks: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        status = "All Status",
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

        return {
          url: `/task?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["AssignTask"],
    }),
    createTask: builder.mutation({
      query: (formData) => ({
        url: "/task/create-task",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["AssignTask"],
    }),
    // updateTask: builder.mutation({
    //   query: ({ id, formData }) => ({
    //     url: `/task/update-task/${id}`,
    //     method: "PATCH",
    //     body: formData,
    //   }),
    //   invalidatesTags: ["AssignTask"],
    // }),
    deleteTask: builder.mutation({
      query: ({ id }) => ({
        url: `/task/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AssignTask"],
    }),

    generateGetAPi: builder.query({
      query: (userId) => ({
        url: `/task/domain-by-task?userId=${userId}`,
        method: "GET",
      }),
      providesTags: ["AssignTask"],
    }),

    generateByAi: builder.mutation({
      query: (data) => ({
        url: "/task/generate-by-ai",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AssignTask"],
    }),

    createByDoctor: builder.mutation({
      query: (data) => ({
        url: "/task/create-by-doctor",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AssignTask"],
    }),

  }),
});

export const {
  useGetAssignTaskDataQuery,
  useGetAllTasksQuery,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGenerateGetAPiQuery,
  useGenerateByAiMutation,
  useCreateByDoctorMutation,
} = assignTaskApi;

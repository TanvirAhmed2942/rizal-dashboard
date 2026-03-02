import { baseApi } from "@/redux/store/baseApi";

export const planApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPlanData: builder.query({
      query: ({ page, limit } = {}) => {
        const params = new URLSearchParams();
        if (page != null) params.set("page", String(page));
        if (limit != null) params.set("limit", String(limit));
        const query = params.toString();
        return {
          url: query ? `/package?${query}` : "/package",
          method: "GET",
        };
      },
      providesTags: ["Plan"],
    }),

    getPlanById: builder.query({
      query: ({ id }) => ({
        url: `/package/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, { id }) =>
        id ? [{ type: "Plan", id }] : ["Plan"],
    }),

    createPlan: builder.mutation({
      query: (formData) => {
        // FormData is sent as multipart/form-data; do not set Content-Type (baseApi handles it)
        return {
          url: "/package/create-package",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Plan"],
    }),

    updatePlan: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/package/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Plan"],
    }),
    deletePlan: builder.mutation({
      query: ({ id }) => ({
        url: `/package/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Plan"],
    }),
  }),
});

export const {
  useGetPlanDataQuery,
  useGetPlanByIdQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} = planApi;

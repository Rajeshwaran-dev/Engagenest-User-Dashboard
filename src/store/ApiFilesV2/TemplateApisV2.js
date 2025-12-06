import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const TemplateApisV2 = createApi({
  reducerPath: "TemplateApisV2",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}templates`,
    prepareHeaders: (headers) => {
      // Retrieve the token from local storage
      const loginDetails = JSON.parse(localStorage.getItem("loginData"));

      // If a token exists, add it to the headers
      if (loginDetails?.token) {
        headers.set("Authorization", `Bearer ${loginDetails?.token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    GetAllTemplates: builder.query({
      query: ({ limit, offset, search }) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        return `/?${params.toString()}`;
      },
      providesTags: ["Templates"],
    }),
    GetAllAprovedTemplates: builder.query({
      query: () => `/approved`,
      providesTags: ["Templates"],
    }),
    GetSampleTemplates: builder.query({
      query: () => `/sampletemplates`,
    }),
    SendTemplate: builder.mutation({
      query: ({ id, data }) => ({
        url: `/send/${id || ""}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Schedules"],
    }),
    CrateTemplate: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Templates"],
    }),
    GetCsvHeaders: builder.mutation({
      query: ({ id, data }) => ({
        url: `/getCSVHeaders`,
        method: "POST",
        body: data,
      }),
    }),
    CheckDuplicateCampainId: builder.mutation({
      query: (data) => ({
        url: `/checkIfCampaignExists`,
        method: "POST",
        body: data,
      }),
    }),
    DeleteTemplateById: builder.mutation({
      query: (data) => ({
        url: `/id/${data?.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Templates"],
    }),
    SubmitDraftTemplate: builder.mutation({
      query: (data) => ({
        url: `/submit/${data?.id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Templates"],
    }),
    GetAllSchedules: builder.query({
      query: (data) =>
        `getSchedules/${data?.offset}/${data?.limit}/${data?.groups}`,
      providesTags: ["Schedules"],
    }),
    cancelSchedule: builder.mutation({
      query: (data) => ({
        url: `/campaign/${data?.campaignId}/cancel`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Schedules"],
    }),
    reSchedule: builder.mutation({
      query: (data) => ({
        url: `/campaign/${data?.campaignId}/reschedule`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Schedules"],
    }),
  }),
});

export const {
  useGetAllTemplatesQuery,
  useSendTemplateMutation,
  useCrateTemplateMutation,
  useCheckDuplicateCampainIdMutation,
  useDeleteTemplateByIdMutation,
  useGetAllAprovedTemplatesQuery,
  useSubmitDraftTemplateMutation,
  useGetSampleTemplatesQuery,
  useGetAllSchedulesQuery,
  useCancelScheduleMutation,
  useReScheduleMutation,
} = TemplateApisV2;

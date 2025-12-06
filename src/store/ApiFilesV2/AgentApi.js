// AgentApi.js - CORRECTED VERSION
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const AgentApiV2 = createApi({
  reducerPath: "AgentApiV2", // FIXED: Changed from "agentApi" to "AgentApiV2"
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}agents`,
    prepareHeaders: headers => {
      const loginDetails = JSON.parse(localStorage.getItem("loginData"));
      if (loginDetails?.token) {
        headers.set("Authorization", `Bearer ${loginDetails?.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Agents", "AgentConfig", "DepartmentOptions"],
  endpoints: builder => ({
    // Get all agents
    GetALlAgents: builder.query({
      query: () => `/agents`,
      providesTags: ["Agents"],
    }),
    
    GetActiveAgents: builder.query({
      query: () => ({
        url: `/agents`,
        params: { activeOnly: "true" },
      }),
      providesTags: ["Agents"],
    }),

    // Create agent
    createAgent: builder.mutation({
      query: data => ({
        url: `/agents`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Agents"],
    }),

    // Edit agent
    editAgent: builder.mutation({
      query: body => ({
        url: `/agents`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Agents"],
    }),

    // Delete agent
    deleteAgent: builder.mutation({
      query: body => ({
        url: `/agents/${body?.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Agents"],
    }),

    // Toggle agent status (on/off)
    toggleAgentStatus: builder.mutation({
      query: ({ id, active }) => ({
        url: `/agents/${id}/toggle`,
        method: "PATCH",
        body: { active },
      }),
      invalidatesTags: ["Agents"],
    }),

    // Change password - FIXED: Renamed endpoint to match import
    changePassword: builder.mutation({
      query: body => ({
        url: `/agent-password`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Agents"],
    }),

    // Save department options
    saveDepartmentOptions: builder.mutation({
      query: options => ({
        url: `/department-options`,
        method: "POST",
        body: { options },
      }),
      invalidatesTags: ["DepartmentOptions"],
    }),

    // Get department options
    getDepartmentOptions: builder.query({
      query: () => `/department-options`,
      providesTags: ["DepartmentOptions"],
    }),

    // Get agent configuration
    getAgentConfig: builder.query({
      query: id => `/agents/${id}/config`,
      providesTags: (result, error, id) => [{ type: "AgentConfig", id }],
      transformResponse: response => {
        return {
          ...response,
          config: response.config || {},
          agent: response.agent || null,
        };
      },
      transformErrorResponse: response => {
        return {
          error: response.data?.error || true,
          message: response.data?.msg || "Failed to fetch agent configuration",
          status: response.status,
        };
      },
    }),

    // Save agent configuration
    saveAgentConfig: builder.mutation({
      query: ({ id, configType, configData }) => ({
        url: `/agents/${id}/config`,
        method: "POST",
        body: { configType, configData },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "AgentConfig", id }],
      transformResponse: response => {
        return {
          ...response,
          data: response.data || null,
        };
      },
      transformErrorResponse: response => {
        return {
          error: response.data?.error || true,
          message: response.data?.msg || "Failed to save configuration",
          errors: response.data?.errors || [],
          status: response.status,
        };
      },
    }),
  }),
});

export const {
  useGetALlAgentsQuery,
  useGetActiveAgentsQuery,
  useCreateAgentMutation,
  useEditAgentMutation,
  useDeleteAgentMutation,
  useGetAgentConfigQuery,
  useSaveAgentConfigMutation,
  useToggleAgentStatusMutation,
  useSaveDepartmentOptionsMutation,
  useGetDepartmentOptionsQuery,
  useChangePasswordMutation,
} = AgentApiV2;
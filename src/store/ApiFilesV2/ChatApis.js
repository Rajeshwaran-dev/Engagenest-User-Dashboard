import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ChatAPisV2 = createApi({
  reducerPath: "ChatAPisV2",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}chat`,
    prepareHeaders: headers => {
      // Retrieve the token from local storage
      const loginDetails = JSON.parse(localStorage.getItem("loginData"));

      // If a token exists, add it to the headers
      if (loginDetails?.token) {
        headers.set("Authorization", `Bearer ${loginDetails?.token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Agents"],
  endpoints: builder => ({
    GetAllSessionChats: builder.query({
      query: data => {
        const { offset, limit, filter, search, agent } = data;
        let url = `/session/${offset}/${limit}/${filter || "all"}/${search}`;
        if (agent && !["all", "unread", "read", "replied"].includes(filter)) {
          url += `?agent=${agent}`;
        }

        return url;
      },
    }),

    GetAllLiveChatById: builder.query({
      query: data => `/${data?.contactNumber}/0/${data?.limit}`,
    }),
    GetAllHistoryChat: builder.query({
      query: data => `/history/${data?.offset}/${data?.limit}/${data?.search}`, //sidebar data
    }),
    SendRegularChatMsg: builder.mutation({
      query: body => ({
        url: `/sendchat`,
        method: "POST",
        body: body,
      }),
    }),

    //Agent apis
    GetALlAgents: builder.query({
      query: () => `/agents`,
      providesTags: ["Agents"],
    }),
    CreateAgent: builder.mutation({
      query: data => ({
        url: `/agents`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Agents"],
    }),
    EditAgent: builder.mutation({
      query: body => ({
        url: `/agents`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Agents"],
    }),
    DeleteAgent: builder.mutation({
      query: body => ({
        url: `/agents/${body?.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Agents"],
    }),
    AssignAgent: builder.mutation({
      query: data => ({
        url: `/assignagent`,
        method: "POST",
        body: data,
      }),
    }),
    GetAllAssignedAgents: builder.query({
      query: data => `/assignedagents/${data?.id}`,
    }),
    GetInterveneData: builder.query({
      query: data => `/intervene/${data?.number}`,
    }),
    GetCustomerJourney: builder.query({
      query: data => "/customer-journey",
    }),
    GetQuickReply: builder.query({
      query: data => `/quick-reply`,
    }),
    AddNotes: builder.mutation({
      query: data => ({
        url: `/addnotes`,
        method: "POST",
        body: data,
      }),
    }),

    DeleteNote: builder.mutation({
      query: ({ number, note }) => ({
        url: `/notes`, // The endpoint to delete a note by number and note content
        method: "DELETE",
        body: { number, note }, // Pass number and note in the request body
      }),
    }),

    UpdateIntervene: builder.mutation({
      query: data => ({
        url: `/intervene`,
        method: "POST",
        body: data,
      }),
    }),
    MarkUnread: builder.mutation({
      query: data => ({
        url: `/markread`,
        method: "POST",
        body: data,
      }),
    }),
    blockUser: builder.mutation({
      query: data => ({
        url: `/blockuser`,
        method: "PATCH",
        body: data,
      }),
    }),
    DeleteQuickReplyById: builder.mutation({
      query: data => ({
        url: `/id/${data?.id}`,
        method: "DELETE",
      }),
    }),
    editQuickReply: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/edit-quickreply/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    sendQuickReply: builder.mutation({
      query: data => ({
        url: `/quick-reply`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    }),
  }),
});

export const {
  useGetAllSessionChatsQuery,
  useGetAllLiveChatByIdQuery,
  useSendRegularChatMsgMutation,
  useGetAllHistoryChatQuery,
  useGetInterveneDataQuery,
  useGetCustomerJourneyQuery,
  useGetQuickReplyQuery,
  useMarkUnreadMutation,
  useDeleteQuickReplyByIdMutation,
  //agentApis
  useGetALlAgentsQuery,
  useCreateAgentMutation,
  useAssignAgentMutation,
  useGetAllAssignedAgentsQuery,
  useAddNotesMutation,
  useUpdateInterveneMutation,
  useEditAgentMutation,
  useDeleteAgentMutation,
  useDeleteNoteMutation,
  useSendQuickReplyMutation,
  useEditQuickReplyMutation,
  useBlockUserMutation,
} = ChatAPisV2;
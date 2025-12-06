import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const UserApis = createApi({
  reducerPath: "UserApis",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}users`,
    prepareHeaders: (headers) => {
      // Retrieve the token from local storage
      const loginDetails = JSON.parse(localStorage.getItem("loginData"));
      if (loginDetails?.token) {
        headers.set("Authorization", `Bearer ${loginDetails?.token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    GetUserSentDeleveredData: builder.mutation({
      query: (data) => ({
        url: `/getDeliveryMessageChart`,
        method: "POST",
        body: data,
      }),
    }),
    CheckForUserDuplicateCampNames: builder.mutation({
      query: (data) => ({
        url: `/checkDublicateCampaignName`,
        method: "POST",
        body: data,
      }),
    }),
    GetUserBalance: builder.query({
      query: (data) => `/getUserBalance`,
    }),
    GetTotalConversations: builder.query({
      query: (data) => `/totalConversation/all`,
    }),
    GetUserCampaignHistory: builder.query({
      query: (data) => `/getCompaignHistory/all`,
    }),
    userAgreed: builder.mutation({
      query: (data) => ({ url: "/user-agreed", method: "POST" }),
    }),
    deleteApi: builder.mutation({
      query: (id) => ({
        url: `/api_key/${id}`,
        method: "DELETE",
      }),
    }),

    // Add more endpoints here
  }),
});

export const {
  useGetUserSentDeleveredDataMutation,
  useCheckForUserDuplicateCampNamesMutation,
  // useGetUserBalanceQuery,
  // useGetTotalConversationsQuery,
  useGetUserCampaignHistoryQuery,
  useUserAgreedMutation,
  useDeleteApiMutation,
} = UserApis;

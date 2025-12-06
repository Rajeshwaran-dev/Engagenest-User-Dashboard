// src/services/yourApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const MessageApis = createApi({
  reducerPath: "MessageApis",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}message`,
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
  endpoints: builder => ({
    SendTemplateMessage: builder.mutation({
      query: data => ({
        url: `/sendTemplateMessage`,
        method: "POST",
        body: data,
      }),
    }),
    GetAllMessageReports: builder.mutation({
      query: data => ({
        url: `/getAllMessageReports`,
        method: "POST",
        body: data,
      }),
    }),

    // Add more endpoints here
  }),
});

export const {
  useSendTemplateMessageMutation,
  useGetAllMessageReportsMutation,
} = MessageApis;

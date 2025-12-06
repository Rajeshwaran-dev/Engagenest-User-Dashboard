import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const FileHandlerApisV2 = createApi({
  reducerPath: "FileHandlerApisV2",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}filehandler`,
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
    UploadFile: builder.mutation({
      query: ({ formData, foldername }) => ({
        url: `/upload/${foldername || ""}`,
        method: "POST",
        body: formData,
      }),
    }),
    GetCsvHeaders: builder.mutation({
      query: data => ({
        url: `/csvheaders`,
        method: "POST",
        body: data,
      }),
    }),

    // Add more endpoints here
  }),
});

export const { useUploadFileMutation, useGetCsvHeadersMutation } =
  FileHandlerApisV2;

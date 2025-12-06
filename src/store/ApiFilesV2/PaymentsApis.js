import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const PaymentsApis = createApi({
  reducerPath: "PaymentsApis",
  tagTypes: ["WalletTransactions"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}payments`,
    prepareHeaders: (headers, { extra }) => { 
      // Retrieve the token from local storage
      const loginDetails = JSON.parse(localStorage.getItem("loginData"));

      // If a token exists, add it to the headers
      if (loginDetails?.token) {
        headers.set("Authorization", `Bearer ${loginDetails?.token}`);
      }
      
      // Check if extra exists and has contentType
      if (extra?.contentType === "text/html") {
        headers.set("Content-Type", "text/html");
      } else {
        headers.set("Content-Type", "application/json");
      }
      return headers;
    },
  }),
  endpoints: builder => ({
    AddWallet: builder.mutation({
      query: data => ({
        url: `/addWallet`,
        method: "POST",
        body: data,
        // Remove the extra property from here, pass it in prepareHeaders instead
      }),
      invalidatesTags: ["WalletTransactions"], // Add this to invalidate cache
    }),
    UploadChallan: builder.mutation({
      query: body => ({
        url: `/upload-challan`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["WalletTransactions"],
    }),
    GetWalletTransactions: builder.query({
      query: () => `/get-wallet-transactions`,
      providesTags: ["WalletTransactions"],
    }),
  }),
});

export const {
  useAddWalletMutation,
  useUploadChallanMutation,
  useGetWalletTransactionsQuery,
} = PaymentsApis;

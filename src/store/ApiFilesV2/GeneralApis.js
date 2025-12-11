// src/services/yourApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const GeneralApisV2 = createApi({
  reducerPath: "GeneralApisV2",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}general`,
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
    GetAllCountries: builder.query({
      query: () => `/countries`,
    }),
    GetAllLanguages: builder.query({
      query: () => `/languages`,
    }),
  }),
});

export const { useGetAllCountriesQuery, useGetAllLanguagesQuery } =
  GeneralApisV2;

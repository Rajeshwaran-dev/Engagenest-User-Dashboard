// src/services/yourApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ContactsApi = createApi({
  reducerPath: "Contacts",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}contacts`,
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
    // GetContacts: builder.mutation({
    //   query: () => ({
    //     url: `/get_all_contacts`,
    //     method: "GET",
    //   }),
    // }),
    // GetContactGroups: builder.mutation({
    //   query: () => ({
    //     url: `/get_all_groups`,
    //     method: "GET",
    //   }),
    // }),
    // GetContactAllGroups: builder.query({
    //   query: () => `/get_all_groups`,
    // }),
    // AddContactGroup: builder.mutation({
    //   query: (body) => ({
    //     url: `/add_group`,
    //     method: "POST",
    //     body: body,
    //   }),
    // }),
    GetUiContacts: builder.mutation({
      query: () => ({
        url: `/get_all_uicontacts`,
        method: "GET",
      }),
    }),
    UpdateContactTags: builder.mutation({
      query: data => ({
        url: `/UpdateTags`,
        method: "POST",
        body: data,
      }),
    }),
    CreateNewContact: builder.mutation({
      query: data => ({
        url: `/add_contact`,
        method: "POST",
        body: data,
      }),
    }),
    DeleteOneContact: builder.mutation({
      query: data => ({
        url: `/delete_contact`,
        method: "POST",
        body: data,
      }),
    }),
    FetchUploadedFiles: builder.mutation({
      query: data => ({
        url: `/get_upload_files`,
        method: "POST",
        body: data,
      }),
    }),
    GetContactsByGroupId: builder.mutation({
      query: data => ({
        url: `/get_contactnumber_by_group`,
        method: "POST",
        body: data,
      }),
    }),

    // Add more endpoints here
  }),
});

export const {
  // useGetContactsMutation,
  // useGetContactGroupsMutation,
  // useAddContactGroupMutation,
  useGetUiContactsMutation,
  useUpdateContactTagsMutation,
  useCreateNewContactMutation,
  useDeleteOneContactMutation,
  useFetchUploadedFilesMutation,
  useGetContactsByGroupIdMutation,
  // useGetContactAllGroupsQuery,
} = ContactsApi;

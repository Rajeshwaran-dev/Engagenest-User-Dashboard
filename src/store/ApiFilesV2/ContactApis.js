import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

console.log(process.env.REACT_APP_API_URL);
export const ContactsApiV2 = createApi({
  reducerPath: "ContactsApiV2",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}contacts`,

    prepareHeaders: (headers, { getState }) => {
      const loginDetails = JSON.parse(localStorage.getItem("loginData"));
      if (loginDetails?.token) {
        headers.set("Authorization", `Bearer ${loginDetails.token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Contacts", "Groups"],
  endpoints: (builder) => ({
    GetAllContactGroups: builder.query({
      query: () => `/groups`,
      providesTags: ["Groups"],
    }),
    CreateContactGroup: builder.mutation({
      query: (body) => ({
        url: `/groups`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Groups"],
    }),
    GetAllContacts: builder.query({
      query: ({ offset = 0, limit = 100, groups = "null" } = {}) => {
        const groupParam =
          !groups || groups === "null" || groups === "" ? "null" : groups;
        return `/${offset}/${limit}/${groupParam}`;
      },
      providesTags: ["Contacts"],
    }),
    SearchContactNumber: builder.mutation({
      query: (body) => ({
        url: `/searchByNumber`,
        method: "POST",
        body: body,
      }),
    }),
    ImportContacts: builder.mutation({
      query: (body) => ({
        url: `/import`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Contacts", "Groups"],
    }),
    CreateContact: builder.mutation({
      query: (body) => ({
        url: `/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Contacts", "Groups"],
    }),
    DeleteContactById: builder.mutation({
      query: (body) => ({
        url: `/id/${body?.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contacts", "Groups"],
    }),
    DeleteContacts: builder.mutation({
      query: (body) => ({
        url: `/`,
        method: "DELETE",
        body: { ids: body?.ids },
      }),
      invalidatesTags: ["Contacts", "Groups"],
    }),
    EditContact: builder.mutation({
      query: ({ id, contact }) => ({
        url: `/id/${id}`,
        method: "PATCH",
        body: { id, contact },
      }),
      invalidatesTags: ["Contacts", "Groups"],
    }),
    DeleteGroup: builder.mutation({
      query: (body) => ({
        url: `/groups/${encodeURIComponent(body?.name)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Groups", "Contacts"],
    }),
    EditGroup: builder.mutation({
      query: ({ oldName, newName }) => ({
        url: `/groups/${oldName}`, // Backend expects group name in URL
        method: "PATCH",
        body: { newName },
      }),
      invalidatesTags: ["Groups", "Contacts"],
    }),
    GetSearchContacts: builder.query({
      query: ({ limit = 10, offset = 0, search = "" }) => {
        const params = new URLSearchParams();
        params.append("limit", limit.toString());
        params.append("offset", offset.toString());
        params.append("search", search);
        return `/search?${params.toString()}`;
      },
    }),
    GetContactsByGroups: builder.mutation({
      query: (body) => ({
        url: `/groupsByName`,
        method: "POST",
        body: body,
      }),
    }),
    moveContactToGroup: builder.mutation({
      query: ({ contactId, currentGroups, targetGroup }) => ({
        url: "/moveContact",
        method: "POST",
        body: { contactId, currentGroups, targetGroup },
      }),
    }),
    copyContact: builder.mutation({
      query: ({ contactId, targetGroup }) => ({
        url: "/copyContact",
        method: "POST",
        body: { contactId, targetGroup },
      }),
    }),
    exportOneContact: builder.mutation({
      query: (id) => ({
        url: `/exportOneContact/${id}`,
        method: "GET",
      }),
      invalidatesTags: ["Contacts"],
    }),

    exportAllContacts: builder.query({
      query: () => ({
        url: `/exportAllContacts`,
        method: "GET",
      }),
      providesTags: ["Contacts"],
    }),
    moveOneContact: builder.mutation({
      query: ({ currentGroup, newGroup }) => ({
        url: `/moveGroup`,
        method: "POST",
        body: { currentGroup, newGroup },
      }),
      invalidatesTags: ["Groups", "Contacts"],
    }),
    copyGroup: builder.mutation({
      query: ({ currentGroup, sourceGroup }) => ({
        url: `/copyGroup`,
        method: "POST",
        body: { currentGroup, sourceGroup },
      }),
      invalidatesTags: ["Contacts", "Groups"],
    }),
  }),
});

export const {
  useCreateContactGroupMutation,
  useGetAllContactGroupsQuery,
  useGetAllContactsQuery,
  useImportContactsMutation,
  useCreateContactMutation,
  useDeleteContactByIdMutation,
  useEditContactMutation,
  useDeleteGroupMutation,
  useEditGroupMutation,
  useGetSearchContactsQuery,
  useSearchContactNumberMutation,
  useGetContactsByGroupsMutation,
  useDeleteContactsMutation,
  useMoveContactToGroupMutation,
  useCopyContactMutation,
  useExportOneContactMutation,
  useExportAllContactsQuery,
  useMoveOneContactMutation,
  useCopyGroupMutation,
} = ContactsApiV2;

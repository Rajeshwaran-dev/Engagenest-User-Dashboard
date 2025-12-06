import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import CryptoJS from "crypto-js"; // make sure you have this installed (npm i crypto-js)

// 🔒 decrypt helper — must match your backend encryption logic
const decryptToken = (encryptedToken) => {
  try {
    const key = process.env.REACT_APP_ENCRYPTION_KEY; // same key used in backend
    const bytes = CryptoJS.AES.decrypt(encryptedToken, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || encryptedToken; // fallback to original if decryption fails
  } catch (err) {
    console.warn("Token decryption failed:", err.message);
    return encryptedToken;
  }
};

export const ProfileApis = createApi({
  reducerPath: "ProfileApis",
  tagTypes: ["Profile"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}users`,
    prepareHeaders: (headers) => {
      const loginDetails = JSON.parse(localStorage.getItem("loginData"));
      let token = loginDetails?.token;

      if (token) {
        token = decryptToken(token); // ✅ Decrypt before sending
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => `/profile`,
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: `/profile`,
        method: "PATCH",
        body: profileData,
      }),
    }),
    removeProfilePicture: builder.mutation({
      query: () => ({
        url: `/profile`,
        method: "PATCH",
        body: { profile_picture_url: "" },
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useRemoveProfilePictureMutation,
} = ProfileApis;

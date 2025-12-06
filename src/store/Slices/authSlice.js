// store/slices/exampleSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  routes: [],
  role: "",
  sideBarRoutes: [],
  lockStatus: "",
  // Add more initial state variables as needed
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setRoutes: (state, action) => {
      state.routes = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setSideBarRoutes: (state, action) => {
      state.sideBarRoutes = action.payload;
    },
    setLockStatus: (state, action) => {
      state.lockStatus = action.payload;
    },

    // Add more reducers as needed
  },
});

export const {
  setRoutes,
  setRole,
  setSideBarRoutes,
  setLockStatus,
  setSiteSettings,
} = authSlice.actions;

export default authSlice.reducer;

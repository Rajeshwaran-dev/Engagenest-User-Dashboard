import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { UserApisV2 } from "./ApiFilesV2/UserApis";
import { ContactsApiV2 } from "./ApiFilesV2/ContactApis";
import { FileHandlerApisV2 } from "./ApiFilesV2/FileHandlerApis";
import { ProfileApis } from "./ApiFiles/ProfileApis";
import { PaymentsApis } from "./ApiFilesV2/PaymentsApis";
import { TemplateApisV2 } from "./ApiFilesV2/TemplateApisV2";
import { AgentApiV2 } from "./ApiFilesV2/AgentApi";
import { GeneralApisV2 } from "./ApiFilesV2/GeneralApis";

import authslice from "./Slices/authSlice";

export const store = configureStore({
  reducer: {
    [ProfileApis.reducerPath]: ProfileApis.reducer,
    [UserApisV2.reducerPath]: UserApisV2.reducer,
    [ContactsApiV2.reducerPath]: ContactsApiV2.reducer,
    [FileHandlerApisV2.reducerPath]: FileHandlerApisV2.reducer,
    [PaymentsApis.reducerPath]: PaymentsApis.reducer,
    [AgentApiV2.reducerPath]: AgentApiV2.reducer,
    [TemplateApisV2.reducerPath]: TemplateApisV2.reducer,
    [GeneralApisV2.reducerPath]: GeneralApisV2.reducer,
    auth: authslice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "ContactsApiV2/executeQuery/fulfilled",
          "ContactsApiV2/executeQuery/rejected",
        ],
        ignoredPaths: ["ContactsApiV2.queries", "ContactsApiV2.mutations"],
      },
    })
      .concat(ProfileApis.middleware)
      .concat(UserApisV2.middleware)
      .concat(ContactsApiV2.middleware)
      .concat(FileHandlerApisV2.middleware)
      .concat(PaymentsApis.middleware)
      .concat(AgentApiV2.middleware)
      .concat(TemplateApisV2.middleware)
      .concat(GeneralApisV2.middleware),
});

setupListeners(store.dispatch);

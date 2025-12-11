import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import moment from "moment";

export const UserApisV2 = createApi({
  reducerPath: "UserApisV2",
  tagTypes: [
    "Campaigns",
    "Role",
    "Conversations",
    "Broadcast",
    "APIMessages",
    "WebhookConfig",
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}users`,
    prepareHeaders: (headers) => {
      const loginDetails = JSON.parse(localStorage.getItem("loginData"));

      if (loginDetails?.token) {
        headers.set("Authorization", `Bearer ${loginDetails?.token}`);
      }

      return headers;
    },
  }),
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    UserRegister: builder.mutation({
      query: (formData) => ({
        url: "/register",
        method: "POST",
        body: formData,
      }),
    }),
    UserLogin: builder.mutation({
      query: (formData) => ({
        url: "/login",
        method: "POST",
        body: formData,
      }),
    }),
    ForgetPassword: builder.query({
      query: ({ domain, email }) =>
        `/forget-password?domain=${domain}&email=${encodeURIComponent(email)}`,
    }),
    ForgetPasswordOtp: builder.mutation({
      query: (data) => ({
        url: "/forget-otp",
        method: "POST",
        body: data,
      }),
    }),
    ResetPassword: builder.mutation({
      query: (data) => ({
        url: "/reset-password",
        method: "POST",
        body: data,
      }),
    }),
    VerifySignInOtp: builder.mutation({
      query: (data) => ({
        url: "/verify-signinotp",
        method: "POST",
        body: data,
      }),
    }),
    GetUserAttr: builder.query({
      query: () => `/userattr`,
      transformResponse: (response) => {
        let respArr =
          response?.data?.userAttr &&
          typeof response?.data?.userAttr === "object"
            ? Object.entries(response?.data?.userAttr)?.map(([key, val]) => ({
                key,
                val,
              }))
            : [];
        return respArr;
      },
    }),
    GetUserDetails: builder.query({
      query: () => `/userattr`,
    }),
    GetUserAllCountries: builder.query({
      query: () => `/user-countries`,
    }),
    CreateUserAttr: builder.mutation({
      query: (data) => ({
        url: "/userattr",
        method: "POST",
        body: data,
      }),
    }),
    UpdateUserAttr: builder.mutation({
      query: (data) => ({
        url: "/userattr",
        method: "PATCH",
        body: data,
      }),
    }),
    ChangeUserPassword: builder.mutation({
      query: (data) => ({
        url: "/change-user-password",
        method: "PATCH",
        body: data,
      }),
    }),
    GetCampaignReport: builder.query({
      query: (data) => `/exportCampaign/${data?.id}`,
      transformResponse: (data) => {
        return data;
      },
    }),
    GetAllApiCampaigns: builder.query({
      query: () => `/apiBroadcastReport`,
    }),
    DeleteUserAttr: builder.mutation({
      query: (data) => ({
        url: `/userattr/${data?.attrName}`,
        method: "DELETE",
      }),
    }),
    GetAllCampains: builder.query({
      query: () => `/campaigns`,
    }),
    GetCampaignData: builder.query({
      query: (data) => {
        const encodedId = encodeURIComponent(data?.id);
        return `/campaignInfo/${encodedId}/${data?.offset}/${data?.limit}/${data?.number}?startDate=${data?.startDate}&endDate=${data?.endDate}`;
      },
    }),
    GetUserBalance: builder.query({
      query: () => `/userbalance`,
    }),
    GetSuspendStatus: builder.query({
      query: () => `/suspend-status`,
    }),
    GetTotalConvo: builder.query({
      query: (data) => `/totalConversations/${data?.filter}`,
    }),
    GetUserRole: builder.query({
      query: () => `/userrole`,
      providesTags: ["Role"],
    }),
    GetBroadCastChart: builder.query({
      query: (data) =>
        `/broadcastChart?startDate=${data?.startDate}&endDate=${data?.endDate}`,
      transformResponse: (response) => {
        let options = {
          chart: {
            type: "line",
            height: 350,
            animations: {
              enabled: true,
              easing: "easeinout",
              speed: 800,
            },
            toolbar: {
              show: false,
            },
            zoom: {
              enabled: false,
            },
          },
          colors: ["#2563EB", "#059669", "#DC2626"],
          dataLabels: {
            enabled: false,
          },
          stroke: {
            show: true,
            curve: "smooth",
            width: 3,
            lineCap: "round",
          },
          // Updated markers configuration
          markers: {
            size: 0, // Set to 0 to hide markers by default
            colors: ["#2563EB", "#059669", "#DC2626"],
            strokeColors: "#fff",
            strokeWidth: 0,
            hover: {
              size: 7, // Show markers only on hover
              strokeColors: "#fff",
              strokeWidth: 2,
            },
          },
          grid: {
            borderColor: "#f1f1f1",
            strokeDashArray: 4,
            xaxis: {
              lines: {
                show: true,
              },
            },
            yaxis: {
              lines: {
                show: true,
              },
            },
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 10,
            },
          },
          legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
            fontSize: "13px",
            fontWeight: 500,
            markers: {
              width: 10,
              height: 10,
              radius: 10,
            },
            itemMargin: {
              horizontal: 15,
              vertical: 5,
            },
          },
          xaxis: {
            categories: [],
            labels: {
              style: {
                fontSize: "12px",
                fontWeight: 500,
              },
            },
            axisBorder: {
              show: true,
            },
            axisTicks: {
              show: true,
            },
          },
          yaxis: {
            labels: {
              style: {
                fontSize: "12px",
              },
            },
          },
          tooltip: {
            shared: true,
            intersect: false,
          },
        };

        if (response?.length > 0) {
          let newCategories = [];
          const series1 = [
            { name: "Sent", data: [] },
            { name: "Delivered", data: [] },
            { name: "Read", data: [] },
          ];

          response?.forEach((item) => {
            const date = moment(item?._id, "DD/MM/YYYY").format("MMM DD");
            newCategories.push(date);
            series1[0].data.push(parseInt(item.sent_count));
            series1[1].data.push(parseInt(item.delivered_count));
            series1[2].data.push(parseInt(item.read_count));
          });

          options["xaxis"]["categories"] = newCategories;
          return {
            options: options,
            newCategories: newCategories,
            series: series1,
            sent_count: series1[0].data.reduce((acc, val) => acc + val, 0),
            delivered_count: series1[1].data.reduce((acc, val) => acc + val, 0),
            read_count: series1[2].data.reduce((acc, val) => acc + val, 0),
          };
        }

        return {
          options: options,
          series: [
            { name: "Sent", data: [] },
            { name: "Delivered", data: [] },
            { name: "Read", data: [] },
          ],
          sent_count: 0,
          delivered_count: 0,
          read_count: 0,
        };
      },
    }),
    GetApiBroadCastChart: builder.query({
      query: (data) =>
        `/apiBroadcastChart?startDate=${data?.startDate}&endDate=${data?.endDate}`,
      transformResponse: (response) => {
        let options = {
          chart: {
            type: "line",
            height: 350,
            animations: {
              enabled: true,
              easing: "easeinout",
              speed: 800,
            },
            toolbar: {
              show: false,
            },
            zoom: {
              enabled: false,
            },
          },
          colors: ["#2563EB", "#059669", "#DC2626"],
          dataLabels: {
            enabled: false,
          },
          stroke: {
            show: true,
            curve: "smooth",
            width: 3,
            lineCap: "round",
          },
          // Updated markers configuration
          markers: {
            size: 0, // Set to 0 to hide markers by default
            colors: ["#2563EB", "#059669", "#DC2626"],
            strokeColors: "#fff",
            strokeWidth: 0,
            hover: {
              size: 7, // Show markers only on hover
              strokeColors: "#fff",
              strokeWidth: 2,
            },
          },
          grid: {
            borderColor: "#f1f1f1",
            strokeDashArray: 4,
            xaxis: {
              lines: {
                show: true,
              },
            },
            yaxis: {
              lines: {
                show: true,
              },
            },
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 10,
            },
          },
          legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
            fontSize: "13px",
            fontWeight: 500,
            markers: {
              width: 10,
              height: 10,
              radius: 10,
            },
            itemMargin: {
              horizontal: 15,
              vertical: 5,
            },
          },
          xaxis: {
            categories: [],
            labels: {
              style: {
                fontSize: "12px",
                fontWeight: 500,
              },
            },
            axisBorder: {
              show: true,
            },
            axisTicks: {
              show: true,
            },
          },
          yaxis: {
            labels: {
              style: {
                fontSize: "12px",
              },
            },
          },
          tooltip: {
            shared: true,
            intersect: false,
          },
        };

        if (response?.length > 0) {
          let newCategories = [];
          const series1 = [
            { name: "Sent", data: [] },
            { name: "Delivered", data: [] },
            { name: "Read", data: [] },
          ];

          response?.forEach((item) => {
            const date = moment(item?._id, "DD/MM/YYYY").format("MMM DD");
            newCategories.push(date);
            series1[0].data.push(parseInt(item.sent_count));
            series1[1].data.push(parseInt(item.delivered_count));
            series1[2].data.push(parseInt(item.read_count));
          });

          options["xaxis"]["categories"] = newCategories;
          return {
            options: options,
            newCategories: newCategories,
            series: series1,
            sent_count: series1[0].data.reduce((acc, val) => acc + val, 0),
            delivered_count: series1[1].data.reduce((acc, val) => acc + val, 0),
            read_count: series1[2].data.reduce((acc, val) => acc + val, 0),
          };
        }

        return {
          options: options,
          series: [
            { name: "Sent", data: [] },
            { name: "Delivered", data: [] },
            { name: "Read", data: [] },
          ],
          sent_count: 0,
          delivered_count: 0,
          read_count: 0,
        };
      },
    }),
    GetUserInvoices: builder.query({
      query: () => `/invoices`,
      transformResponse: (response) => {
        return response || [];
      },
    }),
    GetUserCostUsage: builder.query({
      query: (data) =>
        `/conversationCost?startDate=${data?.startDate}&endDate=${data?.endDate}`,
    }),
    GetGlobalCampReport: builder.mutation({
      query: (data) => ({
        url: "/globalcampaignreport",
        method: "POST",
        body: data,
      }),
    }),
    SendOtp: builder.mutation({
      query: (data) => ({
        url: "/otp",
        method: "POST",
        body: data,
      }),
    }),
    VerifyOtp: builder.mutation({
      query: (data) => ({
        url: "/verifyOtp",
        method: "POST",
        body: data,
      }),
    }),
    GenerateApiKeys: builder.mutation({
      query: (data) => ({
        url: "/generateAPIKey",
        method: "POST",
        body: data,
      }),
    }),
    EmbeddedSignUp: builder.mutation({
      query: (data) => ({
        url: "/embeddedSignUp",
        method: "POST",
        body: data,
      }),
    }),
    UpdateDialogFlow: builder.mutation({
      query: (data) => ({
        url: "/configureChatbot",
        method: "POST",
        body: data,
      }),
    }),
    UpdateUserAttr: builder.mutation({
      query: (data) => ({
        url: "/update-userattr",
        method: "PUT",
        body: data,
      }),
    }),
    UpdateUserAttrKey: builder.mutation({
      query: (data) => ({
        url: "/userattr",
        method: "PATCH",
        body: data,
      }),
    }),
    GetUnsubscribedContacts: builder.query({
      query: () => `/unsubscribed`,
    }),
    GetUiContacts: builder.query({
      query: () => `/uicontacts`,
    }),
    GetHourlyBilling: builder.query({
      query: (data) =>
        `/costAnalytics?startDate=${data?.startDate}&endDate=${data?.endDate}`,
    }),
    GetBillingAnalytics: builder.query({
      query: (data) =>
        `/costAnalytics?startDate=${data?.startDate || ""}&endDate=${
          data?.endDate || ""
        }`,
      transformResponse: (response) => {
        return response?.data || [];
      },
    }),
    GetBillingReports: builder.query({
      query: (data) =>
        `/conversationCost?startDate=${data?.startDate || ""}&endDate=${
          data?.endDate || ""
        }`,
      transformResponse: (response) => {
        return (
          response || {
            marketing: 0,
            utility: 0,
            authentication: 0,
            service: 0,
            business: 0,
            user: 0,
            total: 0,
          }
        );
      },
    }),

    PayWithWallet: builder.mutation({
      query: (data) => ({
        url: "/pay-with-wallet",
        method: "POST",
        body: data,
      }),
    }),
    GetSiteConfig: builder.query({
      query: (data) => `/siteconfig?site=${data?.site}`,
    }),
    GetApieys: builder.query({
      query: () => `/apiKeys`,
    }),
    GetActiveSessionCount: builder.query({
      query: () => `/activeSessionCount`,
    }),
    GetDialogFlow: builder.query({
      query: () => `/chatbotconfig`,
    }),
    GetAllUiContacts: builder.query({
      query: () => `/allAicontacts`,
    }),
    GetSearchUiContacts: builder.query({
      query: ({ limit, offset, search }) => {
        const params = new URLSearchParams();
        if (limit) params.append("limit", limit);
        if (search) params.append("search", search);
        if (offset) params.append("offset", offset);
        return `/uicontacts?${params.toString()}`;
      },
    }),

    // Webhook Configuration Endpoints
    SaveApiConfig: builder.mutation({
      query: (data) => ({
        url: "/config-webhook",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["WebhookConfig"],
    }),

    getSampleWebhook: builder.query({
      query: () => `/send-sample-webhook`,
      keepUnusedDataFor: 0,
    }),

    getSampleReportWebhook: builder.query({
      query: () => `/send-sample-reportWebhook`,
      keepUnusedDataFor: 0,
    }),

    getSaveApiConfig: builder.query({
      query: () => `/config-webhook`,
      providesTags: ["WebhookConfig"],
      transformResponse: (response) => ({
        url: response?.url || "",
        headers: response?.headers || [],
        events: response?.events || ["All"],
      }),
    }),

    getCountryNames: builder.query({
      query: () => `/get-countries`,
    }),

    getSaveReportConfig: builder.query({
      query: () => `/config-report-webhook`,
      providesTags: ["WebhookConfig"],
      transformResponse: (response) => ({
        url: response?.url || "",
        headers: response?.headers || [],
      }),
    }),

    SaveReportConfig: builder.mutation({
      query: (data) => ({
        url: "/config-report-webhook",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["WebhookConfig"],
    }),

    getLoginHistory: builder.query({
      query: () => `/login-history`,
    }),

    ResetWebhookConfig: builder.mutation({
      query: (type) => ({
        url: `/config-webhook?type=${type}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WebhookConfig"],
    }),

    AddUiContact: builder.mutation({
      query: ({ contactnumber, tag }) => ({
        url: `/addTag`,
        method: "POST",
        body: { contactnumber, tag },
      }),
    }),
    DeleteUiContact: builder.mutation({
      query: ({ contactnumber, tag }) => ({
        url: `/deleteTag`,
        method: "POST",
        body: { contactnumber, tag },
      }),
    }),
    UserAttrDelete: builder.mutation({
      query: (data) => ({
        url: `/delAttr/${data?.attrName}`,
        method: "DELETE",
      }),
    }),
    triggerStatus: builder.mutation({
      query: ({ value, item }) => ({
        url: `/triggerStatus`,
        method: "POST",
        body: { value, item },
      }),
    }),
  }),
});

export const {
  useUserRegisterMutation,
  useUserLoginMutation,
  useForgetPasswordOtpMutation,
  useGetUserAttrQuery,
  useCreateUserAttrMutation,
  useUpdateUserAttrMutation,
  useDeleteUserAttrMutation,
  useGetAllCampainsQuery,
  useGetUserBalanceQuery,
  useGetTotalConvoQuery,
  useGetUserRoleQuery,
  useGetBroadCastChartQuery,
  useGetCampaignDataQuery,
  useGetCampaignReportQuery,
  useGetApiBroadCastChartQuery,
  useGetAllApiCampaignsQuery,
  useGetGlobalCampReportMutation,
  useGetUserCostUsageQuery,
  useGetUnsubscribedContactsQuery,
  useGetUiContactsQuery,
  useGetHourlyBillingQuery,
  useGetSiteConfigQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGenerateApiKeysMutation,
  useGetApieysQuery,
  useGetActiveSessionCountQuery,
  useEmbeddedSignUpMutation,
  useGetDialogFlowQuery,
  useUpdateDialogFlowMutation,
  useGetSuspendStatusQuery,
  useGetSearchUiContactsQuery,
  useChangeUserPasswordMutation,
  useLazyGetAllUiContactsQuery,
  useGetUserDetailsQuery,
  useSaveApiConfigMutation,
  useGetSaveApiConfigQuery,
  useLazyGetSampleWebhookQuery,
  useLazyGetSampleReportWebhookQuery,
  useGetUserAllCountriesQuery,
  useLazyForgetPasswordQuery,
  useResetPasswordMutation,
  useVerifySignInOtpMutation,
  useGetCountryNamesQuery,
  useUpdateUserAttrKeyMutation,
  useResetWebhookConfigMutation,
  useGetSaveReportConfigQuery,
  useSaveReportConfigMutation,
  useGetLoginHistoryQuery,
  useAddUiContactMutation,
  useDeleteUiContactMutation,
  useUserAttrDeleteMutation,
  useTriggerStatusMutation,
  useGetBillingAnalyticsQuery,
  useGetBillingReportsQuery,
  useGetUserInvoicesQuery,
  usePayWithWalletMutation,
} = UserApisV2;

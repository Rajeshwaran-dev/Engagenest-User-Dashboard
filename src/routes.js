import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MasterLayout from "./masterLayout/MasterLayout";

import Dashboard from "./components/Screens/Dashboard/Dashboard";
import ComposeMessage from "./components/Screens/ComposeMessage/ComposeMessage";
import LiveChat from "./components/Screens/Chat/LiveChat/LiveChat";
import ChatHistory from "./components/Screens/Chat/ChatHistory/ChatHistory";
import ChatAgent from "./components/Screens/Chat/ChatAgent/ChatAgent";
import Contacts from "./components/Screens/Contacts/Contact/Contacts";
import UiContacts from "./components/Screens/Contacts/UiContact/UiContacts";
import Unsubscribe from "./components/Screens/Contacts/Unsubscribes/UnSubscribes";
import ManageGroups from "./components/Screens/Contacts/Contact/ManageGroups";
import ManageTemplate from "./components/Screens/ManageTemplate/ManageTemplate";
import BroadcastLogs from "./components/Screens/Reports/BroadcastLogs/BroadcastLogs";
import ApiLogs from "./components/Screens/Reports/ApiLogs/ApiLogs";
import SchduledLogs from "./components/Screens/Reports/SheduleLogs/ScheduleLogs";
import Billing from "./components/Screens/Billing/Billing";
import WhatsappFlows from "./components/Screens/WhatsappFlows/Table/WhatsappFlows";
import Integration from "./components/Screens/Integration/Integration";
import Payments from "./components/Screens/Payments/Payments";
import Catalog from "./components/Screens/Catalog/ProductCatalog/Catalog";
import Orders from "./components/Screens/Catalog/OrderNotify/Orders";
import Coupons from "./components/Screens/Catalog/Coupon/Coupons";
import FailoverTrigger from "./components/Screens/FailoverTrigger/FailoverTrigger";
import DialogFlow from "./components/Screens/Settings/DialogFlowIntegration/DialogFlow";
import ApiSettings from "./components/Screens/Settings/ApiConfiguration/ApiSettings";
import UserAttributes from "./components/Screens/Settings/UserDataFeild/UserAttributes";
import WhatsAppQRGenerator from "./components/Screens/Settings/QrCode/QrCode";
import ChatbotBuilder from "./components/Screens/ChatbotBuilder/Table/ChatbotTable";
import Products from "./components/Screens/Catalog/ProductCatalog/Products";

import ShopifyDescription from "./components/Screens/Integration/Shopify/Description";
import ShopifyConfiguration from "./components/Screens/Integration/Shopify/Configuration";
import ShopifyFlow from "./components/Screens/Integration/Shopify/Flow";
import WooCommerceDescription from "./components/Screens/Integration/WooCommerce/Description";
import WooCommerceConfiguration from "./components/Screens/Integration/WooCommerce/Configuration";
import WooCommerceFlow from "./components/Screens/Integration/WooCommerce/Flow";
import WebEngageConfiguration from "./components/Screens/Integration/WebEngage/Configuration";

import Profile from "./components/Screens/Profile/Profile";
import Signin from "./components/Screens/Authentication/Signin";
import Signup from "./components/Screens/Authentication/Signup";
import ChatbotFlowBuilder from "./components/Screens/ChatbotBuilder/Flow/ChatbotFlowBuilder";
import ErrorLayer from "./components/ErrorLayer";
import Subscriptions from "./components/Screens/Subscriptions/Subscriptions";

import LeadsDashboard from "./components/Screens/Leads/LeadsDashboard";
import Leads from "./components/Screens/Leads/Leads";
import LeadsSetup from "./components/Screens/Leads/LeadsSetup";

import AppointmentDashboard from "./components/Screens/Appointments/AppointmentDashboard";
import Bookings from "./components/Screens/Appointments/Bookings";
import AppointmentPayment from "./components/Screens/Appointments/AppointmentPayment";
import Setup from "./components/Screens/Appointments/SetUp";
import BookingConfiguration from "./components/Screens/Appointments/BookingConfiguration";

import TicketingDashboard from "./components/Screens/Ticketing/TicketDashboard";
import Tickets from "./components/Screens/Ticketing/Ticket";
import FreshworksSettings from "./components/Screens/Ticketing/FreshworksSettings";
import TicketDetailPage from "./components/Screens/Ticketing/Components/TicketDetailPage";

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    {/* <Route path="/" element={<Signin />} /> */}
    <Route path="/signup" element={<Signup />} />

    {/* Protected Routes */}
    <Route element={<ProtectedRoute />}>
      <Route element={<MasterLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/composemessage" element={<ComposeMessage />} />
        <Route path="/livechat" element={<LiveChat />} />
        <Route path="/chathistory" element={<ChatHistory />} />
        <Route path="/chatagent" element={<ChatAgent />} />
        <Route path="/contact" element={<Contacts />} />
        <Route path="/uicontact" element={<UiContacts />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="/managegroups" element={<ManageGroups />} />
        <Route path="/managetemplate" element={<ManageTemplate />} />
        <Route path="/broadcastlogs" element={<BroadcastLogs />} />
        <Route path="/apilogs" element={<ApiLogs />} />
        <Route path="/leads-dashboard" element={<LeadsDashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/leads-configuration" element={<LeadsSetup />} />
        <Route
          path="/appointments-dashboard"
          element={<AppointmentDashboard />}
        />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/appointment-payments" element={<AppointmentPayment />} />
        <Route
          path="/booking-configuration"
          element={<BookingConfiguration />}
        />
        <Route path="/appointments-configuration" element={<Setup />} />
        <Route path="/ticketing-dashboard" element={<TicketingDashboard />} />

        {/* ✅ FIXED: Both ticket routes now inside MasterLayout */}
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
        <Route
          path="/ticketing-configuration"
          element={<FreshworksSettings />}
        />
        <Route path="/schedulelogs" element={<SchduledLogs />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/whatsappflows" element={<WhatsappFlows />} />
        <Route path="/integration" element={<Integration />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/failovertrigger" element={<FailoverTrigger />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/dialogflow" element={<DialogFlow />} />
        <Route path="/apisettings" element={<ApiSettings />} />
        <Route path="/userattributes" element={<UserAttributes />} />
        <Route path="/qrcode" element={<WhatsAppQRGenerator />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/automation" element={<ChatbotBuilder />} />
        <Route path="/products" element={<Products />} />
        <Route path="/chatbotflowbuilder" element={<ChatbotFlowBuilder />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/shopifydescription" element={<ShopifyDescription />} />
        <Route
          path="/shopifyconfiguration"
          element={<ShopifyConfiguration />}
        />
        <Route path="/shopifyflow" element={<ShopifyFlow />} />
        <Route
          path="/woocommercedescription"
          element={<WooCommerceDescription />}
        />
        <Route
          path="/woocommerceconfiguration"
          element={<WooCommerceConfiguration />}
        />
        <Route path="/woocommerceflow" element={<WooCommerceFlow />} />
        <Route
          path="/webengageconfiguration"
          element={<WebEngageConfiguration />}
        />
      </Route>
    </Route>

    {/* 404 */}
    <Route path="*" element={<ErrorLayer />} />
  </Routes>
);

export default AppRoutes;
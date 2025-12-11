import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import Spinner from "./components/Spinner";

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

// Shopify Components - Correct paths based on your file structure
import ShopifyDescription from "./components/Screens/Integration/Shopify/Description";
import ShopifyConfiguration from "./components/Screens/Integration/Shopify/Configuration";
import ShopifyFlow from "./components/Screens/Integration/Shopify/Flow";

// WooCommerce Components - Correct paths based on your file structure
import WooCommerceDescription from "./components/Screens/Integration/WooCommerce/Description";
import WooCommerceConfiguration from "./components/Screens/Integration/WooCommerce/Configuration";
import WooCommerceFlow from "./components/Screens/Integration/WooCommerce/Flow";

import WebEngageConfiguration from "./components/Screens/Integration/WebEngage/Configuration";

import Profile from "./components/Screens/Profile/Profile";
import Signin from "./components/Screens/Authentication/Signin";
import Signup from "./components/Screens/Authentication/Signup";
import { SnackbarProvider } from "notistack";
import ChatbotFlowBuilder from "./components/Screens/ChatbotBuilder/Flow/ChatbotFlowBuilder";
import ErrorLayer from "./components/ErrorLayer";
import Subscriptions from "./components/Screens/Subscriptions/Subscriptions";

function App() {
  // const [loading, setLoading] = useState(true);

  // Simulate initial app loading - 2 seconds
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 100); // 2 seconds

  //   return () => clearTimeout(timer);
  // }, []);

  // if (loading) {
  //   return (
  //     <Spinner
  //       size="large"
  //       overlay={true}
  //       text="Initializing Engagenest..."
  //     />
  //   );
  // }

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <BrowserRouter>
        <RouteScrollToTop />
        <Routes>
          <Route exact path="/" element={<Signin />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoute />}>
            <Route exact path="/dashboard" element={<Dashboard />} />
            <Route exact path="/composemessage" element={<ComposeMessage />} />
            <Route exact path="/livechat" element={<LiveChat />} />
            <Route exact path="/chathistory" element={<ChatHistory />} />
            <Route exact path="/chatagent" element={<ChatAgent />} />
            <Route exact path="/contact" element={<Contacts />} />
            <Route exact path="/uicontact" element={<UiContacts />} />
            <Route exact path="/unsubscribe" element={<Unsubscribe />} />
            <Route exact path="/managegroups" element={<ManageGroups />} />
            <Route exact path="/managetemplate" element={<ManageTemplate />} />
            <Route exact path="/broadcastlogs" element={<BroadcastLogs />} />
            <Route exact path="/apilogs" element={<ApiLogs />} />
            <Route exact path="/schedulelogs" element={<SchduledLogs />} />
            <Route exact path="/billing" element={<Billing />} />
            <Route exact path="/whatsappflows" element={<WhatsappFlows />} />
            <Route exact path="/integration" element={<Integration />} />
            <Route exact path="/payments" element={<Payments />} />
            <Route exact path="/catalog" element={<Catalog />} />
            <Route exact path="/orders" element={<Orders />} />
            <Route
              exact
              path="/failovertrigger"
              element={<FailoverTrigger />}
            />
            <Route exact path="/coupons" element={<Coupons />} />
            <Route exact path="/dialogflow" element={<DialogFlow />} />
            <Route exact path="/apisettings" element={<ApiSettings />} />
            <Route exact path="/userattributes" element={<UserAttributes />} />
            <Route exact path="/qrcode" element={<WhatsAppQRGenerator />} />
            <Route exact path="/profile" element={<Profile />} />
            <Route exact path="/automation" element={<ChatbotBuilder />} />
            <Route exact path="/products" element={<Products />} />
            <Route
              exact
              path="/chatbotflowbuilder"
              element={<ChatbotFlowBuilder />}
            />
            <Route exact path="/subscriptions" element={<Subscriptions />} />
            <Route
              exact
              path="/shopifydescription"
              element={<ShopifyDescription />}
            />
            <Route
              exact
              path="/shopifyconfiguration"
              element={<ShopifyConfiguration />}
            />
            <Route exact path="/shopifyflow" element={<ShopifyFlow />} />
            <Route
              exact
              path="/woocommercedescription"
              element={<WooCommerceDescription />}
            />
            <Route
              exact
              path="/woocommerceconfiguration"
              element={<WooCommerceConfiguration />}
            />
            <Route
              exact
              path="/woocommerceflow"
              element={<WooCommerceFlow />}
            />
            <Route
              exact
              path="/webengageconfiguration"
              element={<WebEngageConfiguration />}
            />
          </Route>

          <Route exact path="*" element={<ErrorLayer />} />
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  );
}

export default App;

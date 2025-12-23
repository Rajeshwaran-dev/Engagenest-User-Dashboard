import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
// Layout
import MasterLayout from "./components/layout/MasterLayout";

// Screens
import Dashboard from "./components/Screens/Dashboard/";
import ComposeMessage from "./components/Screens/ComposeMessage/ComposeMessage";
import LiveChat from "./components/Screens/Chat/LiveChat";
import ChatHistory from "./components/Screens/Chat/ChatHistory";
import ChatAgent from "./components/Screens/Chat/ChatAgent";
import Contacts from "./components/Screens/Contacts/Contacts";
import UiContacts from "./components/Screens/Contacts/UiContacts";
import UnSubscribes from "./components/Screens/Contacts/UnSubscribes";
import ManageTemplates from "./components/Screens/ManageTemplates";
import ViewProfile from "./components/Screens/ViewProfile";
import NotFound from "./components/Screens/NotFound";

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Layout wrapper component
const LayoutWrapper = () => {
  return (
    
      <Outlet />
    
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default route redirects to dashboard */}
      <Route path="/" element={<Navigate to="/Dashboard" replace />} />
      
      {/* Dashboard route without layout */}
      <Route path="/Dashboard" element={
        
          <Dashboard />
        
      } />

      {/* All other routes with layout */}
      <Route path="/" element={<LayoutWrapper />}>
        {/* Single Message - Fixed path to match your sidebar */}
        <Route path="/ComposeMessage" element={<ComposeMessage />} />

        {/* Chat Routes */}
        <Route path="/LiveChat" element={<LiveChat />} />
        <Route path="/ChatHistory" element={<ChatHistory />} />
        <Route path="/ChatAgent" element={<ChatAgent />} />

        {/* Contact Routes */}
        <Route path="contacts" element={<Contacts />} />
        <Route path="UiContacts" element={<UiContacts />} />
        <Route path="UnSubscribes" element={<UnSubscribes />} />

        {/* Templates */}
        <Route path="manage-templates" element={<ManageTemplates />} />

        {/* Profile */}
        <Route path="view-profile" element={<ViewProfile />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

// Alternative with lazy loading (Recommended for production)
const AppRoutesWithLazyLoading = () => {
  // Lazy load components
  const Dashboard = React.lazy(() => import("./components/Screens/Dashboard"));
  const ComposeMessage = React.lazy(() => import("./components/Screens/ComposeMessage/ComposeMessage"));
  const LiveChat = React.lazy(() => import("./components/Screens/Chat/LiveChat"));
  const ChatHistory = React.lazy(() => import("./components/Screens/Chat/ChatHistory"));
  const ChatAgent = React.lazy(() => import("./components/Screens/Chat/ChatAgent"));
  // const Contacts = React.lazy(() => import("./components/Screens/Contacts/Contacts"));
  // const UiContacts = React.lazy(() => import("./components/Screens/Contacts/UiContacts"));
  // const UnSubscribe = React.lazy(() => import("./components/Screens/Contacts/UnSubscribes"));

  const LayoutWrapper = () => {
    return (
      
        <Outlet />
      
    );
  };

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Navigate to="/Dashboard" replace />} />
        
        <Route path="/Dashboard" element={
          
            <Dashboard />
          
        } />

        <Route path="/" element={<LayoutWrapper />}>
          <Route path="/ComposeMessage" element={<ComposeMessage />} />
          <Route path="/LiveChat" element={<LiveChat />} />
          <Route path="/ChatHistory" element={<ChatHistory />} />
          <Route path="/ChatAgent" element={<ChatAgent />} />
          <Route path="/Contacts" element={<Contacts/>} />
          <Route path="/UiContacts" element={<UiContacts />} />
          <Route path="/UnSubscribe" element={<UnSubscribe />} />
          {/* ... other routes */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes; // or AppRoutesWithLazyLoading for better performance
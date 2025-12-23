import React, { useState, useMemo } from "react";
import { Layout, Typography, Input, Row, Col, Card, Button } from "antd";
import { SearchOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import DashboardSection from "./Components/DashboardSection";
import NotificationSettings from "./Components/NotificationSettings";
import WebhookSettings from "./Components/WebhookSettings";
import QuickReplySettings from "./Components/QuickReplySettings";
import VideoNoteSettings from "./Components/VideoNoteSettings";
import BusinessHours from "./Components/BusinessHours";
import SlaPolicies from "./Components/SlaPolicies";
// import TatTab from "./TatTab";
import FeedbackModal from "./FeedbackModal";
// import TicketingFlowsTab from "./components/FlowsTab";
import DepartmentSettings from "./Components/DepartmentSettings";
import FlowsConfiguration from "./FlowsConfiguration";
import Breadcrumb from "../../Breadcrumb";
import MasterLayout from "../../../masterLayout/MasterLayout";

const { Title, Text } = Typography;
const { Search } = Input;

// Static departments data for TatTab
const staticDepartments = [
  { id: "1", name: "Sales" },
  { id: "2", name: "Support" },
  { id: "3", name: "Technical" },
  { id: "4", name: "Billing" },
  { id: "5", name: "General" },
];

const FreshworksSettings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [recentItems, setRecentItems] = useState([
    "Business Hours",
    "SLA Policies",
    "Alerts Configuration",
  ]);
  const [activeSection, setActiveSection] = useState("dashboard");

  // Settings categories configuration
  const settingsCategories = [
    {
      title: "General",
      items: [
        {
          key: "departments",
          title: "Department Configuration",
          description: "Customize Departments and properties",
          icon: "codesandbox",
          tags: ["fields", "custom", "properties"],
        },
        {
          key: "flows",
          title: "Ticket Form",
          description: "Customize Flows and properties",
          icon: "git-merge",
          tags: ["fields", "custom", "properties"],
        },
        {
          key: "business-hours",
          title: "Business Hours",
          description: "Set your business hours and working days",
          icon: "clock",
          tags: ["hours", "time", "schedule"],
        },
        // {
        //   key: "tat",
        //   title: "TAT Configuration",
        //   description: "Customize TAT and properties",
        //   icon: "clock",
        //   tags: ["fields", "custom", "properties"],
        // },
      ],
    },
    {
      title: "Notification",
      items: [
        {
          key: "notifications",
          title: "Alerts Configuration",
          description: "Configure automated notifications for ticket events",
          icon: "bell",
          tags: ["notifications", "alerts", "automation"],
        },
        {
          key: "webhook",
          title: "Webhook",
          description: "Configure webhook endpoints for real-time events",
          icon: "globe",
          tags: ["webhook", "api", "integration"],
        },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          key: "quick-reply",
          title: "Quick Reply",
          description: "Set up quick reply templates for faster responses",
          icon: "message-square",
          tags: ["quick", "reply", "templates"],
        },
        {
          key: "video-note",
          title: "Video Note",
          description: "Configure video note templates and settings",
          icon: "video",
          tags: ["video", "multimedia", "notes"],
        },
      ],
    },
    {
      title: "Ticket Management",
      items: [
        {
          key: "sla-policies",
          title: "SLA Policies",
          description: "Set response and resolution time policies",
          icon: "alert-circle",
          tags: ["sla", "policies", "time", "response"],
        },
        // {
        //   key: "feedback-management",
        //   title: "Feedbacks",
        //   description: "Configure Feedbacks and ratings",
        //   icon: "SmileOutlined",
        //   tags: ["satisfaction", "feedback", "ratings"],
        // },
      ],
    },
  ];

  const handleSearch = value => {
    setSearchTerm(value);
    if (value && filteredItems.length > 0) {
      const newRecent = [
        value,
        ...recentItems.filter(item => item !== value),
      ].slice(0, 6);
      setRecentItems(newRecent);
    }
  };

  const handleCardClick = itemKey => {
    setActiveSection(itemKey);
    const item = settingsCategories
      .flatMap(cat => cat.items)
      .find(item => item.key === itemKey);
    if (item) {
      const newRecent = [
        item.title,
        ...recentItems.filter(recent => recent !== item.title),
      ].slice(0, 6);
      setRecentItems(newRecent);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm) return [];
    const allItems = settingsCategories.flatMap(category => category.items);
    return allItems.filter(
      item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [searchTerm, settingsCategories]);

  const renderContent = () => {
    const sectionComponents = {
      dashboard: (
        <DashboardSection
          searchTerm={searchTerm}
          recentItems={recentItems}
          settingsCategories={settingsCategories}
          filteredItems={filteredItems}
          onSearch={handleSearch}
          onCardClick={handleCardClick}
        />
      ),
      notifications: (
        <NotificationSettings onBack={() => setActiveSection("dashboard")} />
      ),
      webhook: <WebhookSettings onBack={() => setActiveSection("dashboard")} />,
      "quick-reply": (
        <QuickReplySettings onBack={() => setActiveSection("dashboard")} />
      ),
      "video-note": (
        <VideoNoteSettings onBack={() => setActiveSection("dashboard")} />
      ),
      "business-hours": (
        <BusinessHours onBack={() => setActiveSection("dashboard")} />
      ),
      "sla-policies": (
        <SlaPolicies onBack={() => setActiveSection("dashboard")} />
      ),
      flows: (
        <SectionWrapper
          title='Ticket Form'
          onBack={() => setActiveSection("dashboard")}
        >
          <FlowsConfiguration />
        </SectionWrapper>
      ),
      departments: (
        <SectionWrapper
          title='Department Configuration'
          onBack={() => setActiveSection("dashboard")}
        >
          <DepartmentSettings />
        </SectionWrapper>
      ),
      // tat: (
      //   <SectionWrapper
      //     title='TAT Configuration'
      //     onBack={() => setActiveSection("dashboard")}
      //   >
      //     <TatTab departments={staticDepartments} />
      //   </SectionWrapper>
      // ),
      "feedback-management": (
        <SectionWrapper
          title='Feedback Management'
          onBack={() => setActiveSection("dashboard")}
        >
          <FeedbackModal />
        </SectionWrapper>
      ),
    };

    return (
      sectionComponents[activeSection] || (
        <SectionWrapper
          title={
            settingsCategories
              .flatMap(cat => cat.items)
              .find(item => item.key === activeSection)?.title || "Settings"
          }
          onBack={() => setActiveSection("dashboard")}
        >
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Text type='secondary'>This section is under development</Text>
          </div>
        </SectionWrapper>
      )
    );
  };

  return (
    <div>
      
        <Breadcrumb title='Ticket Settings' />
        {renderContent()}
      

    </div>
  );
};

// Reusable section wrapper component
const SectionWrapper = ({ title, onBack, children }) => (
  <div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
      }}
    >
      <div>
        <Button
          type='primary'
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ paddingLeft: 10, marginBottom: 15, borderRadius: "8px" }}
        >
          Back
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          {title}
        </Title>
      </div>
    </div>

    <Card style={{ borderRadius: "8px" }}>
      <div style={{ maxWidth: "1400px", padding: "20px" }}>{children}</div>
    </Card>
  </div>
);

export default FreshworksSettings;
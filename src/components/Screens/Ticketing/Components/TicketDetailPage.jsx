import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  Input,
  Space,
  Tag,
  Select,
  Upload,
  Form,
  message,
  Table,
  Tabs,
  Spin,
  Modal,
  Avatar,
  Divider,
  Timeline,
  Collapse,
  Skeleton,
  Tooltip,
  Drawer,
  Image,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PhoneOutlined,
  SendOutlined,
  PlusOutlined,
  UploadOutlined,
  MessageOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CommentOutlined,
  VideoCameraOutlined,
  ForwardOutlined,
  FileAddOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  SettingOutlined,
  DownOutlined,
  UpOutlined,
  CheckSquareOutlined,
  ReloadOutlined,
  WechatOutlined,
  DownloadOutlined,
  CloudUploadOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import moment from "moment";

// Import static modal components
import FeatherIcon from "feather-icons-react";
import SelectTemplate from "../../Leads/Modules/SendTemplate";
// import ChatWindow from "../../Chat/ChatWindow";
import MediaPreview from "./MediaPreview";
import TicketHistoryTable from "./TicketHistoryTable";
import Breadcrumb from "../../../Breadcrumb";
import SendTemplate from "../../Leads/Modules/SendTemplate";
import MasterLayout from "../../../../masterLayout/MasterLayout";

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Text, Title } = Typography;
const { Option } = Select;

//**********Helper Functions for sla timer */
// Helper 1: Convert time units to hours
const convertToHours = (time, unit) => {
  if (!time || !unit) return 0;

  switch (unit.toLowerCase()) {
    case "minutes":
      return time / 60;
    case "hours":
      return time;
    case "days":
      return time * 24;
    default:
      return time;
  }
};

// Helper 2: Calculate SLA countdown
// ✅ CORRECTED: Calculate SLA countdown with proper pause handling
const calculateSLACountdown = ticket => {
  if (!ticket) return null;

  // Check if ticket is completed/closed
  if (ticket.status === "Complete" || ticket.status === "Closed") {
    return ticket?.slaTracking?.slaBreached
      ? { isExpired: true, breached: true, status: "breached" }
      : { completed: true, status: "completed" };
  }

  // 🆕 Handle Reopened status - treat as fresh start
  if (ticket.status === "Reopened") {
    const slaTracking = ticket.slaTracking;
    if (!slaTracking || !slaTracking.resolutionTime) return null;

    const now = new Date();
    const timerStart = new Date(slaTracking.timerStartedAt);
    const elapsedSinceReopen = now - timerStart;

    const convertToMs = (time, unit) => {
      if (!time || !unit) return 0;
      switch (unit?.toLowerCase()) {
        case "minutes":
          return time * 60 * 1000;
        case "hours":
          return time * 60 * 60 * 1000;
        case "days":
          return time * 24 * 60 * 60 * 1000;
        default:
          return 0;
      }
    };

    const totalResolutionTimeMs = convertToMs(
      slaTracking.resolutionTime,
      slaTracking.resolutionTimeUnit
    );

    const remainingMs = totalResolutionTimeMs - elapsedSinceReopen;

    if (remainingMs <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        status: "expired",
        isExpired: true,
        isPaused: false,
        isReopened: true,
        percentageRemaining: 0,
      };
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const percentageRemaining = (remainingMs / totalResolutionTimeMs) * 100;

    return {
      days: Math.floor(totalSeconds / (24 * 60 * 60)),
      hours: Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60)),
      minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
      seconds: totalSeconds % 60,
      status:
        percentageRemaining <= 10
          ? "critical"
          : percentageRemaining <= 30
            ? "warning"
            : "safe",
      isPaused: false,
      isReopened: true,
      percentageRemaining,
      deadline: ticket.dueDate ? new Date(ticket.dueDate) : null,
    };
  }

  const slaTracking = ticket.slaTracking;
  if (!slaTracking || !slaTracking.resolutionTime) return null;

  // Helper: Convert time to milliseconds
  const convertToMs = (time, unit) => {
    if (!time || !unit) return 0;
    switch (unit?.toLowerCase()) {
      case "minutes":
        return time * 60 * 1000;
      case "hours":
        return time * 60 * 60 * 1000;
      case "days":
        return time * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  };

  const now = new Date();
  const totalResolutionTimeMs = convertToMs(
    slaTracking.resolutionTime,
    slaTracking.resolutionTimeUnit
  );

  // 🟡 CASE 1: TIMER IS PAUSED (Awaiting Customer Response)
  if (slaTracking.isTimerPaused && slaTracking.remainingBalanceTime !== null) {
    // ✅ Use remainingBalanceTime directly - this is already calculated by backend
    const remainingMs = slaTracking.remainingBalanceTime;

    if (remainingMs <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        status: "expired",
        isExpired: true,
        isPaused: true,
        percentageRemaining: 0,
      };
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const percentageRemaining = (remainingMs / totalResolutionTimeMs) * 100;

    console.log("⏱️ Paused timer (using remainingBalanceTime):", {
      remainingBalanceTime: remainingMs,
      remainingMinutes: (remainingMs / (60 * 1000)).toFixed(2),
      percentageRemaining: percentageRemaining.toFixed(2),
      totalResolutionTimeMs,
    });

    return {
      days: Math.floor(totalSeconds / (24 * 60 * 60)),
      hours: Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60)),
      minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
      seconds: totalSeconds % 60,
      status:
        percentageRemaining <= 10
          ? "critical"
          : percentageRemaining <= 30
            ? "warning"
            : "safe",
      isPaused: true,
      percentageRemaining,
    };
  }

  // 🟢 CASE 2: TIMER IS RUNNING
  // ✅ FIX: Use dueDate directly when available (handles all resume scenarios correctly)
  let remainingMs;

  if (ticket.dueDate) {
    // ✅ BEST APPROACH: Calculate directly from due date
    // This automatically handles all scenarios (normal, reopened, resumed after pause)
    const deadline = new Date(ticket.dueDate);
    remainingMs = deadline - now;

    // console.log("⏱️ Timer calculation from dueDate:", {
    //   dueDate: ticket.dueDate,
    //   now: now.toISOString(),
    //   remainingMs,
    //   remainingMinutes: (remainingMs / (60 * 1000)).toFixed(2),
    // });
  } else {
    // ✅ FALLBACK: Calculate from creation time (shouldn't happen with proper SLA setup)
    const originalCreation = new Date(ticket.createdDate);
    const totalElapsed = now - originalCreation;
    const accumulatedPause = slaTracking.accumulatedPausedTime || 0;
    const totalWorkTime = totalElapsed - accumulatedPause;
    remainingMs = totalResolutionTimeMs - totalWorkTime;

    console.log("⏱️ Fallback timer calculation:", {
      originalCreation: ticket.createdDate,
      totalElapsed,
      accumulatedPause,
      totalWorkTime,
      remainingMs,
    });
  }

  // console.log("⏱️ Timer calculation:", {
  //   totalResolutionTimeMs,
  //   remainingMs,
  //   remainingMinutes: (remainingMs / (60 * 1000)).toFixed(2),
  //   dueDate: ticket.dueDate,
  // });

  if (remainingMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      status: "expired",
      isExpired: true,
      isPaused: false,
      percentageRemaining: 0,
    };
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const percentageRemaining = (remainingMs / totalResolutionTimeMs) * 100;

  return {
    days: Math.floor(totalSeconds / (24 * 60 * 60)),
    hours: Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60)),
    minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
    seconds: totalSeconds % 60,
    status:
      percentageRemaining <= 10
        ? "critical"
        : percentageRemaining <= 30
          ? "warning"
          : "safe",
    percentageRemaining,
    isPaused: false,
    deadline: ticket.dueDate ? new Date(ticket.dueDate) : null,
  };
};
// Helper 3: Find matching SLA policy
const getMatchingSLAPolicy = (ticketDepartmentField, slaPolicies) => {
  if (!slaPolicies || !ticketDepartmentField) return null;

  return slaPolicies.find(
    policy =>
      policy.department?.toLowerCase() === ticketDepartmentField?.toLowerCase()
  );
};

// Helper 4: Format time with unit
const formatTimeWithUnit = (time, unit) => {
  if (!time || !unit) return "Not Set";
  return `${time} ${unit}`;
};

const SwitchAgentModal = ({
  visible,
  onOk,
  onCancel,
  ticketId,
  selectedDepartment,
  selectedAgent,
  onDepartmentChange,
  onAgentChange,
}) => {
  // Static departments and agents data
  const staticDepartmentsWithSLA = [
    { id: 1, name: "Technical Support" },
    { id: 2, name: "Billing" },
    { id: 3, name: "Sales" },
    { id: 4, name: "Customer Service" },
  ];

  const staticAgentsByDepartment = {
    "Technical Support": [
      { name: "John Doe" },
      { name: "Jane Smith" },
      { name: "Robert Johnson" },
    ],
    Billing: [
      { name: "Alice Brown" },
      { name: "Michael Wilson" },
    ],
    Sales: [
      { name: "David Lee" },
      { name: "Sarah Taylor" },
    ],
    "Customer Service": [
      { name: "Emily Clark" },
      { name: "James Miller" },
    ],
  };

  // Get filtered agents based on selected department
  const filteredAgents = useMemo(() => {
    if (!selectedDepartment) return [];
    return staticAgentsByDepartment[selectedDepartment] || [];
  }, [selectedDepartment]);

  // Reset agent selection when department changes
  useEffect(() => {
    if (selectedDepartment && selectedAgent) {
      // Check if the currently selected agent is still valid for the new department
      const agentStillValid = filteredAgents.some(
        agent => agent.name === selectedAgent
      );
      if (!agentStillValid) {
        onAgentChange(null);
      }
    }
  }, [selectedDepartment, filteredAgents, selectedAgent, onAgentChange]);

  return (
    <Modal
      title={
        <Space>
          <UserSwitchOutlined style={{ color: "var(--primary)" }} />
          <span>Switch Agent for Ticket {ticketId}</span>
        </Space>
      }
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={500}
      okText='Switch Agent'
      cancelText='Cancel'
      okButtonProps={{
        disabled: !selectedDepartment || !selectedAgent,
      }}
    >
      <Space direction='vertical' size='large' style={{ width: "100%" }}>
        {/* Department Selection */}
        <div>
          <Text strong style={{ display: "block", marginBottom: "8px" }}>
            Select Department: <span style={{ color: "red" }}>*</span>
          </Text>
          <Select
            value={selectedDepartment}
            onChange={onDepartmentChange}
            placeholder='Select department'
            style={{ width: "100%" }}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {staticDepartmentsWithSLA.map(dept => (
              <Option key={dept.id} value={dept.name}>
                {dept.name}
              </Option>
            ))}
          </Select>

          {staticDepartmentsWithSLA.length === 0 && (
            <Text
              type='secondary'
              style={{ fontSize: "12px", marginTop: "4px" }}
            >
              No departments with active SLA found
            </Text>
          )}
        </div>

        {/* Agent Selection */}
        <div>
          <Text strong style={{ display: "block", marginBottom: "8px" }}>
            Select Agent: <span style={{ color: "red" }}>*</span>
          </Text>
          <Select
            value={selectedAgent}
            onChange={onAgentChange}
            placeholder={
              selectedDepartment ? "Select agent" : "Select department first"
            }
            style={{ width: "100%" }}
            disabled={!selectedDepartment}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {filteredAgents.map(agent => (
              <Option key={agent.name} value={agent.name}>
                {agent.name}
              </Option>
            ))}
          </Select>

          {/* Feedback messages */}
          {selectedDepartment && filteredAgents.length === 0 && (
            <div
              style={{
                color: "#faad14",
                fontSize: "12px",
                marginTop: "8px",
                padding: "8px",
                backgroundColor: "#fffbe6",
                borderRadius: "4px",
                border: "1px solid #ffe58f",
              }}
            >
              ⚠️ No agents available for "<strong>{selectedDepartment}</strong>"
              department
              <br />
              <Text type='secondary' style={{ fontSize: "11px" }}>
                Make sure agents are assigned to this department in their
                configuration.
              </Text>
            </div>
          )}
        </div>
      </Space>
    </Modal>
  );
};

////////////////////////

const TicketDetailPage = ({ selectedTicket: propTicket, isModalView = false, onClose }) => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Static data for ticket SLA
  const staticTicketSlaData = {
    data: [
      {
        id: 1,
        name: "Standard Support SLA",
        department: "Technical Support",
        active: true,
        lowResolutionTime: 48,
        lowResolutionTimeUnit: "hours",
        mediumResolutionTime: 24,
        mediumResolutionTimeUnit: "hours",
        highResolutionTime: 12,
        highResolutionTimeUnit: "hours",
        criticalResolutionTime: 6,
        criticalResolutionTimeUnit: "hours",
        lowFirstResponseTime: 60,
        lowFirstResponseTimeUnit: "minutes",
        mediumFirstResponseTime: 30,
        mediumFirstResponseTimeUnit: "minutes",
        highFirstResponseTime: 15,
        highFirstResponseTimeUnit: "minutes",
        criticalFirstResponseTime: 5,
        criticalFirstResponseTimeUnit: "minutes",
      },
      {
        id: 2,
        name: "Billing SLA",
        department: "Billing",
        active: true,
        lowResolutionTime: 72,
        lowResolutionTimeUnit: "hours",
        mediumResolutionTime: 48,
        mediumResolutionTimeUnit: "hours",
        highResolutionTime: 24,
        highResolutionTimeUnit: "hours",
        criticalResolutionTime: 12,
        criticalResolutionTimeUnit: "hours",
        lowFirstResponseTime: 120,
        lowFirstResponseTimeUnit: "minutes",
        mediumFirstResponseTime: 60,
        mediumFirstResponseTimeUnit: "minutes",
        highFirstResponseTime: 30,
        highFirstResponseTimeUnit: "minutes",
        criticalFirstResponseTime: 15,
        criticalFirstResponseTimeUnit: "minutes",
      },
    ],
  };

  // Static leads data
  const staticLeadsData = {
    data: [
      {
        id: 1,
        fullMobile: "+1234567890",
        mobile: "1234567890",
        company: "TechCorp Inc",
        customerName: "John Smith",
      },
      {
        id: 2,
        fullMobile: "+0987654321",
        mobile: "0987654321",
        company: "Global Solutions",
        customerName: "Alice Johnson",
      },
    ],
  };

  // Static tickets data
  const staticTickets = [
    {
      _id: "1",
      ticketId: "TKT-001",
      customerName: "John Doe",
      department_field: "Technical Support",
      subject: "Cannot login to account",
      description: "Getting error when trying to login",
      mobileNumber: "+1234567890",
      priority: "High",
      status: "Assigned",
      assignedTo: "Agent Smith",
      createdDate: "2024-01-15T10:30:00Z",
      isSpam: false,
      isStarred: true,
      dueDate: "2024-01-20T10:30:00Z",
    },
    {
      _id: "2",
      ticketId: "TKT-002",
      customerName: "Jane Smith",
      department_field: "Billing",
      subject: "Invoice discrepancy",
      description: "Invoice amount doesn't match services",
      mobileNumber: "+1987654321",
      priority: "Medium",
      status: "In Progress",
      assignedTo: "Agent Johnson",
      createdDate: "2024-01-16T14:45:00Z",
      isSpam: false,
      isStarred: false,
      dueDate: "2024-01-25T14:45:00Z",
    },
    {
      _id: "3",
      ticketId: "TKT-003",
      customerName: "Bob Wilson",
      department_field: "Sales",
      subject: "Product inquiry",
      description: "Need information about premium features",
      mobileNumber: "+1122334455",
      priority: "Low",
      status: "Complete",
      assignedTo: "Agent Williams",
      createdDate: "2024-01-10T09:15:00Z",
      isSpam: false,
      isStarred: true,
      completedDate: "2024-01-12T16:20:00Z",
    },
    {
      _id: "4",
      ticketId: "TKT-004",
      customerName: "Spam User",
      department_field: "Other",
      subject: "Buy cheap products",
      description: "SPAM MESSAGE",
      mobileNumber: "+9999999999",
      priority: "Critical",
      status: "Created",
      assignedTo: "Unassigned",
      createdDate: "2024-01-17T11:20:00Z",
      isSpam: true,
      isStarred: false,
    },
    {
      _id: "5",
      ticketId: "TKT-005",
      customerName: "Alice Brown",
      department_field: "Technical Support",
      subject: "Software installation issue",
      description: "Error during software installation",
      mobileNumber: "+1444555666",
      priority: "High",
      status: "Awaiting Customer Response",
      assignedTo: "Agent Davis",
      createdDate: "2024-01-18T13:10:00Z",
      isSpam: false,
      isStarred: false,
      dueDate: "2024-01-23T13:10:00Z",
    },
    {
      _id: "6",
      ticketId: "TKT-006",
      customerName: "Charlie Green",
      department_field: "Customer Service",
      subject: "Account deletion request",
      description: "Want to delete my account permanently",
      mobileNumber: "+1777888999",
      priority: "Medium",
      status: "Pending",
      assignedTo: "Agent Miller",
      createdDate: "2024-01-19T16:05:00Z",
      isSpam: false,
      isStarred: false,
      dueDate: "2024-01-26T16:05:00Z",
    },
  ];



  // Static selected ticket data
  const selectedTicket = staticTickets.find(t => String(t._id) === String(ticketId));

  // ✅ FIXED: Add back button for route-based view
  // const handleBack = () => {

  //     navigate('/tickets')
  // };

  // Static personal notes data
  const staticPersonalNotes = [
    {
      id: "1",
      content: "Customer reported similar issue last month. Check previous ticket #TICK-045.",
      author: "Jane Smith",
      timestamp: "2024-01-15T10:45:00Z",
    },
    {
      id: "2",
      content: "Escalated to engineering team. Awaiting their response.",
      author: "John Doe",
      timestamp: "2024-01-15T11:30:00Z",
    },
  ];

  // Static quick replies data
  const staticQuickReplies = [
    {
      id: "1",
      title: "Request Screenshot",
      message: "Could you please share a screenshot of the issue you're experiencing?",
    },
    {
      id: "2",
      title: "Check Browser",
      message: "Please try clearing your browser cache and cookies, then try again.",
    },
    {
      id: "3",
      title: "Escalation",
      message: "I've escalated this issue to our technical team. They will contact you shortly.",
    },
  ];

  // Static video notes data
  const staticVideoNotes = [
    {
      id: "1",
      title: "Dashboard Access Tutorial",
      description: "Step-by-step guide to access dashboard",
      videoUrl: "https://example.com/video1.mp4",
    },
    {
      id: "2",
      title: "Troubleshooting Common Issues",
      description: "Common issues and their solutions",
      videoUrl: "https://example.com/video2.mp4",
    },
  ];

  // Static sent templates data
  const staticSentTemplates = [
    {
      id: "1",
      mobileNumber: "+1234567890",
      status: "In Progress",
      description: "Dashboard access issue",
      templateName: "Technical Support Template",
      sentAt: "2024-01-15T10:35:00Z",
    },
    {
      id: "2",
      mobileNumber: "+1234567890",
      status: "Assigned",
      description: "Follow up",
      templateName: "Follow-up Template",
      sentAt: "2024-01-15T11:45:00Z",
    },
  ];

  // Static ticket logs data
  const staticTicketLogs = [
    {
      id: "1",
      action: "TICKET_CREATED",
      user: "System",
      timestamp: "2024-01-15T10:30:00Z",
      details: {
        createdBy: "customer@example.com",
        source: "Email",
      },
    },
    {
      id: "2",
      action: "STATUS_CHANGED",
      user: "John Doe",
      timestamp: "2024-01-15T10:35:00Z",
      details: {
        previousStatus: "New",
        newStatus: "Assigned",
        reason: "Assigned to technical team",
      },
    },
    {
      id: "3",
      action: "PROPERTIES_UPDATED",
      user: "John Doe",
      timestamp: "2024-01-15T10:40:00Z",
      details: {
        previousProperties: {
          priority: "Medium",
          department: "General Support",
        },
        newProperties: {
          priority: "High",
          department: "Technical Support",
        },
      },
    },
    {
      id: "4",
      action: "NOTE_ADDED",
      user: "Jane Smith",
      timestamp: "2024-01-15T10:45:00Z",
      details: {
        noteId: "note_1",
        content: "Customer reported similar issue last month",
        hasVideoNote: false,
      },
    },
    {
      id: "5",
      action: "REPLY_ADDED",
      user: "John Doe",
      timestamp: "2024-01-15T11:00:00Z",
      details: {
        content: "We're looking into this issue...",
        hasVideoNote: false,
      },
    },
  ];

  // Static departments data
  const staticDepartments = ["Technical Support", "Billing", "Sales", "Customer Service"];

  // Static agents data
  const staticTicketingAgents = [
    { username: "John Doe", agentType: { ticketing: true }, config: { ticketing: { department: "Technical Support" } } },
    { username: "Jane Smith", agentType: { ticketing: true }, config: { ticketing: { department: "Technical Support" } } },
    { username: "Alice Brown", agentType: { ticketing: true }, config: { ticketing: { department: "Billing" } } },
    { username: "David Lee", agentType: { ticketing: true }, config: { ticketing: { department: "Sales" } } },
  ];

  // Simulated API loading states
  const [ticketLoading, setTicketLoading] = useState(false);
  const [personalNotesLoading, setPersonalNotesLoading] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  // Simulated mutation functions
  const updateTicket = async () => {
    message.success("Ticket updated successfully!");
    return Promise.resolve();
  };

  const updateTickets = async () => {
    message.success("Agent switched successfully!");
    return Promise.resolve();
  };

  const updateStatus = async () => {
    message.success("Status updated successfully!");
    return Promise.resolve();
  };

  const addPersonalNote = async () => {
    message.success("Personal note added successfully!");
    return Promise.resolve();
  };

  const addSentTemplate = async () => {
    message.success("Template sent successfully!");
    return Promise.resolve();
  };

  const deleteSentTemplate = async () => {
    message.success("Template record deleted successfully!");
    return Promise.resolve();
  };

  const logTicketView = async () => {
    console.log("Ticket view logged");
    return Promise.resolve();
  };

  const addTicketReply = async () => {
    message.success("Reply sent successfully!");
    return Promise.resolve();
  };

  // State management
  const [mediaPreview, setMediaPreview] = useState({
    visible: false,
    url: null,
    type: null, // 'image' or 'video'
  });

  const [firstResponseTimer, setFirstResponseTimer] = useState({
    timeRemaining: null,
    hasResponded: false,
    targetTime: null,
    status: "pending", // 'pending', 'achieved', 'missed'
  });

  const personalNotes = staticPersonalNotes;
  const quickReplies = staticQuickReplies;
  const videoNotes = staticVideoNotes;
  const sentTemplates = staticSentTemplates;
  const ticketLogs = staticTicketLogs;
  const departments = staticDepartments;
  const ticketingAgents = staticTicketingAgents;

  // Activity logs hook simulation
  const refetchTicketLogs = async () => {
    console.log("Refetching ticket logs...");
    return Promise.resolve();
  };

  const refetchPersonalNotes = async () => {
    console.log("Refetching personal notes...");
    return Promise.resolve();
  };

  const refetchTicket = async () => {
    console.log("Refetching ticket...");
    return Promise.resolve();
  };

  const refetchSentTemplates = async () => {
    console.log("Refetching sent templates...");
    return Promise.resolve();
  };

  // State management
  const [activeTab, setActiveTab] = useState("1");
  const [newReply, setNewReply] = useState("");
  const [communications, setCommunications] = useState([]);

  //switch agent state
  const [switchAgentModalOpen, setSwitchAgentModalOpen] = useState(false);
  const [selectedDepartmentForSwitch, setSelectedDepartmentForSwitch] =
    useState(null);
  const [selectedAgentForSwitch, setSelectedAgentForSwitch] = useState(null);

  const departmentsWithSLA = useMemo(() => {
    if (!staticDepartments || !staticTicketSlaData.data) return [];

    const activeSLAPolicies = staticTicketSlaData.data.filter(
      policy => policy.active
    );
    const departmentsWithActiveSLA = staticDepartments.filter(dept =>
      activeSLAPolicies.some(policy => policy.department === dept)
    );

    return departmentsWithActiveSLA.map((dept, index) => ({
      id: index + 1,
      name: dept,
    }));
  }, []);

  // State variables
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [formData, setFormData] = useState({
    selectedTemplate: null,
    selectedVariableValuesObj: {},
    fileUrl: "",
  });
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showVideoNotes, setShowVideoNotes] = useState(false);
  const [isEditingProperties, setIsEditingProperties] = useState(false);
  const [editedProperties, setEditedProperties] = useState({});
  const [selectedVideoNote, setSelectedVideoNote] = useState(null);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false);
  const [replyData, setReplyData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });
  const [forwardData, setForwardData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });
  const [noteData, setNoteData] = useState("");
  const [statusChangeData, setStatusChangeData] = useState({
    newStatus: "",
    reason: "",
  });

  const [slaCountdown, setSlaCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    status: "safe",
  });

  const [selectedContactData, setSelectedContactData] = useState({
    number: 0,
  });
  const [chatData, setChatData] = useState({});
  const [chatArea, setChatArea] = useState(true);
  const [sidebarRefetch, setSidebarRefetch] = useState(0);

  // Add state for chat drawer
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  // Static chat data
  const currentChatData = {
    data: [
      {
        id: "1",
        message: "Hello, I'm having trouble accessing my dashboard.",
        sender: "customer",
        createdAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        message: "Hi! I'm looking into this issue for you.",
        sender: "agent",
        createdAt: "2024-01-15T10:35:00Z",
      },
      {
        id: "3",
        message: "Could you share a screenshot of the error?",
        sender: "agent",
        createdAt: "2024-01-15T11:00:00Z",
      },
    ],
  };

  const chatRefresh = async () => {
    console.log("Refreshing chat...");
    return Promise.resolve();
  };
  const chatLoading = false;

  let lastActiveRaw = "2025-04-16T08:11:48.447Z";
  if (currentChatData?.data?.length) {
    for (let i = currentChatData.data.length - 1; i >= 0; i--) {
      const item = currentChatData.data[i];
      if (item?.createdAt) {
        lastActiveRaw = item.createdAt;
        break;
      } else if (item?.type === "dayBreakFlag" && item?.day) {
        lastActiveRaw = item.day;
        break;
      }
    }
  }

  const calculateFirstResponseTimer = (ticket, slaPolicies, logs = []) => {
    if (!ticket || !slaPolicies) return null;

    // 🔥 FIX: Always use the backend-provided firstResponseDue if available
    if (ticket.slaTracking?.firstResponseDue) {
      const now = new Date();
      const firstResponseDue = new Date(ticket.slaTracking.firstResponseDue);
      const remainingSeconds = Math.max(0, (firstResponseDue - now) / 1000);

      // ✅ Check if first response has been met according to backend
      if (
        ticket.slaTracking.firstResponseMet === true ||
        ticket.FirstresponTrigger === "true"
      ) {
        return {
          hasResponded: true,
          status: "achieved",
          targetTime: convertToSeconds(
            ticket.slaTracking.firstResponseTime || 1,
            ticket.slaTracking.firstResponseTimeUnit || "minutes"
          ),
          targetDisplay: formatTimeWithUnit(
            ticket.slaTracking.firstResponseTime || 1,
            ticket.slaTracking.firstResponseTimeUnit || "minutes"
          ),
        };
      }

      // 🔥 CASE 1: Ticket is reopened - Always show countdown (backend resets firstResponseMet to false)
      if (ticket.status === "Reopened") {
        return {
          hasResponded: false,
          status: remainingSeconds > 0 ? "pending" : "missed",
          remainingSeconds: remainingSeconds,
          targetTime: convertToSeconds(
            ticket.slaTracking.firstResponseTime || 1,
            ticket.slaTracking.firstResponseTimeUnit || "minutes"
          ),
          targetDisplay: formatTimeWithUnit(
            ticket.slaTracking.firstResponseTime || 1,
            ticket.slaTracking.firstResponseTimeUnit || "minutes"
          ),
          isReopened: true,
        };
      }

      // 🔥 CASE 2: Properties updated (PRIORITY_CHANGED or PROPERTIES_UPDATED) - Show fresh countdown
      const hasPropertyUpdate = ticket.slaTracking.pauseHistory?.some(
        event =>
          event.event === "PRIORITY_CHANGED" ||
          (event.event === "PROPERTIES_UPDATED" &&
            event.firstResponseReset === true)
      );

      if (hasPropertyUpdate) {
        // Find the most recent property update event
        const sortedHistory = [...(ticket.slaTracking.pauseHistory || [])].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        const lastPropertyUpdate = sortedHistory.find(
          event =>
            event.event === "PRIORITY_CHANGED" ||
            (event.event === "PROPERTIES_UPDATED" &&
              event.firstResponseReset === true)
        );

        // Check if there's a status change AFTER the property update
        if (lastPropertyUpdate) {
          const propertyUpdateTime = new Date(lastPropertyUpdate.timestamp);

          // Check logs for status changes after property update
          let hasRespondedAfterUpdate = false;
          if (logs && logs.length > 0) {
            const statusChangeLog = logs.find(log => {
              const logTime = new Date(log.timestamp || log.createdAt);
              const isStatusChange = log.action === "STATUS_CHANGED";
              const isAfterPropertyUpdate = logTime > propertyUpdateTime;
              const notReopen = log.details?.newStatus !== "Reopened";
              return isStatusChange && isAfterPropertyUpdate && notReopen;
            });

            if (statusChangeLog) {
              hasRespondedAfterUpdate = true;
            }
          }

          if (hasRespondedAfterUpdate) {
            return {
              hasResponded: true,
              status: "achieved",
              targetTime: convertToSeconds(
                ticket.slaTracking.firstResponseTime || 1,
                ticket.slaTracking.firstResponseTimeUnit || "minutes"
              ),
              targetDisplay: formatTimeWithUnit(
                ticket.slaTracking.firstResponseTime || 1,
                ticket.slaTracking.firstResponseTimeUnit || "minutes"
              ),
            };
          }

          // Still waiting for response after property update
          return {
            hasResponded: false,
            status: remainingSeconds > 0 ? "pending" : "missed",
            remainingSeconds: remainingSeconds,
            targetTime: convertToSeconds(
              ticket.slaTracking.firstResponseTime || 1,
              ticket.slaTracking.firstResponseTimeUnit || "minutes"
            ),
            targetDisplay: formatTimeWithUnit(
              ticket.slaTracking.firstResponseTime || 1,
              ticket.slaTracking.firstResponseTimeUnit || "minutes"
            ),
            isPropertyUpdated: true,
          };
        }
      }

      // 🔥 CASE 3: Regular tickets - Check logs for status changes after creation
      let hasResponded = false;
      if (logs && logs.length > 0) {
        const creationTime = new Date(ticket.createdDate);
        const statusChangeLog = logs.find(log => {
          const logTime = new Date(log.timestamp || log.createdAt);
          const isStatusChange = log.action === "STATUS_CHANGED";
          const isAfterCreation = logTime > creationTime;
          const notReopen = log.details?.newStatus !== "Reopened";
          return isStatusChange && isAfterCreation && notReopen;
        });

        if (statusChangeLog) {
          hasResponded = true;
        }
      }

      if (hasResponded) {
        return {
          hasResponded: true,
          status: "achieved",
          targetTime: convertToSeconds(
            ticket.slaTracking.firstResponseTime || 1,
            ticket.slaTracking.firstResponseTimeUnit || "minutes"
          ),
          targetDisplay: formatTimeWithUnit(
            ticket.slaTracking.firstResponseTime || 1,
            ticket.slaTracking.firstResponseTimeUnit || "minutes"
          ),
        };
      }

      return {
        hasResponded: false,
        status: remainingSeconds > 0 ? "pending" : "missed",
        remainingSeconds: remainingSeconds,
        targetTime: convertToSeconds(
          ticket.slaTracking.firstResponseTime || 1,
          ticket.slaTracking.firstResponseTimeUnit || "minutes"
        ),
        targetDisplay: formatTimeWithUnit(
          ticket.slaTracking.firstResponseTime || 1,
          ticket.slaTracking.firstResponseTimeUnit || "minutes"
        ),
      };
    }

    // Fallback logic for tickets without slaTracking (should not happen with proper setup)
    const matchingSLA = getMatchingSLAPolicy(
      ticket.department_field,
      slaPolicies
    );
    if (!matchingSLA) return null;

    const priority = ticket.priority?.toLowerCase();
    let targetTime, targetUnit;

    switch (priority) {
      case "low":
        targetTime = matchingSLA.lowFirstResponseTime;
        targetUnit = matchingSLA.lowFirstResponseTimeUnit;
        break;
      case "medium":
        targetTime = matchingSLA.mediumFirstResponseTime;
        targetUnit = matchingSLA.mediumFirstResponseTimeUnit;
        break;
      case "high":
        targetTime = matchingSLA.highFirstResponseTime;
        targetUnit = matchingSLA.highFirstResponseTimeUnit;
        break;
      case "critical":
        targetTime = matchingSLA.criticalFirstResponseTime;
        targetUnit = matchingSLA.criticalFirstResponseTimeUnit;
        break;
      default:
        targetTime = matchingSLA.mediumFirstResponseTime;
        targetUnit = matchingSLA.mediumFirstResponseTimeUnit;
    }

    const targetSeconds = convertToSeconds(targetTime, targetUnit);
    const now = new Date();
    const creationTime = new Date(ticket.createdDate);
    const firstResponseDue = new Date(
      creationTime.getTime() + targetSeconds * 1000
    );
    const remainingSeconds = Math.max(0, (firstResponseDue - now) / 1000);

    return {
      hasResponded: false,
      status: remainingSeconds > 0 ? "pending" : "missed",
      remainingSeconds: remainingSeconds,
      targetTime: targetSeconds,
      targetDisplay: formatTimeWithUnit(targetTime, targetUnit),
    };
  };

  // Helper to convert time to seconds
  const convertToSeconds = (time, unit) => {
    if (!time || !unit) return 0;
    switch (unit.toLowerCase()) {
      case "minutes":
        return time * 60;
      case "hours":
        return time * 60 * 60;
      case "days":
        return time * 24 * 60 * 60;
      default:
        return time;
    }
  };

  const date = new Date(lastActiveRaw);
  const formattedDate = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedTime = `${formattedHours}.${formattedMinutes}${ampm}`;
  const readableTimestamp = `${formattedDate} ${formattedTime}`;

  useEffect(() => {
    if (selectedTicket) {
      setSelectedContactData({ number: selectedTicket.mobileNumber });
    }
  }, [selectedTicket]);

  useEffect(() => {
    setChatData({ [selectedContactData?.number]: currentChatData?.data });
  }, [currentChatData]);

  // Log ticket view on component mount
  useEffect(() => {
    if (selectedTicket?._id) {
      logTicketView(selectedTicket._id);
    }
  }, [selectedTicket?._id]);

  useEffect(() => {
    if (selectedTicket && Object.keys(selectedTicket).length > 0) {
      setSelectedStatus(selectedTicket.status || "");

      // Initialize communications from ticket data
      const initialComms = (selectedTicket.replies || []).map(reply => ({
        id: reply.id || reply._id,
        type: reply.type || "agent",
        author: reply.author || selectedTicket.assignedTo || "Unassigned",
        timestamp:
          reply.timestamp || reply.createdAt || new Date().toISOString(),
        content: reply.content,
        videoUrl: reply.videoUrl || null,
        isVideoNote: !!reply.videoUrl,
      }));

      // Add the initial ticket description as customer communication
      if (selectedTicket.description) {
        initialComms.unshift({
          id: "initial",
          type: "customer",
          author: selectedTicket.customerName,
          timestamp: selectedTicket.createdDate || new Date().toISOString(),
          content: selectedTicket.description,
          isInitial: true,
        });
      }

      setCommunications(initialComms);
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (selectedTicket && Object.keys(selectedTicket).length > 0) {
      setEditedProperties({
        status: selectedTicket.status,
        priority: selectedTicket.priority,
        department: selectedTicket.department,
        assignedTo: selectedTicket.assignedTo,
        category: selectedTicket.category || "",
        source: selectedTicket.source || "",
        type: selectedTicket.type || "",
        company: selectedTicket.company || "",
      });
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (
      !selectedTicket ||
      !staticTicketSlaData?.data ||
      selectedTicket.status === "Complete" ||
      selectedTicket.status === "Closed"
    ) {
      return;
    }

    const updateTimer = () => {
      const countdown = calculateSLACountdown(selectedTicket);
      if (countdown) {
        setSlaCountdown(countdown);
      }
    };

    // Initial update
    updateTimer();

    // Only run interval if timer is not paused
    const shouldRunInterval = !selectedTicket.slaTracking?.isTimerPaused;

    const interval = shouldRunInterval ? setInterval(updateTimer, 1000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    selectedTicket,
    selectedTicket?.status,
    selectedTicket?.slaTracking?.isTimerPaused,
    selectedTicket?.slaTracking?.accumulatedPausedTime,
  ]);

  useEffect(() => {
    if (!selectedTicket || !staticTicketSlaData?.data) {
      return;
    }

    const updateFirstResponseTimer = () => {
      const timerData = calculateFirstResponseTimer(
        selectedTicket,
        staticTicketSlaData.data,
        ticketLogs
      );

      if (timerData) {
        setFirstResponseTimer(timerData);
      }
    };

    updateFirstResponseTimer();

    const shouldRunInterval =
      selectedTicket?.slaTracking?.firstResponseMet !== true &&
      selectedTicket?.FirstresponTrigger !== "true" &&
      selectedTicket?.status !== "Complete" &&
      selectedTicket?.status !== "Closed" &&
      firstResponseTimer?.status === "pending";

    if (shouldRunInterval) {
      const interval = setInterval(updateFirstResponseTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [
    selectedTicket,
    firstResponseTimer?.status,
    selectedTicket?.slaTracking?.firstResponseMet,
    selectedTicket?.FirstresponTrigger,
    selectedTicket?.status,
    selectedTicket?.slaTracking?.pauseHistory,
  ]);

  const handleRefreshChat = async () => {
    try {
      await Promise.all([
        refetchTicket(),
        chatRefresh(),
        refetchTicketLogs(),
        refetchPersonalNotes(),
      ]);
      message.success("Ticket and chat refreshed successfully!");
    } catch (error) {
      console.error("Failed to refresh:", error);
      message.error("Failed to refresh data");
    }
  };

  const handleAddReply = async () => {
    if (!newReply.trim()) {
      message.warning("Please enter a reply!");
      return;
    }

    try {
      await addTicketReply({
        ticketId: selectedTicket?._id,
        reply: newReply,
        videoNote: selectedVideoNote || null,
      });

      // Update local communications state
      const newCommunication = {
        id: Date.now(),
        type: "agent",
        author: "Current User",
        timestamp: new Date().toISOString(),
        content: newReply,
        videoUrl: selectedVideoNote?.videoUrl || null,
        isVideoNote: !!selectedVideoNote,
        videoNoteTitle: selectedVideoNote?.title || null,
      };

      setCommunications(prev => [...prev, newCommunication]);
      setNewReply("");
      setSelectedVideoNote(null);

      // Refetch ticket to get updated data
      await refetchTicket();
      await refetchTicketLogs();

      message.success("Reply sent successfully!");
    } catch (error) {
      console.error("Failed to send reply:", error);
      message.error("Failed to send reply");
    }
  };

  const handleStatusChange = newStatus => {
    setStatusChangeData({
      newStatus: newStatus,
      reason: "",
    });
    setStatusChangeModalOpen(true);
  };

  const handleStatusChangeConfirm = async () => {
    if (!statusChangeData.reason.trim()) {
      message.warning("Please provide a reason for status change");
      return;
    }

    try {
      await updateStatus({
        ticketId: selectedTicket?._id,
        status: statusChangeData.newStatus,
        reason: statusChangeData.reason,
      });

      setSelectedStatus(statusChangeData.newStatus);
      message.success(`Status updated to ${statusChangeData.newStatus}`);
      setStatusChangeModalOpen(false);
      setStatusChangeData({ newStatus: "", reason: "" });
      await refetchTicket();
      await refetchTicketLogs();
    } catch (error) {
      console.error("Failed to update status:", error);
      message.error("Failed to update status");
    }
  };

  const handleReset = () => {
    setTemplateDescription("");
  };

  const handlePropertyChange = (property, value) => {
    setEditedProperties(prev => ({
      ...prev,
      [property]: value,
    }));
  };

  // Function to download chat as .txt file
  const handleDownloadChat = () => {
    try {
      // Format the chat content
      let chatContent = `Ticket ID: ${selectedTicket.ticketId}\n`;
      chatContent += `Subject: ${selectedTicket.description || "N/A"}\n`;
      chatContent += `Customer: ${selectedTicket.customerName}\n`;
      chatContent += `Status: ${selectedTicket.status}\n`;
      chatContent += `Created: ${moment(selectedTicket.createdDate).format("MMM DD, YYYY HH:mm")}\n`;
      chatContent += `\n${"=".repeat(80)}\n`;
      chatContent += `CHAT HISTORY\n`;
      chatContent += `${"=".repeat(80)}\n\n`;

      // Add all communications
      communications.forEach((comm, index) => {
        chatContent += `${"-".repeat(80)}\n`;
        chatContent += `[${comm.type.toUpperCase()}] ${comm.author}\n`;
        chatContent += `Time: ${moment(comm.timestamp).format("MMM DD, YYYY HH:mm")}\n`;
        chatContent += `${"-".repeat(80)}\n`;
        chatContent += `${comm.content}\n\n`;

        if (comm.videoUrl) {
          chatContent += `Video Note: ${comm.videoUrl}\n\n`;
        }
      });

      // Create blob and download
      const blob = new Blob([chatContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedTicket.ticketId}_chat_${moment().format("YYYY-MM-DD_HH-mm")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("Chat downloaded successfully!");
    } catch (error) {
      console.error("Failed to download chat:", error);
      message.error("Failed to download chat");
    }
  };

  // Function to download activity logs as .txt file
  const handleDownloadActivityLogs = () => {
    try {
      // Format the activity logs content
      let logsContent = `Ticket ID: ${selectedTicket.ticketId}\n`;
      logsContent += `Subject: ${selectedTicket.description || "N/A"}\n`;
      logsContent += `Customer: ${selectedTicket.customerName}\n`;
      logsContent += `Status: ${selectedTicket.status}\n`;
      logsContent += `Created: ${moment(selectedTicket.createdDate).format("MMM DD, YYYY HH:mm")}\n`;
      logsContent += `\n${"=".repeat(80)}\n`;
      logsContent += `ACTIVITY LOGS\n`;
      logsContent += `${"=".repeat(80)}\n\n`;

      // Check if there are activity logs
      if (ticketLogs.length === 0) {
        logsContent += `No activity logs found for this ticket.\n`;
      } else {
        // Add all activity logs (reverse to show oldest first)
        [...ticketLogs].reverse().forEach((log, index) => {
          logsContent += `${"-".repeat(80)}\n`;
          logsContent += `Log #${index + 1}\n`;
          logsContent += `Action: ${formatLogAction(log.action)}\n`;
          logsContent += `User: ${log.user}\n`;
          logsContent += `Time: ${new Date(log.timestamp || log.createdAt).toLocaleString()}\n`;
          logsContent += `${"-".repeat(40)}\n`;

          // Add details based on action type
          if (log.action === "STATUS_CHANGED" && log.details) {
            logsContent += `\nSTATUS CHANGE DETAILS:\n`;
            logsContent += `${"─".repeat(80)}\n`;
            logsContent += `| ${"Field".padEnd(20)} | ${"Previous Value".padEnd(20)} | ${"New Value".padEnd(20)} | ${"Reason".padEnd(10)} |\n`;
            logsContent += `${"─".repeat(80)}\n`;
            logsContent += `| ${"Status".padEnd(20)} | ${(log.details.previousStatus || "N/A").padEnd(20)} | ${(log.details.newStatus || "N/A").padEnd(20)} | ${(log.details.reason || "No reason").padEnd(10)} |\n`;
            logsContent += `${"─".repeat(80)}\n`;
          } else if (
            log.action === "PROPERTIES_UPDATED" &&
            log.details?.previousProperties
          ) {
            logsContent += `\nPROPERTY CHANGES:\n`;
            logsContent += `${"─".repeat(80)}\n`;
            logsContent += `| ${"Field".padEnd(25)} | ${"Previous Value".padEnd(25)} | ${"New Value".padEnd(25)} |\n`;
            logsContent += `${"─".repeat(80)}\n`;
            Object.keys(log.details.previousProperties).forEach(field => {
              const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
              const oldValue = String(
                log.details.previousProperties[field] || "N/A"
              );
              const newValue = String(
                log.details.newProperties[field] || "N/A"
              );
              logsContent += `| ${fieldName.padEnd(25)} | ${oldValue.padEnd(25)} | ${newValue.padEnd(25)} |\n`;
            });
            logsContent += `${"─".repeat(80)}\n`;
          } else if (log.action === "NOTE_ADDED" && log.details) {
            logsContent += `\nNOTE DETAILS:\n`;
            logsContent += `  Note ID: ${log.details.noteId || "N/A"}\n`;
            if (log.details.noteContent) {
              logsContent += `  Content: ${log.details.noteContent}\n`;
            }
            if (log.details.hasVideoNote) {
              logsContent += `  Includes Video Note: Yes\n`;
            }
          } else if (
            (log.action === "TEMPLATE_SENT" ||
              log.action === "TEMPLATE_DELETED") &&
            log.details
          ) {
            logsContent += `\nTEMPLATE DETAILS:\n`;
            logsContent += `  Template Name: ${log.details.templateName || "N/A"}\n`;
            logsContent += `  Mobile Number: ${log.details.mobileNumber || "N/A"}\n`;
            logsContent += `  Status: ${log.details.status || "N/A"}\n`;
            if (log.action === "TEMPLATE_DELETED") {
              logsContent += `  Action: Template Deleted\n`;
            }
          } else if (
            (log.action === "REPLY_ADDED" ||
              log.action === "EMAIL_REPLY_SENT") &&
            log.details
          ) {
            logsContent += `\nREPLY DETAILS:\n`;
            logsContent += `  Type: ${log.action === "EMAIL_REPLY_SENT" ? "Email Reply" : "Internal Reply"}\n`;
            if (log.details.to) {
              logsContent += `  To: ${log.details.to}\n`;
            }
            if (log.details.subject) {
              logsContent += `  Subject: ${log.details.subject}\n`;
            }
            if (log.details.content) {
              logsContent += `  Content Preview: ${log.details.content.length > 100 ? log.details.content.substring(0, 100) + "..." : log.details.content}\n`;
            }
            if (log.details.hasVideoNote) {
              logsContent += `  Includes Video Note: Yes\n`;
            }
          } else if (log.action === "SLA_BREACHED" && log.details) {
            logsContent += `\n⚠️ SLA BREACH DETAILS:\n`;
            logsContent += `  Policy: ${log.details.slaPolicy || "N/A"}\n`;
            logsContent += `  Target Resolution Time: ${log.details.targetResolutionTime || "N/A"}\n`;
            logsContent += `  Priority: ${log.details.priority || "N/A"}\n`;
            logsContent += `  Department: ${log.details.department || "N/A"}\n`;
            logsContent += `  Total Paused Time: ${log.details.totalPausedTime || "N/A"}\n`;
            if (log.details.createdAt) {
              logsContent += `  Created: ${new Date(log.details.createdAt).toLocaleString()}\n`;
            }
          } else if (log.details && typeof log.details === "object") {
            // Generic details for other action types
            logsContent += `\nDETAILS:\n`;
            Object.entries(log.details).forEach(([key, value]) => {
              if (typeof value === "object") {
                logsContent += `  ${key}: ${JSON.stringify(value)}\n`;
              } else {
                logsContent += `  ${key}: ${value || "N/A"}\n`;
              }
            });
          }

          logsContent += `\n`;
        });
      }

      // Create blob and download
      const blob = new Blob([logsContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedTicket.ticketId}_activity_logs_${moment().format("YYYY-MM-DD_HH-mm")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("Activity logs downloaded successfully!");
    } catch (error) {
      console.error("Failed to download activity logs:", error);
      message.error("Failed to download activity logs");
    }
  };

  const handleSwitchAgent = async () => {
    if (!selectedDepartmentForSwitch) {
      message.warning("Please select a department");
      return;
    }

    if (!selectedAgentForSwitch) {
      message.warning("Please select an agent");
      return;
    }

    try {
      await updateTickets({
        ticketIds: [selectedTicket._id], // 👈 Bulk endpoint expects an array
        updates: {
          department_field: selectedDepartmentForSwitch,
          assignedTo: selectedAgentForSwitch,
          description: "Agent switched via ticket view", // optional but useful
        },
      });

      message.success("Agent updated successfully!");
      setSwitchAgentModalOpen(false);
      setSelectedDepartmentForSwitch(null);
      setSelectedAgentForSwitch(null);

      refetchTicket();
      refetchTicketLogs();
    } catch (error) {
      console.error("Failed to update ticket:", error);
      message.error(error?.data?.message || "Failed to update agent");
    }
  };

  const handleDepartmentChangeForSwitch = value => {
    setSelectedDepartmentForSwitch(value);
    setSelectedAgentForSwitch(null); // Reset agent when department changes
  };

  const handleSaveProperties = async () => {
    if (!selectedTicket) return;

    try {
      await updateTicket({
        ticketId: selectedTicket?._id,
        ...editedProperties,
      });

      setIsEditingProperties(false);
      await refetchTicket();
      await refetchTicketLogs();
      message.success("Properties updated successfully!");
    } catch (error) {
      console.error("Failed to update properties:", error);
      message.error("Failed to update properties");
    }
  };

  const handleReplyClick = () => {
    setReplyData({
      to: extractEmail(selectedTicket),
      cc: "",
      bcc: "",
      subject: `Re: ${selectedTicket.ticketId} - ${selectedTicket.description || "Support Request"}`,
      body: `\n\n--- Original Message ---\nFrom: ${selectedTicket.customerName}\nDate: ${moment(selectedTicket.createdDate).format("MMM DD, YYYY HH:mm")}\nSubject: ${selectedTicket.description || selectedTicket.ticketId}\n\n${selectedTicket.description}`,
    });
    setReplyModalOpen(true);
  };

  const handleForwardClick = () => {
    setForwardData({
      to: "",
      cc: "",
      bcc: "",
      subject: `Fwd: ${selectedTicket.ticketId} - ${selectedTicket.description || "Support Request"}`,
      body: `\n\n--- Forwarded Message ---\nFrom: ${selectedTicket.customerName} <${extractEmail(
        selectedTicket
      )}>\nDate: ${moment(selectedTicket.createdDate).format("MMM DD, YYYY HH:mm")}\nSubject: ${selectedTicket.description || selectedTicket.ticketId}\n\n${selectedTicket.description}`,
    });
    setForwardModalOpen(true);
  };

  const handleAddNoteClick = () => {
    setNoteData("");
    setNoteModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyData.to.trim() || !replyData.body.trim()) {
      message.warning("Please fill in recipient and message body");
      return;
    }

    try {
      await addTicketReply({
        ticketId: selectedTicket?._id,
        reply: `Email Reply Sent to: ${replyData.to}\nSubject: ${replyData.subject}\n\n${replyData.body}`,
        isEmail: true,
      });

      message.success("Reply sent successfully!");
      setReplyModalOpen(false);
      setReplyData({ to: "", cc: "", bcc: "", subject: "", body: "" });
      await refetchTicket();
      await refetchTicketLogs();
    } catch (error) {
      console.error("Failed to send reply:", error);
      message.error("Failed to send reply");
    }
  };

  const handleSendForward = async () => {
    if (!forwardData.to.trim() || !forwardData.body.trim()) {
      message.warning("Please fill in recipient and message body");
      return;
    }

    message.info(
      "Email forwarding functionality would require backend implementation"
    );
    setForwardModalOpen(false);
    setForwardData({ to: "", cc: "", bcc: "", subject: "", body: "" });
  };

  const handleSaveNote = async () => {
    if (!noteData || !noteData.trim()) {
      message.error("Note is required");
      return;
    }

    try {
      await addPersonalNote({
        ticketId: selectedTicket?._id,
        content: noteData,
      });

      message.success("Personal note added successfully!");
      setNoteModalOpen(false);
      setNoteData("");
      await refetchPersonalNotes();
      await refetchTicketLogs();
    } catch (error) {
      console.error("Failed to add personal note:", error);
      message.error("Failed to add personal note");
    }
  };

  const handleFormSubmit = async data => {
    console.log(data);

    const templateData = {
      templateName: data.name,
      mobileNumber: selectedTicket.mobileNumber,
      status: selectedStatus,
      description: templateDescription,
    };

    try {
      await addSentTemplate({
        ticketId: selectedTicket?._id,
        templateData,
      });

      message.success(`Template sent to ${selectedTicket.mobileNumber}`);
      await refetchSentTemplates();
      await refetchTicketLogs();
    } catch (error) {
      console.error("Failed to send template:", error);
      message.error("Failed to send template");
    }
  };

  const handleDeleteSentTemplate = async templateId => {
    try {
      await deleteSentTemplate({
        ticketId: selectedTicket?._id,
        templateId,
      });

      message.success("Template record deleted successfully");
      await refetchSentTemplates();
      await refetchTicketLogs();
    } catch (error) {
      console.error("Failed to delete template:", error);
      message.error("Failed to delete template");
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case "Low":
        return "green";
      case "Medium":
        return "blue";
      case "High":
        return "orange";
      case "Critical":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case "Complete":
        return "green";
      case "Pending":
        return "orange";
      case "In Progress":
        return "blue";
      case "Assigned":
        return "purple";
      case "Awaiting Customer Response":
        return "gold";
      default:
        return "default";
    }
  };

  const getMessageIcon = type => {
    switch (type) {
      case "customer":
        return <UserOutlined style={{ color: "#1890ff" }} />;
      case "agent":
        return <MessageOutlined style={{ color: "#52c41a" }} />;
      case "system":
        return <FileTextOutlined style={{ color: "#faad14" }} />;
      default:
        return <MessageOutlined />;
    }
  };

  const getLogActionColor = actionType => {
    switch (actionType) {
      case "TICKET_CREATED":
        return "green";
      case "TICKET_UPDATED":
        return "blue";
      case "TICKET_VIEWED":
        return "geekblue";
      case "STATUS_CHANGED":
        return "orange";
      case "PROPERTIES_UPDATED":
        return "purple";
      case "NOTE_ADDED":
        return "cyan";
      case "REPLY_ADDED":
        return "lime";
      case "EMAIL_REPLY_SENT":
        return "blue";
      case "TEMPLATE_SENT":
        return "volcano";
      case "TEMPLATE_DELETED":
        return "red";
      case "SLA_BREACHED":
        return "red";
      default:
        return "default";
    }
  };

  const getLogActionIcon = actionType => {
    switch (actionType) {
      case "TICKET_CREATED":
        return <PlusOutlined />;
      case "TICKET_UPDATED":
        return <EditOutlined />;
      case "TICKET_VIEWED":
        return <EyeOutlined />;
      case "STATUS_CHANGED":
        return <CheckCircleOutlined />;
      case "PROPERTIES_UPDATED":
        return <SettingOutlined />;
      case "NOTE_ADDED":
        return <FileAddOutlined />;
      case "REPLY_ADDED":
      case "EMAIL_REPLY_SENT":
        return <MessageOutlined />;
      case "TEMPLATE_SENT":
      case "TEMPLATE_DELETED":
        return <SendOutlined />;
      case "SLA_BREACHED":
        return <ClockCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const formatLogAction = actionType => {
    const actionMap = {
      TICKET_CREATED: "Ticket Created",
      TICKET_UPDATED: "Ticket Updated",
      TICKET_VIEWED: "Ticket Viewed",
      STATUS_CHANGED: "Status Changed",
      PROPERTIES_UPDATED: "Properties Updated",
      NOTE_ADDED: "Note Added",
      REPLY_ADDED: "Reply Added",
      EMAIL_REPLY_SENT: "Email Reply Sent",
      TEMPLATE_SENT: "Template Sent",
      TEMPLATE_DELETED: "Template Deleted",
      SLA_BREACHED: "SLA Breached",
    };
    return actionMap[actionType] || actionType;
  };

  const sentTemplatesColumns = [
    {
      title: "S.No.",
      key: "sno",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: status => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: text => text || "No description",
    },
    {
      title: "Template Name",
      dataIndex: "templateName",
      key: "templateName",
    },
    {
      title: "Date",
      dataIndex: "sentAt",
      key: "date",
      render: date => moment(date).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title='Confirm Delete'
          description='Are you sure you want to delete this template?'
          okText='Yes, Delete'
          cancelText='Cancel'
          placement='topRight'
          onConfirm={() => handleDeleteSentTemplate(record.id || record._id)}
        >
          <Button type='text' danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  // Debug personal notes data
  // console.log("Personal Notes Data:", staticPersonalNotes);
  // console.log("Personal Notes:", personalNotes);

  const extractEmail = ticket => {
    if (!ticket) return "N/A";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Static email for demo
    return "customer@example.com";
  };

  if (ticketLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
          }}
        >
          <Skeleton
            active
            avatar
            paragraph={{ rows: 20 }}
            title={{ width: "80%" }}
          />
        </Card>
      </div>
    );
  }

  if (!selectedTicket) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Ticket Not Found</h2>
        <p>The requested ticket could not be located.</p>
        <Button type="primary" onClick={() => navigate("/tickets")}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  const handleSelectContactData = async (num, intervene, flag) => {
    try {
      console.log("Select contact data:", num, intervene, flag);
    } catch (error) { }
  };

  const isValidDate = val => {
    const d = new Date(val);
    return !isNaN(d.getTime());
  };

  return (
    <div className='min-h-screen'>

      {/* ✅ FIXED: Show breadcrumb only in route view, not modal view */}
      {!isModalView && (
        <Breadcrumb
          title='Ticket Details'
          subtitle={`Tickets Management`}
        />
      )}

      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Row justify='space-between' align='middle'>
          <Col>
            <Space style={{ fontSize: "16px", fontWeight: "600" }} >
              {/* ✅ FIXED: Add back button in route view */}
              {!isModalView && (
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/tickets")}
                  style={{ marginRight: 8 }}
                >
                  Back
                </Button>
              )}
              <Divider type='vertical' />
              <Title level={4} style={{ margin: 0 }}>
                {selectedTicket.ticketId}
              </Title>
            </Space>
          </Col>
        </Row>
      </div>

      <div style={{ padding: "24px" }}>
        <Row gutter={24}>
          {/* Left Column - Contact Info */}
          <Col xs={24} lg={6}>
            <Space direction='vertical' size='middle' style={{ width: "100%" }}>
              {/* Contact Information */}
              <Card
                style={{ borderRadius: "10px" }}
                headStyle={{
                  borderBottom: "none", // removes the default Ant Design line
                }}
                title={
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      position: "relative",
                      paddingBottom: "8px",
                    }}
                  >
                    <Space style={{ marginTop: "20px", marginBottom: "10px" }}>
                      <UserOutlined style={{ color: "var(--primary-color)" }} />
                      <span>Contact Information</span>

                    </Space>

                    {/* Custom underline (3/4 width) */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%", // 👈 only 3/4 of the card
                        height: "2px",
                        backgroundColor: "#f0f0f0", // subtle light grey
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                }
                size='small'
              >
                <Space
                  direction='vertical'
                  size='middle'
                  style={{ width: "100%" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Avatar size={48}>
                      {selectedTicket.customerName?.charAt(0) || "U"}
                    </Avatar>
                    <Text style={{ fontWeight: 500, fontSize: "15px" }}>
                      {selectedTicket.customerName || "Unknown"}
                    </Text>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <FeatherIcon
                      icon='phone'
                      size={16}
                      style={{ color: "var(--primary-color)", flexShrink: 0 }}
                    />
                    <Text
                      type='primary'
                      style={{ fontSize: "13px", minWidth: "45px" }}
                    >
                      Phone
                    </Text>
                    <Text style={{ fontSize: "14px", flex: 1 }}>
                      {selectedTicket.mobileNumber || "N/A"}
                    </Text>
                  </div>
                </Space>
              </Card>

              {/* SLA Information */}
              {/* SLA Information */}
              <Card
                size='small'
                style={{ borderRadius: "10px" }}
                headStyle={{
                  borderBottom: "none",
                }}
                title={
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "15px",
                      fontWeight: 600,
                      paddingBottom: "8px",
                      marginTop: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <CalendarOutlined
                      style={{
                        color: "var(--primary-color)",
                        fontSize: "16px",
                      }}
                    />
                    <span>SLA Information</span>

                    <div
                      style={{
                        position: "absolute",
                        bottom: "-10px",
                        left: 0,
                        width: "100%",
                        height: "2px",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                }
              >
                <Space
                  direction='vertical'
                  size='middle'
                  style={{ width: "100%" }}
                >
                  {(() => {
                    const matchingSLA = getMatchingSLAPolicy(
                      selectedTicket.department_field,
                      staticTicketSlaData?.data
                    );

                    if (!matchingSLA) {
                      return (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "20px",
                            border: "1px solid #fafafa",
                            borderRadius: "8px",
                          }}
                        >
                          <Text type='secondary'>
                            No SLA policy found for department:{" "}
                            {selectedTicket.department_field}
                          </Text>
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Resolution Time Countdown */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            paddingTop: "0px",
                          }}
                        >
                          {/* 🟢 STATE 1: TICKET COMPLETED/CLOSED */}
                          {selectedTicket.status === "Complete" ||
                            selectedTicket.status === "Closed" ? (
                            <div
                              style={{
                                backgroundColor: selectedTicket.slaTracking
                                  ?.slaBreached
                                  ? "#fff2f0"
                                  : "#f6ffed",
                                border: selectedTicket.slaTracking?.slaBreached
                                  ? "2px solid #ff4d4f"
                                  : "2px solid #b7eb8f",
                                borderRadius: "12px",
                                padding: "16px",
                                textAlign: "center",
                              }}
                            >
                              {selectedTicket.slaTracking?.slaBreached ? (
                                <>
                                  <ClockCircleOutlined
                                    style={{
                                      color: "#ff4d4f",
                                      fontSize: "32px",
                                      marginBottom: "8px",
                                      display: "block",
                                    }}
                                  />
                                  <div
                                    style={{
                                      fontSize: "16px",
                                      fontWeight: 700,
                                      color: "#ff4d4f",
                                    }}
                                  >
                                    ❌ SLA BREACHED
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#8c8c8c",
                                      marginTop: "4px",
                                    }}
                                  >
                                    Ticket completed after SLA deadline
                                  </div>
                                  {selectedTicket.slaTracking?.breachAmount && (
                                    <div
                                      style={{
                                        fontSize: "13px",
                                        color: "#ff4d4f",
                                        marginTop: "8px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Overdue by:{" "}
                                      {Math.floor(
                                        selectedTicket.slaTracking
                                          .breachAmount /
                                        (60 * 60 * 1000)
                                      )}
                                      h{" "}
                                      {Math.floor(
                                        (selectedTicket.slaTracking
                                          .breachAmount %
                                          (60 * 60 * 1000)) /
                                        (60 * 1000)
                                      )}
                                      m
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <CheckCircleOutlined
                                    style={{
                                      color: "#52c41a",
                                      fontSize: "32px",
                                      marginBottom: "8px",
                                      display: "block",
                                    }}
                                  />
                                  <div
                                    style={{
                                      fontSize: "16px",
                                      fontWeight: 700,
                                      color: "#52c41a",
                                    }}
                                  >
                                    ✅ Ticket Resolved - SLA Met
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#8c8c8c",
                                      marginTop: "4px",
                                    }}
                                  >
                                    Status: {selectedTicket.status}
                                  </div>
                                </>
                              )}
                              {selectedTicket.completedDate && (
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#8c8c8c",
                                    marginTop: "8px",
                                  }}
                                >
                                  Completed:{" "}
                                  {new Date(
                                    selectedTicket.completedDate
                                  ).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </div>
                              )}
                            </div>
                          ) : slaCountdown.isExpired ? (
                            /* 🔴 STATE 2: SLA EXPIRED (NOT YET COMPLETED) */
                            <div
                              style={{
                                backgroundColor: "#fff2f0",
                                border: "2px solid #ff4d4f",
                                borderRadius: "12px",
                                padding: "16px",
                                textAlign: "center",
                                animation: "pulse 2s infinite",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "28px",
                                  marginBottom: "8px",
                                }}
                              >
                                ⏰
                              </div>
                              <div
                                style={{
                                  fontSize: "16px",
                                  fontWeight: 700,
                                  color: "#ff4d4f",
                                }}
                              >
                                ⚠️ SLA BREACHED
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#ff4d4f",
                                  marginTop: "4px",
                                }}
                              >
                                Immediate escalation required
                              </div>
                              <div
                                style={{
                                  fontSize: "13px",
                                  color: "#8c8c8c",
                                  marginTop: "8px",
                                }}
                              >
                                Due date exceeded - Please complete urgently
                              </div>
                            </div>
                          ) : slaCountdown.isPaused ? (
                            /* 🟡 STATE 3: TIMER PAUSED (AWAITING CUSTOMER RESPONSE) */
                            <div
                              style={{
                                backgroundColor: "#fff7e6",
                                border: "2px solid #ffa940",
                                borderRadius: "12px",
                                padding: "16px",
                                textAlign: "center",
                              }}
                            >
                              <ClockCircleOutlined
                                style={{
                                  color: "#fa8c16",
                                  fontSize: "32px",
                                  marginBottom: "8px",
                                  display: "block",
                                }}
                              />
                              <div
                                style={{
                                  fontSize: "16px",
                                  fontWeight: 700,
                                  color: "#fa8c16",
                                }}
                              >
                                ⏸️ Timer Paused
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#8c8c8c",
                                  marginTop: "4px",
                                }}
                              >
                                Awaiting Customer Response
                              </div>

                              {/* Time Remaining Display */}
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(3, 1fr)",
                                  gap: "8px",
                                  marginTop: "16px",
                                  marginBottom: "12px",
                                }}
                              >
                                {[
                                  { value: slaCountdown.days, label: "Days" },
                                  { value: slaCountdown.hours, label: "Hours" },
                                  {
                                    value: slaCountdown.minutes,
                                    label: "Mins",
                                  },
                                ].map((item, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      textAlign: "center",
                                      backgroundColor: "white",
                                      borderRadius: "8px",
                                      padding: "12px 4px",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                      border: "1px solid #ffd591",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "24px",
                                        fontWeight: "bold",
                                        color: "#fa8c16",
                                        fontFamily:
                                          "'Courier New', 'monospace'",
                                        lineHeight: 1,
                                        marginBottom: "4px",
                                      }}
                                    >
                                      {String(item.value).padStart(2, "0")}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "9px",
                                        color: "#8c8c8c",
                                        textTransform: "uppercase",
                                        fontWeight: 600,
                                        letterSpacing: "0.5px",
                                      }}
                                    >
                                      {item.label}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#fa8c16",
                                  fontWeight: 600,
                                }}
                              >
                                ⏳ Time will resume when work continues
                              </div>
                            </div>
                          ) : selectedTicket.status === "Reopened" ? (
                            /* 🆕 STATE 5: TICKET REOPENED - FRESH START */
                            <div
                              style={{
                                backgroundColor: "#f0f5ff",
                                border: "2px solid #1890ff",
                                borderRadius: "12px",
                                padding: "16px 12px",
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              {/* Animated background shimmer */}
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background:
                                    "linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.15), transparent)",
                                  animation: "shimmer 3s infinite",
                                }}
                              />

                              {/* Countdown Display */}
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(4, 1fr)",
                                  gap: "6px",
                                  position: "relative",
                                  zIndex: 1,
                                  marginBottom: "12px",
                                }}
                              >
                                {[
                                  { value: slaCountdown.days, label: "Days" },
                                  { value: slaCountdown.hours, label: "Hours" },
                                  {
                                    value: slaCountdown.minutes,
                                    label: "Mins",
                                  },
                                  {
                                    value: slaCountdown.seconds,
                                    label: "Secs",
                                  },
                                ].map((item, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      textAlign: "center",
                                      backgroundColor: "white",
                                      borderRadius: "8px",
                                      padding: "10px 4px",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                                      border: "1px solid #f0f0f0",
                                      transition: "all 0.3s ease",
                                    }}
                                    className={
                                      item.label === "Secs" ? "flip-card" : ""
                                    }
                                  >
                                    <div
                                      style={{
                                        fontSize: "22px",
                                        fontWeight: "bold",
                                        color: "#1890ff",
                                        fontFamily:
                                          "'Courier New', 'monospace'",
                                        lineHeight: 1,
                                        marginBottom: "4px",
                                      }}
                                    >
                                      {String(item.value).padStart(2, "0")}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "9px",
                                        color: "#8c8c8c",
                                        textTransform: "uppercase",
                                        fontWeight: 600,
                                        letterSpacing: "0.5px",
                                      }}
                                    >
                                      {item.label}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Progress bar */}
                              <div
                                style={{
                                  width: "100%",
                                  height: "6px",
                                  backgroundColor: "#f0f0f0",
                                  borderRadius: "3px",
                                  overflow: "hidden",
                                  marginBottom: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${slaCountdown.percentageRemaining}%`,
                                    height: "100%",
                                    backgroundColor: "#1890ff",
                                    transition: "width 1s linear",
                                  }}
                                />
                              </div>

                              {/* Status text */}
                              <div
                                style={{
                                  textAlign: "center",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  color: "#1890ff",
                                }}
                              >
                                🔄 TICKET REOPENED - FRESH SLA TIMER STARTED
                              </div>

                              {/* Deadline */}
                              <div
                                style={{
                                  textAlign: "center",
                                  fontSize: "12px",
                                  color: "#8c8c8c",
                                  marginTop: "6px",
                                }}
                              >
                                Due:{" "}
                                {selectedTicket.dueDate
                                  ? new Date(
                                    selectedTicket.dueDate
                                  ).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                                  : "N/A"}
                              </div>
                            </div>
                          ) : (
                            /* 🟢 STATE 4: TIMER RUNNING (DEFAULT) */
                            <div
                              style={{
                                backgroundColor:
                                  slaCountdown.status === "critical"
                                    ? "#fff2f0"
                                    : slaCountdown.status === "warning"
                                      ? "#fffbe6"
                                      : "#f6ffed",
                                border: `2px solid ${slaCountdown.status === "critical"
                                  ? "#ff4d4f"
                                  : slaCountdown.status === "warning"
                                    ? "#faad14"
                                    : "#52c41a"
                                  }`,
                                borderRadius: "12px",
                                padding: "16px 12px",
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              {/* Animated background shimmer */}
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background: `linear-gradient(90deg, transparent, ${slaCountdown.status === "critical"
                                    ? "rgba(255, 77, 79, 0.15)"
                                    : slaCountdown.status === "warning"
                                      ? "rgba(250, 173, 20, 0.15)"
                                      : "rgba(82, 196, 26, 0.15)"
                                    }, transparent)`,
                                  animation: "shimmer 3s infinite",
                                }}
                              />

                              {/* Countdown Display */}
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(4, 1fr)",
                                  gap: "6px",
                                  position: "relative",
                                  zIndex: 1,
                                  marginBottom: "12px",
                                }}
                              >
                                {[
                                  { value: slaCountdown.days, label: "Days" },
                                  { value: slaCountdown.hours, label: "Hours" },
                                  {
                                    value: slaCountdown.minutes,
                                    label: "Mins",
                                  },
                                  {
                                    value: slaCountdown.seconds,
                                    label: "Secs",
                                  },
                                ].map((item, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      textAlign: "center",
                                      backgroundColor: "white",
                                      borderRadius: "8px",
                                      padding: "10px 4px",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                                      border: "1px solid #f0f0f0",
                                      transition: "all 0.3s ease",
                                    }}
                                    className={
                                      item.label === "Secs" ? "flip-card" : ""
                                    }
                                  >
                                    <div
                                      style={{
                                        fontSize: "22px",
                                        fontWeight: "bold",
                                        color:
                                          slaCountdown.status === "critical"
                                            ? "#ff4d4f"
                                            : slaCountdown.status === "warning"
                                              ? "#faad14"
                                              : "#52c41a",
                                        fontFamily:
                                          "'Courier New', 'monospace'",
                                        lineHeight: 1,
                                        marginBottom: "4px",
                                      }}
                                    >
                                      {String(item.value).padStart(2, "0")}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "9px",
                                        color: "#8c8c8c",
                                        textTransform: "uppercase",
                                        fontWeight: 600,
                                        letterSpacing: "0.5px",
                                      }}
                                    >
                                      {item.label}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Progress bar */}
                              <div
                                style={{
                                  width: "100%",
                                  height: "6px",
                                  backgroundColor: "#f0f0f0",
                                  borderRadius: "3px",
                                  overflow: "hidden",
                                  marginBottom: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${slaCountdown.percentageRemaining}%`,
                                    height: "100%",
                                    backgroundColor:
                                      slaCountdown.status === "critical"
                                        ? "#ff4d4f"
                                        : slaCountdown.status === "warning"
                                          ? "#faad14"
                                          : "#52c41a",
                                    transition: "width 1s linear",
                                  }}
                                />
                              </div>

                              {/* Status text */}
                              <div
                                style={{
                                  textAlign: "center",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  color:
                                    slaCountdown.status === "critical"
                                      ? "#ff4d4f"
                                      : slaCountdown.status === "warning"
                                        ? "#faad14"
                                        : "#52c41a",
                                }}
                              >
                                {slaCountdown.status === "critical"
                                  ? "🚨 URGENT - Immediate Action Required"
                                  : slaCountdown.status === "warning"
                                    ? "⚡ Action Required Soon"
                                    : "✓ Within SLA Target"}
                              </div>

                              {/* Deadline */}
                              <div
                                style={{
                                  textAlign: "center",
                                  fontSize: "12px",
                                  color: "#8c8c8c",
                                  marginTop: "6px",
                                }}
                              >
                                Due:{" "}
                                {selectedTicket.dueDate
                                  ? new Date(
                                    selectedTicket.dueDate
                                  ).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                                  : "N/A"}
                              </div>
                            </div>
                          )}

                          {/* SLA Policy Name */}
                          <div
                            style={{
                              backgroundColor: "#f0f5ff",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              marginBottom: "8px",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: "12px",
                                color: "#1890ff",
                                fontWeight: 600,
                              }}
                            >
                              Policy: {matchingSLA.name}
                            </Text>
                          </div>

                          {/* Resolution Target Header */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "110px 1fr",
                              gap: "32px",
                              alignItems: "center",
                              marginBottom: "-30px",
                            }}
                          >
                            <Text
                              type='primary'
                              style={{ fontSize: "13px", fontWeight: 500 }}
                            >
                              Resolution Target
                            </Text>
                            <Text
                              style={{
                                fontSize: "14px",
                                color: "#8c8c8c",
                                fontWeight: "bold",
                              }}
                            >
                              {(() => {
                                // First check if we have tracking data from backend
                                if (
                                  selectedTicket.slaTracking?.resolutionTime
                                ) {
                                  return formatTimeWithUnit(
                                    selectedTicket.slaTracking.resolutionTime,
                                    selectedTicket.slaTracking
                                      .resolutionTimeUnit
                                  );
                                }

                                // Otherwise, calculate based on priority
                                const priority =
                                  selectedTicket.priority?.toLowerCase();
                                let time, unit;

                                switch (priority) {
                                  case "low":
                                    time = matchingSLA.lowResolutionTime;
                                    unit = matchingSLA.lowResolutionTimeUnit;
                                    break;
                                  case "medium":
                                    time = matchingSLA.mediumResolutionTime;
                                    unit = matchingSLA.mediumResolutionTimeUnit;
                                    break;
                                  case "high":
                                    time = matchingSLA.highResolutionTime;
                                    unit = matchingSLA.highResolutionTimeUnit;
                                    break;
                                  case "critical":
                                    time = matchingSLA.criticalResolutionTime;
                                    unit =
                                      matchingSLA.criticalResolutionTimeUnit;
                                    break;
                                  default:
                                    time = matchingSLA.mediumResolutionTime;
                                    unit = matchingSLA.mediumResolutionTimeUnit;
                                }

                                return formatTimeWithUnit(time, unit);
                              })()}
                            </Text>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "110px 1fr",
                        gap: "32px",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <Text
                        type='primary'
                        style={{ fontSize: "13px", fontWeight: 500 }}
                      >
                        First Response
                      </Text>
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#8c8c8c",
                          fontWeight: "bold",
                        }}
                      >
                        {firstResponseTimer.targetDisplay || "Not Set"}
                      </Text>
                    </div>

                    {/* First Response Status Display */}
                    {firstResponseTimer.status === "achieved" && (
                      <div
                        style={{
                          backgroundColor: "#f6ffed",
                          borderRadius: "12px",
                          padding: "-20px",
                          textAlign: "center",
                          animation: "fadeIn 0.5s ease-in",
                        }}
                      >
                        <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                          🎉
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "var(--primary)",
                            marginBottom: "4px",
                          }}
                        >
                          Great Job!
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--primary)",
                            fontWeight: 600,
                          }}
                        >
                          First response within SLA target
                        </div>
                      </div>
                    )}

                    {firstResponseTimer.status === "missed" &&
                      firstResponseTimer.hasResponded && (
                        <div
                          style={{
                            backgroundColor: "#fff2f0",
                            border: "2px solid #ffccc7",
                            borderRadius: "12px",
                            padding: "16px",
                            textAlign: "center",
                            animation: "fadeIn 0.5s ease-in",
                          }}
                        >
                          <div
                            style={{ fontSize: "28px", marginBottom: "8px" }}
                          >
                            ⏰
                          </div>
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: 700,
                              color: "#ff4d4f",
                              marginBottom: "4px",
                            }}
                          >
                            Response Delayed
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#ff4d4f",
                              fontWeight: 600,
                            }}
                          >
                            First response exceeded SLA target
                          </div>
                        </div>
                      )}

                    {firstResponseTimer.status === "pending" &&
                      firstResponseTimer.remainingSeconds > 0 && (
                        <div
                          style={{
                            backgroundColor: "#e6f7ff",
                            border: "2px solid #91d5ff",
                            borderRadius: "12px",
                            padding: "6px",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#1890ff",
                              marginBottom: "2px",
                            }}
                          >
                            {firstResponseTimer.isReopened
                              ? "⏱️ First Response Timer (Reopened)"
                              : "⏱️ First Response timer"}
                          </div>

                          {/* Countdown Timer - ✅ UPDATED: Show hours if > 60 minutes */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                firstResponseTimer.remainingSeconds >= 3600
                                  ? "repeat(3, 1fr)"
                                  : "repeat(2, 1fr)",
                              gap: "8px",
                              marginBottom: "12px",
                            }}
                          >
                            {/* ✅ CONDITIONAL: Show hours only if >= 1 hour */}
                            {firstResponseTimer.remainingSeconds >= 3600 && (
                              <div
                                style={{
                                  textAlign: "center",
                                  backgroundColor: "white",
                                  borderRadius: "8px",
                                  padding: "10px 4px",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                  border: "1px solid #91d5ff",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "22px",
                                    fontWeight: "bold",
                                    color: "#1890ff",
                                    fontFamily: "'Courier New', 'monospace'",
                                    lineHeight: 1,
                                    marginBottom: "4px",
                                  }}
                                >
                                  {String(
                                    Math.floor(
                                      firstResponseTimer.remainingSeconds / 3600
                                    )
                                  ).padStart(2, "0")}
                                </div>
                                <div
                                  style={{
                                    fontSize: "9px",
                                    color: "#8c8c8c",
                                    textTransform: "uppercase",
                                    fontWeight: 600,
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  Hours
                                </div>
                              </div>
                            )}

                            <div
                              style={{
                                textAlign: "center",
                                backgroundColor: "white",
                                borderRadius: "8px",
                                padding: "10px 4px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                border: "1px solid #91d5ff",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "22px",
                                  fontWeight: "bold",
                                  color: "#1890ff",
                                  fontFamily: "'Courier New', 'monospace'",
                                  lineHeight: 1,
                                  marginBottom: "4px",
                                }}
                              >
                                {String(
                                  Math.floor(
                                    (firstResponseTimer.remainingSeconds %
                                      3600) /
                                    60
                                  )
                                ).padStart(2, "0")}
                              </div>
                              <div
                                style={{
                                  fontSize: "9px",
                                  color: "#8c8c8c",
                                  textTransform: "uppercase",
                                  fontWeight: 600,
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Mins
                              </div>
                            </div>

                            <div
                              style={{
                                textAlign: "center",
                                backgroundColor: "white",
                                borderRadius: "8px",
                                padding: "10px 4px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                border: "1px solid #91d5ff",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "22px",
                                  fontWeight: "bold",
                                  color: "#1890ff",
                                  fontFamily: "'Courier New', 'monospace'",
                                  lineHeight: 1,
                                  marginBottom: "4px",
                                }}
                              >
                                {String(
                                  Math.floor(
                                    firstResponseTimer.remainingSeconds % 60
                                  )
                                ).padStart(2, "0")}
                              </div>
                              <div
                                style={{
                                  fontSize: "9px",
                                  color: "#8c8c8c",
                                  textTransform: "uppercase",
                                  fontWeight: 600,
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Secs
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    {firstResponseTimer.status === "missed" &&
                      !firstResponseTimer.hasResponded && (
                        <div
                          style={{
                            backgroundColor: "#fff2f0",
                            borderRadius: "12px",
                            padding: "6px",
                            textAlign: "center",
                            animation: "pulse 2s infinite",
                          }}
                        >
                          <div
                            style={{ fontSize: "22px", marginBottom: "8px" }}
                          >
                            ⚠️
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#ff4d4f",
                              marginBottom: "4px",
                            }}
                          >
                            You Missed It!
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#ff4d4f",
                              fontWeight: 600,
                            }}
                          >
                            First response time exceeded - Respond immediately!
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Add CSS for fade-in animation */}
                  <style jsx>{`
                    @keyframes fadeIn {
                      from {
                        opacity: 0;
                        transform: scale(0.95);
                      }
                      to {
                        opacity: 1;
                        transform: scale(1);
                      }
                    }
                  `}</style>
                </Space>
              </Card>

              {/* Add CSS for animations */}
              <style jsx>{`
                @keyframes shimmer {
                  0% {
                    transform: translateX(-100%);
                  }
                  100% {
                    transform: translateX(100%);
                  }
                }

                @keyframes pulse {
                  0%,
                  100% {
                    opacity: 1;
                  }
                  50% {
                    opacity: 0.8;
                  }
                }

                .flip-card {
                  animation: flip 1s ease-in-out;
                }

                @keyframes flip {
                  0%,
                  100% {
                    transform: rotateX(0);
                  }
                  50% {
                    transform: rotateX(180deg);
                  }
                }
              `}</style>

              {/* Ticket Properties */}
              <Card
                style={{ borderRadius: "10px" }}
                headStyle={{
                  borderBottom: "none", // removes the default Ant Design underline
                }}
                title={
                  <div
                    style={{
                      position: "relative",
                      fontSize: "16px",
                      fontWeight: 500,
                      paddingBottom: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* Left section */}
                    <Space style={{ marginTop: "20px", marginBottom: "20px" }}>
                      <FileTextOutlined
                        style={{ color: "var(--primary-color)" }}
                      />
                      <span>Ticket Properties</span>

                    </Space>

                    {/* Right section: edit / save / cancel buttons */}
                    {/* {!isEditingProperties ? (
                      <Tooltip title='Edit'>
                        <Button
                          type='text'
                          size='small'
                          icon={<EditOutlined />}
                          onClick={() => setIsEditingProperties(true)}
                        />
                      </Tooltip>
                    ) : (
                      <Space>
                        <Tooltip title='save'>
                          <Button
                            type='text'
                            size='small'
                            icon={<CheckSquareOutlined />}
                            onClick={handleSaveProperties}
                          />
                        </Tooltip>
                        <Tooltip title='Reset'>
                          <Button
                            type='text'
                            size='small'
                            danger
                            icon={<ReloadOutlined />}
                            onClick={() => setIsEditingProperties(false)}
                          />
                        </Tooltip>
                      </Space>
                    )} */}

                    {/* Custom single underline */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        height: "2px",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                }
                size='small'
              >
                <Space
                  direction='vertical'
                  size='middle'
                  style={{ width: "100%" }}
                >
                  {[
                    {
                      key: "ticketId",
                      label: "Ticket ID",
                      value: selectedTicket.ticketId,
                      editable: false,
                    },
                    // {
                    //   key: "status",
                    //   label: "Status",
                    //   value: selectedTicket.status,
                    //   editable: true,
                    //   type: "select",
                    //   options:
                    //     selectedTicket.status === "Complete"
                    //       ? ["Reopened"]
                    //       : [
                    //         "Assigned",
                    //         "In Progress",
                    //         "Pending",
                    //         "Complete",
                    //         "Awaiting Customer Response",
                    //       ],
                    // },
                    {
                      key: "priority",
                      label: "Priority",
                      value: selectedTicket.priority,
                      editable: true,
                      type: "select",
                      options: ["Low", "Medium", "High", "Critical"],
                    },
                    // {
                    //   key: "type",
                    //   label: "Type",
                    //   value: selectedTicket.type,
                    //   editable: true,
                    //   type: "select",
                    //   options: [
                    //     "Question",
                    //     "Incident",
                    //     "Problem",
                    //     "Feature Request",
                    //     "Task",
                    //   ],
                    // },
                    {
                      key: "department",
                      label: "Department",
                      value: selectedTicket.department_field,
                      editable: true,
                      type: "select",
                      options: departments || [],
                    },
                    {
                      key: "assignedTo",
                      label: "Agent",
                      value: selectedTicket.assignedTo,
                      editable: true,
                      type: "select",
                      options: ticketingAgents || [],
                    },
                    {
                      key: "source",
                      label: "Source",
                      value: selectedTicket.source,
                      editable: false,
                    },
                    // {
                    //   key: "category",
                    //   label: "Category",
                    //   value: selectedTicket.category,
                    //   editable: true,
                    //   type: "select",
                    //   options: [
                    //     "Technical Issue",
                    //     "Account Issue",
                    //     "Billing Question",
                    //     "Feature Request",
                    //     "General Inquiry",
                    //   ],
                    // },
                    {
                      key: "company",
                      label: "Company",
                      value: (() => {
                        // Find matching lead by mobile number
                        if (staticLeadsData?.data && selectedTicket.mobileNumber) {
                          const matchingLead = staticLeadsData.data.find(
                            lead =>
                              lead.fullMobile === selectedTicket.mobileNumber ||
                              lead.mobile ===
                              selectedTicket.mobileNumber?.replace("91", "")
                          );
                          return (
                            matchingLead?.company ||
                            selectedTicket.company ||
                            "N/A"
                          );
                        }
                        return selectedTicket.company || "N/A";
                      })(),
                      editable: true,
                      type: "input",
                    },
                  ].map(({ key, label, value, editable, type, options }) => (
                    <div
                      key={key}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "100px 1fr",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        type='primary'
                        className='form-label'
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        {label}
                      </Text>
                      <div>
                        {isEditingProperties && editable ? (
                          type === "select" ? (
                            <Select
                              value={editedProperties[key]}
                              onChange={value =>
                                handlePropertyChange(key, value)
                              }
                              style={{ width: "100%" }}
                              size='small'
                            >
                              {options.map(opt =>
                                typeof opt === "string" ? (
                                  <Option key={opt} value={opt}>
                                    {opt}
                                  </Option>
                                ) : (
                                  <Option
                                    key={opt?.username}
                                    value={opt?.username}
                                  >
                                    {opt.username}
                                  </Option>
                                )
                              )}
                            </Select>
                          ) : (
                            <Input
                              value={editedProperties[key]}
                              onChange={e =>
                                handlePropertyChange(key, e.target.value)
                              }
                              size='small'
                            />
                          )
                        ) : key === "status" || key === "priority" ? (
                          <Tag
                            color={
                              key === "status"
                                ? getStatusColor(value)
                                : getPriorityColor(value)
                            }
                            style={{ margin: 0 }}
                          >
                            {value || "Not Set"}
                          </Tag>
                        ) : (
                          <Text style={{ fontSize: "14px" }}>
                            {value || "Not Set"}
                          </Text>
                        )}
                      </div>
                    </div>
                  ))}
                </Space>
              </Card>
            </Space>
          </Col>

          <Col xs={24} lg={18}>
            {/* 🔥 ADD THIS SECTION - Status & Priority in Top Right Corner */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "16px",
                marginBottom: "16px",
                padding: "12px 16px",
                borderRadius: "8px",
              }}
            >
              {/* Current Status */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Text style={{ fontWeight: "500", fontSize: 14 }}>Agent:</Text>
                <Tag
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    padding: "4px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#D1FFBD",
                    border: "none",
                    color: "black",
                    margin: 0,
                    minWidth: "120px",
                    textAlign: "center",
                  }}
                >
                  {selectedTicket.assignedTo}
                </Tag>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Text style={{ fontWeight: "500", fontSize: 14 }}>Status:</Text>
                <Tag
                  color={getStatusColor(selectedTicket.status)}
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    padding: "4px 12px",
                    borderRadius: "8px",
                    border: "none",
                    margin: 0,
                    minWidth: "120px",
                    textAlign: "center",
                  }}
                >
                  {selectedTicket.status}
                </Tag>
              </div>

              {/* Priority */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Text style={{ fontWeight: "500", fontSize: 14 }}>
                  Priority:
                </Text>
                <Tag
                  color={getPriorityColor(selectedTicket.priority) || "blue"}
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    padding: "4px 12px",
                    borderRadius: "8px",
                    border: "none",
                    margin: 0,
                    minWidth: "80px",
                    textAlign: "center",
                  }}
                >
                  {selectedTicket.priority}
                </Tag>
              </div>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab} size='large'>
              {/* Ticket Details Tab */}
              <TabPane tab={<span style={{ fontSize: "16px", fontWeight: "600" }}>Ticket Details</span>} key='1'>
                <Card>
                  <div style={{ padding: "16px" }}>
                    <Row
                      justify='space-between'
                      align='middle'
                      style={{ marginBottom: "16px" }}
                    >
                      {/* Left side — Ticket Title */}
                      <Col>
                        <Title level={4} style={{ margin: 0 }}>
                          {selectedTicket.description || selectedTicket.ticketId}
                        </Title>
                      </Col>

                      {/* Right side — Status Update Section */}
                      <Col>
                        <Space align='center'>
                          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                            Update Status:
                          </Text>
                          <Select
                            className='rounded-select'
                            value={selectedTicket.status}
                            onChange={handleStatusChange}
                            style={{ width: 200 }}
                          >
                            {/* Show Reopened option only if ticket is completed or closed */}
                            {selectedTicket.status === "Complete" ||
                              selectedTicket.status === "Closed" ? (
                              <Option value='Reopened'>Reopened</Option>
                            ) : (
                              <>
                                {selectedTicket.status !== "Assigned" && (
                                  <Option value='Assigned'>Assigned</Option>
                                )}
                                <Option value='Awaiting Customer Response'>
                                  Awaiting Customer Response
                                </Option>
                                <Option value='In Progress'>In Progress</Option>
                                {/* <Option value='Pending'>Pending</Option> */}
                                <Option value='Complete'>Complete</Option>
                              </>
                            )}
                          </Select>
                        </Space>
                      </Col>
                    </Row>

                    {/* Action Buttons */}
                    <div
                      style={{
                        marginBottom: "24px",
                        borderTop: "1px solid #f0f0f0",
                        paddingTop: "16px",
                      }}
                    >
                      <Space>
                        {/* <Button
                          type='primary'
                          icon={<CommentOutlined />}
                          onClick={handleReplyClick}
                          style={{ borderRadius: 8 }}
                        >
                          Reply
                        </Button>
                        <Button
                          icon={<ForwardOutlined />}
                          onClick={handleForwardClick}
                          style={{ borderRadius: 8 }}
                        >
                          Forward
                        </Button> */}
                        <Button
                          icon={<FileAddOutlined />}
                          onClick={handleAddNoteClick}
                          style={{
                            borderRadius: 8,
                            backgroundColor: "var(--primary)",
                            color: "#ffff",
                          }}
                        >
                          Add Note
                        </Button>

                        {/* 🔥 ADD THIS NEW BUTTON HERE */}
                        <Button
                          icon={<UserSwitchOutlined />}
                          onClick={() => setSwitchAgentModalOpen(true)}
                          style={{
                            borderRadius: 8,
                            backgroundColor: "var(--primary)",
                            color: "#ffff",
                          }}
                        >
                          Switch Agent
                        </Button>
                        {/* Add Access Chat Button */}
                        <Button
                          type='primary'
                          icon={<WechatOutlined />}
                          onClick={() => setChatDrawerOpen(true)}
                          style={{
                            borderRadius: 8,
                          }}
                          className='btn-primary'
                        >
                          Access Chat
                        </Button>
                        <Tooltip title='Download Chat'>
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={handleDownloadChat}
                            style={{
                              borderRadius: 5,
                              backgroundColor: "var(--primary)",
                              borderColor: "var(--primary)",
                              color: "#fff",
                            }}
                          ></Button>
                        </Tooltip>
                        <Tooltip title='Refresh Chat'>
                          <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefreshChat}
                            style={{
                              backgroundColor: "var(--primary)",
                              color: "white",
                              borderRadius: "9px",
                            }}
                          ></Button>
                        </Tooltip>
                      </Space>
                    </div>

                    {selectedTicket?.description && (
                      <div style={{ marginBottom: "10px" }}>
                        {selectedTicket?.subject && (
                          <div style={{ width: "100%", textWrap: "nowrap" }}>
                            <h6>
                              <strong>Subject :</strong>{" "}
                              <span
                                style={{ fontWeight: 600 }}
                              >
                                {selectedTicket?.subject ||
                                  "No Subject provided"}
                              </span>
                            </h6>
                          </div>
                        )}
                        <div style={{ width: "100%", textWrap: "nowrap" }}>
                          <h6>
                            <strong>Description :</strong>{" "}
                            <span style={{ fontWeight: 600 }}>
                              {selectedTicket?.description ||
                                "No description provided"}
                            </span>
                          </h6>
                        </div>
                      </div>
                    )}

                    {/* Personal Notes Section - FIXED with better error handling */}
                    {personalNotesLoading ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spin size='small' />
                        <Text type='secondary'>Loading personal notes...</Text>
                      </div>
                    ) : personalNotes && personalNotes.length > 0 ? (
                      <div style={{ marginBottom: "24px" }}>
                        <Title level={5}>Personal Notes</Title>
                        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                          <Space
                            direction='vertical'
                            size='small'
                            style={{ width: "100%" }}
                          >
                            {personalNotes.map((note, index) => (
                              <Card
                                key={note.id || note._id || index}
                                size='small'
                              >
                                <span
                                  style={{
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {note.content ||
                                    note.note ||
                                    note.body ||
                                    "No content available"}
                                </span>
                                <div
                                  style={{
                                    marginTop: "8px",
                                    textAlign: "right",
                                  }}
                                >
                                  <span
                                    style={{ fontSize: "12px" }}
                                  >
                                    {moment(
                                      note.timestamp ||
                                      note.createdAt ||
                                      note.date
                                    ).format("MMM DD, YYYY HH:mm")}
                                    {note.author || note.user || note.createdBy
                                      ? ` by ${note.author || note.user || note.createdBy}`
                                      : ""}
                                  </span>
                                </div>
                              </Card>
                            ))}
                          </Space>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: "24px" }}>
                        <Card
                          size='small'
                          style={{
                            backgroundColor: "#f6ffed",
                            borderColor: "#b7eb8f",
                          }}
                        >
                          <Text style={{ color: "black" }}>
                            No personal notes found. Add a note to track
                            important information.
                          </Text>
                        </Card>
                      </div>
                    )}

                    {/* Communications */}
                    <div
                      style={{
                        marginBottom: "24px",
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      <Space
                        direction='vertical'
                        size='middle'
                        style={{ width: "100%" }}
                      >
                        {communications.map(comm => {
                          // Function to detect and extract URLs from content
                          const extractUrls = text => {
                            const urlRegex = /(https?:\/\/[^\s]+)/g;
                            return text.match(urlRegex) || [];
                          };

                          // Function to check if URL is an image/video
                          const isMediaUrl = url => {
                            const mediaExtensions = [
                              ".jpg",
                              ".jpeg",
                              ".png",
                              ".gif",
                              ".bmp",
                              ".webp",
                              ".mp4",
                              ".avi",
                              ".mov",
                              ".webm",
                            ];
                            return mediaExtensions.some(ext =>
                              url.toLowerCase().includes(ext)
                            );
                          };

                          const urls = extractUrls(comm.content);
                          const mediaUrls = urls.filter(isMediaUrl);
                          const hasMedia = mediaUrls.length > 0;

                          const isCustomer = comm.type === "customer";

                          return (
                            <div
                              key={comm.id}
                              style={{
                                display: "flex",
                                justifyContent: isCustomer
                                  ? "flex-start"
                                  : "flex-end",
                                width: "100%",
                              }}
                            >
                              <Card
                                size='small'
                                style={{
                                  borderLeft: `4px solid ${comm.type === "customer"
                                    ? "#52c41a"
                                    : comm.type === "agent"
                                      ? "#1890ff"
                                      : "#faad14"
                                    }`,
                                  borderRadius: 8,
                                  maxWidth: "70%",
                                  minWidth: "30%",
                                  flexWrap: "nowrap",
                                  wordWrap: "break-word",
                                  overflowWrap: "break-word",
                                  overflow: "hidden",
                                }}
                                onClick={() => {
                                  setSelectedMessage(comm);
                                  setMessageModalOpen(true);
                                }}
                              >
                                <Space style={{ width: "100%" }}>
                                  {isCustomer && (
                                    <Avatar
                                      size='small'
                                      icon={getMessageIcon(comm.type)}
                                    />
                                  )}
                                  <div style={{ width: "100%" }}>
                                    <Text strong>
                                      {comm.author === "Current User"
                                        ? selectedTicket.assignedTo ||
                                        "Unassigned"
                                        : comm.author}
                                    </Text>
                                    <br />
                                    <Text style={{ fontSize: "12px" }}>
                                      {moment(comm.timestamp).format(
                                        "MMM DD, YYYY HH:mm"
                                      )}
                                    </Text>
                                    <span
                                      style={{
                                        marginTop: 8,
                                        whiteSpace: "pre-wrap",
                                      }}
                                    >
                                      {comm.content}
                                    </span>

                                    {/* Media links section */}
                                    {hasMedia && (
                                      <div style={{ marginTop: 12 }}>
                                        <Text
                                          strong
                                          style={{
                                            fontSize: "12px",
                                            display: "block",
                                            marginBottom: 8,
                                          }}
                                        >
                                          Media Attachments:
                                        </Text>
                                        <div>
                                          <Button
                                            type='link'
                                            size='small'
                                            onClick={e => {
                                              e.stopPropagation(); // Prevent card click event
                                              const url = mediaUrls[0];
                                              let mediaType = "other";

                                              // Detect media type
                                              if (
                                                /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(
                                                  url
                                                )
                                              ) {
                                                mediaType = "image";
                                              } else if (
                                                /\.(mp4|avi|mov|webm)$/i.test(
                                                  url
                                                )
                                              ) {
                                                mediaType = "video";
                                              }

                                              setMediaPreview({
                                                visible: true,
                                                url: url,
                                                type: mediaType,
                                              });
                                            }}
                                            style={{
                                              padding: 0,
                                              height: "auto",
                                              fontSize: "12px",
                                            }}
                                          >
                                            View Media
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  {!isCustomer && (
                                    <Avatar
                                      size='small'
                                      icon={getMessageIcon(comm.type)}
                                    />
                                  )}
                                </Space>
                              </Card>
                            </div>
                          );
                        })}
                      </Space>
                    </div>

                    {/* Reply Section */}
                    <div
                      style={{
                        borderTop: "1px solid #f0f0f0",
                        paddingTop: "24px",
                      }}
                    >
                      <Text
                        strong
                        style={{ display: "block", marginBottom: "12px" }}
                      >
                        Add Reply
                      </Text>

                      <Space style={{ marginBottom: "12px" }}>
                        <Button
                          type='primary'
                          icon={<MessageOutlined />}
                          onClick={() => setShowQuickReplies(!showQuickReplies)}
                          style={{ borderRadius: 8 }}
                        >
                          Quick Replies{" "}
                          {showQuickReplies ? <UpOutlined /> : <DownOutlined />}
                        </Button>
                        <Button
                          type='primary'
                          icon={<VideoCameraOutlined />}
                          onClick={() => setShowVideoNotes(!showVideoNotes)}
                          style={{ borderRadius: 8 }}
                        >
                          Video Notes{" "}
                          {showVideoNotes ? <UpOutlined /> : <DownOutlined />}
                        </Button>
                      </Space>

                      {showQuickReplies && (
                        <Card size='small' style={{ marginBottom: "12px" }}>
                          <Space direction='vertical' style={{ width: "100%" }}>
                            {quickReplies.length > 0 ? (
                              quickReplies.map((reply, index) => (
                                <Button
                                  key={index}
                                  type='text'
                                  style={{
                                    textAlign: "left",
                                    justifyContent: "flex-start",
                                  }}
                                  onClick={() => {
                                    setNewReply(reply.message || reply.content);
                                    setShowQuickReplies(false);
                                  }}
                                >
                                  <Text strong>{reply.title}</Text>
                                  <br />
                                  <Text style={{ fontSize: "12px" }}>
                                    {reply.message}
                                  </Text>
                                </Button>
                              ))
                            ) : (
                              <Text>No quick replies found</Text>
                            )}
                          </Space>
                        </Card>
                      )}

                      {showVideoNotes && (
                        <Card size='small' style={{ marginBottom: "12px" }}>
                          <Space direction='vertical' style={{ width: "100%" }}>
                            {videoNotes.length > 0 ? (
                              videoNotes.map((note, index) => (
                                <Button
                                  key={index}
                                  type='text'
                                  style={{
                                    textAlign: "left",
                                    justifyContent: "flex-start",
                                  }}
                                  onClick={() => {
                                    setNewReply(
                                      note.description ||
                                      note.content ||
                                      note.title
                                    );
                                    setSelectedVideoNote(note);
                                    setShowVideoNotes(false);
                                  }}
                                >
                                  <Text strong>{note.title}</Text>
                                  <br />
                                  <Text style={{ fontSize: "12px" }}>
                                    {note.description}
                                  </Text>
                                </Button>
                              ))
                            ) : (
                              <Text>No video notes found</Text>
                            )}
                          </Space>
                        </Card>
                      )}

                      <TextArea
                        value={newReply}
                        onChange={e => setNewReply(e.target.value)}
                        rows={4}
                        placeholder='Type your reply here...'
                        style={{ marginBottom: "12px" }}
                      />

                      {selectedVideoNote && (
                        <Card
                          size='small'
                          style={{
                            marginBottom: "12px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <Space direction='vertical' style={{ width: "100%" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Text strong>
                                Selected Video Note: {selectedVideoNote.title}
                              </Text>
                              <Button
                                type='text'
                                size='small'
                                danger
                                onClick={() => setSelectedVideoNote(null)}
                                style={{ borderRadius: 8 }}
                              >
                                Remove
                              </Button>
                            </div>
                          </Space>
                        </Card>
                      )}

                      <div
                        style={{ display: "flex", justifyContent: "flex-end" }}
                      >
                        <Button
                          type='primary'
                          onClick={handleAddReply}
                          disabled={!newReply.trim()}
                          icon={<SendOutlined />}
                          style={{ borderRadius: 8 }}
                        >
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabPane>

              {/* Send Template Tab */}
              <TabPane tab={<span style={{ fontSize: "16px", fontWeight: "600" }}>Send Template</span>} key='2'>
                <SendTemplate
                  selectedLead={{ name: selectedTicket.customerName, countryCode: "91", mobile: "9876543210" }}
                  formData={formData}
                  setFormData={setFormData}
                  templateVariables={[]}
                  setTemplateVariables={() => { }}
                  selectedTemplate={null}
                  setSelectedTemplate={() => { }}
                  handleReset={() => { }}
                />
              </TabPane>

              {/* Activity Logs Tab */}
              <TabPane
                tab={
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>
                    <HistoryOutlined style={{ marginRight: 8 }} />
                    Activity Logs
                  </span>
                }
                key='3'
              >
                <Card
                  size='small'
                  style={{
                    maxHeight: "600px",
                    overflowY: "auto",
                    overflowX: "hidden",
                    border: "none",
                    padding: "1rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  }}
                  bodyStyle={{ padding: "16px" }}
                  extra={
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handleDownloadActivityLogs}
                      style={{
                        borderRadius: 8,
                        backgroundColor: "var(--primary)",
                        borderColor: "var(--primary)",
                        color: "#fff",
                      }}
                    >
                      Download Logs
                    </Button>
                  }
                >
                  <Timeline>
                    {ticketLogs.length > 0 ? (
                      [...ticketLogs].map(log => {
                        const isFieldChange =
                          log.details &&
                          typeof log.details === "object" &&
                          (log.details.previousStatus !== undefined ||
                            log.details.previousProperties !== undefined);

                        const isNote = log.action === "NOTE_ADDED";
                        const isTemplate =
                          log.action === "TEMPLATE_SENT" ||
                          log.action === "TEMPLATE_DELETED";
                        const isStatusChange = log.action === "STATUS_CHANGED";
                        const isReply =
                          log.action === "REPLY_ADDED" ||
                          log.action === "EMAIL_REPLY_SENT";
                        const isSlaBreach = log.action === "SLA_BREACHED";

                        // Format value for display
                        const formatValue = value => {
                          if (value === null || value === undefined)
                            return "N/A";
                          if (typeof value === "object")
                            return JSON.stringify(value);
                          return String(value);
                        };

                        return (
                          <Timeline.Item
                            key={log._id || log.id}
                            color={getLogActionColor(log.action)}
                            dot={getLogActionIcon(log.action)}
                            style={{ paddingBottom: "16px" }}
                          >
                            <div style={{ marginLeft: "12px" }}>
                              {/* Summary */}
                              <span
                                style={{
                                  fontWeight: 500,
                                  marginBottom: "4px",
                                  fontSize: "14px",
                                }}
                              >
                                {formatLogAction(log.action)}
                              </span>

                              {/* User + Date */}
                              <div
                                style={{
                                  fontSize: "12px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom:
                                    isFieldChange ||
                                      isNote ||
                                      isTemplate ||
                                      isStatusChange ||
                                      isReply
                                      ? "6px"
                                      : "0",
                                }}
                              >
                                <span>{log.user}</span>
                                <span>
                                  {new Date(
                                    log.timestamp || log.createdAt
                                  ).toLocaleString()}
                                </span>
                              </div>

                              {/* Status Change Details */}
                              {isStatusChange && log.details && (
                                <Collapse
                                  ghost
                                  size='small'
                                  items={[
                                    {
                                      key: "status",
                                      label: "View Status Change Details",
                                      children: (
                                        <Table
                                          className="leads-performance-table"
                                          size='small'
                                          pagination={false}
                                          columns={[
                                            {
                                              title: "Field",
                                              dataIndex: "field",
                                              key: "field",
                                              width: 100,
                                            },
                                            {
                                              title: "Previous Value",
                                              dataIndex: "oldValue",
                                              key: "oldValue",
                                              width: 150,
                                            },
                                            {
                                              title: "New Value",
                                              dataIndex: "newValue",
                                              key: "newValue",
                                              width: 150,
                                            },
                                            {
                                              title: "Reason",
                                              dataIndex: "reason",
                                              key: "reason",
                                            },
                                          ]}
                                          dataSource={[
                                            {
                                              key: log._id,
                                              field: "Status",
                                              oldValue: formatValue(
                                                log.details.previousStatus
                                              ),
                                              newValue: formatValue(
                                                log.details.newStatus
                                              ),
                                              reason:
                                                log.details.reason ||
                                                "No reason provided",
                                            },
                                          ]}
                                        />
                                      ),
                                    },
                                  ]}
                                />
                              )}

                              {/* Field Change Details */}
                              {isFieldChange &&
                                log.details &&
                                log.details.previousProperties && (
                                  <Collapse
                                    ghost
                                    size='small'
                                    items={[
                                      {
                                        key: "field",
                                        label: "View Property Change Details",
                                        children: (
                                          <Table
                                            className="leads-performance-table"
                                            size='small'
                                            pagination={false}
                                            columns={[
                                              {
                                                title: "Field",
                                                dataIndex: "field",
                                                key: "field",
                                                width: 100,
                                              },
                                              {
                                                title: "Previous Value",
                                                dataIndex: "oldValue",
                                                key: "oldValue",
                                                width: 150,
                                              },
                                              {
                                                title: "New Value",
                                                dataIndex: "newValue",
                                                key: "newValue",
                                                width: 150,
                                              },
                                            ]}
                                            dataSource={Object.keys(
                                              log.details.previousProperties
                                            ).map(field => ({
                                              key: field,
                                              field:
                                                field.charAt(0).toUpperCase() +
                                                field.slice(1),
                                              oldValue: formatValue(
                                                log.details.previousProperties[
                                                field
                                                ]
                                              ),
                                              newValue: formatValue(
                                                log.details.newProperties[field]
                                              ),
                                            }))}
                                          />
                                        ),
                                      },
                                    ]}
                                  />
                                )}

                              {/* Note Details */}
                              {isNote && log.details && (
                                <Collapse
                                  ghost
                                  size='small'
                                  items={[
                                    {
                                      key: "note",
                                      label: "View Note Details",
                                      children: (
                                        <div style={{ fontSize: "13px" }}>
                                          <p>
                                            <strong>Note:</strong>{" "}
                                            {log.details.content}
                                          </p>
                                          {log.details.noteContent && (
                                            <p>
                                              <strong>Content Preview:</strong>{" "}
                                              {log.details.noteContent.length >
                                                100
                                                ? `${log.details.noteContent.substring(0, 100)}...`
                                                : log.details.noteContent}
                                            </p>
                                          )}
                                          {log.details.hasVideoNote && (
                                            <p>
                                              <strong>
                                                Includes Video Note:
                                              </strong>{" "}
                                              Yes
                                            </p>
                                          )}
                                        </div>
                                      ),
                                    },
                                  ]}
                                />
                              )}

                              {/* Template Details */}
                              {isTemplate && log.details && (
                                <Collapse
                                  ghost
                                  size='small'
                                  items={[
                                    {
                                      key: "template",
                                      label: "View Template Details",
                                      children: (
                                        <div style={{ fontSize: "13px" }}>
                                          <p>
                                            <strong>Template Name:</strong>{" "}
                                            {log.details.templateName}
                                          </p>
                                          <p>
                                            <strong>Mobile Number:</strong>{" "}
                                            {log.details.mobileNumber}
                                          </p>
                                          <p>
                                            <strong>Status:</strong>{" "}
                                            {log.details.status}
                                          </p>
                                          {log.action ===
                                            "TEMPLATE_DELETED" && (
                                              <p>
                                                <strong>Action:</strong> Template
                                                Deleted
                                              </p>
                                            )}
                                        </div>
                                      ),
                                    },
                                  ]}
                                />
                              )}

                              {/* Reply Details */}
                              {isReply && log.details && (
                                <Collapse
                                  ghost
                                  size='small'
                                  items={[
                                    {
                                      key: "reply",
                                      label: "View Reply Details",
                                      children: (
                                        <div style={{ fontSize: "13px" }}>
                                          <p>
                                            <strong>Type:</strong>{" "}
                                            {log.action === "EMAIL_REPLY_SENT"
                                              ? "Email Reply"
                                              : "Internal Reply"}
                                          </p>
                                          {log.details.to && (
                                            <p>
                                              <strong>To:</strong>{" "}
                                              {log.details.to}
                                            </p>
                                          )}
                                          {log.details.subject && (
                                            <p>
                                              <strong>Subject:</strong>{" "}
                                              {log.details.subject}
                                            </p>
                                          )}
                                          {log.details.content && (
                                            <p>
                                              <strong>Content Preview:</strong>{" "}
                                              {log.details.content.length > 100
                                                ? `${log.details.content.substring(0, 100)}...`
                                                : log.details.content}
                                            </p>
                                          )}
                                          {log.details.hasVideoNote && (
                                            <p>
                                              <strong>
                                                Includes Video Note:
                                              </strong>{" "}
                                              Yes
                                            </p>
                                          )}
                                        </div>
                                      ),
                                    },
                                  ]}
                                />
                              )}

                              {/* ✅ ADD SLA BREACH DETAILS */}
                              {isSlaBreach && log.details && (
                                <Collapse
                                  ghost
                                  size='small'
                                  items={[
                                    {
                                      key: "sla",
                                      label: "View SLA Breach Details",
                                      children: (
                                        <div style={{ fontSize: "13px" }}>
                                          <p
                                            style={{
                                              color: "#ff4d4f",
                                              fontWeight: 600,
                                            }}
                                          >
                                            ⚠️ SLA Resolution Time Exceeded
                                          </p>
                                          <p>
                                            <strong>SLA Policy:</strong>{" "}
                                            {log.details.slaPolicy}
                                          </p>
                                          <p>
                                            <strong>
                                              Target Resolution Time:
                                            </strong>{" "}
                                            {log.details.targetResolutionTime}
                                          </p>
                                          {/* <p style={{ color: "#ff4d4f" }}>
                                            <strong>Breach Amount:</strong>{" "}
                                            {log.details.breachAmount}
                                          </p> */}
                                          <p>
                                            <strong>Priority:</strong>{" "}
                                            {log.details.priority}
                                          </p>
                                          <p>
                                            <strong>Department:</strong>{" "}
                                            {log.details.department}
                                          </p>
                                          <p>
                                            <strong>Total Paused Time:</strong>{" "}
                                            {log.details.totalPausedTime}
                                          </p>
                                          <p>
                                            <strong>Created:</strong>{" "}
                                            {new Date(
                                              log.details.createdAt
                                            ).toLocaleString()}
                                          </p>
                                        </div>
                                      ),
                                    },
                                  ]}
                                />
                              )}

                              {/* General Details for other actions */}
                              {log.details &&
                                typeof log.details === "object" &&
                                !isFieldChange &&
                                !isNote &&
                                !isTemplate &&
                                !isStatusChange &&
                                // !isSlaBreach &&
                                !isReply && (
                                  <Collapse
                                    ghost
                                    size='small'
                                    items={[
                                      {
                                        key: "details",
                                        label: "View Details",
                                        children: (
                                          <div style={{ fontSize: "13px" }}>
                                            {Object.entries(log.details).map(
                                              ([key, value]) => {
                                                const displayValue =
                                                  isValidDate(value)
                                                    ? new Date(
                                                      value
                                                    ).toLocaleString()
                                                    : formatValue(value);

                                                return (
                                                  <p key={key}>
                                                    <strong>
                                                      {key
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        key.slice(1)}
                                                      :
                                                    </strong>{" "}
                                                    {displayValue}
                                                  </p>
                                                );
                                              }
                                            )}
                                          </div>
                                        ),
                                      },
                                    ]}
                                  />
                                )}
                            </div>
                          </Timeline.Item>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: "center", padding: "40px 0" }}>
                        <Text>No activity logs found for this ticket.</Text>
                      </div>
                    )}
                  </Timeline>
                </Card>
              </TabPane>

              <TabPane
                tab={
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>
                    <HistoryOutlined style={{ marginRight: 8 }} />
                    Ticket History
                  </span>
                }
                key='4'
              >
                <Card>
                  <TicketHistoryTable
                    mobileNumber={selectedTicket.mobileNumber}
                    onNavigateToTabOne={() => setActiveTab("1")}
                  />
                </Card>
              </TabPane>
            </Tabs>
          </Col>
        </Row>

        {/* Chat Drawer */}
        <Drawer
          title={
            <Space>
              <WechatOutlined />
              <span>
                Live Chat - {selectedTicket.customerName || "Customer"}
              </span>
            </Space>
          }
          placement='right'
          onClose={() => setChatDrawerOpen(false)}
          open={chatDrawerOpen}
          width={800}
          style={{
            borderRadius: "12px 0 0 12px",
          }}
          bodyStyle={{
            padding: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div className='chat-live'>
            <div className='row wastapp-inbox-bg '></div>
            {/* <ChatWindow
              chatRefresh={handleSelectContactData}
              selectedContactData={selectedContactData}
              chatData={chatData[selectedContactData?.number]}
              chatArea={chatArea}
              setChatArea={setChatArea}
              flag={"live"}
              chatLoading={chatLoading}
              setSidebarRefetch={setSidebarRefetch}
              sidebarRefetch={sidebarRefetch}
              readableTimestamp={readableTimestamp}
              disableIntervene={false}
            /> */}
          </div>
        </Drawer>

        {/* Modals */}
        <Modal
          title='Reply to Customer'
          open={replyModalOpen}
          onOk={handleSendReply}
          onCancel={() => setReplyModalOpen(false)}
          width={800}
          okText='Send Reply'
        >
          <Space direction='vertical' size='middle' style={{ width: "100%" }}>
            <div>
              <Text strong>To:</Text>
              <Input
                value={replyData.to}
                onChange={e =>
                  setReplyData(prev => ({ ...prev, to: e.target.value }))
                }
              />
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>CC:</Text>
                <Input
                  value={replyData.cc}
                  onChange={e =>
                    setReplyData(prev => ({ ...prev, cc: e.target.value }))
                  }
                />
              </Col>
              <Col span={12}>
                <Text strong>BCC:</Text>
                <Input
                  value={replyData.bcc}
                  onChange={e =>
                    setReplyData(prev => ({ ...prev, bcc: e.target.value }))
                  }
                />
              </Col>
            </Row>
            <div>
              <Text strong>Subject:</Text>
              <Input
                value={replyData.subject}
                onChange={e =>
                  setReplyData(prev => ({ ...prev, subject: e.target.value }))
                }
              />
            </div>
            <div>
              <Text strong>Message:</Text>
              <TextArea
                value={replyData.body}
                onChange={e =>
                  setReplyData(prev => ({ ...prev, body: e.target.value }))
                }
                rows={10}
              />
            </div>
          </Space>
        </Modal>

        <Modal
          title='Forward Ticket'
          open={forwardModalOpen}
          onOk={handleSendForward}
          onCancel={() => setForwardModalOpen(false)}
          width={800}
          okText='Forward'
        >
          <Space direction='vertical' size='middle' style={{ width: "100%" }}>
            <div>
              <Text strong>To:</Text>
              <Input
                value={forwardData.to}
                onChange={e =>
                  setForwardData(prev => ({ ...prev, to: e.target.value }))
                }
              />
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>CC:</Text>
                <Input
                  value={forwardData.cc}
                  onChange={e =>
                    setForwardData(prev => ({ ...prev, cc: e.target.value }))
                  }
                />
              </Col>
              <Col span={12}>
                <Text strong>BCC:</Text>
                <Input
                  value={forwardData.bcc}
                  onChange={e =>
                    setForwardData(prev => ({ ...prev, bcc: e.target.value }))
                  }
                />
              </Col>
            </Row>
            <div>
              <Text strong>Subject:</Text>
              <Input
                value={forwardData.subject}
                onChange={e =>
                  setForwardData(prev => ({ ...prev, subject: e.target.value }))
                }
              />
            </div>
            <div>
              <Text strong>Message:</Text>
              <TextArea
                value={forwardData.body}
                onChange={e =>
                  setForwardData(prev => ({ ...prev, body: e.target.value }))
                }
                rows={10}
              />
            </div>
          </Space>
        </Modal>

        <Modal
          title='Add Personal Note'
          open={noteModalOpen}
          onOk={handleSaveNote}
          onCancel={() => setNoteModalOpen(false)}
          width={600}
          okText='Save Note'
        >
          <div>
            <Text strong>Note:</Text>
            <TextArea
              value={noteData}
              onChange={e => setNoteData(e.target.value)}
              rows={6}
            />
          </div>
        </Modal>

        <Modal
          title='Change Status'
          open={statusChangeModalOpen}
          onOk={handleStatusChangeConfirm}
          onCancel={() => setStatusChangeModalOpen(false)}
          width={500}
          okText='Update Status'
        >
          <Space direction='vertical' size='middle' style={{ width: "100%" }}>
            <div>
              <Text strong>New Status:</Text>
              <Select
                value={statusChangeData.newStatus}
                onChange={value =>
                  setStatusChangeData(prev => ({ ...prev, newStatus: value }))
                }
                style={{ width: "100%" }}
              >
                {/* Show Reopened option only if current status is Complete/Closed */}
                {selectedTicket.status === "Complete" ? (
                  <Option value='Reopened'>Reopened</Option>
                ) : (
                  <>
                    <Option value='Assigned'>Assigned</Option>
                    <Option value='In Progress'>In Progress</Option>
                    <Option value='Awaiting Customer Response'>
                      Awaiting Customer Response
                    </Option>
                    <Option value='Pending'>Pending</Option>
                    <Option value='Complete'>Complete</Option>
                  </>
                )}
              </Select>
            </div>
            <div>
              <Text strong>Reason for Change:</Text>
              <TextArea
                value={statusChangeData.reason}
                onChange={e =>
                  setStatusChangeData(prev => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
          </Space>
        </Modal>

        <Modal
          title='Message Details'
          open={messageModalOpen}
          onCancel={() => setMessageModalOpen(false)}
          footer={null}
          width={600}
        >
          {selectedMessage && (
            <div>
              <p>
                <strong>Author:</strong> {selectedMessage.author}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {moment(selectedMessage.timestamp).format("MMM DD, YYYY HH:mm")}
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {selectedMessage.content}
              </p>
            </div>
          )}
        </Modal>
      </div>

      <Modal
        open={mediaPreview.visible}
        onCancel={() =>
          setMediaPreview({ visible: false, url: null, type: null })
        }
        footer={null}
        width='auto'
        style={{ maxWidth: "90vw" }}
        bodyStyle={{
          padding: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        <div style={{ maxWidth: "80vw", maxHeight: "80vh", overflow: "auto" }}>
          {mediaPreview.type === "image" && (
            <Image
              src={mediaPreview.url}
              alt='Preview'
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                display: "block",
              }}
              preview={{
                visible: false, // We handle our own preview
              }}
            />
          )}
          {mediaPreview.type === "video" && (
            <video
              controls
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                display: "block",
              }}
            >
              <source src={mediaPreview.url} type='video/mp4' />
              Your browser does not support the video tag.
            </video>
          )}
          {mediaPreview.type === "other" && (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <Text>This file type cannot be previewed.</Text>
              <br />
              <Button
                type='primary'
                onClick={() => window.open(mediaPreview.url, "_blank")}
                style={{ marginTop: "10px" }}
              >
                Open in New Tab
              </Button>
            </div>
          )}
        </div>
      </Modal>

      <SwitchAgentModal
        visible={switchAgentModalOpen}
        onOk={handleSwitchAgent}
        onCancel={() => {
          setSwitchAgentModalOpen(false);
          setSelectedDepartmentForSwitch(null);
          setSelectedAgentForSwitch(null);
        }}
        ticketId={selectedTicket?.ticketId}
        selectedDepartment={selectedDepartmentForSwitch}
        selectedAgent={selectedAgentForSwitch}
        onDepartmentChange={handleDepartmentChangeForSwitch}
        onAgentChange={setSelectedAgentForSwitch}
      />

    </div>
  );
};

export default TicketDetailPage;
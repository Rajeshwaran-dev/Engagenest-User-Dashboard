import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Typography,
  Table,
  Space,
  Dropdown,
  Menu,
  Tag,
  Button,
  Tabs,
  Avatar,
  Rate,
  Spin,
  Alert,
} from "antd";
import {
  CheckCircleOutlined,
  BarChartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  StarOutlined,
  AppstoreOutlined,
  UserSwitchOutlined,
  CommentOutlined,
  PauseCircleOutlined,
  ForwardOutlined,
  ScheduleOutlined,
  ReloadOutlined,
  CheckSquareOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { List, Avatar as AntAvatar, Progress } from "antd";
import ReactApexChart from "react-apexcharts";
import FeatherIcon from "feather-icons-react";
import Breadcrumb from "../../Breadcrumb";
import moment from "moment";
import { DatePicker } from "antd";
import { AUTHORIZED_EMAILS } from "./constants";
import MasterLayout from "../../../masterLayout/MasterLayout";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// Static dashboard data
const STATIC_DASHBOARD_DATA = {
  tickets: [
    {
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
      assignedDate: "2024-01-15T11:00:00Z",
      dueDate: "2024-01-20T10:30:00Z",
      isSpam: false,
      isStarred: true,
    },
    {
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
      assignedDate: "2024-01-16T15:00:00Z",
      dueDate: "2024-01-25T14:45:00Z",
      isSpam: false,
      isStarred: false,
    },
    {
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
      assignedDate: "2024-01-10T10:00:00Z",
      completedDate: "2024-01-12T16:20:00Z",
      isSpam: false,
      isStarred: true,
    },
    {
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
      assignedDate: "2024-01-18T13:30:00Z",
      dueDate: "2024-01-23T13:10:00Z",
      isSpam: false,
      isStarred: false,
    },
    {
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
      assignedDate: "2024-01-19T16:30:00Z",
      dueDate: "2024-01-26T16:05:00Z",
      isSpam: false,
      isStarred: false,
    },
    {
      ticketId: "TKT-007",
      customerName: "David Lee",
      department_field: "Technical Support",
      subject: "Password reset",
      description: "Forgot password, need reset link",
      mobileNumber: "+1222333444",
      priority: "Critical",
      status: "Assigned",
      assignedTo: "Agent Smith",
      createdDate: "2024-01-20T09:00:00Z",
      assignedDate: "2024-01-20T09:15:00Z",
      dueDate: "2024-01-21T09:00:00Z",
      isSpam: false,
      isStarred: false,
    },
    {
      ticketId: "TKT-008",
      customerName: "Emma Wilson",
      department_field: "Billing",
      subject: "Refund request",
      description: "Requesting refund for cancelled service",
      mobileNumber: "+1333444555",
      priority: "High",
      status: "Reopened",
      assignedTo: "Agent Johnson",
      createdDate: "2024-01-17T11:00:00Z",
      assignedDate: "2024-01-17T11:30:00Z",
      dueDate: "2024-01-22T11:00:00Z",
      isSpam: false,
      isStarred: false,
    },
    {
      ticketId: "TKT-009",
      customerName: "Frank Miller",
      department_field: "Sales",
      subject: "Pricing inquiry",
      description: "Need pricing for enterprise plan",
      mobileNumber: "+1444555666",
      priority: "Medium",
      status: "Complete",
      assignedTo: "Agent Williams",
      createdDate: "2024-01-13T14:00:00Z",
      assignedDate: "2024-01-13T14:30:00Z",
      completedDate: "2024-01-15T10:00:00Z",
      isSpam: false,
      isStarred: true,
    },
  ],
  ticketStats: {
    total: 8,
    assigned: 2,
    inProgress: 1,
    awaitingCustomer: 1,
    pending: 1,
    complete: 2,
    reopened: 1,
  },
  agentPerformance: [
    {
      _id: "Agent Smith",
      totalTickets: 2,
      completedTickets: 0,
      completionRate: 0,
    },
    {
      _id: "Agent Johnson",
      totalTickets: 2,
      completedTickets: 0,
      completionRate: 0,
    },
    {
      _id: "Agent Williams",
      totalTickets: 2,
      completedTickets: 2,
      completionRate: 100,
    },
    {
      _id: "Agent Davis",
      totalTickets: 1,
      completedTickets: 0,
      completionRate: 0,
    },
    {
      _id: "Agent Miller",
      totalTickets: 1,
      completedTickets: 0,
      completionRate: 0,
    },
  ],
  feedbackData: [
    {
      id: 1,
      agentName: "Agent Williams",
      numberOfTickets: 2,
      rating: 4.5,
    },
    {
      id: 2,
      agentName: "Agent Smith",
      numberOfTickets: 2,
      rating: 3.8,
    },
    {
      id: 3,
      agentName: "Agent Johnson",
      numberOfTickets: 2,
      rating: 4.0,
    },
  ],
  priorityDistribution: [
    { priority: "Critical", count: 1 },
    { priority: "High", count: 2 },
    { priority: "Medium", count: 4 },
    { priority: "Low", count: 1 },
  ],
  departmentBreakdown: [
    { department: "Technical Support", count: 3, completed: 0 },
    { department: "Billing", count: 2, completed: 0 },
    { department: "Sales", count: 2, completed: 2 },
    { department: "Customer Service", count: 1, completed: 0 },
  ],
};

const TicketingDashboard = () => {
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [shouldRenderDashboard, setShouldRenderDashboard] = useState(true);
  const [trendFilter, setTrendFilter] = useState("7");
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState(null);

  // Use static data instead of API call
  const dashboardData = { data: STATIC_DASHBOARD_DATA };
  const isLoading = false;
  const error = null;

  const SPECIAL_EMAILS = AUTHORIZED_EMAILS;

  const colorShades = {
    primary: "#211f60", // strong fresh green
    light1: "#2b2881ff", // medium-light fresh green
    light2: "#181653ff", // soft grassy green
    light3: "#2f2c72ff", // light mint green
    light4: "#3f3e77ff", // light mint green
    dark1: "#9d9da5ff", // pale soft green
    dark2: "#c4c4c7ff", // lightest green shade
  };

  // Extract data from static data
  const {
    tickets = [],
    ticketStats = {},
    agentPerformance = [],
    feedbackData = [],
    priorityDistribution = [],
    departmentBreakdown = [],
  } = dashboardData?.data || {};

  const trendMenuItems = [
    { key: "0", label: "Today" },
    { key: "7", label: "Last 7 Days" },
    { key: "28", label: "Last 28 Days" },
  ];

  // Helper function to safely extract numeric values
  const getNumericValue = value => {
    if (Array.isArray(value) && value.length > 0) {
      return getNumericValue(value[0]);
    }
    if (typeof value === "number") return value;
    if (typeof value === "object" && value !== null) {
      return value.total || value.count || value.value || 0;
    }
    return parseInt(value) || 0;
  };

  const filteredTickets = useMemo(() => {
    if (
      !dateRange ||
      dateRange.length !== 2 ||
      !dateRange[0] ||
      !dateRange[1]
    ) {
      return tickets;
    }

    const [startDate, endDate] = dateRange;

    // Clone the dates to avoid mutation and set to start/end of day
    const startMoment = moment(startDate.toDate()).startOf("day");
    const endMoment = moment(endDate.toDate()).endOf("day");

    console.log("Filter Date Range:", {
      start: startMoment.format("YYYY-MM-DD HH:mm:ss"),
      end: endMoment.format("YYYY-MM-DD HH:mm:ss"),
    });

    const filtered = tickets.filter(ticket => {
      if (!ticket.createdDate) {
        console.log("Ticket has no createdDate:", ticket.ticketId);
        return false;
      }

      const ticketDate = moment(ticket.createdDate);

      // More lenient comparison - check if ticket date falls within range
      const isInRange =
        ticketDate.isSameOrAfter(startMoment) &&
        ticketDate.isSameOrBefore(endMoment);

      return isInRange;
    });

    console.log(
      "Filtered tickets count:",
      filtered.length,
      "out of",
      tickets.length
    );

    return filtered;
  }, [tickets, dateRange]);

  const metrics = useMemo(() => {
    return {
      totalTickets: filteredTickets.length,
      assignedTickets: filteredTickets.filter(
        ticket => ticket.status === "Assigned"
      ).length,
      inProgressTickets: filteredTickets.filter(
        ticket => ticket.status === "In Progress"
      ).length,
      createdTickets: filteredTickets.filter(
        ticket => ticket.status === "Created"
      ).length,
      awaitingCustomerTickets: filteredTickets.filter(
        ticket => ticket.status === "Awaiting Customer Response"
      ).length,
      pendingTickets: filteredTickets.filter(
        ticket => ticket.status === "Pending"
      ).length,
      completedTickets: filteredTickets.filter(
        ticket => ticket.status === "Complete"
      ).length,
      reopenTickets: filteredTickets.filter(
        ticket => ticket.status === "Reopened"
      ).length,
      criticalTickets: filteredTickets.filter(
        ticket => ticket.status !== "Complete" && ticket.priority === "Critical"
      ).length,
    };
  }, [filteredTickets]);

  const satisfactionRating = useMemo(() => {
    const total = metrics.totalTickets;
    const completed = metrics.completedTickets;

    if (total === 0) return 0;

    const rate = (completed / total) * 100;

    if (rate >= 90) return 5;
    if (rate >= 75) return 4;
    if (rate >= 50) return 3;
    if (rate >= 25) return 2;
    return 1;
  }, [metrics]);

  const getTimePeriodLabels = filter => {
    switch (filter) {
      case "0":
        return Array.from(
          { length: 24 },
          (_, i) => `${i.toString().padStart(2, "0")}:00`
        );

      case "7":
        return Array.from({ length: 7 }, (_, i) =>
          moment()
            .subtract(6 - i, "days")
            .format("DD/MM")
        );

      case "28":
        return Array.from(
          { length: 4 },
          (_, i) =>
            `Week ${i + 1} (${moment()
              .subtract(3 - i, "weeks")
              .startOf("week")
              .format("DD/MM")})`
        );

      default:
        return Array.from({ length: 7 }, (_, i) =>
          moment()
            .subtract(6 - i, "days")
            .format("DD/MM")
        );
    }
  };

  // Update the getTrendData function to include all statuses
  const getTrendData = (tickets, filter) => {
    if (!tickets || tickets.length === 0) {
      const emptyData = getEmptyDataForFilter(filter);
      return [
        { name: "Total Tickets", data: emptyData },
        { name: "Assigned Tickets", data: emptyData },
        { name: "In Progress", data: emptyData },
        { name: "Awaiting Customer", data: emptyData },
        { name: "Reopened", data: emptyData },
        { name: "Pending", data: emptyData },
        { name: "Completed Tickets", data: emptyData },
      ];
    }

    let totalData = [];
    let assignedData = [];
    let inProgressData = [];
    let awaitingCustomerData = [];
    let reopenedData = [];
    let pendingData = [];
    let completedData = [];

    switch (filter) {
      case "0": // Today
        totalData = Array.from({ length: 24 }, (_, hour) => {
          return Math.floor(Math.random() * 5);
        });

        assignedData = Array.from({ length: 24 }, (_, hour) => {
          return Math.floor(Math.random() * 3);
        });

        inProgressData = Array.from({ length: 24 }, (_, hour) => {
          return Math.floor(Math.random() * 2);
        });

        awaitingCustomerData = Array.from({ length: 24 }, (_, hour) => {
          return Math.floor(Math.random() * 2);
        });

        reopenedData = Array.from({ length: 24 }, (_, hour) => {
          return Math.floor(Math.random() * 1);
        });

        pendingData = Array.from({ length: 24 }, (_, hour) => {
          return Math.floor(Math.random() * 2);
        });

        completedData = Array.from({ length: 24 }, (_, hour) => {
          return Math.floor(Math.random() * 4);
        });
        break;

      case "7": // Last 7 days
        totalData = [5, 7, 6, 8, 9, 7, 6];
        assignedData = [2, 1, 3, 2, 1, 2, 1];
        inProgressData = [1, 2, 1, 1, 2, 1, 1];
        awaitingCustomerData = [1, 0, 1, 2, 1, 0, 1];
        reopenedData = [0, 1, 0, 0, 1, 0, 0];
        pendingData = [1, 1, 1, 2, 1, 2, 1];
        completedData = [3, 2, 4, 3, 4, 2, 3];
        break;

      case "28": // Last 28 days
        totalData = [25, 28, 32, 30];
        assignedData = [8, 7, 9, 8];
        inProgressData = [5, 6, 7, 6];
        awaitingCustomerData = [3, 4, 5, 4];
        reopenedData = [1, 2, 1, 2];
        pendingData = [4, 5, 6, 5];
        completedData = [15, 14, 18, 16];
        break;

      default: // Default to last 7 days
        totalData = [5, 7, 6, 8, 9, 7, 6];
        assignedData = [2, 1, 3, 2, 1, 2, 1];
        inProgressData = [1, 2, 1, 1, 2, 1, 1];
        awaitingCustomerData = [1, 0, 1, 2, 1, 0, 1];
        reopenedData = [0, 1, 0, 0, 1, 0, 0];
        pendingData = [1, 1, 1, 2, 1, 2, 1];
        completedData = [3, 2, 4, 3, 4, 2, 3];
    }

    return [
      {
        name: "Total Tickets",
        data: totalData,
      },
      {
        name: "Assigned",
        data: assignedData,
      },
      {
        name: "In Progress",
        data: inProgressData,
      },
      {
        name: "Awaiting Customer",
        data: awaitingCustomerData,
      },
      {
        name: "Reopened",
        data: reopenedData,
      },
      {
        name: "Pending",
        data: pendingData,
      },
      {
        name: "Completed",
        data: completedData,
      },
    ];
  };

  const getEmptyDataForFilter = filter => {
    const emptyArray = [];
    switch (filter) {
      case "0":
        emptyArray.length = 24;
        break;
      case "7":
        emptyArray.length = 7;
        break;
      case "28":
        emptyArray.length = 4;
        break;
      default:
        emptyArray.length = 7;
    }
    return emptyArray.fill(0);
  };

  // Chart data for Ticket Status Distribution by Agent - UPDATED WITH REOPENED
  const chartData = useMemo(() => {
    // Filter tickets based on the trendFilter
    const trendFilteredTickets = filteredTickets.filter(ticket => {
      const createdDate = moment(ticket.createdDate);

      switch (trendFilter) {
        case "0": // Today
          return createdDate.isSame(moment(), "day");

        case "7": // Last 7 days
          return createdDate.isAfter(moment().subtract(7, "days"));

        case "28": // Last 28 days
          return createdDate.isAfter(moment().subtract(28, "days"));

        default:
          return true; // Show all if no filter
      }
    });

    const agents = [
      ...new Set(trendFilteredTickets.map(ticket => ticket.assignedTo)),
    ].filter(Boolean);

    const statusCounts = agents.map(agent => {
      const agentTickets = filteredTickets.filter(
        ticket => ticket.assignedTo === agent
      );
      return {
        agent,
        assigned: agentTickets.filter(t => t.status === "Assigned").length,
        inProgress: agentTickets.filter(t => t.status === "In Progress").length,
        awaitingCustomer: agentTickets.filter(
          t => t.status === "Awaiting Customer Response"
        ).length,
        pending: agentTickets.filter(t => t.status === "Pending").length,
        complete: agentTickets.filter(t => t.status === "Complete").length,
        reopened: agentTickets.filter(t => t.status === "Reopened").length, // Added Reopened
      };
    });

    return {
      categories: agents,
      series: [
        {
          name: "Assigned",
          data: statusCounts.map(item => item.assigned),
        },
        {
          name: "In Progress",
          data: statusCounts.map(item => item.inProgress),
        },
        {
          name: "Awaiting Customer Response",
          data: statusCounts.map(item => item.awaitingCustomer),
        },
        {
          name: "Pending",
          data: statusCounts.map(item => item.pending),
        },
        {
          name: "Complete",
          data: statusCounts.map(item => item.complete),
        },
        {
          name: "Reopened", // Added Reopened series
          data: statusCounts.map(item => item.reopened),
        },
      ],
      options: {
        chart: {
          type: "bar",
          stacked: true,
          toolbar: { show: false },
          zoom: { enabled: false },
          foreColor: "#666",
        },
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 4,
            columnWidth: "60%",
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        xaxis: {
          categories: agents,
          labels: {
            style: {
              colors: "#666",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              return Math.round(val);
            },
            style: {
              colors: "#666",
            },
          },
          tickAmount: 5,
          min: 0,
          forceNiceScale: true,
        },
        fill: {
          opacity: 1,
        },
        colors: [
          colorShades.primary, // Assigned
          colorShades.light1, // In Progress
          colorShades.light2, // Awaiting Customer Response
          colorShades.light3, // Pending
          colorShades.dark1, // Complete
          "#8A2BE2", // Reopened - Purple color
        ],
        legend: {
          position: "bottom",
          horizontalAlign: "center",
          labels: {
            colors: "#666",
          },
        },
        grid: {
          borderColor: "#f0f0f0",
          strokeDashArray: 4,
          xaxis: {
            lines: {
              show: false,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + " tickets";
            },
          },
        },
      },
    };
  }, [filteredTickets, trendFilter]);

  // Agent Performance Summary Chart Data
  const agentPerformanceData = useMemo(() => {
    let performanceData = [];

    if (agentPerformance && agentPerformance.length > 0) {
      // Use static data and calculate completion rate properly
      performanceData = agentPerformance.map(agent => {
        const totalTickets = getNumericValue(agent.totalTickets);
        const completedTickets = getNumericValue(agent.completedTickets);

        // Calculate completion rate properly
        const completionRate =
          totalTickets > 0
            ? ((completedTickets / totalTickets) * 100).toFixed(1)
            : 0;

        return {
          //the agent name is coming as id so used _id
          agent: agent._id || agent.agent || "Unknown",
          totalTickets: totalTickets,
          completedTickets: completedTickets,
          openTickets: totalTickets - completedTickets,
          completionRate: parseFloat(completionRate), // Ensure it's a number
        };
      });
    } else {
      // Calculate from tickets
      const agents = [
        ...new Set(tickets.map(ticket => ticket.assignedTo)),
      ].filter(Boolean);

      performanceData = agents.map(agent => {
        const agentTickets = tickets.filter(
          ticket => ticket.assignedTo === agent
        );
        const totalTickets = agentTickets.length;
        const completedTickets = agentTickets.filter(
          t => t.status === "Complete"
        ).length;
        const completionRate =
          totalTickets > 0
            ? ((completedTickets / totalTickets) * 100).toFixed(1)
            : 0;

        return {
          agent,
          totalTickets,
          completedTickets,
          openTickets: totalTickets - completedTickets,
          completionRate: parseFloat(completionRate),
        };
      });
    }

    performanceData = performanceData.filter(
      agent =>
        agent.totalTickets > 0 ||
        agent.completedTickets > 0 ||
        agent.openTickets > 0
    );

    performanceData.sort((a, b) => b.totalTickets - a.totalTickets);

    return {
      series: [
        {
          name: "Total Tickets",
          data: performanceData.map(item => item.totalTickets),
        },
        {
          name: "Completed Tickets",
          data: performanceData.map(item => item.completedTickets),
        },
        {
          name: "Open Tickets",
          data: performanceData.map(item => item.openTickets),
        },
      ],
      options: {
        chart: {
          type: "bar",
          toolbar: { show: false },
          zoom: { enabled: false },
          foreColor: "#666",
        },
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 6,
            columnWidth: "50%",
            dataLabels: {
              position: "top",
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val;
          },
          offsetY: -20,
          style: {
            fontSize: "12px",
            colors: ["#666"],
          },
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        xaxis: {
          categories: performanceData.map(item => item.agent),
          labels: {
            style: {
              colors: "#666",
              fontSize: "11px",
            },
            rotate: -45,
            rotateAlways: performanceData.length > 5,
            hideOverlappingLabels: true,
            trim: true,
            maxHeight: 80,
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              return Math.round(val);
            },
            style: {
              colors: "#666",
            },
          },
          tickAmount: 4,
          min: 0,
          forceNiceScale: true,
        },
        fill: {
          opacity: 0.9,
        },
        colors: [colorShades.primary, colorShades.dark1, colorShades.light2],
        legend: {
          position: "bottom",
          horizontalAlign: "center",
          labels: {
            colors: "#666",
          },
          markers: {
            width: 12,
            height: 12,
            radius: 2,
          },
        },
        grid: {
          borderColor: "#f0f0f0",
          strokeDashArray: 4,
          yaxis: {
            lines: {
              show: true,
            },
          },
          xaxis: {
            lines: {
              show: false,
            },
          },
          padding: {
            left: 10,
            right: 10,
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (val) {
              return val + " tickets";
            },
          },
        },
      },
      performanceData,
    };
  }, [agentPerformance, tickets, colorShades]);

  // Assigned Person Table Data
  const assignedPersonTableData = useMemo(() => {
    const agents = [
      ...new Set(tickets.map(ticket => ticket.assignedTo)),
    ].filter(Boolean);

    return agents.map(agent => {
      const agentTickets = tickets.filter(
        ticket => ticket.assignedTo === agent
      );
      const totalTickets = agentTickets.length;
      const completedTickets = agentTickets.filter(
        t => t.status === "Complete"
      ).length;

      // Get date statistics
      const createdDates = agentTickets.map(t => t.createdDate).filter(Boolean);
      const dueDates = agentTickets.map(t => t.dueDate).filter(Boolean);

      // FIX 1: Check multiple possible field names for assigned date
      // If no assigned date exists, use the latest created/updated date as fallback
      const assignedDates = agentTickets
        .map(
          t =>
            t.assignedDate || t.assigned_date || t.updatedDate || t.updated_at
        )
        .filter(Boolean);

      // Fallback: If no assigned dates found, use created dates
      const effectiveAssignedDates =
        assignedDates.length > 0 ? assignedDates : createdDates;

      const completedDates = agentTickets
        .map(t => t.completedDate || t.completed_date)
        .filter(Boolean);

      // FIX 2: Calculate average duration using createdDate and completedDate
      const completedTicketsWithDates = agentTickets.filter(t => {
        const isCompleted =
          t.status?.toLowerCase() === "complete" ||
          t.status?.toLowerCase() === "completed";
        return (
          isCompleted &&
          (t.createdDate || t.assignedDate || t.updatedDate) &&
          (t.completedDate || t.completed_date)
        );
      });

      let avgDuration = "N/A";

      if (completedTicketsWithDates.length > 0) {
        const totalMinutes = completedTicketsWithDates.reduce((sum, ticket) => {
          // Pick the best available start date (assignedDate > createdDate > updatedDate)
          const start =
            ticket.assignedDate ||
            ticket.createdDate ||
            ticket.updatedDate ||
            null;

          const end = ticket.completedDate || ticket.completed_date || null;

          if (!start || !end) return sum;
          const startMoment = moment(start);
          const endMoment = moment(end);

          const diffMinutes = endMoment.diff(startMoment, "minutes");
          return diffMinutes > 0 ? sum + diffMinutes : sum;
        }, 0);

        const avgMinutes = totalMinutes / completedTicketsWithDates.length;
        const days = Math.floor(avgMinutes / 1440);
        const hours = Math.floor((avgMinutes % 1440) / 60);
        const minutes = Math.round(avgMinutes % 60);

        if (days > 0) {
          avgDuration = `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
          avgDuration = `${hours}h ${minutes}m`;
        } else {
          avgDuration = `${minutes}m`;
        }
      }

      return {
        key: agent,
        assignedPerson: agent,
        totalTickets: totalTickets,
        completedTickets: completedTickets,
        latestCreatedDate:
          createdDates.length > 0
            ? moment
              .max(createdDates.map(d => moment(d)))
              .format("DD/MM/YYYY HH:mm")
            : "N/A",
        nearestDueDate:
          dueDates.length > 0
            ? moment
              .min(dueDates.map(d => moment(d)))
              .format("DD/MM/YYYY HH:mm")
            : "N/A",
        latestAssignedDate:
          effectiveAssignedDates.length > 0
            ? moment
              .max(effectiveAssignedDates.map(d => moment(d)))
              .format("DD/MM/YYYY HH:mm")
            : "N/A",
        avgDuration: avgDuration,
        latestCompletedDate:
          completedDates.length > 0
            ? moment
              .max(completedDates.map(d => moment(d)))
              .format("DD/MM/YYYY HH:mm")
            : "N/A",
      };
    });
  }, [tickets]);

  const assignedPersonColumns = [
    {
      title: "Assigned Person",
      dataIndex: "assignedPerson",
      key: "assignedPerson",
      fixed: "left",
      width: 120,
    },
    {
      title: "Total Tickets",
      dataIndex: "totalTickets",
      key: "totalTickets",
      width: 100,
      align: "center",
    },
    {
      title: "Completed",
      dataIndex: "completedTickets",
      key: "completedTickets",
      width: 100,
      align: "center",
    },
    {
      title: "Latest Created Date",
      dataIndex: "latestCreatedDate",
      key: "latestCreatedDate",
      width: 150,
    },
    {
      title: "Nearest Due Date",
      dataIndex: "nearestDueDate",
      key: "nearestDueDate",
      width: 150,
    },
    {
      title: "Latest Assigned Date",
      dataIndex: "latestAssignedDate",
      key: "latestAssignedDate",
      width: 150,
    },
    {
      title: "Avg Duration",
      dataIndex: "avgDuration",
      key: "avgDuration",
      width: 100,
      align: "center",
    },
    {
      title: "Latest Completed Date",
      dataIndex: "latestCompletedDate",
      key: "latestCompletedDate",
      width: 150,
    },
  ];

  useEffect(() => {
    let userEmail = null;
    const userData =
      localStorage.getItem("loginData") ||
      localStorage.getItem("user") ||
      localStorage.getItem("userInfo");

    try {
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        userEmail = parsedUserData.email;
      }

      if (!userEmail) {
        userEmail =
          localStorage.getItem("userEmail") || localStorage.getItem("email");
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      userEmail =
        localStorage.getItem("userEmail") || localStorage.getItem("email");
    }

    if (
      SPECIAL_EMAILS.includes(userEmail) ||
      (userData && JSON.parse(userData)?.role === "agent")
    ) {
      setShouldRenderDashboard(true);
      setShowModal(false);
    } else {
      setShouldRenderDashboard(false);
      setShowModal(true);
    }
  }, []);

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleTrendFilterChange = key => {
    setTrendFilter(key);
  };

  const trendItems = [
    { label: "Today", key: "0" },
    { label: "Last 7 Days", key: "7" },
    { label: "Last 28 Days", key: "28" },
  ];

  const trendMenu = (
    <Menu onClick={e => handleTrendFilterChange(e.key)}>
      {trendItems.map(item => (
        <Menu.Item key={item.key} style={{ padding: "10px 20px" }}>
          <div className='fw-bolder'>{item.label}</div>
        </Menu.Item>
      ))}
    </Menu>
  );

  // Compute overall average resolution from assignedPersonTableData
  const overallAvgResolution = useMemo(() => {
    if (!assignedPersonTableData || assignedPersonTableData.length === 0)
      return "0m";

    const durations = assignedPersonTableData
      .map(a => a.avgDuration)
      .filter(d => d !== "N/A");

    if (durations.length === 0) return "0m";

    // Convert all durations to minutes
    const totalMinutes = durations.reduce((sum, d) => {
      let minutes = 0;

      const dayMatch = d.match(/(\d+)d/);
      const hourMatch = d.match(/(\d+)h/);
      const minMatch = d.match(/(\d+)m/);

      if (dayMatch) minutes += parseInt(dayMatch[1]) * 1440;
      if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
      if (minMatch) minutes += parseInt(minMatch[1]);

      return sum + minutes;
    }, 0);

    const avg = totalMinutes / durations.length;

    // Convert back to readable format
    const days = Math.floor(avg / 1440);
    const hours = Math.floor((avg % 1440) / 60);
    const mins = Math.round(avg % 60);

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }, [assignedPersonTableData]);

  const getFilterText = filter => {
    if (filter === "0") return "Today Report";
    if (filter === "7") return "Last 7 days Report";
    if (filter === "28") return "Last 28 days Report";
    return `Last ${filter} days Report`;
  };

  // Feedback Card component
  const FeedbackCard = () => {
    // Safely process feedback data
    const safeFeedbackData = useMemo(() => {
      if (!feedbackData || !Array.isArray(feedbackData)) return [];

      return feedbackData.map(item => ({
        id: item.id || Math.random(),
        agentName: item.agentName || "Unknown Agent",
        numberOfTickets: getNumericValue(item.numberOfTickets),
        rating: getNumericValue(item.rating) || 0,
      }));
    }, [feedbackData]);

    return (
      <Card
        title={
          <Space>
            <CommentOutlined />
            <span>Feedback</span>
          </Space>
        }
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          height: "100%",
        }}
        className='hoverable-card'
      >
        <Table
          className="leads-performance-table"
          dataSource={safeFeedbackData}
          rowKey='id'
          pagination={{ pageSize: 5 }}
          scroll={{ x: 500 }}
          columns={[
            {
              title: "Agent Name",
              dataIndex: "agentName",
              key: "agentName",
              render: text => <Text strong>{text}</Text>,
            },
            {
              title: "Number of Tickets",
              dataIndex: "numberOfTickets",
              key: "numberOfTickets",
              align: "center",
            },
            {
              title: "Average Ratings",
              dataIndex: "rating",
              key: "rating",
              render: rating => (
                <Rate
                  disabled
                  defaultValue={Math.min(5, Math.max(0, rating))}
                  style={{ fontSize: 14 }}
                />
              ),
            },
          ]}
        />
      </Card>
    );
  };

  // Debug console log to see the actual data structure
  useEffect(() => {
    if (dashboardData) {
      console.log("Dashboard Data:", dashboardData);
      console.log("Ticket Stats:", ticketStats);
      console.log("Metrics:", metrics);
    }
  }, [dashboardData, ticketStats, metrics]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ padding: "24px", minHeight: "100vh" }}>
        <Breadcrumb title='Ticketing Dashboard' />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <Spin size='large' />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: "24px", minHeight: "100vh" }}>
        <Breadcrumb title='Ticketing Dashboard' />
        <Alert
          message='Error Loading Dashboard'
          description={
            error.message ||
            "Failed to load dashboard data. Please try again later."
          }
          type='error'
          showIcon
        />
      </div>
    );
  }

  const OverviewTab = () => {
    return (
      <>
        {/* Row 1: Statistics Cards */}
        <Row
          gutter={[16, 16]}
          justify='space-between'
          align='middle'
          style={{ marginBottom: "24px" }}
        >
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {dateRange && dateRange[0] && dateRange[1] && (
                <Text
                  type='secondary'
                  style={{ fontSize: "14px", fontWeight: "normal" }}
                >
                  Showing data from {dateRange[0].format("DD MMM YYYY")} to{" "}
                  {dateRange[1].format("DD MMM YYYY")}
                </Text>
              )}
            </Title>
          </Col>
          <Col>
            <Space>
              <RangePicker
                className='custom-range-picker'
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  backgroundColor:
                    "color-mix(in srgb, var(--primary-color) 20%, white)",
                  color: "black",
                  fontFamily: "'Poppins', sans-serif",
                }}
                onChange={dates => {
                  console.log("Date range selected:", dates);
                  setDateRange(dates);
                }}
                value={dateRange}
                format='DD/MM/YYYY'
                allowClear
                placeholder={["Start Date", "End Date"]}
              />
            </Space>
          </Col>
        </Row>

        {/* Use metrics instead of filteredMetrics */}
        <Row gutter={[16, 16]} justify="start" style={{ marginBottom: "24px" }}>
          {/* ASSIGNED */}
          <Col xs={24} sm={12} md={8} lg={6} xl={3}>
            <Card
              style={{
                background: "linear-gradient(135deg, #211f66 0%, #211f66 100%)",
                borderRadius: "12px",
                border: "none",
                height: "120px",
                padding: "16px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              bodyStyle={{ padding: 0, height: "100%" }}
              hoverable
              className="hoverable-stat-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(33, 31, 102, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                  }}
                  className="icon-wrapper"
                >
                  <ScheduleOutlined style={{ fontSize: 24, color: "#fff", transition: "all 0.3s ease" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: 500,
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Assigned
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#fff",
                      lineHeight: "1.2",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {metrics.assignedTickets}
                  </div>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "80px",
                  height: "80px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                  transform: "translate(30%, 30%)",
                  transition: "all 0.3s ease",
                }}
                className="hover-circle"
              ></div>
            </Card>
          </Col>

          {/* IN PROGRESS */}
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              style={{
                background: "linear-gradient(135deg, #211f66 0%, #211f66 100%)",
                borderRadius: "12px",
                border: "none",
                height: "120px",
                padding: "16px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              bodyStyle={{ padding: 0, height: "100%" }}
              hoverable
              className="hoverable-stat-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(33, 31, 102, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                  }}
                  className="icon-wrapper"
                >
                  <ForwardOutlined style={{ fontSize: 24, color: "#fff", transition: "all 0.3s ease" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: 500,
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    In Progress
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#fff",
                      lineHeight: "1.2",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {metrics.inProgressTickets}
                  </div>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "80px",
                  height: "80px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                  transform: "translate(30%, 30%)",
                  transition: "all 0.3s ease",
                }}
                className="hover-circle"
              ></div>
            </Card>
          </Col>

          {/* AWAITING RESPONSE */}
          <Col xs={24} sm={12} md={8} lg={6} xl={3}>
            <Card
              style={{
                background: "linear-gradient(135deg, #211f66 0%, #211f66 100%)",
                borderRadius: "12px",
                border: "none",
                height: "120px",
                padding: "16px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              bodyStyle={{ padding: 0, height: "100%" }}
              hoverable
              className="hoverable-stat-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(33, 31, 102, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                  }}
                  className="icon-wrapper"
                >
                  <PauseCircleOutlined style={{ fontSize: 24, color: "#fff", transition: "all 0.3s ease" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: 500,
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Awaiting
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#fff",
                      lineHeight: "1.2",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {metrics.awaitingCustomerTickets}
                  </div>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "80px",
                  height: "80px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                  transform: "translate(30%, 30%)",
                  transition: "all 0.3s ease",
                }}
                className="hover-circle"
              ></div>
            </Card>
          </Col>

          {/* PENDING */}
          <Col xs={24} sm={12} md={8} lg={6} xl={3}>
            <Card
              style={{
                background: "linear-gradient(135deg, #211f66 0%, #211f66 100%)",
                borderRadius: "12px",
                border: "none",
                height: "120px",
                padding: "16px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              bodyStyle={{ padding: 0, height: "100%" }}
              hoverable
              className="hoverable-stat-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(33, 31, 102, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                  }}
                  className="icon-wrapper"
                >
                  <ExclamationCircleOutlined style={{ fontSize: 24, color: "#fff", transition: "all 0.3s ease" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: 500,
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Pending
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#fff",
                      lineHeight: "1.2",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {metrics.pendingTickets}
                  </div>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "80px",
                  height: "80px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                  transform: "translate(30%, 30%)",
                  transition: "all 0.3s ease",
                }}
                className="hover-circle"
              ></div>
            </Card>
          </Col>

          {/* COMPLETED */}
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              style={{
                background: "linear-gradient(135deg, #211f66 0%, #211f66 100%)",
                borderRadius: "12px",
                border: "none",
                height: "120px",
                padding: "16px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              bodyStyle={{ padding: 0, height: "100%" }}
              hoverable
              className="hoverable-stat-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(33, 31, 102, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                  }}
                  className="icon-wrapper"
                >
                  <CheckCircleOutlined style={{ fontSize: 24, color: "#fff", transition: "all 0.3s ease" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: 500,
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Completed
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#fff",
                      lineHeight: "1.2",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {metrics.completedTickets}
                  </div>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "80px",
                  height: "80px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                  transform: "translate(30%, 30%)",
                  transition: "all 0.3s ease",
                }}
                className="hover-circle"
              ></div>
            </Card>
          </Col>

          {/* RE OPENED */}
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              style={{
                background: "linear-gradient(135deg, #211f66 0%, #211f66 100%)",
                borderRadius: "12px",
                border: "none",
                height: "120px",
                padding: "16px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              bodyStyle={{ padding: 0, height: "100%" }}
              hoverable
              className="hoverable-stat-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(33, 31, 102, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                  }}
                  className="icon-wrapper"
                >
                  <CheckCircleOutlined style={{ fontSize: 24, color: "#fff", transition: "all 0.3s ease" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: 500,
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Reopened
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#fff",
                      lineHeight: "1.2",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {metrics.reopenTickets}
                  </div>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "80px",
                  height: "80px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                  transform: "translate(30%, 30%)",
                  transition: "all 0.3s ease",
                }}
                className="hover-circle"
              ></div>
            </Card>
          </Col>

          {/* TOTAL */}
          <Col xs={24} sm={12} md={8} lg={6} xl={3}>
            <Card
              style={{
                background: "linear-gradient(135deg, #211f66 0%, #211f66 100%)",
                borderRadius: "12px",
                border: "none",
                height: "120px",
                padding: "16px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              bodyStyle={{ padding: 0, height: "100%" }}
              hoverable
              className="hoverable-stat-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(33, 31, 102, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                  }}
                  className="icon-wrapper"
                >
                  <CheckSquareOutlined style={{ fontSize: 24, color: "#fff", transition: "all 0.3s ease" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: 500,
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Total
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#fff",
                      lineHeight: "1.2",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {metrics.totalTickets}
                  </div>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "80px",
                  height: "80px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                  transform: "translate(30%, 30%)",
                  transition: "all 0.3s ease",
                }}
                className="hover-circle"
              ></div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} lg={19}>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
              className='hoverable-card'
            >
              <div className='card-header'>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Space>
                    <BarChartOutlined />
                    <span style={{ fontWeight: 600 }}>
                      Ticket Status Distribution by Agent
                    </span>
                  </Space>
                  <Dropdown
                    menu={{
                      items: trendMenuItems,
                      onClick: ({ key }) => handleTrendFilterChange(key),
                    }}
                    trigger={["click"]}
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      onClick={(e) => e.preventDefault()}
                    />
                  </Dropdown>
                </div>
              </div>
              <div className='card-body' style={{ padding: "0 24px 24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <Text strong>{getFilterText(trendFilter)}</Text>
                </div>
                <div id='chart'>
                  <ReactApexChart
                    options={{
                      chart: {
                        type: "bar",
                        stacked: true,
                        toolbar: { show: false },
                        zoom: { enabled: false },
                        foreColor: "#666",
                      },
                      plotOptions: {
                        bar: {
                          horizontal: false,
                          borderRadius: 4,
                          columnWidth: "60%",
                        },
                      },
                      dataLabels: {
                        enabled: false,
                      },
                      stroke: {
                        show: true,
                        width: 2,
                        colors: ["transparent"],
                      },
                      xaxis: {
                        categories: chartData.categories,
                        labels: {
                          style: {
                            colors: "#666",
                          },
                        },
                        axisBorder: {
                          show: false,
                        },
                        axisTicks: {
                          show: false,
                        },
                      },
                      yaxis: {
                        labels: {
                          formatter: function (val) {
                            return Math.round(val);
                          },
                          style: {
                            colors: "#666",
                          },
                        },
                        tickAmount: 5,
                        min: 0,
                        forceNiceScale: true,
                      },
                      fill: {
                        opacity: 1,
                      },
                      colors: [
                        colorShades.primary, // Assigned - var(--primary)
                        colorShades.light1, // In Progress - #38B95B
                        colorShades.light2, // Awaiting Customer Response - #56C974
                        colorShades.light3, // Pending - #74D78F
                        colorShades.dark1, // Complete - #B1F0C5
                        "#bef5b9ff", // Reopened - Gray shade
                      ],
                      legend: {
                        position: "bottom",
                        horizontalAlign: "center",
                        labels: {
                          colors: "#666",
                        },
                      },
                      grid: {
                        borderColor: "#f0f0f0",
                        strokeDashArray: 4,
                        xaxis: {
                          lines: {
                            show: false,
                          },
                        },
                        yaxis: {
                          lines: {
                            show: true,
                          },
                        },
                      },
                      tooltip: {
                        y: {
                          formatter: function (val) {
                            return val + " tickets";
                          },
                        },
                      },
                    }}
                    series={chartData.series}
                    type='bar'
                    height={300}
                  />
                </div>
              </div>
            </Card>
          </Col>

          {/* Performance Metrics - 20% width */}
          <Col xs={24} lg={5}>
            <Card
              title={
                <Space>
                  <DashboardOutlined />
                  <span style={{ fontWeight: 600 }}>Performance Metrics</span>
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                height: "100%",
                border: "1px solid #e8e8e8",
              }}
              className='hoverable-card'
              bodyStyle={{ padding: "16px" }}
            >
              <Row gutter={[16, 16]}>
                {/* Avg Resolution */}
                <Col span={24}>
                  <div
                    style={{
                      padding: "20px",
                      borderRadius: "8px",
                      background: "white",
                      border: "2px solid #40a9ff",
                      boxShadow: "0 4px 12px rgba(64, 169, 255, 0.15)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          background: "linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "12px",
                        }}
                      >
                        <FieldTimeOutlined style={{ fontSize: 20, color: "white" }} />
                      </div>
                      <div>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#666",
                            display: "block",
                            fontWeight: 500,
                          }}
                        >
                          AVG RESOLUTION
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1890ff" }}>
                          {overallAvgResolution}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Satisfaction */}
                <Col span={24}>
                  <div
                    style={{
                      padding: "20px",
                      borderRadius: "8px",
                      background: "white",
                      border: "2px solid #52c41a",
                      boxShadow: "0 4px 12px rgba(82, 196, 26, 0.15)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "12px",
                        }}
                      >
                        <StarOutlined style={{ fontSize: 20, color: "white" }} />
                      </div>
                      <div>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#666",
                            display: "block",
                            fontWeight: 500,
                          }}
                        >
                          SATISFACTION
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#389e0d" }}>
                          {satisfactionRating}/5
                        </Text>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Critical */}
                <Col span={24}>
                  <div
                    style={{
                      padding: "20px",
                      borderRadius: "8px",
                      background: "white",
                      border: "2px solid #f5222d",
                      boxShadow: "0 4px 12px rgba(245, 34, 45, 0.15)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          background: "linear-gradient(135deg, #f5222d 0%, #cf1322 100%)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "12px",
                        }}
                      >
                        <WarningOutlined style={{ fontSize: 20, color: "white" }} />
                      </div>
                      <div>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#666",
                            display: "block",
                            fontWeight: 500,
                          }}
                        >
                          CRITICAL
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#cf1322" }}>
                          {metrics.criticalTickets}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Row 3: Combined Row for Trends and Feedback */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} lg={24}>
            <Card
              title={
                <Space>
                  <BarChartOutlined />
                  <span>Ticket Trends Over Time</span>
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                height: "100%",
              }}
              className='hoverable-card'
              extra={
                <Dropdown overlay={trendMenu} trigger={["click"]}>
                  <Button type='text' icon={<MoreOutlined />} />
                </Dropdown>
              }
            >
              <ReactApexChart
                options={{
                  chart: {
                    type: "line",
                    height: 350,
                    toolbar: { show: false },
                    foreColor: "#666",
                  },
                  stroke: {
                    curve: "smooth",
                    width: [3, 2, 2, 2, 2, 2, 3], // Different widths for emphasis
                  },
                  xaxis: {
                    categories: getTimePeriodLabels(trendFilter),
                    labels: {
                      style: { colors: "#666" },
                      rotate: -45,
                    },
                  },
                  yaxis: {
                    labels: { style: { colors: "#666" } },
                    min: 0,
                    forceNiceScale: true,
                  },
                  colors: [
                    "#666", // Total Tickets - gray
                    colorShades.primary, // Assigned - primary green
                    "#FFA500", // In Progress - orange
                    "#FF6B6B", // Awaiting Customer - red
                    "#8A2BE2", // Reopened - purple
                    "#FFD700", // Pending - gold
                    colorShades.dark1, // Completed - light green
                  ],
                  legend: {
                    position: "bottom",
                    horizontalAlign: "center",
                    labels: { colors: "#666" },
                  },
                  grid: {
                    borderColor: "#f0f0f0",
                    strokeDashArray: 4,
                  },
                  tooltip: {
                    y: { formatter: val => `${val} tickets` },
                  },
                  markers: {
                    size: 3,
                    hover: {
                      size: 6,
                    },
                  },
                }}
                series={getTrendData(filteredTickets, trendFilter)}
                type='line'
                height={350}
              />
            </Card>
          </Col>
        </Row>

        {/* Row 5: Priority Distribution and Department Breakdown */}
        <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
          {/* Priority Distribution */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <ExclamationCircleOutlined />
                  <span>Priority Distribution</span>
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                height: "100%",
              }}
              className='hoverable-card'
            >
              <ReactApexChart
                options={{
                  chart: {
                    type: "pie",
                    foreColor: "#666",
                  },
                  labels: ["Critical", "High", "Medium", "Low"],
                  colors: ["#FF4D4F", "#FA8C16", "#1890FF", "#52C41A"],
                  legend: {
                    position: "bottom",
                    horizontalAlign: "center",
                    labels: {
                      colors: "#666",
                      useSeriesColors: false,
                    },
                  },
                  dataLabels: {
                    enabled: true,
                    formatter: function (val, { seriesIndex }) {
                      const counts = [
                        filteredTickets.filter(t => t.priority === "Critical").length,
                        filteredTickets.filter(t => t.priority === "High").length,
                        filteredTickets.filter(t => t.priority === "Medium").length,
                        filteredTickets.filter(t => t.priority === "Low").length,
                      ];
                      return `${counts[seriesIndex]}`;
                    },
                    style: {
                      fontSize: "14px",
                      fontWeight: "bold",
                      colors: ["#fff"],
                    },
                    dropShadow: {
                      enabled: true,
                      top: 1,
                      left: 1,
                      blur: 1,
                      color: "#000",
                      opacity: 0.45,
                    },
                  },
                  stroke: {
                    width: 2,
                    colors: ["#fff"],
                  },
                  plotOptions: {
                    pie: {
                      donut: {
                        size: "0%",
                      },
                      expandOnClick: true,
                    },
                  },
                  tooltip: {
                    custom: function ({ series, seriesIndex, w }) {
                      const labels = ["Critical", "High", "Medium", "Low"];
                      const total = series.reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? ((series[seriesIndex] / total) * 100).toFixed(1) : 0;

                      return `
              <div style="padding: 8px; background: #fff; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15)">
                <div style="font-weight: bold; color: #333; margin-bottom: 4px;">${labels[seriesIndex]}</div>
                <div style="font-size: 16px; font-weight: bold; color: #211f66;">${series[seriesIndex]} tickets</div>
                <div style="font-size: 12px; color: #666;">${percentage}% of total</div>
              </div>
            `;
                    }
                  },
                  responsive: [
                    {
                      breakpoint: 480,
                      options: {
                        chart: {
                          width: "100%",
                        },
                        legend: {
                          position: "bottom",
                        },
                      },
                    },
                  ],
                }}
                series={[
                  filteredTickets.filter(t => t.priority === "Critical").length,
                  filteredTickets.filter(t => t.priority === "High").length,
                  filteredTickets.filter(t => t.priority === "Medium").length,
                  filteredTickets.filter(t => t.priority === "Low").length,
                ]}
                type='pie'
                height={350}
              />
            </Card>
          </Col>

          {/* Department Breakdown */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <TeamOutlined />
                  <span>Department Breakdown</span>
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                height: "100%",
              }}
              className='hoverable-card'
            >
              <Table
                className="leads-performance-table"
                columns={[
                  {
                    title: "Department",
                    dataIndex: "department",
                    key: "department",
                    width: 150,
                    render: text => <Text strong>{text || "Unassigned"}</Text>,
                  },
                  {
                    title: "Total",
                    dataIndex: "count",
                    key: "count",
                    align: "center",
                  },
                  {
                    title: "Opened",
                    key: "openTickets",
                    align: "center",
                    render: (_, record) => {
                      const total = Number(record.count) || 0;
                      const completed = Number(record.completed) || 0;
                      return total - completed;
                    },
                  },
                  {
                    title: "Completed",
                    dataIndex: "completed",
                    key: "completed",
                    align: "center",
                  },

                  {
                    title: "Rate %",
                    dataIndex: "rate",
                    key: "rate",
                    render: (text, record) => (
                      <Progress
                        percent={text}
                        strokeColor={
                          text > 75
                            ? colorShades.dark1
                            : text > 50
                              ? colorShades.primary
                              : "#FF6B6B"
                        }
                        format={percent => `${percent}%`}
                      />
                    ),
                  },
                ]}
                dataSource={Object.entries(
                  filteredTickets.reduce((acc, ticket) => {
                    const department = ticket.department_field || "Unassigned";

                    if (!acc[department]) {
                      acc[department] = { total: 0, completed: 0 };
                    }
                    acc[department].total++;

                    // FIX: Properly check for completed status
                    if (ticket.status === "Complete") {
                      acc[department].completed++;
                    }
                    return acc;
                  }, {})
                ).map(([department, { total, completed }]) => ({
                  key: department,
                  department,
                  count: total,
                  completed: completed,
                  rate: total > 0 ? Math.round((completed / total) * 100) : 0,
                }))}
                pagination={false}
                size='small'
              />
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const AgentPerformanceTab = () => (
    <>
      {/* Row 1: Agent Performance Summary Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {/* Agent Performance Summary - 50% width */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <span>Agent Performance Trend</span>
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              height: "100%",
            }}
          >
            <ReactApexChart
              type="area"
              height={350}
              series={[
                {
                  name: "Total Tickets",
                  data: agentPerformanceData.performanceData.map((item) => item.totalTickets),
                },
                {
                  name: "Completed Tickets",
                  data: agentPerformanceData.performanceData.map((item) => item.completedTickets),
                },
                {
                  name: "Open Tickets",
                  data: agentPerformanceData.performanceData.map((item) => item.openTickets),
                },
              ]}
              options={{
                chart: {
                  type: "area",
                  toolbar: { show: false },
                  zoom: { enabled: false },
                },
                stroke: {
                  curve: "smooth",
                  width: 3,
                },
                colors: ["#211f60", "#10b981", "#3b82f6"],
                dataLabels: { enabled: false },
                markers: {
                  size: 0,
                  hover: { size: 6 },
                },
                fill: {
                  type: "gradient",
                  gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.5,
                    opacityTo: 0.1,
                    stops: [0, 90, 100],
                  },
                },
                grid: {
                  borderColor: "#f1f1f1",
                  strokeDashArray: 4,
                },
                xaxis: {
                  categories: agentPerformanceData.performanceData.map((item) => item.agent),
                  labels: {
                    style: {
                      fontSize: "13px",
                      fontWeight: 500,
                      colors: "#6b7280",
                    },
                  },
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  title: {
                    text: "Agents",
                    style: { fontWeight: 600, color: "#374151" },
                  },
                },
                yaxis: {
                  labels: {
                    style: { fontSize: "12px", color: "#6b7280" },
                  },
                  title: {
                    text: "Tickets",
                    style: { fontWeight: 600, color: "#374151" },
                  },
                  min: 0,
                  forceNiceScale: true,
                },
                legend: {
                  position: "top",
                  horizontalAlign: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                },
                tooltip: {
                  shared: true,
                  intersect: false,
                  theme: "light",
                  y: {
                    formatter: (val) => `${val} Tickets`,
                  },
                },
              }}
            />
          </Card>
        </Col>


        {/* Agent Completion Rates - 50% width */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: "#f5a003ff" }} />
                <span>Agent Completion Rates</span>
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              height: "100%",
            }}
            className='hoverable-card'
            extra={<Text type='secondary'>Completion Metrics</Text>}
          >
            <div style={{ height: "350px" }}>
              {agentPerformanceData.performanceData.length > 0 ? (
                <Row gutter={[8, 8]}>
                  {agentPerformanceData.performanceData.map(agent => (
                    <Col xs={12} sm={8} md={12} lg={8} xl={6} key={agent.agent}>
                      <div
                        style={{
                          padding: "8px",
                          border: `1px solid ${colorShades.primary}40`,
                          borderRadius: "6px",
                          textAlign: "center",
                          backgroundColor: `${colorShades.primary}10`,
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "500",
                            marginBottom: "2px",
                          }}
                        >
                          {agent.agent}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: colorShades.primary,
                          }}
                        >
                          {agent.completionRate}%
                        </div>
                        <div style={{ fontSize: "10px", color: "#666" }}>
                          Completion Rate
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#999",
                  }}
                >
                  No agent data available
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Row 3: Assigned Person Statistics Table */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Agent Performance Summary</span>
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
            className='hoverable-card'
          >
            <Table
              className="leads-performance-table"
              columns={assignedPersonColumns}
              dataSource={assignedPersonTableData}
              scroll={{ x: 1000 }}
              size='middle'
            />
          </Card>
        </Col>
      </Row>
    </>
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      
        <Breadcrumb title='Ticketing Dashboard' />

        <Tabs
          activeKey={activeTab}
          onChange={key => setActiveTab(key)}
          style={{ marginBottom: 24 }}
          tabBarStyle={{ marginBottom: 16 }}
        >
          <TabPane
            tab={
              <span style={{ fontSize: "16px", fontWeight: "600" }}>
                <AppstoreOutlined style={{ marginRight: "8px" }} />
                Overview
              </span>
            }
            key='overview'
          >
            <OverviewTab />
          </TabPane>
          <TabPane
            tab={
              <span style={{ fontSize: "16px", fontWeight: "600" }}>
                <UserSwitchOutlined style={{ marginRight: "8px" }} />
                Agent Performance
              </span>
            }
            key='agentPerformance'
          >
            <AgentPerformanceTab />
          </TabPane>
        </Tabs>
      

    </div>
  );
};

export default TicketingDashboard;
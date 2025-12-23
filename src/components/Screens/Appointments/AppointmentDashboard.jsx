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
  Progress,
  Avatar,
  List,
  Rate,
  Spin,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  BarChartOutlined,
  TeamOutlined,
  UserOutlined,
  HomeOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RiseOutlined,
  StarOutlined,
  CommentOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import ReactApexChart from "react-apexcharts";
import FeatherIcon from "feather-icons-react";
import Breadcrumb from "../../Breadcrumb";
import MasterLayout from "../../../masterLayout/MasterLayout";
import './Appointment.css';
import moment from "moment";

const { Title, Text } = Typography;

const colorShades = {
  primary: "#211f60", // strong fresh green
  light1: "#312f68e3", // medium-light fresh green
  light2: "#2f2d66c2", // soft grassy green
  light3: "#323064a6", // bright mint green
  light4: "#37355aa6", // light mint green
  dark1: "#d0d2d6", // pale soft green
  dark2: "#d0d2d6", // lightest green shade
  dark3: "#d0d2d6",
  success: "#52c41a",
  warning: "#faad14",
  info: "#1890ff",
};

// Static data for agents
const staticAgentsData = [
  {
    _id: "agent_1",
    username: "John Smith",
    config: {
      appointment: {
        amountPerBooking: 500
      }
    }
  },
  {
    _id: "agent_2",
    username: "Emma Brown",
    config: {
      appointment: {
        amountPerBooking: 450
      }
    }
  },
  {
    _id: "agent_3",
    username: "David Wilson",
    config: {
      appointment: {
        amountPerBooking: 550
      }
    }
  },
];



// Static data for appointments (last 30 days and next 30 days)
const generateStaticAppointments = () => {
  const statuses = ["current", "completed", "rescheduled", "cancelled"];
  const agents = ["John Smith", "Emma Brown", "David Wilson"];

  const appointments = [];
  const startDate = moment().subtract(30, 'days');

  for (let i = 0; i < 150; i++) {
    const dateOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
    const appointmentDate = startDate.clone().add(dateOffset, 'days');

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const manager = agents[Math.floor(Math.random() * agents.length)];

    appointments.push({
      _id: `appt_${i + 1}`,
      appointmentDate: appointmentDate.format("YYYY-MM-DD"),
      status,
      manager,
      managerId: `agent_${agents.indexOf(manager) + 1}`,
      customerName: `Customer ${i + 1}`,
      serviceType: ["Consultation", "Follow-up", "Initial Meeting", "Review"][Math.floor(Math.random() * 4)],
      duration: [30, 45, 60][Math.floor(Math.random() * 3)],
      notes: "Sample appointment notes"
    });
  }

  return appointments;
};

const statusColors = {
  completed: { color: "#52c41a", icon: <CheckCircleOutlined /> },
  current: { color: "#1890ff", icon: <ClockCircleOutlined /> },
  cancelled: { color: "#ff4d4f", icon: <CloseCircleOutlined /> },
  rescheduled: { color: "#faad14", icon: <RedoOutlined /> },
};

const CalendarDayCell = ({ day, appointments, selectedDate }) => {
  const isCurrentMonth = day.isSame(selectedDate, "month");
  const isToday = day.isSame(moment(), "day");
  const isPastOrToday = day.isSameOrBefore(moment(), "day");

  const dayAppointments = appointments.filter(apt =>
    moment(apt.appointmentDate).isSame(day, "day")
  );

  const content = (
    <div style={{ minWidth: "220px", maxHeight: "240px", overflowY: "auto", padding: "4px" }}>
      {dayAppointments.length > 0 ? (
        dayAppointments.map((apt, index) => (
          <div
            key={index}
            style={{
              padding: "10px 12px",
              marginBottom: "8px",
              background: "#fff",
              border: `1px solid ${statusColors[apt.status]?.color || "#d9d9d9"}20`,
              borderLeft: `4px solid ${statusColors[apt.status]?.color || "#d9d9d9"}`,
              borderRadius: "10px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div
                style={{
                  fontWeight: 600,
                  color: "#211f60",
                  fontSize: "13px",
                }}
              >
                {apt.customerName}
              </div>
              <Tag
                color={statusColors[apt.status]?.color}
                style={{
                  borderRadius: "12px",
                  fontSize: "10px",
                  fontWeight: 500,
                  padding: "0 6px",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {statusColors[apt.status]?.icon}
                <span style={{ textTransform: "capitalize" }}>{apt.status}</span>
              </Tag>
            </div>

            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              {apt.serviceType}
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#888",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "4px",
              }}
            >
              <UserOutlined style={{ fontSize: "11px", color: "#999" }} />
              Agent: {apt.manager}
            </div>
          </div>
        ))
      ) : (
        <div style={{ color: "#999", fontSize: "12px", textAlign: "center" }}>
          No appointments
        </div>
      )}
    </div>
  );

  const dayCell = (
    <div
      style={{
        aspectRatio: "1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        backgroundColor: isToday ? "#e6f7ff" : "transparent",
        border: isToday ? "1px solid #211f60" : "1px solid transparent",
        color: isCurrentMonth ? "#262626" : "#bfbfbf",
        position: "relative",
        minHeight: "32px",
        fontSize: "12px",
        cursor: dayAppointments.length > 0 && isPastOrToday ? "pointer" : "default",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: isToday ? "bold" : "normal",
          color: isToday ? "#211f60" : "var(--text-secondary)",
        }}
      >
        {day.date()}
      </div>

      {dayAppointments.length > 0 && (
        <div className="appointment-dates"
          style={{

          }}
        >
          {dayAppointments.length} Apt
        </div>
      )}
    </div>
  );

  return isPastOrToday && dayAppointments.length > 0 ? (
    <Tooltip
      title={content}
      color="#fff"
      overlayInnerStyle={{
        borderRadius: "12px",
        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
        padding: "8px",
        color: "#333",
      }}
      placement="top"
    >
      {dayCell}
    </Tooltip>
  ) : (
    dayCell
  );
};

const getCalendarDays = date => {
  const startOfMonth = date.clone().startOf("month");
  const endOfMonth = date.clone().endOf("month");

  const startDay = startOfMonth.day();
  const daysInMonth = date.daysInMonth();

  const days = [];

  for (let i = 0; i < startDay; i++) {
    days.push(startOfMonth.clone().subtract(startDay - i, "days"));
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(startOfMonth.clone().date(i));
  }

  const totalCells = Math.ceil(days.length / 7) * 7;
  while (days.length < totalCells) {
    days.push(
      endOfMonth.clone().add(days.length - daysInMonth - startDay + 1, "days")
    );
  }

  return days;
};

const AppointmentDashboard = () => {
  const [selectedManager, setSelectedManager] = useState("all");
  const [trendFilter, setTrendFilter] = useState("7");
  const [selectedDate, setSelectedDate] = useState(moment());
  const [isLoading, setIsLoading] = useState(false);

  // Use static data instead of API calls
  const agentsData = staticAgentsData;
  const appointmentsData = generateStaticAppointments();

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 40,
        color: "var(--primary)",
      }}
      spin
    />
  );

  // Process static data
  const appointments = React.useMemo(() => {
    return appointmentsData;
  }, [appointmentsData]);

  const agents = React.useMemo(() => {
    return agentsData;
  }, [agentsData]);

  // Create agent lookup map for getting amountPerBooking
  const agentMap = useMemo(() => {
    const map = {};
    if (Array.isArray(agents)) {
      agents.forEach(agent => {
        if (agent && agent._id) {
          map[agent._id] = agent;
        }
      });
    }
    return map;
  }, [agents]);

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    if (selectedManager !== "all") {
      filtered = filtered.filter(appointment => {
        return (
          appointment.manager === selectedManager ||
          appointment.managerId === selectedManager
        );
      });
    }

    return filtered;
  }, [appointments, selectedManager]);

  const metrics = useMemo(() => {
    const totalAppointments = filteredAppointments.length;

    // Today's appointments
    const todayAppointments = filteredAppointments.filter(apt =>
      moment(apt.appointmentDate).isSame(moment(), "day")
    ).length;

    // Status counts
    const currentAppointments = filteredAppointments.filter(
      apt => apt.status === "current"
    ).length;

    const rescheduledAppointments = filteredAppointments.filter(
      apt => apt.status === "rescheduled"
    ).length;

    const completedAppointments = filteredAppointments.filter(
      apt => apt.status === "completed"
    ).length;

    const cancelledAppointments = filteredAppointments.filter(
      apt => apt.status === "cancelled"
    ).length;

    // Pending = current + rescheduled
    const pendingAppointments = currentAppointments + rescheduledAppointments;

    // Calculate revenue from completed appointments
    const totalRevenue = filteredAppointments
      .filter(apt => apt.status === "completed")
      .reduce((sum, apt) => {
        let agent = null;

        if (apt.managerId && agentMap[apt.managerId]) {
          agent = agentMap[apt.managerId];
        } else if (apt.manager) {
          agent = Object.values(agentMap).find(
            a => a.username === apt.manager || a._id === apt.manager
          );
        }

        const amountPerBooking = agent?.config?.appointment?.amountPerBooking || 0;
        return sum + amountPerBooking;
      }, 0);

    // Calculate total revenue for all appointments
    const totalAllRevenue = filteredAppointments.reduce((sum, apt) => {
      let agent = null;

      if (apt.managerId && agentMap[apt.managerId]) {
        agent = agentMap[apt.managerId];
      } else if (apt.manager) {
        agent = Object.values(agentMap).find(
          a => a.username === apt.manager || a._id === apt.manager
        );
      }

      const amountPerBooking = agent?.config?.appointment?.amountPerBooking || 0;
      return sum + amountPerBooking;
    }, 0);

    // Average revenue per completed appointment
    const avgRevenue = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;

    // Average rating (static)
    const avgRating = 4.6;

    // Success rate calculation
    const successRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

    // Status distribution for appointment types chart
    const statusDistribution = {
      Current: currentAppointments,
      Completed: completedAppointments,
      Rescheduled: rescheduledAppointments,
    };

    // Manager/Agent counts and performance
    const managerCounts = filteredAppointments.reduce((acc, appointment) => {
      const manager = appointment.manager || "Unassigned";
      acc[manager] = (acc[manager] || 0) + 1;
      return acc;
    }, {});

    const managerRevenue = filteredAppointments.reduce((acc, appointment) => {
      const manager = appointment.manager || "Unassigned";
      const agent = agentMap[appointment.managerId];
      const amountPerBooking = agent?.config?.appointment?.amountPerBooking || 0;
      acc[manager] = (acc[manager] || 0) + amountPerBooking;
      return acc;
    }, {});

    // Monthly data calculation
    const monthlyData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    months.forEach((month, index) => {
      const monthAppointments = filteredAppointments.filter(
        apt => moment(apt.appointmentDate).month() === index
      );

      const current = monthAppointments.filter(apt => apt.status === "current").length;
      const rescheduled = monthAppointments.filter(apt => apt.status === "rescheduled").length;
      const completed = monthAppointments.filter(apt => apt.status === "completed").length;

      monthlyData.push({
        month,
        current,
        rescheduled,
        completed,
      });
    });

    // Trend data for agent appointments
    const trendData = {};
    const filterDays = parseInt(trendFilter);
    const days = [];

    if (filterDays === 0) {
      const today = moment().format("YYYY-MM-DD");
      days.push(today);
      trendData[today] = {};
    } else {
      for (let i = filterDays - 1; i >= 0; i--) {
        const day = moment().subtract(i, "days").format("YYYY-MM-DD");
        days.push(day);
        trendData[day] = {};
      }
    }

    const uniqueManagers = [...new Set(filteredAppointments.map(apt => apt.manager).filter(Boolean))];

    days.forEach(day => {
      uniqueManagers.forEach(manager => {
        trendData[day][manager] = 0;
      });
    });

    filteredAppointments.forEach(appointment => {
      if (appointment.appointmentDate && appointment.manager) {
        const appointmentDay = moment(appointment.appointmentDate).format("YYYY-MM-DD");
        if (trendData.hasOwnProperty(appointmentDay)) {
          trendData[appointmentDay][appointment.manager]++;
        }
      }
    });

    return {
      totalAppointments,
      pendingAppointments,
      rescheduledAppointments,
      completedAppointments,
      cancelledAppointments,
      currentAppointments,
      todayAppointments,
      totalRevenue,
      totalAllRevenue,
      avgRevenue,
      avgRating,
      successRate,
      statusDistribution,
      managerCounts,
      managerRevenue,
      monthlyData,
      trendData: days.map(day => ({
        day: moment(day).format(filterDays === 0 ? "DD MMM" : filterDays <= 7 ? "DD MMM" : "DD MMM"),
        counts: trendData[day],
      })),
      uniqueManagers,
    };
  }, [filteredAppointments, trendFilter, agentMap]);

  const appointmentsAreaChart = {
    series: [
      {
        name: "Current",
        data: metrics.monthlyData.map(item => item.current),
        color: colorShades.primary,
      },
      {
        name: "Rescheduled",
        data: metrics.monthlyData.map(item => item.rescheduled),
        color: "#faad14",
      },
      {
        name: "Completed",
        data: metrics.monthlyData.map(item => item.completed),
        color: "#52c41a",
      },
    ],
    options: {
      chart: {
        type: "area",
        height: 350,
        stacked: false,
        toolbar: { show: false },
        foreColor: "#666",
        zoom: { enabled: false },
      },
      dataLabels: {
        enabled: false, // 👈 disables count numbers on each point
      },
      stroke: {
        curve: "smooth",
        width: 3,
        colors: [colorShades.primary, "#faad14", "#52c41a"],
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      markers: {
        size: 0, // 👈 hides round point markers
        strokeWidth: 0,
      },
      xaxis: {
        categories: metrics.monthlyData.map(item => item.month),
        labels: {
          style: { colors: "#666", fontSize: "12px" },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#666", fontSize: "11px" },
        },
        min: 0,
      },
      grid: {
        borderColor: "#f0f0f0",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        labels: { colors: "#666" },
        markers: { width: 12, height: 12, radius: 6 },
        itemMargin: { horizontal: 20, vertical: 5 },
      },
      colors: [colorShades.primary, "#faad14", "#52c41a"],
      tooltip: {
        shared: true,
        intersect: false,
        x: { show: true },
        y: { formatter: val => val + " appointments" },
      },
    },
  };

  const managerOptions = useMemo(() => {
    const managers = [...new Set(appointments.map(apt => apt.manager).filter(Boolean))];
    return managers;
  }, [appointments]);

  const overviewCards = [
    {
      title: "Today's Appointments",
      value: metrics.todayAppointments,
      icon: <CalendarOutlined style={{ color: colorShades.primary, fontSize: "24px" }} />,
    },
    {
      title: "Total Appointments",
      value: metrics.totalAppointments,
      icon: <TeamOutlined style={{ color: colorShades.primary, fontSize: "24px" }} />,
    },
    {
      title: "Pending",
      value: metrics.pendingAppointments,
      icon: <ClockCircleOutlined style={{ color: colorShades.primary, fontSize: "24px" }} />,
    },
    {
      title: "Completed",
      value: metrics.completedAppointments,
      icon: <CheckCircleOutlined style={{ color: colorShades.primary, fontSize: "24px" }} />,
    },
    {
      title: "Earned Revenue",
      value: `₹${metrics.totalRevenue.toFixed(0)}`,
      icon: <RiseOutlined style={{ color: colorShades.primary, fontSize: "24px" }} />,
    },
    {
      title: "Total Revenue",
      value: `₹${metrics.totalAllRevenue.toFixed(0)}`,
      icon: <RiseOutlined style={{ color: colorShades.primary, fontSize: "24px" }} />,
    },
  ];

  const appointmentsLineChart = {
    series: [
      {
        name: "Current",
        data: metrics.monthlyData.map(item => item.current),
        color: colorShades.primary,
      },
      {
        name: "Rescheduled",
        data: metrics.monthlyData.map(item => item.rescheduled),
        color: "#faad14",
      },
      {
        name: "Completed",
        data: metrics.monthlyData.map(item => item.completed),
        color: "#52c41a",
      },
    ],
    options: {
      chart: {
        type: "line",
        toolbar: { show: false },
        zoom: { enabled: false },
        foreColor: "#666",
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      markers: {
        size: 0,
      },
      xaxis: {
        categories: metrics.monthlyData.map(item => item.month),
        labels: {
          style: { colors: "#666" },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#666" },
        },
      },
      grid: {
        borderColor: "#f0f0f0",
        strokeDashArray: 4,
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        labels: { colors: "#666" },
      },
      colors: [colorShades.primary, "#faad14", "#52c41a"],
    },
  };

  const appointmentsDonutChart = useMemo(
    () => ({
      series: Object.values(metrics.statusDistribution),
      options: {
        chart: {
          type: "donut",
          toolbar: { show: false },
          foreColor: "#666",
        },
        labels: Object.keys(metrics.statusDistribution),
        colors: [colorShades.primary, colorShades.dark1, colorShades.light1],
        legend: {
          position: "bottom",
          horizontalAlign: "center",
          labels: { colors: "#666" },
        },
        plotOptions: {
          pie: {
            donut: {
              size: "70%",
              labels: {
                show: true,
                name: { show: true },
                value: { show: true },
                total: {
                  show: true,
                  label: "Total",
                  formatter: w => {
                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                  },
                },
              },
            },
          },
        },
        dataLabels: { enabled: false },
      },
    }),
    [metrics.statusDistribution]
  );

  const appointmentTrendChart = {
    series: metrics.uniqueManagers.map(manager => ({
      name: manager,
      data: metrics.trendData.map(day => day.counts[manager] || 0),
    })),
    options: {
      chart: {
        type: "area",
        stacked: false,
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
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: metrics.trendData.map(item => item.day),
        labels: { style: { colors: "#666" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return Math.round(val);
          },
          style: { colors: "#666" },
        },
        tickAmount: 5,
        min: 0,
        forceNiceScale: true,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
      colors: ["#1aa01aff", "#e71515ff", "#211f60"],
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        labels: { colors: "#666" },
      },
      grid: {
        borderColor: "#f0f0f0",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " appointments";
          },
        },
      },
    },
  };

  const handleTrendFilterChange = key => {
    setTrendFilter(key);
  };

  const getFilterText = filter => {
    if (filter === "0") return "Today Report";
    if (filter === "7") return "Last 7 days Report";
    if (filter === "28") return "Last 28 days Report";
    return `Last ${filter} days Report`;
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

  const userWiseData = Object.entries(metrics.managerCounts).map(
    ([manager, count], index) => {
      const completedAppointments = filteredAppointments.filter(
        apt => apt.manager === manager && apt.status === "completed"
      ).length;

      const earnedRevenue = filteredAppointments
        .filter(apt => apt.manager === manager && apt.status === "completed")
        .reduce((sum, apt) => {
          let agent = null;
          if (apt.managerId && agentMap[apt.managerId]) {
            agent = agentMap[apt.managerId];
          } else if (apt.manager) {
            agent = Object.values(agentMap).find(
              a => a.username === apt.manager || a._id === apt.manager
            );
          }
          const amountPerBooking = agent?.config?.appointment?.amountPerBooking || 0;
          return sum + amountPerBooking;
        }, 0);

      const totalRevenue = filteredAppointments
        .filter(apt => apt.manager === manager)
        .reduce((sum, apt) => {
          let agent = null;
          if (apt.managerId && agentMap[apt.managerId]) {
            agent = agentMap[apt.managerId];
          } else if (apt.manager) {
            agent = Object.values(agentMap).find(
              a => a.username === apt.manager || a._id === apt.manager
            );
          }
          const amountPerBooking = agent?.config?.appointment?.amountPerBooking || 0;
          return sum + amountPerBooking;
        }, 0);

      return {
        key: index,
        manager,
        appointments: count,
        completed: completedAppointments,
        revenue: totalRevenue,
        earned: earnedRevenue,
        percentage:
          metrics.totalAppointments > 0
            ? ((count / metrics.totalAppointments) * 100).toFixed(1)
            : 0,
      };
    }
  );

  const userColumns = [
    {
      title: "Agent",
      dataIndex: "manager",
      key: "manager",
      render: text => (
        <Space>
          <Avatar style={{ backgroundColor: colorShades.primary }}>
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <span style={{ fontWeight: "500" }}>{text}</span>
        </Space>
      ),
    },
    {
      title: "Appointments",
      dataIndex: "appointments",
      key: "appointments",
      render: count => <Tag color={colorShades.primary}>{count}</Tag>,
    },
    {
      title: "Completed",
      dataIndex: "completed",
      key: "completed",
      render: completed => <Tag color='#52c41a'>{completed}</Tag>,
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: revenue => <Text strong>₹{revenue.toFixed(0)}</Text>,
    },
    {
      title: "Earned",
      dataIndex: "earned",
      key: "earned",
      render: earned => (
        <Text strong style={{ color: "#52c41a" }}>
          ₹{earned.toFixed(0)}
        </Text>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: "16px", minHeight: "100vh" }}>
        <Breadcrumb title='Appointment Dashboard' />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
            flexDirection: "column",
          }}
        >
          <Spin indicator={antIcon} />
        </div>
      </div>
    );
  }

  return (
    // 
    <>
      <div style={{ padding: "16px", minHeight: "100vh" }}>
        <Breadcrumb title='Appointment Dashboard' />

        {/* Manager Filter */}
        <Row justify='end' style={{ marginBottom: "16px" }}>
          <Col>
            <Select
              showSearch
              value={selectedManager}
              onChange={setSelectedManager}
              style={{ width: 200 }}
              placeholder='Filter by Agent'
            >
              <Select.Option value='all'>All Agents</Select.Option>
              {managerOptions.map(manager => (
                <Select.Option key={manager} value={manager}>
                  {manager}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Row 1: Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          {overviewCards.map((card, index) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={4} key={index}>
              <Card
                className="saas-overview-card"
                bordered={false}
                style={{
                  borderRadius: "16px",
                  border: "1px solid #ffffff3f",
                  boxShadow: "0 2px 8px rgba(33,31,96,0.08), 0 1px 2px rgba(33,31,96,0.04)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: "100%",
                  overflow: "hidden",
                  position: "relative",
                }}
                bodyStyle={{ padding: "20px", background: "none" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(33,31,96,0.12), 0 4px 8px rgba(33,31,96,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(33,31,96,0.08), 0 1px 2px rgba(33,31,96,0.04)";
                }}
              >
                {/* Decorative gradient accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "100px",
                    height: "100px",
                    background: "linear-gradient(135deg, rgba(22, 21, 53, 0.23), transparent)",
                    borderRadius: "0 16px 0 100%",
                  }}
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* Icon Container */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, #211f60 0%, #3d3b7a 100%)",
                      color: "#fff",
                      borderRadius: "12px",
                      width: "48px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                      boxShadow: "0 4px 12px rgba(33,31,96,0.25)",
                    }}
                  >
                    {React.cloneElement(card.icon, {
                      style: { fontSize: "24px", color: "#fff" }
                    })}
                  </div>

                  {/* Card Title */}
                  <div className="overview-title" >
                    {card.title}
                  </div>

                  {/* Card Value */}
                  <div className="overview-value">
                    {card.value}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Row 2: Trend Chart */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          {/* Appointment Trend Chart - 80% width */}
          <Col xs={24} lg={19}>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
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
                    <span className='card-title'>Appointment Trend by Agent</span>
                  </Space>
                  <Dropdown
                    menu={{
                      items: trendItems.map(item => ({
                        key: item.key,
                        label: <div className='fw-bolder'>{item.label}</div>,
                        onClick: () => handleTrendFilterChange(item.key),
                      })),
                    }}
                    trigger={["click"]}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <FeatherIcon icon='more-vertical' size='20' />
                    </div>
                  </Dropdown>
                </div>
              </div>
              <div className='card-body' style={{ padding: "0 16px 16px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <Text strong className='chart-subtitle'>
                    {getFilterText(trendFilter)}
                  </Text>
                </div>
                <div id='chart' style={{ minHeight: "300px" }}>
                  {metrics.uniqueManagers.length > 0 ? (
                    <ReactApexChart
                      options={appointmentTrendChart.options}
                      series={appointmentTrendChart.series}
                      type='area'
                      height={350}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "200px",
                        color: "#999",
                      }}
                    >
                      No appointment data available
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>

          {/* KPI Cards - 20% width */}
          <Col xs={24} lg={5}>
            <Row gutter={[16, 16]}>
              {[
                {
                  title: "Success Rate",
                  value: `${metrics.successRate.toFixed(1)}%`,
                  icon: <RiseOutlined style={{ fontSize: "24px", color: "#fff" }} />,
                  isProgress: true,
                },
                {
                  title: "Avg Revenue",
                  value: `₹${metrics.avgRevenue.toFixed(0)}`,
                  icon: <BarChartOutlined style={{ fontSize: "24px", color: "#fff" }} />,
                },
                {
                  title: "Completed Revenue",
                  value: `₹${metrics.totalRevenue.toFixed(0)}`,
                  icon: <CheckCircleOutlined style={{ fontSize: "24px", color: "#fff" }} />,
                },
              ].map((card, index) => (
                <Col span={24} key={index}>
                  <Card
                    className="metric-card"
                    style={{
                      borderRadius: "16px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      background: "linear-gradient(135deg, #2b2a5a 0%, #4b3ba7 100%)",
                      color: "#fff",
                      overflow: "hidden",
                      transition: "all 0.4s ease",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.querySelector(".metric-icon").style.transform = "translateX(0)";
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow = "0 12px 24px rgba(33,31,96,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.querySelector(".metric-icon").style.transform = "translateX(-50px)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    }}
                  >
                    {/* Hover Icon */}
                    <div
                      className="metric-icon"
                      style={{
                        position: "absolute",
                        left: "16px",
                        top: "16px",
                        transform: "translateX(-50px)",
                        transition: "all 0.4s ease",
                        opacity: 0.9,
                      }}
                    >
                      {card.icon}
                    </div>

                    {/* Card Content */}
                    <div style={{ textAlign: "center", padding: "18px" }}>
                      <div style={{ fontSize: "26px", fontWeight: "bold" }}>{card.value}</div>
                      <div style={{ fontSize: "14px", opacity: 0.9, marginTop: "6px" }}>{card.title}</div>
                      {card.isProgress && (
                        <Progress
                          percent={metrics.successRate}
                          strokeColor="#ffffff"
                          trailColor="rgba(255,255,255,0.2)"
                          showInfo={false}
                          style={{ marginTop: "12px" }}
                        />
                      )}
                    </div>
                  </Card>
                </Col>
              ))}

            </Row>
          </Col>
        </Row>

        {/* Row 3: Compact Calendar and Donut Chart */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  <span className='card-title'>Appointment Calendar</span>
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                minHeight: "400px",
              }}
              className='hoverable-card'
              extra={
                <div className='calendar-navigation'>
                  <Button
                    type='text'
                    icon={<FeatherIcon icon='chevron-left' size='14' />}
                    onClick={() =>
                      setSelectedDate(selectedDate.clone().subtract(1, "month"))
                    }
                  />
                  <Text strong style={{ margin: "0 8px" }}>
                    {selectedDate.format("MMMM YYYY")}
                  </Text>
                  <Button
                    type='text'
                    icon={<FeatherIcon icon='chevron-right' size='14' />}
                    onClick={() =>
                      setSelectedDate(selectedDate.clone().add(1, "month"))
                    }
                  />
                </div>
              }
            >
              <div style={{ padding: "0 8px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    textAlign: "center",
                    marginBottom: "8px",
                    fontWeight: "500",
                    color: "#666",
                    fontSize: "12px",
                  }}
                >
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "2px",
                  }}
                >
                  {getCalendarDays(selectedDate).map((day, index) => (
                    <CalendarDayCell
                      key={index}
                      day={day}
                      appointments={filteredAppointments}
                      selectedDate={selectedDate}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <BarChartOutlined />
                  <span className='card-title'>Monthly Appointment Trends</span>
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                height: "100%",
              }}
              className='hoverable-card'
            >
              <ReactApexChart
                options={appointmentsAreaChart.options}
                series={appointmentsAreaChart.series}
                type='area'
                height={400}
              />
            </Card>
          </Col>
        </Row>

        {/* Combined Row for Monthly Trends and Feedback */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px", height: "100%" }}>
          {/* Monthly Appointment Trends - 50% width */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <UserOutlined />
                  <span className='card-title'>Appointment Status</span>
                </Space>
              }
              style={{
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                minHeight: "320px",
                marginBottom: "20px",
                overflow: "hidden",
              }}
              className='hoverable-card'
              bodyStyle={{ padding: "20px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                {/* Redesigned Pie Chart on the left */}
                <div style={{
                  width: "45%",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}>
                  <div style={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center"
                  }}>
                    <div style={{
                      position: "relative",
                      width: "240px",
                      height: "240px"
                    }}>
                      <ReactApexChart
                        options={{
                          chart: {
                            type: "donut",
                            height: 240,
                            animations: {
                              enabled: true,
                              speed: 1000,
                              animateGradually: {
                                enabled: true,
                                delay: 200
                              }
                            },
                            dropShadow: {
                              enabled: true,
                              top: 2,
                              left: 2,
                              blur: 4,
                              opacity: 0.2
                            }
                          },
                          series: appointmentsDonutChart.series,
                          labels: ["Current", "Completed", "Rescheduled"],
                          colors: [
                            "#211f60", // Current - primary blue
                            "#52c41a", // Completed - success green
                            "#faad14", // Rescheduled - warning orange
                          ],
                          stroke: {
                            show: true,
                            width: 3,
                            colors: ['#ffffff'],
                            lineCap: 'round'
                          },
                          plotOptions: {
                            pie: {
                              donut: {
                                size: '60%',
                                labels: {
                                  show: true,
                                  name: {
                                    show: true,
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    offsetY: -10
                                  },
                                  value: {
                                    show: true,
                                    fontSize: '28px',
                                    fontWeight: 800,
                                    offsetY: 10,
                                    formatter: function (val) {
                                      return val
                                    }
                                  },
                                  total: {
                                    show: true,
                                    label: 'Total Appointments',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    formatter: function (w) {
                                      const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                      return total.toString();
                                    }
                                  }
                                }
                              },
                              expandOnClick: true,
                              dataLabels: {
                                offset: 10,
                                minAngleToShowLabel: 10
                              }
                            }
                          },
                          dataLabels: {
                            enabled: true,
                            formatter: function (val, opts) {
                              const label = opts.w.globals.labels[opts.seriesIndex];
                              const value = opts.w.globals.series[opts.seriesIndex];
                              return `${label}: ${value}`;
                            },
                            style: {
                              fontSize: '12px',
                              fontWeight: 600,
                              colors: ['#fff']
                            },
                            dropShadow: {
                              enabled: true,
                              top: 1,
                              left: 1,
                              blur: 3,
                              opacity: 0.8
                            }
                          },
                          legend: {
                            show: false
                          },
                          tooltip: {
                            custom: function ({ series, seriesIndex, w }) {
                              const labels = ["Current", "Completed", "Rescheduled"];
                              const colors = ["#211f60", "#52c41a", "#faad14"];
                              const percentage = ((series[seriesIndex] / w.globals.seriesTotals.reduce((a, b) => a + b, 0)) * 100).toFixed(1);

                              return `
                      <div style="padding: 12px 16px; background: white; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.15); border: 1px solid #f0f0f0; min-width: 180px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                          <div style="width: 14px; height: 14px; border-radius: 4px; background: ${colors[seriesIndex]}; box-shadow: 0 2px 4px ${colors[seriesIndex]}40"></div>
                          <span style="font-weight: 700; color: #333; font-size: 14px;">${labels[seriesIndex]}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                          <span style="font-size: 22px; font-weight: 800; color: ${colors[seriesIndex]};">${series[seriesIndex]}</span>
                          <span style="font-size: 14px; font-weight: 600; color: #666; background: #f5f5f5; padding: 2px 8px; border-radius: 12px;">${percentage}%</span>
                        </div>
                        <div style="font-size: 12px; color: #888; font-weight: 500;">appointments</div>
                      </div>
                    `;
                            }
                          },
                          responsive: [{
                            breakpoint: 480,
                            options: {
                              chart: {
                                width: 200,
                                height: 200
                              },
                              legend: {
                                position: 'bottom'
                              }
                            }
                          }]
                        }}
                        series={appointmentsDonutChart.series}
                        type='donut'
                        height={240}
                      />

                      {/* Decorative rings around the chart */}
                      <div style={{
                        position: "absolute",
                        top: "-10px",
                        left: "-10px",
                        right: "-10px",
                        bottom: "-10px",
                        borderRadius: "50%",
                        border: "1px dashed rgba(33, 31, 96, 0.15)",
                        pointerEvents: "none"
                      }} />

                      <div style={{
                        position: "absolute",
                        top: "-20px",
                        left: "-20px",
                        right: "-20px",
                        bottom: "-20px",
                        borderRadius: "50%",
                        border: "1px solid rgba(33, 31, 96, 0.08)",
                        pointerEvents: "none"
                      }} />
                    </div>
                  </div>
                </div>

                {/* Stats on the right (keep your existing right side code) */}
                <div style={{ width: "55%", paddingLeft: "10px" }}>
                  {/* Current Appointments - Enhanced */}
                  <div
                    style={{
                      marginBottom: "20px",
                      padding: "16px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)",
                      border: "1px solid rgba(33, 31, 96, 0.1)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(33, 31, 96, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Decorative accent */}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "4px",
                      height: "100%",
                      background: "linear-gradient(to bottom, #211f60, #3d3b7a)",
                      borderRadius: "0 2px 2px 0"
                    }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <div style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "#211f60",
                            boxShadow: "0 0 0 4px rgba(33, 31, 96, 0.1)"
                          }} />
                          <div style={{
                            fontSize: "12px",
                            color: "#666",
                            fontWeight: 500,
                            letterSpacing: "0.3px"
                          }}>
                            Current Appointments
                          </div>
                        </div>

                        <div style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "8px",
                          marginBottom: "8px"
                        }}>
                          <div style={{
                            fontSize: "28px",
                            fontWeight: 700,
                            color: "#211f60",
                            lineHeight: 1
                          }}>
                            {metrics.currentAppointments}
                          </div>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            backgroundColor: "rgba(33, 31, 96, 0.1)",
                            borderRadius: "12px"
                          }}>
                            <ClockCircleOutlined style={{
                              color: colorShades.primary,
                              fontSize: "12px"
                            }} />
                            <span style={{
                              color: colorShades.primary,
                              fontSize: "11px",
                              fontWeight: 600
                            }}>
                              {((metrics.currentAppointments / metrics.totalAppointments) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(33, 31, 96, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <ClockCircleOutlined style={{
                          color: colorShades.primary,
                          fontSize: "20px"
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Completed Appointments - Enhanced */}
                  <div
                    style={{
                      marginBottom: "20px",
                      padding: "16px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #f6ffed 0%, #e6ffd9 100%)",
                      border: "1px solid rgba(82, 196, 26, 0.1)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(82, 196, 26, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "4px",
                      height: "100%",
                      background: "linear-gradient(to bottom, #52c41a, #73d13d)",
                      borderRadius: "0 2px 2px 0"
                    }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <div style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "#52c41a",
                            boxShadow: "0 0 0 4px rgba(82, 196, 26, 0.1)"
                          }} />
                          <div style={{
                            fontSize: "12px",
                            color: "#666",
                            fontWeight: 500,
                            letterSpacing: "0.3px"
                          }}>
                            Completed Appointments
                          </div>
                        </div>

                        <div style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "8px",
                          marginBottom: "8px"
                        }}>
                          <div style={{
                            fontSize: "28px",
                            fontWeight: 700,
                            color: "#52c41a",
                            lineHeight: 1
                          }}>
                            {metrics.completedAppointments}
                          </div>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            backgroundColor: "rgba(82, 196, 26, 0.1)",
                            borderRadius: "12px"
                          }}>
                            <CheckCircleOutlined style={{
                              color: "#52c41a",
                              fontSize: "12px"
                            }} />
                            <span style={{
                              color: "#52c41a",
                              fontSize: "11px",
                              fontWeight: 600
                            }}>
                              {metrics.successRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(82, 196, 26, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <CheckCircleOutlined style={{
                          color: "#52c41a",
                          fontSize: "20px"
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Rescheduled Appointments - Enhanced */}
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #fffbe6 0%, #fff2cc 100%)",
                      border: "1px solid rgba(250, 173, 20, 0.1)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(250, 173, 20, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "4px",
                      height: "100%",
                      background: "linear-gradient(to bottom, #faad14, #ffc53d)",
                      borderRadius: "0 2px 2px 0"
                    }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <div style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "#faad14",
                            boxShadow: "0 0 0 4px rgba(250, 173, 20, 0.1)"
                          }} />
                          <div style={{
                            fontSize: "12px",
                            color: "#666",
                            fontWeight: 500,
                            letterSpacing: "0.3px"
                          }}>
                            Rescheduled Appointments
                          </div>
                        </div>

                        <div style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "8px",
                          marginBottom: "8px"
                        }}>
                          <div style={{
                            fontSize: "28px",
                            fontWeight: 700,
                            color: "#faad14",
                            lineHeight: 1
                          }}>
                            {metrics.rescheduledAppointments}
                          </div>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            backgroundColor: "rgba(250, 173, 20, 0.1)",
                            borderRadius: "12px"
                          }}>
                            <SyncOutlined style={{
                              color: "#faad14",
                              fontSize: "12px"
                            }} />
                            <span style={{
                              color: "#faad14",
                              fontSize: "11px",
                              fontWeight: 600
                            }}>
                              {((metrics.rescheduledAppointments / metrics.totalAppointments) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(250, 173, 20, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <SyncOutlined style={{
                          color: "#faad14",
                          fontSize: "20px"
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Feedback Card - 50% width */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <TeamOutlined />
                  <span className='card-title'>Agent Performance</span>
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
              }}
              className='hoverable-card'
            >
              <div style={{ overflowX: "auto" }}>
                <div
                  style={{
                    height: "330px",
                    maxHeight: "100%",
                    overflowY: "auto",
                  }}
                >
                  <Table
                    className="leads-performance-table"
                    dataSource={userWiseData}
                    columns={userColumns}
                    pagination={false}
                    size='middle'
                    scroll={{ x: true }}
                  />
                </div>
              </div>  
            </Card>
          </Col>
        </Row>
      </div>
    </>

    // </MasterLayout>

  );
};

export default AppointmentDashboard;
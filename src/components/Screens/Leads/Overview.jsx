import React, { useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  Typography,
  Table,
  Space,
  Button,
  Progress,
  Avatar,
  Badge,
  Drawer,
  Form,
  DatePicker,
  Empty,
} from "antd";
import {
  PieChartOutlined,
  BarChartOutlined,
  TrophyOutlined,
  TeamOutlined,
  DollarOutlined,
  RiseOutlined,
  FireOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  BarChart,
  Bar,
  LabelList,
  Cell,
} from "recharts";
import moment from "moment";
import "./Leads.css"

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Color scheme
const colorShades = {
  primary: "#211f60",
  light1: "#211f60",
  light2: "#211f60",
  light3: "#211f60",
  light4: "#211f60",
  dark1: "#211f60",
  dark2: "#211f60",
  dark3: "#211f60",
};

const Overview = () => {
  // Filter states
  const [dateRange, setDateRange] = useState(null);
  const [selectedAssigned, setSelectedAssigned] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [timeFilter, setTimeFilter] = useState("30");
  const [trendFilter, setTrendFilter] = useState("leads");
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  const [form] = Form.useForm();

  // Mock data
  const metrics = {
    overview: {
      hotLeads: 45,
      customers: 120,
      conversionRate: 18.5,
      achievedValue: 50000,
      totalValue: 20000,
      totalLeads: 650,
    },
    statusCounts: {
      "New Lead": 120,
      "Hot": 45,
      "Warm": 85,
      "Cold": 180,
      "Converted": 120,
      "Invalid": 100,
    },
    monthlyTrend: [
      { date: "Jan 01", leads: 20, converted: 4, value: 80000 },
      { date: "Jan 08", leads: 25, converted: 5, value: 95000 },
      { date: "Jan 15", leads: 30, converted: 6, value: 120000 },
      { date: "Jan 22", leads: 22, converted: 8, value: 150000 },
      { date: "Jan 29", leads: 35, converted: 10, value: 180000 },
      { date: "Feb 05", leads: 28, converted: 7, value: 140000 },
    ],
    employeePerformance: [
      { employee: "John Doe", leads: 120, converted: 25, conversionRate: 20.8, value: 450000, newLead: 30, hot: 25, warm: 35, cold: 20, converted: 10 },
      { employee: "Jane Smith", leads: 95, converted: 18, conversionRate: 18.9, value: 380000, newLead: 25, hot: 20, warm: 25, cold: 15, converted: 10 },
      { employee: "Robert Johnson", leads: 85, converted: 22, conversionRate: 25.9, value: 520000, newLead: 20, hot: 15, warm: 30, cold: 10, converted: 10 },
    ],
    companyAnalytics: [
      { company: "TechCorp Solutions", leads: 45, converted: 12, conversionRate: 26.7, value: 280000, sourceCount: 3, agentCount: 2, avgValue: 23333, assignedAgents: ["John Doe", "Jane Smith"] },
      { company: "Global Enterprises", leads: 38, converted: 8, conversionRate: 21.1, value: 190000, sourceCount: 2, agentCount: 1, avgValue: 23750, assignedAgents: ["Robert Johnson"] },
      { company: "Innovate Digital", leads: 52, converted: 15, conversionRate: 28.8, value: 420000, sourceCount: 4, agentCount: 3, avgValue: 8077, assignedAgents: ["John Doe", "Jane Smith"] },
      { company: "Future Systems", leads: 28, converted: 5, conversionRate: 17.9, value: 125000, sourceCount: 2, agentCount: 2, avgValue: 4464, assignedAgents: ["Robert Johnson"] },
      { company: "Alpha Industries", leads: 35, converted: 9, conversionRate: 25.7, value: 210000, sourceCount: 3, agentCount: 2, avgValue: 6000, assignedAgents: ["John Doe", "Jane Smith"] },
    ],
    funnelData: [
      { name: "Leads", value: 650 },
      { name: "Qualified", value: 420 },
      { name: "Contacted", value: 280 },
      { name: "Proposal Sent", value: 180 },
      { name: "Negotiation", value: 130 },
      { name: "Converted", value: 120 },
    ],
  };

  // Mock agent data for filters
  const agentData = [
    { email: "john.doe@example.com", role: "agent", agentType: { leads: true } },
    { email: "jane.smith@example.com", role: "agent", agentType: { leads: true } },
    { email: "robert.johnson@example.com", role: "agent", agentType: { leads: true } },
  ];

  // Mock leads data for filter options
  const leads = [
    { source: "Website", status: "Hot" },
    { source: "Referral", status: "Warm" },
    { source: "Social Media", status: "Cold" },
    { source: "Email Campaign", status: "New Lead" },
    { source: "Events", status: "Converted" },
  ];

  // Get filter options
  const assignedOptions = useMemo(() => {
    return agentData.map(agent => agent.email).filter(Boolean);
  }, []);

  const sourceOptions = useMemo(() => {
    const sources = [
      ...new Set(leads.map(lead => lead.source).filter(Boolean)),
    ];
    return sources.length > 0
      ? sources
      : ["Website", "Referral", "Social Media"];
  }, []);

  const statusOptions = useMemo(() => {
    const statuses = [
      ...new Set(leads.map(lead => lead.status).filter(Boolean)),
    ];
    return statuses.length > 0 ? statuses : ["New Lead", "Hot", "Warm", "Cold"];
  }, []);

  // Filter handlers
  const applyGlobalFilters = (changedValues, allValues) => {
    if (changedValues.dateRange !== undefined) {
      const newDateRange = changedValues.dateRange;
      if (newDateRange && newDateRange.length === 2) {
        setDateRange([
          newDateRange[0].toDate ? newDateRange[0].toDate() : newDateRange[0],
          newDateRange[1].toDate ? newDateRange[1].toDate() : newDateRange[1],
        ]);
      } else {
        setDateRange(null);
      }
    }

    if (changedValues.timeFilter !== undefined) {
      setTimeFilter(changedValues.timeFilter);
      if (changedValues.timeFilter !== "all") {
        setDateRange(null);
        form.setFieldsValue({ dateRange: null });
      }
    }

    if (changedValues.assigned !== undefined)
      setSelectedAssigned(changedValues.assigned);
    if (changedValues.source !== undefined)
      setSelectedSource(changedValues.source);
    if (changedValues.status !== undefined)
      setSelectedStatus(changedValues.status);
  };

  const resetFilters = () => {
    setDateRange(null);
    setSelectedAssigned("all");
    setSelectedSource("all");
    setSelectedStatus("all");
    setTimeFilter("30");

    form.setFieldsValue({
      dateRange: null,
      assigned: "all",
      source: "all",
      status: "all",
      timeFilter: "30",
    });

    form.resetFields();
  };

  const filterCount = useMemo(() => {
    let count = 0;
    if (dateRange) count++;
    if (selectedAssigned !== "all") count++;
    if (selectedSource !== "all") count++;
    if (selectedStatus !== "all") count++;
    if (timeFilter !== "30") count++;
    return count;
  }, [dateRange, selectedAssigned, selectedSource, selectedStatus, timeFilter]);

  // Overview cards data
  const overviewCards = [
    {
      title: "Hot Leads",
      value: metrics.overview?.hotLeads || 0,
      icon: <FireOutlined />,
      color: "#ff4d4f",
    },
    {
      title: "Customers",
      value: metrics.overview?.customers || 0,
      icon: <CheckCircleOutlined />,
      color: colorShades.light1,
    },
    {
      title: "Conversion Rate",
      value: (metrics.overview?.conversionRate || 0).toFixed(1) + "%",
      icon: <RiseOutlined />,
      color: colorShades.dark1,
    },
    {
      title: "Achieved Value",
      value: `₹${(metrics.overview?.achievedValue || 0).toLocaleString()}`,
      icon: <DollarOutlined />,
      color: colorShades.dark1,
    },
    {
      title: "Total Value",
      value: `₹${(metrics.overview?.totalValue || 0).toLocaleString()}`,
      icon: <DollarOutlined />,
      color: colorShades.dark2,
    },
    {
      title: "Total Leads",
      value: metrics.overview?.totalLeads || 0,
      icon: <TeamOutlined />,
      color: colorShades.primary,
    },
  ];

  return (
    <div className="overview-tab">
      {/* Filter Controls */}
      <Row
        gutter={[16, 16]}
        align='middle'
        justify='end'
        style={{ marginBottom: 16 }}
      >
        <Col xs={24} sm={24} md={12}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{
                backgroundColor: "transparent",
                fontSize: "12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "28px",
                padding: "4px 12px",
                fontWeight: 600,
                border: "none",
              }}
            >
              {dateRange && dateRange.length === 2 ? (
                <>
                  <span style={{ color: "#000000", marginRight: "4px" }}>
                    Custom Report:
                  </span>
                  {`${moment(dateRange[0]).format("MMM DD, YYYY")} - ${moment(dateRange[1]).format("MMM DD, YYYY")}`}
                </>
              ) : (
                <>
                  Last 30 Days - <span>Records by default</span>
                </>
              )}
            </span>

            <Button
            className="btn-primary"
              icon={<FilterOutlined />}
              onClick={() => setFilterDrawerVisible(true)}
              style={{ borderRadius: "8px" }}
            >
              Filters{" "}
              {filterCount > 0 && (
                <Badge
                  count={filterCount}
                  style={{
                    marginLeft: 8,
                    backgroundColor: "#211f60",
                  }}
                />
              )}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {overviewCards.map(card => (
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <div className="stat-card">
              <div className="icon-badge" style={{ backgroundColor: card.color }}>
                {card.icon}
              </div>
              <div className="stat-content">
                <h4>{card.title}</h4>
                <h2>{card.value}</h2>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        {/* Lead Status Pie Chart */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <PieChartOutlined />
                <span>Lead Status</span>
              </Space>
            }
            style={{
              borderRadius: "12px",
              maxHeight: "26rem",
              height: "100%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <ResponsiveContainer width='100%' height={280}>
              <PieChart>
                <Pie
                  data={Object.entries(metrics.statusCounts || {}).map(
                    ([status, count]) => ({
                      name: status,
                      value: count,
                      fill:
                        status === "Hot"
                          ? "#ff4d4f"
                          : status === "Warm"
                            ? "orange"
                            : status === "Cold"
                              ? "#88CD8F"
                              : status === "New Lead"
                                ? "#90D5FF"
                                : status === "Invalid"
                                  ? "gray"
                                  : "var(--primary)",
                    })
                  )}
                  cx='50%'
                  cy='50%'
                  outerRadius={80}
                  dataKey='value'
                />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend at Bottom */}
            <div
              style={{
                marginTop: "-25px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: "13px",
              }}
            >
              {/* Row 1 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: "#90D5FF",
                      borderRadius: 10,
                    }}
                  />
                  New Lead
                </span>

                <span
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: "#ff4d4f",
                      borderRadius: 10,
                    }}
                  />
                  Hot
                </span>

                <span
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: "orange",
                      borderRadius: 10,
                    }}
                  />
                  Warm
                </span>
              </div>

              {/* Row 2 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: "#88CD8F",
                      borderRadius: 10,
                    }}
                  />
                  Cold
                </span>

                <span
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: "var(--primary)",
                      borderRadius: 10,
                    }}
                  />
                  Converted
                </span>

                <span
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: "gray",
                      borderRadius: 10,
                    }}
                  />
                  Invalid
                </span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Top Performers */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <TrophyOutlined />
                <span style={{ fontWeight: 600 }}>Top Performers</span>
              </Space>
            }
            style={{
              borderRadius: "16px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              height: "100%",
              maxHeight: "26rem",
              overflowY: "auto",
            }}
          >
            {(metrics.employeePerformance || []).length === 0 ? (
              <Empty description="No performance data available" />
            ) : (
              <div className="top-performers-list">
                {(metrics.employeePerformance || []).slice(0, 3).map((item, index) => (
                  <div
                    key={index}
                    className="performer-card"
                  >
                    <div className="performer-rank">
                      <Avatar
                        size={50}
                        style={{
                          color: "#444",
                          fontWeight: 600,
                          fontSize: 16,
                          border: "2px solid #fff",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                        }}
                      >
                        {item.employee.charAt(0)}
                      </Avatar>
                      <div className="performer-info">
                        <span className="performer-name">{item.employee}</span>
                        <span className="performer-meta">
                          <span>{item.leads} Leads</span>
                          <span>• {item.conversionRate.toFixed(1)}%</span>
                          <span>• ₹{(item.value / 1000).toFixed(1)}k</span>
                        </span>
                      </div>
                    </div>
                    <div className="performer-progress">
                      <Progress
                        percent={Math.round(item.conversionRate)}
                        size="small"
                        showInfo={false}
                        strokeColor={
                          index === 0
                            ? "#47b41f"
                            : index === 1
                              ? "#47b41f"
                              : "#47b41f  "
                        }
                        strokeWidth={6}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Conversion Funnel */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <span>Conversion Stages</span>
              </Space>
            }
            style={{
              maxHeight: "26rem",
              height: "100%",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={metrics.funnelData || []}
                margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-15}
                  dy={10}
                />
                <YAxis />
                <RechartsTooltip
                  formatter={(value) => value.toLocaleString()}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #eee",
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]} // Rounded top corners
                  barSize={30}
                  fill={colorShades.primary}
                >
                  {(metrics.funnelData || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? "#4b6cb7"
                          : index === 1
                            ? "#5c7cfa"
                            : index === 2
                              ? "#748ffc"
                              : index === 3
                                ? "#91a7ff"
                                : index === 4
                                  ? "#bac8ff"
                                  : "#dbe4ff"
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{
                      fill: "#333",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                    formatter={(v) => v.toLocaleString()}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Monthly Trend */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Space>
                <LineChartOutlined />
                <span style={{ fontSize: 16, fontWeight: 600 }}>30-Day Trend</span>
              </Space>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                data={metrics.monthlyTrend || []}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4b6cb7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4b6cb7" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#666" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#666" }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <RechartsTooltip
                  contentStyle={{
                    background: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #eee",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  }}
                  labelStyle={{ fontWeight: 600, color: "#111" }}
                />
                <Legend verticalAlign="top" height={30} iconType="circle" />

                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#4b6cb7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Company Analytics */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TeamOutlined />
                <span style={{ fontWeight: 600 }}>Company Analytics</span>
              </Space>
            }
            style={{
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              height: "28rem",
              overflowY: "auto",
            }}
          >
            {(metrics.companyAnalytics || []).length === 0 ? (
              <Empty description="No company data available" />
            ) : (
              <div className="company-analytics-list">
                {(metrics.companyAnalytics || []).slice(0, 5).map((item, index) => (
                  <div key={index} className="company-card clean-company-card">
                    <div className="company-header">
                      <div className="company-avatar">
                        <Avatar
                          style={{
                            backgroundColor: "#211f60",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        >
                          {item.company.charAt(0)}
                        </Avatar>
                        <div className="company-info">
                          <div>
                            <span className="company-name d-block">{item.company}</span>
                            <span className="company-sub">
                              {item.leads} leads • {item.converted} converted
                            </span>
                          </div>

                        </div>
                      </div>
                      <span className="company-value">
                        ₹{(item.value / 1000).toFixed(1)}k
                      </span>
                    </div>

                    <Progress
                      percent={Math.round(item.conversionRate)}
                      strokeColor="var(--primary)"
                      showInfo={false}
                      size="small"
                      style={{
                        margin: "10px 0 6px",
                        height: "8px",
                      }}
                    />

                    <div className="company-footer">
                      <div className="company-subtext">
                        <span>Avg: ₹{(item.avgValue / 1000).toFixed(1)}k</span>
                      </div>
                      <div className="company-meta clean-meta">
                        <span>{item.conversionRate.toFixed(1)}% conversion</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Detailed Company Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <span style={{ fontWeight: 600 }}>Detailed Company Performance</span>
              </Space>
            }
            className="company-performance-card"
          >
            <Table
              dataSource={metrics.companyAnalytics || []}
              rowKey="company"
              pagination={{ pageSize: 5 }}
              bordered={false}
              className="company-performance-table"
              columns={[
                {
                  title: "Company",
                  dataIndex: "company",
                  key: "company",
                  render: (text) => (
                    <Space>
                      <Avatar
                        size={36}
                        className="company-avatar"
                      >
                        {text.charAt(0)}
                      </Avatar>
                      <span className="company-name">{text}</span>
                    </Space>
                  ),
                },
                {
                  title: "Leads",
                  dataIndex: "leads",
                  key: "leads",
                  align: "center",
                  sorter: (a, b) => a.leads - b.leads,
                  render: (value) => <div className="metric-pill">{value}</div>,
                },
                {
                  title: "Converted",
                  dataIndex: "converted",
                  key: "converted",
                  align: "center",
                  sorter: (a, b) => a.converted - b.converted,
                  render: (value) => <div className="metric-pill secondary">{value}</div>,
                },
                {
                  title: "Conversion Rate",
                  dataIndex: "conversionRate",
                  key: "conversionRate",
                  align: "center",
                  sorter: (a, b) => a.conversionRate - b.conversionRate,
                  render: (value) => (
                    <div style={{ minWidth: 100 }}>
                      <Progress
                        percent={Math.round(value)}
                        size="small"
                        strokeColor={
                          value > 50
                            ? "var(--success)"
                            : value > 25
                              ? "var(--primary)"
                              : "var(--danger)"
                        }
                        showInfo={false}
                        style={{ marginBottom: 4 }}
                      />
                      <span className="metric-subtext">{Math.round(value)}%</span>
                    </div>
                  ),
                },
                {
                  title: "Total Value",
                  dataIndex: "value",
                  key: "value",
                  align: "right",
                  sorter: (a, b) => a.value - b.value,
                  render: (value) => (
                    <span className="value-text">
                      ₹{value.toLocaleString()}
                    </span>
                  ),
                },
                {
                  title: "Agents",
                  dataIndex: "agentCount",
                  key: "agentCount",
                  align: "center",
                  sorter: (a, b) => a.agentCount - b.agentCount,
                  render: (count) => (
                    <div className="agent-badge">{count}</div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Global Filter Drawer */}
      <Drawer
        title={
          <Space>
            <FilterOutlined />
            <span>Global Filters</span>
          </Space>
        }
        placement='right'
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        width={400}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              danger
              onClick={resetFilters}
              style={{ borderRadius: "10px" }}
            >
              Clear All
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout='vertical'
          onValuesChange={applyGlobalFilters}
          initialValues={{
            assigned: "all",
            source: "all",
            status: "all",
            timeFilter: "30",
          }}
        >
          <Form.Item name='dateRange' label='Created Date Range'>
            <RangePicker
              style={{ width: "100%" }}
              onChange={dates => {
                if (dates && dates.length === 2) {
                  setDateRange([dates[0].toDate(), dates[1].toDate()]);
                  setTimeFilter("all");
                  form.setFieldsValue({ timeFilter: "all" });
                } else {
                  setDateRange(null);
                }
              }}
            />
          </Form.Item>

          <Form.Item name='timeFilter' label='Time Period'>
            <Select>
              <Option value='7'>Last 7 days</Option>
              <Option value='30'>Last 30 days</Option>
              <Option value='90'>Last 90 days</Option>
              <Option value='all'>All time</Option>
            </Select>
          </Form.Item>

          <Form.Item name='assigned' label='Assigned To'>
            <Select showSearch allowClear>
              <Option value='all'>All Agents</Option>
              {assignedOptions.map(option => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name='source' label='Lead Source'>
            <Select showSearch allowClear>
              <Option value='all'>All Sources</Option>
              {sourceOptions.map(option => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name='status' label='Lead Status'>
            <Select showSearch allowClear>
              <Option value='all'>All Status</Option>
              {statusOptions.map(option => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>

      <style>{`
        .hoverable-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Overview;
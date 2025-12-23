import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Space,
  Button,
  Progress,
  Table,
  Avatar,
  Badge,
  Tag,
  Drawer,
  Form,
  Select,
  Modal,
} from "antd";
import {
  TeamOutlined,
  FilterOutlined,
  FunnelPlotOutlined,
  BarChartOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const { Option } = Select;

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

const mockMetrics = {
  employeePerformance: [
    { employee: "John Doe", leads: 42, converted: 15, conversionRate: 35.7, value: 850000, newLead: 12, hot: 8, warm: 10, cold: 7, converted: 15 },
    { employee: "Jane Smith", leads: 38, converted: 12, conversionRate: 31.6, value: 720000, newLead: 10, hot: 6, warm: 9, cold: 8, converted: 12 },
    { employee: "Robert Johnson", leads: 29, converted: 9, conversionRate: 31.0, value: 650000, newLead: 8, hot: 5, warm: 7, cold: 6, converted: 9 },
    { employee: "Emily Davis", leads: 25, converted: 7, conversionRate: 28.0, value: 580000, newLead: 7, hot: 4, warm: 6, cold: 5, converted: 7 }
  ],
  sourcePerformance: [
    { source: "Website", leads: 45, converted: 15, conversionRate: 33.3 },
    { source: "Referral", leads: 32, converted: 12, conversionRate: 37.5 },
    { source: "Social Media", leads: 28, converted: 8, conversionRate: 28.6 },
    { source: "Email", leads: 20, converted: 6, conversionRate: 30.0 },
    { source: "Events", leads: 13, converted: 4, conversionRate: 30.8 }
  ],
  companyAnalytics: [
    { company: "Askeva", leads: 18, converted: 8, conversionRate: 44.4, value: 420000, agentCount: 3, sourceCount: 4, avgValue: 52500, assignedAgents: ["John Doe", "Jane Smith"] },
    { company: "Tunepath", leads: 15, converted: 6, conversionRate: 40.0, value: 380000, agentCount: 2, sourceCount: 3, avgValue: 63333, assignedAgents: ["Robert Johnson"] },
    { company: "Engagenest", leads: 12, converted: 5, conversionRate: 41.7, value: 310000, agentCount: 3, sourceCount: 2, avgValue: 62000, assignedAgents: ["John Doe", "Emily Davis"] },
    { company: "Eram", leads: 10, converted: 4, conversionRate: 40.0, value: 280000, agentCount: 2, sourceCount: 3, avgValue: 70000, assignedAgents: ["Jane Smith"] },
    { company: "Creepy", leads: 8, converted: 3, conversionRate: 37.5, value: 220000, agentCount: 1, sourceCount: 2, avgValue: 73333, assignedAgents: ["Robert Johnson"] }
  ],
};

const Performance = () => {
  const metrics = mockMetrics;
  const [performanceFilterDrawerVisible, setPerformanceFilterDrawerVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDrawerVisible, setEmployeeDrawerVisible] = useState(false);
  const [performanceForm] = Form.useForm();

  const resetPerformanceFilters = () => {
    performanceForm.setFieldsValue({
      performanceTimeFilter: "30",
      performanceAssigned: "all",
      performanceSource: "all",
      performanceStatus: "all",
    });
    performanceForm.resetFields();
  };

  const applyPerformanceFilters = (changedValues) => {
    // Handle filter changes here
    console.log("Filters changed:", changedValues);
  };

  return (
    <div className="performance-tab">
      {/* Performance Filter Controls */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <Button
          className="btn-primary"
          
          icon={<FilterOutlined />}
          onClick={() => setPerformanceFilterDrawerVisible(true)}
          style={{ borderRadius: "8px" }}
        >
          Filters
        </Button>
      </div>

      {/* Agents Performance Table */}
      <Card className="company-performance-card"
        title={
          <Space>
            <TeamOutlined />
            <span>Agents Performance</span>
          </Space>
        }
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Table className="company-performance-table"
          dataSource={metrics.employeePerformance}
          rowKey='employee'
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          columns={[
            {
              title: "Agents",
              dataIndex: "employee",
              key: "employee",
              render: text => (
                <Space>
                  <Avatar>{text.charAt(0)}</Avatar>
                  <span style={{ fontWeight: 500 }}>{text}</span>
                </Space>
              ),
            },
            {
              title: "Leads",
              dataIndex: "leads",
              key: "leads",
              sorter: (a, b) => a.leads - b.leads,
              render: value => (
                <Badge
                  count={value}
                  style={{ backgroundColor: colorShades.primary }}
                />
              ),
            },
            {
              title: "Conversion Rate",
              dataIndex: "conversionRate",
              key: "conversionRate",
              sorter: (a, b) => a.conversionRate - b.conversionRate,
              render: value => (
                <Progress
                  percent={Math.round(value)}
                  size='small'
                  strokeColor={
                    value > 60
                      ? colorShades.dark1
                      : value > 20
                        ? colorShades.primary
                        : "#ff4d4f"
                  }
                  format={percent => `${percent}%`}
                />
              ),
            },
            {
              title: "Total Value",
              dataIndex: "value",
              key: "value",
              sorter: (a, b) => a.value - b.value,
              render: value => `₹ ${value.toLocaleString()}`,
            },
            {
              title: "New - Hot - Warm - Cold - Converted",
              key: "status",
              render: (_, record) => (
                <Space size='small'>
                  <Tag color='blue' style={{ borderRadius: "7px" }}>
                    {record.newLead} New
                  </Tag>
                  <Tag color='red' style={{ borderRadius: "7px" }}>
                    {record.hot} Hot
                  </Tag>
                  <Tag color='gold' style={{ borderRadius: "7px" }}>
                    {record.warm} Warm
                  </Tag>
                  <Tag color='blue' style={{ borderRadius: "7px" }}>
                    {record.cold} Cold
                  </Tag>
                  <Tag color='purple' style={{ borderRadius: "7px" }}>
                    {record.converted} Converted
                  </Tag>
                </Space>
              ),
            },
            {
              title: "Actions",
              key: "actions",
              fixed: "right",
              width: 100,
              render: (_, record) => (
                <Button
                  type='link'
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedEmployee(record.employee);
                    setEmployeeDrawerVisible(true);
                  }}
                >
                  View Details
                </Button>
              ),
            },
          ]}
        />
      </Card>

      {/* Bottom Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Source Performance - Radar Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FunnelPlotOutlined />
                <span>Source Performance</span>
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart
                outerRadius={120}
                data={metrics.sourcePerformance}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="source" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Conversion Rate"
                  dataKey="conversionRate"
                  stroke={colorShades.primary}
                  fill={colorShades.primary}
                  fillOpacity={0.6}
                />
                <Legend />
                <RechartsTooltip
                  formatter={(value) => `${value.toFixed(1)}%`}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Company Analysis - Enhanced Dual Metric Bar Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <span>Company Analysis</span>
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={metrics.companyAnalytics.slice(0, 10)}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colorShades.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={colorShades.primary} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="company"
                  angle={-45}
                  textAnchor="end"
                  height={90}
                  interval={0}
                />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Total Value"
                  fill="url(#colorValue)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="conversionRate"
                  name="Conversion Rate (%)"
                  fill={colorShades.light3}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Performance Filter Drawer */}
      <Drawer
        title={
          <Space>
            <FilterOutlined />
            <span>Performance Filters</span>
          </Space>
        }
        placement='right'
        onClose={() => setPerformanceFilterDrawerVisible(false)}
        open={performanceFilterDrawerVisible}
        width={400}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              style={{
                borderColor: "red",
                color: "red",
                borderRadius: "8px",
              }}
              onClick={resetPerformanceFilters}
            >
              Clear All
            </Button>
          </div>
        }
      >
        <Form
          form={performanceForm}
          layout='vertical'
          onValuesChange={applyPerformanceFilters}
          initialValues={{
            performanceAssigned: "all",
            performanceSource: "all",
            performanceStatus: "all",
            performanceTimeFilter: "30",
          }}
        >
          <Form.Item name='performanceTimeFilter' label='Time Period'>
            <Select style={{ borderRadius: "8px" }}>
              <Option value='7'>Last 7 days</Option>
              <Option value='30'>Last 30 days</Option>
              <Option value='90'>Last 90 days</Option>
              <Option value='all'>All time</Option>
            </Select>
          </Form.Item>

          <Form.Item name='performanceAssigned' label='Assigned To'>
            <Select style={{ borderRadius: "8px" }} showSearch allowClear>
              <Option value='all'>All Agents</Option>
              <Option value="john.doe@example.com">John Doe</Option>
              <Option value="jane.smith@example.com">Jane Smith</Option>
              <Option value="robert.johnson@example.com">Robert Johnson</Option>
            </Select>
          </Form.Item>

          <Form.Item name='performanceSource' label='Lead Source'>
            <Select style={{ borderRadius: "8px" }} showSearch allowClear>
              <Option value='all'>All Sources</Option>
              <Option value="Website">Website</Option>
              <Option value="Referral">Referral</Option>
              <Option value="Social Media">Social Media</Option>
              <Option value="Email">Email</Option>
            </Select>
          </Form.Item>

          <Form.Item name='performanceStatus' label='Lead Status'>
            <Select style={{ borderRadius: "8px" }} showSearch allowClear>
              <Option value='all'>All Status</Option>
              <Option value="New Lead">New Lead</Option>
              <Option value="Hot">Hot</Option>
              <Option value="Warm">Warm</Option>
              <Option value="Cold">Cold</Option>
              <Option value="Converted">Converted</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Employee Details Drawer */}
      <Modal
        open={employeeDrawerVisible}
        onCancel={() => setEmployeeDrawerVisible(false)}
        footer={null}
        centered
        width={850}
        className="performance-modal modern-modal"
      >
        {selectedEmployee && (
          <>
            {metrics.employeePerformance
              .filter(emp => emp.employee === selectedEmployee)
              .map((employee, index) => (
                <div key={index} className="employee-performance-modern">

                  {/* Header */}
                  <div className="modal-header-modern">
                    <Avatar size={72} className="employee-avatar-modern">
                      {employee.employee.charAt(0)}
                    </Avatar>
                    <div className="employee-header-text">
                      <h2>{employee.employee}</h2>
                      <p>Performance Overview</p>
                    </div>
                  </div>

                  {/* One-row Stats */}
                  <div className="stats-row-modern">
                    <div className="stat-card-modern">
                      <TeamOutlined className="icon team" />
                      <h4>Total Leads</h4>
                      <h3>{employee.leads}</h3>
                    </div>
                    <div className="stat-card-modern">
                      <CheckCircleOutlined className="icon success" />
                      <h4>Converted Leads</h4>
                      <h3>{employee.converted}</h3>
                    </div>
                    <div className="stat-card-modern">
                      <RiseOutlined className="icon rate" />
                      <h4>Conversion Rate</h4>
                      <h3>{employee.conversionRate.toFixed(1)}%</h3>
                    </div>
                    <div className="stat-card-modern">
                      <DollarOutlined className="icon value" />
                      <h4>Total Value</h4>
                      <h3 className="highlight">₹ {employee.value.toLocaleString()}</h3>
                    </div>
                  </div>

                  <div className="divider-modern" />
                </div>
              ))}
          </>
        )}
      </Modal>
    </div>
  );
};

export default Performance;
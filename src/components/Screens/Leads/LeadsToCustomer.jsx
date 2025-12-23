import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Typography,
  Card,
  Tabs,
  Modal,
  Form,
  DatePicker,
  Descriptions,
  Divider,
  Row,
  Col,
  Statistic,
  message,
  Spin,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  CheckOutlined,
  EditOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  TagOutlined,
  TeamOutlined,
  BuildOutlined,
  ReloadOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import MasterLayout from "../../../masterLayout/MasterLayout";
import Breadcrumb from "../../Breadcrumb";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const LeadsToCustomer = () => {
  // Static data for converted leads (customers)
  const staticCustomers = [
    {
      id: "1",
      name: "John Smith",
      company: "TechCorp Inc",
      email: "john.smith@techcorp.com",
      mobile: "9876543210",
      fullMobile: "919876543210",
      countryCode: "91",
      conversionDate: "2024-01-15T10:30:00Z",
      source: "Website",
      status: "Converted",
      isConverted: true,
      assigned: "Sarah Johnson"
    },
    {
      id: "2",
      name: "Emma Wilson",
      company: "Global Solutions",
      email: "emma@globalsolutions.com",
      mobile: "8765432109",
      fullMobile: "918765432109",
      countryCode: "91",
      conversionDate: "2024-01-18T14:45:00Z",
      source: "Referral",
      status: "Converted",
      isConverted: true,
      assigned: "Mike Chen"
    },
    {
      id: "3",
      name: "Robert Brown",
      company: "TechCorp Inc",
      email: "robert.b@techcorp.com",
      mobile: "7654321098",
      fullMobile: "917654321098",
      countryCode: "91",
      conversionDate: "2024-01-20T11:15:00Z",
      source: "Trade Show",
      status: "Converted",
      isConverted: true,
      assigned: "Sarah Johnson"
    },
    {
      id: "4",
      name: "Lisa Anderson",
      company: "Innovate Ltd",
      email: "lisa@innovate.com",
      mobile: "6543210987",
      fullMobile: "916543210987",
      countryCode: "91",
      conversionDate: "2024-01-22T09:30:00Z",
      source: "Website",
      status: "Converted",
      isConverted: true,
      assigned: "David Miller"
    },
    {
      id: "5",
      name: "Michael Lee",
      company: "Global Solutions",
      email: "michael.lee@globalsolutions.com",
      mobile: "5432109876",
      fullMobile: "915432109876",
      countryCode: "91",
      conversionDate: "2024-01-25T16:20:00Z",
      source: "Email Campaign",
      status: "Converted",
      isConverted: true,
      assigned: "Mike Chen"
    },
    {
      id: "6",
      name: "Sarah Davis",
      company: "",
      email: "sarah.davis@email.com",
      mobile: "4321098765",
      fullMobile: "914321098765",
      countryCode: "91",
      conversionDate: "2024-01-28T13:10:00Z",
      source: "Social Media",
      status: "Converted",
      isConverted: true,
      assigned: "Sarah Johnson"
    },
    {
      id: "7",
      name: "James Wilson",
      company: "Digital First",
      email: "james@digitalfirst.com",
      mobile: "3210987654",
      fullMobile: "913210987654",
      countryCode: "91",
      conversionDate: "2024-01-30T15:45:00Z",
      source: "Website",
      status: "Converted",
      isConverted: true,
      assigned: "David Miller"
    },
    {
      id: "8",
      name: "Patricia Taylor",
      company: "TechCorp Inc",
      email: "patricia@techcorp.com",
      mobile: "2109876543",
      fullMobile: "912109876543",
      countryCode: "91",
      conversionDate: "2024-02-01T10:00:00Z",
      source: "Referral",
      status: "Converted",
      isConverted: true,
      assigned: "Sarah Johnson"
    }
  ];

  // Static data for tickets
  const staticTickets = [
    {
      _id: "t1",
      ticketId: "TKT-001",
      customerName: "John Smith",
      department_field: "Technical Support",
      status: "In Progress",
      priority: "High",
      createdDate: "2024-01-20T14:30:00Z",
      assignedTo: "Support Team",
      mobileNumber: "9876543210"
    },
    {
      _id: "t2",
      ticketId: "TKT-002",
      customerName: "Emma Wilson",
      department_field: "Billing",
      status: "Resolved",
      priority: "Medium",
      createdDate: "2024-01-25T10:15:00Z",
      assignedTo: "Billing Department",
      mobileNumber: "8765432109"
    },
    {
      _id: "t3",
      ticketId: "TKT-003",
      customerName: "John Smith",
      department_field: "Sales",
      status: "Completed",
      priority: "Low",
      createdDate: "2024-01-30T11:45:00Z",
      assignedTo: "Sales Team",
      mobileNumber: "9876543210"
    }
  ];

  // Static data for appointments
  const staticAppointments = [
    {
      id: "a1",
      appointmentNo: "APT-001",
      name: "John Smith",
      department: "Sales",
      status: "completed",
      appointmentDate: "2024-01-25T14:00:00Z",
      timing: "02:00 PM - 03:00 PM",
      manager: "Sales Manager",
      payment: "prepaid",
      mobile: "9876543210"
    },
    {
      id: "a2",
      appointmentNo: "APT-002",
      name: "Emma Wilson",
      department: "Technical",
      status: "current",
      appointmentDate: "2024-02-05T11:30:00Z",
      timing: "11:30 AM - 12:30 PM",
      manager: "Tech Lead",
      payment: "pending",
      mobile: "8765432109"
    },
    {
      id: "a3",
      appointmentNo: "APT-003",
      name: "Robert Brown",
      department: "Consultation",
      status: "cancelled",
      appointmentDate: "2024-01-22T16:00:00Z",
      timing: "04:00 PM - 04:45 PM",
      manager: "Consultant",
      payment: "prepaid",
      mobile: "7654321098"
    }
  ];

  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCustomerDetailModalVisible, setIsCustomerDetailModalVisible] =
    useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [currentView, setCurrentView] = useState("companies"); // 'companies' or 'companyCustomers'
  const [selectedCompanyForTable, setSelectedCompanyForTable] = useState("");
  const [form] = Form.useForm();
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API loading
    setIsLoading(true);
    setTimeout(() => {
      setCustomers(staticCustomers);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCustomers([...staticCustomers]);
      setIsLoading(false);
      message.success("Data refreshed successfully");
    }, 500);
  };

  // Get company statistics
  const getCompanyStats = () => {
    const companyStats = {};
    customers.forEach(customer => {
      const company = customer.company || "No Company";
      if (!companyStats[company]) {
        companyStats[company] = {
          name: company,
          count: 0,
          recentConversions: 0,
        };
      }
      companyStats[company].count++;

      // Count recent conversions (last 30 days)
      if (customer.conversionDate) {
        const conversionDate = moment(customer.conversionDate);
        const thirtyDaysAgo = moment().subtract(30, "days");
        if (conversionDate.isAfter(thirtyDaysAgo)) {
          companyStats[company].recentConversions++;
        }
      }
    });

    return Object.values(companyStats).sort((a, b) => b.count - a.count);
  };

  // Get unique companies for filter dropdown
  const companyOptions = [
    ...new Set(customers.map(customer => customer.company).filter(Boolean)),
  ];

  const filteredCustomers = customers.filter(customer => {
    // Search term filter
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Company filter
    const matchesCompany =
      selectedCompanyForTable === "NO_COMPANY"
        ? !customer.company ||
        (typeof customer.company === "string" &&
          customer.company.trim() === "")
        : selectedCompanyForTable
          ? customer.company === selectedCompanyForTable
          : true;

    let matchesDateRange = true;

    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0];
      const endDate = dateRange[1];

      const customerDate = moment(customer.conversionDate);
      const customerDateStr = customerDate.format("YYYY-MM-DD");
      const startDateStr = startDate.format("YYYY-MM-DD");
      const endDateStr = endDate.format("YYYY-MM-DD");

      matchesDateRange =
        customerDateStr >= startDateStr && customerDateStr <= endDateStr;
    }

    return matchesSearch && matchesCompany && matchesDateRange;
  });

  const companyStats = getCompanyStats();

  // Filter companies based on search term
  const filteredCompanyStats = companyStats.filter(company =>
    company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
  );

  const getCustomerTickets = () => {
    if (!selectedCustomer || !staticTickets) return [];

    const customerMobile = selectedCustomer.mobile;
    return staticTickets.filter(ticket =>
      ticket.mobileNumber === customerMobile
    );
  };

  const getCustomerAppointments = () => {
    if (!selectedCustomer || !staticAppointments) return [];

    const customerMobile = selectedCustomer.mobile;
    return staticAppointments.filter(appointment =>
      appointment.mobile === customerMobile
    );
  };

  const handleCompanyRowClick = companyName => {
    if (companyName === "No Company") {
      setSelectedCompanyForTable("NO_COMPANY");
    } else {
      setSelectedCompanyForTable(companyName);
    }
    setCurrentView("companyCustomers");
  };

  const handleBackToCompanies = () => {
    setCurrentView("companies");
    setSelectedCompanyForTable("");
    setSearchTerm("");
    setDateRange([]);
    setCompanySearchTerm("");
  };

  const handleAddCustomer = () => {
    message.info(
      "To add customers, please convert leads from the Leads section"
    );
  };

  const handleEditCustomer = record => {
    message.info("Customer editing is managed through the Leads section");
  };

  const handleCustomerClick = record => {
    console.log("Customer clicked:", record);
    console.log("Setting modal to visible");
    setSelectedCustomer(record);
    setIsCustomerDetailModalVisible(true);

    // Simulate loading for appointments and tickets
    setAppointmentLoading(true);
    setTicketLoading(true);

    setTimeout(() => {
      setAppointmentLoading(false);
      setTicketLoading(false);
    }, 500);
  };

  const handleBackToCustomers = () => {
    setIsCustomerDetailModalVisible(false);
    setSelectedCustomer(null);
  };

  const handleDateRangeChange = (dates, dateStrings) => {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      const newStartDate = dates[0].clone();
      const newEndDate = dates[1].clone();
      setDateRange([newStartDate, newEndDate]);
    } else {
      setDateRange([]);
    }
  };

  const resetDateFilter = () => {
    setDateRange([]);
  };

  // Function to determine content header props based on current view
  const getContentHeaderProps = () => {
    if (currentView === "companies") {
      return {
        currentPage: "Customers", // main menu
      };
    }

    if (currentView === "companyCustomers") {
      return {
        currentPage: `${selectedCompanyForTable || "NO_COMPANY__"} > Customers`,
        onPreviousPageClick: handleBackToCompanies,
      };
    }

    return { currentPage: "Customers" };
  };

  const companyColumns = [
    {
      title: "Company Name",
      dataIndex: "name",
      key: "name",
      render: text => (
        <span style={{ fontWeight: "500", fontSize: "14px" }}>{text}</span>
      ),
    },
    {
      title: "Total Customers",
      dataIndex: "count",
      key: "count",
      sorter: (a, b) => a.count - b.count,
      render: count => (
        <div className="metric-pill">
          {count} customers
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type='link'
          onClick={() => handleCompanyRowClick(record.name)}
        >
          View Customers
        </Button>
      ),
    },
  ];


  const columns = [
    {
      title: "S.No",
      key: "serial",
      render: (text, record, index) => index + 1,
      width: 9,
      align: "left",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 120,
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      width: 180,
      render: text => (
        <span style={{ fontWeight: "500", fontSize: "14px" }}>{text}</span>
      ),
    },
    {
      title: "Mobile",
      dataIndex: "fullMobile",
      key: "mobile",
      render: (mobile, record) => <div>{`+${record.fullMobile} `}</div>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 150,
    },
    {
      title: "Conversion Date",
      dataIndex: "conversionDate",
      key: "conversionDate",
      width: 180,
      render: date => (date ? moment(date).format("YYYY-MM-DD HH:mmA") : "-"),
    },
    {
      title: "Original Source",
      dataIndex: "source",
      key: "source",
      width: 150,
      render: source => source || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 20,
      render: status => (
        <Tooltip title='Converted'>
          <Tag
            color='green'
            style={{ borderRadius: "6px" }}
            icon={<CheckOutlined />}
          />
        </Tooltip>
      ),
    },
  ];

  const ticketColumns = [
    {
      title: "Ticket ID",
      dataIndex: "ticketId",
      key: "ticketId",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Department",
      dataIndex: "department_field",
      key: "department_field",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: status => {
        let color = "var(--primary-color)";
        if (status === "Created") color = "var(--primary-color)";
        if (status === "In Progress") color = "var(--primary-color)";
        if (status === "Resolved" || status === "Completed")
          color = "var(--primary-color)";
        if (status === "Closed") color = "var(--primary-color)";
        return (
          <Tag
            color={color}
            style={{
              border: "none",
              background: "transparent",
              color: color,
              padding: 0,
              fontWeight: 600,
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: priority => {
        let color = "default";
        const priorityUpper = priority?.toUpperCase();
        if (priorityUpper === "HIGH") color = "red";
        if (priorityUpper === "MEDIUM") color = "orange";
        if (priorityUpper === "LOW") color = "green";
        return (
          <Tag
            color={color}
            style={{
              border: "none",
              background: "transparent",
              color: color,
              padding: 0,
              fontWeight: 600,
            }}
          >
            {priority}
          </Tag>
        );
      },
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: date => moment(date).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
    },
  ];

  const appointmentColumns = [
    {
      title: "Appointment No",
      dataIndex: "appointmentNo",
      key: "appointmentNo",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: status => {
        let color = "var(--primary-color)";
        if (status === "current") color = "var(--primary-color)";
        if (status === "completed") color = "var(--primary-color)";
        if (status === "cancelled") color = "var(--primary-color)";
        return (
          <Tag
            color={color}
            style={{
              border: "none",
              background: "transparent",
              color: color,
              padding: 0,
              fontWeight: 600,
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Appointment Date",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: date => moment(date).format("YYYY-MM-DD"),
    },
    {
      title: "Timing",
      dataIndex: "timing",
      key: "timing",
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
    },
    {
      title: "Payment",
      dataIndex: "payment",
      key: "payment",
      render: payment => (
        <Tag color={payment === "prepaid" ? "green" : "orange"}>{payment}</Tag>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div
        style={{
          padding: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Breadcrumb title={getContentHeaderProps().currentPage}
        onPreviousPageClick={getContentHeaderProps().onPreviousPageClick} />
      <Card bodyStyle={{ overflowX: "auto" }}>
        {currentView === "companies" ? (
          // Companies Table View
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Input
                placeholder='Search companies'
                allowClear
                prefix={<SearchOutlined />}
                onChange={e => setCompanySearchTerm(e.target.value)}
                style={{ width: 250, borderRadius: 8 }}
                value={companySearchTerm}
              />

              <Button
                style={{
                  borderRadius: "8px",
                  backgroundColor: "var(--primary)",
                  color: "white",
                }}
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
            </div>

            <Table className="leads-performance-table"
              columns={companyColumns}
              dataSource={filteredCompanyStats}
              rowKey='name'
              onRow={record => {
                return {
                  onClick: () => handleCompanyRowClick(record.name),
                  style: { cursor: "pointer" },
                };
              }}
              pagination={{
                className: "custom-pagination",
                pageSizeOptions: ["10", "20", "50", "100"],
                showSizeChanger: true,
              }}
            />
          </div>
        ) : (
          // Customer Table View
          <Tabs
            defaultActiveKey='customers'
            tabBarExtraContent={{
              left: (
                <Button
                  type='link'
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToCompanies}
                  style={{ padding: 0, height: "auto", marginRight: 16 }}
                />
              ),
            }}
          >

            <TabPane tab={
              <span style={{ fontSize: "16px", fontWeight: "600" }}>
                <UserAddOutlined /> Customers
              </span>
            } key='Customers'>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "end",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: 16,
                }}
              >
                <Space>
                  <Input
                    placeholder='Search customers'
                    prefix={<SearchOutlined />}
                    onChange={e => setSearchTerm(e.target.value)}
                    allowClear
                    style={{ width: 200, borderRadius: 8 }}
                    value={searchTerm}
                  />
                  <RangePicker
                    onChange={handleDateRangeChange}
                    value={dateRange}
                    style={{ width: 250, borderRadius: 8 }}
                    placeholder={["Start Date", "End Date"]}
                  />
                  <Popconfirm
                    title='Are you sure you want to export this data?'
                    okText='Yes, Export'
                    cancelText='Cancel'
                    onConfirm={() => {
                      const csvContent =
                        "data:text/csv;charset=utf-8," +
                        "Name,Company,Email,Mobile,Conversion Date,Source,Status\n" +
                        filteredCustomers
                          .map(
                            customer =>
                              `"${customer.name || ""}","${customer.company || ""}",` +
                              `"${customer.email || ""}","${customer.mobile || ""}",` +
                              `"${customer.conversionDate || ""}","${customer.source || ""}","Converted"`
                          )
                          .join("\n");

                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute(
                        "download",
                        `${selectedCompanyForTable || "no_company"}_customers_export.csv`
                      );

                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Button
                      icon={<DownloadOutlined />}
                      style={{
                        borderRadius: "8px",
                        backgroundColor: "var(--primary)",
                        color: "white",
                      }}
                    >
                      Export
                    </Button>
                  </Popconfirm>

                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    style={{
                      borderRadius: "8px",
                      backgroundColor: "var(--primary)",
                      color: "white",
                    }}
                  >
                    Refresh
                  </Button>
                </Space>
              </div>

              <Table className="leads-performance-table"
                columns={columns}
                dataSource={filteredCustomers}
                rowKey='id'
                bordered
                onRow={(record) => ({
                  onClick: () => handleCustomerClick(record),
                  style: {
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  },
                })}
                pagination={{
                  className: "custom-pagination",
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showSizeChanger: true,
                }}
              />
            </TabPane>
          </Tabs>
        )}
      </Card>

      <Modal
        title={
          <h5 level={5} style={{ margin: 0, fontSize: "18px" }}>
              Customer Details
            </h5>
        }
        open={isCustomerDetailModalVisible}
        onCancel={handleBackToCustomers}
        footer={null}
        width={1000}
        style={{ zIndex: 1000 }} // Add this
        maskClosable={false}
      >
        {selectedCustomer && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label='Name'>
                {selectedCustomer.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label='Company'>
                {selectedCustomer.company || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label='Email'>
                {selectedCustomer.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label='Mobile'>
                {selectedCustomer.countryCode &&
                  `+${selectedCustomer.countryCode} `}
                {selectedCustomer.mobile || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label='Conversion Date' span={1}>
                {selectedCustomer.conversionDate
                  ? moment(selectedCustomer.conversionDate).format(
                    "YYYY-MM-DD HH:mmA"
                  )
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label='Lead Closed By'>
                {selectedCustomer.assigned || "-"}
              </Descriptions.Item>

              <Descriptions.Item label='Source'>
                {selectedCustomer.source || "-"}
              </Descriptions.Item>

              <Descriptions.Item label='Status'>
                <Tag color='green' icon={<CheckOutlined />}>
                  Converted
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Tabs defaultActiveKey='ticketing'>
              <TabPane
                tab={
                  <span className="lead-details-modal">
                    <TagOutlined style={{ marginRight: 6 }} />
                    Ticketing
                    {!ticketLoading && ` (${getCustomerTickets().length})`}
                  </span>
                }
                key='ticketing'
              >
                {ticketLoading ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spin tip='Loading tickets...' />
                  </div>
                ) : (
                  <Table className="leads-performance-table"
                    columns={ticketColumns}
                    dataSource={getCustomerTickets()}
                    rowKey='_id'
                    pagination={{ className: "custom-pagination", pageSize: 5 }}
                    size='small'
                    locale={{
                      emptyText: "No tickets found for this customer",
                    }}
                  />
                )}
              </TabPane>
              <TabPane
                tab={
                  <span className="lead-details-modal">
                    <CalendarOutlined style={{ marginRight: 6 }} />
                    Appointments
                    {!appointmentLoading &&
                      ` (${getCustomerAppointments().length})`}
                  </span>
                }
                key='appointments'
              >
                {appointmentLoading ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spin tip='Loading appointments...' />
                  </div>
                ) : (
                  <Table className="leads-performance-table"
                    columns={appointmentColumns}
                    dataSource={getCustomerAppointments()}
                    rowKey='id'
                    pagination={{ className: "custom-pagination", pageSize: 5 }}
                    size='small'
                    locale={{
                      emptyText: "No appointments found for this customer",
                    }}
                  />
                )}
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeadsToCustomer;
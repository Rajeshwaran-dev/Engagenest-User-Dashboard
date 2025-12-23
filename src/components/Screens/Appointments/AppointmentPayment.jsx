import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Tag,
  Space,
  Typography,
  Input,
  Button,
  Spin,
  Alert,
} from "antd";
import {
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import Breadcrumb from "../../Breadcrumb";
import MasterLayout from "../../../masterLayout/MasterLayout";
const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Static transaction data
const staticTransactions = [
  {
    _id: "1",
    type: "appointment",
    orderId: "ORD-2024-001",
    recipientId: "9876543210",
    transactionId: "TXN-001",
    method: "upi",
    amount: 1500,
    createdAt: 1704067200, // Jan 1, 2024
    status: "success"
  },
  {
    _id: "2",
    type: "appointment",
    orderId: "ORD-2024-002",
    recipientId: "9876543211",
    transactionId: "TXN-002",
    method: "card",
    amount: 2500,
    createdAt: 1704153600, // Jan 2, 2024
    status: "success"
  },
  {
    _id: "3",
    type: "appointment",
    orderId: "ORD-2024-003",
    recipientId: "9876543212",
    transactionId: "TXN-003",
    method: "netbanking",
    amount: 1800,
    createdAt: 1704240000, // Jan 3, 2024
    status: "pending"
  },
  {
    _id: "4",
    type: "appointment",
    orderId: "ORD-2024-004",
    recipientId: "9876543213",
    transactionId: "TXN-004",
    method: "upi",
    amount: 3200,
    createdAt: 1704326400, // Jan 4, 2024
    status: "failed"
  },
  {
    _id: "5",
    type: "appointment",
    orderId: "ORD-2024-005",
    recipientId: "9876543214",
    transactionId: "TXN-005",
    method: "cash",
    amount: 1200,
    createdAt: 1704412800, // Jan 5, 2024
    status: "success"
  },
  {
    _id: "6",
    type: "appointment",
    orderId: "ORD-2024-006",
    recipientId: "9876543215",
    transactionId: "TXN-006",
    method: "card",
    amount: 2800,
    createdAt: 1704499200, // Jan 6, 2024
    status: "pending"
  },
  {
    _id: "7",
    type: "appointment",
    orderId: "ORD-2024-007",
    recipientId: "9876543216",
    transactionId: "TXN-007",
    method: "upi",
    amount: 2200,
    createdAt: 1704585600, // Jan 7, 2024
    status: "success"
  },
  {
    _id: "8",
    type: "appointment",
    orderId: "ORD-2024-008",
    recipientId: "9876543217",
    transactionId: "TXN-008",
    method: "netbanking",
    amount: 1900,
    createdAt: 1704672000, // Jan 8, 2024
    status: "success"
  },
  {
    _id: "9",
    type: "appointment",
    orderId: "ORD-2024-009",
    recipientId: "9876543218",
    transactionId: "TXN-009",
    method: "card",
    amount: 3100,
    createdAt: 1704758400, // Jan 9, 2024
    status: "failed"
  },
  {
    _id: "10",
    type: "appointment",
    orderId: "ORD-2024-010",
    recipientId: "9876543219",
    transactionId: "TXN-010",
    method: "upi",
    amount: 1700,
    createdAt: 1704844800, // Jan 10, 2024
    status: "success"
  },
  {
    _id: "11",
    type: "appointment",
    orderId: "ORD-2024-011",
    recipientId: "9876543220",
    transactionId: "TXN-011",
    method: "cash",
    amount: 1400,
    createdAt: 1704931200, // Jan 11, 2024
    status: "pending"
  },
  {
    _id: "12",
    type: "appointment",
    orderId: "ORD-2024-012",
    recipientId: "9876543221",
    transactionId: "TXN-012",
    method: "card",
    amount: 2600,
    createdAt: 1705017600, // Jan 12, 2024
    status: "success"
  },
  {
    _id: "13",
    type: "appointment",
    orderId: "ORD-2024-013",
    recipientId: "9876543222",
    transactionId: "TXN-013",
    method: "upi",
    amount: 2300,
    createdAt: 1705104000, // Jan 13, 2024
    status: "success"
  },
  {
    _id: "14",
    type: "appointment",
    orderId: "ORD-2024-014",
    recipientId: "9876543223",
    transactionId: "TXN-014",
    method: "netbanking",
    amount: 2100,
    createdAt: 1705190400, // Jan 14, 2024
    status: "pending"
  },
  {
    _id: "15",
    type: "appointment",
    orderId: "ORD-2024-015",
    recipientId: "9876543224",
    transactionId: "TXN-015",
    method: "upi",
    amount: 2900,
    createdAt: 1705276800, // Jan 15, 2024
    status: "success"
  }
];

const AppointmentPayment = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use static data instead of API
  const transactions = staticTransactions;

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  useEffect(() => {
    filterData();
  }, [transactions, statusFilter, dateRange, searchText]);

  const filterData = () => {
    let filtered = [...transactions];
    filtered = filtered.filter(
      transaction => transaction.type === "appointment"
    );

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        transaction => transaction.status === statusFilter
      );
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.createdAt * 1000);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        transaction =>
          transaction.orderId
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          transaction.recipientId?.includes(searchText) ||
          transaction.transactionId
            ?.toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setDateRange([]);
    setSearchText("");
  };

  const formatDate = timestamp => {
    return new Date(timestamp * 1000).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = amount => {
    return `₹${amount?.toLocaleString()}`;
  };

  const getStatusConfig = status => {
    const config = {
      pending: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Pending",
      },
      success: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Success",
      },
      failed: {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "Failed",
      },
    };
    return config[status] || { color: "default", icon: null, text: status };
  };

  const getMethodConfig = method => {
    const config = {
      upi: { color: "blue", text: "UPI" },
      card: { color: "purple", text: "Card" },
      netbanking: { color: "cyan", text: "Net Banking" },
      cash: { color: "default", text: "Cash" },
    };
    return config[method] || { color: "default", text: method };
  };

  const columns = [
    {
      title: "S.No",
      key: "index",
      width: "2%",
      render: (text, record, index) => (
        <Text strong style={{ color: "gray" }}>
          {index + 1}
        </Text>
      ),
    },
    {
      title: "Recipient Number",
      dataIndex: "recipientId",
      key: "recipientId",
      width: "10%",
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      width: "15%",
      render: orderId => <Text>{orderId}</Text>,
    },

    {
      title: "Method",
      dataIndex: "method",
      key: "method",
      width: "12%",
      render: method => {
        const config = getMethodConfig(method);
        return <Text>{config.text}</Text>;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: "15%",
      render: amount => <Text>{formatAmount(amount)}</Text>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Timestamp",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "18%",
      render: timestamp => <Text>{formatDate(timestamp)}</Text>,
      sorter: (a, b) => a.createdAt - b.createdAt,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: status => {
        const config = getStatusConfig(status);
        return (
          <Tag
            color={config.color}
            icon={config.icon}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              width: "fit-content",
              borderRadius: "10px",
            }}
          >
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Success", value: "success" },
        { text: "Failed", value: "failed" },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

  const mobileColumns = [
    {
      title: "Payment Details",
      key: "mobileView",
      render: record => (
        <Space direction='vertical' size='small' style={{ width: "100%" }}>
          <Row justify='space-between' align='middle'>
            <Col>
              <Text strong>+{record.recipientId}</Text>
            </Col>
            <Col>
              <Tag color={getStatusConfig(record.status).color}>
                {getStatusConfig(record.status).text}
              </Tag>
            </Col>
          </Row>
          <Row justify='space-between'>
            <Col>
              <Text strong>{formatAmount(record.amount)}</Text>
            </Col>
            <Col>
              <Tag color={getMethodConfig(record.method).color}>
                {getMethodConfig(record.method).text}
              </Tag>
            </Col>
          </Row>
          <Row>
            <Col>
              <Text type='secondary' style={{ fontSize: "12px" }}>
                {record.orderId}
              </Text>
            </Col>
          </Row>
          <Row>
            <Col>
              <Text type='secondary' style={{ fontSize: "12px" }}>
                {formatDate(record.createdAt)}
              </Text>
            </Col>
          </Row>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
        <Breadcrumb title='Payment Transactions' />
        <Card>
          {/* Header */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              {/* <Title level={4} style={{ margin: 0 }}>
            Payments Overview
          </Title> */}
              {/* <Text type="secondary">
              {isLoading ? 'Loading transactions...' : `Showing ${filteredData.length} transactions`}
            </Text> */}
            </Col>
          </Row>

          {/* Filters */}

          <Row gutter={[16, 16]} align='middle'>
            <Col xs={24} sm={8} md={6}>
              <Input
                placeholder='Search by Order ID, Recipient...'
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ borderRadius: "10px" }}
              />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Select
                style={{ width: "100%" }}
                placeholder='Status'
                value={statusFilter}
                onChange={setStatusFilter}
                className='rounded-select'
                allowClear
              >
                <Option value='all'>All Status</Option>
                <Option value='pending'>Pending</Option>
                <Option value='success'>Success</Option>
                <Option value='failed'>Failed</Option>
              </Select>
            </Col>
            {/* <Col xs={12} sm={8} md={8}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
                value={dateRange}
                onChange={setDateRange}
              />
            </Col> */}
          </Row>

          {/* Transactions Table */}
          <Spin spinning={isLoading}>
            <Table
              className="leads-performance-table mt-3"
              rowKey='_id'
              columns={isMobile ? mobileColumns : columns}
              dataSource={filteredData}
              pagination={{
                className: "custom-pagination",
                pageSize: 10,
                showTotal: (total, range) => `Page ${total} `,
              }}
              scroll={{ x: 800 }}
              size={isMobile ? "small" : "middle"}
              locale={{
                emptyText:
                  searchText || statusFilter !== "all" || dateRange.length > 0
                    ? "No transactions match your filters"
                    : "No payment transactions found",
              }}
            />
          </Spin>
        </Card>
      
    </div>
  );
};

export default AppointmentPayment;
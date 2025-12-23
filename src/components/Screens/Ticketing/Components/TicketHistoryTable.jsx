import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Tag, Button, Spin, Alert, message } from "antd";
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import moment from "moment";

// Static helper functions
const getStatusColor = status => {
  switch (status) {
    case "Complete": return "green";
    case "Pending": return "orange";
    case "In Progress": return "blue";
    case "Assigned": return "purple";
    case "Awaiting Customer Response": return "gold";
    case "Reopened": return "cyan";
    case "Closed": return "red";
    default: return "default";
  }
};

const getPriorityColor = priority => {
  switch (priority) {
    case "Low": return "green";
    case "Medium": return "blue";
    case "High": return "orange";
    case "Critical": return "red";
    default: return "default";
  }
};

// Static ticket history data
const STATIC_TICKET_HISTORY = [
  {
    _id: "1",
    ticketId: "TK001",
    department_field: "Technical Support",
    status: "Complete",
    priority: "High",
    assignedTo: "Agent 1",
    description: "Unable to login to account. Reset password required.",
    createdDate: "2024-01-10T10:30:00Z",
    dueDate: "2024-01-12T10:30:00Z",
    completedDate: "2024-01-11T14:45:00Z",
  },
  {
    _id: "2",
    ticketId: "TK002",
    department_field: "Billing",
    status: "Complete",
    priority: "Medium",
    assignedTo: "Agent 2",
    description: "Invoice amount incorrect for December month.",
    createdDate: "2024-01-05T09:15:00Z",
    dueDate: "2024-01-08T09:15:00Z",
    completedDate: "2024-01-07T16:30:00Z",
  },
  {
    _id: "3",
    ticketId: "TK003",
    department_field: "Sales",
    status: "Complete",
    priority: "Low",
    assignedTo: "Agent 3",
    description: "Request for product demo session next week.",
    createdDate: "2023-12-28T14:20:00Z",
    dueDate: "2024-01-04T14:20:00Z",
    completedDate: "2024-01-03T11:10:00Z",
  },
  {
    _id: "4",
    ticketId: "TK004",
    department_field: "Technical Support",
    status: "Pending",
    priority: "Critical",
    assignedTo: "Agent 1",
    description: "Server downtime reported by multiple users.",
    createdDate: "2024-01-15T08:45:00Z",
    dueDate: "2024-01-17T08:45:00Z",
    completedDate: null,
  },
  {
    _id: "5",
    ticketId: "TK005",
    department_field: "Customer Service",
    status: "In Progress",
    priority: "Medium",
    assignedTo: "Agent 4",
    description: "Complaint about delayed response time.",
    createdDate: "2024-01-12T13:25:00Z",
    dueDate: "2024-01-15T13:25:00Z",
    completedDate: null,
  },
  {
    _id: "6",
    ticketId: "TK006",
    department_field: "Technical Support",
    status: "Awaiting Customer Response",
    priority: "High",
    assignedTo: "Agent 2",
    description: "API integration issue, waiting for client credentials.",
    createdDate: "2024-01-08T11:10:00Z",
    dueDate: "2024-01-15T11:10:00Z",
    completedDate: null,
  },
  {
    _id: "7",
    ticketId: "TK007",
    department_field: "Billing",
    status: "Complete",
    priority: "Low",
    assignedTo: "Agent 3",
    description: "Refund request processed successfully.",
    createdDate: "2023-12-15T16:40:00Z",
    dueDate: "2023-12-22T16:40:00Z",
    completedDate: "2023-12-20T10:15:00Z",
  },
];

const TicketHistoryTable = ({
  mobileNumber = "+1234567890",
  onNavigateToTabOne = () => {
    console.log("Navigate to tab one");
    message.info("Navigating to Ticket Details");
  }
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const columns = [
    {
      title: "S.No.",
      key: "sno",
      width: 70,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Ticket ID",
      dataIndex: "ticketId",
      key: "ticketId",
      width: 120,
      render: ticketId => (
        <span style={{ fontWeight: 600, color: "#1890ff" }}>{ticketId}</span>
      ),
    },
    {
      title: "Department",
      dataIndex: "department_field",
      key: "department_field",
      width: 150,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: status => (
        <Tag color={getStatusColor(status)} style={{ fontWeight: 500 }}>
          {status.startsWith("Awaiting") ? "Awaiting" : status}
        </Tag>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: priority => (
        <Tag color={getPriorityColor(priority)}>{priority}</Tag>
      ),
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 120,
      render: assignedTo => assignedTo || "Unassigned",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: true,
      render: description => (
        <span title={description}>{description || "No description"}</span>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 150,
      render: date => moment(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 150,
      render: date => (date ? moment(date).format("DD/MM/YYYY HH:mm") : "N/A"),
      sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
    },
    {
      title: "Completed Date",
      dataIndex: "completedDate",
      key: "completedDate",
      width: 150,
      render: date => (date ? moment(date).format("DD/MM/YYYY HH:mm") : "-"),
      sorter: (a, b) => new Date(a.completedDate || 0) - new Date(b.completedDate || 0),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Button
          type='primary'
          icon={<EyeOutlined />}
          size='small'
          onClick={() => {
            navigate(`/tickets/${record.ticketId}`);
            onNavigateToTabOne();
          }}
          style={{
            borderRadius: "6px",
            backgroundColor: "#1890ff",
            borderColor: "#1890ff",
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const ticketHistory = useMemo(() => {
    // Filter by mobile number if provided
    const filtered = STATIC_TICKET_HISTORY.filter(ticket =>
      !mobileNumber || true // For demo, show all tickets
    );

    // Sort by created date descending (newest first)
    return [...filtered].sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
    );
  }, [mobileNumber]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      message.success("Ticket history refreshed");
    }, 800);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size='large' />
        <div style={{ marginTop: 16 }}>Loading ticket history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message='Error Loading Ticket History'
        description={error}
        type='error'
        action={
          <Button size='small' icon={<ReloadOutlined />} onClick={handleRefresh}>
            Retry
          </Button>
        }
        style={{ marginBottom: 16 }}
      />
    );
  }

  if (!ticketHistory || ticketHistory.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          backgroundColor: "#fafafa",
          borderRadius: "8px",
        }}
      >
        <div style={{ fontSize: "16px", color: "#999", marginBottom: "16px" }}>
          No previous tickets found for this customer
        </div>
        <div style={{ fontSize: "14px", color: "#666" }}>
          This appears to be the first ticket from {mobileNumber}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <span style={{ fontSize: "16px", fontWeight: 500 }}>
            Ticket History ({ticketHistory.length} tickets)
          </span>
          {mobileNumber && (
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              For: {mobileNumber}
            </div>
          )}
        </div>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading}>
          Refresh
        </Button>
      </div>

      <Table
        className="leads-performance-table"
        columns={columns}
        dataSource={ticketHistory}
        rowKey={record => record._id || record.ticketId}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} tickets`,
        }}
        scroll={{ x: 1300 }}
        size='middle'
        onRow={record => ({
          onClick: event => {
            if (!event.target.closest("button, a")) {
              navigate(`/tickets/${record.ticketId}`);
              onNavigateToTabOne();
            }
          },
          style: {
            cursor: "pointer",
            transition: "all 0.2s",
          },
        })}
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
};

export default TicketHistoryTable;
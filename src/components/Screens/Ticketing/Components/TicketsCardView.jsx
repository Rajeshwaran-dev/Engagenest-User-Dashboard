import React, { useState } from "react";
import { Row, Col, Card, Checkbox, Dropdown, Menu, Tag, message } from "antd";
import {
  MoreOutlined,
  StarFilled,
  EditOutlined,
  CheckOutlined,
  WarningOutlined,
  StarOutlined,
} from "@ant-design/icons";
import moment from "moment";

// Static helper functions
const getPriorityColor = (priority) => {
  switch (priority) {
    case "Low": return "green";
    case "Medium": return "blue";
    case "High": return "orange";
    case "Critical": return "red";
    default: return "default";
  }
};

const getStatusColor = (status) => {
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

// Static tickets data
const STATIC_TICKETS = [
  {
    key: "1",
    ticketId: "TK001",
    customerName: "John Doe",
    assignedTo: "Agent 1",
    department_field: "Technical Support",
    subject: "Unable to login",
    priority: "High",
    status: "Pending",
    createdDate: "2024-01-15T10:30:00Z",
    isStarred: true,
    isSpam: false,
  },
  {
    key: "2",
    ticketId: "TK002",
    customerName: "Jane Smith",
    assignedTo: "Agent 2",
    department_field: "Billing",
    subject: "Invoice issue",
    priority: "Medium",
    status: "In Progress",
    createdDate: "2024-01-16T14:45:00Z",
    isStarred: false,
    isSpam: false,
  },
  {
    key: "3",
    ticketId: "TK003",
    customerName: "Bob Johnson",
    assignedTo: "Agent 3",
    department_field: "Technical Support",
    subject: "Password reset",
    priority: "Low",
    status: "Complete",
    createdDate: "2024-01-14T09:15:00Z",
    isStarred: false,
    isSpam: true,
  },
  {
    key: "4",
    ticketId: "TK004",
    customerName: "Alice Brown",
    assignedTo: "Agent 4",
    department_field: "Sales",
    subject: "New feature request",
    priority: "Critical",
    status: "Pending",
    createdDate: "2024-01-17T11:20:00Z",
    isStarred: true,
    isSpam: false,
  },
  {
    key: "5",
    ticketId: "TK005",
    customerName: "Charlie Wilson",
    assignedTo: "Agent 1",
    department_field: "Technical Support",
    subject: "API integration",
    priority: "Medium",
    status: "Awaiting Customer Response",
    createdDate: "2024-01-13T16:10:00Z",
    isStarred: false,
    isSpam: false,
  },
  {
    key: "6",
    ticketId: "TK006",
    customerName: "David Miller",
    assignedTo: "Agent 2",
    department_field: "Customer Service",
    subject: "Complaint response",
    priority: "High",
    status: "Assigned",
    createdDate: "2024-01-18T08:30:00Z",
    isStarred: false,
    isSpam: false,
  },
  {
    key: "7",
    ticketId: "TK007",
    customerName: "Emma Wilson",
    assignedTo: "Agent 3",
    department_field: "Billing",
    subject: "Refund request",
    priority: "Low",
    status: "Complete",
    createdDate: "2024-01-12T13:25:00Z",
    isStarred: true,
    isSpam: false,
  },
  {
    key: "8",
    ticketId: "TK008",
    customerName: "Frank Harris",
    assignedTo: "Agent 4",
    department_field: "Technical Support",
    subject: "Bug report",
    priority: "Critical",
    status: "Reopened",
    createdDate: "2024-01-19T15:40:00Z",
    isStarred: false,
    isSpam: false,
  },
];

const TicketsCardView = ({
  tickets = STATIC_TICKETS,
  selectedTickets: propSelectedTickets = [],
  onSelectTickets = (selectedKeys) => {
    console.log("Selected tickets:", selectedKeys);
  },
  onRowClick = (ticket) => {
    console.log("Row clicked:", ticket);
    message.info(`Clicked ticket: ${ticket.ticketId}`);
  },
  onEdit = (ticket) => {
    console.log("Edit ticket:", ticket);
    message.info(`Edit ticket: ${ticket.ticketId}`);
  },
  onStar = (ticket) => {
    console.log("Star/unstar ticket:", ticket);
    message.success(ticket.isStarred ? "Ticket unstarred" : "Ticket starred");
  },
  onMarkAsSpam = (ticket) => {
    console.log("Mark as spam:", ticket);
    message.warning(`Marked as spam: ${ticket.ticketId}`);
  },
  onMarkAsUnSpam = (ticket) => {
    console.log("Mark as unspam:", ticket);
    message.success(`Unspammed: ${ticket.ticketId}`);
  },
  onPrint = (ticket) => {
    console.log("Print ticket:", ticket);
    message.info(`Print ticket: ${ticket.ticketId}`);
  },
  onUpdateStatus = (ticket) => {
    console.log("Update status:", ticket);
    message.info(`Update status for: ${ticket.ticketId}`);
  },
  onQuickStatusChange = (ticket, status) => {
    console.log("Quick status change:", ticket, status);
    message.success(`Status changed to: ${status}`);
  },
}) => {
  const [localSelectedTickets, setLocalSelectedTickets] = useState([]);

  const selectedTickets = propSelectedTickets.length > 0 ? propSelectedTickets : localSelectedTickets;

  const handleSelectTicket = (key) => {
    const newSelected = selectedTickets.includes(key)
      ? selectedTickets.filter((k) => k !== key)
      : [...selectedTickets, key];

    setLocalSelectedTickets(newSelected);
    onSelectTickets(newSelected);
  };

  const actionMenu = (record, actions) => [
    {
      key: "edit",
      label: "Edit",
      onClick: () => actions.onEdit?.(record),
    },
    {
      key: "star",
      label: record.isStarred ? "Unstar" : "Star",
      onClick: () => actions.onStar?.(record),
    },
    {
      key: "print",
      label: "Print",
      onClick: () => actions.onPrint?.(record),
    },
    {
      key: "status",
      label: "Update Status",
      onClick: () => actions.onUpdateStatus?.(record),
    },
    !record.isSpam
      ? {
        key: "spam",
        label: "Mark as Spam",
        danger: true,
        onClick: () => actions.onMarkAsSpam?.(record),
      }
      : {
        key: "unspam",
        label: "Unspam",
        style: { color: "#e59e35ff" },
        onClick: () => actions.onMarkAsUnSpam?.(record),
      },
  ];

  // ✅ Safely normalize tickets
  const ticketList = Array.isArray(tickets)
    ? tickets
    : Array.isArray(tickets?.data)
      ? tickets.data
      : STATIC_TICKETS;

  return (
    <Row gutter={[16, 16]}>
      {ticketList.length > 0 ? (
        ticketList.map((ticket) => (
          <Col xs={24} sm={12} md={8} lg={6} key={ticket.key}>
            <Card
              hoverable
              className={`ticket-card ${selectedTickets.includes(ticket.key) ? "selected" : ""}`}
              onClick={(e) => {
                e.stopPropagation(); // ✅ prevent bubbling
                handleSelectTicket(ticket.key);
              }}
              style={{
                borderRadius: "14px",
                border: selectedTickets.includes(ticket.key)
                  ? "2px solid var(--primary)"
                  : "1px solid #e5e7eb",
                boxShadow: selectedTickets.includes(ticket.key)
                  ? "0 4px 14px rgba(30, 164, 67, 0.2)"
                  : "0 2px 10px rgba(0,0,0,0.06)",
                transition: "all 0.25s ease",
                cursor: "pointer",
                background: "#fff",
                overflow: "hidden",
              }}
              bodyStyle={{
                padding: "16px 20px",
                background: selectedTickets.includes(ticket.key)
                  ? "#f6ffed"
                  : "#ffffff",
              }}
              actions={[
                <Checkbox
                  checked={selectedTickets.includes(ticket.key)}
                  onClick={(e) => e.stopPropagation()} // ✅ prevent triggering Card click
                  onChange={() => handleSelectTicket(ticket.key)}
                />,
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "edit",
                        label: "Edit",
                        icon: <EditOutlined />,
                        onClick: () => onEdit(ticket),
                      },
                      {
                        key: "status",
                        label: "Update Status",
                        icon: <CheckOutlined />,
                        onClick: () => onUpdateStatus(ticket),
                      },
                      {
                        key: "star",
                        label: ticket.isStarred ? "Unstar Ticket" : "Star Ticket",
                        icon: ticket.isStarred ? (
                          <StarFilled style={{ color: "#fadb14" }} />
                        ) : (
                          <StarOutlined />
                        ),
                        onClick: () => onStar(ticket),
                      },
                      {
                        key: "spam",
                        label: ticket.isSpam ? "Unspam" : "Mark as Spam",
                        icon: <WarningOutlined />,
                        onClick: () =>
                          ticket.isSpam
                            ? onMarkAsUnSpam(ticket)
                            : onMarkAsSpam(ticket),
                        style: { color: ticket.isSpam ? "#e59e35ff" : "#ff4d4f" },
                      },
                    ],
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <MoreOutlined
                    style={{ fontSize: "16px", color: "#666", cursor: "pointer" }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>

              ]}
            >
              <div onClick={() => onRowClick(ticket)} style={{ cursor: "pointer" }}>
                {/* Ticket ID */}
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--primary)",
                    marginBottom: "4px",
                  }}
                >
                  {ticket.isStarred && (
                    <StarFilled
                      style={{
                        color: "#fadb14",
                        marginRight: "4px",
                        fontSize: "13px",
                      }}
                    />
                  )}
                  Ticket ID:{" "}
                  <span style={{ color: "#000", fontWeight: "500" }}>
                    {ticket.ticketId}
                  </span>
                </div>

                {/* Customer Name */}
                <div
                  style={{
                    fontSize: "13px",
                    color: "#666",
                    marginBottom: "2px",
                  }}
                >
                  Customer Name:{" "}
                  <span style={{ color: "#000", fontWeight: "500" }}>
                    {ticket.customerName}
                  </span>
                </div>

                {/* Agent */}
                <div
                  style={{
                    fontSize: "13px",
                    color: "#666",
                    marginBottom: "2px",
                  }}
                >
                  Agent:{" "}
                  <span style={{ color: "#000", fontWeight: "500" }}>
                    {ticket.assignedTo}
                  </span>
                </div>

                {/* Department */}
                <div
                  style={{
                    fontSize: "13px",
                    color: "#666",
                    marginBottom: "2px",
                  }}
                >
                  Department:{" "}
                  <span style={{ color: "#000", fontWeight: "500" }}>
                    {ticket.department_field}
                  </span>
                </div>

                {/* Subject */}
                <div
                  style={{
                    fontSize: "13px",
                    color: "#666",
                    marginBottom: "8px",
                  }}
                >
                  Subject:{" "}
                  <span style={{ color: "#000", fontWeight: "500" }}>
                    {ticket.subject}
                  </span>
                </div>

                {/* Priority & Status */}
                <div style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      marginBottom: "4px",
                    }}
                  >
                    Priority:{" "}
                    <Tag
                      color={getPriorityColor(ticket.priority)}
                      style={{
                        fontWeight: "600",
                        marginLeft: "4px",
                        borderRadius: "8px",
                        padding: "2px 8px",
                      }}
                    >
                      {ticket.priority}
                    </Tag>
                  </div>
                  <div style={{ fontSize: "13px", color: "#666" }}>
                    Status:{" "}
                    <Tag
                      color={getStatusColor(ticket.status)}
                      style={{
                        fontWeight: "600",
                        marginLeft: "4px",
                        borderRadius: "8px",
                        padding: "2px 8px",
                      }}
                    >
                      {ticket.status === "Awaiting Customer Response" ? "Awaiting" : ticket.status}
                    </Tag>
                  </div>
                </div>

                {/* Created Date */}
                <div style={{ fontSize: "13px", color: "#666" }}>
                  CreatedAt:{" "}
                  <span style={{ color: "#000", fontWeight: "500" }}>
                    {moment(ticket.createdDate).format("MMM D, YYYY")}
                  </span>
                </div>
              </div>
            </Card>
          </Col>
        ))
      ) : (
        <Col span={24} style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ color: "#999", fontSize: "14px" }}>
            No tickets available.
          </p>
        </Col>
      )}
    </Row>
  );
};

export default TicketsCardView;
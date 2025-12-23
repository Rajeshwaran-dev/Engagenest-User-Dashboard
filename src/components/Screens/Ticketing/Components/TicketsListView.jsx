import React from "react";
import { Checkbox, Dropdown, Button, Tag, message } from "antd";
import { MoreOutlined, StarFilled } from "@ant-design/icons";
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

// Static action menu
const actionMenu = (record, actions) => {
  const { Menu } = require("antd");
  return (
    <Menu>
      <Menu.Item key="edit" onClick={() => {
        actions.onEdit && actions.onEdit(record);
        message.info(`Edit ticket: ${record.ticketId}`);
      }}>
        Edit
      </Menu.Item>
      <Menu.Item key="star" onClick={() => {
        actions.onStar && actions.onStar(record);
        message.success(record.isStarred ? "Ticket unstarred" : "Ticket starred");
      }}>
        {record.isStarred ? "Unstar" : "Star"}
      </Menu.Item>
      <Menu.Item key="print" onClick={() => {
        actions.onPrint && actions.onPrint(record);
        message.info(`Print ticket: ${record.ticketId}`);
      }}>
        Print
      </Menu.Item>
      <Menu.Item key="status" onClick={() => {
        actions.onUpdateStatus && actions.onUpdateStatus(record);
        message.info(`Update status for: ${record.ticketId}`);
      }}>
        Update Status
      </Menu.Item>
      {!record.isSpam ? (
        <Menu.Item 
          key="spam" 
          onClick={() => {
            actions.onMarkAsSpam && actions.onMarkAsSpam(record);
            message.warning(`Marked as spam: ${record.ticketId}`);
          }}
          style={{ color: "#ff4d4f" }}
        >
          Mark as Spam
        </Menu.Item>
      ) : (
        <Menu.Item 
          key="unspam" 
          onClick={() => {
            actions.onMarkAsUnSpam && actions.onMarkAsUnSpam(record);
            message.success(`Unspammed: ${record.ticketId}`);
          }}
          style={{ color: "#e59e35ff" }}
        >
          Unspam
        </Menu.Item>
      )}
    </Menu>
  );
};

// Static tickets data
const STATIC_TICKETS = [
  {
    key: "1",
    ticketId: "TK001",
    customerName: "John Doe",
    description: "Unable to login to account",
    priority: "High",
    status: "Pending",
    assignedTo: "Agent 1",
    isStarred: true,
    isSpam: false,
    createdDate: "2024-01-15T10:30:00Z",
  },
  {
    key: "2",
    ticketId: "TK002",
    customerName: "Jane Smith",
    description: "Invoice amount incorrect",
    priority: "Medium",
    status: "In Progress",
    assignedTo: "Agent 2",
    isStarred: false,
    isSpam: false,
    createdDate: "2024-01-16T14:45:00Z",
  },
  {
    key: "3",
    ticketId: "TK003",
    customerName: "Bob Johnson",
    description: "Need password reset link",
    priority: "Low",
    status: "Complete",
    assignedTo: "Agent 3",
    isStarred: false,
    isSpam: true,
    createdDate: "2024-01-14T09:15:00Z",
  },
  {
    key: "4",
    ticketId: "TK004",
    customerName: "Alice Brown",
    description: "Request for dashboard improvements",
    priority: "Critical",
    status: "Pending",
    assignedTo: "Agent 4",
    isStarred: true,
    isSpam: false,
    createdDate: "2024-01-17T11:20:00Z",
  },
  {
    key: "5",
    ticketId: "TK005",
    customerName: "Charlie Wilson",
    description: "Need help with API documentation",
    priority: "Medium",
    status: "Awaiting Customer Response",
    assignedTo: "Agent 1",
    isStarred: false,
    isSpam: false,
    createdDate: "2024-01-13T16:10:00Z",
  },
];

const TicketsListView = ({
  tickets = STATIC_TICKETS,
  selectedTickets = [],
  onSelectTickets = (selectedKeys) => {
    console.log("Selected tickets:", selectedKeys);
  },
  onRowClick = (ticket) => {
    console.log("Row clicked:", ticket);
    message.info(`Clicked ticket: ${ticket.ticketId}`);
  },
  onEdit = (ticket) => {
    console.log("Edit ticket:", ticket);
  },
  onStar = (ticket) => {
    console.log("Star/unstar ticket:", ticket);
  },
  onMarkAsSpam = (ticket) => {
    console.log("Mark as spam:", ticket);
  },
  onMarkAsUnSpam = (ticket) => {
    console.log("Mark as unspam:", ticket);
  },
  onPrint = (ticket) => {
    console.log("Print ticket:", ticket);
  },
  onUpdateStatus = (ticket) => {
    console.log("Update status:", ticket);
  },
}) => {
  const handleSelectTicket = key => {
    const newSelected = selectedTickets.includes(key) 
      ? selectedTickets.filter(k => k !== key) 
      : [...selectedTickets, key];
    onSelectTickets(newSelected);
  };

  return (
    <div className='ticket-list' style={{ padding: "16px" }}>
      {tickets.map(ticket => (
        <div
          key={ticket.key}
          className={`ticket-list-item ${selectedTickets.includes(ticket.key) ? "selected" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px",
            marginBottom: "8px",
            border: "1px solid #e8e8e8",
            borderRadius: "8px",
            backgroundColor: selectedTickets.includes(ticket.key) ? "#f0f9ff" : "#fff",
            transition: "all 0.3s",
            cursor: "pointer",
            gap: "16px",
          }}
          onClick={() => onRowClick(ticket)}
        >
          <Checkbox
            checked={selectedTickets.includes(ticket.key)}
            onChange={(e) => {
              e.stopPropagation();
              handleSelectTicket(ticket.key);
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div 
            className='list-item-content' 
            style={{ flex: 1, minWidth: 0 }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <div className='ticket-id' style={{ 
                fontWeight: "600", 
                fontSize: "14px",
                marginRight: "8px"
              }}>
                {ticket.isStarred && (
                  <StarFilled
                    style={{
                      color: "#fadb14",
                      marginRight: "4px",
                      fontSize: "14px",
                    }}
                  />
                )}
                {ticket.ticketId}
              </div>
              <div className='customer-name' style={{ 
                fontSize: "14px", 
                color: "#666",
                marginRight: "16px"
              }}>
                {ticket.customerName}
              </div>
            </div>
            <div className='ticket-description' style={{ 
              fontSize: "13px", 
              color: "#333",
              marginBottom: "8px",
              lineHeight: "1.4"
            }}>
              {ticket.description}
            </div>
            <div className='ticket-meta' style={{ display: "flex", gap: "8px" }}>
              <Tag color={getPriorityColor(ticket.priority)} style={{ borderRadius: "6px" }}>
                {ticket.priority}
              </Tag>
              <Tag color={getStatusColor(ticket.status)} style={{ borderRadius: "6px" }}>
                {ticket.status === "Awaiting Customer Response" ? "Awaiting" : ticket.status}
              </Tag>
              <span style={{ fontSize: "12px", color: "#999" }}>
                {moment(ticket.createdDate).fromNow()}
              </span>
            </div>
          </div>
          <div className='list-item-actions' onClick={(e) => e.stopPropagation()}>
            <Dropdown
              overlay={actionMenu(ticket, {
                onEdit,
                onStar,
                onPrint,
                onMarkAsSpam,
                onUpdateStatus,
                onMarkAsUnSpam,
              })}
              trigger={["click"]}
            >
              <Button type='text' icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketsListView;
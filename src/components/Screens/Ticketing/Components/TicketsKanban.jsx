import React, { useState, useEffect } from "react";
import { Card, Select, message } from "antd";
import { ProjectOutlined } from "@ant-design/icons";
import KanbanBoard from "./KanbanBoard";

const { Option } = Select;

// Static tickets data for Kanban
const STATIC_KANBAN_TICKETS = [
  {
    key: "1",
    ticketId: "TK001",
    customerName: "John Doe",
    status: "Pending",
    priority: "High",
    department: "Technical Support",
    assignedTo: "Agent 1",
    subject: "Unable to login",
    description: "User cannot login to account",
    createdDate: "2024-01-15",
  },
  {
    key: "2",
    ticketId: "TK002",
    customerName: "Jane Smith",
    status: "In Progress",
    priority: "Medium",
    department: "Billing",
    assignedTo: "Agent 2",
    subject: "Invoice issue",
    description: "Invoice amount incorrect",
    createdDate: "2024-01-16",
  },
  {
    key: "3",
    ticketId: "TK003",
    customerName: "Bob Johnson",
    status: "Complete",
    priority: "Low",
    department: "Technical Support",
    assignedTo: "Agent 3",
    subject: "Password reset",
    description: "Need password reset link",
    createdDate: "2024-01-14",
  },
  {
    key: "4",
    ticketId: "TK004",
    customerName: "Alice Brown",
    status: "Pending",
    priority: "Critical",
    department: "Sales",
    assignedTo: "Agent 4",
    subject: "New feature request",
    description: "Request for dashboard improvements",
    createdDate: "2024-01-17",
  },
  {
    key: "5",
    ticketId: "TK005",
    customerName: "Charlie Wilson",
    status: "Awaiting Customer Response",
    priority: "Medium",
    department: "Technical Support",
    assignedTo: "Agent 1",
    subject: "API integration",
    description: "Need help with API documentation",
    createdDate: "2024-01-13",
  },
];

const TicketsKanban = ({
  tickets = STATIC_KANBAN_TICKETS,
  onRowClick = (ticket) => {
    console.log("Ticket clicked:", ticket);
    message.info(`Clicked ticket: ${ticket.ticketId}`);
  },
  onDragUpdate = (result) => {
    console.log("Drag update:", result);
    message.success("Ticket moved successfully");
  },
  groupBy: propGroupBy = "status",
  onGroupByChange = (value) => {
    console.log("Group by changed to:", value);
  },
}) => {
  const [groupBy, setGroupBy] = useState(propGroupBy);

  const handleGroupByChange = (value) => {
    setGroupBy(value);
    onGroupByChange(value);
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Select
          value={groupBy}
          onChange={handleGroupByChange}
          style={{ width: 200 }}
        >
          <Option value='status'>Group by Status</Option>
          <Option value='priority'>Group by Priority</Option>
          <Option value='department'>Group by Department</Option>
          <Option value='assignee'>Group by Assignee</Option>
        </Select>
      </div>

      <KanbanBoard
        tickets={tickets}
        onTicketClick={onRowClick}
        groupBy={groupBy}
        onDragUpdate={onDragUpdate}
      />
    </div>
  );
};

export default TicketsKanban;
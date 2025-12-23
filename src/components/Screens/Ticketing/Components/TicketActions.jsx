import React from "react";
import { Menu, message } from "antd";
import {
  EditOutlined,
  CheckOutlined,
  StarOutlined,
  StarFilled,
  PrinterOutlined,
  WarningOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";

// Static handlers for demo
const createStaticHandlers = (record) => ({
  onEdit: (record) => {
    console.log("Edit ticket:", record.ticketId);
    message.info(`Editing ticket: ${record.ticketId}`);
  },
  onUpdateStatus: (record) => {
    console.log("Update status for ticket:", record.ticketId);
    message.info(`Updating status for: ${record.ticketId}`);
  },
  onUpdatePriority: (record) => {
    console.log("Update priority for ticket:", record.ticketId);
    message.info(`Updating priority for: ${record.ticketId}`);
  },
  onStar: (record) => {
    console.log("Star/Unstar ticket:", record.ticketId, "Current starred:", record.isStarred);
    message.success(`${record.isStarred ? "Unstarred" : "Starred"} ticket: ${record.ticketId}`);
  },
  onPrint: (record) => {
    console.log("Print ticket:", record.ticketId);
    message.info(`Printing ticket: ${record.ticketId}`);
    // In a real app, this would trigger print dialog
    window.print();
  },
  onMarkAsSpam: (record) => {
    console.log("Mark as spam:", record.ticketId);
    message.warning(`Marking as spam: ${record.ticketId}`);
  },
  onMarkAsUnSpam: (record) => {
    console.log("Unspam ticket:", record.ticketId);
    message.success(`Removing spam mark: ${record.ticketId}`);
  },
});

export const actionMenu = (record, handlers = createStaticHandlers(record)) => {
  return !record.isSpam ? (
    <Menu>
      <Menu.Item
        key='edit'
        icon={<EditOutlined />}
        onClick={() => handlers.onEdit(record)}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key='status'
        icon={<CheckOutlined />}
        onClick={() => handlers.onUpdateStatus(record)}
      >
        Update Status
      </Menu.Item>
      <Menu.Item
        key='priority'
        icon={<ArrowUpOutlined />}
        onClick={() => handlers.onUpdatePriority(record)}
      >
        Update Priority
      </Menu.Item>
      <Menu.Item
        key='star'
        icon={
          record.isStarred ? (
            <StarFilled style={{ color: "#fadb14" }} />
          ) : (
            <StarOutlined />
          )
        }
        onClick={() => handlers.onStar(record)}
      >
        {record.isStarred ? "Unstar Ticket" : "Star Ticket"}
      </Menu.Item>
      <Menu.Item
        key='print'
        icon={<PrinterOutlined />}
        onClick={() => handlers.onPrint(record)}
      >
        Print Ticket
      </Menu.Item>
      {!record.isSpam && (
        <Menu.Item
          key='spam'
          icon={<WarningOutlined />}
          onClick={() => handlers.onMarkAsSpam(record)}
          style={{ color: "#ff4d4f" }}
        >
          Mark as Spam
        </Menu.Item>
      )}
    </Menu>
  ) : (
    <Menu>
      <Menu.Item
        key='unspam'
        icon={<WarningOutlined />}
        onClick={() => handlers.onMarkAsUnSpam(record)}
        style={{ color: "#e59e35ff" }}
      >
        Unspam
      </Menu.Item>
    </Menu>
  );
};

// Static ticket data for demo
export const STATIC_TICKETS = [
  {
    ticketId: "TKT-001",
    customerName: "John Doe",
    subject: "Login issue",
    isStarred: true,
    isSpam: false,
    priority: "High",
    status: "Open"
  },
  {
    ticketId: "TKT-002",
    customerName: "Jane Smith",
    subject: "Billing question",
    isStarred: false,
    isSpam: true,
    priority: "Medium",
    status: "Closed"
  },
  {
    ticketId: "TKT-003",
    customerName: "Bob Wilson",
    subject: "Feature request",
    isStarred: false,
    isSpam: false,
    priority: "Low",
    status: "Pending"
  }
];
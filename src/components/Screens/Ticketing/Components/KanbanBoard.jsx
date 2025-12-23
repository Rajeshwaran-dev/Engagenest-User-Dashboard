import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import KanbanColumn from "./KanbanColumn";
import { message } from "antd";

// Static tickets data
const STATIC_TICKETS = [
  {
    key: "1",
    ticketId: "TKT-001",
    customerName: "John Doe",
    status: "Assigned",
    priority: "High",
    department_field: "Support",
    assignedTo: "Alice Johnson",
    createdDate: "2024-01-15",
    isStarred: true
  },
  {
    key: "2",
    ticketId: "TKT-002",
    customerName: "Jane Smith",
    status: "In Progress",
    priority: "Medium",
    department_field: "Sales",
    assignedTo: "Bob Wilson",
    createdDate: "2024-01-16",
    isStarred: false
  },
  {
    key: "3",
    ticketId: "TKT-003",
    customerName: "Mike Johnson",
    status: "Awaiting Customer Response",
    priority: "Low",
    department_field: "Support",
    assignedTo: "Carol Davis",
    createdDate: "2024-01-14",
    isStarred: true
  },
  {
    key: "4",
    ticketId: "TKT-004",
    customerName: "Sarah Williams",
    status: "Pending",
    priority: "Critical",
    department_field: "Technical",
    assignedTo: "David Brown",
    createdDate: "2024-01-17",
    isStarred: false
  },
  {
    key: "5",
    ticketId: "TKT-005",
    customerName: "Tom Wilson",
    status: "Complete",
    priority: "Medium",
    department_field: "Support",
    assignedTo: "Eve Miller",
    createdDate: "2024-01-13",
    isStarred: false
  },
  {
    key: "6",
    ticketId: "TKT-006",
    customerName: "Lisa Brown",
    status: "Reopened",
    priority: "High",
    department_field: "Sales",
    assignedTo: "Frank Wilson",
    createdDate: "2024-01-18",
    isStarred: true
  }
];

const KanbanBoard = ({ tickets = STATIC_TICKETS, onTicketClick, groupBy = "status", onDragUpdate }) => {
  const statusColors = {
    Assigned: "#1890ff",
    "In Progress": "#13c2c2",
    "Awaiting Customer Response": "#722ed1",
    Pending: "#fa8c16",
    Complete: "#52c41a",
    Reopened: "#f5222d"
  };

  const priorityColors = {
    Low: "#52c41a",
    Medium: "#1890ff",
    High: "#faad14",
    Critical: "#f5222d",
  };

  const groupedTickets = {};

  if (groupBy === "status") {
    const statuses = [
      "Assigned",
      "Awaiting Customer Response",
      "In Progress",
      "Pending",
      "Complete",
      "Reopened",
    ];
    statuses.forEach(status => {
      groupedTickets[status] = tickets.filter(
        ticket => ticket.status === status
      );
    });
  } else if (groupBy === "priority") {
    const priorities = ["Critical", "High", "Medium", "Low"];
    priorities.forEach(priority => {
      groupedTickets[priority] = tickets.filter(
        ticket => ticket.priority === priority
      );
    });
  } else if (groupBy === "department") {
    // Group by department
    const departments = [...new Set(tickets.map(t => t.department_field))];
    departments.forEach(dept => {
      groupedTickets[dept] = tickets.filter(
        ticket => ticket.department_field === dept
      );
    });
  } else if (groupBy === "assignee") {
    // Group by assignee
    const assignees = [...new Set(tickets.map(t => t.assignedTo))];
    assignees.forEach(assignee => {
      groupedTickets[assignee] = tickets.filter(
        ticket => ticket.assignedTo === assignee
      );
    });
  }

  const onDragEnd = result => {
    const { source, destination } = result;

    if (!destination) return;

    // 🧠 If dropped in the same place — do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceGroup = source.droppableId;
    const destGroup = destination.droppableId;

    // 🛑 Restrict movement for completed tickets (EXISTING FUNCTIONALITY)
    if (sourceGroup === "Complete" && destGroup !== "Reopened") {
      message.warning("Completed tickets can only be moved to Reopened.");
      return; // Stop drag update
    }

    if (sourceGroup !== "Complete" && destGroup === "Reopened") {
      message.warning("Reopen can be only accepted from completed tickets.");
      return; // Stop drag update
    }

    // 🛑 NEW: Prevent moving back to "Assigned" from certain statuses
    const restrictedStatuses = [
      "In Progress",
      "Awaiting Customer Response",
      "Pending",
      "Complete",
      "Reopened",
    ];
    const restrictedStatusesb = [
      "In Progress",
      "Awaiting Customer Response",
      "Assigned",
      "Complete",
      "Reopened",
    ];
    if (restrictedStatuses.includes(sourceGroup) && destGroup === "Assigned") {
      message.warning("You cannot change the status back to Assigned.");
      return; // Stop drag update
    }
    if (restrictedStatusesb.includes(sourceGroup) && destGroup === "Pending") {
      message.warning(
        "You cannot change the status Pending, it is an automation process"
      );
      return; // Stop drag update
    }

    // ✅ Allow drag to proceed for all other valid moves (EXISTING FUNCTIONALITY)
    if (sourceGroup !== destGroup) {
      const movedTicket = tickets.find(t => t.key === result.draggableId);
      if (movedTicket && onDragUpdate) {
        onDragUpdate(movedTicket, destGroup);
        message.success(`Ticket ${movedTicket.ticketId} moved to ${destGroup}`);
      }
    }
  };

  const handleDragUpdate = (ticket, newStatus) => {
    console.log(`Ticket ${ticket.ticketId} moved to ${newStatus}`);
    if (onDragUpdate) {
      onDragUpdate(ticket, newStatus);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: "flex", overflowX: "auto", padding: "8px 0" }}>
        {Object.entries(groupedTickets).map(([title, columnTickets]) => (
          <KanbanColumn
            key={title}
            title={title}
            tickets={columnTickets}
            onTicketClick={onTicketClick}
            statusColors={groupBy === "status" ? statusColors : priorityColors}
            groupBy={groupBy}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
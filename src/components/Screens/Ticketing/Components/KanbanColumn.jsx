import React from "react";
import { Card, Tag } from "antd";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { StarFilled } from "@ant-design/icons";
import moment from "moment";

// Helper functions
const getPriorityColor = priority => {
  switch (priority) {
    case "Low": return "#52c41a";
    case "Medium": return "#1890ff";
    case "High": return "#faad14";
    case "Critical": return "#f5222d";
    default: return "#d9d9d9";
  }
};

const getStatusColor = status => {
  switch (status) {
    case "Assigned": return "#1890ff";
    case "In Progress": return "#13c2c2";
    case "Awaiting Customer Response": return "#722ed1";
    case "Pending": return "#fa8c16";
    case "Complete": return "#52c41a";
    case "Reopened": return "#f5222d";
    default: return "#d9d9d9";
  }
};

const KanbanColumn = ({
  title,
  tickets,
  onTicketClick,
  statusColors,
  groupBy,
}) => {
  const handleTicketClick = (ticket) => {
    console.log(`Ticket clicked: ${ticket.ticketId}`);
    if (onTicketClick) {
      onTicketClick(ticket);
    } else {
      // Default behavior if no handler provided
      alert(`Ticket ${ticket.ticketId} clicked!\nCustomer: ${ticket.customerName}\nStatus: ${ticket.status}`);
    }
  };

  return (
    <Droppable droppableId={title}>
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{ flex: 1, margin: "0 8px", minWidth: "250px" }}
        >
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: statusColors[title] || "#1890ff",
                    marginRight: "8px",
                  }}
                />
                <span>
                  {title === "Awaiting Customer Response" ? "Awaiting" : title}
                </span>
                <span style={{ marginLeft: "8px" }}>({tickets.length})</span>
              </div>
            }
            bodyStyle={{
              padding: "8px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                overflowY: "auto",
                maxHeight: "60vh",
                paddingRight: "4px",
              }}
            >
              {tickets.map((ticket, index) => {
                // ✅ Disable drag for Completed tickets except when moving to Reopened
                const isDraggable = groupBy === "status";

                return (
                  <Draggable
                    key={ticket.key}
                    draggableId={ticket.key}
                    index={index}
                    isDragDisabled={!isDraggable}
                  >
                    {provided => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card
                          style={{
                            marginBottom: "8px",
                            cursor:
                              isDraggable && groupBy === "status"
                                ? "grab"
                                : "pointer",
                            opacity: isDraggable ? 1 : 0.6,
                            borderLeft: `4px solid ${getPriorityColor(ticket.priority)}`,
                          }}
                          onClick={() => handleTicketClick(ticket)}
                        >
                          <div>
                            <strong>
                              {ticket.isStarred && (
                                <StarFilled
                                  style={{
                                    color: "#fadb14",
                                    marginRight: "4px",
                                    fontSize: "12px",
                                  }}
                                />
                              )}
                              {ticket.ticketId}
                            </strong>

                            <div
                              style={{
                                marginTop: "4px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <div
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "50%",
                                  backgroundColor: "#1890ff20",
                                  color: "#1890ff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "600",
                                  fontSize: "12px",
                                  textTransform: "uppercase",
                                }}
                              >
                                {ticket.customerName?.charAt(0) || "?"}
                              </div>
                              <span>{ticket.customerName}</span>
                            </div>

                            <div style={{ marginTop: "4px" }}>
                              <Tag color={getStatusColor(ticket.status)}>
                                {ticket.status}
                              </Tag>
                              <Tag color={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Tag>
                            </div>

                            <div
                              style={{
                                marginTop: "4px",
                                fontSize: "12px",
                                color: "#666",
                              }}
                            >
                              {moment(ticket.createdDate).format("DD/MM/YYYY")}
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          </Card>
        </div>
      )}
    </Droppable>
  );
};

export default KanbanColumn;
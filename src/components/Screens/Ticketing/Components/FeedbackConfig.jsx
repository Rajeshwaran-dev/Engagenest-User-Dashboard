import React, { useMemo } from "react";
import { Card, Table, Spin, Alert, Tag } from "antd";
import { StarFilled } from "@ant-design/icons";
import { DatePicker, Input } from "antd";
const { RangePicker } = DatePicker;

// Static data for feedback responses
const STATIC_RESPONSES = [
  {
    _id: "1",
    responsedTime: "2024-01-15T10:30:00Z",
    response: {
      userNumber: "9876543210",
      TicketId: "TKT001",
      rating: "4",
      experience: "Good",
      feedback: "Great service, very responsive team.",
      recommendation: "Yes",
    },
  },
  {
    _id: "2",
    responsedTime: "2024-01-16T14:45:00Z",
    response: {
      userNumber: "9876543211",
      TicketId: "TKT002",
      rating: "5",
      experience: "Excellent",
      feedback: "Issue resolved within 2 hours. Amazing!",
      recommendation: "Definitely",
    },
  },
  {
    _id: "3",
    responsedTime: "2024-01-17T09:15:00Z",
    response: {
      userNumber: "9876543212",
      TicketId: "TKT003",
      rating: "3",
      experience: "Average",
      feedback: "Could be better, had to wait long.",
      comment: "Follow up required",
    },
  },
  {
    _id: "4",
    responsedTime: "2024-01-18T16:20:00Z",
    response: {
      userNumber: "9876543210",
      TicketId: "TKT004",
      rating: "2",
      experience: "Bad",
      feedback: "Poor communication from support team.",
      recommendation: "No",
    },
  },
];

const FeedbackConfig = ({ ticket = null }) => {
  const [searchText, setSearchText] = React.useState("");
  const [dateRange, setDateRange] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Simulate loading state
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Helper function to normalize phone numbers
  const normalizePhone = phone => {
    if (!phone) return "";
    const cleaned = phone.toString().replace(/\D/g, "");
    return cleaned.replace(/^91/, "");
  };

  // Filter responses by mobile number if ticket is provided
  const filteredResponses = useMemo(() => {
    if (!STATIC_RESPONSES || STATIC_RESPONSES.length === 0) return [];

    // If no ticket provided, show all responses
    if (!ticket) return STATIC_RESPONSES;

    const mobile = ticket.mobile;
    if (!mobile) return [];

    const normalizedMobile = normalizePhone(mobile);

    return STATIC_RESPONSES.filter(response => {
      const responseData = response.response || {};
      const userNumber = responseData.userNumber;

      if (!userNumber) return false;

      const normalizedUserNumber = normalizePhone(userNumber);
      return normalizedUserNumber === normalizedMobile;
    });
  }, [ticket]);

  // Prepare table columns dynamically
  const columns = useMemo(() => {
    if (!filteredResponses || filteredResponses.length === 0) return [];

    const allKeys = new Set();
    filteredResponses.forEach(item => {
      Object.keys(item.response || {}).forEach(key => allKeys.add(key));
    });

    // Remove userNumber from columns if showing filtered data
    const keysToShow = Array.from(allKeys).filter(
      key => key.toLowerCase() !== "ticketid"
    );
    if (ticket && keysToShow.includes("userNumber")) {
      keysToShow.splice(keysToShow.indexOf("userNumber"), 1);
    }

    const dynamicColumns = keysToShow.map(key => {
      const column = {
        title:
          key.charAt(0).toUpperCase() +
          key
            .slice(1)
            .replace(/([A-Z])/g, " $1")
            .trim(),
        dataIndex: key,
        key,
        render: text => text || "N/A",
      };

      // Rating stars
      if (
        key.toLowerCase().includes("rating") ||
        key.toLowerCase().includes("star")
      ) {
        column.render = text => {
          if (!text) return "N/A";
          const stars = parseInt(text) || 0;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {[...Array(5)].map((_, i) => (
                <StarFilled
                  key={i}
                  style={{
                    color: i < stars ? "#faad14" : "#d9d9d9",
                    fontSize: "16px",
                  }}
                />
              ))}
              <span style={{ marginLeft: "4px", color: "#666" }}>({text})</span>
            </div>
          );
        };
      }

      // Experience Tag colors
      if (key.toLowerCase().includes("experience")) {
        column.render = text => {
          if (!text) return "N/A";
          const color =
            text.toLowerCase() === "good"
              ? "green"
              : text.toLowerCase() === "bad"
                ? "red"
                : text.toLowerCase() === "excellent"
                  ? "gold"
                  : "blue";
          return <Tag color={color}>{text}</Tag>;
        };
      }

      // Feedback/comments wrapping
      if (
        key.toLowerCase().includes("feedback") ||
        key.toLowerCase().includes("recommendation") ||
        key.toLowerCase().includes("comment")
      ) {
        column.width = 200;
        column.render = text => (
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxWidth: "200px",
            }}
          >
            {text || "N/A"}
          </div>
        );
      }

      return column;
    });

    return [
      {
        title: "S.No.",
        dataIndex: "sNo",
        key: "sNo",
        width: 80,
        fixed: "left",
      },
      {
        title: "Responded Date",
        dataIndex: "responsedTime",
        key: "responsedTime",
        width: 190,
        render: date => {
          if (!date) return "N/A";

          const d = new Date(date);
          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const year = d.getFullYear();
          let time = d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return `${day}/${month}/${year}, ${time}`;
        },
        fixed: "left",
      },
      {
        title: "Ticket ID",
        dataIndex: "TicketId",
        key: "TicketId",
        width: 120,
        fixed: "left",
        render: text => {
          if (!text || text === "N/A") return "N/A";
          return (
            <span
              onClick={() => console.log(`Navigate to ticket ${text}`)}
              style={{
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {text}
            </span>
          );
        },
      },
      ...dynamicColumns,
    ];
  }, [filteredResponses, ticket]);

  // Transform responses to table data
  let tableData =
    filteredResponses?.map((response, index) => ({
      key: response._id || index,
      sNo: index + 1,
      responsedTime: response.responsedTime,
      ...(response.response || {}),
    })) || [];

  // 🔍 Global Search Filter
  if (searchText.trim()) {
    const search = searchText.toLowerCase();
    tableData = tableData.filter(row =>
      Object.values(row).join(" ").toLowerCase().includes(search)
    );
  }

  // 📅 Date Range Filter
  if (dateRange?.length === 2) {
    const [start, end] = dateRange;
    tableData = tableData.filter(row => {
      if (!row.responsedTime) return false;
      const d = new Date(row.responsedTime);
      return d >= start && d <= end;
    });
  }

  if (isLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size='large' tip='Loading feedback...' />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message='Error Loading Feedback'
          description={
            error?.data?.message ||
            error?.message ||
            "Failed to load feedback responses"
          }
          type='error'
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: ticket ? "0" : "24px" }}>
      <Card
        bordered={!ticket}
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* LEFT SIDE TITLE */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                {ticket
                  ? `Feedback for ${ticket.customerName || ticket.name}`
                  : "All Feedback Responses"}
              </span>

              {ticket && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#555",
                    marginTop: 4,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <strong>Ticket ID:</strong> {ticket.ticketId}
                  </div>
                  <div>
                    <strong>Mobile:</strong> {ticket.mobile}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE FILTERS */}
            {!ticket && (
              <div style={{ display: "flex", gap: 12 }}>
                {/* 🔍 Global Search */}
                <Input
                  placeholder='Search...'
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: 200, borderRadius: 6 }}
                />

                {/* 📅 Ant Design RangePicker */}
                <RangePicker
                  allowClear
                  onChange={val => {
                    if (!val) return setDateRange([]);
                    setDateRange([
                      val[0].startOf("day").toDate(),
                      val[1].endOf("day").toDate(),
                    ]);
                  }}
                  style={{
                    width: "250px",
                    borderRadius: "10px",
                    backgroundColor:
                      "color-mix(in srgb, var(--primary-color) 20%, white)",
                    color: "black",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  className='custom-range-picker'
                  format='YYYY-MM-DD'
                />
              </div>
            )}
          </div>
        }
      >
        {filteredResponses.length === 0 ? (
          <Alert
            message={ticket ? "No Feedback Found" : "No Feedback Available"}
            description={
              ticket ? (
                <div>
                  <p>No feedback responses found for:</p>
                  <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                    <li>
                      <strong>Ticket ID:</strong> {ticket.ticketId}
                    </li>
                    <li>
                      <strong>Patient:</strong>{" "}
                      {ticket.customerName || ticket.name}
                    </li>
                    <li>
                      <strong>Mobile:</strong> {ticket.mobile}
                    </li>
                  </ul>
                  <p
                    style={{
                      marginTop: "12px",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    Note: Feedback is matched using the mobile number registered
                    with this ticket.
                  </p>
                </div>
              ) : (
                "No feedback responses have been received yet."
              )
            }
            type='info'
            showIcon
          />
        ) : (
          <Table
            className="leads-performance-table"
            columns={columns}
            dataSource={tableData}
            pagination={{
              pageSize: 10,
              showTotal: total =>
                `Total ${total} feedback response${total !== 1 ? "s" : ""}`,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
            }}
            scroll={{ x: "max-content" }}
            size='middle'
          />
        )}
      </Card>
    </div>
  );
};

export default FeedbackConfig;
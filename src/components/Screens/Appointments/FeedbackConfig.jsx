import React, { useMemo } from "react";
import { Card, Table, Spin, Alert, Tag } from "antd";
import { StarFilled } from "@ant-design/icons";

const FeedbackConfig = ({ appointment }) => {
  // ✅ Directly set flowName instead of extracting from configuration
  const flowName = "appointment-feedback";

  // Static data for feedback responses
  const staticResponses = [
    {
      _id: "1",
      responsedTime: "2024-03-15T10:30:00Z",
      response: {
        userNumber: "9876543210",
        rating: "5",
        experience: "Good",
        feedback: "Excellent service! The doctor was very patient and thorough.",
        recommendation: "Highly recommended"
      }
    },
    {
      _id: "2",
      responsedTime: "2024-03-14T14:45:00Z",
      response: {
        userNumber: "9876543211",
        rating: "4",
        experience: "Good",
        feedback: "Good experience overall. Waiting time was a bit long.",
        recommendation: "Would recommend"
      }
    },
    {
      _id: "3",
      responsedTime: "2024-03-13T09:15:00Z",
      response: {
        userNumber: "9876543212",
        rating: "3",
        experience: "Average",
        feedback: "Service was okay, but could be improved.",
        recommendation: "Maybe recommend"
      }
    },
    {
      _id: "4",
      responsedTime: "2024-03-12T16:20:00Z",
      response: {
        userNumber: "9876543213",
        rating: "2",
        experience: "Bad",
        feedback: "Not satisfied with the appointment scheduling process.",
        recommendation: "Not recommended"
      }
    },
    {
      _id: "5",
      responsedTime: "2024-03-11T11:10:00Z",
      response: {
        userNumber: "9876543210",
        rating: "5",
        experience: "Excellent",
        feedback: "Best healthcare experience ever! Very professional staff.",
        recommendation: "Definitely recommend"
      }
    },
    {
      _id: "6",
      responsedTime: "2024-03-10T13:25:00Z",
      response: {
        userNumber: "9876543214",
        rating: "4",
        experience: "Good",
        feedback: "Clean facilities and friendly staff.",
        additionalComments: "Parking was convenient"
      }
    },
    {
      _id: "7",
      responsedTime: "2024-03-09T15:40:00Z",
      response: {
        userNumber: "9876543211",
        rating: "1",
        experience: "Bad",
        feedback: "Very poor service. Will not visit again.",
        recommendation: "Not recommended"
      }
    },
    {
      _id: "8",
      responsedTime: "2024-03-08T10:05:00Z",
      response: {
        userNumber: "9876543215",
        rating: "5",
        experience: "Excellent",
        feedback: "Outstanding care and attention to detail.",
        recommendation: "Highly recommended",
        followUp: "Yes"
      }
    }
  ];

  // Simulate loading state
  const isLoading = false;
  const error = null;

  // Filter responses by appointment number OR mobile number if appointment prop is provided
  const filteredResponses = useMemo(() => {
    if (!staticResponses || staticResponses.length === 0) return [];

    // If appointment is provided, filter by mobile number (userNumber in response)
    if (appointment) {
      const mobile = appointment.mobile;

      if (!mobile) return [];

      return staticResponses.filter(response => {
        const responseData = response.response || {};
        const userNumber = responseData.userNumber;

        if (!userNumber) return false;

        // Normalize both numbers by removing country code for comparison
        const normalizedMobile = mobile.replace(/^91/, "");
        const normalizedUserNumber = userNumber.replace(/^91/, "");

        // Check for mobile number match (with and without country code)
        return (
          userNumber === mobile ||
          userNumber === normalizedMobile ||
          normalizedUserNumber === normalizedMobile ||
          `91${normalizedUserNumber}` === mobile ||
          `91${normalizedMobile}` === userNumber
        );
      });
    }

    // If no appointment prop, return all responses (for global view)
    return staticResponses;
  }, [appointment]);

  // Prepare table columns dynamically based on response keys
  const columns = useMemo(() => {
    if (!filteredResponses || filteredResponses.length === 0) return [];

    // Collect all unique keys from response.response objects
    const allKeys = new Set();
    filteredResponses.forEach(item => {
      Object.keys(item.response || {}).forEach(key => allKeys.add(key));
    });

    // Remove userNumber from columns if we're showing filtered data
    // (since we already know which user based on appointment)
    const keysToShow = Array.from(allKeys);
    if (appointment && keysToShow.includes("userNumber")) {
      keysToShow.splice(keysToShow.indexOf("userNumber"), 1);
    }

    // Build columns dynamically with custom renderers
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

      // Special rendering for rating field
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

      // Special rendering for experience field
      if (key.toLowerCase().includes("experience")) {
        column.render = text => {
          if (!text) return "N/A";
          const color =
            text.toLowerCase() === "good" || text.toLowerCase() === "excellent"
              ? "green"
              : text.toLowerCase() === "bad"
                ? "red"
                : text.toLowerCase() === "average"
                  ? "orange"
                  : "blue";
          return <Tag color={color}>{text}</Tag>;
        };
      }

      // Special rendering for feedback/recommendations (longer text)
      if (
        key.toLowerCase().includes("feedback") ||
        key.toLowerCase().includes("recommendation")
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

      // Special rendering for additional comments
      if (
        key.toLowerCase().includes("comments") ||
        key.toLowerCase().includes("followup")
      ) {
        column.width = 150;
        column.render = text => (
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {text || "N/A"}
          </div>
        );
      }

      return column;
    });

    // Add serial number column at start
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
        width: 180,
        render: date => {
          if (!date) return "N/A";
          const d = new Date(date);

          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const year = d.getFullYear();

          let hours = d.getHours();
          const minutes = String(d.getMinutes()).padStart(2, "0");
          const ampm = hours >= 12 ? "PM" : "AM";

          hours = hours % 12 || 12;
          hours = String(hours).padStart(2, "0");

          return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
        },
      },
      ...dynamicColumns,
    ];
  }, [filteredResponses, appointment]);

  // Transform responses to table data
  const tableData =
    filteredResponses?.map((response, index) => ({
      key: response._id || index,
      sNo: index + 1,
      responsedTime: response.responsedTime,
      ...(response.response || {}),
    })) || [];

  if (isLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size='large' />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message='Error loading responses'
          description={
            error?.data?.message ||
            error?.message ||
            "Failed to load feedback responses"
          }
          type='error'
        />
      </div>
    );
  }

  return (
    <div style={{ padding: appointment ? "0" : "24px" }}>
      <Card
        bordered={!appointment}
        title={
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Main Title */}
            <h5 style={{ fontSize: 16, fontWeight: 600 }}>
              {appointment
                ? `Feedback for ${appointment.name || "Appointment"}`
                : "All Reminder Feedback Responses"}
            </h5>

            {/* Sub info under title */}
            {appointment && (
              <div
                style={{
                  fontSize: 13,
                  color: "#555",
                  marginTop: 4,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div>
                  <strong>Appointment:</strong> {appointment.appointmentNo || "N/A"}
                  <br />
                  <strong>Mobile:</strong> {appointment.mobile || "N/A"}
                  <br />
                </div>
              </div>
            )}

            {/* Show info for static data */}
            {!appointment && (
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                Showing {filteredResponses.length} feedback responses (static data)
              </div>
            )}
          </div>
        }
      >
        {filteredResponses.length === 0 && appointment ? (
          <Alert
            message='No Feedback Found'
            description={
              <div>
                <p>No feedback responses found for:</p>
                <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                  <li>
                    <strong>Appointment:</strong> {appointment.appointmentNo || "N/A"}
                  </li>
                  <li>
                    <strong>Patient:</strong> {appointment.name || "N/A"}
                  </li>
                  <li>
                    <strong>Mobile:</strong> {appointment.mobile || "N/A"}
                  </li>
                </ul>
                <p
                  style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}
                >
                  Note: Feedback is matched using the mobile number registered
                  with this appointment. Currently showing static sample data.
                </p>
              </div>
            }
            type='info'
            showIcon
          />
        ) : (
          <>
            {/* Information about static data */}
            {appointment && filteredResponses.length > 0 && (
              <Alert
                message="Sample Static Data"
                description="This is showing sample feedback data. In a real application, this would be fetched from your database."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

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
              locale={{
                emptyText: appointment
                  ? `No feedback found for ${appointment.name || "this appointment"}`
                  : "No feedback responses available",
              }}
              size='middle'
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default FeedbackConfig;
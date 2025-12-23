import React, { useState } from "react";
import {
  Drawer,
  Button,
  Select,
  Row,
  Col,
  Card,
  Badge,
  Tooltip,
  Tag,
  Typography,
  Space,
  Avatar,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

const GoogleCalendarDrawer = ({
  visible,
  onClose,
  appointments = [], // Static appointments data
  selectedDate,
  setSelectedDate,
}) => {
  const [calendarView, setCalendarView] = useState("day");

  // Static appointments data if not provided
  const staticAppointments = appointments.length > 0 ? appointments : [
    {
      id: 1,
      name: "John Doe",
      appointmentDate: moment().add(1, 'day').toISOString(),
      timing: "10:00 AM - 10:30 AM",
      department: "Consultation",
      manager: "Dr. Smith",
      status: "scheduled",
      payment: "prepaid",
    },
    {
      id: 2,
      name: "Jane Smith",
      appointmentDate: moment().add(1, 'day').toISOString(),
      timing: "2:00 PM - 2:30 PM",
      department: "Dermatology",
      manager: "Dr. Johnson",
      status: "completed",
      payment: "postpaid",
    },
    {
      id: 3,
      name: "Robert Brown",
      appointmentDate: moment().add(2, 'days').toISOString(),
      timing: "11:00 AM - 11:30 AM",
      department: "Cardiology",
      manager: "Dr. Williams",
      status: "rescheduled",
      payment: "prepaid",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      appointmentDate: moment().toISOString(),
      timing: "3:00 PM - 3:30 PM",
      department: "Pediatrics",
      manager: "Dr. Davis",
      status: "scheduled",
      payment: "postpaid",
    },
    {
      id: 5,
      name: "Michael Lee",
      appointmentDate: moment().toISOString(),
      timing: "4:00 PM - 4:30 PM",
      department: "Orthopedics",
      manager: "Dr. Taylor",
      status: "scheduled",
      payment: "prepaid",
    },
  ];

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getAppointmentsForHour = (date, hour) => {
    const dateStr = date.format("YYYY-MM-DD");
    return staticAppointments.filter(apt => {
      if (!apt.appointmentDate || !apt.timing) return false;
      const aptDate = moment(apt.appointmentDate).format("YYYY-MM-DD");
      if (aptDate !== dateStr) return false;

      const timingMatch = apt.timing.match(/(\d+):?(\d+)?\s*(AM|PM)?/i);
      if (!timingMatch) return false;

      let aptHour = parseInt(timingMatch[1]);
      const ampm = timingMatch[3];

      if (ampm) {
        if (ampm.toUpperCase() === "PM" && aptHour !== 12) aptHour += 12;
        if (ampm.toUpperCase() === "AM" && aptHour === 12) aptHour = 0;
      }

      return aptHour === hour;
    });
  };

  const getWeekDays = date => {
    const startOfWeek = date.clone().startOf("week");
    return Array.from({ length: 7 }, (_, i) =>
      startOfWeek.clone().add(i, "days")
    );
  };

  const getAppointmentCountForDate = date => {
    const dateStr = date.format("YYYY-MM-DD");
    return staticAppointments.filter(apt => {
      if (!apt.appointmentDate) return false;
      return moment(apt.appointmentDate).format("YYYY-MM-DD") === dateStr;
    }).length;
  };

  const handlePrevious = () => {
    if (calendarView === "day") {
      setSelectedDate(prev => prev.clone().subtract(1, "day"));
    } else if (calendarView === "week") {
      setSelectedDate(prev => prev.clone().subtract(1, "week"));
    } else {
      setSelectedDate(prev => prev.clone().subtract(1, "month"));
    }
  };

  const handleNext = () => {
    if (calendarView === "day") {
      setSelectedDate(prev => prev.clone().add(1, "day"));
    } else if (calendarView === "week") {
      setSelectedDate(prev => prev.clone().add(1, "week"));
    } else {
      setSelectedDate(prev => prev.clone().add(1, "month"));
    }
  };

  const handleToday = () => {
    setSelectedDate(moment());
  };

  const getDateHeader = () => {
    if (calendarView === "day") {
      return selectedDate.format("MMMM D, YYYY");
    } else if (calendarView === "week") {
      const start = selectedDate.clone().startOf("week");
      const end = selectedDate.clone().endOf("week");
      return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
    } else {
      return selectedDate.format("MMMM YYYY");
    }
  };

  const getAppointmentColor = apt => {
    if (apt.status === "completed") return "#10b981";
    if (apt.status === "rescheduled") return "#f59e0b";
    if (apt.payment === "postpaid") return "#3b82f6";
    return "#8b5cf6";
  };

  const renderDayView = () => {
    const currentHour = moment().hour();
    const isToday = selectedDate.isSame(moment(), "day");

    return (
      <div
        style={{
          height: "calc(100vh - 350px)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <style>
          {`
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(-10px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            .hour-slot:hover {
              background: #f8fafc !important;
            }
          `}
        </style>
        <div>
          {hours.map(hour => {
            const appointments = getAppointmentsForHour(selectedDate, hour);
            const isCurrentHour = isToday && hour === currentHour;

            return (
              <div
                key={hour}
                className='hour-slot'
                style={{
                  display: "flex",
                  borderBottom: "1px solid #e5e7eb",
                  position: "relative",
                  background: isCurrentHour ? "#eff6ff" : "transparent",
                  transition: "background 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: 60,
                    padding: "6px 8px",
                    fontSize: 11,
                    color: isCurrentHour ? "#3b82f6" : "#9ca3af",
                    fontWeight: isCurrentHour ? 600 : 500,
                    borderRight: "1px solid #e5e7eb",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  {hour === 0
                    ? "12 AM"
                    : hour < 12
                      ? `${hour} AM`
                      : hour === 12
                        ? "12 PM"
                        : `${hour - 12} PM`}
                </div>

                <div
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    position: "relative",
                    minHeight: 48,
                  }}
                >
                  {isCurrentHour && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 6,
                        height: 2,
                        background: "#3b82f6",
                        zIndex: 10,
                        animation: "pulse 2s ease-in-out infinite",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: -4,
                          top: -3,
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#3b82f6",
                          border: "2px solid white",
                          boxShadow: "0 0 0 2px #3b82f6",
                        }}
                      />
                    </div>
                  )}

                  {appointments.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {appointments.map((apt, idx) => (
                        <Card
                          key={apt.id || idx}
                          size='small'
                          style={{
                            borderLeft: `3px solid ${getAppointmentColor(apt)}`,
                            borderRadius: 6,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                            cursor: "pointer",
                            transition:
                              "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            animation: `slideIn 0.3s ease-out ${idx * 0.05}s both`,
                          }}
                          bodyStyle={{ padding: "8px 10px" }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform =
                              "translateX(4px) scale(1.01)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(0,0,0,0.12)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform =
                              "translateX(0) scale(1)";
                            e.currentTarget.style.boxShadow =
                              "0 1px 3px rgba(0,0,0,0.08)";
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: 4,
                            }}
                          >
                            <Text
                              strong
                              style={{
                                fontSize: 13,
                                color: "#1f2937",
                                lineHeight: 1.3,
                              }}
                            >
                              <UserOutlined
                                style={{ marginRight: 4, fontSize: 11 }}
                              />
                              {apt.name}
                            </Text>
                            <Tag
                              color={
                                apt.payment === "prepaid"
                                  ? "success"
                                  : "processing"
                              }
                              style={{
                                margin: 0,
                                fontSize: 10,
                                padding: "0 6px",
                                lineHeight: "18px",
                                borderRadius: 4,
                              }}
                            >
                              {apt.payment}
                            </Tag>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                              fontSize: 11,
                            }}
                          >
                            <Text type='secondary' style={{ fontSize: 11 }}>
                              <ClockCircleOutlined style={{ marginRight: 3 }} />
                              {apt.timing}
                            </Text>

                            {apt.department && (
                              <Text type='secondary' style={{ fontSize: 11 }}>
                                <EnvironmentOutlined
                                  style={{ marginRight: 3 }}
                                />
                                {apt.department}
                              </Text>
                            )}
                          </div>

                          {apt.manager && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                marginTop: 5,
                              }}
                            >
                              <Avatar
                                size={18}
                                style={{ background: "#3b82f6", fontSize: 9 }}
                              >
                                {apt.manager.charAt(0).toUpperCase()}
                              </Avatar>
                              <Text style={{ fontSize: 11, color: "#6b7280" }}>
                                {apt.manager}
                              </Text>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(selectedDate);

    return (
      <div style={{ height: "calc(100vh - 280px)", overflowY: "auto" }}>
        <style>
          {`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
        <Row gutter={[6, 6]} style={{ marginBottom: 12 }}>
          {weekDays.map((day, idx) => {
            const isToday = day.isSame(moment(), "day");
            const isSelected = day.isSame(selectedDate, "day");
            const appointmentCount = getAppointmentCountForDate(day);

            return (
              <Col
                key={day.format("YYYY-MM-DD")}
                span={24 / 7}
                style={{ minWidth: 100 }}
              >
                <Card
                  onClick={() => {
                    setSelectedDate(day);
                    setCalendarView("day");
                  }}
                  style={{
                    cursor: "pointer",
                    border: isSelected
                      ? "2px solid #3b82f6"
                      : "1px solid #e5e7eb",
                    background: isToday
                      ? "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)"
                      : "white",
                    borderRadius: 8,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both`,
                  }}
                  bodyStyle={{ padding: 10 }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.transform =
                        "translateY(-3px) scale(1.02)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 16px rgba(0,0,0,0.1)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.transform =
                        "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <Text
                      type='secondary'
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {day.format("ddd")}
                    </Text>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        margin: "3px 0",
                        color: isToday ? "#3b82f6" : "#1f2937",
                      }}
                    >
                      {day.format("D")}
                    </div>
                    {appointmentCount > 0 && (
                      <Badge
                        count={appointmentCount}
                        style={{
                          background: isSelected ? "#3b82f6" : "#10b981",
                          fontSize: 10,
                          height: 18,
                          lineHeight: "18px",
                        }}
                      />
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        <div style={{ marginTop: 16 }}>
          {hours
            .filter(h => h >= 6 && h <= 22)
            .map(hour => {
              const hasAppointments = weekDays.some(
                day => getAppointmentsForHour(day, hour).length > 0
              );

              if (!hasAppointments) return null;

              return (
                <div key={hour} style={{ marginBottom: 12 }}>
                  <Text
                    strong
                    style={{
                      display: "block",
                      marginBottom: 6,
                      color: "#4b5563",
                      fontSize: 11,
                    }}
                  >
                    {hour === 0
                      ? "12 AM"
                      : hour < 12
                        ? `${hour} AM`
                        : hour === 12
                          ? "12 PM"
                          : `${hour - 12} PM`}
                  </Text>
                  <Row gutter={[6, 6]}>
                    {weekDays.map(day => {
                      const appointments = getAppointmentsForHour(day, hour);
                      return (
                        <Col key={day.format("YYYY-MM-DD")} span={24 / 7}>
                          {appointments.map((apt, idx) => (
                            <Tooltip
                              key={apt.id || idx}
                              title={
                                <div style={{ fontSize: 11 }}>
                                  <div style={{ fontWeight: 600 }}>
                                    {apt.name}
                                  </div>
                                  <div>{apt.timing}</div>
                                  <div>{apt.department}</div>
                                </div>
                              }
                            >
                              <Card
                                size='small'
                                style={{
                                  background: getAppointmentColor(apt),
                                  color: "white",
                                  borderRadius: 4,
                                  marginBottom: 3,
                                  cursor: "pointer",
                                  transition: "transform 0.2s ease",
                                }}
                                bodyStyle={{ padding: "4px 6px" }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.transform =
                                    "scale(1.05)";
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.transform = "scale(1)";
                                }}
                              >
                                <Text
                                  ellipsis
                                  style={{
                                    color: "white",
                                    fontSize: 10,
                                    fontWeight: 500,
                                  }}
                                >
                                  {apt.name}
                                </Text>
                              </Card>
                            </Tooltip>
                          ))}
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarOutlined style={{ fontSize: 16, color: "white" }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--primary)" }}>
            Calendar View
          </span>
        </div>
      }
      placement='right'
      onClose={onClose}
      open={visible}
      width='55%'
      style={{ maxWidth: 1200 }}
      bodyStyle={{ padding: 16, background: "#f9fafb" }}
    >
      <div
        style={{
          background: "white",
          padding: "12px 16px",
          borderRadius: 10,
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <Row gutter={12} align='middle'>
          <Col flex='none'>
            <Button
              onClick={handleToday}
              type='primary'
              style={{
                borderRadius: 6,
                height: 32,
                fontSize: 13,
                fontWeight: 500,
                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)",
                border: "none",
              }}
            >
              Today
            </Button>
          </Col>

          <Col flex='none'>
            <Space size={4}>
              <Button
                icon={<LeftOutlined style={{ fontSize: 12 }} />}
                onClick={handlePrevious}
                style={{ borderRadius: 6, height: 32, width: 32 }}
              />
              <Button
                icon={<RightOutlined style={{ fontSize: 12 }} />}
                onClick={handleNext}
                style={{ borderRadius: 6, height: 32, width: 32 }}
              />
            </Space>
          </Col>

          <Col flex='auto'>
            <Title
              level={5}
              style={{
                margin: 0,
                textAlign: "center",
                fontSize: 15,
                fontWeight: 600,
                color: "#1f2937",
              }}
            >
              {getDateHeader()}
            </Title>
          </Col>

          <Col flex='none'>
            <Select
              value={calendarView}
              onChange={setCalendarView}
              style={{ width: 100 }}
              size='middle'
            >
              <Option value='day'>Day</Option>
              <Option value='week'>Week</Option>
            </Select>
          </Col>
        </Row>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 10,
          padding: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          marginBottom: 16,
        }}
      >
        {calendarView === "day" && renderDayView()}
        {calendarView === "week" && renderWeekView()}
      </div>

      <Row gutter={12}>
        <Col span={8}>
          <Card
            style={{
              borderRadius: 8,
              textAlign: "center",
              background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
              border: "none",
            }}
            bodyStyle={{ padding: 14 }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#3b82f6",
                marginBottom: 2,
              }}
            >
              {staticAppointments.length}
            </div>
            <Text type='secondary' style={{ fontSize: 11 }}>
              Total
            </Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            style={{
              borderRadius: 8,
              textAlign: "center",
              background: "linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)",
              border: "none",
            }}
            bodyStyle={{ padding: 14 }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#10b981",
                marginBottom: 2,
              }}
            >
              {staticAppointments.filter(a => a.status === "completed").length}
            </div>
            <Text type='secondary' style={{ fontSize: 11 }}>
              Completed
            </Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            style={{
              borderRadius: 8,
              textAlign: "center",
              background: "linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%)",
              border: "none",
            }}
            bodyStyle={{ padding: 14 }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#f59e0b",
                marginBottom: 2,
              }}
            >
              {getAppointmentCountForDate(selectedDate)}
            </div>
            <Text type='secondary' style={{ fontSize: 11 }}>
              Today
            </Text>
          </Card>
        </Col>
      </Row>
    </Drawer>
  );
};

export default GoogleCalendarDrawer;
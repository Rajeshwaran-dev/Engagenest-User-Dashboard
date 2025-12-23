import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Switch,
  Spin,
  message,
  Popconfirm,
  Tabs,
} from "antd";
import { CalendarCheck, CalendarClock, CalendarDays } from "lucide-react";
import FollowUpScreen from "./FollowUpScreen";
import BusinessAlertConfig from "./BusinessAlertConfig";

const { Text } = Typography;
const { TabPane } = Tabs;

function Reminder() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Static notification configurations
  const staticNotificationConfigs = {
    success: true,
    data: {
      new_booking: {
        enabled: true,
        preliminaryMessage: {
          template: "Welcome {{name}}! Your appointment is confirmed for {{date}} at {{time}}.",
          variables: ["name", "date", "time"]
        }
      },
      reschedule_booking: {
        enabled: false,
        preliminaryMessage: {
          template: "Hi {{name}}, your appointment has been rescheduled to {{newDate}} at {{newTime}}.",
          variables: ["name", "newDate", "newTime"]
        }
      },
      appointment_completion: {
        enabled: true,
        preliminaryMessage: {
          template: "Thank you {{name}} for visiting us! Please share your feedback.",
          variables: ["name"]
        }
      }
    }
  };

  // Debug logs
  useEffect(() => {
    console.log("=== NOTIFICATION CONFIGS DEBUG ===");
    console.log(
      "Static notificationConfigs:",
      JSON.stringify(staticNotificationConfigs, null, 2)
    );

    const cardTitles = [
      "New Booking",
      "Reschedule Booking",
      "Appointment Completion",
    ];
    cardTitles.forEach(title => {
      const configKey = title.toLowerCase().replace(/\s+/g, "_");
      const config = staticNotificationConfigs?.data?.[configKey];
      console.log(`\n${title} (${configKey}):`, {
        exists: !!config,
        hasPrelimnaryMessage: !!config?.preliminaryMessage,
        hasTemplate: !!config?.preliminaryMessage?.template,
        templateDetails: config?.preliminaryMessage?.template,
        enabled: config?.enabled,
      });
    });
    console.log("=================================");
  }, []);

  const handleToggle = async (cardTitle, value) => {
    console.log(`Toggling ${cardTitle}:`, value);
    console.log(`\n=== TOGGLE DEBUG for ${cardTitle} ===`);
    console.log("Trying to set value to:", value);

    const configKey = cardTitle.toLowerCase().replace(/\s+/g, "_");
    const existingConfig = staticNotificationConfigs?.data?.[configKey];

    if (value && !existingConfig) {
      console.log("❌ No configuration found at all");
      message.warning(
        `Please configure ${cardTitle} before turning on the notification.`
      );
      return;
    }

    if (
      value &&
      existingConfig &&
      !existingConfig.preliminaryMessage?.template
    ) {
      console.log("⚠️ Configuration exists but missing template");
      message.warning(
        `${cardTitle} is enabled but missing a template. Please configure it properly.`
      );
    }

    try {
      console.log("Simulating API call to update status...");
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success(
        `${cardTitle} ${value ? "enabled" : "disabled"} successfully`
      );

      // In a real app, you would update state here
      // For static version, we'll just show the message
    } catch (error) {
      console.error(`❌ Error updating ${cardTitle} status:`, error);
      message.error(`Failed to ${value ? "enable" : "disable"} ${cardTitle}`);
    }
  };

  const getCardEnabledStatus = cardTitle => {
    const configKey = cardTitle.toLowerCase().replace(/\s+/g, "_");
    const config = staticNotificationConfigs?.data?.[configKey] || {};
    return config.enabled || false;
  };

  const handleCardClick = card => {
    setSelectedCard(card);
  };

  const handleCloseFollowUp = () => {
    setSelectedCard(null);
  };

  const alertCards = [
    {
      title: "New Booking",
      description:
        "Track and manage all new appointment bookings in your system with real-time updates.",
      icon: <CalendarDays size={24} color='#211f60' />,
    },
    {
      title: "Reschedule Booking",
      description:
        "Handle rescheduling requests and send automated alerts to customers about their new slots.",
      icon: <CalendarClock size={24} color='#211f60' />,
    },
    {
      title: "Appointment Completion",
      description:
        "Monitor completed appointments and gather feedback to improve service quality.",
      icon: <CalendarCheck size={24} color='#211f60' />,
    },
  ];

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "20px" }}>
      <Tabs defaultActiveKey="user" type="card">
        <TabPane tab={
          <span style={{ fontSize: "16px", fontWeight: "600" }}>
            User Alerts
          </span>
        } key="user">
          {selectedCard ? (
            <FollowUpScreen
              onClose={handleCloseFollowUp}
              cardTitle={selectedCard?.title}
            />
          ) : (
            <Row gutter={[24, 24]}>
              {alertCards.map((card, index) => (
                <Col key={index} xs={24} sm={12} md={12} lg={8} xl={8}>
                  <Card
                    hoverable
                    onClick={() => handleCardClick(card)}
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
                      cursor: "pointer",
                    }}
                    bodyStyle={{
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <Button
                          shape='circle'
                          style={{
                            backgroundColor: "#F1FBE2",
                            border: "none",
                            width: "50px",
                            height: "50px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {card.icon}
                        </Button>
                        <h5 style={{ margin: 0 }}>{card.title}</h5>
                      </div>
                      <div
                        onClick={(e) => {
                          if (e && typeof e.stopPropagation === "function") {
                            e.stopPropagation();
                          }
                        }}
                      >
                        <Popconfirm
                          title={`Are you sure you want to ${getCardEnabledStatus(card.title) ? "disable" : "enable"
                            } ${card.title}?`}
                          onConfirm={() =>
                            handleToggle(card.title, !getCardEnabledStatus(card.title))
                          }
                          okText="Yes"
                          cancelText="No"
                          placement="topRight"
                          onCancel={() => { }} // Safe no-op
                        >
                          <Switch
                            checked={getCardEnabledStatus(card.title)}
                            onClick={(e) => {
                              if (e && typeof e.stopPropagation === "function") {
                                e.stopPropagation();
                              }
                            }}
                            checkedChildren="ON"
                            unCheckedChildren="OFF"
                          />
                        </Popconfirm>
                      </div>
                    </div>
                    <hr />
                    <span
                      style={{
                        marginTop: "16px",
                        display: "block",
                      }}
                    >
                      {card.description}
                    </span>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </TabPane>

        <TabPane tab={
          <span style={{ fontSize: "16px", fontWeight: "600" }}>
            Business Alerts
          </span>
        } key="business">
          <BusinessAlertConfig />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default Reminder;
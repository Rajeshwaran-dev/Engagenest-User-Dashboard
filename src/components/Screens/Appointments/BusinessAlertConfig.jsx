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
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import FollowUpScreen from "./FollowUpScreen";
import { CalendarClock, CalendarDays } from "lucide-react";

const { Text } = Typography;

const BusinessAlertConfig = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 🧭 Static data for business alert configurations
  const [notificationConfigs, setNotificationConfigs] = useState({
    data: {
      new_booking: {
        enabled: true,
        preliminaryMessage: {
          template: "New booking alert template content",
          subject: "New Booking Alert"
        },
        cardType: "New Booking"
      },
      reschedule_booking: {
        enabled: false,
        preliminaryMessage: {
          template: "",
          subject: "Reschedule Alert"
        },
        cardType: "Reschedule Booking"
      }
    }
  });

  // 🧭 Map business alert config keys
  const businessAlertKeys = {
    "New Booking": "new_booking",
    "Reschedule Booking": "reschedule_booking",
  };

  // 🔍 Debug info
  useEffect(() => {
    console.log("=== BUSINESS ALERT CONFIG DEBUG (STATIC) ===");
    Object.entries(businessAlertKeys).forEach(([title, key]) => {
      const config = notificationConfigs?.data?.[key];
      console.log(`${title}:`, {
        exists: !!config,
        enabled: config?.enabled,
        hasTemplate: !!config?.preliminaryMessage?.template,
      });
    });
    console.log("====================================");
  }, [notificationConfigs]);

  // ✅ Simulate API call loading
  const simulateApiCall = async (action = "update") => {
    setIsLoading(true);
    return new Promise(resolve => {
      setTimeout(() => {
        setIsLoading(false);
        resolve({ success: true });
      }, 300);
    });
  };

  // ✅ toggle enable/disable
  const handleToggle = async (cardTitle, value, e) => {
    if (e) e.stopPropagation();

    const configKey = businessAlertKeys[cardTitle];
    const existingConfig = notificationConfigs?.data?.[configKey];

    if (value && !existingConfig) {
      message.warning(
        `Please configure ${cardTitle} before turning on the alert.`
      );
      return;
    }

    if (value && existingConfig && !existingConfig.preliminaryMessage?.template) {
      message.warning(
        `${cardTitle} alert enabled but missing a template. Please configure properly.`
      );
    }

    try {
      // Simulate API call
      await simulateApiCall("update");
      
      // Update local state
      setNotificationConfigs(prev => ({
        ...prev,
        data: {
          ...prev.data,
          [configKey]: {
            ...prev.data[configKey],
            enabled: value
          }
        }
      }));

      message.success(
        `${cardTitle} alert ${value ? "enabled" : "disabled"} successfully`
      );
      
      // Simulate refetch
      console.log("Refetching data...");
    } catch (error) {
      console.error("❌ Error updating Business Alert status:", error);
      message.error(
        `Failed to ${value ? "enable" : "disable"} ${cardTitle} alert`
      );
    }
  };

  // ✅ get enabled state
  const getCardEnabledStatus = cardTitle => {
    const configKey = businessAlertKeys[cardTitle];
    const config = notificationConfigs?.data?.[configKey] || {};
    return config.enabled || false;
  };

  // ✅ click handler
  const handleCardClick = card => {
    setSelectedCard(card);
  };

  const handleCloseFollowUp = () => {
    setSelectedCard(null);
    // Simulate refetch
    console.log("Refetching data after closing FollowUpScreen...");
  };

  // 🧩 define business alert cards
  const alertCards = [
    {
      title: "New Booking",
      description:
        "Send notifications to your business team whenever a new appointment is booked.",
      icon: <CalendarDays size={24} color='var(--primary)' />,
      key: "new_booking"
    },
    {
      title: "Reschedule Booking",
      description:
        "Notify your team automatically when a customer reschedules an appointment.",
      icon: <CalendarClock size={24} color='var(--primary)' />,
      key: "reschedule_booking"
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

  // ✅ card UI
  return (
    <div>
      {selectedCard ? (
        <FollowUpScreen
          onClose={handleCloseFollowUp}
          cardTitle={selectedCard?.title}
          isBusinessAlert={true}
          // Pass static config data
          initialConfig={notificationConfigs?.data?.[selectedCard.key]}
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
                bodyStyle={{ padding: "20px" }}
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
                  <div onClick={e => e.stopPropagation()}>
                    <Popconfirm
                      title={`Are you sure you want to ${
                        getCardEnabledStatus(card.title)
                          ? "disable"
                          : "enable"
                      } ${card.title} alert?`}
                      onConfirm={e =>
                        handleToggle(
                          card.title,
                          !getCardEnabledStatus(card.title),
                          e
                        )
                      }
                      okText='Yes'
                      cancelText='No'
                      placement='topRight'
                      onCancel={e => e.stopPropagation()}
                    >
                      <Switch
                        checked={getCardEnabledStatus(card.title)}
                        onClick={e => e.stopPropagation()}
                        checkedChildren='ON'
                        unCheckedChildren='OFF'
                      />
                    </Popconfirm>
                  </div>
                </div>
                <hr />
                <Text
                  style={{
                    marginTop: "16px",
                    display: "block",
                  }}
                >
                  {card.description}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default BusinessAlertConfig;
import React, { useState, useEffect } from "react";
import { Row, Col, Button, Typography, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  BellOutlined,
  AlertOutlined,
  SmileOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import NotificationForm from "./NotificationForm";

const { Title } = Typography;

const NotificationSettings = ({ onBack }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const notificationCards = [
    {
      title: "Ticket Assigned",
      description: "Send notification when a new ticket is Assigned",
      icon: <UserOutlined />,
    },
    {
      title: "Ticket Awaiting for Customer",
      description:
        "Send notification when a ticket is Awaiting for Customer Response",
      icon: <BellOutlined />,
    },
    {
      title: "Ticket Pending",
      description: "Send notification when ticket status is Pending",
      icon: <AlertOutlined />,
    },
    {
      title: "Ticket In Progress",
      description: "Send notification when ticket status is in progress",
      icon: <AlertOutlined />,
    },
    {
      title: "Ticket Completed",
      description: "Send notification when a ticket is completed",
      icon: <SmileOutlined />,
    },
    {
      title: "Ticket Reopened", // Added Ticket Reopened
      description: "Send notification when a ticket is reopened",
      icon: <SyncOutlined />,
    },
    {
      title: "Agent Response Delay",
      description: "Send notification when Agent Response Delay",
      icon: <AlertOutlined />,
    },
    {
      title: "Ticket Resolve Time",
      description: "Send notification when Ticket Resolve Time is exceeded",
      icon: <AlertOutlined />,
    },
  ];

  // ✅ Automatically select "Ticket Assigned" on mount
  useEffect(() => {
    const defaultCard = notificationCards.find(
      card => card.title === "Ticket Assigned"
    );
    setSelectedCard(defaultCard);
  }, []);

  const handleCardClick = card => {
    console.log("Selected notification card:", card.title);
    setSelectedCard(card);
  };

  const handleClose = () => {
    setSelectedCard(null);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      console.log("Back button clicked");
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Button
            type='primary'
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ marginBottom: 15, borderRadius: "8px" }}
          >
            Back
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            Notification Configuration
          </Title>
        </div>
      </div>

      {/* Pills Layout */}
      <Row gutter={[12, 12]} wrap>
        {notificationCards.map((card, index) => {
          const isSelected = selectedCard?.title === card.title;
          return (
            <Col key={index}>
              <Tooltip title={card.description}>
                <Button
                className="button-color"
                  shape='round'
                  icon={card.icon}
                  onClick={() => handleCardClick(card)}
                  type={isSelected ? "primary" : "default"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderRadius: "20px",
                    padding: "0 16px",
                    height: "36px",
                    background: isSelected ? "var(--primary)" : "",
                    boxShadow: isSelected
                      ? "0 2px 8px rgba(30,164,67,0.3)"
                      : "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {card.title}
                </Button>
              </Tooltip>
            </Col>
          );
        })}
      </Row>

      {/* Selected Card Form Section */}
      {selectedCard && (
        <div style={{ marginTop: 30 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <NotificationForm
                selectedCard={selectedCard}
                notifications={notifications}
                setNotifications={setNotifications}
                onClose={handleClose}
                alertType='businessAlert'
                title={`${selectedCard.title} - Business Alert`}
              />
            </Col>
            {!["Agent Response Delay", "Ticket Resolve Time"].includes(
              selectedCard.title
            ) && (
              <Col xs={24} lg={12}>
                <NotificationForm
                  selectedCard={selectedCard}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  onClose={handleClose}
                  alertType='userAlert'
                  title={`${selectedCard.title} - User Alert`}
                />
              </Col>
            )}
          </Row>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
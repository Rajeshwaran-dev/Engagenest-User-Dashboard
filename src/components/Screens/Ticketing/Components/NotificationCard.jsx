import React from "react";
import { Card, Typography } from "antd";
import {
  UserOutlined,
  BellOutlined,
  AlertOutlined,
  SmileOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const iconComponents = {
  UserOutlined: UserOutlined,
  BellOutlined: BellOutlined,
  AlertOutlined: AlertOutlined,
  SmileOutlined: SmileOutlined,
};

// Static notification cards data
const STATIC_NOTIFICATION_CARDS = [
  {
    id: 1,
    title: "Ticket Created",
    description: "Send notification when a new ticket is created",
    icon: "BellOutlined",
  },
  {
    id: 2,
    title: "Ticket Assigned",
    description: "Notify when ticket is assigned to an agent",
    icon: "UserOutlined",
  },
  {
    id: 3,
    title: "Ticket Completed",
    description: "Alert when ticket is marked as completed",
    icon: "AlertOutlined",
  },
  {
    id: 4,
    title: "Customer Reply",
    description: "Notify on customer response",
    icon: "SmileOutlined",
  },
];

const NotificationCard = ({ card, isSelected, onClick }) => {
  const IconComponent = iconComponents[card.icon];

  const handleClick = () => {
    console.log(`Notification card clicked: ${card.title}`);
    if (onClick) {
      onClick(card);
    } else {
      // Default behavior if no handler provided
      alert(`Selected: ${card.title}\n${card.description}`);
    }
  };

  return (
    <Card
      hoverable
      className='notification-card'
      onClick={handleClick}
      style={{
        height: "100%",
        border: isSelected ? "2px solid var(--primary)" : "1px solid #f0f0f0",
        backgroundColor: isSelected ? "#f6ffed" : "white",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <IconComponent
          style={{ 
            fontSize: 32, 
            color: isSelected ? "var(--primary)" : "#666", 
            marginBottom: 12,
            transition: "color 0.3s ease"
          }}
        />
        <Title level={5} style={{ marginBottom: 8, color: isSelected ? "var(--primary)" : "inherit" }}>
          {card.title}
        </Title>
        <Text type='secondary' style={{ fontSize: 12 }}>
          {card.description}
        </Text>
      </div>
    </Card>
  );
};

// Export both the component and static data
export { NotificationCard as default, STATIC_NOTIFICATION_CARDS };
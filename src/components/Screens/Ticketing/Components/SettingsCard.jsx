import React from "react";
import { Card, Typography } from "antd";
import FeatherIcon from "feather-icons-react";
import {
  ClockCircleOutlined,
  BellOutlined,
  GlobalOutlined,
  MessageOutlined,
  VideoCameraOutlined,
  AlertOutlined,
  SmileOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const iconComponents = {
  ClockCircleOutlined: ClockCircleOutlined,
  BellOutlined: BellOutlined,
  GlobalOutlined: GlobalOutlined,
  MessageOutlined: MessageOutlined,
  VideoCameraOutlined: VideoCameraOutlined,
  AlertOutlined: AlertOutlined,
  SmileOutlined: SmileOutlined,
};

const SettingsCard = ({ item, onClick }) => {
  const renderIcon = () => {
    if (iconComponents[item.icon]) {
      const IconComponent = iconComponents[item.icon];
      return (
        <div 
          className="icon-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "12px",
            backgroundColor: "rgba(33, 31, 96, 0.15)", // Changed to match your theme color
            marginBottom: 16,
            border: "1px solid rgba(33, 31, 96, 0.2)", // Changed to match your theme color
          }}
        >
          <IconComponent style={{ fontSize: 22, color: "#211f60" }} /> {/* Changed text color */}
        </div>
      );
    }
    // Feather icon
    return (
      <div 
        className="icon-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 48,
          height: 48,
          borderRadius: "12px",
          backgroundColor: "rgba(33, 31, 96, 0.15)", // Changed to match your theme color
          marginBottom: 16,
          border: "1px solid rgba(33, 31, 96, 0.2)", // Changed to match your theme color
        }}
      >
        <FeatherIcon
          icon={item.icon}
          style={{ fontSize: 22, color: "#211f60" }} // Changed text color
        />
      </div>
    );
  };

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      style={{
        height: "100%",
        minHeight: 180,
        borderRadius: "16px",
        border: "none",
        background: "#ffffff", // Changed to white
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)", // Lighter shadow for white background
        transition: "all 0.3s ease",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
      }}
      bodyStyle={{
        padding: "20px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
      className="settings-card-monochrome"
    >
      {/* Subtle gradient overlay - updated colors */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "60%",
          height: "60%",
          background: "linear-gradient(135deg, rgba(94, 92, 230, 0.08) 0%, rgba(255, 255, 255, 0) 70%)", // Lighter gradient
          borderRadius: "0 0 0 100%",
          pointerEvents: "none",
        }}
      />
      
      {/* Bottom accent line */}
      <div 
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, var(--primary) 0%, #a29dff 100%)",
          transform: "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.3s ease",
        }}
        className="accent-line"
      />
      
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        position: "relative",
        zIndex: 2
      }}>
        {renderIcon()}
        
        <Title 
          level={5} 
          style={{ 
            marginBottom: 8,
            color: "#211f60", // Changed to your theme color
            fontSize: "16px",
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          {item.title}
        </Title>
        
        <Text 
          style={{ 
            fontSize: "13px",
            lineHeight: 1.5,
            color: "rgba(33, 31, 96, 0.7)", // Changed to your theme color with opacity
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: 16,
          }}
        >
          {item.description}
        </Text>
        
        {/* Configure button */}
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 12,
            borderTop: "1px solid rgba(33, 31, 96, 0.1)", // Changed to your theme color
          }}
        >
          <span 
            style={{
              color: "var(--primary)", // Changed to your theme color
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Configure
          </span>
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none"
            style={{ 
              color: "var(--primary)", // Changed to your theme color
              transition: "transform 0.3s ease"
            }}
            className="arrow-icon"
          >
            <path 
              d="M9 18L15 12L9 6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Card>
  );
};

// Add global styles for hover effects - updated for white background
const globalStyles = `
  .settings-card-monochrome:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(33, 31, 96, 0.15);
    background: #ffffff; /* Keep white on hover */
  }
  
  .settings-card-monochrome:hover .icon-container {
    background-color: rgba(33, 31, 96, 0.2); /* Adjusted for theme color */
    transform: translateY(-2px);
  }
  
  .settings-card-monochrome:hover .accent-line {
    transform: scaleX(1);
  }
  
  .settings-card-monochrome:hover .arrow-icon {
    transform: translateX(4px);
  }
  
  /* Subtle pulse animation on icon */
  @keyframes icon-pulse {
    0% { box-shadow: 0 0 0 0 rgba(94, 92, 230, 0.3); } /* Adjusted color */
    70% { box-shadow: 0 0 0 6px rgba(94, 92, 230, 0); }
    100% { box-shadow: 0 0 0 0 rgba(94, 92, 230, 0); }
  }
  
  .settings-card-monochrome:hover .icon-container {
    animation: icon-pulse 1.5s infinite;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = globalStyles;
  document.head.appendChild(style);
}

export default SettingsCard;
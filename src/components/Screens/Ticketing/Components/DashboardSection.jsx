import React from "react";
import { Input, Row, Col, Card, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import FeatherIcon from "feather-icons-react";
import SettingsCard from "./SettingsCard";

const { Title, Text } = Typography;
const { Search } = Input;

// Static data for settings categories
const staticSettingsCategories = [
  {
    title: "Ticketing",
    items: [
      {
        key: "ticketing-settings",
        title: "Ticketing Settings",
        description: "Configure ticketing workflows and fields",
        icon: "settings",
        isFeather: true,
      },
      {
        key: "customer-response-flow",
        title: "Customer Response Flow",
        description: "Manage customer response form fields",
        icon: "message-square",
        isFeather: true,
      },
      {
        key: "sla-policies",
        title: "SLA Policies",
        description: "Set up service level agreements",
        icon: "clock",
        isFeather: true,
      },
    ],
  },
  {
    title: "General",
    items: [
      {
        key: "business-hours",
        title: "Business Hours",
        description: "Set your working hours and timezone",
        icon: "calendar",
        isFeather: true,
      },
      {
        key: "departments",
        title: "Departments",
        description: "Manage organizational departments",
        icon: "users",
        isFeather: true,
      },
      {
        key: "agents",
        title: "Agents",
        description: "Manage agent permissions and roles",
        icon: "user-check",
        isFeather: true,
      },
    ],
  },
];

// Static recent items
const staticRecentItems = ["Ticketing Settings", "Customer Response Flow", "SLA Policies"];

const DashboardSection = ({
  searchTerm,
  recentItems = staticRecentItems,
  settingsCategories = staticSettingsCategories,
  filteredItems,
  onSearch,
  onCardClick,
}) => {
  const renderIcon = (icon, isFeather) => {
    if (isFeather) {
      return (
        <FeatherIcon icon={icon} style={{ fontSize: 24, color: "var(--primary)" }} />
      );
    }
    return <div style={{ fontSize: 24, color: "var(--primary)" }}>📋</div>;
  };

  // Filter items based on search term
  const getFilteredItems = () => {
    if (!searchTerm) return [];
    
    const searchLower = searchTerm.toLowerCase();
    return settingsCategories
      .flatMap(cat => cat.items)
      .filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
  };

  const filteredItemsData = searchTerm ? getFilteredItems() : [];

  return (
    <div>
      {/* Search Section */}
      <div style={{ marginBottom: 15 }}>
        <Input
          placeholder='Search settings'
          allowClear
          size='large'
          style={{ maxWidth: 500, borderRadius: 8 }}
          onChange={e => onSearch(e.target.value)}
          prefix={<SearchOutlined />}
        />
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div>
          <Title level={4} style={{ marginBottom: 5, color: "#666" }}>
            Search Results
          </Title>
          {filteredItemsData.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredItemsData.map(item => (
                <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
                  <SettingsCard
                    item={item}
                    onClick={() => onCardClick(item.key)}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Text type='secondary'>No settings found for "{searchTerm}"</Text>
            </div>
          )}
        </div>
      )}

      {/* Recent Section */}
      {!searchTerm && recentItems.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Title level={4} style={{ marginBottom: 16}}>
            Recent
          </Title>
          <Row gutter={[16, 16]}>
            {recentItems.slice(0, 6).map(recentTitle => {
              const item = settingsCategories
                .flatMap(cat => cat.items)
                .find(item => item.title === recentTitle);
              if (!item) return null;

              return (
                <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
                  <SettingsCard
                    item={item}
                    onClick={() => onCardClick(item.key)}
                  />
                </Col>
              );
            })}
          </Row>
        </div>
      )}

      {/* All Settings Categories */}
      {!searchTerm &&
        settingsCategories.map(category => (
          <div key={category.title} style={{ marginBottom: 15 }}>
            <Title level={4} style={{ marginBottom: 16, }}>
              {category.title}
            </Title>
            <Row gutter={[16, 16]}>
              {category.items.map(item => (
                <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
                  <SettingsCard
                    item={item}
                    onClick={() => onCardClick(item.key)}
                  />
                </Col>
              ))}
            </Row>
          </div>
        ))}
    </div>
  );
};

export default DashboardSection;
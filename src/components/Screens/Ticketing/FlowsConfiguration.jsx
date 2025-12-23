
import React, { useState } from "react";
import { Tabs } from "antd";
import TicketingFlowsTab from "./Components/FlowsTab";
import CustomerResponseFlowTab from "./Components/CustomerResponseFlowTab";

const { TabPane } = Tabs;

const FlowsConfiguration = () => {
  const [activeTab, setActiveTab] = useState("1");

  const handleTabChange = key => {
    setActiveTab(key);
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        type='card'
        size='large'
        style={{
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <TabPane tab={<span style={{ fontWeight: 600 }}>Ticketing Flow</span>} key='1'>
          <TicketingFlowsTab />
        </TabPane>
        <TabPane tab={<span style={{ fontWeight: 600 }}>Customer Response Flow</span>} key='2'>
          <CustomerResponseFlowTab />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default FlowsConfiguration;
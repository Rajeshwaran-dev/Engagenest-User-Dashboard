import React, { useState, useEffect } from "react";
import { Button, Card, Typography, Space, message, Spin } from "antd";

const { Title, Text } = Typography;

export default function GoogleCalendarIntegration() {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      // Static configuration data
      // Change to null to simulate disconnected state
      const staticConfig = {
        success: true,
        data: {
          email: "user@example.com",
          connected: true,
          lastSynced: "2024-01-15T10:30:00Z"
        }
      };
      
      setConfig(staticConfig.data);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleConnect = async () => {
    try {
      message.info("Redirecting to Google authentication...");
      
      // Simulate authentication process
      setTimeout(() => {
        // Simulate successful connection
        setConfig({
          email: "user@example.com",
          connected: true,
          lastSynced: new Date().toISOString()
        });
        message.success("Successfully connected to Google Calendar!");
      }, 2000);
      
    } catch (err) {
      console.error(err);
      message.error("Error connecting to Google Calendar");
    }
  };

  const handleDisconnect = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfig(null);
      message.success("Disconnected successfully");
    } catch (error) {
      message.error("Failed to disconnect");
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin />
      </div>
    );
  }

  return (
    <Card style={{ padding: 24 }}>
      <Title level={4}>Google Calendar Integration</Title>

      {config ? (
        <Space direction='vertical'>
          <Text type='secondary'>
            Connected to: {config.email || "Unknown account"}
          </Text>
          {config.lastSynced && (
            <Text type='secondary'>
              Last synced: {new Date(config.lastSynced).toLocaleString()}
            </Text>
          )}
          <Button
            danger
            onClick={handleDisconnect}
          >
            Disconnect Google Calendar
          </Button>
        </Space>
      ) : (
        <Space direction='vertical'>
          <Text type='secondary'>
            Connect your Google Calendar to sync appointments automatically.
          </Text>
          <Button type='primary' onClick={handleConnect}>
            Connect Google Calendar
          </Button>
        </Space>
      )}
    </Card>
  );
}
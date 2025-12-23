import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Typography,
  message,
  Spin,
  Select,
  Checkbox,
  Row,
  Col,
  Tooltip,
  Switch,
  Divider,
  Alert,
  Popconfirm,
} from "antd";
import {
  CloudUploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { Option } = Select;

// Static webhook configuration
const STATIC_WEBHOOK_CONFIG = {
  webhookUrl: "https://api.example.com/webhook",
  eventType: "All",
  webhookEnabled: true,
  webhookEvents: ["ticket_created", "ticket_updated", "ticket_completed"],
  headerParameters: [
    { key: "Authorization", value: "Bearer your-token-here" },
    { key: "Content-Type", value: "application/json" },
  ],
};

const WebhookSettings = ({ onBack }) => {
  const [editMode, setEditMode] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [eventType, setEventType] = useState("All");
  const [enabled, setEnabled] = useState(true);
  const [selectedEvents, setSelectedEvents] = useState({
    ticket_created: true,
    ticket_updated: true,
    ticket_completed: true,
  });
  const [headerParameters, setHeaderParameters] = useState([
    { key: "", value: "" },
  ]);
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setIsLoading(true);
    
    setTimeout(() => {
      setWebhookUrl(STATIC_WEBHOOK_CONFIG.webhookUrl || "");
      setEventType(STATIC_WEBHOOK_CONFIG.eventType || "All");
      setEnabled(STATIC_WEBHOOK_CONFIG.webhookEnabled !== undefined ? STATIC_WEBHOOK_CONFIG.webhookEnabled : true);

      if (STATIC_WEBHOOK_CONFIG.eventType === "Custom" && STATIC_WEBHOOK_CONFIG.webhookEvents) {
        const events = {};
        STATIC_WEBHOOK_CONFIG.webhookEvents.forEach(event => {
          events[event] = true;
        });
        setSelectedEvents({
          ticket_created: events.ticket_created || false,
          ticket_updated: events.ticket_updated || false,
          ticket_completed: events.ticket_completed || false,
        });
      }

      if (STATIC_WEBHOOK_CONFIG.headerParameters && Array.isArray(STATIC_WEBHOOK_CONFIG.headerParameters)) {
        setHeaderParameters(
          STATIC_WEBHOOK_CONFIG.headerParameters.length > 0
            ? STATIC_WEBHOOK_CONFIG.headerParameters
            : [{ key: "", value: "" }]
        );
      }
      
      setIsLoading(false);
    }, 500);
  }, []);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!webhookUrl) {
      message.error("Please enter a webhook URL");
      return;
    }

    try {
      new URL(webhookUrl);
    } catch (error) {
      message.error("Please enter a valid URL");
      return;
    }

    const validHeaders = headerParameters.filter(
      header => header.key.trim() && header.value.trim()
    );
    const hasInvalidHeaders = headerParameters.some(
      header =>
        (header.key.trim() && !header.value.trim()) ||
        (!header.key.trim() && header.value.trim())
    );

    if (hasInvalidHeaders) {
      message.error(
        "All header parameters must have both key and value filled or be empty"
      );
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      message.success("Webhook configuration saved successfully");
      setEditMode(false);
      
      // Update static configuration
      STATIC_WEBHOOK_CONFIG.webhookUrl = webhookUrl;
      STATIC_WEBHOOK_CONFIG.webhookEnabled = enabled;
      STATIC_WEBHOOK_CONFIG.eventType = eventType;
      STATIC_WEBHOOK_CONFIG.webhookEvents = 
        eventType === "All"
          ? ["ticket_created", "ticket_updated", "ticket_completed"]
          : Object.keys(selectedEvents).filter(key => selectedEvents[key]);
      STATIC_WEBHOOK_CONFIG.headerParameters = validHeaders;
      
    } catch (error) {
      message.error("Failed to save webhook configuration");
    }
  };

  const handleTest = async () => {
    if (!webhookUrl) {
      message.error("Please configure a webhook URL first");
      return;
    }

    try {
      setIsTesting(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        setTestResult({
          success: true,
          message: "Webhook test successful! Received 200 OK response.",
          data: {
            status: 200,
            responseTime: "345ms",
            timestamp: new Date().toISOString(),
          },
        });
        message.success("Webhook test successful!");
      } else {
        setTestResult({
          success: false,
          message: "Webhook test failed: Connection timeout",
        });
        message.error("Webhook test failed");
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Webhook test failed: Network error",
      });
      message.error("Webhook test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    setWebhookUrl("");
    setEventType("All");
    setEnabled(true);
    setSelectedEvents({
      ticket_created: true,
      ticket_updated: true,
      ticket_completed: true,
    });
    setHeaderParameters([{ key: "", value: "" }]);
    setTestResult(null);
    setEditMode(true);
  };

  const handleEventTypeChange = value => {
    setEventType(value);
    if (value === "All") {
      setSelectedEvents({
        ticket_created: true,
        ticket_updated: true,
        ticket_completed: true,
      });
    }
  };

  const handleEventChange = (eventKey, checked) => {
    setSelectedEvents(prev => ({
      ...prev,
      [eventKey]: checked,
    }));
  };

  const addHeaderParameter = () => {
    setHeaderParameters([...headerParameters, { key: "", value: "" }]);
  };

  const removeHeaderParameter = index => {
    if (headerParameters.length > 1) {
      const newHeaders = headerParameters.filter((_, i) => i !== index);
      setHeaderParameters(newHeaders);
    }
  };

  const updateHeaderParameter = (index, field, value) => {
    const newHeaders = headerParameters.map((header, i) =>
      i === index ? { ...header, [field]: value } : header
    );
    setHeaderParameters(newHeaders);
  };

  const handleUrlChange = value => {
    setWebhookUrl(value);
    if (testResult) {
      setTestResult(null);
    }
  };

  if (isLoading) {
    return (
      <Spin
        size='large'
        style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
      />
    );
  }

  return (
    <div>
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
            onClick={onBack}
            style={{ paddingLeft: 10, marginBottom: 15, borderRadius: "8px" }}
          >
            Back
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            Webhook Configuration
          </Title>
        </div>
      </div>

      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
        }}
      >
        <div style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <CloudUploadOutlined
                style={{ fontSize: "24px", color: "var(--primary)" }}
              />
              <Title level={4} style={{ margin: 0 }}>
                Webhook Configuration
              </Title>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Text>Enabled:</Text>
              <Switch
                checked={enabled}
                onChange={setEnabled}
                disabled={!editMode}
                checkedChildren={<CheckCircleOutlined />}
                unCheckedChildren='OFF'
              />
            </div>
          </div>

          {testResult && (
            <Alert
              message={testResult.message}
              type={testResult.success ? "success" : "error"}
              showIcon
              closable
              onClose={() => setTestResult(null)}
              style={{ marginBottom: "16px" }}
            />
          )}

          <Row gutter={16} style={{ marginBottom: "24px" }}>
            <Col span={16}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Webhook URL <span style={{ color: "red" }}>*</span>
              </Text>
              <Input
                value={webhookUrl}
                onChange={e => handleUrlChange(e.target.value)}
                disabled={!editMode}
                placeholder='Enter webhook URL (e.g., https://api.example.com/webhook)'
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={8}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Event Type <span style={{ color: "red" }}>*</span>
              </Text>
              <Select
                value={eventType}
                onChange={handleEventTypeChange}
                disabled={!editMode}
                style={{ width: "100%" }}
              >
                <Option value='All'>All Events</Option>
                <Option value='Custom'>Custom Events</Option>
              </Select>
            </Col>
          </Row>

          {editMode && eventType === "Custom" && (
            <div style={{ marginBottom: "24px" }}>
              <Text strong style={{ display: "block", marginBottom: "16px" }}>
                Select Events to Send
              </Text>
              <Row gutter={16}>
                <Col span={8}>
                  <Checkbox
                    checked={selectedEvents.ticket_created}
                    onChange={e =>
                      handleEventChange("ticket_created", e.target.checked)
                    }
                  >
                    Ticket Created
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox
                    checked={selectedEvents.ticket_updated}
                    onChange={e =>
                      handleEventChange("ticket_updated", e.target.checked)
                    }
                  >
                    Ticket Updated
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox
                    checked={selectedEvents.ticket_completed}
                    onChange={e =>
                      handleEventChange("ticket_completed", e.target.checked)
                    }
                  >
                    Ticket Completed
                  </Checkbox>
                </Col>
              </Row>
            </div>
          )}

          <Divider />

          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <Text strong>Header Parameters (Optional)</Text>
              {editMode && (
                <Tooltip title='Add custom headers for authentication'>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={addHeaderParameter}
                    size='small'
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "#fff",
                      borderRadius: "10px",
                    }}
                  >
                    Add Header
                  </Button>
                </Tooltip>
              )}
            </div>
            {headerParameters.map((header, index) => (
              <Row key={index} gutter={8} style={{ marginBottom: "8px" }}>
                <Col span={5}>
                  <Input
                    placeholder='Header Key'
                    value={header.key}
                    onChange={e =>
                      updateHeaderParameter(index, "key", e.target.value)
                    }
                    disabled={!editMode}
                  />
                </Col>
                <Col span={8}>
                  <Input
                    placeholder='Header Value'
                    value={header.value}
                    onChange={e =>
                      updateHeaderParameter(index, "value", e.target.value)
                    }
                    disabled={!editMode}
                  />
                </Col>
                <Col span={2}>
                  {editMode && headerParameters.length > 1 && (
                    <Popconfirm
                      title='Are you sure you want to delete this parameter?'
                      okText='Yes'
                      cancelText='No'
                      onConfirm={() => removeHeaderParameter(index)}
                    >
                      <Tooltip title='Delete parameter'>
                        <Button type='text' icon={<DeleteOutlined />} danger />
                      </Tooltip>
                    </Popconfirm>
                  )}
                </Col>
              </Row>
            ))}
          </div>

          <Divider />

          <div style={{ marginBottom: "24px" }}>
            <Text strong style={{ display: "block", marginBottom: "16px" }}>
              Sample Payload Structure
            </Text>
            <pre
              style={{
                backgroundColor: "#f6f8fa",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "13px",
                overflow: "auto",
                border: "1px solid #e1e4e8",
              }}
            >
              {JSON.stringify(
                {
                  event: "ticket_created",
                  timestamp: "2025-10-06T09:41:22.594Z",
                  userId: "user_123",
                  data: {
                    ticket_id: "TKT_67890",
                    ticketId: "TK001",
                    subject: "Unable to login to my account",
                    description:
                      "I'm getting an error message when trying to login with my credentials.",
                    priority: "high",
                    status: "open",
                    customer: {
                      name: "John Doe",
                      email: "john.doe@example.com",
                      phone: "+1234567890",
                    },
                    department: "Technical Support",
                    assignedTo: "agent@example.com",
                    source: "web",
                    dueDate: "2025-10-08T09:41:22.594Z",
                    created_at: "2025-10-06T09:41:22.594Z",
                    updated_at: "2025-10-06T09:41:22.594Z",
                  },
                },
                null,
                2
              )}
            </pre>
            <Text
              type='secondary'
              style={{
                fontSize: "12px",
                display: "block",
                marginTop: "8px",
              }}
            >
              Your webhook endpoint should accept POST requests with JSON payloads
            </Text>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-start",
            }}
          >
            {!editMode ? (
              <Button
                type='primary'
                onClick={handleEdit}
                style={{
                  backgroundColor: "var(--primary)",
                  borderColor: "var(--primary)",
                  borderRadius: 8,
                }}
              >
                Edit Configuration
              </Button>
            ) : (
              <Button
                type='primary'
                onClick={handleSave}
                style={{
                  backgroundColor: "var(--primary)",
                  borderColor: "var(--primary)",
                  borderRadius: 8,
                }}
              >
                Save Configuration
              </Button>
            )}
            <Button
              type='default'
              style={{ borderRadius: 8 }}
              onClick={handleTest}
              loading={isTesting}
              disabled={!webhookUrl || !enabled}
              icon={<SendOutlined />}
            >
              {isTesting ? "Testing..." : "Test Webhook"}
            </Button>
            <Button
              type='default'
              style={{ borderRadius: 8 }}
              onClick={handleReset}
              danger
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WebhookSettings;
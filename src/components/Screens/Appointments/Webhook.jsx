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
  Popconfirm,
} from "antd";
import {
  CloudUploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { Option } = Select;

const Webhook = () => {
  const [editMode, setEditMode] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [eventType, setEventType] = useState("All");
  const [enabled, setEnabled] = useState(true);
  const [selectedEvents, setSelectedEvents] = useState({
    appointmentCreation: true,
    appointmentReschedule: true,
    appointmentCompletion: true,
  });
  const [headerParameters, setHeaderParameters] = useState([
    { key: "", value: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Static webhook data
  const staticWebhookData = {
    success: true,
    data: {
      url: "https://api.example.com/webhook",
      eventType: "All",
      enabled: true,
      events: {
        appointmentCreation: true,
        appointmentReschedule: true,
        appointmentCompletion: true,
      },
      headerParameters: [
        { key: "Header Key", value: "Header Value" },
      ],
    },
  };

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      if (staticWebhookData && staticWebhookData.success && staticWebhookData.data) {
        const config = staticWebhookData.data;
        setWebhookUrl(config.url || "");
        setEventType(config.eventType || "All");
        setEnabled(config.enabled !== undefined ? config.enabled : true);

        if (config.eventType === "Custom" && config.events) {
          setSelectedEvents({
            appointmentCreation: config.events.appointmentCreation || false,
            appointmentReschedule: config.events.appointmentReschedule || false,
            appointmentCompletion: config.events.appointmentCompletion || false,
          });
        }

        if (config.headerParameters && Array.isArray(config.headerParameters)) {
          setHeaderParameters(
            config.headerParameters.length > 0
              ? config.headerParameters
              : [{ key: "", value: "" }]
          );
        }
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

    // Validate URL format
    try {
      new URL(webhookUrl);
    } catch (error) {
      message.error("Please enter a valid URL");
      return;
    }

    // Validate header parameters
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
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success("Webhook configuration saved successfully");
      setEditMode(false);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const randomSuccess = Math.random() > 0.3; // 70% success rate
      if (randomSuccess) {
        message.success("Webhook test successful!");
      } else {
        message.error("Webhook test failed");
      }
      setIsTesting(false);
    } catch (error) {
      message.error("Webhook test failed");
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    setWebhookUrl("");
    setEventType("All");
    setEnabled(true);
    setSelectedEvents({
      appointmentCreation: true,
      appointmentReschedule: true,
      appointmentCompletion: true,
    });
    setHeaderParameters([{ key: "", value: "" }]);
    setEditMode(true);
  };

  const handleEventTypeChange = value => {
    setEventType(value);
    if (value === "All") {
      setSelectedEvents({
        appointmentCreation: true,
        appointmentReschedule: true,
        appointmentCompletion: true,
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
    const newHeaders = [...headerParameters];
    newHeaders[index][field] = value;
    setHeaderParameters(newHeaders);
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
    <div style={{ paddingTop: "20px" }}>
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

          <Row gutter={16} style={{ marginBottom: "24px" }}>
            <Col span={16}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Webhook URL <span style={{ color: "red" }}>*</span>
              </Text>
              <Input
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
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
                    checked={selectedEvents.appointmentCreation}
                    onChange={e =>
                      handleEventChange("appointmentCreation", e.target.checked)
                    }
                  >
                    Appointment Creation
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox
                    checked={selectedEvents.appointmentReschedule}
                    onChange={e =>
                      handleEventChange(
                        "appointmentReschedule",
                        e.target.checked
                      )
                    }
                  >
                    Appointment Reschedule
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox
                    checked={selectedEvents.appointmentCompletion}
                    onChange={e =>
                      handleEventChange(
                        "appointmentCompletion",
                        e.target.checked
                      )
                    }
                  >
                    Appointment Completion
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
            </div>
            {headerParameters.map((header, index) => (
              <Row key={index} gutter={8} style={{ marginBottom: "8px" }}>
                <Col span={5}>
                  <Input
                    placeholder='Header Key (e.g., Authorization)'
                    value={header.key}
                    onChange={e =>
                      updateHeaderParameter(index, "key", e.target.value)
                    }
                    disabled={!editMode}
                  />
                </Col>
                <Col span={8}>
                  <Input
                    placeholder='Header Value (e.g., Bearer token123)'
                    value={header.value}
                    onChange={e =>
                      updateHeaderParameter(index, "value", e.target.value)
                    }
                    disabled={!editMode}
                  />
                </Col>
                <Col span={1}>
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
                      Add
                    </Button>
                  </Tooltip>
                )}
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
                color: "var(--text-secondary)",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "13px",
                lineHeight: "1.6",
                overflowX: "auto",
                border: "1px solid #e1e4e8",
                whiteSpace: "pre-wrap", // <-- THIS makes JSON render line by line
                wordBreak: "break-word", // helps prevent horizontal scroll
              }}
            >
              {JSON.stringify(
                {
                  event: "appointmentCreation",
                  timestamp: "2024-01-15T10:30:00Z",
                  userId: "user_123",
                  data: {
                    appointmentId: "appt_456",
                    appointmentNo: "A000001",
                    name: "John Doe",
                    mobile: "+1234567890",
                    appointmentDate: "2024-01-20T14:00:00Z",
                    timing: "2:00 PM - 2:30 PM",
                    status: "current",
                    department: "Consultation",
                    manager: "Dr. Smith",
                    managerId: "mgr_789",
                    description: "Regular checkup appointment",
                    createdAt: "2024-01-15T10:30:00Z",
                    updatedAt: "2024-01-15T10:30:00Z",
                  },
                },
                null,
                2
              )}
            </pre>

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
              Test Webhook
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

export default Webhook;
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
  Popconfirm,
} from "antd";
import {
  CloudUploadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { Option } = Select;

// Static webhook configuration data
const staticWebhookData = {
  url: "https://api.example.com/webhook",
  eventType: "All",
  events: {
    leadCreation: true,
    leadUpdation: true,
    leadDeletion: true,
    convertedToCustomer: true,
  },
  headerParameters: [
    { key: "Header Key", value: "Header Value" },
  ],
};

const WebhookConfigTab = () => {
  const [editMode, setEditMode] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [eventType, setEventType] = useState("All");
  const [selectedEvents, setSelectedEvents] = useState({
    leadCreation: true,
    leadUpdation: true,
    leadDeletion: true,
    convertedToCustomer: true,
  });
  const [headerParameters, setHeaderParameters] = useState([
    { key: "Header Key", value: "Header Value" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Initialize with static data
  useEffect(() => {
    // Simulate loading delay
    setIsLoading(true);

    setTimeout(() => {
      const config = staticWebhookData;
      setWebhookUrl(config.url || "");
      setEventType(config.eventType || "All");

      if (config.eventType === "Custom" && config.events) {
        setSelectedEvents({
          leadCreation: config.events.leadCreation || false,
          leadUpdation: config.events.leadUpdation || false,
          leadDeletion: config.events.leadDeletion || false,
          convertedToCustomer: config.events.convertedToCustomer || false,
        });
      }

      if (config.headerParameters && Array.isArray(config.headerParameters)) {
        const clonedHeaders = config.headerParameters.map(h => ({ ...h }));
        setHeaderParameters(
          clonedHeaders.length > 0 ? clonedHeaders : [{ key: "", value: "" }]
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
      // Simulate API call delay
      setIsLoading(true);

      setTimeout(() => {
        // Update static data (in a real app this would be in state/context)
        const webhookConfig = {
          url: webhookUrl,
          eventType: eventType,
          events:
            eventType === "All"
              ? {
                leadCreation: true,
                leadUpdation: true,
                leadDeletion: true,
                convertedToCustomer: true,
              }
              : selectedEvents,
          headerParameters: validHeaders,
        };

        console.log("Webhook config saved:", webhookConfig);

        message.success("Webhook configuration saved successfully");
        setEditMode(false);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      message.error("Failed to save webhook configuration");
      setIsLoading(false);
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
      setTimeout(() => {
        // Simulate test response
        const testSuccess = Math.random() > 0.3; // 70% success rate for demo

        if (testSuccess) {
          message.success("Webhook test successful! Response received.");
        } else {
          message.error("Webhook test failed - No response received");
        }

        setIsTesting(false);
      }, 2000);
    } catch (error) {
      message.error("Webhook test failed");
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    setWebhookUrl("");
    setEventType("All");
    setSelectedEvents({
      leadCreation: true,
      leadUpdation: true,
      leadDeletion: true,
      convertedToCustomer: true,
    });
    setHeaderParameters([{ key: "", value: "" }]);
    setEditMode(true);
  };

  const handleEventTypeChange = value => {
    setEventType(value);
    if (value === "All") {
      setSelectedEvents({
        leadCreation: true,
        leadUpdation: true,
        leadDeletion: true,
        convertedToCustomer: true,
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
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div >
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <CloudUploadOutlined
              style={{ fontSize: "24px", color: "var(--primary)" }}
            />
            <Title level={4} style={{ margin: 0 }}>
              Webhook Configuration
            </Title>
          </div>

          <Row gutter={16} style={{ marginBottom: "24px" }}>
            <Col span={12}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Webhook URL <span style={{ color: "red" }}>*</span>
              </Text>
              <Input
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                disabled={!editMode}
                placeholder='Enter webhook URL (e.g., https://api.example.com/webhook)'
                style={{ width: "177%" }}
              />
            </Col>
            <Col
              span={12}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Events <span style={{ color: "red" }}>*</span>
              </Text>
              <Select
                value={eventType}
                onChange={handleEventTypeChange}
                disabled={!editMode}
                style={{ width: "25%" }}
              >
                <Option value='All'>All</Option>
                <Option value='Custom'>Custom</Option>
              </Select>
            </Col>
          </Row>

          {editMode && eventType === "Custom" && (
            <div style={{ marginBottom: "24px" }}>
              <Text strong style={{ display: "block", marginBottom: "16px" }}>
                Select Events
              </Text>
              <Row gutter={16}>
                <Col span={6}>
                  <Checkbox
                    checked={selectedEvents.leadCreation}
                    onChange={e =>
                      handleEventChange("leadCreation", e.target.checked)
                    }
                  >
                    Lead Creation
                  </Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox
                    checked={selectedEvents.leadUpdation}
                    onChange={e =>
                      handleEventChange("leadUpdation", e.target.checked)
                    }
                  >
                    Lead Updation
                  </Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox
                    checked={selectedEvents.leadDeletion}
                    onChange={e =>
                      handleEventChange("leadDeletion", e.target.checked)
                    }
                  >
                    Lead Deletion
                  </Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox
                    checked={selectedEvents.convertedToCustomer}
                    onChange={e =>
                      handleEventChange("convertedToCustomer", e.target.checked)
                    }
                  >
                    Converted to Customer
                  </Checkbox>
                </Col>
              </Row>
            </div>
          )}

          <div style={{ marginBottom: "24px" }}>
            {/* Header + Add button aligned on right */}
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
                <Tooltip title='Add more parameters'>
                  <Button
                    icon={<PlusOutlined style={{ color: "#fff" }} />}
                    onClick={addHeaderParameter}
                    size='small'
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "#fff",
                      borderRadius: "8px",
                      padding: "0 12px",
                    }}
                  >
                    Add
                  </Button>
                </Tooltip>
              )}
            </div>

            {/* Dynamic Header Parameter Rows */}
            {headerParameters.map((header, index) => (
              <Row key={index} gutter={12} style={{ marginBottom: "10px" }}>
                {/* Header Key */}
                <Col xs={24} sm={10} md={8}>
                  <Input
                    placeholder='Header Key'
                    value={header.key}
                    onChange={e =>
                      updateHeaderParameter(index, "key", e.target.value)
                    }
                    disabled={!editMode}
                  />
                </Col>

                {/* Header Value */}
                <Col xs={24} sm={10} md={12}>
                  <Input
                    placeholder='Header Value'
                    value={header.value}
                    onChange={e =>
                      updateHeaderParameter(index, "value", e.target.value)
                    }
                    disabled={!editMode}
                  />
                </Col>

                {/* Delete Button */}
                <Col xs={24} sm={4} md={1}>
                  {editMode && headerParameters.length > 1 && (
                    <Tooltip title='Delete this parameter'>
                      <Popconfirm
                        title='Are you sure?'
                        description='Do you really want to delete this parameter?'
                        okText='Yes'
                        cancelText='No'
                        onConfirm={() => removeHeaderParameter(index)}
                      >
                        <Button
                          type='text'
                          icon={<DeleteOutlined />}
                          danger
                          style={{ width: "100%" }}
                          onClick={e => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </Tooltip>
                  )}
                </Col>
              </Row>
            ))}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <Text strong style={{ display: "block", marginBottom: "16px" }}>
              Sample Payload
            </Text>
            <pre
              style={{
                color: "var(--text-secondary)",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "14px",
                overflow: "auto",
                whiteSpace: "pre-wrap",
                lineHeight: "1.6",
              }}
            >
              {`{
    event: lead_created
    timestamp: 2023-07-20T12:34:56Z
    data:
    leadId: 507f1f77bcf86cd799439011
    name: John Doe
    email: john@example.com
    mobile: 1234567890
    company: Example Corp
    status: New Lead
}`}
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
                Edit
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
                Save
              </Button>
            )}
            <Button
              type='primary'
              onClick={handleTest}
              loading={isTesting}
              style={{
                backgroundColor: "var(--primary)",
                borderColor: "var(--primary)",
                borderRadius: 8,
              }}
            >
              Test Webhook
            </Button>
            <Button
              type='primary'
              onClick={handleReset}
              style={{
                backgroundColor: "var(--primary)",
                borderColor: "var(--primary)",
                borderRadius: 8,
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WebhookConfigTab;
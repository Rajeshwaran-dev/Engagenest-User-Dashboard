import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Typography,
  Divider,
  message,
  Tooltip,
  Upload,
  Modal,
  Spin,
  Switch,
  Space,
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  UploadOutlined,
  ReloadOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
// Removed API imports

const { Title, Text } = Typography;
const { Option } = Select;

// Static data for approved templates
const STATIC_APPROVED_TEMPLATES = [
  {
    id: "1",
    _id: "1",
    name: "Welcome Template",
    templateName: "Welcome Template",
    type: "WhatsApp",
    channelType: "WhatsApp",
    headerType: "text",
    message: "Hello {customerName}, welcome to our service! Your ticket ID is {ticketId}.",
    body: "Hello {customerName}, welcome to our service! Your ticket ID is {ticketId}.",
    content: "Hello {customerName}, welcome to our service! Your ticket ID is {ticketId}.",
    variables: ["customerName", "ticketId"],
    parameters: ["customerName", "ticketId"],
    footer: "Thank you for choosing us",
    header: "Welcome Header",
    language: "en",
    actions: [
      { type: "button", text: "View Details" },
      { type: "button", text: "Contact Support" }
    ]
  },
  {
    id: "2",
    _id: "2",
    name: "Ticket Update Template",
    templateName: "Ticket Update Template",
    type: "SMS",
    channelType: "SMS",
    headerType: "image",
    message: "Dear {customerName}, your ticket {ticketId} status has been updated to {status}.",
    body: "Dear {customerName}, your ticket {ticketId} status has been updated to {status}.",
    content: "Dear {customerName}, your ticket {ticketId} status has been updated to {status}.",
    variables: ["customerName", "ticketId", "status"],
    parameters: ["customerName", "ticketId", "status"],
    footer: "Thank you",
    header: "Update Notification",
    language: "en",
    actions: [
      { type: "button", text: "Check Status" }
    ]
  },
  {
    id: "3",
    _id: "3",
    name: "Resolution Template",
    templateName: "Resolution Template",
    type: "WhatsApp",
    channelType: "WhatsApp",
    headerType: "video",
    message: "Hi {customerName}, your ticket {ticketId} has been resolved by {assignedTo}.",
    body: "Hi {customerName}, your ticket {ticketId} has been resolved by {assignedTo}.",
    content: "Hi {customerName}, your ticket {ticketId} has been resolved by {assignedTo}.",
    variables: ["customerName", "ticketId", "assignedTo"],
    parameters: ["customerName", "ticketId", "assignedTo"],
    footer: "Best regards",
    header: "Resolution Update",
    language: "en",
    actions: []
  }
];

// Static reminder configurations
const STATIC_REMINDER_CONFIGS = {
  "Ticket Created": {
    businessAlert: {
      enabled: true,
      templateId: "1",
      templateName: "Welcome Template",
      templateType: "WhatsApp",
      headerType: "text",
      message: "Hello {customerName}, welcome to our service! Your ticket ID is {ticketId}.",
      variableMappings: {
        customerName: "customerName",
        ticketId: "ticketId"
      },
      fileUrl: "",
      actions: [
        { type: "button", text: "View Details" },
        { type: "button", text: "Contact Support" }
      ]
    },
    userAlert: {
      enabled: false,
      templateId: "",
      variableMappings: {},
      fileUrl: ""
    }
  },
  "Ticket Assigned": {
    businessAlert: {
      enabled: true,
      templateId: "2",
      templateName: "Ticket Update Template",
      templateType: "SMS",
      headerType: "image",
      message: "Dear {customerName}, your ticket {ticketId} status has been updated to {status}.",
      variableMappings: {
        customerName: "customerName",
        ticketId: "ticketId",
        status: "status"
      },
      fileUrl: "https://example.com/image.jpg",
      actions: [
        { type: "button", text: "Check Status" }
      ]
    }
  }
};

const NotificationForm = ({ selectedCard, onClose, alertType, title }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState([]);
  const [variableMappings, setVariableMappings] = useState({});
  const [fileList, setFileList] = useState([]);
  const [fileUrl, setFileUrl] = useState("");
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Static approved templates
  const approvedTemplates = useMemo(() => {
    return STATIC_APPROVED_TEMPLATES.map(template => ({
      id: template.id || template._id,
      name: template.name || template.templateName || "Unnamed Template",
      type: template.type || template.channelType || "WhatsApp",
      headerType: template.headerType || "text",
      message: template.message || template.body || template.content || "",
      variables: template.variables || template.parameters || [],
      ...template,
    }));
  }, []);

  // Load existing configuration
  useEffect(() => {
    // Always clear state first when alertType or selectedCard changes
    const clearState = () => {
      setSelectedTemplate(null);
      setTemplateVariables([]);
      setVariableMappings({});
      setFileList([]);
      setFileUrl("");
      setIsEnabled(true);
    };

    clearState();

    // Simulate loading delay
    setIsLoading(true);
    setTimeout(() => {
      if (selectedCard?.title) {
        const config = STATIC_REMINDER_CONFIGS[selectedCard.title]?.[alertType];

        // Only populate if config exists
        if (config && Object.keys(config).length > 0) {
          setIsEnabled(config.enabled !== false);
          const template = approvedTemplates.find(
            t => t.id === config.templateId || t._id === config.templateId
          );

          if (template) {
            // Merge the template data with the saved configuration data
            const mergedTemplate = {
              ...template,
              variableMappings: config.variableMappings,
              fileUrl: config.fileUrl,
            };

            setSelectedTemplate(mergedTemplate);
            const vars =
              template.variables && template.variables.length > 0
                ? template.variables
                : extractVariablesFromMessage(template.message);
            setTemplateVariables(vars);
            setVariableMappings(config.variableMappings || {});
            setFileUrl(config.fileUrl || "");

            if (config.fileUrl) {
              setFileList([
                {
                  uid: "-1",
                  name: "Uploaded File",
                  status: "done",
                  url: config.fileUrl,
                },
              ]);
            }
          }
        }
      }
      setIsLoading(false);
    }, 500);
  }, [selectedCard?.title, alertType, approvedTemplates]);

  const handleToggle = async enabled => {
    Modal.confirm({
      title: `Confirm ${enabled ? "Enable" : "Disable"} Alert`,
      content: `Are you sure you want to ${enabled ? "enable" : "disable"} this ${
        alertType === "businessAlert" ? "Business" : "User"
      } Alert configuration?`,
      okText: "Yes",
      cancelText: "Cancel",
      okType: enabled ? "primary" : "danger",
      onOk: async () => {
        setIsEnabled(enabled);

        // Simulate API call
        setTimeout(() => {
          message.success(
            `${
              alertType === "businessAlert" ? "Business" : "User"
            } Alert ${enabled ? "enabled" : "disabled"} successfully!`
          );
        }, 300);
      },
      onCancel: () => {
        // Revert the toggle switch visually if user cancels
        setIsEnabled(prev => !enabled);
      },
    });
  };

  const extractVariablesFromMessage = message => {
    if (!message) return [];
    const variableRegex = /{([^}]+)}/g;
    const matches = message.match(variableRegex);
    return matches ? matches.map(match => match.replace(/[{}]/g, "")) : [];
  };

  const leadFields = [
    { value: "customerName", label: "Customer Name" },
    { value: "mobileNumber", label: "Customer Mobile" },
    { value: "custom_field_1759410270994", label: "Customer Email" },
    { value: "department_field", label: "Department" },
    { value: "subject", label: "Subject" },
    { value: "status", label: "Ticket Status" },
    { value: "source", label: "Ticket Source" },
    { value: "ticketId", label: "Ticket ID" },
    { value: "priority", label: "Ticket Priority" },
    { value: "assignedTo", label: "Assignee Name" },
    { value: "reason", label: "On change Reason" },
  ];

  const handleTemplateSelect = template => {
    setSelectedTemplate(template);
    const variables =
      template.variables && template.variables.length > 0
        ? template.variables
        : extractVariablesFromMessage(template.message);
    setTemplateVariables(variables);

    // Initialize mappings
    const initialMappings = {};
    variables.forEach(variable => {
      initialMappings[variable] = variableMappings[variable] || "";
    });
    setVariableMappings(initialMappings);
  };

  const handleVariableMappingChange = (variable, field) => {
    setVariableMappings(prev => ({
      ...prev,
      [variable]: field,
    }));
  };

  const handleFileChange = info => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);

    setFileList(newFileList);

    if (info.file.status === "done") {
      // Simulate uploaded URL
      const uploadedUrl = "https://example.com/uploaded-file.jpg";
      
      console.log("File uploaded successfully");
      
      if (uploadedUrl) {
        setFileUrl(uploadedUrl);
        message.success("File uploaded successfully");
      } else {
        console.error("No URL found in response");
        message.error("File uploaded but URL not found");
      }
    } else if (info.file.status === "error") {
      console.error("Upload error");
      message.error("File upload failed: Unknown error");
    }
  };

  const handleBeforeUpload = file => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const isLt5M = file.size / 1024 / 1024 < 5;
    const isLt16M = file.size / 1024 / 1024 < 16;
    const isLt100M = file.size / 1024 / 1024 < 100;

    if (selectedTemplate?.headerType === "image" && !isImage) {
      message.error("You can only upload image files!");
      return false;
    }
    if (selectedTemplate?.headerType === "video" && !isVideo) {
      message.error("You can only upload video files!");
      return false;
    }
    if (selectedTemplate?.headerType === "image" && !isLt5M) {
      message.error("Image must be smaller than 5MB!");
      return false;
    }
    if (selectedTemplate?.headerType === "video" && !isLt16M) {
      message.error("Video must be smaller than 16MB!");
      return false;
    }
    if (selectedTemplate?.headerType === "file" && !isLt100M) {
      message.error("File must be smaller than 100MB!");
      return false;
    }
    return true;
  };

  const getAcceptString = () => {
    switch (selectedTemplate?.headerType) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      case "file":
        return "*";
      default:
        return "";
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) {
      message.error("Please select a template first");
      return;
    }

    // Validate required variables are mapped
    const missingMappings = templateVariables.filter(
      variable =>
        !variableMappings[variable] || variableMappings[variable].trim() === ""
    );

    if (missingMappings.length > 0) {
      message.error(`Please map all variables: ${missingMappings.join(", ")}`);
      return;
    }

    // Validate file upload if required
    if (
      selectedTemplate.headerType === "image" ||
      selectedTemplate.headerType === "video" ||
      selectedTemplate.headerType === "file"
    ) {
      // Check if file is still uploading
      if (fileList.length > 0 && fileList[0].status === "uploading") {
        message.warning("Please wait for the file to finish uploading");
        return;
      }

      // Check if fileUrl exists
      if (!fileUrl) {
        message.error(`Please upload ${selectedTemplate.headerType} first`);
        return;
      }
    }

    const configData = {
      eventType:
        selectedCard?.title === "Ticket Completed"
          ? "Ticket Resolved"
          : selectedCard?.title,
      alertType: alertType,
      configData: {
        templateId: selectedTemplate.id || selectedTemplate._id,
        templateName: selectedTemplate.name,
        templateType: selectedTemplate.type,
        headerType: selectedTemplate.headerType,
        message: selectedTemplate.message,
        variableMappings: variableMappings,
        fileUrl: fileUrl || "",
        enabled: isEnabled,
        actions: selectedTemplate.actions || [],
        footer: selectedTemplate.footer || "",
        header: selectedTemplate.header || "",
        language: selectedTemplate.language || "en",
      },
    };

    console.log("Saving configuration with actions:", configData);
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      message.success(
        `${alertType === "businessAlert" ? "Business" : "User"} Alert configuration saved successfully!`
      );
    }, 500);
  };

  const handleReset = async () => {
    Modal.confirm({
      title: "Reset Configuration",
      content: `Are you sure you want to reset the ${alertType === "businessAlert" ? "Business" : "User"} Alert configuration? This action cannot be undone.`,
      okText: "Yes, Reset",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setIsResetting(true);
        
        // Simulate API call
        setTimeout(() => {
          // Clear local state
          setSelectedTemplate(null);
          setTemplateVariables([]);
          setVariableMappings({});
          setFileList([]);
          setFileUrl("");
          setIsEnabled(true);
          setIsResetting(false);
          
          message.success("Configuration reset successfully");
        }, 500);
      },
    });
  };

  const handleResetTemplate = () => {
    setSelectedTemplate(null);
    setTemplateVariables([]);
    setVariableMappings({});
    setFileList([]);
    setFileUrl("");
    message.info("Template selection cleared");
  };

  if (isLoading) {
    return (
      <Card style={{ marginTop: 16 }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size='large' />
          <div style={{ marginTop: 16 }}>Loading configuration...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Left side: title */}
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>

          {/* Right side: toggle */}
          <Switch
            checked={isEnabled}
            onChange={handleToggle}
            checkedChildren='ON'
            unCheckedChildren='OFF'
            style={{
              backgroundColor: isEnabled ? "var(--primary)" : "#ccc",
            }}
          />
        </div>
      }
      style={{ marginTop: 16, borderRadius: "15px" }}
    >
      {/* Template Selection Section */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <label
            style={{
              fontWeight: "500",
              textAlign: "left",
              marginRight: "auto",
            }}
          >
            Select Template <span style={{ color: "red" }}>*</span>
          </label>

          {selectedTemplate ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "8px", fontWeight: "bold" }}>
                Template: {selectedTemplate.name}
              </span>
              <Tooltip title='Change template'>
                <Button
                  type='text'
                  icon={<CloudUploadOutlined />}
                  onClick={() => setComposeModalOpen(true)}
                  style={{ color: "var(--primary)", marginRight: "8px" }}
                />
              </Tooltip>
            </div>
          ) : (
            <Button
              type='text'
              icon={<CloudUploadOutlined />}
              onClick={() => setComposeModalOpen(true)}
              style={{ color: "var(--primary)" }}
            >
              Select Template
            </Button>
          )}
        </div>

        {/* Template Preview */}
        {selectedTemplate && (
          <div
            style={{
              backgroundColor: "#E2FFE8",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#283046",
                }}
              >
                <span style={{ color: "#666" }}>Type:</span>
                <span style={{ fontWeight: "600" }}>
                  {selectedTemplate.type}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#283046",
                }}
              >
                <span style={{ color: "#666" }}>Header:</span>
                <span style={{ fontWeight: "600" }}>
                  {selectedTemplate.headerType || "Text"}
                </span>
              </div>
            </div>
            <div>
              <span style={{ color: "#666" }}>Message:</span>
              <div
                style={{
                  fontWeight: "600",
                  marginTop: "4px",
                  padding: "8px",
                  backgroundColor:
                    localStorage.getItem("darkMode") === "true"
                      ? "#283046"
                      : "white",
                  borderRadius: "4px",
                  border: "1px solid #d9d9d9",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedTemplate.message}
              </div>
            </div>
            {templateVariables.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                <span style={{ color: "#666" }}>Variables: </span>
                <Text strong>{templateVariables.join(", ")}</Text>
              </div>
            )}
            {/* Show actions if they exist */}
            {selectedTemplate.actions &&
              selectedTemplate.actions.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <span style={{ color: "#666" }}>Actions: </span>
                  <Text strong>
                    {selectedTemplate.actions
                      .map(action => `${action.type}: ${action.text}`)
                      .join(", ")}
                  </Text>
                </div>
              )}
          </div>
        )}
      </div>

      {/* File Upload Section */}
      {(selectedTemplate?.headerType === "image" ||
        selectedTemplate?.headerType === "video" ||
        selectedTemplate?.headerType === "file") && (
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            Upload {selectedTemplate.headerType}{" "}
            {selectedTemplate.headerType === "image"
              ? "(Max 5MB)"
              : selectedTemplate.headerType === "video"
                ? "(Max 16MB)"
                : "(Max 100MB)"}
            <span style={{ color: "red" }}>*</span>
          </label>
          <Upload
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76" // Mock upload endpoint
            fileList={fileList}
            accept={getAcceptString()}
            maxCount={1}
            beforeUpload={handleBeforeUpload}
            onChange={handleFileChange}
            onRemove={() => {
              setFileList([]);
              setFileUrl("");
            }}
          >
            <Button icon={<UploadOutlined />}>
              Upload {selectedTemplate.headerType}
            </Button>
          </Upload>
          {fileList.length > 0 && fileList[0].status === "uploading" && (
            <div style={{ marginTop: "8px", color: "#1890ff" }}>
              ⏳ Uploading...
            </div>
          )}
          {fileUrl && (
            <div style={{ marginTop: "8px", color: "#52c41a" }}>
              ✓ File uploaded successfully
            </div>
          )}
          {fileList.length > 0 && fileList[0].status === "error" && (
            <div style={{ marginTop: "8px", color: "#ff4d4f" }}>
              ✗ Upload failed. Please try again.
            </div>
          )}
        </div>
      )}

      {/* Variable Mapping Section */}
      {templateVariables.map(variable => (
        <div key={variable} style={{ marginBottom: "16px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            Map {variable.replace(/_/g, " ").toUpperCase()}{" "}
            <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            placeholder='Map to field'
            value={variableMappings[variable] || undefined}
            onChange={value => handleVariableMappingChange(variable, value)}
            style={{ width: "100%" }}
            allowClear
          >
            {leadFields.map(field => (
              <Option key={field.value} value={field.value}>
                {field.label}
              </Option>
            ))}
          </Select>
        </div>
      ))}

      <Divider />

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            type='primary'
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={!selectedTemplate}
            loading={isSaving}
            style={{
              backgroundColor: "var(--primary)",
              borderColor: "var(--primary)",
              color: "#ffff",
              borderRadius: "10px  ",
            }}
          >
            Save Configuration
          </Button>
          <Button
            danger
            onClick={handleReset}
            loading={isResetting}
            style={{
              borderRadius: "10px",
              color: "white",
              backgroundColor: "red",
            }}
            disabled={
              !selectedTemplate &&
              !fileUrl &&
              Object.keys(variableMappings).length === 0
            }
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Static ComposeModals component */}
      {composeModalOpen && (
        <Modal
          title="Select Template"
          open={composeModalOpen}
          onCancel={() => setComposeModalOpen(false)}
          footer={null}
          width={800}
        >
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {approvedTemplates.map(template => (
              <Card
                key={template.id}
                hoverable
                style={{ marginBottom: "12px" }}
                onClick={() => {
                  handleTemplateSelect(template);
                  setComposeModalOpen(false);
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4>{template.name}</h4>
                    <p style={{ margin: 0, color: "#666" }}>Type: {template.type}</p>
                    <p style={{ margin: 0, color: "#666" }}>Header: {template.headerType}</p>
                  </div>
                  <Button type="primary">Select</Button>
                </div>
                <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
                  <p style={{ margin: 0, fontSize: "12px" }}>{template.message}</p>
                </div>
              </Card>
            ))}
          </div>
        </Modal>
      )}
    </Card>
  );
};

export default NotificationForm;
import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Row,
  Col,
  Switch,
  Radio,
  Modal,
  message,
  Upload,
  Divider,
  Spin,
} from "antd";
import {
  CloseOutlined,
  ArrowLeftOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  LinkOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { CornerUpLeft, Phone, Link2, FileText } from "react-feather";
import ComposeModals from "../Leads/Modules/ComposeModals";
import moment from "moment";

const { TextArea } = Input;

function FollowUpScreen({ onClose, cardTitle, isBusinessAlert = false }) {
  // Static data for appointments
  const staticAppointments = [
    {
      id: "1",
      name: "John Doe",
      appointmentNo: "APP001",
      mobile: "9876543210",
      appointmentDate: "2024-03-15",
      timing: "10:00 AM",
      manager: "Agent Smith",
      department: "Cardiology",
      payment: "Credit Card",
      status: "Confirmed",
      age: 30,
      dob: "1994-05-15"
    },
    {
      id: "2",
      name: "Jane Smith",
      appointmentNo: "APP002",
      mobile: "9876543211",
      appointmentDate: "2024-03-16",
      timing: "02:30 PM",
      manager: "Agent Johnson",
      department: "Dermatology",
      payment: "Cash",
      status: "Pending",
      age: 28,
      dob: "1996-08-22"
    }
  ];

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    dob: null,
    appointmentDate: null,
    timing: null,
    user: "",
    mobileNumber: "",
    triggerType: "newBooking",
    // Separate template data for each stage
    initialTemplate: {
      template: null,
      variables: {},
      fileUrl: "",
      fileList: [],
      chatbotTrigger: false,
    },
    followUp1Template: {
      template: null,
      variables: {},
      fileUrl: "",
      fileList: [],
      delay: "1 day",
      delayType: "days",
      delayValue: 1,
      enabled: false,
    },
    followUp2Template: {
      template: null,
      variables: {},
      fileUrl: "",
      fileList: [],
      delay: "1 hour",
      delayType: "hours",
      delayValue: 1,
      enabled: false,
    },
  });

  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [activeTemplateStage, setActiveTemplateStage] = useState("initial");
  const [previewStage, setPreviewStage] = useState("initial");
  const [loading, setLoading] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);

  // Static data for approved templates
  const staticTemplates = [
    {
      id: "1",
      name: "Appointment Confirmation",
      type: "text",
      headerType: "text",
      header: "Your Appointment is Confirmed!",
      message: "Hello {{name}}, your appointment with Dr. Smith is confirmed for {{appointmentDate}} at {{timing}}.",
      footer: "Please arrive 15 minutes early.",
      examples: ["name", "appointmentDate", "timing"],
      actions: [
        { type: "quickReply", text: "Reschedule" },
        { type: "phone", text: "Call Clinic" }
      ]
    },
    {
      id: "2",
      name: "Appointment Reminder",
      type: "image",
      headerType: "image",
      header: "https://via.placeholder.com/300x150/1ea443/FFFFFF?text=Reminder",
      message: "Hi {{name}}, this is a reminder for your appointment tomorrow at {{timing}}.",
      footer: "We look forward to seeing you!",
      examples: ["name", "timing"],
      actions: [
        { type: "url", text: "View Directions", url: "https://maps.google.com?q={{1}}" }
      ]
    },
    {
      id: "3",
      name: "Feedback Request",
      type: "text",
      headerType: "text",
      header: "How was your visit?",
      message: "Hi {{name}}, we hope you had a good experience. Please rate your visit.",
      footer: "Thank you for your feedback!",
      examples: ["name"],
      actions: [
        { type: "quickReply", text: "5 Stars" },
        { type: "quickReply", text: "4 Stars" },
        { type: "quickReply", text: "3 Stars" }
      ]
    },
    {
      id: "4",
      name: "Video Consultation",
      type: "video",
      headerType: "video",
      header: "https://example.com/video.mp4",
      message: "Hi {{name}}, your video consultation link is ready.",
      footer: "Click the link below to join.",
      examples: ["name"],
      actions: [
        { type: "url", text: "Join Video Call", url: "https://meet.google.com/{{1}}" }
      ]
    },
    {
      id: "5",
      name: "Document Upload",
      type: "file",
      headerType: "file",
      header: "https://example.com/document.pdf",
      message: "Hi {{name}}, please find attached your medical report.",
      footer: "Confidential Document",
      examples: ["name"]
    }
  ];

  // Filter templates similar to OrderNotifyModal
  const allTemplates = staticTemplates.filter(template => {
    if (!template?.actions) return true;
    return !template.actions.some(
      action => action && action.type === "url" && action.url?.includes("{{1}}")
    );
  });

  // Check if current card type should have follow-ups
  const hasFollowUps = () => {
    const followUpSupportedCards = ["New Booking", "Reschedule Booking"];
    return followUpSupportedCards.includes(cardTitle);
  };

  // Load existing configuration on component mount
  useEffect(() => {
    if (cardTitle) {
      loadExistingConfiguration();
    }
  }, [cardTitle]);

  const loadExistingConfiguration = async () => {
    try {
      setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Static configuration data
      const staticConfigs = {
        "New Booking": {
          triggerType: "newBooking",
          preliminaryMessage: {
            template: staticTemplates[0],
            variables: { name: "name", appointmentDate: "appointmentDate", timing: "timing" },
            fileUrl: "",
            fileList: [],
            chatbotTrigger: true
          },
          followUp1: {
            template: staticTemplates[1],
            variables: { name: "name", timing: "timing" },
            fileUrl: "https://via.placeholder.com/300x150/1ea443/FFFFFF?text=Reminder",
            fileList: [],
            delay: "1 day",
            enabled: true
          },
          followUp2: {
            template: staticTemplates[2],
            variables: { name: "name" },
            fileUrl: "",
            fileList: [],
            delay: "2 hours",
            enabled: false
          }
        },
        "Reschedule Booking": {
          triggerType: "rescheduleBooking",
          preliminaryMessage: {
            template: staticTemplates[0],
            variables: { name: "name", appointmentDate: "appointmentDate", timing: "timing" },
            fileUrl: "",
            fileList: [],
            chatbotTrigger: false
          },
          followUp1: null,
          followUp2: null
        }
      };

      const config = staticConfigs[cardTitle];

      if (config) {
        // Helper function to parse delay string
        const parseDelay = delayString => {
          const match = delayString?.match(/(\d+)\s*(day|days|hour|hours)/i);
          if (match) {
            const value = parseInt(match[1]);
            const type = match[2].toLowerCase().includes("day")
              ? "days"
              : "hours";
            return { value, type };
          }
          return { value: 1, type: "days" };
        };

        const followUp1Delay = parseDelay(config.followUp1?.delay);
        const followUp2Delay = parseDelay(config.followUp2?.delay);

        // Transform the saved configuration back to form structure
        setFormData(prev => ({
          ...prev,
          triggerType: config.triggerType || "newBooking",
          initialTemplate: {
            template: config.preliminaryMessage?.template || null,
            variables: config.preliminaryMessage?.variables || {},
            fileUrl: config.preliminaryMessage?.fileUrl || "",
            fileList: config.preliminaryMessage?.fileList || [],
            chatbotTrigger: config.preliminaryMessage?.chatbotTrigger || false,
          },
          followUp1Template: {
            template: config.followUp1?.template || null,
            variables: config.followUp1?.variables || {},
            fileUrl: config.followUp1?.fileUrl || "",
            fileList: config.followUp1?.fileList || [],
            delay: config.followUp1?.delay || "1 day",
            delayType: followUp1Delay.type,
            delayValue: followUp1Delay.value,
            enabled: config.followUp1?.enabled || false,
          },
          followUp2Template: {
            template: config.followUp2?.template || null,
            variables: config.followUp2?.variables || {},
            fileUrl: config.followUp2?.fileUrl || "",
            fileList: config.followUp2?.fileList || [],
            delay: config.followUp2?.delay || "1 hour",
            delayType: followUp2Delay.type,
            delayValue: followUp2Delay.value,
            enabled: config.followUp2?.enabled || false,
          },
        }));

        console.log(`${cardTitle} configuration loaded successfully!`);
      }
    } catch (error) {
      console.log(`No existing configuration found for ${cardTitle}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentFieldOptions = () => [
    { value: "name", label: "Name" },
    { value: "appointmentNo", label: "Appointment Number" },
    { value: "appointmentDate", label: "Appointment Date" },
    { value: "manager", label: "Agent Name" },
    { value: "department", label: "Department" },
    { value: "payment", label: "Payment Type" },
    { value: "status", label: "Status" },
    { value: "timing", label: "Timing" },
    { value: "mobile", label: "Mobile Number" },
    { value: "age", label: "Age" },
    { value: "dob", label: "Date of Birth" },
  ];

  // Add context-specific validation rules
  const getCardSpecificValidationRules = cardType => {
    const rules = {
      "New Booking": {
        requiredFields: ["name", "mobileNumber", "appointmentDate"],
        supportedTemplateTypes: ["text", "image", "video", "file"],
        maxFollowUps: 2,
        allowedDelays: [
          "5 minutes",
          "15 minutes",
          "30 minutes",
          "1 hour",
          "2 hours",
          "3 hours",
          "6 hours",
          "12 hours",
          "1 day",
          "2 days",
          "3 days",
          "5 days",
          "1 week",
          "2 weeks",
          "1 month",
        ],
      },
      "Reschedule Booking": {
        requiredFields: ["name", "mobileNumber", "appointmentDate"],
        supportedTemplateTypes: ["text", "image", "video", "file"],
        maxFollowUps: 2,
        allowedDelays: [
          "5 minutes",
          "15 minutes",
          "30 minutes",
          "1 hour",
          "2 hours",
          "3 hours",
          "6 hours",
          "12 hours",
          "1 day",
          "2 days",
          "3 days",
          "5 days",
          "1 week",
          "2 weeks",
          "1 month",
        ],
      },
      "Appointment Completion": {
        requiredFields: ["name", "mobileNumber"],
        supportedTemplateTypes: ["text", "image"],
        maxFollowUps: 0,
        allowedDelays: [],
      },
      Feedback: {
        requiredFields: ["name", "mobileNumber"],
        supportedTemplateTypes: ["text", "image"],
        maxFollowUps: 0,
        allowedDelays: [],
      },
    };

    return rules[cardType] || rules["New Booking"];
  };

  // Get delay options based on stage
  const getDelayTypeOptions = () => [
    { value: "days", label: "Days" },
    { value: "hours", label: "Hours" },
  ];

  // Get delay value options based on type and stage
  const getDelayValueOptions = (stage, delayType) => {
    if (stage === "followUp1") {
      if (delayType === "days") {
        return Array.from({ length: 5 }, (_, i) => ({
          value: i + 1,
          label: `${i + 1} ${i === 0 ? "day" : "days"}`,
        }));
      } else {
        return Array.from({ length: 23 }, (_, i) => ({
          value: i + 1,
          label: `${i + 1} ${i === 0 ? "hour" : "hours"}`,
        }));
      }
    } else if (stage === "followUp2") {
      const followUp1Type = formData.followUp1Template.delayType;
      const followUp1Value = formData.followUp1Template.delayValue;

      // Convert followUp1 delay to hours for comparison
      const followUp1InHours =
        followUp1Type === "days" ? followUp1Value * 24 : followUp1Value;

      if (delayType === "days") {
        // For days, calculate maximum allowed days
        const maxDays = Math.floor(followUp1InHours / 24) - 1;
        if (maxDays <= 0) {
          return []; // No days option if followUp1 is less than 24 hours
        }
        return Array.from({ length: maxDays }, (_, i) => ({
          value: i + 1,
          label: `${i + 1} ${i === 0 ? "day" : "days"}`,
        }));
      } else {
        // For hours, show all options up to followUp1 total hours - 1
        const maxHours = followUp1InHours - 1;
        if (maxHours <= 0) {
          return [];
        }
        return Array.from({ length: Math.min(maxHours, 23) }, (_, i) => ({
          value: i + 1,
          label: `${i + 1} ${i === 0 ? "hour" : "hours"}`,
        }));
      }
    }
    return [];
  };

  // Get available delay types for followUp2 based on followUp1
  const getAvailableDelayTypes = stage => {
    if (stage === "followUp1") {
      return getDelayTypeOptions();
    } else if (stage === "followUp2") {
      const followUp1Type = formData.followUp1Template.delayType;
      const followUp1Value = formData.followUp1Template.delayValue;

      // Convert to hours for easier comparison
      const followUp1InHours =
        followUp1Type === "days" ? followUp1Value * 24 : followUp1Value;

      const availableTypes = [];

      // Check if days option is available (only if followUp1 is more than 24 hours)
      if (followUp1InHours > 24) {
        availableTypes.push({ value: "days", label: "Days" });
      }

      // Hours is always available if followUp1 is more than 1 hour
      if (followUp1InHours > 1) {
        availableTypes.push({ value: "hours", label: "Hours" });
      }

      return availableTypes;
    }
    return [];
  };

  const handleDelayTypeChange = (stage, delayType) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [`${stage}Template`]: {
          ...prev[`${stage}Template`],
          delayType,
          delayValue: 1, // Reset to 1 when type changes
        },
      };

      // Update the delay string for backend compatibility
      newFormData[`${stage}Template`].delay =
        `1 ${delayType === "days" ? "day" : "hour"}`;

      return newFormData;
    });
  };

  const handleDelayValueChange = (stage, delayValue) => {
    setFormData(prev => {
      const delayType = prev[`${stage}Template`].delayType;
      const unit =
        delayType === "days"
          ? delayValue === 1
            ? "day"
            : "days"
          : delayValue === 1
            ? "hour"
            : "hours";

      return {
        ...prev,
        [`${stage}Template`]: {
          ...prev[`${stage}Template`],
          delayValue,
          delay: `${delayValue} ${unit}`, // Update delay string for backend
        },
      };
    });
  };

  // Handle template variables for specific stage
  const updateTemplateVariables = (template, stage) => {
    if (template?.examples) {
      try {
        let parsedVariables = [];
        if (
          typeof template.examples === "object" &&
          !Array.isArray(template.examples)
        ) {
          parsedVariables = Object.keys(template.examples);
        } else if (Array.isArray(template.examples)) {
          parsedVariables = template.examples;
        }

        // Initialize variable values as empty strings
        const varDataObj = {};
        parsedVariables.forEach(variable => {
          varDataObj[variable] = "";
        });

        setFormData(prev => ({
          ...prev,
          [`${stage}Template`]: {
            ...prev[`${stage}Template`],
            variables: varDataObj,
          },
        }));

        // Handle action button variables (CTA URLs with {{1}})
        if (template?.actions && template.actions.length > 0) {
          template.actions.forEach((action, index) => {
            if (action.type === "url" && action.url?.includes("{{1}}")) {
              const variableKey = `{{1}}_action_${index}`;
              setFormData(prev => ({
                ...prev,
                [`${stage}Template`]: {
                  ...prev[`${stage}Template`].variables,
                  [variableKey]: "",
                },
              }));
            }
          });
        }
      } catch (e) {
        console.error("Error parsing template variables:", e);
      }
    }
  };

  const handleSelectTemplate = template => {
    setFormData(prev => ({
      ...prev,
      [`${activeTemplateStage}Template`]: {
        ...prev[`${activeTemplateStage}Template`],
        template,
        fileUrl: "",
        fileList: [],
      },
    }));

    updateTemplateVariables(template, activeTemplateStage);
    setComposeModalOpen(false);
  };

  const handleVariableValueChange = (stage, variableName, value) => {
    setFormData(prev => ({
      ...prev,
      [`${stage}Template`]: {
        ...prev[`${stage}Template`],
        variables: {
          ...prev[`${stage}Template`].variables,
          [variableName]: value,
        },
      },
    }));
  };

  const handleDelayChange = (stage, delay) => {
    setFormData(prev => ({
      ...prev,
      [`${stage}Template`]: {
        ...prev[`${stage}Template`],
        delay,
      },
    }));
  };

  const handleToggleFollowUp = (stage, enabled) => {
    setFormData(prev => ({
      ...prev,
      [`${stage}Template`]: {
        ...prev[`${stage}Template`],
        enabled,
      },
    }));
  };

  // File upload constants
  const MAX_FILE_SIZE_DOC = 100 * 1024 * 1024; // 100MB
  const MAX_FILE_SIZE_IMAGE = 5 * 1024 * 1024; // 5MB
  const MAX_FILE_SIZE_VIDEO = 16 * 1024 * 1024; // 16MB

  // File upload handlers
  const handleFileChange = (stage, info) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1); // Keep only the latest file

    setFormData(prev => ({
      ...prev,
      [`${stage}Template`]: {
        ...prev[`${stage}Template`],
        fileList: newFileList,
        fileUrl:
          info?.file?.status === "done"
            ? info.file.response?.fileUrl || ""
            : prev[`${stage}Template`].fileUrl,
      },
    }));

    if (info?.file?.status === "done") {
      if (info?.file?.response?.fileUrl) {
        message.success(`${info.file.name} file uploaded successfully.`);
      }
    } else if (info?.file?.status === "error") {
      console.error("Upload error:", info.file.error);
      message.error(`${info.file.name} file upload failed.`);
    }

    if (newFileList.length === 0) {
      setFormData(prev => ({
        ...prev,
        [`${stage}Template`]: {
          ...prev[`${stage}Template`],
          fileUrl: "",
        },
      }));
    }
  };

  const handleChatbotTriggerChange = checked => {
    setFormData(prev => ({
      ...prev,
      initialTemplate: {
        ...prev.initialTemplate,
        chatbotTrigger: checked,
      },
    }));
  };

  const handleBeforeUpload = (stage, file) => {
    const template = formData[`${stage}Template`].template;
    const headerType = template?.headerType?.toLowerCase() || "";
    let sizeLimit = MAX_FILE_SIZE_DOC;
    let acceptedTypes = [];

    // Set size limit and accepted types based on header type
    switch (headerType) {
      case "image":
        sizeLimit = MAX_FILE_SIZE_IMAGE;
        acceptedTypes = ["image/jpeg", "image/png", "image/jpg"];
        break;
      case "video":
        sizeLimit = MAX_FILE_SIZE_VIDEO;
        acceptedTypes = ["video/mp4", "video/quicktime", "video/mpeg"];
        break;
      case "file":
        sizeLimit = MAX_FILE_SIZE_DOC;
        acceptedTypes = [
          "application/msword",
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        break;
      default:
        return Upload.LIST_IGNORE;
    }

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      message.error(
        `Invalid file type! Accepted types are: ${acceptedTypes.join(", ")}`
      );
      return Upload.LIST_IGNORE;
    }

    // Check file size
    if (file.size > sizeLimit) {
      const sizeLimitMB =
        headerType === "image" ? "5" : headerType === "video" ? "16" : "100";
      message.error(`File size must be smaller than ${sizeLimitMB}MB!`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const getAcceptString = stage => {
    const template = formData[`${stage}Template`].template;
    const headerType = template?.headerType?.toLowerCase() || "";
    switch (headerType) {
      case "image":
        return ".jpg,.jpeg,.png";
      case "video":
        return ".mp4,.mov,.mpeg";
      case "file":
        return ".doc,.pdf,.docx";
      default:
        return "";
    }
  };

  // Get stage display name
  const getStageDisplayName = stage => {
    switch (stage) {
      case "initial":
        return "Preliminary Message";
      case "followUp1":
        return "Follow-up 1";
      case "followUp2":
        return "Follow-up 2";
      default:
        return stage;
    }
  };

  // Connectivity UI Component
  const ConnectivityFlow = () => {
    const stages = ["initial"];
    if (hasFollowUps()) {
      if (formData.followUp1Template.enabled) {
        stages.push("followUp1");
      }
      if (formData.followUp2Template.enabled) {
        stages.push("followUp2");
      }
    }

    return null;
  };

  // Render template section for each stage
  const renderTemplateSection = (stage, title) => {
    const templateData = formData[`${stage}Template`];
    const template = templateData.template;
    const templateVariables = template?.examples
      ? typeof template.examples === "object" &&
        !Array.isArray(template.examples)
        ? Object.keys(template.examples)
        : Array.isArray(template.examples)
          ? template.examples
          : []
      : [];

    const isFollowUp = stage !== "initial";
    const isEnabled = !isFollowUp || templateData.enabled;

    return (
      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          border: "1px solid #d9d9d9",
          borderRadius: "8px",
          opacity: isEnabled ? 1 : 0.6,
          transition: "opacity 0.3s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
              {title}
            </h4>
            {isFollowUp && (
              <Switch
                checked={templateData.enabled}
                onChange={checked => handleToggleFollowUp(stage, checked)}
                checkedChildren='ON'
                unCheckedChildren='OFF'
                style={{
                  backgroundColor: templateData.enabled ? "#211f60" : undefined,
                }}
              />
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              type='text'
              icon={<EyeOutlined style={{ fontSize: "16px" }} />}
              onClick={() => setPreviewStage(stage)}
              style={{
                color: previewStage === stage ? "var(--primary)" : "#666",
              }}
              disabled={!isEnabled || !template}
            >
              Preview
            </Button>
            <Button
              type='text'
              icon={<CloudUploadOutlined style={{ fontSize: "20px" }} />}
              onClick={() => {
                setActiveTemplateStage(stage);
                setComposeModalOpen(true);
              }}
              style={{ color: "var(--primary)" }}
              disabled={!isEnabled}
            >
              Select Template
            </Button>
          </div>
        </div>

        <Form layout='vertical'>
          <Form.Item>
            <div
              style={{
                backgroundColor: "#E2FFE8",
                borderRadius: "8px",
                padding: "12px 16px",
                marginTop: "8px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }}
            >
              {template ? (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <p style={{ marginRight: "24px", color: "black" }}>
                    <strong style={{ color: "black" }}>Template:</strong> {template.name}
                  </p>
                  <p style={{ color: "black" }}>
                    <strong style={{ color: "black" }}>Type:</strong> {template.type}
                  </p>
                </div>
              ) : (
                <p style={{ color: "gray", textAlign: "center" }}>
                  No template selected
                </p>
              )}
            </div>
          </Form.Item>

          {isEnabled && (
            <>
              {/* Template Variables */}
              {templateVariables.map(variable => (
                <Form.Item
                  key={variable}
                  label={`Map ${variable} to appointment field`}
                  required
                >
                  <Select
                    placeholder={`Select field to map to ${variable}`}
                    value={templateData.variables[variable] || ""}
                    onChange={value =>
                      handleVariableValueChange(stage, variable, value)
                    }
                    options={getAppointmentFieldOptions()}
                    showSearch
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              ))}

              {/* Action buttons variables (CTA URLs) */}
              {template?.actions?.map((action, index) => {
                if (action.type === "url" && action.url?.includes("{{1}}")) {
                  const variableKey = `{{1}}_action_${index}`;
                  return (
                    <Form.Item
                      key={variableKey}
                      label={`CTA URL (${action.text})`}
                      required
                    >
                      <Input
                        placeholder={`Enter URL for ${action.text}`}
                        value={templateData.variables[variableKey] || ""}
                        onChange={e =>
                          handleVariableValueChange(
                            stage,
                            variableKey,
                            e.target.value
                          )
                        }
                      />
                    </Form.Item>
                  );
                }
                return null;
              })}

              {/* File Upload Section */}
              {(template?.headerType === "image" ||
                template?.headerType === "video" ||
                template?.headerType === "file") && (
                  <Form.Item
                    label={`Upload ${template?.headerType} ${template?.headerType === "image"
                      ? "(Max 5MB)"
                      : template?.headerType === "video"
                        ? "(Max 16MB)"
                        : "(Max 100MB)"
                      }`}
                    required
                  >
                    <Upload
                      fileList={templateData.fileList}
                      accept={getAcceptString(stage)}
                      maxCount={1}
                      beforeUpload={file => handleBeforeUpload(stage, file)}
                      onChange={info => handleFileChange(stage, info)}
                      onRemove={() => {
                        setFormData(prev => ({
                          ...prev,
                          [`${stage}Template`]: {
                            ...prev[`${stage}Template`],
                            fileUrl: "",
                            fileList: [],
                          },
                        }));
                      }}
                    >
                      <Button icon={<UploadOutlined />}>
                        Upload {template?.headerType}
                      </Button>
                    </Upload>
                  </Form.Item>
                )}

              {/* Delay selection for follow-ups */}
              {isFollowUp && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label='Delay Type'>
                      <Select
                        value={templateData.delayType}
                        onChange={value => handleDelayTypeChange(stage, value)}
                        options={getAvailableDelayTypes(stage)}
                        style={{ width: "100%" }}
                        disabled={
                          stage === "followUp2" &&
                          getAvailableDelayTypes(stage).length === 0
                        }
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label='Delay Value'>
                      <Select
                        value={templateData.delayValue}
                        onChange={value => handleDelayValueChange(stage, value)}
                        options={getDelayValueOptions(
                          stage,
                          templateData.delayType
                        )}
                        style={{ width: "100%" }}
                        disabled={
                          getDelayValueOptions(stage, templateData.delayType)
                            .length === 0
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </>
          )}

          {stage === "initial" && cardTitle === "New Booking" && (
            <Form.Item>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Switch
                  checked={templateData.chatbotTrigger || false}
                  onChange={handleChatbotTriggerChange}
                  size='small'
                />
                <span style={{ fontSize: "14px", color: "#666" }}>
                  Trigger for chatbot booking
                </span>
              </div>
            </Form.Item>
          )}
        </Form>
      </div>
    );
  };

  // Enhanced preview component with iPhone-style mobile UI
  const renderPreviewContent = () => {
    const currentTemplateData = formData[`${previewStage}Template`];
    const template = currentTemplateData?.template;

    if (!template) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#666",
            fontSize: "14px",
            textAlign: "center",
            padding: "20px",
          }}
        >
          Select a template for {getStageDisplayName(previewStage)} to see preview
        </div>
      );
    }

    // Function to render the message content with iPhone styling
    const renderMessageContent = () => {
      return (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <div style={{
            background: "#dcf8c6",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            maxWidth: "220px",
            position: "relative"
          }}>
            {/* Message bubble arrow */}
            <div style={{
              position: "absolute",
              right: "-8px",
              top: "0",
              width: "0",
              height: "0",
              borderLeft: "8px solid #dcf8c6",
              borderTop: "8px solid transparent"
            }}></div>

            {/* Header */}
            {template?.header && (
              <div style={{ marginBottom: "8px" }}>
                {template?.headerType === 'image' && (
                  <img
                    src={currentTemplateData.fileUrl || template.header}
                    alt="header"
                    style={{ width: "100%", borderRadius: "4px" }}
                    onError={(e) => e.target.style.display = "none"}
                  />
                )}
                {!currentTemplateData.fileUrl && (
                  <div style={{ textAlign: "center", padding: "10px", color: "#666" }}>
                    Image not available
                  </div>
                )}
                {template?.headerType === 'video' && (
                  <video
                    controls
                    style={{ width: "100%", borderRadius: "4px" }}
                  >
                    <source src={currentTemplateData.fileUrl || template.header} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                {template?.headerType === 'text' && (
                  <p style={{
                    fontWeight: "bold",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#000"
                  }}>
                    {template.header}
                  </p>
                )}
                {template?.headerType === 'file' && (
                  <div style={{ textAlign: "center", padding: "10px" }}>
                    <div style={{
                      fontSize: "24px",
                      color: "#667781",
                      marginBottom: "8px"
                    }}>📄</div>
                    <p style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#667781"
                    }}>
                      Document
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Message Body */}
            <p style={{
              fontSize: "13px",
              color: "#303030",
              lineHeight: "1.5",
              margin: "0",
              whiteSpace: "pre-wrap"
            }}>
              {template?.message || "Your message content will appear here"}
            </p>

            {/* Footer */}
            {template?.footer && (
              <p style={{
                fontSize: "11px",
                color: "#667781",
                marginTop: "8px",
                marginBottom: "0"
              }}>
                {template.footer}
              </p>
            )}

            {/* Action Buttons */}
            {template?.actions && template.actions.length > 0 && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginTop: "12px"
              }}>
                {template.actions.map((action, index) => (
                  <button
                    key={index}
                    style={{
                      background: action.type === "quickReply" ? "#075e54" : "#fff",
                      color: action.type === "quickReply" ? "#fff" : "#075e54",
                      border: action.type === "quickReply" ? "none" : "1px solid #075e54",
                      borderRadius: "20px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = "0.8";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = "1";
                    }}
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            )}

            {/* Timestamp and Status */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "4px",
              marginTop: "8px"
            }}>
              <span style={{ fontSize: "11px", color: "#667781" }}>
                {moment().format('hh:mm A')}
              </span>
              <div style={{ fontSize: "14px", color: "#53bdeb" }}>✓✓</div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="card-body d-flex align-items-center justify-content-center" style={{ height: "100%" }}>
        {/* iPhone Frame */}
        <div style={{ position: "relative", width: "280px", height: "570px" }}>
          <div style={{
            position: "absolute",
            inset: "0",
            background: "#1a1a1a",
            borderRadius: "45px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            padding: "12px"
          }}>
            {/* iPhone notch */}
            <div style={{
              position: "absolute",
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "128px",
              height: "24px",
              background: "#1a1a1a",
              borderRadius: "0 0 20px 20px",
              zIndex: "10"
            }}></div>

            <div style={{
              position: "relative",
              background: "#fff",
              width: "100%",
              height: "100%",
              borderRadius: "35px",
              overflow: "hidden"
            }}>
              {/* WhatsApp-like header */}
              <div style={{
                background: "#075e54",
                height: "80px",
                display: "flex",
                alignItems: "flex-end",
                padding: "0 16px 8px"
              }}>
              </div>

              {/* Chat area */}
              <div style={{
                background: "#e5ddd5",
                height: "calc(100% - 132px)",
                padding: "16px",
                overflowY: "auto",
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" opacity="0.1"><path d="M30,50 Q50,30 70,50 Q50,70 30,50" fill="none" stroke="%23075e54" stroke-width="2"/></svg>')`,
                backgroundRepeat: "repeat"
              }}>
                {renderMessageContent()}
              </div>

              {/* Message input area */}
              <div style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                background: "#f0f0f0",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderTop: "1px solid #ddd"
              }}>
                <div style={{
                  fontSize: "20px",
                  color: "#667781",
                  cursor: "pointer"
                }}>😊</div>
                <input
                  type="text"
                  placeholder="Message"
                  style={{
                    flex: "1",
                    background: "#fff",
                    border: "none",
                    borderRadius: "20px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    outline: "none"
                  }}
                  disabled
                  value={`Preview: ${getStageDisplayName(previewStage)}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);

      // Validate initial template
      if (!formData.initialTemplate.template) {
        message.error("Please select a template for Preliminary Message!");
        return;
      }

      // Validate enabled follow-up templates (only for cards that support follow-ups)
      if (hasFollowUps()) {
        if (
          formData.followUp1Template.enabled &&
          !formData.followUp1Template.template
        ) {
          message.error("Please select a template for Follow-up 1!");
          return;
        }

        if (
          formData.followUp2Template.enabled &&
          !formData.followUp2Template.template
        ) {
          message.error("Please select a template for Follow-up 2!");
          return;
        }
      }

      // Validate template variables for enabled stages
      const stagesToValidate = ["initialTemplate"];
      if (hasFollowUps()) {
        if (formData.followUp1Template.enabled)
          stagesToValidate.push("followUp1Template");
        if (formData.followUp2Template.enabled)
          stagesToValidate.push("followUp2Template");
      }

      for (const stageKey of stagesToValidate) {
        const stageData = formData[stageKey];
        const template = stageData.template;

        if (template?.examples) {
          let hasErrors = false;
          Object.keys(template.examples)?.forEach(ele => {
            const value = stageData.variables?.[ele];
            if (!value || value.length === 0) {
              hasErrors = true;
              message.error(
                `Please map ${ele} to an appointment field in ${stageKey.replace("Template", "")}!`
              );
            }
          });

          if (hasErrors) return;
        }

        // Validate file upload if template requires it
        if (
          (template?.headerType === "image" ||
            template?.headerType === "video" ||
            template?.headerType === "file") &&
          !stageData.fileUrl
        ) {
          message.error(
            `Please upload a ${template.headerType} file for ${stageKey.replace("Template", "")}!`
          );
          return;
        }
      }

      // Prepare configuration data in the correct format for backend
      const configData = {
        cardType: cardTitle,
        type: isBusinessAlert ? "business" : "user",
        triggerType: formData.triggerType,
        enabled: true,
        preliminaryMessage: {
          template: formData.initialTemplate.template,
          variables: formData.initialTemplate.variables,
          fileUrl: formData.initialTemplate.fileUrl,
          fileList: formData.initialTemplate.fileList,
          delay: "0 minutes", // Always 0 for preliminary message
          enabled: true,
          chatbotTrigger: formData.initialTemplate.chatbotTrigger || false,
        },
        // Only include follow-up data for cards that support follow-ups
        ...(hasFollowUps() && {
          followUp1: formData.followUp1Template.enabled
            ? {
              template: formData.followUp1Template.template,
              variables: formData.followUp1Template.variables,
              fileUrl: formData.followUp1Template.fileUrl,
              fileList: formData.followUp1Template.fileList,
              delay: formData.followUp1Template.delay,
              enabled: formData.followUp1Template.enabled,
            }
            : null,
          followUp2: formData.followUp2Template.enabled
            ? {
              template: formData.followUp2Template.template,
              variables: formData.followUp2Template.variables,
              fileUrl: formData.followUp2Template.fileUrl,
              fileList: formData.followUp2Template.fileList,
              delay: formData.followUp2Template.delay,
              enabled: formData.followUp2Template.enabled,
            }
            : null,
        }),
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("Configuration saved:", configData);
      message.success(`${cardTitle} configuration saved successfully!`);

      onClose();
    } catch (error) {
      console.error(`Error saving ${cardTitle} configuration:`, error);
      message.error(
        error?.data?.message ||
        `Failed to save ${cardTitle} configuration. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResetModalVisible(true);
  };

  const confirmReset = async () => {
    try {
      setLoading(true);
      setResetModalVisible(false);

      console.log("🗑️ Resetting config for:", {
        cardTitle,
        isBusinessAlert,
        type: isBusinessAlert ? "business" : "user",
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log(`✅ ${cardTitle} configuration deleted successfully!`);
      message.success(`${cardTitle} configuration deleted successfully!`);

      // Reset the form state
      setFormData({
        name: "",
        age: "",
        dob: null,
        appointmentDate: null,
        timing: null,
        user: "",
        mobileNumber: "",
        triggerType: "newBooking",
        initialTemplate: {
          template: null,
          variables: {},
          fileUrl: "",
          fileList: [],
          chatbotTrigger: false,
        },
        followUp1Template: {
          template: null,
          variables: {},
          fileUrl: "",
          fileList: [],
          delay: "1 day",
          delayType: "days",
          delayValue: 1,
          enabled: false,
        },
        followUp2Template: {
          template: null,
          variables: {},
          fileUrl: "",
          fileList: [],
          delay: "1 hour",
          delayType: "hours",
          delayValue: 1,
          enabled: false,
        },
      });

      setActiveTemplateStage("initial");
      setPreviewStage("initial");

      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error(`❌ Error resetting ${cardTitle} configuration:`, error);
      message.error(
        `Failed to reset ${cardTitle} configuration. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", minHeight: "100vh", position: "relative" }}>
      <Button
        onClick={onClose}
        style={{
          backgroundColor: "var(--primary)",
          color: "white",
          borderRadius: 8,
          marginBottom: "16px",
        }}
      >
        <ArrowLeftOutlined />
        Back
      </Button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "clamp(18px, 2vw, 24px)" }}>
          {cardTitle || "Follow Up"} Configuration
        </h2>
      </div>

      <Row gutter={[16, 16]}>
        {/* Template Configuration Section */}
        <Col xs={24} sm={24} md={12} lg={18}>
          <div
            style={{
              borderRadius: "8px",
              padding: "16px",
              height: "100%",
              minHeight: "600px",
              maxHeight: hasFollowUps() ? "600px" : "400px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                maxHeight: hasFollowUps() ? "700px" : "500px",
                paddingRight: "16px",
              }}
            >
              {/* Show connectivity flow for cards with follow-ups */}
              {hasFollowUps() && <ConnectivityFlow />}

              {/* Initial Template */}
              {renderTemplateSection("initial", "Preliminary Message")}

              {/* Follow-up Templates (only for New Booking and Reschedule Booking) */}
              {hasFollowUps() && (
                <>
                  {renderTemplateSection("followUp1", "Follow-up 1")}
                  <div
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                      border: "1px solid #e6f7ff",
                      borderRadius: "8px",
                      padding: "8px",
                    }}
                  >
                    {renderTemplateSection("followUp2", "Follow-up 2")}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "auto",
                paddingTop: "16px",
                gap: "8px",
              }}
            >
              <Button
                type='primary'
                onClick={handleFormSubmit}
                style={{ borderRadius: 8 }}
                loading={loading}
                disabled={loading}
              >
                Save Configuration
              </Button>
              <Button
                style={{
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: 8,
                }}
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </Button>
            </div>
          </div>
        </Col>

        {/* Preview Section with iPhone UI */}
        <Col xs={24} sm={24} md={24} lg={6}>
          <h3
            style={{
              marginBottom: "16px",
              textAlign: "center",
              fontSize: "clamp(16px, 1.5vw, 20px)",
            }}
          >
            {getStageDisplayName(previewStage)}
          </h3>

          <div
            style={{
              position: "relative",
              minHeight: "570px",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
            }}
          >
            {renderPreviewContent()}
          </div>
        </Col>
      </Row>

      <ComposeModals
        modelopen={composeModalOpen}
        data={allTemplates || []}
        setModelOpen={setComposeModalOpen}
        handleTemplateSelect={handleSelectTemplate}
      />

      <Modal
        title='Confirm Reset'
        open={resetModalVisible}
        onOk={confirmReset}
        onCancel={() => setResetModalVisible(false)}
        okText='Yes, Reset'
        cancelText='Cancel'
        okButtonProps={{
          danger: true,
          loading: loading,
        }}
        cancelButtonProps={{
          disabled: loading,
        }}
      >
        <p>
          Are you sure you want to reset the <strong>{cardTitle}</strong>{" "}
          configuration?
        </p>
        <p>
          This will permanently delete all settings from the database and cannot
          be undone.
        </p>
      </Modal>
    </div>
  );
}

export default FollowUpScreen;

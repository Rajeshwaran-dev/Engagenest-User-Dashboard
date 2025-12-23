import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Form,
  Modal,
  Select,
  Table,
  Dropdown,
  Typography,
  Row,
  Col,
  Grid,
  Input,
  Tabs,
  Card,
  Upload,
  message,
  Switch,
  InputNumber,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SettingOutlined,
  MoreOutlined,
  UploadOutlined,
  CloudUploadOutlined,
  PlusOutlined,
  MessageOutlined,
  AudioOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import TatTab from "./TatTab";
import FeatherIcon from "feather-icons-react";
import ContentHeader from "../../components/ContentHeader";
import ComposeModals from "../Catalog/CatalogOrders/composeModals";
import FreshworksSettings from "./FreshworksSettings";

const { Text, Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;
const { TextArea } = Input;

// Key for localStorage
const NOTIFICATION_STORAGE_KEY = "configurationNotifications";
const QUICK_REPLY_STORAGE_KEY = "quickRepliesConfig";
const VOICE_NOTE_STORAGE_KEY = "voiceNotesConfig";

const MAX_FILE_SIZE_DOC = 100 * 1024 * 1024;
const MAX_FILE_SIZE_IMAGE = 5 * 1024 * 1024;
const MAX_FILE_SIZE_VIDEO = 16 * 1024 * 1024;

// Dynamic variable options
const DYNAMIC_VARIABLE_OPTIONS = [
  { value: "ticket_id", label: "Ticket ID" },
  { value: "customer_name", label: "Customer Name" },
  { value: "department", label: "Department" },
  { value: "description", label: "Description" },
  { value: "status", label: "Status" },
  { value: "assigned_to", label: "Assigned To" },
  { value: "created_at", label: "Created At" },
  { value: "priority", label: "Priority" },
];

// Status options
const STATUS_OPTIONS = [
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_customer", label: "Awaiting for Customer" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

// Static approved templates data
const staticApprovedTemplates = [
  {
    id: "1",
    name: "Ticket Status Update Template",
    type: "UTILITY",
    headerType: "text",
    examples: { ticket_id: "12345", customer_name: "John Doe" },
    actions: [],
  },
  {
    id: "2",
    name: "Customer Survey Template",
    type: "MARKETING",
    headerType: "image",
    examples: ["survey_link", "customer_name"],
    actions: [
      {
        type: "url",
        url: "https://survey.example.com/{{1}}",
        text: "Take Survey",
      },
    ],
  },
  {
    id: "3",
    name: "Priority Alert Template",
    type: "UTILITY",
    headerType: "text",
    examples: ["ticket_id", "priority_level"],
    actions: [],
  },
  {
    id: "4",
    name: "Document Sharing Template",
    type: "UTILITY",
    headerType: "document",
    examples: ["document_name", "customer_name"],
    actions: [],
  },
];

const notifyCards = [
  {
    title: "Status Update",
    description:
      "Configure automated notifications to keep customers informed about their ticket progress & changes.",
    icon: <FeatherIcon icon='clock' size={24} color='var(--primary)' />,
  },
];

function Configuration() {
  const [activeTab, setActiveTab] = useState("1");
  const screens = useBreakpoint();
  const [selectedCard, setSelectedCard] = useState(null);

  // Form instances for modals
  const [quickReplyForm] = Form.useForm();
  const [voiceNoteForm] = Form.useForm();

  // Notify state
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState([]);
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      key: 1,
      mobileNumber: "+1234567890",
      templateName: "Ticket Status Update Template",
      status: "completed",
      description: "Ticket #12345 status updated to Completed",
    },
    {
      key: 2,
      mobileNumber: "+1987654321",
      templateName: "Customer Survey Template",
      status: "pending",
      description: "Survey link sent to customer",
    },
  ]);
  const [webhookUrl, setWebhookUrl] = useState("https://webhook.example.com/api/v1/notifications");
  const [departments, setDepartments] = useState(["Support", "Sales", "Billing"]);
  const [assignees, setAssignees] = useState(["John Doe", "Jane Smith"]);
  const [customFields, setCustomFields] = useState([]);

  // Quick Reply states
  const [quickReplies, setQuickReplies] = useState([
    {
      id: "1",
      title: "Greeting",
      message: "Hello! How can I help you today?",
    },
    {
      id: "2",
      title: "Goodbye",
      message: "Thank you for contacting us. Have a great day!",
    },
    {
      id: "3",
      title: "Follow Up",
      message: "I'll get back to you with more information soon.",
    },
  ]);
  const [quickReplyEditMode, setQuickReplyEditMode] = useState(false);
  const [quickReplyEditingId, setQuickReplyEditingId] = useState(null);
  const [quickReplyModalVisible, setQuickReplyModalVisible] = useState(false);

  // Voice Note states
  const [voiceNotes, setVoiceNotes] = useState([
    {
      id: "1",
      title: "Welcome Message",
      description: "Default welcome message for new users",
      audioUrl: "https://example.com/audio/welcome.mp3",
    },
    {
      id: "2",
      title: "Support Instructions",
      description: "Steps to contact support",
      audioUrl: "https://example.com/audio/support.mp3",
    },
  ]);
  const [voiceNoteEditMode, setVoiceNoteEditMode] = useState(false);
  const [voiceNoteEditingId, setVoiceNoteEditingId] = useState(null);
  const [voiceNoteModalVisible, setVoiceNoteModalVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const audioRef = useRef(null);

  const [formData, setFormData] = useState({
    mobileNumber: "+1234567890",
    status: "",
    selectedVariableValuesObj: {},
    fileUrl: "",
    description: "",
  });

  // Use static templates instead of API call
  const approvedTemplatesRaw = staticApprovedTemplates;
  const allTemplates = approvedTemplatesRaw.filter(template => {
    if (!template?.actions) return true;
    return !template.actions.some(
      action => action && action.type === "url" && action.url?.includes("{{1}}")
    );
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load notifications
    const savedNotifications = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error("Failed to parse saved notifications", error);
      }
    }

    // Load quick replies
    const savedQuickReplies = localStorage.getItem(QUICK_REPLY_STORAGE_KEY);
    if (savedQuickReplies) {
      try {
        setQuickReplies(JSON.parse(savedQuickReplies));
      } catch (error) {
        console.error("Failed to parse saved quick replies", error);
      }
    }

    // Load voice notes
    const savedVoiceNotes = localStorage.getItem(VOICE_NOTE_STORAGE_KEY);
    if (savedVoiceNotes) {
      try {
        setVoiceNotes(JSON.parse(savedVoiceNotes));
      } catch (error) {
        console.error("Failed to parse saved voice notes", error);
      }
    }

    // Load webhook URL
    const savedWebhookUrl = localStorage.getItem("webhookUrl");
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    }
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(notifications)
    );
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(QUICK_REPLY_STORAGE_KEY, JSON.stringify(quickReplies));
  }, [quickReplies]);

  useEffect(() => {
    localStorage.setItem(VOICE_NOTE_STORAGE_KEY, JSON.stringify(voiceNotes));
  }, [voiceNotes]);

  // Handle template selection changes
  useEffect(() => {
    if (selectedTemplate?.examples) {
      try {
        let parsedVariables = [];
        if (
          typeof selectedTemplate.examples === "object" &&
          !Array.isArray(selectedTemplate.examples)
        ) {
          parsedVariables = Object.keys(selectedTemplate.examples);
        } else if (Array.isArray(selectedTemplate.examples)) {
          parsedVariables = selectedTemplate.examples;
        }

        setTemplateVariables(parsedVariables || []);
        const varDataObj = {};
        parsedVariables.forEach(variable => {
          varDataObj[variable] = "";
        });

        setFormData(prev => ({
          ...prev,
          selectedVariableValuesObj: varDataObj,
          fileUrl: "",
        }));
        setFileList([]);
      } catch (e) {
        console.error("Error parsing template variables:", e);
        setTemplateVariables([]);
      }
    } else {
      setTemplateVariables([]);
    }

    if (selectedTemplate?.actions && selectedTemplate.actions.length > 0) {
      selectedTemplate.actions.forEach((action, index) => {
        if (action.type === "url" && action.url?.includes("{{1}}")) {
          const variableKey = `{{1}}_action_${index}`;
          setFormData(prev => ({
            ...prev,
            selectedVariableValuesObj: {
              ...prev.selectedVariableValuesObj,
              [variableKey]: "",
            },
          }));
        }
      });
    }
  }, [selectedTemplate]);

  // Quick Reply functions
  const quickReplyColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: text => <Text ellipsis={{ tooltip: text }}>{text}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditQuickReply(record)}
            disabled={!quickReplyEditMode}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteQuickReply(record.id)}
            disabled={!quickReplyEditMode}
            danger
          />
        </div>
      ),
    },
  ];

  const handleAddNewQuickReply = () => {
    quickReplyForm.resetFields();
    setQuickReplyEditingId(null);
    setQuickReplyModalVisible(true);
  };

  const handleEditQuickReply = record => {
    quickReplyForm.setFieldsValue(record);
    setQuickReplyEditingId(record.id);
    setQuickReplyModalVisible(true);
  };

  const handleDeleteQuickReply = id => {
    setQuickReplies(quickReplies.filter(item => item.id !== id));
    message.success("Quick reply deleted successfully");
  };

  const handleSaveQuickReply = () => {
    quickReplyForm
      .validateFields()
      .then(values => {
        if (quickReplyEditingId) {
          setQuickReplies(
            quickReplies.map(item =>
              item.id === quickReplyEditingId
                ? { ...values, id: quickReplyEditingId }
                : item
            )
          );
          message.success("Quick reply updated successfully");
        } else {
          const newId = (quickReplies.length + 1).toString();
          setQuickReplies([...quickReplies, { ...values, id: newId }]);
          message.success("Quick reply added successfully");
        }
        setQuickReplyModalVisible(false);
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  };

  const handleSaveAllQuickReplies = () => {
    message.success("All quick replies saved successfully");
    setQuickReplyEditMode(false);
  };

  const handleResetQuickReplies = () => {
    setQuickReplies([]);
    setQuickReplyEditMode(true);
  };

  // Voice Note functions
  const voiceNoteColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: text => <Text ellipsis={{ tooltip: text }}>{text || "N/A"}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            icon={
              currentPlayingId === record.id ? (
                <StopOutlined />
              ) : (
                <PlayCircleOutlined />
              )
            }
            onClick={() => handlePlayPause(record)}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditVoiceNote(record)}
            disabled={!voiceNoteEditMode}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteVoiceNote(record.id)}
            disabled={!voiceNoteEditMode}
            danger
          />
        </div>
      ),
    },
  ];

  const handleAddNewVoiceNote = () => {
    voiceNoteForm.resetFields();
    setVoiceNoteEditingId(null);
    setVoiceNoteModalVisible(true);
  };

  const handleEditVoiceNote = record => {
    voiceNoteForm.setFieldsValue(record);
    setVoiceNoteEditingId(record.id);
    setVoiceNoteModalVisible(true);
  };

  const handleDeleteVoiceNote = id => {
    setVoiceNotes(voiceNotes.filter(item => item.id !== id));
    message.success("Voice note deleted successfully");
  };

  const handlePlayPause = record => {
    if (currentPlayingId === record.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setCurrentPlayingId(null);
    } else {
      setCurrentPlayingId(record.id);
      if (audioRef.current) {
        audioRef.current.src = record.audioUrl;
        audioRef.current.play().catch(e => {
          message.error("Failed to play audio: " + e.message);
        });
      }
    }
  };

  const handleSaveVoiceNote = () => {
    voiceNoteForm
      .validateFields()
      .then(values => {
        if (voiceNoteEditingId) {
          setVoiceNotes(
            voiceNotes.map(item =>
              item.id === voiceNoteEditingId
                ? { ...values, id: voiceNoteEditingId }
                : item
            )
          );
          message.success("Voice note updated successfully");
        } else {
          const newId = (voiceNotes.length + 1).toString();
          const audioUrl = `https://example.com/audio/note_${newId}.mp3`;
          setVoiceNotes([...voiceNotes, { ...values, id: newId, audioUrl }]);
          message.success("Voice note added successfully");
        }
        setVoiceNoteModalVisible(false);
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  };

  const handleSaveAllVoiceNotes = () => {
    message.success("All voice notes saved successfully");
    setVoiceNoteEditMode(false);
  };

  const handleResetVoiceNotes = () => {
    setVoiceNotes([]);
    setVoiceNoteEditMode(true);
  };

  const handleRecording = () => {
    setIsRecording(!isRecording);
    message.info(isRecording ? "Recording stopped" : "Recording started");
  };

  const beforeUploadVoice = file => {
    const isAudio = file.type.startsWith("audio/");
    if (!isAudio) {
      message.error("You can only upload audio files!");
    }
    return isAudio;
  };

  // Existing functions (keeping all original functionality)
  const notificationColumns = [
    {
      title: "S.No.",
      key: "sno",
      render: (_, __, index) => index + 1,
      width: 80,
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },
    {
      title: "Template Name",
      dataIndex: "templateName",
      key: "templateName",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: status => (
        <Text
          style={{
            color: status === "completed" ? "var(--primary)" : "inherit",
            fontWeight: status === "completed" ? "bold" : "normal",
          }}
        >
          {STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}
        </Text>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      responsive: ["md"],
    },
    {
      title: "Actions",
      key: "actions",
      width: screens.xs ? 80 : 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "delete",
                label: "Delete",
                icon: <DeleteOutlined />,
                style: { color: "red" },
                onClick: () => handleDeleteNotification(record.key),
              },
            ],
          }}
          trigger={["click"]}
          placement='bottomRight'
        >
          <Button
            type='text'
            icon={<MoreOutlined />}
            size={screens.xs ? "small" : "middle"}
          />
        </Dropdown>
      ),
    },
  ];

  const handleDeleteNotification = key => {
    setNotifications(prev => {
      const newNotifications = prev.filter(
        notification => notification.key !== key
      );
      return newNotifications;
    });
    message.success("Notification deleted successfully!");
  };

  const handleSelectTemplate = template => {
    setSelectedTemplate(template);
    setComposeModalOpen(false);
    setFormData(prev => ({
      ...prev,
      fileUrl: "",
    }));
    setFileList([]);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVariableValueChange = (variableName, value) => {
    setFormData(prev => ({
      ...prev,
      selectedVariableValuesObj: {
        ...prev.selectedVariableValuesObj,
        [variableName]: value,
      },
    }));
  };

  const handleFileChange = info => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);
    setFileList(newFileList);

    if (info.file && !info.file.status) {
      // Simulate successful upload
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          fileUrl: "https://static.example.com/uploaded-file.jpg",
        }));
        message.success(`${info.file.name} file uploaded successfully.`);
      }, 500);
    }
  };

  const handleBeforeUpload = file => {
    const headerType = selectedTemplate?.headerType?.toLowerCase() || "";
    let sizeLimit = MAX_FILE_SIZE_DOC;
    let acceptedTypes = [];

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
      case "document":
      case "doc":
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

    if (!acceptedTypes.includes(file.type)) {
      message.error(
        `Invalid file type! Accepted types are: ${acceptedTypes.join(", ")}`
      );
      return Upload.LIST_IGNORE;
    }

    if (file.size > sizeLimit) {
      const sizeLimitMB =
        headerType === "image" ? "5" : headerType === "video" ? "16" : "100";
      message.error(`File size must be smaller than ${sizeLimitMB}MB!`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const getAcceptString = () => {
    const headerType = selectedTemplate?.headerType?.toLowerCase() || "";
    switch (headerType) {
      case "image":
        return ".jpg,.jpeg,.png";
      case "video":
        return ".mp4,.mov,.mpeg";
      case "file":
      case "document":
      case "doc":
        return ".doc,.pdf,.docx";
      default:
        return "";
    }
  };

  const handleToggle = (cardTitle, value) => {
    console.log(`${cardTitle} switch toggled:`, value);
    message.info(`${cardTitle} ${value ? "enabled" : "disabled"}`);
  };

  const handleCardClick = card => {
    setSelectedCard(card);
  };

  const handleCloseFollowUp = () => {
    setSelectedCard(null);
  };

  const onFinish = () => {
    if (!formData.status) {
      message.error("Please select a status!");
      return;
    }

    if (!selectedTemplate) {
      message.error("Please select a template!");
      return;
    }

    if (
      (selectedTemplate?.headerType === "image" ||
        selectedTemplate?.headerType === "video" ||
        selectedTemplate?.headerType === "file") &&
      !formData.fileUrl
    ) {
      message.error(`Please upload a ${selectedTemplate.headerType} file!`);
      return;
    }

    if (selectedTemplate?.examples) {
      let hasErrors = false;
      Object.keys(selectedTemplate.examples)?.forEach(ele => {
        const value = formData.selectedVariableValuesObj?.[ele];
        if (!value || value.length === 0) {
          hasErrors = true;
          message.error(`${ele} is required!`);
        }

        if (ele.toLowerCase() === "otp" && value && value.length > 15) {
          hasErrors = true;
          message.error("OTP cannot be more than 15 characters");
        }
      });

      if (hasErrors) return;
    }

    if (selectedTemplate?.actions && selectedTemplate.actions.length > 0) {
      let hasErrors = false;
      selectedTemplate.actions.forEach((action, index) => {
        if (action.type === "url" && action.url?.includes("{{1}}")) {
          const variableKey = `{{1}}_action_${index}`;
          const variableValue =
            formData.selectedVariableValuesObj?.[variableKey];

          if (!variableValue || variableValue.length === 0) {
            hasErrors = true;
            message.error(
              `Please provide a value for CTA URL (${action.text})`
            );
          }
        }
      });

      if (hasErrors) return;
    }

    const newKey =
      notifications.length > 0
        ? Math.max(...notifications.map(n => n.key)) + 1
        : 1;
    const newNotification = {
      key: newKey,
      mobileNumber: formData.mobileNumber,
      templateName: selectedTemplate.name,
      status: formData.status,
      description: formData.description,
    };

    setNotifications(prev => [...prev, newNotification]);

    message.success(`${selectedCard?.title} notification sent successfully!`);

    onReset();
  };

  const onReset = () => {
    setFormData({
      mobileNumber: "",
      status: "",
      selectedVariableValuesObj: {},
      fileUrl: "",
      description: "",
    });
    setSelectedTemplate(null);
    setTemplateVariables([]);
    setFileList([]);
  };

  const handleWebhookSave = () => {
    if (!webhookUrl) {
      message.error("Please enter a webhook URL!");
      return;
    }

    localStorage.setItem("webhookUrl", webhookUrl);

    message.success("Webhook configuration saved successfully!");
  };

  const handleWebhookTest = () => {
    if (!webhookUrl) {
      message.error("Please enter a webhook URL first!");
      return;
    }

    message.info("Webhook test initiated!");

    setTimeout(() => {
      message.success("Webhook test completed successfully!");
    }, 2000);
  };

  const handleWebhookReset = () => {
    setWebhookUrl("");
    localStorage.removeItem("webhookUrl");
  };

  // Render functions
  const renderNotifyContent = () => (
    <Card
      style={{ borderRadius: "8px", marginTop: screens.xs ? "12px" : "16px" }}
    >
      <div
        style={{
          maxWidth: "1400px",
          padding: screens.xs ? "12px" : "20px",
        }}
      >
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: screens.xs ? "20px" : "24px",
              fontWeight: "600",
              textAlign: "left",
            }}
          >
            {selectedCard?.title} Configuration
          </h2>
          <Button
            type='primary'
            onClick={handleCloseFollowUp}
            size={screens.xs ? "small" : "middle"}
            style={{
              backgroundColor: "var(--primary)",
              borderColor: "var(--primary)",
              borderRadius: 8,
            }}
          >
            Back
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  textAlign: "left",
                }}
              >
                Status <span style={{ color: "red" }}>*</span>
              </label>
              <Select
                placeholder='Select status'
                value={formData.status || undefined}
                onChange={value => handleInputChange("status", value)}
                size={screens.xs ? "small" : "middle"}
                style={{ width: "100%", textAlign: "left" }}
              >
                {STATUS_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  textAlign: "left",
                }}
              >
                Mobile Number <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder='Fetch Mobile number & Display Here'
                value={formData.mobileNumber}
                disabled
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, "");
                  handleInputChange("mobileNumber", value);
                }}
                maxLength={12}
                size={screens.xs ? "small" : "middle"}
                style={{ textAlign: "left" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
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
                {selectedTemplate?.name ? (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "8px" }}>
                      {selectedTemplate.name}
                    </span>
                    <Button
                      type='text'
                      icon={<FeatherIcon icon='refresh-cw' size='16' />}
                      onClick={() => setComposeModalOpen(true)}
                      style={{ color: "var(--primary)" }}
                      size={screens.xs ? "small" : "middle"}
                    />
                    <Button
                      type='text'
                      danger
                      icon={<DeleteOutlined style={{ fontSize: "16px" }} />}
                      onClick={() => {
                        setSelectedTemplate(null);
                        setTemplateVariables([]);
                        setFormData(prev => ({
                          ...prev,
                          selectedVariableValuesObj: {},
                          fileUrl: "",
                        }));
                        setFileList([]);
                      }}
                      size={screens.xs ? "small" : "middle"}
                    />
                  </div>
                ) : (
                  <Button
                    type='text'
                    icon={<CloudUploadOutlined style={{ fontSize: "20px" }} />}
                    onClick={() => setComposeModalOpen(true)}
                    style={{ color: "var(--primary)" }}
                    size={screens.xs ? "small" : "middle"}
                  />
                )}
              </div>

              {selectedTemplate && (
                <div
                  style={{
                    backgroundColor: "#E2FFE8",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span style={{ color: "#666", minWidth: "40px" }}>
                        Type:
                      </span>
                      <span style={{ fontWeight: "600" }}>
                        {selectedTemplate.type}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span style={{ color: "#666", minWidth: "50px" }}>
                        Header:
                      </span>
                      <span style={{ fontWeight: "600" }}>
                        {selectedTemplate.headerType || "None"}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span style={{ color: "#666", minWidth: "40px" }}>
                      Template:
                    </span>
                    <span style={{ fontWeight: "600" }}>
                      {selectedTemplate.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {(selectedTemplate?.headerType === "image" ||
              selectedTemplate?.headerType === "video" ||
              selectedTemplate?.headerType === "file") && (
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      textAlign: "left",
                    }}
                  >
                    Upload {selectedTemplate?.headerType}{" "}
                    {selectedTemplate?.headerType === "image"
                      ? "(Max 5MB)"
                      : selectedTemplate?.headerType === "video"
                        ? "(Max 16MB)"
                        : "(Max 100MB)"}
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <Upload
                    fileList={fileList}
                    accept={getAcceptString()}
                    maxCount={1}
                    beforeUpload={handleBeforeUpload}
                    onChange={handleFileChange}
                    onRemove={() => {
                      setFormData(prev => ({
                        ...prev,
                        fileUrl: "",
                      }));
                      setFileList([]);
                    }}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      size={screens.xs ? "small" : "middle"}
                    >
                      Upload {selectedTemplate?.headerType}
                    </Button>
                  </Upload>
                  {formData.fileUrl && (
                    <div style={{ marginTop: "8px", color: "#52c41a" }}>
                      ✓ File uploaded successfully
                    </div>
                  )}
                </div>
              )}

            {templateVariables.map(variable => (
              <div key={variable} style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                    textAlign: "left",
                  }}
                >
                  {variable} <span style={{ color: "red" }}>*</span>
                </label>
                <Select
                  placeholder={`Select ${variable}`}
                  value={
                    formData.selectedVariableValuesObj[variable] || undefined
                  }
                  onChange={value => handleVariableValueChange(variable, value)}
                  size={screens.xs ? "small" : "middle"}
                  style={{ width: "100%", textAlign: "left" }}
                >
                  {DYNAMIC_VARIABLE_OPTIONS.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            ))}

            {selectedTemplate?.actions?.map((action, index) => {
              if (action.type === "url" && action.url?.includes("{{1}}")) {
                const variableKey = `{{1}}_action_${index}`;
                return (
                  <div key={variableKey} style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        textAlign: "left",
                      }}
                    >
                      CTA URL ({action.text}){" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Input
                      placeholder={`Enter URL for ${action.text}`}
                      value={
                        formData.selectedVariableValuesObj[variableKey] || ""
                      }
                      onChange={e =>
                        handleVariableValueChange(variableKey, e.target.value)
                      }
                      size={screens.xs ? "small" : "middle"}
                      style={{ textAlign: "left" }}
                    />
                  </div>
                );
              }
              return null;
            })}

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  textAlign: "left",
                }}
              >
                Description
              </label>
              <TextArea
                placeholder='Enter description'
                value={formData.description}
                onChange={e => handleInputChange("description", e.target.value)}
                rows={4}
                size={screens.xs ? "small" : "middle"}
                style={{ textAlign: "left" }}
              />
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button
                type='primary'
                onClick={onFinish}
                size={screens.xs ? "small" : "middle"}
                style={{
                  width: "auto",
                  backgroundColor: "var(--primary)",
                  borderColor: "var(--primary)",
                  borderRadius: "8px",
                }}
              >
                Send
              </Button>
              <Button
                onClick={onReset}
                size={screens.xs ? "small" : "middle"}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  width: "auto",
                  borderRadius: "8px",
                }}
              >
                Reset
              </Button>
            </div>
          </Col>
        </Row>

        <div style={{ marginTop: "24px" }}>
          <h3 style={{ marginBottom: "16px" }}>Sent Notifications</h3>
          <Table
            className="leads-performance-table"
            columns={notificationColumns}
            dataSource={notifications}
            pagination={{
              position: ["bottomRight"],
              pageSize: 10,
              showSizeChanger: false,
              simple: screens.xs,
            }}
            scroll={{ x: true }}
            size={screens.xs ? "small" : "middle"}
          />
        </div>

        <ComposeModals
          modelopen={composeModalOpen}
          data={allTemplates}
          setModelOpen={setComposeModalOpen}
          handleTemplateSelect={handleSelectTemplate}
        />
      </div>
    </Card>
  );

  const renderWebhookContent = () => (
    <Card
      style={{ borderRadius: "8px", marginTop: screens.xs ? "12px" : "16px" }}
    >
      <div
        style={{
          maxWidth: "1400px",
          padding: screens.xs ? "12px" : "20px",
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: "24px",
            fontSize: screens.xs ? "20px" : "24px",
            fontWeight: "600",
            textAlign: "left",
          }}
        >
          Webhook Configuration
        </h2>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={18}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  textAlign: "left",
                }}
              >
                Webhook URL <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                placeholder='Enter webhook URL'
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                size={screens.xs ? "small" : "middle"}
                style={{ textAlign: "left" }}
              />
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button
                type='primary'
                onClick={handleWebhookSave}
                size={screens.xs ? "small" : "middle"}
                style={{
                  width: "auto",
                  backgroundColor: "var(--primary)",
                  borderColor: "var(--primary)",
                  borderRadius: "8px",
                }}
              >
                Save
              </Button>
              <Button
                onClick={handleWebhookTest}
                size={screens.xs ? "small" : "middle"}
                style={{
                  width: "auto",
                  borderRadius: "8px",
                }}
              >
                Test Run
              </Button>
              <Button
                onClick={handleWebhookReset}
                size={screens.xs ? "small" : "middle"}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  width: "auto",
                  borderRadius: "8px",
                }}
              >
                Reset
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );

  const renderQuickReplyContent = () => (
    <Card
      style={{
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
        marginTop: screens.xs ? "12px" : "16px",
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
            <MessageOutlined style={{ fontSize: "24px", color: "var(--primary)" }} />
            <Title level={4} style={{ margin: 0 }}>
              Quick Reply Configuration
            </Title>
          </div>
          {quickReplyEditMode && (
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleAddNewQuickReply}
              style={{
                backgroundColor: "var(--primary)",
                borderColor: "var(--primary)",
                borderRadius: 8,
              }}
            >
              Add Quick Reply
            </Button>
          )}
        </div>

        <div style={{ marginBottom: "24px" }}>
          <Table
            className="leads-performance-table"
            columns={quickReplyColumns}
            dataSource={quickReplies}
            rowKey='id'
            pagination={false}
            bordered
            size={screens.xs ? "small" : "middle"}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-start",
          }}
        >
          {!quickReplyEditMode ? (
            <Button
              type='primary'
              onClick={() => setQuickReplyEditMode(true)}
              style={{
                backgroundColor: "var(--primary)",
                borderColor: "var(--primary)",
                borderRadius: "8px",
              }}
            >
              Edit
            </Button>
          ) : (
            <Button
              type='primary'
              onClick={handleSaveAllQuickReplies}
              style={{
                backgroundColor: "var(--primary)",
                borderColor: "var(--primary)",
                borderRadius: "8px",
              }}
            >
              Save All
            </Button>
          )}
          <Button
            type='primary'
            onClick={handleResetQuickReplies}
            danger
            style={{ borderRadius: "8px" }}
          >
            Reset
          </Button>
        </div>
      </div>

      <Modal
        title={quickReplyEditingId ? "Edit Quick Reply" : "Add New Quick Reply"}
        visible={quickReplyModalVisible}
        onOk={handleSaveQuickReply}
        onCancel={() => setQuickReplyModalVisible(false)}
        okText='Save'
        cancelText='Cancel'
      >
        <Form form={quickReplyForm} layout='vertical'>
          <Form.Item
            name='title'
            label='Title'
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder='Enter quick reply title' />
          </Form.Item>
          <Form.Item
            name='message'
            label='Message'
            rules={[{ required: true, message: "Please enter a message" }]}
          >
            <TextArea rows={4} placeholder='Enter quick reply message' />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );

  const renderVoiceNoteContent = () => (
    <Card
      style={{
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
        marginTop: screens.xs ? "12px" : "16px",
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
            <AudioOutlined style={{ fontSize: "24px", color: "var(--primary)" }} />
            <Title level={4} style={{ margin: 0 }}>
              Voice Note Configuration
            </Title>
          </div>
          {voiceNoteEditMode && (
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleAddNewVoiceNote}
              style={{
                backgroundColor: "var(--primary)",
                borderColor: "var(--primary)",
                borderRadius: 8,
              }}
            >
              Add Voice Note
            </Button>
          )}
        </div>

        <div style={{ marginBottom: "24px" }}>
          <Table
            className="leads-performance-table"
            columns={voiceNoteColumns}
            dataSource={voiceNotes}
            rowKey='id'
            pagination={false}
            bordered
            size={screens.xs ? "small" : "middle"}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-start",
          }}
        >
          {!voiceNoteEditMode ? (
            <Button
              type='primary'
              onClick={() => setVoiceNoteEditMode(true)}
              style={{
                backgroundColor: "var(--primary)",
                borderColor: "var(--primary)",
                borderRadius: "8px",
              }}
            >
              Edit
            </Button>
          ) : (
            <Button
              type='primary'
              onClick={handleSaveAllVoiceNotes}
              style={{
                backgroundColor: "var(--primary)",
                borderColor: "var(--primary)",
                borderRadius: "8px",
              }}
            >
              Save All
            </Button>
          )}
          <Button
            type='primary'
            onClick={handleResetVoiceNotes}
            danger
            style={{ borderRadius: "8px" }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} onEnded={() => setCurrentPlayingId(null)} />

      <Modal
        title={voiceNoteEditingId ? "Edit Voice Note" : "Add New Voice Note"}
        visible={voiceNoteModalVisible}
        onOk={handleSaveVoiceNote}
        onCancel={() => setVoiceNoteModalVisible(false)}
        okText='Save'
        cancelText='Cancel'
        width={700}
      >
        <Form form={voiceNoteForm} layout='vertical'>
          <Form.Item
            name='title'
            label='Title'
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder='Enter voice note title' />
          </Form.Item>
          <Form.Item name='description' label='Description'>
            <TextArea rows={2} placeholder='Enter description (optional)' />
          </Form.Item>

          <Form.Item label='Audio' required>
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <Button
                type='primary'
                icon={isRecording ? <StopOutlined /> : <AudioOutlined />}
                onClick={handleRecording}
                danger={isRecording}
              >
                {isRecording ? "Stop Recording" : "Record Audio"}
              </Button>

              <Upload
                beforeUpload={beforeUploadVoice}
                showUploadList={false}
                customRequest={({ file, onSuccess }) => {
                  setTimeout(() => {
                    onSuccess("ok");
                    message.success(`${file.name} file uploaded successfully`);
                  }, 1000);
                }}
              >
                <Button icon={<PlusOutlined />} style={{ borderRadius: 8 }}>
                  Upload Audio File
                </Button>
              </Upload>
            </div>

            {voiceNoteEditingId && (
              <div style={{ marginTop: "16px" }}>
                <Text strong>Current Audio:</Text>
                <div style={{ marginTop: "8px" }}>
                  <Button
                    icon={<PlayCircleOutlined />}
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.src =
                          voiceNoteForm.getFieldValue("audioUrl");
                        audioRef.current.play();
                      }
                    }}
                    style={{ borderRadius: 8 }}
                  >
                    Play Current Audio
                  </Button>
                </div>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );

  const renderCards = () => (
    <Row gutter={[24, 24]}>
      {notifyCards.map((card, index) => (
        <Col key={index} xs={24} sm={12} md={12} lg={8} xl={8}>
          <Card
            hoverable
            onClick={() => handleCardClick(card)}
            style={{
              width: "100%",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
              cursor: "pointer",
            }}
            bodyStyle={{
              padding: "20px",
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <Button
                  shape='circle'
                  style={{
                    backgroundColor: "#F1FBE2",
                    border: "none",
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {card.icon}
                </Button>
                <h5 style={{ margin: 0, fontWeight: "600" }}>{card.title}</h5>
              </div>
              <Switch
                size={screens.xs ? "small" : "default"}
                onChange={checked => handleToggle(card.title, checked)}
              />
            </div>
            <Text
              style={{
                color: "#666",
                fontSize: "14px",
                lineHeight: "1.5",
                textAlign: "left",
                display: "block",
              }}
            >
              {card.description}
            </Text>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderTabContent = () => {
    if (selectedCard) {
      return renderNotifyContent();
    }

    switch (activeTab) {
      case "1":
        return;
      case "2":
        return renderWebhookContent();
      case "4":
        return renderQuickReplyContent();
      case "5":
        return renderVoiceNoteContent();
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <ContentHeader currentPage='Ticket Settings' />

      <Card
        style={{
          borderRadius: "8px",
          marginTop: screens.xs ? "12px" : "16px",
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size={screens.xs ? "small" : "large"}
          style={{ marginBottom: "0" }}
        >
          <TabPane
            tab={
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <SettingOutlined />
                Main Settings
              </span>
            }
            key='1'
          >
            <FreshworksSettings />
          </TabPane>
        </Tabs>
      </Card>

      {renderTabContent()}
    </div>
  );
}

export default Configuration;
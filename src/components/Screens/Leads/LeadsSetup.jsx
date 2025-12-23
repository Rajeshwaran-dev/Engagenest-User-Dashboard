import React, { useState, useEffect } from "react";

import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Switch,
  Tabs,
  Input,
  Form,
  Modal,
  Select,
  Table,
  Upload,
  message,
  Dropdown,
  Collapse,
  Space,
  Divider,
  Tooltip,
  Popconfirm,
  Calendar,
} from "antd";
import {
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
  MoreOutlined,
  PlusOutlined,
  MinusOutlined,
  ExclamationCircleFilled,
  BellOutlined,
  SettingOutlined,
  LinkOutlined,
  MessageOutlined,
  TeamOutlined,
  UserAddOutlined,
  GlobalOutlined,
  ShoppingOutlined,
  AppstoreOutlined
} from "@ant-design/icons";
import ComposeModals from "./Modules/ComposeModals";
import { useSnackbar } from "notistack";
import FeatherIcon from "feather-icons-react";
import { UsersThree } from "@phosphor-icons/react";
import MasterLayout from "../../../masterLayout/MasterLayout";
import Breadcrumb from "../../Breadcrumb";
import WebhookConfigTab from "./WebhookConfigTab";
import QuickReplyConfigTab from "./QuickReplyConfigTab";

const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;

// Static data for notification cards
const notifyCards = [
  {
    title: "Business Alert",
    description:
      "Track and manage all new leads in your system with real-time updates.",
    icon: <TeamOutlined style={{ fontSize: "20px", color: "var(--primary)" }} />,
    key: "businessAlert",
  },
  {
    title: "New Lead Creation Alert",
    description: "Monitor lead progression and send automated updates.",
    icon: <UserAddOutlined style={{ fontSize: "20px", color: "var(--primary)" }} />,
    key: "newLeadCreationAlert",
  },
];

// Static templates data
const staticTemplates = [
  {
    id: 1,
    name: "Welcome Template",
    type: "text",
    message: "Welcome to our service {{name}}! Your OTP is {{otp}}.",
    headerType: "text",
    examples: {
      name: "John Doe",
      otp: "123456"
    },
    approved: true
  },
  {
    id: 2,
    name: "Business Alert Template",
    type: "text",
    message: "New business lead received: {{company}} - {{contact}}",
    headerType: "text",
    examples: {
      company: "ABC Corp",
      contact: "John Smith"
    },
    approved: true
  },
  {
    id: 3,
    name: "Image Alert Template",
    type: "image",
    message: "Check out this image: {{description}}",
    headerType: "image",
    headerContent: "Image header",
    examples: {
      description: "Product preview"
    },
    approved: true
  }
];

// Static alert configuration data
const staticAlertConfig = {
  businessAlert: {
    template: staticTemplates[1],
    formData: {
      agentPhone: "",
      selectedVariableValuesObj: {},
      fileUrl: "",
      variableMappings: {},
    },
    fileList: [],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  newLeadCreationAlert: {
    template: staticTemplates[0],
    formData: {
      mobileNumber: "",
      selectedVariableValuesObj: {},
      fileUrl: "",
      variableMappings: {},
    },
    fileList: [],
    active: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
};

// Static lead configuration data
const staticLeadConfig = {
  leadFields: [
    {
      fieldKey: "status",
      fieldName: "Status",
      fieldType: "select",
      options: ["New", "Contacted", "Qualified", "Proposal", "Closed"]
    },
    {
      fieldKey: "source",
      fieldName: "Source",
      fieldType: "select",
      options: ["Website", "Referral", "Social Media", "Email", "Phone"]
    },
    {
      fieldKey: "product",
      fieldName: "Product",
      fieldType: "select",
      options: ["Product A", "Product B", "Product C", "Product D"]
    },
    {
      fieldKey: "name",
      fieldName: "Name",
      fieldType: "text"
    },
    {
      fieldKey: "email",
      fieldName: "Email",
      fieldType: "email"
    },
    {
      fieldKey: "phone",
      fieldName: "Phone",
      fieldType: "text"
    },
    {
      fieldKey: "custom_field_1",
      fieldName: "Custom Field 1",
      fieldType: "select",
      options: ["Option 1", "Option 2", "Option 3"]
    }
  ]
};

// Static agents data
const staticAgents = [
  {
    key: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    role: "admin"
  },
  {
    key: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "0987654321",
    role: "agent"
  },
  {
    key: 3,
    name: "Bob Wilson",
    email: "bob@example.com",
    phone: "5551234567",
    role: "superagent"
  }
];

function LeadsSetup() {
  const [expandedCards, setExpandedCards] = useState({});
  const [activeTab, setActiveTab] = useState("1");
  const [selectedTemplates, setSelectedTemplates] = useState({
    businessAlert: staticAlertConfig.businessAlert.template,
    newLeadCreationAlert: staticAlertConfig.newLeadCreationAlert.template,
  });

  const [templateVariables, setTemplateVariables] = useState({
    businessAlert: [],
    newLeadCreationAlert: [],
  });

  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [composeModalFor, setComposeModalFor] = useState(null);
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [agentForm] = Form.useForm();
  const [fileList, setFileList] = useState({
    businessAlert: staticAlertConfig.businessAlert.fileList,
    newLeadCreationAlert: staticAlertConfig.newLeadCreationAlert.fileList,
  });

  const [activeAlerts, setActiveAlerts] = useState({
    businessAlert: staticAlertConfig.businessAlert.active,
    newLeadCreationAlert: staticAlertConfig.newLeadCreationAlert.active,
  });

  const { enqueueSnackbar } = useSnackbar();
  const [editingAgent, setEditingAgent] = useState(null);
  const [agents, setAgents] = useState(staticAgents);

  // Static data for settings tabs
  const [settingsTabItems, setSettingsTabItems] = useState([
    {
      key: "source",
      label: "Source",
      icon: <GlobalOutlined size={18} />,
      options: ["Website", "Referral", "Social Media", "Email", "Phone"],
      color: "var(--primary)",
    },
    {
      key: "product",
      label: "Product",
      icon: <ShoppingOutlined size={18} />,
      options: ["Product A", "Product B", "Product C", "Product D"],
      color: "var(--primary)",
    },
    {
      key: "custom_field_1",
      label: "Custom Field 1",
      icon: <AppstoreOutlined size={18} />,
      options: ["Option 1", "Option 2", "Option 3"],
      color: "var(--primary)",
    },
  ]);

  const [leadFields, setLeadFields] = useState(staticLeadConfig.leadFields);

  // Initialize form data from static config
  const [formData, setFormData] = useState({
    businessAlert: staticAlertConfig.businessAlert.formData,
    newLeadCreationAlert: staticAlertConfig.newLeadCreationAlert.formData,
  });

  // Initialize template variables
  useEffect(() => {
    // Parse template variables for businessAlert
    if (selectedTemplates.businessAlert?.examples) {
      const parsedVariables = Object.keys(selectedTemplates.businessAlert.examples);
      setTemplateVariables(prev => ({
        ...prev,
        businessAlert: parsedVariables
      }));

      const varDataObj = {};
      parsedVariables.forEach(variable => {
        varDataObj[variable] = "";
      });

      setFormData(prev => ({
        ...prev,
        businessAlert: {
          ...prev.businessAlert,
          selectedVariableValuesObj: varDataObj,
        },
      }));
    }

    // Parse template variables for newLeadCreationAlert
    if (selectedTemplates.newLeadCreationAlert?.examples) {
      const parsedVariables = Object.keys(selectedTemplates.newLeadCreationAlert.examples);
      setTemplateVariables(prev => ({
        ...prev,
        newLeadCreationAlert: parsedVariables
      }));

      const varDataObj = {};
      parsedVariables.forEach(variable => {
        varDataObj[variable] = "";
      });

      setFormData(prev => ({
        ...prev,
        newLeadCreationAlert: {
          ...prev.newLeadCreationAlert,
          selectedVariableValuesObj: varDataObj,
        },
      }));
    }
  }, []);

  const agentColumns = [
    {
      title: "S.No.",
      dataIndex: "key",
      key: "sno",
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email ID",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: role => (
        <span
          style={{
            color: role === "superagent" ? "var(--primary)" : "inherit",
            fontWeight: role === "superagent" ? "bold" : "normal",
          }}
        >
          {role}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: "Edit",
                icon: <EditOutlined />,
                onClick: () => handleEditAgent(record),
              },
              {
                key: "delete",
                label: "Delete",
                icon: <DeleteOutlined />,
                style: { color: "red" },
                onClick: () => handleDeleteAgent(record.key),
              },
            ],
          }}
          trigger={["click"]}
          placement='bottomRight'
        >
          <Button type='text' icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const allTemplates = staticTemplates.filter(template => template.approved);

  // Use the same template list for all alert types
  const businessAlertTemplates = allTemplates;
  const newLeadCreationTemplates = allTemplates;

  const MAX_FILE_SIZE_DOC = 100 * 1024 * 1024;
  const MAX_FILE_SIZE_IMAGE = 15 * 1024 * 1024;
  const MAX_FILE_SIZE_VIDEO = 20 * 1024 * 1024;

  const handleDeleteAgent = key => {
    setAgents(prev => {
      const newAgents = prev.filter(agent => agent.key !== key);
      return newAgents;
    });
    enqueueSnackbar("Agent deleted successfully!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  const handleEditAgent = record => {
    setEditingAgent(record);
    setAgentModalOpen(true);
    agentForm.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      role: record.role,
    });
  };

  const handleAgentModalOk = () => {
    agentForm
      .validateFields()
      .then(values => {
        try {
          if (editingAgent) {
            // Update agent
            setAgents(prev =>
              prev.map(agent =>
                agent.key === editingAgent.key
                  ? { ...agent, ...values, key: editingAgent.key }
                  : agent
              )
            );
            enqueueSnackbar("Agent updated successfully!", {
              variant: "success",
              autoHideDuration: 3000,
            });
          } else {
            // Add new agent
            const newAgent = {
              ...values,
              key: agents.length > 0 ? Math.max(...agents.map(a => a.key)) + 1 : 1
            };
            setAgents(prev => [...prev, newAgent]);
            enqueueSnackbar("Agent added successfully!", {
              variant: "success",
              autoHideDuration: 3000,
            });
          }

          setAgentModalOpen(false);
          setEditingAgent(null);
          agentForm.resetFields();
        } catch (error) {
          console.error("Operation failed:", error);
          enqueueSnackbar("Operation failed. Please try again.", {
            variant: "error",
            autoHideDuration: 3000,
          });
        }
      })
      .catch(error => {
        console.error("Validation failed:", error);
      });
  };

  const handleAgentModalCancel = () => {
    setAgentModalOpen(false);
    setEditingAgent(null);
    agentForm.resetFields();
  };

  const handleInputChange = (alertType, field, value) => {
    setFormData(prev => ({
      ...prev,
      [alertType]: {
        ...prev[alertType],
        [field]: value,
      },
    }));
  };

  const handleVariableValueChange = (alertType, variableName, value) => {
    setFormData(prev => ({
      ...prev,
      [alertType]: {
        ...prev[alertType],
        selectedVariableValuesObj: {
          ...prev[alertType].selectedVariableValuesObj,
          [variableName]: value,
        },
      },
    }));
  };

  const renderVariableMappingDropdown = (alertType, variable) => {
    const currentMapping =
      formData[alertType]?.variableMappings?.[variable] || "";

  };

  const handleFileChange = (alertType, info) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);

    setFileList(prev => ({
      ...prev,
      [alertType]: newFileList,
    }));

    if (info?.file?.status === "done") {
      // Simulate file upload with static URL
      setFormData(prev => ({
        ...prev,
        [alertType]: {
          ...prev[alertType],
          fileUrl: "https://example.com/uploaded-file.jpg",
        },
      }));
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (info?.file?.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }

    if (newFileList.length === 0) {
      setFormData(prev => ({
        ...prev,
        [alertType]: {
          ...prev[alertType],
          fileUrl: "",
        },
      }));
    }
  };

  const handleBeforeUpload = (file, alertType) => {
    const template = selectedTemplates[alertType];
    const headerType = template?.headerType?.toLowerCase() || "";

    // For static demo, just check file size
    let sizeLimit = MAX_FILE_SIZE_DOC;

    switch (headerType) {
      case "image":
        sizeLimit = MAX_FILE_SIZE_IMAGE;
        if (!file.type.startsWith("image/")) {
          message.error("Please upload an image file!");
          return Upload.LIST_IGNORE;
        }
        break;
      case "video":
        sizeLimit = MAX_FILE_SIZE_VIDEO;
        if (!file.type.startsWith("video/")) {
          message.error("Please upload a video file!");
          return Upload.LIST_IGNORE;
        }
        break;
      case "file":
      case "document":
      case "doc":
        sizeLimit = MAX_FILE_SIZE_DOC;
        if (!file.type.includes("pdf") && !file.type.includes("word") && !file.type.includes("document")) {
          message.error("Please upload a document file!");
          return Upload.LIST_IGNORE;
        }
        break;
      default:
        return true;
    }

    if (file.size > sizeLimit) {
      const sizeLimitMB = Math.round(sizeLimit / (1024 * 1024));
      message.error(`File size must be smaller than ${sizeLimitMB}MB!`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const getAcceptString = (alertType) => {
    const template = selectedTemplates[alertType];
    const headerType = template?.headerType?.toLowerCase() || "";

    switch (headerType) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      case "file":
      case "document":
        return ".pdf,.doc,.docx";
      default:
        return "*";
    }
  };

  const handleToggle = async (alertType, value) => {
    // Update local state
    setActiveAlerts(prev => ({
      ...prev,
      [alertType]: value,
    }));

    // Simulate API call success
    enqueueSnackbar(
      `${alertType} ${value ? "activated" : "deactivated"} successfully!`,
      {
        variant: "success",
        autoHideDuration: 3000,
      }
    );
  };

  const handleCardExpand = alertType => {
    if (activeAlerts[alertType]) {
      setExpandedCards(prev => ({
        ...prev,
        [alertType]: !prev[alertType],
      }));
    }
  };

  const handleTabChange = key => {
    setActiveTab(key);
  };

  const handleAddAgent = () => {
    setEditingAgent(null);
    setAgentModalOpen(true);
    agentForm.resetFields();
  };

  // Static settings for dropdown management
  const [newOptionValue, setNewOptionValue] = useState("");
  const [activeSetting, setActiveSetting] = useState("source");
  const [isOptionLoading, setIsOptionLoading] = useState(false);

  const handleAddOption = () => {
    if (!newOptionValue.trim()) {
      message.warning("Please enter an option value");
      return;
    }

    setIsOptionLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const currentOptions = settingsTabItems.find(
        item => item.key === activeSetting
      ).options;
      const newOptions = [...currentOptions, newOptionValue.trim()];

      setSettingsTabItems(prev =>
        prev.map(item =>
          item.key === activeSetting ? { ...item, options: newOptions } : item
        )
      );

      setNewOptionValue("");
      message.success("Option added successfully");
      setIsOptionLoading(false);
    }, 500);
  };

  const showDeleteConfirm = (option) => {
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";

    Modal.confirm({
      title: (
        <span style={{ color: isDarkMode ? "#f0f2f5" : "#1f1f1f" }}>
          Are you sure you want to delete "{option}"?
        </span>
      ),
      icon: <ExclamationCircleFilled style={{ color: isDarkMode ? "#ff7875" : "#e0241e" }} />,
      content: (
        <span style={{ color: isDarkMode ? "#a0a0a0" : "#555" }}>
          This action cannot be undone.
        </span>
      ),
      okText: "Yes, delete it",
      cancelText: "Cancel",
      centered: true,
      okButtonProps: {
        style: {
          backgroundColor: "#e0241e",
          borderColor: "#e0241e",
          color: "#fff",
          borderRadius: 6,
        },
      },
      cancelButtonProps: {
        style: {
          borderRadius: 6,
          borderColor: isDarkMode ? "#333" : "#d9d9d9",
          color: isDarkMode ? "#ccc" : "#444",
        },
      },
      className: "modern-modal",
      styles: {
        body: {
          backgroundColor: isDarkMode ? "" : "#ffffff",
        },
      },
      onOk() {
        handleRemoveOption(option);
      },
    });
  };

  const handleRemoveOption = option => {
    // Simulate API call
    const newOptions = settingsTabItems
      .find(item => item.key === activeSetting)
      .options.filter(opt => opt !== option);

    setSettingsTabItems(prev =>
      prev.map(item =>
        item.key === activeSetting ? { ...item, options: newOptions } : item
      )
    );
    message.success("Option deleted successfully");
  };

  const handleSelectTemplate = (alertType, template) => {
    setSelectedTemplates(prev => ({
      ...prev,
      [alertType]: template,
    }));

    // Reset form data for new template
    setFormData(prev => ({
      ...prev,
      [alertType]: {
        ...(alertType === "businessAlert" ? { agentPhone: "" } : {}),
        ...(alertType === "newLeadCreationAlert" ? { mobileNumber: "" } : {}),
        selectedVariableValuesObj: {},
        fileUrl: "",
        variableMappings: {},
      },
    }));

    // Parse template variables
    if (template?.examples) {
      const parsedVariables = Object.keys(template.examples);

      setTemplateVariables(prev => ({
        ...prev,
        [alertType]: parsedVariables || [],
      }));

      const varDataObj = {};
      parsedVariables.forEach(variable => {
        varDataObj[variable] = "";
      });

      setFormData(prev => ({
        ...prev,
        [alertType]: {
          ...prev[alertType],
          selectedVariableValuesObj: varDataObj,
        },
      }));
    } else {
      setTemplateVariables(prev => ({
        ...prev,
        [alertType]: [],
      }));
    }

    setFileList(prev => ({
      ...prev,
      [alertType]: [],
    }));

    setComposeModalOpen(false);
  };

  const onFinish = async alertType => {
    const currentFormData = formData[alertType];
    const currentTemplate = selectedTemplates[alertType];

    if (!currentTemplate) {
      enqueueSnackbar("Please select a template!", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    // Different validation for different alert types
    if (alertType === "reminderConfiguration") {
      if (!currentFormData.mobileNumber) {
        enqueueSnackbar("Mobile number is required!", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return;
      }
    }

    // Header file validations
    const headerType = currentTemplate?.headerType?.toLowerCase();
    if (
      (headerType === "image" ||
        headerType === "video" ||
        headerType === "file" ||
        headerType === "document") &&
      !currentFormData.fileUrl
    ) {
      if (currentTemplate?.headerContent) {
        enqueueSnackbar(`Please upload a ${headerType} file!`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return;
      }
    }

    // Template variables validation
    if (currentTemplate?.examples) {
      let hasErrors = false;
      const variableMappings = currentFormData.variableMappings || {};

      Object.keys(currentTemplate.examples)?.forEach(ele => {
        const variableValue = currentFormData.selectedVariableValuesObj?.[ele];
        const isMappedToField =
          variableMappings[ele] && variableMappings[ele] !== "";

        if (alertType === "businessAlert") {
          if (!isMappedToField) {
            hasErrors = true;
            enqueueSnackbar(`Please map "${ele}" to a lead field!`, {
              variant: "error",
              autoHideDuration: 3000,
            });
          }
        } else {
          if (
            !isMappedToField &&
            (!variableValue || variableValue.length === 0)
          ) {
            hasErrors = true;
            enqueueSnackbar(
              `${ele} is required (not mapped to any lead field)!`,
              {
                variant: "error",
                autoHideDuration: 3000,
              }
            );
          }
        }
      });

      if (hasErrors) return;
    }

    // Simulate saving to backend
    try {
      enqueueSnackbar(`${alertType} configuration saved successfully!`, {
        variant: "success",
        autoHideDuration: 3000,
      });

      // Collapse the card after successful save
      setExpandedCards(prev => ({
        ...prev,
        [alertType]: false,
      }));
    } catch (error) {
      enqueueSnackbar(`Failed to save ${alertType} configuration`, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const onReset = async alertType => {
    try {
      // Reset local states
      setFormData(prev => ({
        ...prev,
        [alertType]: {
          agentPhone: "",
          mobileNumber: "",
          selectedVariableValuesObj: {},
          fileUrl: "",
          variableMappings: {},
        },
      }));

      setSelectedTemplates(prev => ({
        ...prev,
        [alertType]: null,
      }));

      setTemplateVariables(prev => ({
        ...prev,
        [alertType]: [],
      }));

      setFileList(prev => ({
        ...prev,
        [alertType]: [],
      }));

      // Collapse the card after reset
      setExpandedCards(prev => ({
        ...prev,
        [alertType]: false,
      }));

      // Show success notification
      enqueueSnackbar(`${alertType} configuration reset successfully!`, {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar(`Failed to reset ${alertType} configuration`, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const renderCardContent = card => {
    const alertType = card.key;
    const isExpanded = expandedCards[alertType];
    const currentTemplate = selectedTemplates[alertType];
    const currentFormData = formData[alertType];
    const currentTemplateVariables = templateVariables[alertType];
    const currentFileList = fileList[alertType];

    return (
      <div
        style={{
          padding: "24px",
          borderRadius: "8px",
          minHeight: "400px",
        }}
        key={`content-${alertType}`}
      >
        {/* Different input for different alert types */}
        {alertType === "businessAlert" ? (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ marginBottom: "8px" }}>
              <Text strong style={{ textAlign: "left", display: "block" }}>
                Recipient Number
              </Text>
            </div>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "6px",
                border: "1px solid #e6f7ff",
              }}
            >
              <Text style={{ fontWeight: "500" }}>
                Agent Contact Number
              </Text>
            </div>
          </div>
        ) : alertType === "newLeadCreationAlert" ? (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ marginBottom: "8px" }}>
              <Text strong style={{ textAlign: "left", display: "block" }}>
                Recipient Number
              </Text>
            </div>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "6px",
                border: "1px solid #e6f7ff",
              }}
            >
              <Text style={{ fontWeight: "500" }}>
                Primary Contact
              </Text>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ marginBottom: "8px" }}>
              <Text strong style={{ textAlign: "left", display: "block" }}>
                Mobile Number <Text type="danger">*</Text>
              </Text>
            </div>
            <Select
              placeholder='Select contact number'
              value={currentFormData.mobileNumber}
              onChange={value =>
                handleInputChange(alertType, "mobileNumber", value)
              }
              style={{ width: "100%", textAlign: "left" }}
              size="large"
            >
              <Option value='primary' key='primary'>
                Primary Contact
              </Option>
              {agents.map(agent => (
                <Option key={agent.key} value={agent.phone}>
                  {agent.name} - {agent.phone}
                </Option>
              ))}
            </Select>
          </div>
        )}

        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <Text strong style={{ textAlign: "left" }}>
              Select Template <Text type="danger">*</Text>
            </Text>
            {currentTemplate?.name ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Text style={{ fontWeight: "500" }}>
                  Template Name: {currentTemplate.name}
                </Text>
                <Tooltip title='Click to change template'>
                  <Button
                    type='text'
                    icon={<FeatherIcon icon='refresh-cw' size='16' />}
                    onClick={() => {
                      setComposeModalFor(alertType);
                      setComposeModalOpen(true);
                    }}
                    style={{ color: "var(--primary)" }}
                  />
                </Tooltip>
              </div>
            ) : (
              <Button
                type='text'
                icon={<CloudUploadOutlined style={{ fontSize: "16px" }} />}
                onClick={() => {
                  setComposeModalFor(alertType);
                  setComposeModalOpen(true);
                }}
                style={{ color: "var(--primary)" }}
              >
                Select Template
              </Button>
            )}
          </div>

          {currentTemplate && (
            <Card
              style={{
                border: "1px solid #d9f7be",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <Row gutter={[16, 8]} style={{ marginBottom: "8px" }}>
                <Col span={12}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Text style={{ color: "#666", minWidth: "60px" }}>Type:</Text>
                    <Text strong style={{ color: "#283046" }}>
                      {currentTemplate.type}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Text style={{ color: "#666", minWidth: "60px" }}>Header:</Text>
                    <Text strong style={{ color: "#283046" }}>
                      {currentTemplate.headerType || "None"}
                    </Text>
                  </div>
                </Col>
              </Row>
              <div style={{ display: "flex", gap: "8px" }}>
                <Text style={{ color: "#666", minWidth: "60px" }}>Body:</Text>
                <Text strong style={{ color: "#283046" }}>
                  {currentTemplate.message}
                </Text>
              </div>
            </Card>
          )}
        </div>

        {(currentTemplate?.headerType === "image" ||
          currentTemplate?.headerType === "video" ||
          currentTemplate?.headerType === "file" ||
          currentTemplate?.headerType === "document") && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ marginBottom: "8px" }}>
                <Text strong style={{ textAlign: "left", display: "block" }}>
                  Upload {currentTemplate?.headerType}{" "}
                  {currentTemplate?.headerType === "image"
                    ? "(Max 15MB)"
                    : currentTemplate?.headerType === "video"
                      ? "(Max 20MB)"
                      : "(Max 100MB)"}
                  <Text type="danger">*</Text>
                </Text>
              </div>
              <Upload
                fileList={currentFileList}
                accept={getAcceptString(alertType)}
                maxCount={1}
                beforeUpload={file => handleBeforeUpload(file, alertType)}
                onChange={info => handleFileChange(alertType, info)}
                onRemove={() => {
                  setFormData(prev => ({
                    ...prev,
                    [alertType]: {
                      ...prev[alertType],
                      fileUrl: "",
                    },
                  }));
                  setFileList(prev => ({
                    ...prev,
                    [alertType]: [],
                  }));
                }}
              >
                <Button icon={<UploadOutlined />} size="large" style={{ width: "100%" }}>
                  Upload {currentTemplate?.headerType}
                </Button>
              </Upload>
              {currentFormData.fileUrl && (
                <div style={{ marginTop: "8px", color: "#52c41a", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FeatherIcon icon="check-circle" size="16" />
                  File uploaded successfully
                </div>
              )}
            </div>
          )}

        {currentTemplateVariables.map(variable => {
          // For businessAlert, always show dropdown mapping
          if (alertType === "businessAlert") {
            return (
              <React.Fragment key={variable}>
                {renderVariableMappingDropdown(alertType, variable)}
              </React.Fragment>
            );
          }

          // For other alert types, keep the existing logic
          const isMappedToField =
            currentFormData.variableMappings?.[variable] &&
            currentFormData.variableMappings[variable] !== "";
        })}

        <div
          style={{
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <Button
            type='primary'
            onClick={() => onFinish(alertType)}
            size='large'
            style={{
              minWidth: "100px",
              borderRadius: "8px",
              backgroundColor: "var(--primary)",
              borderColor: "var(--primary)",
            }}
          >
            Save
          </Button>
          <Button
            onClick={() => onReset(alertType)}
            size='large'
            style={{
              minWidth: "100px",
              borderRadius: "8px",
              backgroundColor: "#ff4d4f",
              borderColor: "#ff4d4f",
              color: "white",
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      
        <Breadcrumb title="Lead Configuration" />
        <Tabs defaultActiveKey='1' onChange={handleTabChange}>
          <TabPane tab={
            <span style={{ fontSize: "16px", fontWeight: "600" }}>
              <BellOutlined /> Reminders
            </span>
          } key='1'>
            <Row gutter={[24, 24]}>
              {notifyCards.map((card, index) => {
                const isExpanded = expandedCards[card.key];

                return (
                  <Col key={card.key} xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Card
                      style={{
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        transition: "all 0.3s ease",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: isExpanded ? "600px" : "auto",
                        cursor: "pointer",
                      }}
                      bodyStyle={{
                        padding: "20px",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onClick={() => handleCardExpand(card.key)}
                    >
                      {/* Header Row */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#F1FBE2",
                              borderRadius: "50%",
                              width: "48px",
                              height: "48px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {card.icon}
                          </div>
                          <h5 style={{ margin: 0 }}>{card.title}</h5>
                        </div>

                        <Popconfirm
                          title="Confirm Change"
                          description={`Are you sure you want to turn ${activeAlerts[card.key] ? "OFF" : "ON"
                            } this alert?`}
                          okText="Yes"
                          cancelText="No"
                          placement="topRight"
                          onConfirm={() =>
                            handleToggle(card.key, !activeAlerts[card.key])
                          }
                        >
                          <Switch
                            checked={activeAlerts[card.key]}
                            checkedChildren="ON"
                            unCheckedChildren="OFF"
                            onMouseDown={(e) => e.stopPropagation()} // ✅ FIX
                          />
                        </Popconfirm>

                      </div>

                      {/* Divider */}
                      <Divider style={{ margin: "12px 0" }} />

                      <Text style={{ color: "gray", fontSize: "14px" }}>
                        {card.description}
                      </Text>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div
                          style={{
                            marginTop: "16px",
                            flex: 1,
                            overflow: "auto",
                            minHeight: "400px",
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          {renderCardContent(card)}
                        </div>
                      )}
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </TabPane>

          <TabPane tab={
            <span style={{ fontSize: "16px", fontWeight: "600" }}>
              <SettingOutlined /> Settings
            </span>
          } key='2'>
            <div>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "30px",
                  }}
                >
                  <SettingOutlined
                    style={{ fontSize: "24px", color: "var(--primary)" }}
                  />
                  <Title level={4} style={{ margin: 0 }}>
                    Settings Configuration
                  </Title>
                </div>

                {/* Switch tabs inside card */}
                <Tabs defaultActiveKey='leadFields'>
                  {/* Lead Fields Tab */}
                  <TabPane tab={
                    <span style={{ fontSize: "16px", fontWeight: "600" }}>
                      Lead Field Configuration
                    </span>
                  } key='leadFields'>
                    <Card>
                      <Title level={5}>Lead Fields Configuration</Title>
                      <Text>
                        This is where you would configure lead fields. For static demo,
                        fields are pre-configured with sample data.
                      </Text>
                      <Table
                        className="leads-performance-table"
                        dataSource={leadFields}
                        columns={[
                          { title: 'Field Name', dataIndex: 'fieldName', key: 'fieldName' },
                          { title: 'Field Key', dataIndex: 'fieldKey', key: 'fieldKey' },
                          { title: 'Field Type', dataIndex: 'fieldType', key: 'fieldType' },
                          {
                            title: 'Options',
                            dataIndex: 'options',
                            key: 'options',
                            render: options => options ? options.join(', ') : 'N/A'
                          }
                        ]}
                        rowKey="fieldKey"
                        pagination={false}
                      />
                    </Card>
                  </TabPane>

                  {/* Dropdown Fields Tab */}
                  <TabPane
                    tab={<span style={{ fontSize: "16px", fontWeight: "600" }}>
                      Dropdown Field Configuration
                    </span>}
                    key="dropdownFields"
                  >
                    <Row gutter={24} className="dropdown-fields-wrapper">
                      {/* Left Sidebar */}
                      <Col xs={24} sm={8} md={6} lg={6}>
                        <Card className="dropdown-sidebar-card">
                          <h6 level={6} className="sidebar-title">
                            Dropdown Fields
                          </h6>

                          <div className="dropdown-field-list">
                            {settingsTabItems.map((item) => {
                              const isActive = activeSetting === item.key;
                              return (
                                <div
                                  key={item.key}
                                  className={`dropdown-field-item ${isActive ? "active" : ""
                                    }`}
                                  onClick={() => {
                                    setActiveSetting(item.key);
                                    setNewOptionValue("");
                                  }}
                                >
                                  <div className="field-left">
                                    {React.cloneElement(item.icon, {
                                      size: 18,
                                      color: isActive ? "#1677ff" : "#888",
                                    })}
                                    <span className="field-label">{item.label}</span>
                                  </div>
                                  <span className="field-count">{item.options.length}</span>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      </Col>

                      {/* Right Panel */}
                      <Col xs={24} sm={16} md={18} lg={18}>
                        {activeSetting && (
                          <Card className="dropdown-main-card">
                            <div className="main-header">
                              {React.cloneElement(
                                settingsTabItems.find(
                                  (item) => item.key === activeSetting
                                )?.icon,
                                {
                                  size: 22,
                                  color: "#1677ff",
                                }
                              )}
                              <Typography.Title level={5} className="main-title">
                                {
                                  settingsTabItems.find(
                                    (item) => item.key === activeSetting
                                  )?.label
                                }{" "}
                                Options
                              </Typography.Title>
                            </div>

                            {/* Add Option Input */}
                            <div className="add-option-row">
                              <Input
                                placeholder={`Add new ${activeSetting} option`}
                                value={newOptionValue}
                                onChange={(e) => setNewOptionValue(e.target.value)}
                                onPressEnter={handleAddOption}
                                className="add-option-input"
                              />
                              <Button
                                icon={<PlusOutlined />}
                                onClick={handleAddOption}
                                loading={isOptionLoading}
                                className="btn-primary"
                              >
                                Add
                              </Button>
                            </div>

                            {/* Options List */}
                            <Card className="options-list-card" bordered={false}>
                              <Typography.Text strong className="options-list-title">
                                Available Options (
                                {
                                  settingsTabItems.find(
                                    (item) => item.key === activeSetting
                                  )?.options.length
                                }
                                )
                              </Typography.Text>

                              <div className="options-scroll">
                                {settingsTabItems.find(
                                  (item) => item.key === activeSetting
                                )?.options.length > 0 ? (
                                  settingsTabItems
                                    .find((item) => item.key === activeSetting)
                                    ?.options.map((option) => (
                                      <div key={option} className="option-item">
                                        <div className="option-left">
                                          <div className="option-dot" />
                                          <span>{option}</span>
                                        </div>
                                        <Button
                                          type="text"
                                          danger
                                          icon={<DeleteOutlined />}
                                          onClick={() => showDeleteConfirm(option)}
                                        />
                                      </div>
                                    ))
                                ) : (
                                  <div className="empty-options">
                                    <FeatherIcon icon="inbox" size={48} />
                                    <p>No options added yet</p>
                                    <Typography.Text type="secondary">
                                      Add your first option using the input above
                                    </Typography.Text>
                                  </div>
                                )}
                              </div>
                            </Card>
                          </Card>
                        )}
                      </Col>
                    </Row>
                  </TabPane>
                </Tabs>
              </Card>

            </div>
          </TabPane>

          <TabPane tab={
            <span style={{ fontSize: "16px", fontWeight: "600" }}>
              <LinkOutlined /> Webhook
            </span>
          } key='3'>
            <WebhookConfigTab />
          </TabPane>

          <TabPane tab={
            <span style={{ fontSize: "16px", fontWeight: "600" }}>
              <MessageOutlined /> Quick Reply
            </span>
          } key='4'>
            <QuickReplyConfigTab />
          </TabPane>
        </Tabs>

        <ComposeModals
          modelopen={composeModalOpen}
          data={
            composeModalFor === "businessAlert"
              ? businessAlertTemplates
              : composeModalFor === "newLeadCreationAlert"
                ? newLeadCreationTemplates
                : allTemplates
          }
          allowedTabs={['text']}
          setModelOpen={setComposeModalOpen}
          handleTemplateSelect={template =>
            handleSelectTemplate(composeModalFor, template)
          }
        />

        <Modal
          title={editingAgent ? "Edit Agent" : "Add Agent"}
          open={agentModalOpen}
          onOk={handleAgentModalOk}
          onCancel={handleAgentModalCancel}
          okText='Save'
          cancelText='Cancel'
          okButtonProps={{
            style: { backgroundColor: "var(--primary)", borderColor: "var(--primary)" },
          }}
        >
          <Form form={agentForm} layout='vertical' style={{ marginTop: "16px" }}>
            <Form.Item
              name='name'
              label='Name'
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input placeholder='Enter name' />
            </Form.Item>

            <Form.Item
              name='email'
              label='Email'
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter valid email" },
              ]}
            >
              <Input placeholder='Enter email' />
            </Form.Item>

            {!editingAgent && (
              <Form.Item
                name='password'
                label='Password'
                rules={[{ required: true, message: "Please enter password" }]}
              >
                <Input.Password placeholder='Enter password' />
              </Form.Item>
            )}

            <Form.Item
              name='phone'
              label='Mobile Number'
              rules={[{ required: true, message: "Please enter mobile number" }]}
            >
              <Input placeholder='Enter mobile number' maxLength={12} />
            </Form.Item>

            <Form.Item
              name='role'
              label='Role'
              rules={[{ required: true, message: "Please select role" }]}
            >
              <Select placeholder='Select role'>
                <Option value='admin'>Admin</Option>
                <Option value='agent'>Agent</Option>
                <Option value='superagent'>Super Agent</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      
    </div>
  );
}

export default LeadsSetup;
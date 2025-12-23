import React, { useState, useEffect } from "react";
import {
  Modal,
  Tabs,
  Card,
  Row,
  Col,
  Typography,
  Input,
  Button,
  Space,
  Divider,
  Tag,
  Select,
  Upload,
  List,
  Avatar,
  Form,
  message,
  Popconfirm,
  Collapse,
  Badge,
  Tooltip,
  InputNumber,
  Rate,
  Table,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
  PhoneOutlined,
  SendOutlined,
  PlusOutlined,
  SearchOutlined,
  CloudUploadOutlined,
  UploadOutlined,
  CheckOutlined,
  StopOutlined,
  MessageOutlined,
  AudioOutlined,
} from "@ant-design/icons";
import moment from "moment";
import ComposeModals from "../Leads/Modules/ComposeModals";
import QuickReplyVoiceNoteTab from "./QuickReplyVoiceNoteTab";

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Text, Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// Static templates data
const STATIC_TEMPLATES = [
  {
    _id: "1",
    name: "Welcome Message",
    category: "Greeting",
    language: "English",
    headerType: "text",
    examples: {
      customer_name: "Customer Name",
      company_name: "Company Name"
    },
    actions: [],
  },
  {
    _id: "2",
    name: "Password Reset",
    category: "Security",
    language: "English",
    headerType: "text",
    examples: {
      reset_link: "Reset Link",
      otp: "OTP Code"
    },
    actions: [
      {
        type: "url",
        text: "Reset Password",
        url: "https://example.com/reset/{{1}}"
      }
    ],
  },
  {
    _id: "3",
    name: "Invoice Sent",
    category: "Billing",
    language: "English",
    headerType: "text",
    examples: {
      invoice_number: "Invoice Number",
      amount: "Amount",
      due_date: "Due Date"
    },
    actions: [],
  },
  {
    _id: "4",
    name: "Account Verification",
    category: "Security",
    language: "English",
    headerType: "text",
    examples: {
      verification_code: "Verification Code"
    },
    actions: [],
  },
];

const TicketDetailModal = ({
  visible,
  onCancel,
  selectedTicket,
  editableDescription,
  setEditableDescription,
  handleDescriptionUpdate,
  originalDescriptions,
  setOriginalDescriptions,
  handleAddDescription,
  handleDeleteDescription,
  recording,
  startRecording,
  stopRecording,
}) => {
  const [activeTab, setActiveTab] = useState("1");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [templateVariables, setTemplateVariables] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(
    selectedTicket?.status || ""
  );
  const [templateDescription, setTemplateDescription] = useState("");
  const [sentTemplates, setSentTemplates] = useState([]);
  const [formData, setFormData] = useState({
    selectedTemplate: null,
    selectedVariableValuesObj: {},
    fileUrl: "",
  });

  // Use static templates instead of API call
  const allTemplates = STATIC_TEMPLATES;

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
        }));
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

  const handleSelectTemplate = template => {
    setSelectedTemplate(template);
    setComposeModalOpen(false);
    setFormData(prev => ({
      ...prev,
      fileUrl: "",
    }));
    setFileList([]);
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

  const handleFormSubmit = () => {
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

    if (!templateDescription.trim()) {
      message.error("Please add a description!");
      return;
    }

    // Add to sent templates list
    const newSentTemplate = {
      key: Date.now(),
      mobileNumber: selectedTicket.mobileNumber,
      status: selectedStatus,
      description: templateDescription,
      templateName: selectedTemplate.name,
      date: moment().format("DD/MM/YYYY HH:mm:ss"),
    };

    setSentTemplates(prev => [newSentTemplate, ...prev]);
    message.success(`Template sent to ${selectedTicket.mobileNumber}`);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      selectedTemplate: null,
      selectedVariableValuesObj: {},
      fileUrl: "",
    });
    setSelectedTemplate(null);
    setTemplateVariables([]);
    setFileList([]);
    setTemplateDescription("");
  };

  const handleDeleteSentTemplate = key => {
    setSentTemplates(prev => prev.filter(item => item.key !== key));
    message.success("Template record deleted successfully");
  };

  const sentTemplatesColumns = [
    {
      title: "S.No.",
      dataIndex: "key",
      key: "sno",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: status => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Template Name",
      dataIndex: "templateName",
      key: "templateName",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type='text'
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteSentTemplate(record.key)}
        />
      ),
    },
  ];

  // Reset states when modal closes or ticket changes
  useEffect(() => {
    if (visible && selectedTicket) {
      setEditableDescription(selectedTicket.description || "");
      setOriginalDescriptions(selectedTicket.descriptions || []);
      setMessageContent("");
      setSelectedStatus(selectedTicket.status || "");
    } else {
      setIsEditingDescription(false);
      setSelectedTemplate(null);
    }
  }, [visible, selectedTicket]);

  const getPriorityColor = priority => {
    switch (priority) {
      case "Low":
        return "#52c41a";
      case "Medium":
        return "#1890ff";
      case "High":
        return "#faad14";
      case "Critical":
        return "#ff4d4f";
      default:
        return "#d9d9d9";
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case "Complete":
        return "#52c41a";
      case "Pending":
        return "#faad14";
      case "In Progress":
        return "#1890ff";
      case "Assigned":
        return "#722ed1";
      case "Awaiting Customer Response":
        return "#fa8c16";
      default:
        return "#d9d9d9";
    }
  };

  return (
    <Modal
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontWeight: 600 }}>
              Ticket ID:{" "}
              <Tag color='#1890ff' style={{ marginLeft: "8px" }}>
                {selectedTicket?.ticketId}
              </Tag>
            </span>
          </div>
        </div>
      }
      open={visible}
      onCancel={() => {
        onCancel();
      }}
      footer={null}
      width={1200}
      centered
      className='ticket-detail-modal'
      destroyOnClose
    >
      {selectedTicket && (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          destroyInactiveTabPane
          tabPosition='left'
          style={{ height: 600 }}
          tabBarStyle={{ width: 140 }}
        >
          {/* Tab 1: Ticket Details */}
          <TabPane tab='Ticket Details' key='1'>
            <div style={{ height: 550, overflowY: "auto", padding: "0 16px" }}>
              <Space
                direction='vertical'
                size='large'
                style={{ width: "100%" }}
              >
                <Card
                  title='Basic Information'
                  bordered={false}
                  style={{ marginBottom: 0 }}
                >
                  <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} lg={8}>
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "8px" }}
                        >
                          Customer Name
                        </Text>
                        <Text style={{ display: "block" }}>
                          {selectedTicket.customerName}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} lg={8}>
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "8px" }}
                        >
                          Mobile Number
                        </Text>
                        <Text
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <PhoneOutlined />
                          {selectedTicket.mobileNumber}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} lg={8}>
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "8px" }}
                        >
                          Department
                        </Text>
                        <Text style={{ display: "block" }}>
                          {selectedTicket.department}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} lg={8}>
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "8px" }}
                        >
                          Priority
                        </Text>
                        <Tag color={getPriorityColor(selectedTicket.priority)}>
                          {selectedTicket.priority}
                        </Tag>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} lg={8}>
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "8px" }}
                        >
                          Assigned To
                        </Text>
                        <Text style={{ display: "block" }}>
                          {selectedTicket.assignedTo}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} lg={8}>
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "8px" }}
                        >
                          Status
                        </Text>
                        <Tag color={getStatusColor(selectedTicket.status)}>
                          {selectedTicket.status}
                        </Tag>
                      </div>
                    </Col>
                  </Row>
                </Card>

                <Card title='Timeline' bordered={false}>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} lg={8}>
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "8px" }}
                        >
                          Created Date
                        </Text>
                        <Text style={{ display: "block" }}>
                          {selectedTicket?.createdDate
                            ? moment(selectedTicket.createdDate).format(
                              "DD/MM/YYYY HH:mm:ss"
                            )
                            : "N/A"}
                        </Text>
                      </div>
                    </Col>
                    {selectedTicket.dueDate && (
                      <Col xs={24} sm={12} lg={8}>
                        <div>
                          <Text
                            strong
                            style={{ display: "block", marginBottom: "8px" }}
                          >
                            Due Date
                          </Text>
                          <Text style={{ display: "block" }}>
                            {moment(selectedTicket.dueDate).format(
                              "DD/MM/YYYY HH:mm:ss"
                            )}
                          </Text>
                        </div>
                      </Col>
                    )}
                    {selectedTicket.assignedDate && (
                      <Col xs={24} sm={12} lg={8}>
                        <div>
                          <Text
                            strong
                            style={{ display: "block", marginBottom: "8px" }}
                          >
                            Assigned Date
                          </Text>
                          <Text style={{ display: "block" }}>
                            {moment(selectedTicket.assignedDate).format(
                              "DD/MM/YYYY HH:mm:ss"
                            )}
                          </Text>
                        </div>
                      </Col>
                    )}
                    {selectedTicket.completedDate && (
                      <Col xs={24} sm={12} lg={8}>
                        <div>
                          <Text
                            strong
                            style={{ display: "block", marginBottom: "8px" }}
                          >
                            Completed Date
                          </Text>
                          <Text style={{ display: "block" }}>
                            {moment(selectedTicket.completedDate).format(
                              "DD/MM/YYYY HH:mm:ss"
                            )}
                          </Text>
                        </div>
                      </Col>
                    )}
                    {selectedTicket.durationFrom &&
                      selectedTicket.durationTo && (
                        <Col xs={24} sm={24} lg={16}>
                          <div>
                            <Text
                              strong
                              style={{ display: "block", marginBottom: "8px" }}
                            >
                              Duration
                            </Text>
                            <Text style={{ display: "block" }}>
                              {moment(selectedTicket.durationFrom).format(
                                "DD/MM/YYYY HH:mm:ss"
                              )}
                              {" → "}
                              {moment(selectedTicket.durationTo).format(
                                "DD/MM/YYYY HH:mm:ss"
                              )}
                            </Text>
                          </div>
                        </Col>
                      )}
                  </Row>
                </Card>

                <Card
                  title='Description'
                  bordered={false}
                  extra={
                    <Button
                      icon={<EditOutlined />}
                      onClick={() =>
                        setIsEditingDescription(!isEditingDescription)
                      }
                      style={{ borderRadius: "8px" }}
                    >
                      {isEditingDescription ? "Cancel" : "Edit"}
                    </Button>
                  }
                >
                  {isEditingDescription ? (
                    <Space
                      direction='vertical'
                      size='middle'
                      style={{ width: "100%" }}
                    >
                      <TextArea
                        value={editableDescription}
                        onChange={e => setEditableDescription(e.target.value)}
                        rows={4}
                        placeholder='Edit description...'
                        autoSize={{ minRows: 3, maxRows: 6 }}
                      />
                      <div
                        style={{ display: "flex", justifyContent: "flex-end" }}
                      >
                        <Button
                          type='primary'
                          onClick={() => {
                            handleDescriptionUpdate();
                            setIsEditingDescription(false);
                          }}
                          disabled={!editableDescription.trim()}
                          style={{ borderRadius: "8px" }}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </Space>
                  ) : (
                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "#fafafa",
                        borderRadius: "8px",
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      {selectedTicket.description}
                    </div>
                  )}
                </Card>

                <Card
                  title='Additional Notes'
                  bordered={false}
                  extra={
                    <Button
                      type='primary'
                      size='small'
                      icon={<PlusOutlined />}
                      onClick={handleAddDescription}
                      disabled={!editableDescription.trim()}
                      style={{ borderRadius: "8px" }}
                    >
                      Add Note
                    </Button>
                  }
                >
                  <Space
                    direction='vertical'
                    size='middle'
                    style={{ width: "100%" }}
                  >
                    <TextArea
                      value={editableDescription}
                      onChange={e => setEditableDescription(e.target.value)}
                      rows={3}
                      placeholder='Add new note...'
                      autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                    <div>
                      {originalDescriptions.map(desc => (
                        <div
                          key={desc.id}
                          style={{
                            padding: "16px",
                            border: "1px solid #f0f0f0",
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            backgroundColor: "#fafafa",
                            marginBottom: "12px",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{ fontWeight: 500, marginBottom: "8px" }}
                            >
                              {desc.text}
                            </div>
                            <Text type='secondary' style={{ fontSize: "12px" }}>
                              {desc.date}
                            </Text>
                          </div>
                          <Button
                            type='text'
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteDescription(desc.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </Space>
                </Card>
              </Space>
            </div>
          </TabPane>

          {/* Tab 2: Send Template */}
          <TabPane tab='Send Template' key='2'>
            <div style={{ height: 550, overflowY: "auto", padding: "16px" }}>
              <Space
                direction='vertical'
                size='large'
                style={{ width: "100%" }}
              >
                <Card bordered={false}>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "8px" }}
                        >
                          Status
                        </Text>
                        <Select
                          style={{ width: "100%" }}
                          value={selectedStatus}
                          onChange={setSelectedStatus}
                        >
                          <Option value='Assigned'>Assigned</Option>
                          <Option value='In Progress'>In Progress</Option>
                          <Option value='Awaiting Customer Response'>
                            Awaiting Customer Response
                          </Option>
                          <Option value='Pending'>Pending</Option>
                          <Option value='Complete'>Complete</Option>
                        </Select>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "8px" }}
                        >
                          Mobile Number
                        </Text>
                        <Input
                          value={selectedTicket.mobileNumber}
                          disabled
                          style={{ width: "100%" }}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          height: "100%",
                        }}
                      >
                        <Button
                          type='primary'
                          onClick={() => setComposeModalOpen(true)}
                          icon={<PlusOutlined />}
                          style={{ width: "100%", borderRadius: 8 }}
                        >
                          Select Template
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  {selectedTemplate && (
                    <div style={{ marginTop: "24px" }}>
                      <Text
                        strong
                        style={{ display: "block", marginBottom: "8px" }}
                      >
                        Selected Template
                      </Text>
                      <Card
                        title={selectedTemplate.name}
                        bordered
                        style={{ marginBottom: "16px" }}
                      >
                        <Space direction='vertical' style={{ width: "100%" }}>
                          {selectedTemplate.headerType && (
                            <div>
                              <Text strong>Header Type: </Text>
                              <Text>{selectedTemplate.headerType}</Text>
                            </div>
                          )}
                          {selectedTemplate.category && (
                            <div>
                              <Text strong>Category: </Text>
                              <Text>{selectedTemplate.category}</Text>
                            </div>
                          )}
                          {selectedTemplate.language && (
                            <div>
                              <Text strong>Language: </Text>
                              <Text>{selectedTemplate.language}</Text>
                            </div>
                          )}
                        </Space>
                      </Card>
                    </div>
                  )}

                  {(selectedTemplate?.headerType === "image" ||
                    selectedTemplate?.headerType === "video" ||
                    selectedTemplate?.headerType === "file") && (
                      <div style={{ marginBottom: "16px" }}>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "8px" }}
                        >
                          Upload {selectedTemplate.headerType}:
                        </Text>
                        <Upload
                          fileList={fileList}
                          beforeUpload={() => false}
                          onChange={({ fileList: newFileList }) => {
                            setFileList(newFileList);
                            if (newFileList.length > 0) {
                              setFormData(prev => ({
                                ...prev,
                                fileUrl: URL.createObjectURL(
                                  newFileList[0].originFileObj
                                ),
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                fileUrl: "",
                              }));
                            }
                          }}
                        >
                          <Button
                            icon={<UploadOutlined />}
                            style={{ borderRadius: 8 }}
                          >
                            Click to Upload
                          </Button>
                        </Upload>
                      </div>
                    )}

                  {templateVariables.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <Text
                        strong
                        style={{ display: "block", marginBottom: "16px" }}
                      >
                        Variables:
                      </Text>
                      <Space
                        direction='vertical'
                        size='middle'
                        style={{ width: "100%" }}
                      >
                        {templateVariables.map(variable => (
                          <div key={variable}>
                            <Text
                              style={{
                                display: "block",
                                marginBottom: "8px",
                              }}
                            >
                              {variable}:
                            </Text>
                            <Input
                              value={
                                formData.selectedVariableValuesObj[variable] ||
                                ""
                              }
                              onChange={e =>
                                handleVariableValueChange(
                                  variable,
                                  e.target.value
                                )
                              }
                              placeholder={`Enter value for ${variable}`}
                            />
                          </div>
                        ))}
                      </Space>
                    </div>
                  )}

                  {selectedTemplate?.actions?.map((action, index) => {
                    if (
                      action.type === "url" &&
                      action.url?.includes("{{1}}")
                    ) {
                      const variableKey = `{{1}}_action_${index}`;
                      return (
                        <div key={index} style={{ marginBottom: "16px" }}>
                          <Text
                            style={{
                              display: "block",
                              marginBottom: "8px",
                            }}
                          >
                            URL for {action.text}:
                          </Text>
                          <Input
                            value={
                              formData.selectedVariableValuesObj[variableKey] ||
                              ""
                            }
                            onChange={e =>
                              handleVariableValueChange(
                                variableKey,
                                e.target.value
                              )
                            }
                            placeholder={`Enter URL for ${action.text}`}
                          />
                        </div>
                      );
                    }
                    return null;
                  })}

                  <div style={{ marginBottom: "16px" }}>
                    <Text
                      strong
                      style={{ display: "block", marginBottom: "8px" }}
                    >
                      Description
                    </Text>
                    <TextArea
                      value={templateDescription}
                      onChange={e => setTemplateDescription(e.target.value)}
                      rows={4}
                      placeholder='Enter description...'
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "16px",
                    }}
                  >
                    <Button
                      onClick={handleReset}
                      disabled={!selectedTemplate}
                      style={{ borderRadius: "8px" }}
                    >
                      Reset
                    </Button>
                    <Button
                      type='primary'
                      onClick={handleFormSubmit}
                      disabled={!selectedTemplate || !templateDescription?.trim()}
                      icon={<SendOutlined />}
                      style={{ borderRadius: "8px" }}
                    >
                      Send to {selectedTicket.mobileNumber}
                    </Button>
                  </div>
                </Card>

                {sentTemplates.length > 0 && (
                  <Card title='Sent Templates History' bordered={false}>
                    <Table
                      className="leads-performance-table"
                      columns={sentTemplatesColumns}
                      dataSource={sentTemplates}
                      pagination={false}
                      size='small'
                      bordered
                    />
                  </Card>
                )}
              </Space>
            </div>
          </TabPane>

          {/* Tab 3: Quick Reply & Voice Note */}
          <TabPane
            tab={
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <MessageOutlined />
                Quick Chat
              </span>
            }
            key='3'
          >
            <QuickReplyVoiceNoteTab selectedTicket={selectedTicket} />
          </TabPane>

          {/* Conditional Tab 4: Feedback */}
          {selectedTicket.status === "Complete" && (
            <TabPane tab='Feedback' key='4'>
              <div
                style={{ height: 550, overflowY: "auto", padding: "0 16px" }}
              >
                <Card title='Customer Feedback' bordered={false}>
                  <Space
                    direction='vertical'
                    size='large'
                    style={{ width: "100%" }}
                  >
                    {selectedTicket.feedbackOption && (
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "12px" }}
                        >
                          Feedback Type:
                        </Text>
                        <Tag color='#1890ff' style={{ padding: "8px 16px" }}>
                          {selectedTicket.feedbackOption}
                        </Tag>
                      </div>
                    )}

                    {selectedTicket.rating && (
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "12px" }}
                        >
                          Rating:
                        </Text>
                        <Rate disabled defaultValue={selectedTicket.rating} />
                      </div>
                    )}

                    {selectedTicket.feedback && (
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "12px" }}
                        >
                          Comments:
                        </Text>
                        <Card
                          bordered={false}
                          style={{
                            backgroundColor: "#fafafa",
                            border: "1px solid #f0f0f0",
                          }}
                        >
                          {selectedTicket.feedback}
                        </Card>
                      </div>
                    )}
                  </Space>
                </Card>
              </div>
            </TabPane>
          )}
        </Tabs>
      )}

      <ComposeModals
        modelopen={composeModalOpen}
        data={allTemplates || []}
        setModelOpen={setComposeModalOpen}
        handleTemplateSelect={handleSelectTemplate}
      />
    </Modal>
  );
};

export default TicketDetailModal;
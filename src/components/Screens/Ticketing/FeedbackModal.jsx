import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Typography,
  message,
  Row,
  Col,
  Form,
  Upload,
  Modal,
  Tabs,
  Table,
  Tag,
} from "antd";
import {
  CloudUploadOutlined,
  UploadOutlined,
  SendOutlined,
  MessageOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import ComposeModals from "../Leads/Modules/ComposeModals";

const { Text, Title } = Typography;
const { TabPane } = Tabs;

// Static data for approved templates
const staticApprovedTemplates = [
  {
    id: "1",
    name: "Feedback Request Template",
    type: "UTILITY",
    headerType: "image",
    examples: ["customer_name", "ticket_id", "feedback_date"],
    actions: [],
  },
  {
    id: "2",
    name: "General Notification Template",
    type: "MARKETING",
    headerType: "text",
    examples: ["order_id", "customer_name"],
    actions: [],
  },
  {
    id: "3",
    name: "Customer Survey Template",
    type: "UTILITY",
    headerType: "video",
    examples: ["survey_id", "customer_name"],
    actions: [],
  },
];

// Mock data for feedback table
const mockFeedbackData = [
  {
    key: "1",
    sNo: 1,
    mobileNumber: "+1234567890",
    feedbackDescription: "Great service, very responsive",
    rating: 5,
    date: "2023-10-15",
  },
  {
    key: "2",
    sNo: 2,
    mobileNumber: "+1987654321",
    feedbackDescription: "Average experience",
    rating: 3,
    date: "2023-10-14",
  },
  {
    key: "3",
    sNo: 3,
    mobileNumber: "+1122334455",
    feedbackDescription: "Poor customer support",
    rating: 1,
    date: "2023-10-13",
  },
];

const FeedbackModal = () => {
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [activeTab, setActiveTab] = useState("feedback-request");

  // Form data state
  const [formData, setFormData] = useState({
    mobileNumber: "",
    countryCode: "",
    selectedVariableValuesObj: {},
    description: "",
    fileUrl: "",
  });

  // Use static templates instead of API call
  const approvedTemplatesRaw = staticApprovedTemplates;

  const allTemplates = approvedTemplatesRaw.filter(template => {
    if (!template?.actions) return true;
    return !template.actions.some(
      action => action && action.type === "url" && action.url?.includes("{{1}}")
    );
  });

  const MAX_FILE_SIZE_IMAGE = 5 * 1024 * 1024;

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

  const handleSelectTemplate = template => {
    setSelectedTemplate(template);
    setComposeModalOpen(false);
    setFormData(prev => ({
      ...prev,
      fileUrl: "",
      description: "",
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

  const handleFileChange = info => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);
    setFileList(newFileList);

    // Simulate successful upload with static response
    if (info.file && !info.file.status) {
      // Simulate upload completion
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          fileUrl: "https://static.example.com/uploaded-image.jpg",
        }));
        message.success(`${info.file.name} file uploaded successfully.`);
      }, 500);
    }
  };

  const handleBeforeUpload = file => {
    const isImage = file.type.includes("image");
    const isLt5M = file.size / 1024 / 1024 < 5;

    if (!isImage) {
      message.error("You can only upload image files!");
    }
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
    }

    return isImage && isLt5M;
  };

  const handleSendFeedback = () => {
    try {
      if (!selectedTemplate) {
        throw new Error("Please select a template");
      }

      if (!formData.mobileNumber) {
        throw new Error("Please enter a mobile number");
      }

      const emptyVariables = templateVariables.filter(
        variable => !formData.selectedVariableValuesObj[variable]
      );
      if (emptyVariables.length > 0) {
        throw new Error(`Please fill: ${emptyVariables.join(", ")}`);
      }

      // Simulate sending feedback request
      message.success("Feedback request sent successfully!");

      // Reset form but keep mobile number for convenience
      setFormData(prev => ({
        mobileNumber: prev.mobileNumber,
        countryCode: prev.countryCode,
        selectedVariableValuesObj: {},
        description: "",
        fileUrl: "",
      }));
      setFileList([]);
      setSelectedTemplate(null);
      setTemplateVariables([]);
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleReset = () => {
    setFormData({
      mobileNumber: "",
      countryCode: "",
      selectedVariableValuesObj: {},
      description: "",
      fileUrl: "",
    });
    setFileList([]);
    setSelectedTemplate(null);
    setTemplateVariables([]);
  };

  // Table columns for feedback configuration
  const feedbackTableColumns = [
    {
      title: "S.No.",
      dataIndex: "sNo",
      key: "sNo",
      width: 80,
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Feedback Description",
      dataIndex: "feedbackDescription",
      key: "feedbackDescription",
      ellipsis: true,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: rating => {
        let color = rating > 3 ? "green" : rating > 2 ? "orange" : "red";
        return <Tag color={color}>{rating}/5</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Tabs
          tabPosition='left'
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ padding: "16px", borderRadius: "12px" }}
        >
          <TabPane
            tab={
              <span>
                <SettingOutlined style={{ marginRight: "8px" }} />
                Feedback Configuration
              </span>
            }
            key='feedback-request'
          >
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
                marginBottom: "24px",
              }}
            >
              <div style={{ padding: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "24px",
                  }}
                >
                  <SettingOutlined
                    style={{ fontSize: "24px", color: "var(--primary)" }}
                  />
                  <Title level={4} style={{ margin: 0 }}>
                    Feedback Configuration
                  </Title>
                </div>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <div
                      style={{
                        borderRadius: "8px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: "16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <Button
                            type='primary'
                            icon={<CloudUploadOutlined />}
                            onClick={() => setComposeModalOpen(true)}
                          >
                            Select Template
                          </Button>
                          {selectedTemplate && (
                            <Text strong style={{ marginLeft: "12px" }}>
                              Selected: {selectedTemplate.name}
                            </Text>
                          )}
                        </div>
                      </div>

                      <Form layout='vertical'>
                        {selectedTemplate && (
                          <div
                            style={{
                              padding: "12px 16px",
                              borderRadius: "8px",
                              marginBottom: "16px",
                            }}
                          >
                            {/* First row - Type and Header */}
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
                                <span
                                  style={{ color: "#666", minWidth: "40px" }}
                                >
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
                                <span
                                  style={{ color: "#666", minWidth: "50px" }}
                                >
                                  Header:
                                </span>
                                <span style={{ fontWeight: "600" }}>
                                  {selectedTemplate.headerType || "None"}
                                </span>
                              </div>
                            </div>

                            {/* Second row - Template */}
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

                        <Form.Item label='Mobile Number' required>
                          <Input
                            value={formData.mobileNumber}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                mobileNumber: e.target.value,
                              }))
                            }
                            style={{ width: "100%" }}
                          />
                        </Form.Item>

                        {templateVariables.map(variable => (
                          <Form.Item
                            key={variable}
                            label={variable.replace(/_/g, " ")}
                            required
                          >
                            <Input
                              placeholder={`Enter ${variable.replace(/_/g, " ")}`}
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
                            />
                          </Form.Item>
                        ))}

                        <Form.Item label='Description'>
                          <Input.TextArea
                            rows={3}
                            placeholder='Enter any additional description'
                            value={formData.description || ""}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                          />
                        </Form.Item>

                        {selectedTemplate?.headerType === "image" && (
                          <Form.Item label='Upload Image' extra='(Max 5MB)'>
                            <Upload
                              fileList={fileList}
                              accept='.jpg,.jpeg,.png'
                              maxCount={1}
                              beforeUpload={handleBeforeUpload}
                              onChange={handleFileChange}
                              onRemove={() => {
                                setFormData(prev => ({ ...prev, fileUrl: "" }));
                                setFileList([]);
                              }}
                            >
                              <Button icon={<UploadOutlined />}>
                                Upload Image
                              </Button>
                            </Upload>
                          </Form.Item>
                        )}

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "8px",
                            marginTop: "16px",
                          }}
                        >
                          <Button onClick={handleReset}>Reset</Button>
                          <Button
                            type='primary'
                            onClick={handleSendFeedback}
                            icon={<SendOutlined />}
                          >
                            Send Feedback Request
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <MessageOutlined style={{ marginRight: "8px" }} />
                Feedbacks
              </span>
            }
            key='feedback-configuration'
          >
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
                    gap: "12px",
                    marginBottom: "24px",
                  }}
                >
                  <MessageOutlined
                    style={{ fontSize: "24px", color: "#1ea433" }}
                  />
                  <Title level={4} style={{ margin: 0 }}>
                    Feedbacks
                  </Title>
                </div>

                <Table
                  className="leads-performance-table"
                  columns={feedbackTableColumns}
                  dataSource={mockFeedbackData}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      <ComposeModals
        modelopen={composeModalOpen}
        data={allTemplates}
        setModelOpen={setComposeModalOpen}
        handleTemplateSelect={handleSelectTemplate}
      />
    </div>
  );
};

export default FeedbackModal;
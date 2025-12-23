import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Table,
  Typography,
  Switch,
  TimePicker,
  message,
  Upload,
  Tag,
  Space,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  CloudUploadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import FeatherIcon from "feather-icons-react";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import ComposeModals from "../Catalog/CatalogOrders/composeModals";

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const TAT_STORAGE_KEY = "tatConfigurations";

// Static data for assignees and status
const assignees = ["John Doe", "Jane Smith", "Robert Johnson", "Sarah Wilson", "Mike Brown"];

const statusOptions = [
  "Assigned",
  "In Progress",
  "Awaiting Customer Response",
  "Pending",
  "Complete",
];

const eventOptions = ["Agent Response Delay", "Ticket Resolve Time"];

// Static departments data
const staticDepartments = [
  { id: "1", name: "Sales" },
  { id: "2", name: "Support" },
  { id: "3", name: "Technical" },
  { id: "4", name: "Billing" },
  { id: "5", name: "General" },
];

// Static approved templates
const staticApprovedTemplates = [
  {
    id: "template-1",
    name: "Welcome Message",
    type: "text",
    headerType: "text",
    examples: { customerName: "John", serviceType: "Premium" },
    actions: []
  },
  {
    id: "template-2",
    name: "Issue Resolution",
    type: "text",
    headerType: "text",
    examples: { issue: "Login problem", solution: "Reset password" },
    actions: []
  },
  {
    id: "template-3",
    name: "Follow Up",
    type: "text",
    headerType: "text",
    examples: { followupDate: "Tomorrow", time: "10:00 AM" },
    actions: []
  },
  {
    id: "template-4",
    name: "Image Template",
    type: "media",
    headerType: "image",
    examples: { productName: "Smartphone", discount: "20%" },
    actions: []
  },
  {
    id: "template-5",
    name: "Document Template",
    type: "document",
    headerType: "file",
    examples: { fileName: "Invoice", amount: "$100" },
    actions: []
  },
];

const TatTab = ({ departments = staticDepartments }) => {
  const [form] = Form.useForm();
  const [tatConfigs, setTatConfigs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [templateVariables, setTemplateVariables] = useState([]);
  const [composeModalOpen, setComposeModalOpen] = useState(false);

  // Use static templates instead of API
  const allTemplates = staticApprovedTemplates;

  // Load TAT configurations from localStorage
  useEffect(() => {
    const savedConfigs = localStorage.getItem(TAT_STORAGE_KEY);
    if (savedConfigs) {
      try {
        setTatConfigs(JSON.parse(savedConfigs));
      } catch (error) {
        console.error("Failed to parse saved TAT configurations", error);
      }
    }
  }, []);

  // Save TAT configurations to localStorage
  useEffect(() => {
    localStorage.setItem(TAT_STORAGE_KEY, JSON.stringify(tatConfigs));
  }, [tatConfigs]);

  const columns = [
    {
      title: "S.No.",
      dataIndex: "id",
      key: "sno",
      width: 70,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 120,
      render: (_, record) =>
        departments.find(d => d.id === record.departmentId)?.name || "N/A",
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      width: 130,
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: status => (
        <Tag
          color={
            status === "Complete"
              ? "green"
              : status === "In Progress"
                ? "blue"
                : status === "Assigned"
                  ? "orange"
                  : status === "Pending"
                    ? "red"
                    : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Events",
      dataIndex: "events",
      key: "events",
      width: 150,
      render: events => (
        <div>
          {events?.map(event => (
            <Tag key={event}>{event}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Template",
      dataIndex: "templateName",
      key: "templateName",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Delay Reminder",
      dataIndex: "delayReminderTime",
      key: "delayReminderTime",
      width: 120,
      render: time => (time ? `${time} mins` : "Disabled"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space size='small'>
          <Button
            type='text'
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title='Edit'
          />
          <Button
            type='text'
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            danger
            title='Delete'
          />
        </Space>
      ),
    },
  ];

  const handleAddNew = () => {
    form.resetFields();
    setEditingId(null);
    setSelectedTemplate(null);
    setTemplateVariables([]);
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEdit = record => {
    const template = allTemplates.find(t => t.id === record.templateId);

    // Set form values including template variables
    const formValues = {
      ...record,
      mobileNumber: record.mobileNumber || "",
      assignedTo: record.assignedTo || "",
      status: record.status || "",
      delayReminderTime: record.delayReminderTime
        ? dayjs().startOf("day").add(record.delayReminderTime, "minute")
        : null,
      events: record.events || [],
    };

    // Add variable values to form
    if (record.variables) {
      record.variables.forEach(variable => {
        formValues[variable.name] = variable.value;
      });
    }

    form.setFieldsValue(formValues);
    setEditingId(record.id);
    setSelectedTemplate(template);
    setTemplateVariables(
      template?.examples ? Object.keys(template.examples) : []
    );
    setIsModalVisible(true);
  };

  const handleDelete = id => {
    Modal.confirm({
      title: "Delete TAT Configuration",
      content: "Are you sure you want to delete this configuration?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        setTatConfigs(tatConfigs.filter(item => item.id !== id));
        message.success("TAT configuration deleted successfully");
      },
    });
  };

  const handleSave = () => {
    form
      .validateFields()
      .then(values => {
        const timeToMinutes = time =>
          time ? dayjs(time).diff(dayjs().startOf("day"), "minute") : null;

        const newConfig = {
          ...values,
          id: editingId || `tat-${Date.now()}`,
          departmentId: values.departmentId,
          templateId: selectedTemplate?.id,
          templateName: selectedTemplate?.name,
          mobileNumber: values.mobileNumber || "",
          assignedTo: values.assignedTo || "",
          status: values.status || "",
          delayReminderTime: timeToMinutes(values.delayReminderTime),
          events: values.events || [],
          variables: templateVariables.map(v => ({
            name: v,
            value: values[v] || "",
          })),
          fileUrl: values.fileUrl || "",
        };

        if (editingId) {
          setTatConfigs(
            tatConfigs.map(item => (item.id === editingId ? newConfig : item))
          );
        } else {
          setTatConfigs([...tatConfigs, newConfig]);
        }

        message.success("TAT configuration saved successfully");
        setIsModalVisible(false);
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  };

  const handleTemplateSelect = template => {
    setSelectedTemplate(template);
    setTemplateVariables(
      template?.examples ? Object.keys(template.examples) : []
    );
    form.setFieldsValue({ fileUrl: "" });
    setFileList([]);
    // Close the compose modal when template is selected
    setComposeModalOpen(false);
  };

  const handleFileChange = info => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);
    setFileList(newFileList);

    // Simulate file upload with static data
    if (info?.file) {
      setTimeout(() => {
        const simulatedFileUrl = "https://example.com/uploaded-file.pdf";
        form.setFieldsValue({ fileUrl: simulatedFileUrl });
        message.success(`${info.file.name} file uploaded successfully.`);
      }, 1000);
    }

    if (newFileList.length === 0) {
      form.setFieldsValue({ fileUrl: "" });
    }
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

  const beforeUpload = file => {
    const headerType = selectedTemplate?.headerType?.toLowerCase() || "";
    let sizeLimit = 100 * 1024 * 1024; // 100MB default
    let acceptedTypes = [];

    switch (headerType) {
      case "image":
        sizeLimit = 5 * 1024 * 1024;
        acceptedTypes = ["image/jpeg", "image/png", "image/jpg"];
        break;
      case "video":
        sizeLimit = 16 * 1024 * 1024;
        acceptedTypes = ["video/mp4", "video/quicktime", "video/mpeg"];
        break;
      case "file":
      case "document":
      case "doc":
        acceptedTypes = [
          "application/msword",
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        break;
      default:
        return false;
    }

    if (!acceptedTypes.includes(file.type)) {
      message.error(
        `Invalid file type! Accepted types are: ${acceptedTypes.join(", ")}`
      );
      return false;
    }

    if (file.size > sizeLimit) {
      const sizeLimitMB =
        headerType === "image" ? "5" : headerType === "video" ? "16" : "100";
      message.error(`File size must be smaller than ${sizeLimitMB}MB!`);
      return false;
    }

    return true;
  };

  const renderTemplateSelection = () => {
    return (
      <Form.Item label='Select Template' required>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {selectedTemplate ? (
            <>
              <Card
                style={{ flex: 1, cursor: "pointer" }}
                onClick={() => setComposeModalOpen(true)}
              >
                <Text strong>{selectedTemplate.name}</Text>
                <div style={{ marginTop: "8px" }}>
                  <Text type='secondary'>{selectedTemplate.type}</Text>
                </div>
              </Card>
              <Button
                type='text'
                icon={<EditOutlined />}
                onClick={() => setComposeModalOpen(true)}
              />
            </>
          ) : (
            <Button
              type='primary'
              icon={<CloudUploadOutlined />}
              onClick={() => setComposeModalOpen(true)}
              style={{ width: "100%", borderRadius: 8 }}
            >
              Select Template
            </Button>
          )}
        </div>
      </Form.Item>
    );
  };

  const renderTemplateModal = () => {
    return (
      <Modal
        title='Select Template'
        open={composeModalOpen}
        onCancel={() => setComposeModalOpen(false)}
        footer={null}
        width={800}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {allTemplates.map(template => (
            <Card
              key={template.id}
              hoverable
              style={{ marginBottom: "8px", cursor: "pointer" }}
              onClick={() => handleTemplateSelect(template)}
            >
              <Text strong>{template.name}</Text>
              <div style={{ marginTop: "8px" }}>
                <Text type='secondary'>{template.type}</Text>
              </div>
            </Card>
          ))}
        </div>
      </Modal>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            TAT Configurations
          </Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={handleAddNew}
            style={{
              backgroundColor: "var(--primary)",
              borderColor: "var(--primary)",
              borderRadius: "8px",
            }}
          >
            Add Configuration
          </Button>
        </div>
        <Text style={{ color: "#666", display: "block", marginTop: "8px" }}>
          Configure turn around time reminders and auto-closure for tickets
          based on departments
        </Text>
      </div>

      <Table
        className="leads-performance-table"
        columns={columns}
        dataSource={tatConfigs}
        rowKey='id'
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1400, y: 400 }}
        size='middle'
      />

      <Modal
        title={
          editingId ? "Edit TAT Configuration" : "Add New TAT Configuration"
        }
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText='Save'
        cancelText='Cancel'
        footer={[
          <Button
            key='cancel'
            style={{ borderRadius: "8px" }}
            onClick={() => setIsModalVisible(false)}
          >
            Cancel
          </Button>,
          <Button
            key='reset'
            onClick={() => {
              form.resetFields();
              setSelectedTemplate(null);
              setTemplateVariables([]);
              setFileList([]);
            }}
            style={{
              backgroundColor: "red",
              color: "white",
              borderRadius: "8px",
            }}
          >
            Reset
          </Button>,
          <Button
            key='submit'
            type='primary'
            onClick={handleSave}
            style={{ borderRadius: "8px" }}
          >
            Save
          </Button>,
        ]}
      >
        <Form form={form} layout='vertical'>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='departmentId'
                label='Department'
                rules={[
                  { required: true, message: "Please select a department" },
                ]}
              >
                <Select placeholder='Select department'>
                  {departments.map(dept => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='mobileNumber'
                label='Mobile Number'
                rules={[
                  { required: true, message: "Please enter mobile number" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit mobile number",
                  },
                ]}
              >
                <Input placeholder='Mobile number' maxLength={10} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='assignedTo'
                label='Assigned To'
                rules={[{ required: true, message: "Please select assignee" }]}
              >
                <Select placeholder='Select assignee'>
                  {assignees.map(assignee => (
                    <Option key={assignee} value={assignee}>
                      {assignee}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='status'
                label='Status'
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder='Select status'>
                  {statusOptions.map(status => (
                    <Option key={status} value={status}>
                      {status}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='events'
                label='Events'
                rules={[
                  {
                    required: true,
                    message: "Please select at least one event",
                  },
                ]}
              >
                <Select
                  mode='multiple'
                  placeholder='Select events'
                  style={{ width: "100%" }}
                >
                  {eventOptions.map(event => (
                    <Option key={event} value={event}>
                      {event}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>{renderTemplateSelection()}</Col>
          </Row>

          {(selectedTemplate?.headerType === "image" ||
            selectedTemplate?.headerType === "video" ||
            selectedTemplate?.headerType === "file") && (
              <Form.Item
                label={`Upload ${selectedTemplate?.headerType}`}
                rules={[
                  {
                    required: true,
                    message: `Please upload ${selectedTemplate?.headerType}`,
                  },
                ]}
              >
                <Upload
                  fileList={fileList}
                  accept={getAcceptString()}
                  maxCount={1}
                  beforeUpload={beforeUpload}
                  onChange={handleFileChange}
                  onRemove={() => {
                    form.setFieldsValue({ fileUrl: "" });
                    setFileList([]);
                  }}
                >
                  <Button icon={<UploadOutlined />} style={{ borderRadius: 8 }}>
                    Upload {selectedTemplate?.headerType}
                  </Button>
                </Upload>
              </Form.Item>
            )}

          {templateVariables.map(variable => (
            <Form.Item
              key={variable}
              name={variable}
              label={variable}
              rules={[{ required: true, message: `Please enter ${variable}` }]}
            >
              <Input placeholder={`Enter ${variable}`} />
            </Form.Item>
          ))}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name='delayReminderTime' label='Delay Reminder Time'>
                <TimePicker
                  format='HH:mm'
                  placeholder='Select time'
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {composeModalOpen && renderTemplateModal()}
    </div>
  );
};

export default TatTab;
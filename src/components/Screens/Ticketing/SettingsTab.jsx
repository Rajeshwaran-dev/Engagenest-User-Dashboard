import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  List,
  Typography,
  Divider,
  Select,
  Switch,
  Row,
  Col,
  message,
  Popconfirm,
  Tag,
  Modal,
  Tabs,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  MinusOutlined,
  ExclamationCircleFilled,
  MoreOutlined,
  CalendarOutlined,
  UserOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import FeatherIcon from "feather-icons-react";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Static initial data
const initialDepartments = ["Sales", "Support", "Technical", "Billing", "General"];
const initialAssignees = ["John Doe", "Jane Smith", "Robert Johnson", "Sarah Wilson", "Mike Brown"];
const initialCustomFields = [
  {
    id: "1",
    label: "Priority",
    type: "select",
    required: true,
    enabled: true,
  },
  {
    id: "2",
    label: "Category",
    type: "select",
    required: false,
    enabled: true,
  },
  {
    id: "3",
    label: "Description",
    type: "textarea",
    required: true,
    enabled: true,
  },
  {
    id: "4",
    label: "Estimated Time",
    type: "number",
    required: false,
    enabled: false,
  },
  {
    id: "5",
    label: "Follow-up Date",
    type: "date",
    required: false,
    enabled: true,
  },
];

const SettingsTab = ({
  departments = initialDepartments,
  setDepartments,
  assignees = initialAssignees,
  setAssignees,
  customFields = initialCustomFields,
  setCustomFields,
}) => {
  const [form] = Form.useForm();
  const [customFieldForm] = Form.useForm();

  // Department management states
  const [newDepartment, setNewDepartment] = useState("");
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editDepartmentValue, setEditDepartmentValue] = useState("");

  // Assignee management states
  const [newAssignee, setNewAssignee] = useState("");
  const [editingAssignee, setEditingAssignee] = useState(null);
  const [editAssigneeValue, setEditAssigneeValue] = useState("");

  // Custom field management states
  const [newCustomField, setNewCustomField] = useState({
    label: "",
    type: "input",
    required: false,
    enabled: true,
  });

  // New state for UI redesign
  const [activeSetting, setActiveSetting] = useState("departments");
  const [isOptionLoading, setIsOptionLoading] = useState(false);
  const [settingsTabItems, setSettingsTabItems] = useState([
    {
      key: "departments",
      label: "Departments",
      icon: <CalendarOutlined style={{ fontSize: "18px" }} />,
      options: departments || [],
      color: "var(--primary)",
    },
    {
      key: "assignees",
      label: "Assignees",
      icon: <UserOutlined style={{ fontSize: "18px" }} />,
      options: assignees || [],
      color: "var(--primary)",
    },
    {
      key: "customFields",
      label: "Custom Fields",
      icon: <FieldTimeOutlined style={{ fontSize: "18px" }} />,
      options: customFields || [],
      color: "var(--primary)",
    },
  ]);

  // Initialize with static data if no props provided
  useEffect(() => {
    if (!setDepartments) {
      // If no setter functions provided, use local state
      // This handles the case when component is used standalone
      setSettingsTabItems(prev =>
        prev.map(item => {
          if (item.key === "departments") {
            return { ...item, options: initialDepartments };
          } else if (item.key === "assignees") {
            return { ...item, options: initialAssignees };
          } else if (item.key === "customFields") {
            return { ...item, options: initialCustomFields };
          }
          return item;
        })
      );
    }
  }, []);

  // Load saved data on component mount
  useEffect(() => {
    const savedCustomFields = localStorage.getItem("customFields");
    if (savedCustomFields && setCustomFields) {
      setCustomFields(JSON.parse(savedCustomFields));
    } else if (savedCustomFields && !setCustomFields) {
      // Update local state if no setter provided
      setSettingsTabItems(prev =>
        prev.map(item => {
          if (item.key === "customFields") {
            return { ...item, options: JSON.parse(savedCustomFields) };
          }
          return item;
        })
      );
    }
  }, [setCustomFields]);

  // Save custom fields to localStorage whenever they change
  useEffect(() => {
    if (customFields && customFields.length >= 0) {
      localStorage.setItem("customFields", JSON.stringify(customFields));
    }
  }, [customFields]);

  // Update settingsTabItems when data changes
  useEffect(() => {
    setSettingsTabItems(prev =>
      prev.map(item => {
        if (item.key === "departments") {
          return { ...item, options: departments || [] };
        } else if (item.key === "assignees") {
          return { ...item, options: assignees || [] };
        } else if (item.key === "customFields") {
          return { ...item, options: customFields || [] };
        }
        return item;
      })
    );
  }, [departments, assignees, customFields]);

  // Department Management Functions
  const handleAddDepartment = () => {
    if (!newDepartment.trim()) {
      message.warning("Department name cannot be empty!");
      return;
    }

    if (departments.includes(newDepartment.trim())) {
      message.warning("This department already exists!");
      return;
    }

    const updatedDepartments = [...departments, newDepartment.trim()];
    if (setDepartments) {
      setDepartments(updatedDepartments);
    }
    setNewDepartment("");
    message.success("Department added successfully!");
  };

  const handleEditDepartment = department => {
    setEditingDepartment(department);
    setEditDepartmentValue(department);
  };

  const handleSaveDepartment = oldDepartment => {
    if (!editDepartmentValue.trim()) {
      message.warning("Department name cannot be empty!");
      return;
    }

    if (
      editDepartmentValue !== oldDepartment &&
      departments.includes(editDepartmentValue)
    ) {
      message.warning("This department already exists!");
      return;
    }

    const updatedDepartments = departments.map(dept =>
      dept === oldDepartment ? editDepartmentValue.trim() : dept
    );
    if (setDepartments) {
      setDepartments(updatedDepartments);
    }
    setEditingDepartment(null);
    setEditDepartmentValue("");
    message.success("Department updated successfully!");
  };

  const handleCancelEditDepartment = () => {
    setEditingDepartment(null);
    setEditDepartmentValue("");
  };

  const handleDeleteDepartment = department => {
    const updatedDepartments = departments.filter(dept => dept !== department);
    if (setDepartments) {
      setDepartments(updatedDepartments);
    }
    message.success("Department deleted successfully!");
  };

  // Assignee Management Functions
  const handleAddAssignee = () => {
    if (!newAssignee.trim()) {
      message.warning("Assignee name cannot be empty!");
      return;
    }

    if (assignees.includes(newAssignee.trim())) {
      message.warning("This assignee already exists!");
      return;
    }

    const updatedAssignees = [...assignees, newAssignee.trim()];
    if (setAssignees) {
      setAssignees(updatedAssignees);
    }
    setNewAssignee("");
    message.success("Assignee added successfully!");
  };

  const handleEditAssignee = assignee => {
    setEditingAssignee(assignee);
    setEditAssigneeValue(assignee);
  };

  const handleSaveAssignee = oldAssignee => {
    if (!editAssigneeValue.trim()) {
      message.warning("Assignee name cannot be empty!");
      return;
    }

    if (
      editAssigneeValue !== oldAssignee &&
      assignees.includes(editAssigneeValue)
    ) {
      message.warning("This assignee already exists!");
      return;
    }

    const updatedAssignees = assignees.map(assignee =>
      assignee === oldAssignee ? editAssigneeValue.trim() : assignee
    );
    if (setAssignees) {
      setAssignees(updatedAssignees);
    }
    setEditingAssignee(null);
    setEditAssigneeValue("");
    message.success("Assignee updated successfully!");
  };

  const handleCancelEditAssignee = () => {
    setEditingAssignee(null);
    setEditAssigneeValue("");
  };

  const handleDeleteAssignee = assignee => {
    const updatedAssignees = assignees.filter(assign => assign !== assignee);
    if (setAssignees) {
      setAssignees(updatedAssignees);
    }
    message.success("Assignee deleted successfully!");
  };

  // Custom Field Management Functions
  const handleAddCustomField = () => {
    if (!newCustomField.label.trim()) {
      message.warning("Field label cannot be empty!");
      return;
    }

    const fieldExists = customFields?.some(
      field => field.label.toLowerCase() === newCustomField.label.toLowerCase()
    );

    if (fieldExists) {
      message.warning("A field with this label already exists!");
      return;
    }

    const fieldToAdd = {
      ...newCustomField,
      id: Date.now().toString(),
      label: newCustomField.label.trim(),
    };

    const updatedFields = [...(customFields || []), fieldToAdd];
    if (setCustomFields) {
      setCustomFields(updatedFields);
    }
    setNewCustomField({
      label: "",
      type: "input",
      required: false,
      enabled: true,
    });
    customFieldForm.resetFields();
    message.success("Custom field added successfully!");
  };

  const handleToggleCustomField = (fieldId, enabled) => {
    const updatedFields = customFields.map(field =>
      field.id === fieldId ? { ...field, enabled } : field
    );
    if (setCustomFields) {
      setCustomFields(updatedFields);
    }
    message.success(`Field ${enabled ? "enabled" : "disabled"} successfully!`);
  };

  const handleDeleteCustomField = fieldId => {
    const updatedFields = customFields.filter(field => field.id !== fieldId);
    if (setCustomFields) {
      setCustomFields(updatedFields);
    }
    message.success("Custom field deleted successfully!");
  };

  const handleUpdateCustomFieldRequired = (fieldId, required) => {
    const updatedFields = customFields.map(field =>
      field.id === fieldId ? { ...field, required } : field
    );
    if (setCustomFields) {
      setCustomFields(updatedFields);
    }
    message.success(`Field requirement updated successfully!`);
  };

  // UI Helper Functions
  const showDeleteConfirm = option => {
    Modal.confirm({
      title: `Are you sure you want to delete "${option}"?`,
      icon: <ExclamationCircleFilled style={{ color: "#e0241eff" }} />,
      content: "This action cannot be undone.",
      okText: "Yes, delete it",
      cancelText: "Cancel",
      okButtonProps: {
        style: { backgroundColor: "#e0241eff", borderColor: "#e0241eff" },
      },
      cancelButtonProps: {
        style: { borderColor: "#d9d9d9" },
      },
      onOk() {
        if (activeSetting === "departments") {
          handleDeleteDepartment(option);
        } else if (activeSetting === "assignees") {
          handleDeleteAssignee(option);
        } else if (activeSetting === "customFields") {
          const field = customFields.find(f => f.label === option);
          if (field) {
            handleDeleteCustomField(field.id);
          }
        }
      },
    });
  };

  const renderDepartmentItem = department => (
    <div
      key={department}
      style={{
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
        transition: "background 0.2s",
        ":hover": {
          backgroundColor: "#fafafa",
        },
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
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: settingsTabItems.find(
              item => item.key === activeSetting
            )?.color,
          }}
        />
        <span
          style={{
            fontSize: "15px",
            fontWeight: "500",
          }}
        >
          {department}
        </span>
      </div>
      <Button
        type='text'
        danger
        icon={<MinusOutlined />}
        onClick={() => showDeleteConfirm(department)}
        style={{
          opacity: 0.7,
          ":hover": {
            opacity: 1,
          },
        }}
      />
    </div>
  );

  const renderAssigneeItem = assignee => (
    <div
      key={assignee}
      style={{
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
        transition: "background 0.2s",
        ":hover": {
          backgroundColor: "#fafafa",
        },
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
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: settingsTabItems.find(
              item => item.key === activeSetting
            )?.color,
          }}
        />
        <span
          style={{
            fontSize: "15px",
            fontWeight: "500",
          }}
        >
          {assignee}
        </span>
      </div>
      <Button
        type='text'
        danger
        icon={<MinusOutlined />}
        onClick={() => showDeleteConfirm(assignee)}
        style={{
          opacity: 0.7,
          ":hover": {
            opacity: 1,
          },
        }}
      />
    </div>
  );

  const renderCustomFieldItem = field => (
    <div
      key={field.id}
      style={{
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
        transition: "background 0.2s",
        ":hover": {
          backgroundColor: "#fafafa",
        },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flex: 1,
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: settingsTabItems.find(
              item => item.key === activeSetting
            )?.color,
          }}
        />
        <span
          style={{
            fontSize: "15px",
            fontWeight: "500",
            marginRight: "12px",
          }}
        >
          {field.label}
        </span>
        <Tag
          color={
            field.type === "input"
              ? "blue"
              : field.type === "textarea"
                ? "green"
                : field.type === "select"
                  ? "orange"
                  : field.type === "number"
                    ? "purple"
                    : "cyan"
          }
        >
          {field.type.toUpperCase()}
        </Tag>
        {field.required && <Tag color='red'>Required</Tag>}
        {!field.enabled && <Tag color='default'>Disabled</Tag>}
      </div>
      <Space>
        <Text type='secondary'>Required:</Text>
        <Switch
          size='small'
          checked={field.required}
          onChange={checked =>
            handleUpdateCustomFieldRequired(field.id, checked)
          }
        />
        <Text type='secondary'>Enabled:</Text>
        <Switch
          size='small'
          checked={field.enabled}
          onChange={checked => handleToggleCustomField(field.id, checked)}
        />
        <Button
          type='text'
          danger
          icon={<MinusOutlined />}
          onClick={() => showDeleteConfirm(field.label)}
          style={{
            opacity: 0.7,
            ":hover": {
              opacity: 1,
            },
          }}
        />
      </Space>
    </div>
  );

  const renderCustomFieldForm = () => (
    <Form
      form={customFieldForm}
      layout='vertical'
      onFinish={handleAddCustomField}
      style={{ marginBottom: "24px" }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label='Field Label'
            name='label'
            rules={[{ required: true, message: "Please enter field label" }]}
          >
            <Input
              value={newCustomField.label}
              onChange={e =>
                setNewCustomField(prev => ({
                  ...prev,
                  label: e.target.value,
                }))
              }
              placeholder='Enter field label'
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label='Field Type'
            name='type'
            rules={[{ required: true, message: "Please select field type" }]}
          >
            <Select
              value={newCustomField.type}
              onChange={value =>
                setNewCustomField(prev => ({ ...prev, type: value }))
              }
              placeholder='Select field type'
            >
              <Option value='input'>Input</Option>
              <Option value='textarea'>Textarea</Option>
              <Option value='select'>Select</Option>
              <Option value='number'>Number</Option>
              <Option value='date'>Date</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Form.Item label='Required'>
            <Switch
              checked={newCustomField.required}
              onChange={checked =>
                setNewCustomField(prev => ({ ...prev, required: checked }))
              }
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item label=' '>
            <Button
              type='primary'
              htmlType='submit'
              icon={<PlusOutlined />}
              block
              style={{
                backgroundColor: settingsTabItems.find(
                  item => item.key === activeSetting
                )?.color,
                borderColor: settingsTabItems.find(
                  item => item.key === activeSetting
                )?.color,
                borderRadius: "8px",
              }}
            >
              Add Field
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return (
    <div style={{ padding: "24px" }}>
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
          <CalendarOutlined style={{ fontSize: "24px", color: "var(--primary)" }} />
          <Title level={4} style={{ margin: 0 }}>
            Settings Configuration
          </Title>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8} md={6} lg={6} xl={6}>
            <div
              style={{
                borderRight: "1px solid #f0f0f0",
                paddingRight: "16px",
                height: "100%",
              }}
            >
              <h3
                style={{
                  marginBottom: "16px",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Management Sections
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  maxHeight: "calc(100vh - 250px)",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                {settingsTabItems.map(item => (
                  <Button
                    key={item.key}
                    type={activeSetting === item.key ? "primary" : "text"}
                    onClick={() => {
                      setActiveSetting(item.key);
                      setNewDepartment("");
                      setNewAssignee("");
                      setNewCustomField({
                        label: "",
                        type: "input",
                        required: false,
                        enabled: true,
                      });
                    }}
                    style={{
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background:
                        activeSetting === item.key
                          ? item.color + "10"
                          : "transparent",
                      borderColor:
                        activeSetting === item.key
                          ? item.color + "30"
                          : "transparent",
                      color:
                        activeSetting === item.key ? item.color : "inherit",
                      fontWeight: "500",
                      borderRadius: "8px",
                      height: "48px",
                    }}
                    icon={React.cloneElement(item.icon, {
                      style: {
                        color: activeSetting === item.key ? item.color : "#666",
                      },
                    })}
                  >
                    {item.label}
                    <span
                      style={{
                        marginLeft: "auto",
                        backgroundColor:
                          activeSetting === item.key
                            ? item.color + "20"
                            : "#f0f0f0",
                        color: activeSetting === item.key ? item.color : "#666",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                    >
                      {item.options.length}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={16} md={18} lg={18} xl={18}>
            {activeSetting && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "24px",
                  }}
                >
                  {React.cloneElement(
                    settingsTabItems.find(item => item.key === activeSetting)
                      ?.icon,
                    {
                      style: {
                        fontSize: "24px",
                        color: settingsTabItems.find(
                          item => item.key === activeSetting
                        )?.color,
                      },
                    }
                  )}
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    {
                      settingsTabItems.find(item => item.key === activeSetting)
                        ?.label
                    }{" "}
                    Management
                  </h3>
                </div>

                {activeSetting === "departments" && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        marginBottom: "24px",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <Input
                        placeholder='Add new department'
                        value={newDepartment}
                        onChange={e => setNewDepartment(e.target.value)}
                        style={{
                          flex: "1 1 300px",
                          maxWidth: "400px",
                        }}
                        onPressEnter={handleAddDepartment}
                      />
                      <Button
                        type='primary'
                        icon={<PlusOutlined />}
                        onClick={handleAddDepartment}
                        style={{
                          backgroundColor: settingsTabItems.find(
                            item => item.key === activeSetting
                          )?.color,
                          borderColor: settingsTabItems.find(
                            item => item.key === activeSetting
                          )?.color,
                          borderRadius: "8px",
                        }}
                      >
                        Add Department
                      </Button>
                    </div>

                    <Card
                      title={`Available Departments (${departments.length})`}
                      style={{
                        borderRadius: "8px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                      }}
                      bodyStyle={{
                        padding: "0",
                      }}
                    >
                      {departments.length > 0 ? (
                        <div
                          style={{
                            maxHeight: "calc(100vh - 350px)",
                            overflowY: "auto",
                          }}
                        >
                          {departments.map(renderDepartmentItem)}
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: "40px 16px",
                            textAlign: "center",
                            color: "rgba(0, 0, 0, 0.25)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "16px",
                          }}
                        >
                          <FeatherIcon icon='inbox' size={48} />
                          <div>
                            <p
                              style={{
                                marginBottom: "4px",
                                fontWeight: "500",
                              }}
                            >
                              No departments added yet
                            </p>
                            <p style={{ margin: 0 }}>
                              Add your first department using the input above
                            </p>
                          </div>
                        </div>
                      )}
                    </Card>
                  </>
                )}

                {activeSetting === "assignees" && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        marginBottom: "24px",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <Input
                        placeholder='Add new assignee'
                        value={newAssignee}
                        onChange={e => setNewAssignee(e.target.value)}
                        style={{
                          flex: "1 1 300px",
                          maxWidth: "400px",
                        }}
                        onPressEnter={handleAddAssignee}
                      />
                      <Button
                        type='primary'
                        icon={<PlusOutlined />}
                        onClick={handleAddAssignee}
                        style={{
                          backgroundColor: settingsTabItems.find(
                            item => item.key === activeSetting
                          )?.color,
                          borderColor: settingsTabItems.find(
                            item => item.key === activeSetting
                          )?.color,
                          borderRadius: "8px",
                        }}
                      >
                        Add Assignee
                      </Button>
                    </div>

                    <Card
                      title={`Available Assignees (${assignees.length})`}
                      style={{
                        borderRadius: "8px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                      }}
                      bodyStyle={{
                        padding: "0",
                      }}
                    >
                      {assignees.length > 0 ? (
                        <div
                          style={{
                            maxHeight: "calc(100vh - 350px)",
                            overflowY: "auto",
                          }}
                        >
                          {assignees.map(renderAssigneeItem)}
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: "40px 16px",
                            textAlign: "center",
                            color: "rgba(0, 0, 0, 0.25)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "16px",
                          }}
                        >
                          <FeatherIcon icon='inbox' size={48} />
                          <div>
                            <p
                              style={{
                                marginBottom: "4px",
                                fontWeight: "500",
                              }}
                            >
                              No assignees added yet
                            </p>
                            <p style={{ margin: 0 }}>
                              Add your first assignee using the input above
                            </p>
                          </div>
                        </div>
                      )}
                    </Card>
                  </>
                )}

                {activeSetting === "customFields" && (
                  <>
                    {renderCustomFieldForm()}

                    <Card
                      title={`Custom Fields (${customFields?.length || 0})`}
                      style={{
                        borderRadius: "8px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                      }}
                      bodyStyle={{
                        padding: "0",
                      }}
                    >
                      {customFields && customFields.length > 0 ? (
                        <div
                          style={{
                            maxHeight: "calc(100vh - 350px)",
                            overflowY: "auto",
                          }}
                        >
                          {customFields.map(renderCustomFieldItem)}
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: "40px 16px",
                            textAlign: "center",
                            color: "rgba(0, 0, 0, 0.25)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "16px",
                          }}
                        >
                          <FeatherIcon icon='inbox' size={48} />
                          <div>
                            <p
                              style={{
                                marginBottom: "4px",
                                fontWeight: "500",
                              }}
                            >
                              No custom fields added yet
                            </p>
                            <p style={{ margin: 0 }}>
                              Add your first custom field using the form above
                            </p>
                          </div>
                        </div>
                      )}
                    </Card>
                  </>
                )}
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SettingsTab;
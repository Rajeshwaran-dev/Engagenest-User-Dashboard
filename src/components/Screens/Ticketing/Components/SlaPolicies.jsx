import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Typography,
  Space,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Tag,
  Divider,
  Tooltip,
  Alert,
  message,
  Spin,
  Dropdown,
  Menu,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  DownOutlined,
  UpOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  MoreOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Static data
const STATIC_SLA_POLICIES = [
  {
    id: 1,
    name: "Standard SLA",
    description: "Standard service level agreement for all departments",
    department: "IT Support",
    active: true,
    createdAt: "2023-10-15",
    updatedAt: "2023-12-01",
    criticalFirstResponseTime: 30,
    criticalFirstResponseTimeUnit: "minutes",
    criticalResolutionTime: 4,
    criticalResolutionTimeUnit: "hours",
    highFirstResponseTime: 1,
    highFirstResponseTimeUnit: "hours",
    highResolutionTime: 8,
    highResolutionTimeUnit: "hours",
    mediumFirstResponseTime: 4,
    mediumFirstResponseTimeUnit: "hours",
    mediumResolutionTime: 24,
    mediumResolutionTimeUnit: "hours",
    lowFirstResponseTime: 8,
    lowFirstResponseTimeUnit: "hours",
    lowResolutionTime: 48,
    lowResolutionTimeUnit: "hours",
  },
  {
    id: 2,
    name: "Premium Support",
    description: "Premium SLA for VIP customers",
    department: "Customer Success",
    active: true,
    createdAt: "2023-11-20",
    updatedAt: "2023-12-10",
    criticalFirstResponseTime: 15,
    criticalFirstResponseTimeUnit: "minutes",
    criticalResolutionTime: 2,
    criticalResolutionTimeUnit: "hours",
    highFirstResponseTime: 30,
    highFirstResponseTimeUnit: "minutes",
    highResolutionTime: 4,
    highResolutionTimeUnit: "hours",
    mediumFirstResponseTime: 2,
    mediumFirstResponseTimeUnit: "hours",
    mediumResolutionTime: 12,
    mediumResolutionTimeUnit: "hours",
    lowFirstResponseTime: 4,
    lowFirstResponseTimeUnit: "hours",
    lowResolutionTime: 24,
    lowResolutionTimeUnit: "hours",
  },
  {
    id: 3,
    name: "Billing Department",
    description: "SLA for billing related tickets",
    department: "Finance",
    active: false,
    createdAt: "2023-09-05",
    updatedAt: "2023-11-15",
    criticalFirstResponseTime: 1,
    criticalFirstResponseTimeUnit: "hours",
    criticalResolutionTime: 24,
    criticalResolutionTimeUnit: "hours",
    highFirstResponseTime: 4,
    highFirstResponseTimeUnit: "hours",
    highResolutionTime: 48,
    highResolutionTimeUnit: "hours",
    mediumFirstResponseTime: 8,
    mediumFirstResponseTimeUnit: "hours",
    mediumResolutionTime: 72,
    mediumResolutionTimeUnit: "hours",
    lowFirstResponseTime: 24,
    lowFirstResponseTimeUnit: "hours",
    lowResolutionTime: 120,
    lowResolutionTimeUnit: "hours",
  },
];

const STATIC_DEPARTMENTS = [
  { id: 1, name: "IT Support" },
  { id: 2, name: "Customer Success" },
  { id: 3, name: "Finance" },
  { id: 4, name: "Sales" },
  { id: 5, name: "Marketing" },
  { id: 6, name: "HR" },
];

const SlaPolicies = ({ onBack }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);
  const [form] = Form.useForm();
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [slaPolicies, setSlaPolicies] = useState(STATIC_SLA_POLICIES);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  const timeUnits = ["minutes", "hours", "days"];

  const getDepartmentOptions = (policy) => {
    const usedDepartments = slaPolicies.map((p) => p.department);

    return STATIC_DEPARTMENTS.map((dept) => ({
      id: dept.id,
      name: dept.name,
      disabled:
        usedDepartments.includes(dept.name) &&
        policy?.department !== dept.name,
    }));
  };

  const showModal = (policy = null) => {
    setEditingPolicy(policy);
    if (policy) {
      form.setFieldsValue({
        ...policy,
        // Critical Priority
        criticalFirstResponseTime: policy.criticalFirstResponseTime,
        criticalFirstResponseTimeUnit: policy.criticalFirstResponseTimeUnit,
        criticalResolutionTime:
          policy.criticalResolutionTime ||
          policy.criticalResponseTime ||
          policy.responseTime,
        criticalResolutionTimeUnit:
          policy.criticalResolutionTimeUnit ||
          policy.criticalResponseTimeUnit ||
          policy.responseTimeUnit,

        // High Priority
        highFirstResponseTime: policy.highFirstResponseTime,
        highFirstResponseTimeUnit: policy.highFirstResponseTimeUnit,
        highResolutionTime:
          policy.highResolutionTime || policy.highResponseTime,
        highResolutionTimeUnit:
          policy.highResolutionTimeUnit || policy.highResponseTimeUnit,

        // Medium Priority
        mediumFirstResponseTime: policy.mediumFirstResponseTime,
        mediumFirstResponseTimeUnit: policy.mediumFirstResponseTimeUnit,
        mediumResolutionTime:
          policy.mediumResolutionTime ||
          policy.mediumResponseTime ||
          policy.resolutionTime,
        mediumResolutionTimeUnit:
          policy.mediumResolutionTimeUnit ||
          policy.mediumResponseTimeUnit ||
          policy.resolutionTimeUnit,

        // Low Priority
        lowFirstResponseTime: policy.lowFirstResponseTime,
        lowFirstResponseTimeUnit: policy.lowFirstResponseTimeUnit,
        lowResolutionTime: policy.lowResolutionTime || policy.lowResponseTime,
        lowResolutionTimeUnit:
          policy.lowResolutionTimeUnit || policy.lowResponseTimeUnit,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Simulate API delay
      setIsLoadingPolicies(true);
      setTimeout(() => {
        if (editingPolicy) {
          // Update existing policy
          setSlaPolicies((prev) =>
            prev.map((policy) =>
              policy.id === editingPolicy.id
                ? { ...policy, ...values, id: editingPolicy.id }
                : policy
            )
          );
          message.success("SLA policy updated successfully");
        } else {
          // Create new policy
          const newPolicy = {
            ...values,
            id: slaPolicies.length + 1,
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
            active: values.active !== undefined ? values.active : true,
          };
          setSlaPolicies((prev) => [...prev, newPolicy]);
          message.success("SLA policy created successfully");
        }

        setIsModalVisible(false);
        form.resetFields();
        setEditingPolicy(null);
        setIsLoadingPolicies(false);
      }, 500);
    } catch (error) {
      console.error("Error saving policy:", error);

      if (error.errorFields && error.errorFields.length > 0) {
        const missingSections = [];

        if (error.errorFields.some((err) => err.name[0].includes("critical"))) {
          missingSections.push("Critical Priority");
        }
        if (error.errorFields.some((err) => err.name[0].includes("high"))) {
          missingSections.push("High Priority");
        }
        if (error.errorFields.some((err) => err.name[0].includes("medium"))) {
          missingSections.push("Medium Priority");
        }
        if (error.errorFields.some((err) => err.name[0].includes("low"))) {
          missingSections.push("Low Priority");
        }

        if (missingSections.length > 0) {
          message.error(
            `Please fill all required fields in: ${missingSections.join(", ")}`
          );
        } else {
          message.error("Please fill all required fields");
        }
      } else {
        message.error("Failed to save policy");
      }
      setIsLoadingPolicies(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingPolicy(null);
  };

  const showDeleteModal = (policy) => {
    setPolicyToDelete(policy);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    // Simulate API delay
    setIsLoadingPolicies(true);
    setTimeout(() => {
      setSlaPolicies((prev) =>
        prev.filter((policy) => policy.id !== policyToDelete.id)
      );
      message.success("SLA policy deleted successfully");
      setDeleteModalVisible(false);
      setPolicyToDelete(null);
      setIsLoadingPolicies(false);
    }, 500);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setPolicyToDelete(null);
  };

  const togglePolicyStatus = async (id, currentStatus) => {
    // Simulate API delay
    setIsLoadingPolicies(true);
    setTimeout(() => {
      setSlaPolicies((prev) =>
        prev.map((policy) =>
          policy.id === id ? { ...policy, active: !currentStatus } : policy
        )
      );
      message.success(
        `SLA policy ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
      setIsLoadingPolicies(false);
    }, 500);
  };

  const getMenuItems = (record) => [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => showModal(record),
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete",
      danger: true,
      onClick: () => showDeleteModal(record),
    },
  ];

  // Helper function to format time display
  const formatTimeDisplay = (time, unit) => {
    if (!time) return "N/A";
    const formattedUnit = time === 1 ? unit.slice(0, -1) : unit; // Remove 's' for singular
    return `${time} ${formattedUnit}`;
  };

  const columns = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <Text strong style={{ fontSize: "14px" }}>
          {index + 1}
        </Text>
      ),
      onCell: () => ({
        style: { paddingLeft: "1px" },
      }),
      onHeaderCell: () => ({
        style: { paddingLeft: "1px" },
      }),
    },
    {
      title: "Policy Name",
      dataIndex: "name",
      key: "name",
      width: 100,
      render: (name) => <Text style={{ fontSize: "14px" }}>{name}</Text>,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 50,
      render: (department) => (
        <Tag color="blue" style={{ fontSize: "12px", padding: "4px 8px" }}>
          {department}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 50,
      render: (description) => (
        <Text style={{ fontSize: "14px" }}>
          {description || "No description"}
        </Text>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      align: "center",
      render: (createdAt) => (
        <Text style={{ fontSize: "14px" }}>
          {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
        </Text>
      ),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 120,
      align: "center",
      render: (updatedAt) => (
        <Text style={{ fontSize: "14px" }}>
          {updatedAt ? new Date(updatedAt).toLocaleDateString() : "N/A"}
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      align: "center",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Popconfirm
            title={`Are you sure you want to ${record.active ? "deactivate" : "activate"
              } this SLA policy?`}
            okText="Yes"
            cancelText="No"
            onConfirm={() => togglePolicyStatus(record.id, record.active)}
          >
            <Switch
              size="small"
              checked={record.active}
              onClick={(checked, e) => e.preventDefault()}
            />
          </Popconfirm>
          <br />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            {record.active ? "Active" : "Inactive"}
          </Text>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{ items: getMenuItems(record) }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: "16px" }} />}
            style={{ padding: "4px 8px" }}
          />
        </Dropdown>
      ),
    },
    {
      title: "",
      key: "expand",
      width: 60,
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          icon={
            expandedRowKeys.includes(record.id) ? (
              <UpOutlined style={{ fontSize: 12 }} />
            ) : (
              <DownOutlined style={{ fontSize: 12 }} />
            )
          }
          onClick={() => {
            setExpandedRowKeys((prev) =>
              prev.includes(record.id)
                ? prev.filter((key) => key !== record.id)
                : [...prev, record.id]
            );
          }}
        />
      ),
    },
  ];

  if (isLoadingPolicies || isLoadingDepartments) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const ResponseTimeInput = ({ name, label, required = true }) => (
    <Form.Item label={label} style={{ marginBottom: 16 }} required={required}>
      <Input.Group compact>
        <Form.Item
          name={`${name}Time`}
          noStyle
          rules={[
            { required, message: `${label} is required` },
            { type: "number", min: 1, message: "Must be at least 1" },
          ]}
        >
          <InputNumber
            min={1}
            style={{ width: "60%" }}
            placeholder={label}
            controls={false}
            parser={(value) => value.replace(/[^\d]/g, "")} // Removes non-numeric input
            formatter={(value) => value.replace(/[^\d]/g, "")} // Shows only digits
            onKeyDown={(e) => {
              // BLOCK anything not a digit or control keys
              if (
                !/[0-9]/.test(e.key) &&
                ![
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                ].includes(e.key)
              ) {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData
                .getData("text")
                .replace(/[^\d]/g, "");
              if (pasted) {
                const fieldName = `${name}Time`;
                form.setFieldValue(fieldName, Number(pasted));
              }
            }}
          />
        </Form.Item>
        <Form.Item
          name={`${name}TimeUnit`}
          noStyle
          rules={[{ required, message: "Time unit is required" }]}
        >
          <Select style={{ width: "40%" }} placeholder="Unit">
            {timeUnits.map((unit) => (
              <Option key={unit} value={unit}>
                {unit}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Input.Group>
    </Form.Item>
  );

  return (
    <div>
      <Button
        type="primary"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ marginBottom: 20, borderRadius: "8px" }}
      >
        Back
      </Button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={3}>SLA Policies</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          style={{ borderRadius: "8px" }}
        >
          Add Policy
        </Button>
      </div>

      <Card>
        <Table
          className="leads-performance-table"
          columns={columns}
          dataSource={slaPolicies.map((policy, index) => ({
            ...policy,
            index: index + 1,
          }))}
          scroll={{ x: "max-content" }}
          rowKey="id"
          loading={isLoadingPolicies}
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <div
                style={{
                  padding: "20px",
                  background: "#fafafa",
                  borderRadius: "8px",
                }}
              >
                <Row gutter={[16, 16]}>
                  {/* Critical Priority */}
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      size="small"
                      title={<Text strong>Critical Priority</Text>}
                      style={{ borderLeft: `4px solid #cf1322` }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div style={{ marginBottom: "12px" }}>
                          <Text type="primary" style={{ fontSize: "12px" }}>
                            First Response
                          </Text>
                          <br />
                          <Text strong style={{ fontSize: "14px" }}>
                            {formatTimeDisplay(
                              record.criticalFirstResponseTime,
                              record.criticalFirstResponseTimeUnit
                            )}
                          </Text>
                        </div>
                        <div>
                          <Text type="primary" style={{ fontSize: "12px" }}>
                            Resolution Time
                          </Text>
                          <br />
                          <Text strong style={{ fontSize: "14px" }}>
                            {formatTimeDisplay(
                              record.criticalResolutionTime ||
                              record.criticalResponseTime ||
                              record.responseTime,
                              record.criticalResolutionTimeUnit ||
                              record.criticalResponseTimeUnit ||
                              record.responseTimeUnit
                            )}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>

                  {/* High Priority */}
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      size="small"
                      title={<Text strong>High Priority</Text>}
                      style={{ borderLeft: `4px solid #fa541c` }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div style={{ marginBottom: "12px" }}>
                          <Text type="primary" style={{ fontSize: "12px" }}>
                            First Response
                          </Text>
                          <br />
                          <Text strong style={{ fontSize: "14px" }}>
                            {formatTimeDisplay(
                              record.highFirstResponseTime,
                              record.highFirstResponseTimeUnit
                            )}
                          </Text>
                        </div>
                        <div>
                          <Text type="primary" style={{ fontSize: "12px" }}>
                            Resolution Time
                          </Text>
                          <br />
                          <Text strong style={{ fontSize: "14px" }}>
                            {formatTimeDisplay(
                              record.highResolutionTime ||
                              record.highResponseTime,
                              record.highResolutionTimeUnit ||
                              record.highResponseTimeUnit
                            )}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>

                  {/* Medium Priority */}
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      size="small"
                      title={<Text strong>Medium Priority</Text>}
                      style={{ borderLeft: `4px solid #fa8c16` }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div style={{ marginBottom: "12px" }}>
                          <Text type="primary" style={{ fontSize: "12px" }}>
                            First Response
                          </Text>
                          <br />
                          <Text strong style={{ fontSize: "14px" }}>
                            {formatTimeDisplay(
                              record.mediumFirstResponseTime,
                              record.mediumFirstResponseTimeUnit
                            )}
                          </Text>
                        </div>
                        <div>
                          <Text type="primary" style={{ fontSize: "12px" }}>
                            Resolution Time
                          </Text>
                          <br />
                          <Text strong style={{ fontSize: "14px" }}>
                            {formatTimeDisplay(
                              record.mediumResolutionTime ||
                              record.mediumResponseTime ||
                              record.resolutionTime,
                              record.mediumResolutionTimeUnit ||
                              record.mediumResponseTimeUnit ||
                              record.resolutionTimeUnit
                            )}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>

                  {/* Low Priority */}
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      size="small"
                      title={<Text strong>Low Priority</Text>}
                      style={{ borderLeft: `4px solid #52c41a` }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div style={{ marginBottom: "12px" }}>
                          <Text type="primary" style={{ fontSize: "12px" }}>
                            First Response
                          </Text>
                          <br />
                          <Text strong style={{ fontSize: "14px" }}>
                            {formatTimeDisplay(
                              record.lowFirstResponseTime,
                              record.lowFirstResponseTimeUnit
                            )}
                          </Text>
                        </div>
                        <div>
                          <Text type="primary" style={{ fontSize: "12px" }}>
                            Resolution Time
                          </Text>
                          <br />
                          <Text strong style={{ fontSize: "14px" }}>
                            {formatTimeDisplay(
                              record.lowResolutionTime ||
                              record.lowResponseTime,
                              record.lowResolutionTimeUnit ||
                              record.lowResponseTimeUnit
                            )}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
            expandIcon: () => null, // Hide default expand icon
            expandedRowKeys,
            onExpand: (expanded, record) => {
              setExpandedRowKeys(
                expanded
                  ? [...expandedRowKeys, record.id]
                  : expandedRowKeys.filter((key) => key !== record.id)
              );
            },
          }}
        />
      </Card>

      {/* Edit/Create Modal */}
      <Modal
        title={editingPolicy ? "Edit SLA Policy" : "Create New SLA Policy"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        confirmLoading={isLoadingPolicies}
        okText={editingPolicy ? "Update" : "Create"}
        bodyStyle={{
          maxHeight: "70vh",
          overflowY: "auto",
          paddingRight: "8px",
        }}
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Policy Name"
            rules={[{ required: true, message: "Please enter a policy name" }]}
          >
            <Input placeholder="Enter policy name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={2}
              placeholder="Enter policy description (optional)"
            />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: "Please select a department" }]}
          >
            <Select
              placeholder="Select department"
              loading={isLoadingDepartments}
              showSearch
              optionFilterProp="children"
            >
              {getDepartmentOptions(editingPolicy).map((dept) => (
                <Option
                  key={dept.id}
                  value={dept.name}
                  disabled={dept.disabled}
                >
                  {dept.name} {dept.disabled ? "(Already has SLA)" : ""}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>Time Configuration</Divider>

          <div style={{ marginBottom: 24 }}>
            <Text
              strong
              style={{ display: "block", marginBottom: 16, fontSize: "16px" }}
            >
              Priority Resolution Times
            </Text>

            {/* Critical Priority */}
            <div
              style={{
                marginBottom: 20,
                padding: "12px",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
              }}
            >
              <Text
                strong
                style={{ display: "block", marginBottom: 12, color: "#cf1322" }}
              >
                Critical Priority
              </Text>
              <ResponseTimeInput
                name="criticalFirstResponse"
                label="First Response Time"
              />
              <ResponseTimeInput
                name="criticalResolution"
                label="Resolution Time"
              />
            </div>

            {/* High Priority */}
            <div
              style={{
                marginBottom: 20,
                padding: "12px",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
              }}
            >
              <Text
                strong
                style={{ display: "block", marginBottom: 12, color: "#fa541c" }}
              >
                High Priority
              </Text>
              <ResponseTimeInput
                name="highFirstResponse"
                label="First Response Time"
              />
              <ResponseTimeInput
                name="highResolution"
                label="Resolution Time"
              />
            </div>

            {/* Medium Priority */}
            <div
              style={{
                marginBottom: 20,
                padding: "12px",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
              }}
            >
              <Text
                strong
                style={{ display: "block", marginBottom: 12, color: "#fa8c16" }}
              >
                Medium Priority
              </Text>
              <ResponseTimeInput
                name="mediumFirstResponse"
                label="First Response Time"
              />
              <ResponseTimeInput
                name="mediumResolution"
                label="Resolution Time"
              />
            </div>

            {/* Low Priority */}
            <div
              style={{
                marginBottom: 20,
                padding: "12px",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
              }}
            >
              <Text
                strong
                style={{ display: "block", marginBottom: 12, color: "#52c41a" }}
              >
                Low Priority
              </Text>
              <ResponseTimeInput
                name="lowFirstResponse"
                label="First Response Time"
              />
              <ResponseTimeInput name="lowResolution" label="Resolution Time" />
            </div>
          </div>

          {!editingPolicy && (
            <Form.Item
              name="active"
              label="Status"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch
                checkedChildren="ON"
                unCheckedChildren="OFF"
                style={{
                  transform: "scale(1)",
                  transformOrigin: "left center",
                  width: "70px",
                }}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete SLA Policy"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete the SLA policy{" "}
          <strong>"{policyToDelete?.name}"</strong>?
        </p>
        <p style={{ color: "#666", fontSize: "14px" }}>
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default SlaPolicies;
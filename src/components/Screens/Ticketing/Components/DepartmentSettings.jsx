import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Typography,
  Tag,
  message,
  Spin,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Static departments data
const STATIC_DEPARTMENTS = [
  {
    id: "1",
    name: "Technical Support",
    agentsCount: 5,
    createdAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "2",
    name: "Sales",
    agentsCount: 8,
    createdAt: "2024-01-02T11:30:00Z",
  },
  {
    id: "3",
    name: "Customer Service",
    agentsCount: 12,
    createdAt: "2024-01-03T09:15:00Z",
  },
  {
    id: "4",
    name: "Billing",
    agentsCount: 4,
    createdAt: "2024-01-04T14:20:00Z",
  },
  {
    id: "5",
    name: "Marketing",
    agentsCount: 0,
    createdAt: "2024-01-05T16:45:00Z",
  },
];

const DepartmentSettings = ({ onBack }) => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Load static data on mount
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDepartments(STATIC_DEPARTMENTS);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Manual refetch function
  const handleRefetch = async () => {
    setIsFetching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDepartments([...STATIC_DEPARTMENTS]);
      message.success("Departments refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh departments:", error);
      message.error("Failed to refresh departments");
    } finally {
      setIsFetching(false);
    }
  };

  const columns = [
    {
      title: "Department Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      width: "20%",
      render: text => (
        <Text strong style={{ fontSize: "14px" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Agents Count",
      dataIndex: "agentsCount",
      key: "agentsCount",
      width: "30%",
      align: "center",
      render: (count, record) => (
        <Tooltip title={`${count} agent(s) assigned to this department`}>
          <Text style={{ color: count > 0 ? "blue" : "#999", margin: 0 }}>
            {count}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "15%",
      render: date => (
        <Text type='secondary'>
          {date
            ? new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            : "N/A"}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px", flexWrap: "nowrap" }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size='small'
          >
            Edit
          </Button>
          <Popconfirm
            title='Delete Department'
            description={
              record.agentsCount > 0
                ? `This department has ${record.agentsCount} agent(s) assigned. Are you sure you want to delete it?`
                : "Are you sure you want to delete this department?"
            }
            icon={<ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />}
            onConfirm={() => handleDelete(record.id)}
            okText='Yes'
            cancelText='No'
            okButtonProps={{ danger: true }}
            disabled={record.agentsCount > 0}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              loading={isDeleting}
              size='small'
              disabled={record.agentsCount > 0}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleAddNew = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = record => {
    form.setFieldsValue({
      name: record.name,
    });
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async id => {
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const updatedDepartments = departments.filter(dept => dept.id !== id);
      setDepartments(updatedDepartments);
      message.success("Department deleted successfully");
    } catch (error) {
      console.error("Failed to delete department:", error);
      message.error("Failed to delete department");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingId) {
        // Update existing department
        setIsUpdating(true);
        await new Promise(resolve => setTimeout(resolve, 600));

        const updatedDepartments = departments.map(dept =>
          dept.id === editingId ? { ...dept, ...values } : dept
        );
        setDepartments(updatedDepartments);
        message.success("Department updated successfully");
        setIsUpdating(false);
      } else {
        // Add new department
        setIsCreating(true);
        await new Promise(resolve => setTimeout(resolve, 600));

        const newDept = {
          id: `dept-${Date.now()}`,
          name: values.name,
          agentsCount: 0,
          createdAt: new Date().toISOString(),
        };

        setDepartments([...departments, newDept]);
        message.success("Department added successfully");
        setIsCreating(false);
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Failed to save department:", error);
      if (error.errorFields) {
        message.error("Please check the form for errors");
      } else {
        message.error("Failed to save department");
      }
    }
  };

  // Calculate total agents across all departments
  const totalAgents = departments.reduce(
    (sum, dept) => sum + (dept.agentsCount || 0),
    0
  );

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div>
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
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Title level={4} style={{ margin: 0 }}>
                Department Management
              </Title>
              {departments.length > 0 && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <Tag color='blue'>{departments.length} departments</Tag>
                  <Tag color='green' icon={<UserOutlined />}>
                    {totalAgents} total agents
                  </Tag>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              {/* Refresh Button */}
              <Tooltip title='Refresh departments'>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefetch}
                  loading={isFetching}
                  style={{ borderRadius: "8px" }}
                >
                  Refresh
                </Button>
              </Tooltip>

              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={handleAddNew}
                loading={isCreating}
                style={{
                  backgroundColor: "var(--primary)",
                  borderColor: "var(--primary)",
                  borderRadius: "8px",
                }}
              >
                Add Department
              </Button>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <Table
              className="leads-performance-table"
              columns={columns}
              dataSource={departments.map(dept => ({
                ...dept,
                key: dept.id,
              }))}
              rowKey='id'
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} departments`,
              }}
              bordered
              loading={isLoading || isDeleting || isFetching}
              locale={{
                emptyText:
                  "No departments yet. Click 'Add Department' to create one.",
              }}
            />
          </div>

          {departments.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <Text type='secondary'>
                <ExclamationCircleOutlined style={{ marginRight: "8px" }} />
                Departments are used to categorize and assign tickets to
                specific teams or groups. Departments with agents assigned
                cannot be deleted.
              </Text>
            </div>
          )}
        </div>

        <Modal
          title={editingId ? "Edit Department" : "Add New Department"}
          open={modalVisible}
          onOk={handleSave}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingId(null);
          }}
          confirmLoading={isCreating || isUpdating}
          destroyOnClose
          width={500}
          okText={editingId ? "Update Department" : "Add Department"}
          cancelText='Cancel'
        >
          <Form form={form} layout='vertical' requiredMark='optional'>
            <Form.Item
              name='name'
              label='Department Name'
              rules={[
                {
                  required: true,
                  message: "Please enter department name",
                },
                {
                  min: 2,
                  message: "Department name must be at least 2 characters",
                },
                {
                  max: 50,
                  message: "Department name must be less than 50 characters",
                },
                {
                  pattern: /^[a-zA-Z0-9\s\-&]+$/,
                  message:
                    "Department name can only contain letters, numbers, spaces, hyphens, and ampersands",
                },
              ]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <Input
                placeholder='Enter department name (e.g., Sales, Support, Technical)'
                showCount
                maxLength={50}
                allowClear
              />
            </Form.Item>

            {editingId && (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "6px",
                  marginBottom: "16px",
                }}
              >
                <Text type='secondary'>
                  Editing department:{" "}
                  {departments.find(dept => dept.id === editingId)?.name}
                  {departments.find(dept => dept.id === editingId)
                    ?.agentsCount > 0 && (
                      <div style={{ marginTop: "4px" }}>
                        <UserOutlined style={{ marginRight: "4px" }} />
                        {
                          departments.find(dept => dept.id === editingId)
                            ?.agentsCount
                        }{" "}
                        agent(s) assigned
                      </div>
                    )}
                </Text>
              </div>
            )}
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default DepartmentSettings;
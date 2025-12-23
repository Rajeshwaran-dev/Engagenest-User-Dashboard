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
  Tooltip,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Static data for quick replies
const STATIC_QUICK_REPLIES = [
  {
    id: "1",
    title: "Welcome Message",
    message: "Hello! Thank you for contacting us. How can I assist you today?",
  },
  {
    id: "2",
    title: "Issue Acknowledgment",
    message: "I understand your concern. Let me look into this for you.",
  },
  {
    id: "3",
    title: "Request for Information",
    message: "Could you please provide more details about the issue?",
  },
  {
    id: "4",
    title: "Resolution Confirmation",
    message: "The issue has been resolved. Please let us know if you need further assistance.",
  },
  {
    id: "5",
    title: "Follow Up",
    message: "Just following up on your ticket. Is everything working properly now?",
  },
];

const QuickReplySettings = ({ onBack }) => {
  const [quickReplies, setQuickReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Load static data on mount
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setQuickReplies(STATIC_QUICK_REPLIES);
      setIsLoading(false);
    }, 500);
  }, []);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: text => (
        <Text
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            maxWidth: "500px",
            display: "block",
          }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Tooltip title='Edit a Quick Reply'>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title='Delete Quick Reply'
            description='Are you sure you want to delete this quick reply?'
            onConfirm={() => handleDelete(record.id)}
            okText='Yes'
            cancelText='No'
            okType='danger'
          >
            <Tooltip title='Delete a Quick Reply'>
              <Button icon={<DeleteOutlined />} danger />
            </Tooltip>
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
      title: record.title,
      message: record.message,
    });
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async id => {
    try {
      // Simulate API call
      setIsLoading(true);
      setTimeout(() => {
        setQuickReplies(prev => prev.filter(reply => reply.id !== id));
        setIsLoading(false);
        message.success("Quick reply deleted successfully");
      }, 300);
    } catch (error) {
      console.error("Failed to delete quick reply:", error);
      message.error("Failed to delete quick reply");
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Simulate API call
      setIsLoading(true);
      setTimeout(() => {
        if (editingId) {
          // Update existing quick reply
          setQuickReplies(prev =>
            prev.map(reply =>
              reply.id === editingId ? { ...reply, ...values } : reply
            )
          );
          message.success("Quick reply updated successfully");
        } else {
          // Add new quick reply
          const newReply = {
            id: Date.now().toString(),
            ...values,
          };
          setQuickReplies(prev => [...prev, newReply]);
          message.success("Quick reply added successfully");
        }

        setModalVisible(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Failed to save quick reply:", error);
      message.error("Failed to save quick reply");
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      // Simulate API call
      setIsLoading(true);
      setTimeout(() => {
        setQuickReplies([]);
        setIsLoading(false);
        message.success("All quick replies reset successfully");
      }, 500);
    } catch (error) {
      console.error("Failed to reset quick replies:", error);
      message.error("Failed to reset quick replies");
      setIsLoading(false);
    }
  };

  const handleSaveAll = () => {
    message.success("Quick replies saved!");
    console.log("Quick replies saved:", quickReplies);
  };

  if (isLoading && quickReplies.length === 0) {
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Button
            type='primary'
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{ paddingLeft: 10, marginBottom: 15, borderRadius: "8px" }}
          >
            Back
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            Quick Reply Configuration
          </Title>
        </div>
      </div>

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
                Quick Reply Configuration
              </Title>
              {quickReplies.length > 0 && (
                <Tag color='blue'>{quickReplies.length} quick replies</Tag>
              )}
            </div>
            <Tooltip title='Create a Quick Reply'>
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
                Add Quick Reply
              </Button>
            </Tooltip>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <Table
              className="leads-performance-table"
              columns={columns}
              dataSource={quickReplies}
              rowKey='id'
              pagination={false}
              bordered
              loading={isLoading}
              locale={{
                emptyText:
                  "No quick replies yet. Click 'Add Quick Reply' to create one.",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-start",
            }}
          >
            <Button
              type='primary'
              onClick={handleSaveAll}
              style={{
                backgroundColor: "var(--primary)",
                borderColor: "var(--primary)",
                borderRadius: "8px",
              }}
            >
              Save All
            </Button>
            <Button
              type='primary'
              onClick={handleReset}
              danger
              loading={isLoading}
              style={{ borderRadius: "8px" }}
            >
              Reset All
            </Button>
          </div>
        </div>

        <Modal
          title={editingId ? "Edit Quick Reply" : "Add New Quick Reply"}
          open={modalVisible}
          onOk={handleSave}
          onCancel={() => setModalVisible(false)}
          confirmLoading={isLoading}
          destroyOnClose
        >
          <Form form={form} layout='vertical'>
            <Form.Item
              name='title'
              label='Title'
              rules={[
                { required: true, message: "Please enter a title" },
                { max: 100, message: "Title must be less than 100 characters" },
              ]}
            >
              <Input placeholder='Enter quick reply title' />
            </Form.Item>
            <Form.Item
              name='message'
              label='Message'
              rules={[
                { required: true, message: "Please enter a message" },
                {
                  max: 1000,
                  message: "Message must be less than 1000 characters",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder='Enter quick reply message'
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default QuickReplySettings;
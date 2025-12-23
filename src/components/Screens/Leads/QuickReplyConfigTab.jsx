import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Typography,
  message,
  Table,
  Form,
  Modal,
  Spin,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

// Static quick replies data
const staticQuickRepliesData = [
  {
    _id: "1",
    title: "Welcome Message",
    message: "Hello! Thank you for contacting us. How can I assist you today?"
  },
  {
    _id: "2",
    title: "Follow-up",
    message: "Just following up on our previous conversation. Is there anything else I can help you with?"
  },
  {
    _id: "3",
    title: "Meeting Request",
    message: "Would you like to schedule a meeting to discuss this further?"
  },
  {
    _id: "4",
    title: "Pricing Inquiry",
    message: "Here are our current pricing plans. Let me know if you have any questions!"
  }
];

const QuickReplyConfigTab = () => {
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);

  // Initialize with static data
  useEffect(() => {
    setIsLoading(true);

    // Simulate loading delay
    setTimeout(() => {
      setQuickReplies(staticQuickRepliesData);
      setIsLoading(false);
    }, 500);
  }, []);

  const columns = [
    {
      title: "S.No.",
      key: "sno",
      width: 80,
      render: (_, record, index) => index + 1,
    },
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
      width: 150,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            style={{ borderRadius: "50px" }}
            icon={<EditOutlined />}
            onClick={() => handleEditQuickReply(record)}
          />

          <Popconfirm
            title='Delete Quick Reply'
            description='Are you sure you want to delete this quick reply?'
            okText='Yes'
            cancelText='No'
            onConfirm={() => handleDeleteQuickReply(record._id)}
            placement='topRight'
          >
            <Button
              style={{ borderRadius: "50px" }}
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleAddNew = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const handleEditQuickReply = record => {
    form.setFieldsValue(record);
    setEditingId(record._id);
    setIsModalVisible(true);
  };

  const handleDeleteQuickReply = async id => {
    try {
      // Simulate API call delay
      setIsLoading(true);

      setTimeout(() => {
        setQuickReplies(prev => prev.filter(reply => reply._id !== id));
        message.success("Quick reply deleted successfully");
        setIsLoading(false);
      }, 500);
    } catch (error) {
      message.error("Failed to delete quick reply");
      setIsLoading(false);
    }
  };

  const handleSaveQuickReply = async () => {
    try {
      const values = await form.validateFields();

      // Simulate API call delay
      setIsLoading(true);

      setTimeout(() => {
        if (editingId) {
          // Update existing quick reply
          setQuickReplies(prev =>
            prev.map(reply =>
              reply._id === editingId
                ? { ...reply, ...values }
                : reply
            )
          );
          message.success("Quick reply updated successfully");
        } else {
          // Add new quick reply
          const newQuickReply = {
            _id: `qr_${Date.now()}`,
            ...values
          };
          setQuickReplies(prev => [...prev, newQuickReply]);
          message.success("Quick reply added successfully");
        }

        setIsModalVisible(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.log("Validate Failed:", error);
      setIsLoading(false);
    }
  };

  if (isLoading && quickReplies.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
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
        <div>
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
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleAddNew}
              style={{
                backgroundColor: "var(--primary)",
                borderColor: "var(--primary)",
                borderRadius: 8,
              }}
            >
              Add Quick Reply
            </Button>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <Table
            className="leads-performance-table"
              columns={columns}
              dataSource={quickReplies}
              rowKey='_id'
              pagination={false}
              bordered
              loading={isLoading}
            />
          </div>
        </div>
      </Card>

      <Modal
        title={
          <h6 style={{ margin: 0, fontWeight: 600 }}>
            {editingId ? "Edit Quick Reply" : "Add New Quick Reply"}
          </h6>
        }
        open={isModalVisible}
        onOk={handleSaveQuickReply}
        onCancel={() => setIsModalVisible(false)}
        okText='Save'
        cancelText='Cancel'
        okButtonProps={{
          style: { backgroundColor: "var(--primary)", borderColor: "var(--primary)" },
        }}
      >
        <Form form={form} layout='vertical'>
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
            <Input.TextArea rows={4} placeholder='Enter quick reply message' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuickReplyConfigTab;
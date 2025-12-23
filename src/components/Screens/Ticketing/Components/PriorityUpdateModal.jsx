import React, { useState } from "react";
import { Modal, Form, Select, Input, message } from "antd";

const { Option } = Select;
const { TextArea } = Input;

// Static helper function
const getPriorityColor = priority => {
  switch (priority) {
    case "Low": return "#52c41a";
    case "medium": return "#1890ff";
    case "High": return "#faad14";
    case "Critical": return "#f5222d";
    default: return "#d9d9d9";
  }
};

const PriorityUpdateModal = ({ visible, ticket, onCancel, onUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const priorities = ["Low", "medium", "High", "Critical"];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      console.log("Updating priority for ticket:", ticket?.ticketId);
      console.log("New priority:", values.priority);
      console.log("Reason:", values.reason);

      // Simulate API call delay
      setTimeout(() => {
        if (onUpdate) {
          onUpdate(ticket, values.priority, values.reason);
        } else {
          console.log("Update function not provided");
          message.success(`Priority updated to ${values.priority}`);
        }
        
        form.resetFields();
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Validation failed:", error);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      title='Update Ticket Priority'
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText='Update Priority'
      cancelText='Cancel'
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          priority: ticket?.priority || "Medium",
          reason: "",
        }}
      >
        <Form.Item label='Current Priority'>
          <div style={{ padding: "8px 0" }}>
            <span
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: getPriorityColor(ticket?.priority),
                color: "white",
                fontWeight: "bold",
              }}
            >
              {ticket?.priority || "Not set"}
            </span>
          </div>
        </Form.Item>

        <Form.Item
          name='priority'
          label='New Priority'
          rules={[{ required: true, message: "Please select a priority" }]}
        >
          <Select placeholder='Select priority'>
            {priorities.map(priority => (
              <Option key={priority} value={priority}>
                <span style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: getPriorityColor(priority),
                      marginRight: "8px",
                    }}
                  />
                  {priority}
                </span>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name='reason' label='Reason for Priority Change (Optional)'>
          <TextArea
            rows={3}
            placeholder='Enter reason for changing priority...'
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PriorityUpdateModal;
import React, { useState } from "react";
import { Modal, Form, Select, Input, Button, message } from "antd";

const { Option } = Select;
const { TextArea } = Input;

const QuickUpdateModal = ({ visible, ticket, onCancel, onUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const getAvailableStatuses = () => {
    if (!ticket) return [];

    if (ticket.status === "Complete") {
      return ["Reopened"];
    }

    if (ticket.status === "Assigned") {
      return [
        "Awaiting Customer Response",
        "In Progress",
        "Pending",
        "Complete",
      ];
    }

    // Exclude 'Created' for tickets that have already been created
    return [
      "Assigned",
      "Awaiting Customer Response",
      "In Progress",
      // "Pending",
      "Complete",
    ];
  };

  const handleSubmit = async values => {
    try {
      setLoading(true);
      
      console.log("Quick update for ticket:", ticket?.ticketId);
      console.log("Update values:", values);

      // Ensure no empty description is submitted
      if (!values.description?.trim()) {
        form.setFields([
          {
            name: "description",
            errors: ["Description is required"],
          },
        ]);
        setLoading(false);
        return;
      }

      // Simulate API call
      setTimeout(() => {
        if (onUpdate) {
          onUpdate(values);
        } else {
          console.log("Update function not provided");
          message.success(`Ticket status updated to ${values.status}`);
        }
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Update error:", error);
      message.error("Failed to update ticket");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  if (!ticket) return null;

  return (
    <Modal
      title={`Update Ticket - ${ticket.ticketId}`}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
        initialValues={{
          status: ticket.status,
          description: "",
        }}
      >
        <Form.Item
          name='status'
          label='Status'
          rules={[{ required: true, message: "Please select a status" }]}
        >
          <Select placeholder='Select status'>
            {getAvailableStatuses().map(status => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name='description'
          label='Description'
          rules={[
            { required: true, message: "Description is mandatory" },
            { whitespace: true, message: "Description cannot be empty" },
            { min: 1, message: "Description cannot be empty" },
          ]}
        >
          <TextArea rows={3} placeholder='Enter update description' />
        </Form.Item>

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
          }}
        >
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type='primary' htmlType='submit' loading={loading}>
            Update
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default QuickUpdateModal;
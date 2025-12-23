import React, { useState } from "react";
import { Modal, Input, message } from "antd";

const { TextArea } = Input;

const STATIC_TICKET = {
  ticketId: "TKT001",
  customerName: "John Doe",
  mobile: "9876543210",
  department_field: "Technical Support",
  priority: "High",
  status: "In Progress",
};

const DragUpdateModal = ({
  visible = false,
  ticket,
  newStatus = "Complete",
  onDescriptionChange,
  onCancel,
  onConfirm,
}) => {
  

  const [description, setDescription] = useState("");
  const [error, setError] = useState(false);

  if (!ticket) return null; // 🧠 Prevent crash if ticket is null

  const handleDescriptionChange = value => {
    setDescription(value);
    if (onDescriptionChange) {
      onDescriptionChange(value);
    }
  };

  const handleOk = () => {
    if (!description.trim()) {
      setError(true);
      message.error("Description is mandatory!");
      return;
    }
    setError(false);
    if (onConfirm) onConfirm();
    message.success("Ticket status updated successfully!");
  };

  return (
    <Modal
      title='Update Ticket Status'
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText='Update Status'
      cancelText='Cancel'
    >
      <p>
        <strong>Ticket:</strong> {ticket?.ticketId}
      </p>
      <p>
        <strong>Customer:</strong> {ticket?.customerName}
      </p>
      <p>
        <strong>Move to:</strong> {newStatus}
      </p>
      <TextArea
        rows={3}
        placeholder='Enter description for status update...'
        value={description}
        onChange={e => {
          handleDescriptionChange(e.target.value);
          if (error && e.target.value.trim()) {
            setError(false);
          }
        }}
        style={{
          marginTop: 16,
          borderColor: error ? "red" : undefined,
        }}
      />
      {error && (
        <p style={{ color: "red", marginTop: 4 }}>
          Description is required.
        </p>
      )}
    </Modal>
  );
};

export default DragUpdateModal;

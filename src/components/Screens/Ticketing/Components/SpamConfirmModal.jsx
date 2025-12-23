import React, { useState } from "react";
import { Modal, Checkbox } from "antd";
import { WarningOutlined } from "@ant-design/icons";

// Static ticket data for demo
const STATIC_TICKET_DEMO = {
  ticketId: "TKT-00123",
  customerName: "John Doe",
  customerEmail: "john@example.com",
};

const SpamConfirmModal = ({ visible, ticket = STATIC_TICKET_DEMO, onConfirm, onCancel }) => {
  const [blockCustomer, setBlockCustomer] = useState(false);

  const handleConfirm = () => {
    console.log("Spam action confirmed:", {
      ticketId: ticket?.ticketId,
      blockCustomer,
      action: "markAsSpam"
    });
    onConfirm(blockCustomer);
  };

  const handleCancel = () => {
    console.log("Spam action cancelled");
    setBlockCustomer(false);
    onCancel();
  };

  return (
    <Modal
      title='Mark as Spam'
      open={visible}
      onOk={handleConfirm}
      onCancel={handleCancel}
      okText={blockCustomer ? "Block and Mark as Spam" : "Mark as Spam"}
      cancelText='Cancel'
      okButtonProps={{ danger: true }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <WarningOutlined
          style={{ color: "#ff4d4f", fontSize: 24, marginRight: 12 }}
        />
        <span>Are you sure you want to mark this ticket as spam?</span>
      </div>

      {ticket && (
        <>
          <p>
            <strong>Ticket ID:</strong> {ticket.ticketId}
          </p>
          <p>
            <strong>Customer:</strong> {ticket.customerName}
          </p>
          {ticket.customerEmail && (
            <p>
              <strong>Email:</strong> {ticket.customerEmail}
            </p>
          )}
        </>
      )}

      <div
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: "#fff2f0",
          border: "1px solid #ffccc7",
          borderRadius: 6,
        }}
      >
        <Checkbox
          checked={blockCustomer}
          onChange={e => setBlockCustomer(e.target.checked)}
        >
          <strong>Also block this customer</strong>
        </Checkbox>
        <p style={{ margin: "8px 0 0 24px", fontSize: 12, color: "#666" }}>
          Blocking will prevent this customer from creating new tickets in the
          future.
        </p>
      </div>
    </Modal>
  );
};

export default SpamConfirmModal;
import React from "react";
import { Button, message } from "antd";

const SpamActions = ({ 
  selectedCount = 0, 
  onUnspam = () => {
    console.log("Unspam selected:", selectedCount, "tickets");
    message.success(`Unspammed ${selectedCount} tickets`);
  } 
}) => {
  return (
    <div
      style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}
    >
      <Button 
        type='primary' 
        onClick={onUnspam} 
        disabled={selectedCount === 0}
      >
        Unspam Selected ({selectedCount})
      </Button>
    </div>
  );
};

// Static data for demo
export const STATIC_SPAM_TICKETS = [
  {
    id: 1,
    ticketId: "TKT-SPAM-001",
    customerName: "spammer@example.com",
    subject: "You won a lottery!",
    isSpam: true,
    receivedDate: "2023-12-01"
  },
  {
    id: 2,
    ticketId: "TKT-SPAM-002",
    customerName: "fake@company.com",
    subject: "Urgent business proposal",
    isSpam: true,
    receivedDate: "2023-12-02"
  },
  {
    id: 3,
    ticketId: "TKT-SPAM-003",
    customerName: "promotion@spam.com",
    subject: "Limited time offer",
    isSpam: true,
    receivedDate: "2023-12-03"
  }
];

export default SpamActions;
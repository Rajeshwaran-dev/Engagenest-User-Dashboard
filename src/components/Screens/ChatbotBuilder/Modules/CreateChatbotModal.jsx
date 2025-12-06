import React, { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const CreateChatbot = ({ showModal, setShowModal, onCreateChatbot }) => {
  const [chatbotName, setChatbotName] = useState("");

  if (!showModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (chatbotName.trim()) {
      onCreateChatbot(chatbotName.trim());
      setChatbotName(""); // Reset input
    }
  };

  const handleClose = () => {
    setChatbotName(""); // Reset input when closing
    setShowModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: "600px" }}>
        {/* Header */}
        <div className="modal-header">
          <div className="d-flex align-items-center">
            <div>
              <Icon className="modal-icon-adjustments" icon="fluent:bot-add-24-regular" />
            </div>
            <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>
              Create Chatbot
            </h3>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <Icon icon="mingcute:close-line" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label
                htmlFor="name"
                className="form-label fw-semibold text-primary-light text-sm mb-8"
              >
                Chatbot Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="Chatbot Name"
                value={chatbotName}
                onChange={(e) => setChatbotName(e.target.value)}
                required
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!chatbotName.trim()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChatbot;

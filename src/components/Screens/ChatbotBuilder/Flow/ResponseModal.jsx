import React, { useState } from "react";
import DateRangePicker from "../../Calendar/DateRangePicker";
import "../ChatbotFlowBuilder.css";

const ResponseModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-overlay">
        <div className="modal-container large">
          <div className="modal-header">
            <h5>Responses</h5>
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="modal-body">
            <div className="response-controls">
              <input
                type="text"
                placeholder="Search responses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="response-actions">
                <div className="d-md-none">
                  <DateRangePicker />
                </div>
                <button className="btn-secondary">Download Responses</button>
              </div>
            </div>
            <div className="response-empty">No responses available.</div>
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" onClick={onClose}>
              OK
            </button>
          </div>
        </div>
      </div>

    </>
  );
};

export default ResponseModal;

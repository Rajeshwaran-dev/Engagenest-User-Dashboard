import React from 'react';
import "../ChatbotFlowBuilder.css";

const WizardModal = ({ isOpen, onClose, onSave, nodeData }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    onSave(data);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Node</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nodeName">Node Name:</label>
            <input
              type="text"
              id="nodeName"
              name="nodeName"
              defaultValue={nodeData?.label || ''}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="nodeMessage">Message:</label>
            <textarea
              id="nodeMessage"
              name="nodeMessage"
              defaultValue={nodeData?.message || ''}
              className="form-control"
              rows="4"
            />
          </div>
          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="flow-button cancel-button">
              Cancel
            </button>
            <button type="submit" className="flow-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WizardModal;
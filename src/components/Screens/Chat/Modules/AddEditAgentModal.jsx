import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const AddEditAgentModal = ({
  showModal,
  handleCancel,
  handleSubmit,
  formData,
  handleInputChange,
  editingAgent,
  isLoading = false,
}) => {

  const handleModalSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
    };

    handleSubmit(submitData);
  };

  if (!showModal) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ width: "600px" }}>
          <div className="modal-header">
            <h3 className="modal-title">
              <Icon
                className="modal-icon-adjustments"
                icon="material-symbols:support-agent"
              />
              {editingAgent ? "Edit Agent" : "Create New Agent"}
            </h3>
            <button
              type="button"
              className="btn-close"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <Icon icon="mingcute:close-line" />
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleModalSubmit}>
              {/* Name Field */}
              <div className="mb-3">
                <label className="form-label required">Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Email Field */}
              <div className="mb-3">
                <label className="form-label required">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="mb-3">
                <label className="form-label required">Password</label>
                <input
                  type={editingAgent ? "text" : "text"} // Always text, but disabled when editing
                  className="form-control"
                  name="password"
                  value={formData.password || ""}
                  onChange={handleInputChange}
                  placeholder={editingAgent ? "" : "Enter password"}
                  required={!editingAgent}
                  disabled={editingAgent || isLoading}
                  readOnly={editingAgent}
                  style={
                    editingAgent
                      ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" }
                      : {}
                  }
                />

                {!editingAgent && (
                  <small className="text-muted">
                    Password must be at least 8 characters
                  </small>
                )}
              </div>

              {/* Mobile Number Field */}
              <div className="mb-3">
                <label className="form-label required">Mobile Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="mobilenumber"
                  value={formData.mobilenumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[0-9+]*$/.test(value)) {
                      handleInputChange(e);
                    }
                  }}
                  placeholder="+91XXXXXXXXXX"
                  required
                  disabled={isLoading}
                />
                {formData.mobilenumber.length > 0 &&
                  (formData.mobilenumber.length < 8 ||
                    formData.mobilenumber.length > 15) && (
                    <small className="text-danger">
                      Mobile number should be between 8 and 15 digits
                    </small>
                  )}
              </div>

              {/* Role Field */}
              <div className="mb-3">
                <label className="form-label required">Role</label>
                <select
                  className="form-select"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="superagent">Super Agent</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleModalSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {editingAgent ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingAgent ? "Update" : "Create"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditAgentModal;
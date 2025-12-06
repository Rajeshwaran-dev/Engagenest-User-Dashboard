import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";

const ApiConfigurationStep = ({
  formData,
  handleInputChange,
  handleApiUrlChange,
  handleHttpMethodChange,
  handleEndpointTypeChange,
  handleAddHeader,
  handleHeaderChange,
  handleDeleteHeader,
  handleTestApi,
  handleResponseMappingChange,
}) => {
  const [newHeader, setNewHeader] = useState({
    key: "",
    value: "",
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingHeader, setEditingHeader] = useState({ key: "", value: "" });
  const [showPreview, setShowPreview] = useState(false);

  // Update new header inputs
  const handleNewHeaderChange = (field, value) => {
    setNewHeader((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add new header logic - use the prop handler if provided, otherwise fallback
  const handleAddNewHeader = () => {
    if (newHeader.key.trim() && newHeader.value.trim()) {
      if (handleAddHeader) {
        handleAddHeader(newHeader.key.trim(), newHeader.value.trim());
      } else {
        // Fallback: use handleInputChange directly
        const updatedHeaders = [
          ...(formData.headers || []),
          { key: newHeader.key.trim(), value: newHeader.value.trim() },
        ];
        handleInputChange("headers", updatedHeaders);
      }
      setNewHeader({ key: "", value: "" });
    }
  };

  // Remove a header - use the prop handler if provided
  const handleRemoveHeader = (index) => {
    if (handleDeleteHeader) {
      handleDeleteHeader(index);
    } else {
      // Fallback: use handleInputChange directly
      const updatedHeaders = formData.headers.filter((_, i) => i !== index);
      handleInputChange("headers", updatedHeaders);
    }
    // If we're removing the header being edited, cancel edit mode
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingHeader({ key: "", value: "" });
    }
  };

  // Start editing a header
  const handleStartEdit = (index) => {
    const header = formData.headers[index];
    setEditingIndex(index);
    setEditingHeader({ key: header.key, value: header.value });
  };

  // Update editing header
  const handleEditingHeaderChange = (field, value) => {
    setEditingHeader((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save edited header - use the prop handler if provided
  const handleSaveEdit = () => {
    if (editingHeader.key.trim() && editingHeader.value.trim()) {
      if (handleHeaderChange) {
        handleHeaderChange(
          editingIndex,
          editingHeader.key.trim(),
          editingHeader.value.trim()
        );
      } else {
        // Fallback: use handleInputChange directly
        const updatedHeaders = [...formData.headers];
        updatedHeaders[editingIndex] = {
          key: editingHeader.key.trim(),
          value: editingHeader.value.trim(),
        };
        handleInputChange("headers", updatedHeaders);
      }
      setEditingIndex(null);
      setEditingHeader({ key: "", value: "" });
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingHeader({ key: "", value: "" });
  };

  // Toggle preview section
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Handle API URL change - use prop handler if provided
  const handleApiUrlChangeInternal = (value) => {
    if (handleApiUrlChange) {
      handleApiUrlChange(value);
    } else {
      handleInputChange("apiUrl", value);
    }
  };

  // Handle HTTP method change - use prop handler if provided
  const handleHttpMethodChangeInternal = (value) => {
    if (handleHttpMethodChange) {
      handleHttpMethodChange(value);
    } else {
      handleInputChange("httpMethod", value);
    }
  };

  // Handle endpoint type change - use prop handler if provided
  const handleEndpointTypeChangeInternal = (value) => {
    if (handleEndpointTypeChange) {
      handleEndpointTypeChange(value);
    } else {
      handleInputChange("endpointType", value);
    }
  };

  // Handle response mapping change - use prop handler if provided
  const handleResponseMappingChangeInternal = (field, value) => {
    if (handleResponseMappingChange) {
      handleResponseMappingChange(field, value);
    } else {
      const updatedMapping = {
        ...formData.responseMapping,
        [field]: value,
      };
      handleInputChange("responseMapping", updatedMapping);
    }
  };

  return (
    <div className="wizard-step-content">
      <div className="form-section mb-4">
        {/* API URL Section */}
        <div className="form-group">
          <div className="type-heading-wrapper">
            <h6 className="type-heading">API Configuration</h6>
          </div>
          <label className="form-label">API URL</label>
          <div className="input-group">
            <select
              style={{ width: "80px" }}
              className="form-select flex-grow-0"
              value={formData.httpMethod || "GET"}
              onChange={(e) => handleHttpMethodChangeInternal(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
            <input
              type="text"
              className="form-control"
              value={formData.apiUrl || ""}
              onChange={(e) => handleApiUrlChangeInternal(e.target.value)}
              placeholder="Enter API URL"
            />
          </div>
        </div>

        {/* Endpoint Type Section */}
        <div className="form-group">
          <div className="type-heading-wrapper">
            <h6 className="type-heading">Endpoint Type</h6>
          </div>
          <label className="form-label">Select Type</label>
          <select
            className="form-select"
            value={formData.endpointType || "static"}
            onChange={(e) => handleEndpointTypeChangeInternal(e.target.value)}
          >
            <option value="Static Endpoint">Static Endpoint</option>
            <option value="Dynamic Endpoint">Dynamic Endpoint</option>
          </select>
          <div className="form-text">
            {formData.endpointType === "static"
              ? "Static Endpoint - Fixed URL"
              : "Dynamic Endpoint - URL with parameters"}
          </div>
        </div>

        {/* Header Parameters */}
        <div className="form-group">
          <div className="type-heading-wrapper">
            <h6 className="type-heading">Header Parameters</h6>
          </div>

          {/* Add Header Input Fields */}
          <div
            className="initial-input-group"
          >
            <div className="input-field" style={{ flex: 1 }}>
              <label className="form-label">Key</label>
              <input
                type="text"
                value={newHeader.key}
                onChange={(e) => handleNewHeaderChange("key", e.target.value)}
                placeholder="Enter key"
                style={{ width: "100%" }}
                className="form-control"
              />
            </div>
            <div className="input-field" style={{ flex: 2 }}>
              <label className="form-label">Value</label>
              <input
                type="text"
                value={newHeader.value}
                onChange={(e) => handleNewHeaderChange("value", e.target.value)}
                placeholder="Enter value"
                style={{ width: "100%" }}
                className="form-control"
              />
            </div>
            <button
              className="btn-primary"
              onClick={handleAddNewHeader}
              type="button"
              disabled={!newHeader.key.trim() || !newHeader.value.trim()}
              style={{
                whiteSpace: "nowrap",
                marginBottom: "6px",
                height: "fit-content",
              }}
            >
              Add Header
            </button>
          </div>

          {/* Headers Table */}
          {formData.headers && formData.headers.length > 0 ? (
            <div className="headers-table">
              <div
                className="table-header"
                style={{
                  display: "flex",
                  padding: "10px",
                  background: "#f8f9fa",
                  borderBottom: "1px solid #dee2e6",
                  borderRadius: "4px 4px 0 0",
                }}
              >
                <div
                  className="table-col key-col"
                  style={{ flex: 1, fontWeight: "bold" }}
                >
                  Key
                </div>
                <div
                  className="table-col value-col"
                  style={{ flex: 2, fontWeight: "bold" }}
                >
                  Value
                </div>
                <div
                  className="table-col action-col"
                  style={{ width: "150px", fontWeight: "bold" }}
                >
                  Action
                </div>
              </div>
              {formData.headers.map((header, index) => (
                <div
                  key={index}
                  className="table-row"
                  style={{
                    display: "flex",
                    padding: "10px",
                    borderBottom: "1px solid #dee2e6",
                    alignItems: "center",
                  }}
                >
                  <div className="table-col key-col" style={{ flex: 1 }}>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editingHeader.key}
                        onChange={(e) =>
                          handleEditingHeaderChange("key", e.target.value)
                        }
                      />
                    ) : (
                      header.key
                    )}
                  </div>
                  <div className="table-col value-col" style={{ flex: 2 }}>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editingHeader.value}
                        onChange={(e) =>
                          handleEditingHeaderChange("value", e.target.value)
                        }
                      />
                    ) : (
                      header.value
                    )}
                  </div>
                  <div
                    className="table-col action-col"
                    style={{
                      width: "150px",
                      display: "flex",
                      gap: "8px",
                      alignItems: "end",
                    }}
                  >
                    {editingIndex === index ? (
                      <>
                        <button
                          type="button"
                          className="save-btn"
                          onClick={handleSaveEdit}
                          disabled={
                            !editingHeader.key.trim() ||
                            !editingHeader.value.trim()
                          }
                          style={{
                            background: "#28a745",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="cancel-btn"
                          onClick={handleCancelEdit}
                          style={{
                            background: "#6c757d",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => handleStartEdit(index)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            padding: "0",
                          }}
                        >
                          <Icon
                            icon="mdi:pencil-outline"
                            style={{ fontSize: "20px", color: "var(--text-secondary)" }}
                          />
                        </button>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => handleRemoveHeader(index)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#dc3545",
                            cursor: "pointer",
                            padding: "0",
                          }}
                        >
                          <Icon
                            icon="mdi:delete-outline"
                            style={{ fontSize: "20px", color: "#dc3545" }}
                          />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No headers added yet.</p>
          )}
        </div>

        {/* Response Configuration */}
        <div className="form-group">
          <div className="type-heading-wrapper">
            <h6 className="type-heading">Response Config</h6>
          </div>

          <div className="mb-3 text-center">
            <button type="button" className="btn-primary" onClick={handleTestApi}>
              Test API and gather response
            </button>
          </div>
          <div className="type-heading-wrapper">
            <h6 className="type-heading">Response Mapping</h6>
          </div>
          <div className="border rounded p-3 bg-light">
            <div className="row align-items-center mb-2">
              <div className="col">
                <span className="">media_url</span>
              </div>
              <div className="col">
                <select
                  className="form-select"
                  value={formData.responseMapping?.media_url || ""}
                  onChange={(e) =>
                    handleResponseMappingChangeInternal(
                      "media_url",
                      e.target.value
                    )
                  }
                >
                  <option value="">No Value Selected</option>
                  <option value="Url">URL Field</option>
                  <option value="Image">Image Field</option>
                  <option value="Attachment">Attachment Field</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="form-group">
          <div className="type-heading-wrapper d-flex justify-content-between align-items-center">
            <button type="button" className="btn-primary" onClick={togglePreview}>
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>
          {showPreview && (
            <div className="mt-3">
              <textarea
                className="form-control"
                rows="6"
                value={formData.previewResponse || ""}
                onChange={(e) =>
                  handleInputChange("previewResponse", e.target.value)
                }
                placeholder="No preview found!"
                style={{ resize: "vertical", height: "150px" }}
              />
            </div>
          )}
        </div>

        {/* Failure Section - Always visible at the bottom */}
        <div className="form-group">
          <div className="type-heading-wrapper">
            <h6 className="type-heading">Failure</h6>
          </div>
          <div className="mt-3">
            <textarea
              className="form-control"
              rows="4"
              value={formData.failureResponse || ""}
              onChange={(e) =>
                handleInputChange("failureResponse", e.target.value)
              }
              style={{ resize: "vertical", height: "150px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiConfigurationStep;

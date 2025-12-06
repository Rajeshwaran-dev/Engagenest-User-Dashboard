// ActionStep.jsx
import React, { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import UseTemplateModal from "../Modules/UseProductModal";

const ActionStep = ({ formData, handleInputChange }) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const MAX_BUTTONS = 3; // Maximum allowed buttons for Interactive type

  const addNewButton = () => {
    // Check if maximum button limit is reached for Interactive type
    if (formData.type === "Interactive" && formData.buttons && formData.buttons.length >= MAX_BUTTONS) {
      alert(`Maximum ${MAX_BUTTONS} buttons allowed for Interactive type`);
      return;
    }

    const newButtons = [...(formData.buttons || [])];
    newButtons.push({ title: "", flow: "" });
    handleInputChange("buttons", newButtons);
  };

  const removeButton = (index) => {
    const newButtons = [...(formData.buttons || [])];
    newButtons.splice(index, 1);
    handleInputChange("buttons", newButtons);
  };

  const handleButtonChange = (index, field, value) => {
    const newButtons = [...(formData.buttons || [])];
    newButtons[index] = {
      ...newButtons[index],
      [field]: value,
    };
    handleInputChange("buttons", newButtons);
  };

  const addNewCategory = () => {
    if (formData.newCatalogName) {
      console.log("Adding catalog:", formData.newCatalogName);
      // Add new button with category name as button title
      const newButtons = [...(formData.buttons || [])];
      newButtons.push({ title: formData.newCatalogName, flow: "" });
      handleInputChange("buttons", newButtons);
      handleInputChange("newCatalogName", "");

      // Open template modal
      setShowTemplateModal(true);
    }
  };

  const handleCloseTemplateModal = () => {
    setShowTemplateModal(false);
  };

  const renderCatalogActions = () => (
    <div className="wizard-step-content">
      <div className="type-heading-wrapper">
        <h6 className="type-heading">Select Catalog</h6>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <select
              className="form-select"
              value={formData.selectedCatalog || ""}
              onChange={(e) =>
                handleInputChange("selectedCatalog", e.target.value)
              }
            >
              <option value="">Choose a catalog</option>
              <option value="Test 2">Test 2</option>
            </select>
          </div>

          {/* Add Catalog Section */}
          <div className="add-catalog-section mt-3">
            <div className="row align-items-center justify-content-center" style={{ marginBottom: "20px" }}>
              <div className="col-md-3">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    value={formData.newCatalogName || ""}
                    onChange={(e) =>
                      handleInputChange("newCatalogName", e.target.value)
                    }
                    placeholder="Enter catalog name"
                  />
                </div>
              </div>
              <div className="col-md-3">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={addNewCategory}
                >
                  <Icon
                    style={{ fontSize: "22px", marginRight: "4px" }}
                    icon="ic:baseline-plus"
                  />
                  Add Category
                </button>
              </div>
            </div>
          </div>

          {/* Category Buttons List - Full width buttons with delete */}
          {formData.buttons && formData.buttons.length > 0 && (
            <div className="category-buttons-list mt-4">
              {formData.buttons.map((button, index) => (
                <div key={index} className="category-button-row mb-3">
                  <div className="d-flex justify-content-center">
                    <div className="col-3">
                      <div
                        className="d-flex align-items-center justify-content-between p-1 border rounded bg-light"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowTemplateModal(true)}
                      >
                        <span className="btn-primary fs-6 fw-medium text-center w-100">
                          {button.title || `Button ${index + 1}`}
                        </span>
                        <button
                          style={{ padding: "6px" }}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent modal from opening when deleting
                            removeButton(index);
                          }}
                          className="btn btn-link ms-3"
                        >
                          <Icon
                            style={{ color: "red", fontSize: "24px" }}
                            icon="material-symbols:delete-outline-rounded"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFlowActions = () => (
    <div className="wizard-step-content">
      <div className="type-heading-wrapper">
        <h6 className="type-heading">Button</h6>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <div className="input-with-counter">
              <input
                type="text"
                className="form-control"
                value={formData.buttonTitle || ""}
                onChange={(e) =>
                  handleInputChange("buttonTitle", e.target.value)
                }
                placeholder="Enter button title"
                maxLength="20"
              />
              <div className="char-counter">
                {formData.buttonTitle ? formData.buttonTitle.length : 0} / 20
              </div>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="form-group">
            <select
              className="form-select"
              value={formData.selectedFlow || ""}
              onChange={(e) =>
                handleInputChange("selectedFlow", e.target.value)
              }
            >
              <option value="">Select flow</option>
              <option value="Flow1">Flow 1</option>
              <option value="Flow2">Flow 2</option>
              <option value="Flow3">Flow 3</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInteractiveActions = () => (
    <div className="wizard-step-content">
      <div className="type-heading-wrapper">
        <h6 className="type-heading">Buttons</h6>
      </div>

      {/* Buttons List */}
      <div className="buttons-list mb-4">
        {formData.buttons?.map((button, index) => (
          <div key={index} className="button-row mb-3">
            <div className="d-flex justify-content-center">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-3">
                  <div className="flex-grow-1">
                    <div className="form-group">
                      <div className="input-with-counter">
                        <input
                          type="text"
                          className="form-control"
                          value={button.title || ""}
                          onChange={(e) =>
                            handleButtonChange(index, "title", e.target.value)
                          }
                          placeholder="Enter button title"
                          maxLength="20"
                        />
                        <div className="char-counter">
                          {button.title ? button.title.length : 0} / 20
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: "-24px" }}>
                    <button type="button" onClick={() => removeButton(index)}>
                      <Icon
                        style={{ color: "red", fontSize: "24px" }}
                        icon="material-symbols:delete-outline-rounded"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button Section */}
      <div className="add-button-section">
        <div className="text-center">
          <button
            type="button"
            className="btn-primary"
            onClick={addNewButton}
            disabled={formData.buttons && formData.buttons.length >= MAX_BUTTONS}
          >
            <Icon
              style={{ fontSize: "22px", marginRight: "4px" }}
              icon="ic:baseline-plus"
            />
            Add Button
            {formData.buttons && formData.buttons.length >= MAX_BUTTONS && (
              <span className="ms-1 text-muted">(Max {MAX_BUTTONS} reached)</span>
            )}
          </button>
        </div>
        {formData.buttons && formData.buttons.length >= MAX_BUTTONS && (
          <div className="text-center mt-2">
            <small className="text-danger">
              Maximum {MAX_BUTTONS} buttons allowed for Interactive type
            </small>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {formData.type === "Catalog" && renderCatalogActions()}
      {formData.type === "Flow" && renderFlowActions()}
      {formData.type === "Interactive" && renderInteractiveActions()}
      {!formData.type && (
        <div className="wizard-step-content">
          <h4 className="step-title">Actions</h4>
          <p>Configure actions for this node.</p>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <UseTemplateModal onClose={handleCloseTemplateModal} />
      )}
    </>
  );
};

export default ActionStep;
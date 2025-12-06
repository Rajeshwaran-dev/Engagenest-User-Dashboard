import React, { useState } from "react";
import UseProductModal from "../Modules/UseProductModal";

const NotifyStep = ({ formData, handleInputChange }) => {
  const [showTemplateGalleryModal, setShowTemplateGalleryModal] =
    useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleUseTemplate = () => {
    setShowTemplateGalleryModal(true);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // You can also update formData with the selected template if needed
    console.log("Selected template:", template);
    // Example: handleInputChange("selectedTemplate", template);
  };

  return (
    <div className="wizard-step-content">
      <div className="section-container">
        <div className="type-heading-wrapper">
          <h6 className="type-heading new-flex">
            Whatsapp Notify
            <div className="form-switch switch-success d-flex align-items-center gap-3">
              <input
                style={{ marginTop: "0px" }}
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="switch1"
                defaultChecked={true}
              />
            </div>
          </h6>
        </div>

        <div className="form-group mb-3">
          <label>Whatsapp number (with country code)</label>
          <input
            type="text"
            value={formData.whatsappNumber || ""}
            onChange={(e) =>
              handleInputChange("whatsappNumber", e.target.value)
            }
            placeholder="Enter WhatsApp number with country code"
          />
        </div>

        {/* Show selected template info */}
        {selectedTemplate && (
          <div className="selected-template-info mb-3 p-2 border rounded">
            <p className="mb-1">
              <strong>Selected Template:</strong> {selectedTemplate.name}
            </p>
            <p className="mb-0 text-muted small">{selectedTemplate.description}</p>
          </div>
        )}

        <div className="text-center">
          <button onClick={handleUseTemplate} className="btn-primary">
            Choose Template
          </button>
        </div>

        <div className="form-group">
          <div className="type-heading-wrapper">
            <h6 className="type-heading new-flex">
              Webhook Notify
              <div className="form-switch switch-success d-flex align-items-center gap-3">
                <input
                  style={{ marginTop: "0px" }}
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="switch1"
                  defaultChecked={true}
                />
              </div>
            </h6>
          </div>

          <label>Webhook url</label>
          <input
            type="text"
            value={formData.webhookUrl || ""}
            onChange={(e) => handleInputChange("webhookUrl", e.target.value)}
            placeholder="Enter webhook URL"
          />
        </div>
      </div>
      {showTemplateGalleryModal && (
        <UseProductModal 
          onClose={() => setShowTemplateGalleryModal(false)}
          onTemplateSelect={handleTemplateSelect}
        />
      )}
    </div>
  );
};

export default NotifyStep;
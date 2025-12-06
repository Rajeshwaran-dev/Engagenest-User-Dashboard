import React, { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const UseProductModal = ({ onClose, onTemplateSelect }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sample template data - only text type templates
  const templates = [
    {
      id: 1,
      name: "Sample_image_education",
      category: "Marketing",
      type: "text",
      description: "Master Python Programming with Our Comprehensive Course",
      preview: "text",
    },
    {
      id: 2,
      name: "Special_discount_offer",
      category: "Marketing",
      type: "text",
      description:
        "We have a special offer for you, {{1}}! Get {{2}}% off on your next purchase.",
      preview: "text",
    },
    {
      id: 3,
      name: "New_arrivals_notification",
      category: "Utility",
      type: "text",
      description:
        "Hey {{1}}, check out our new arrivals! We've just restocked our popular {{2}} collection.",
      preview: "text",
    },
    {
      id: 4,
      name: "Free_gift_promotion",
      category: "Marketing",
      type: "text",
      description:
        "It's your lucky day, {{1}}! We're giving away a free gift with every order over {{2}}.",
      preview: "text",
    },
    {
      id: 5,
      name: "Final_sale_reminder",
      category: "Authentication",
      type: "text",
      description:
        "Final call! Our {{1}} sale ends in 24 hours. Shop now and save big: {{2}}",
      preview: "text",
    },
    {
      id: 6,
      name: "Welcome_onboard",
      category: "Utility",
      type: "text",
      description:
        "Welcome to our platform, {{1}}! Get started with these quick tips.",
      preview: "text",
    },
  ];

  // Filter templates based on search, category and type
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;

    // Only show text type templates
    const matchesType = template.type === "text";

    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = ["all", ...new Set(templates.map((t) => t.category))];

  // Only text type available
  const types = ["text"];

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      console.log("Using template:", selectedTemplate);

      // Call the onTemplateSelect callback if provided
      if (onTemplateSelect) {
        onTemplateSelect(selectedTemplate);
      }

      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content template-gallery-modal"
        style={{ width: "900px", maxHeight: "90vh" }}
      >
        <div className="modal-header template-gallery-header">
          <h3>Select Template</h3>
          <button className="btn-close" onClick={onClose}>
            <Icon icon="mingcute:close-line" />
          </button>
        </div>

        <div className="modal-body template-gallery-body">
          {/* Search and Filter Section */}
          <div className="template-gallery-filters">
            <div className="template-search-container">
              <div className="position-relative" style={{ flex: 1 }}>
                <input
                  type="text"
                  className="form-control form-control-sm ps-5"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Icon
                  icon="eva:search-fill"
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  style={{ fontSize: "18px" }}
                />
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="template-gallery-grid">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate?.id === template.id ? "selected" : ""
                    }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="template-card-header">
                    <div className="template-preview">
                      <Icon
                        icon="mdi:text"
                        style={{ fontSize: "32px", color: "#6c757d" }}
                      />
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="template-selected-badge">
                        <Icon icon="eva:checkmark-circle-2-fill" />
                      </div>
                    )}
                  </div>
                  <div className="template-card-body">
                    <h6 className="template-card-title">{template.name}</h6>
                    <p className="template-card-description">
                      {template.description}
                    </p>
                    <div className="template-card-meta">
                      <span className="template-type-badge">
                        {template.type.toUpperCase()}
                      </span>
                      <span className="template-category-badge">
                        {template.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="template-no-results">
                <Icon icon="eva:search-outline" style={{ fontSize: "48px", color: "#6c757d", marginBottom: "16px" }} />
                <p>No templates found matching your criteria.</p>
                <small className="text-muted">Try adjusting your search or filters</small>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleUseTemplate}
            disabled={!selectedTemplate}
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default UseProductModal;
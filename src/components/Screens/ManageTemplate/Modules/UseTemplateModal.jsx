// UseTemplateModal.jsx - Updated
import React, { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const UseTemplateModal = ({ onClose, onTemplateSelect }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Sample template data - replace with your actual data
  const templates = [
    {
      id: 1,
      name: "Sample_image_education",
      category: "Marketing",
      type: "image",
      description: "Master Python Programming with Our Comprehensive Course",
      preview: "image",
      // Added more fields for ScratchTemplateModal
      templateName: "Sample_image_education",
      templateType: "image",
      body: "Master Python Programming with Our Comprehensive Course",
      templateFooter: "Thank You for Choosing Engagenest",
      language: "en",
      erpCategory: "Sales"
    },
    {
      id: 2,
      name: "Special_discount_offer",
      category: "Marketing",
      type: "text",
      description: "We have a special offer for you, {{customer_name}}! Get {{discount}}% off on your next purchase.",
      preview: "text",
      // Added more fields for ScratchTemplateModal
      templateName: "Special_discount_offer",
      templateType: "text",
      body: "We have a special offer for you, {{customer_name}}! Get {{discount}}% off on your next purchase.",
      templateFooter: "Thank You for Choosing Engagenest",
      language: "en",
      erpCategory: "Sales",
      variables: ["customer_name", "discount"]
    },
    {
      id: 3,
      name: "New_arrivals_notification",
      category: "Utility",
      type: "text",
      description: "Hey {{customer_name}}, check out our new arrivals! We've just restocked our popular {{collection}} collection.",
      preview: "text",
      // Added more fields for ScratchTemplateModal
      templateName: "New_arrivals_notification",
      templateType: "text",
      body: "Hey {{customer_name}}, check out our new arrivals! We've just restocked our popular {{collection}} collection.",
      templateFooter: "",
      language: "en",
      erpCategory: "Inventory",
      variables: ["customer_name", "collection"]
    },
    {
      id: 4,
      name: "Free_gift_promotion",
      category: "Marketing",
      type: "text",
      description: "It's your lucky day, {{customer_name}}! We're giving away a free gift with every order over {{amount}}.",
      preview: "text",
      // Added more fields for ScratchTemplateModal
      templateName: "Free_gift_promotion",
      templateType: "text",
      body: "It's your lucky day, {{customer_name}}! We're giving away a free gift with every order over {{amount}}.",
      templateFooter: "Thank You for Choosing Engagenest",
      language: "en",
      erpCategory: "Sales",
      variables: ["customer_name", "amount"]
    },
    {
      id: 5,
      name: "OTP_Verification",
      category: "Authentication",
      type: "text",
      description: "[{OTP}] is your verification code. For your security, do not share this code.",
      preview: "text",
      // Added more fields for ScratchTemplateModal
      templateName: "OTP_Verification",
      templateType: "text",
      body: "[{OTP}] is your verification code. For your security, do not share this code.",
      templateFooter: "",
      language: "en",
      erpCategory: "",
      variables: ["OTP"]
    },
    {
      id: 6,
      name: "Welcome_onboard",
      category: "Utility",
      type: "text",
      description: "Welcome to our platform, {{user_name}}! Get started with these quick tips.",
      preview: "text",
      // Added more fields for ScratchTemplateModal
      templateName: "Welcome_onboard",
      templateType: "text",
      body: "Welcome to our platform, {{user_name}}! Get started with these quick tips.",
      templateFooter: "",
      language: "en",
      erpCategory: "Hr",
      variables: ["user_name"]
    },
  ];

  // Filter templates based on search, category and type
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;

    // Filter by template type (text/image)
    const matchesType =
      selectedType === "all" || template.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = ["all", ...new Set(templates.map((t) => t.category))];
  const types = ["all", "text", "image"];

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      // Pass the complete template data to ScratchTemplateModal
      onTemplateSelect(selectedTemplate);
      onClose();
    }
  };

  // Function to get appropriate icon for each template type
  const getTemplateIcon = (templateType) => {
    switch (templateType) {
      case 'image':
        return "eva:image-2-fill";
      case 'text':
      default:
        return "eva:text-fill";
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content template-gallery-modal"
        style={{ width: "900px", maxHeight: "90vh" }}
      >
        <div className="modal-header template-gallery-header">
          <div className="d-flex align-items-center">
            <div>
              <Icon className="modal-icon-adjustments" icon="tabler:template" />
            </div>
            <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>Select Template</h3>
          </div>

          <button className="btn-close" onClick={onClose}>
            <Icon icon="mingcute:close-line" />
          </button>
        </div>

        <div className="modal-body template-gallery-body">
          {/* Search and Filter Section */}
          <div className="template-gallery-filters">
            {/* Category Filter */}
            <div className="template-category-filter">
              <div className="category-buttons">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-btn ${selectedCategory === category ? "active" : ""
                      }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

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

            {/* Type Filter - Text/Image Buttons */}
            <div className="template-category-filter">
              <div className="category-buttons">
                {types.map((type) => (
                  <button
                    key={type}
                    className={`category-btn ${selectedType === type ? "active" : ""}`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
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
                  style={{ cursor: "pointer" }}
                >
                  <div className="template-card-header">
                    <div className="template-preview">
                      <Icon
                        icon={getTemplateIcon(template.type)}
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

export default UseTemplateModal;
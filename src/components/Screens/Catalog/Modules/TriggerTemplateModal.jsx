import React, { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const TriggerTemplateModal = ({ onClose, onTemplateSelect, messageType = "single" }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const templates = [
    // Text Templates
    {
      id: 1,
      name: "Ticket_Reminder",
      category: "Utility",
      type: "text",
      description: "Hi {{Name}}. You haven't taken any action on your ticket {{ticketid}} yet. Please take the necessary steps.",
      preview: "text",
      allowedFileTypes: null,
      maxFileSize: null,
      variables: ["Name", "ticketid"]
    },
    {
      id: 2,
      name: "Appointment_Reminder",
      category: "Utility",
      type: "text",
      description: "Hello {{PatientName}}, your appointment with Dr. {{DoctorName}} is scheduled.",
      preview: "text",
      allowedFileTypes: null,
      maxFileSize: null,
      variables: ["PatientName", "DoctorName"]
    },

    // Image Templates
    {
      id: 3,
      name: "Education_Course_Promo",
      category: "Education",
      type: "image",
      description: "Master Python Programming with Our Comprehensive Course. Enroll now and get certified!",
      preview: "image",
      allowedFileTypes: ["png", "jpg", "jpeg", "gif", "webp"],
      maxFileSize: 5,
      variables: ["CourseName", "Discount"]
    },
    {
      id: 4,
      name: "Product_Launch",
      category: "Marketing",
      type: "image",
      description: "Exciting news! Our new product {{ProductName}} is now available. Limited time offer!",
      preview: "image",
      allowedFileTypes: ["png", "jpg", "jpeg", "gif"],
      maxFileSize: 5,
      variables: ["ProductName", "Offer"]
    },

    // Video Templates
    {
      id: 5,
      name: "Product_Demo_Video",
      category: "Marketing",
      type: "video",
      description: "Watch how {{ProductName}} can transform your workflow. See it in action now!",
      preview: "video",
      allowedFileTypes: ["mp4", "avi", "mov", "wmv", "webm"],
      maxFileSize: 25,
      variables: ["ProductName", "Feature"]
    },
    {
      id: 6,
      name: "Tutorial_Guide",
      category: "Education",
      type: "video",
      description: "Learn how to master {{SkillName}} with our step-by-step video tutorial. Perfect for beginners!",
      preview: "video",
      allowedFileTypes: ["mp4", "mov", "avi"],
      maxFileSize: 50,
      variables: ["SkillName", "Duration"]
    },

    // Document Templates
    {
      id: 7,
      name: "Monthly_Report",
      category: "Corporate",
      type: "document",
      description: "Your monthly performance report for {{Month}} is ready. Check your progress and insights.",
      preview: "document",
      allowedFileTypes: ["pdf", "doc", "docx", "txt"],
      maxFileSize: 10,
      variables: ["Month", "Year", "RecipientName"]
    },
    {
      id: 8,
      name: "Ebook_Download",
      category: "Education",
      type: "document",
      description: "Download your free ebook: '{{EbookTitle}}'. Packed with valuable insights and tips.",
      preview: "document",
      allowedFileTypes: ["pdf", "epub", "mobi"],
      maxFileSize: 15,
      variables: ["EbookTitle", "Author"]
    },
    // Carousel Templates - Image Only
    {
      id: 9,
      name: "Product_Carousel_Images",
      category: "Marketing",
      type: "carousel",
      description: "Check out our featured products: {{product1}} and {{product2}}",
      preview: "carousel",
      allowedFileTypes: ["png", "jpg", "jpeg", "webp"],
      maxFileSize: 10,
      variables: ["product1", "product2"],
      carouselMediaType: "image" // New field to specify carousel media type
    },
    // Carousel Templates - Video Only
    {
      id: 10,
      name: "Promotion_Carousel_Videos",
      category: "Marketing",
      type: "carousel",
      description: "Special offers: {{offer1}} and {{offer2}}",
      preview: "carousel",
      allowedFileTypes: ["mp4", "mov", "avi"],
      maxFileSize: 15,
      variables: ["offer1", "offer2"],
      carouselMediaType: "video" // New field to specify carousel media type
    },

    {
      id: 11,
      name: "Transaction_notify_doc",
      category: "Order",
      type: "text",
      description: "Order Details: Name: {{Name}}, Company: {{companyname}}, Amount: {{amount}}, Order ID: {{Order Id}}",
      preview: "text",
      allowedFileTypes: null,
      maxFileSize: null,
      variables: ["Name", "companyname", "amount", "Order Id"]
    },
    {
      id: 12,
      name: "Order_Confirmation",
      category: "Order",
      type: "text",
      description: "Thank you {{Name}}! Your order {{Order Id}} for {{Product}} totaling {{Total Price}} has been confirmed.",
      preview: "text",
      allowedFileTypes: null,
      maxFileSize: null,
      variables: ["Name", "Order Id", "Product", "Total Price"]
    },
    {
      id: 13,
      name: "Payment_Notification",
      category: "Order",
      type: "text",
      description: "Payment of {{amount}} for order {{Order Id}} has been received via {{mode}} on {{date}}.",
      preview: "text",
      allowedFileTypes: null,
      maxFileSize: null,
      variables: ["amount", "Order Id", "mode", "date"]
    }
  ];

  // Filter templates based on search, category and type
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;

    // Filter by template type (text/image/video/document)
    const matchesType =
      selectedType === "all" || template.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = ["all", ...new Set(templates.map((t) => t.category))];
  const types = ["all", "text", "image", "video", "document", "carousel"];

  // FIXED: Event propagation stop pannanum
  const handleSelectTemplate = (template, e) => {
    e.stopPropagation(); // Important: Event propagation stop pannu
    setSelectedTemplate(template);
  };

  // FIXED: Only close modal when "Use Template" button is clicked
  const handleUseTemplate = (e) => {
    e.stopPropagation(); // Important: Event propagation stop pannu
    if (selectedTemplate) {
      onTemplateSelect({
        name: selectedTemplate.name, // Pass template name
        description: selectedTemplate.description,
        type: selectedTemplate.type,
        allowedFileTypes: selectedTemplate.allowedFileTypes,
        maxFileSize: selectedTemplate.maxFileSize,
        variables: selectedTemplate.variables || [],
        carouselMediaType: selectedTemplate.carouselMediaType // Pass carousel media type
      });
      onClose(); // Close modal only after template is selected
    }
  };

  // Modal overlay click handle panna function
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Function to get appropriate icon for each template type
  const getTemplateIcon = (templateType) => {
    switch (templateType) {
      case 'image':
        return "eva:image-2-fill";
      case 'video':
        return "eva:video-fill";
      case 'document':
        return "eva:file-text-fill";
      case 'carousel':
        return "eva:layers-fill";
      case 'text':
      default:
        return "eva:text-fill";
    }
  };

  // Function to get color for template type badge
  const getTypeBadgeColor = (templateType) => {
    switch (templateType) {
      case 'image':
        return 'primary';
      case 'video':
        return 'primary';
      case 'document':
        return 'primary';
      case 'carousel':
        return 'primary';
      case 'text':
      default:
        return 'primary';
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-content template-gallery-modal"
        style={{ width: "900px", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()} // Modal content la click panna close aagathu
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
            <div className="template-search-container">
              <div className="position-relative" style={{ flex: 1 }}>
                <input
                  type="text"
                  className="form-control form-control-sm ps-5"
                  placeholder="Search templates by name, description, category, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Search input click pothu close aagathu
                />
                <Icon
                  icon="eva:search-fill"
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  style={{ fontSize: "18px" }}
                />
              </div>
            </div>

            {/* Type Filter - Text/Image/Video/Document/Carousel Buttons */}
            <div className="template-category-filter">
              <div className="category-buttons">
                {types.map((type) => (
                  <button
                    key={type}
                    className={`category-btn ${selectedType === type ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedType(type);
                    }}
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
                  onClick={(e) => handleSelectTemplate(template, e)} // FIXED: Event pass pannu
                  style={{ cursor: "pointer" }}
                >
                  <div className="template-card-header">
                    <div className="template-preview">
                      <Icon
                        icon={getTemplateIcon(template.type)}
                        style={{
                          fontSize: "32px",
                          color: template.type === 'carousel' ? "" :
                            template.type === 'image' ? "" :
                              template.type === 'video' ? "" :
                                template.type === 'document' ? "" : ""
                        }}
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
                      <span className={`template-type-badge carousel-badge badge bg-${getTypeBadgeColor(template.type)}`}>
                        {template.type.toUpperCase()}
                        {template.carouselMediaType && ` (${template.carouselMediaType})`}
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
          <div className="footer-buttons">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button style={{ marginLeft: "10px" }}
              className="btn-primary"
              onClick={handleUseTemplate}
              disabled={!selectedTemplate}
            >
              Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriggerTemplateModal;
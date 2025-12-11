import React, { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSnackbar } from "notistack";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";

const SendTemplateModal = ({ onClose, onTemplateSend }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [variableValues, setVariableValues] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [carouselFiles, setCarouselFiles] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  // Template data with variables
  const templates = [
    {
      id: 1,
      name: "pending_checkout_notification",
      category: "Marketing",
      type: "text",
      description: "Dear {{CustomerName}}, You have an order pending on XYZ website. Please complete the payment to confirm and process your order. Regards, XYZ",
      preview: "text",
      variables: ["CustomerName"]
    },
    {
      id: 2,
      name: "shoplify",
      category: "Marketing",
      type: "text",
      description: "Dear {{CustomerName}}, Thanks for checking out xyz website and being a part of us. Your cart is still awaited for you. Order will be processed post payment processing. Regards, XYZ company",
      preview: "text",
      variables: ["CustomerName"]
    },
    {
      id: 3,
      name: "shoplify2",
      category: "Marketing",
      type: "text",
      description: "Dear {{CustomerName}}, You have items pending in your cart on XYZ website. Please complete your checkout to process your order. Once payment is received, it'll be confirmed. Regards, XYZ Team",
      preview: "text",
      variables: ["CustomerName"]
    },
    {
      id: 4,
      name: "welcome_message",
      category: "Utlity",
      type: "text",
      description: "Welcome to Askeval, {{name}}! We're excited to have you onboard.",
      preview: "text",
      variables: ["name"]
    },
    {
      id: 5,
      name: "promotional_image",
      category: "Marketing",
      type: "image",
      description: "Check out our latest offers! Limited time only.",
      preview: "image",
      allowedFileTypes: ["png", "jpg", "jpeg", "gif", "webp"],
      maxFileSize: 5,
      variables: ["DiscountCode"]
    },
    {
      id: 6,
      name: "product_video",
      category: "Marketing",
      type: "video",
      description: "Watch our product demo to see how it works!",
      preview: "video",
      allowedFileTypes: ["mp4", "avi", "mov", "wmv", "webm"],
      maxFileSize: 25,
      variables: ["ProductName"]
    },
    // Carousel Templates
    {
      id: 7,
      name: "product_carousel_images",
      category: "Marketing",
      type: "carousel",
      description: "Check out our featured products: {{product1}}, {{product2}}, and {{product3}}",
      preview: "carousel",
      allowedFileTypes: ["png", "jpg", "jpeg", "webp"],
      maxFileSize: 10,
      variables: ["product1", "product2", "product3"],
      carouselMediaType: "image"
    },
    {
      id: 8,
      name: "promotion_carousel_videos",
      category: "Marketing",
      type: "carousel",
      description: "Special offers for you: {{offer1}} and {{offer2}}",
      preview: "carousel",
      allowedFileTypes: ["mp4", "mov", "avi"],
      maxFileSize: 15,
      variables: ["offer1", "offer2"],
      carouselMediaType: "video"
    },
    {
      id: 9,
      name: "mixed_carousel",
      category: "Marketing",
      type: "carousel",
      description: "Explore our collection: {{item1}}, {{item2}}",
      preview: "carousel",
      allowedFileTypes: ["png", "jpg", "jpeg", "webp", "mp4", "mov", "avi"],
      maxFileSize: 12,
      variables: ["item1", "item2"],
      carouselMediaType: "mixed"
    },
    // Add more templates with different categories
    {
      id: 10,
      name: "ticket_reminder",
      category: "Utility",
      type: "text",
      description: "Hi {{Name}}. You haven't taken any action on your ticket {{ticketid}} yet. Please take the necessary steps.",
      preview: "text",
      variables: ["Name", "ticketid"]
    },
    {
      id: 11,
      name: "appointment_reminder",
      category: "Utility",
      type: "text",
      description: "Hello {{PatientName}}, your appointment with Dr. {{DoctorName}} is scheduled.",
      preview: "text",
      variables: ["PatientName", "DoctorName"]
    },
    {
      id: 12,
      name: "auth_code",
      category: "Authentication",
      type: "text",
      description: "Your verification code is {{code}}. It expires in {{minutes}} minutes.",
      preview: "text",
      variables: ["code", "minutes"]
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

    // Filter by template type (text/image/video/carousel)
    const matchesType =
      selectedType === "all" || template.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Define categories and types for filtering
  const categories = ["all", "Marketing", "Utility", "Authentication"];
  const types = ["all", "text", "image", "video", "carousel"];

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setVariableValues({});
    setSelectedFile(null);
    setFilePreview(null);
    setCarouselFiles({});
  };

  const renderSingleFileTooltip = (props) => (
    <Tooltip id="file-info-tooltip-single" {...props}>
      Allowed types: <strong>{(selectedTemplate?.allowedFileTypes || []).join(", ")}</strong>
    </Tooltip>
  );

  const renderCarouselTooltip = (props) => (
    <Tooltip id="file-info-tooltip-carousel" {...props}>
      Allowed types: {(selectedTemplate?.allowedFileTypes || []).join(", ")}
      <br />
      Max size: {selectedTemplate?.maxFileSize || 0}MB per file
      {selectedTemplate?.carouselMediaType && ` • Media type: ${selectedTemplate.carouselMediaType}`}
    </Tooltip>
  );

  const handleFileClick = (file) => {
    if (file && file.type.startsWith("image/")) {
      const fileUrl = URL.createObjectURL(file);
      window.open(fileUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    }
  };

  const getUploadButtonText = () => {
    const templateType = selectedTemplate?.type;
    const maxSize = selectedTemplate?.maxFileSize;

    switch (templateType) {
      case "image":
        return `Choose Image (Max ${maxSize}MB)`;
      case "video":
        return `Choose Video (Max ${maxSize}MB)`;
      case "document":
        return `Choose File (Max ${maxSize}MB)`;
      default:
        return "Upload File";
    }
  };

  const handleVariableChange = (variableName, value) => {
    setVariableValues(prev => ({
      ...prev,
      [variableName]: value
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (selectedTemplate.allowedFileTypes) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!selectedTemplate.allowedFileTypes.includes(fileExtension)) {
        enqueueSnackbar(`Please select a valid file type: ${selectedTemplate.allowedFileTypes.join(', ')}`, {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
        return;
      }
    }

    // Check file size
    if (selectedTemplate.maxFileSize) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > selectedTemplate.maxFileSize) {
        enqueueSnackbar(`File size should be less than ${selectedTemplate.maxFileSize}MB`, {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
        return;
      }
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleCarouselFileSelect = (variableName, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (selectedTemplate.allowedFileTypes) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!selectedTemplate.allowedFileTypes.includes(fileExtension)) {
        enqueueSnackbar(`Please select a valid file type: ${selectedTemplate.allowedFileTypes.join(', ')}`, {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
        return;
      }
    }

    // Check file size
    if (selectedTemplate.maxFileSize) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > selectedTemplate.maxFileSize) {
        enqueueSnackbar(`File size should be less than ${selectedTemplate.maxFileSize}MB`, {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
        return;
      }
    }

    // Validate media type for carousel
    if (selectedTemplate.carouselMediaType === "image" && !file.type.startsWith('image/')) {
      enqueueSnackbar(`Only image files are allowed for this carousel template`, {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      return;
    }

    if (selectedTemplate.carouselMediaType === "video" && !file.type.startsWith('video/')) {
      enqueueSnackbar(`Only video files are allowed for this carousel template`, {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      return;
    }

    setCarouselFiles(prev => ({
      ...prev,
      [variableName]: file
    }));
  };

  const handleRemoveCarouselFile = (variableName) => {
    setCarouselFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[variableName];
      return newFiles;
    });
  };

  const handleSendTemplate = () => {
    if (!selectedTemplate) {
      enqueueSnackbar("Please select a template", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      return;
    }

    // Validate required fields based on template type
    if (selectedTemplate.type === 'text') {
      // For text templates, just need template selection
      if (!selectedTemplate) {
        enqueueSnackbar("Please select a template", {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
        return;
      }
    }
    else if (selectedTemplate.type === 'image' || selectedTemplate.type === 'video') {
      // For image/video templates, need file
      if (!selectedFile) {
        enqueueSnackbar(`Please upload a ${selectedTemplate.type} file`, {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
        return;
      }
    }
    else if (selectedTemplate.type === 'carousel') {
      // For carousel templates, need all variables to have files
      const missingFiles = selectedTemplate.variables.filter(
        variable => !carouselFiles[variable]
      );

      if (missingFiles.length > 0) {
        enqueueSnackbar(`Please upload files for all carousel items: ${missingFiles.join(', ')}`, {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
        return;
      }
    }

    const templateData = {
      template: selectedTemplate,
      variables: variableValues,
      file: selectedTemplate.type !== 'text' ? selectedFile : null,
      carouselFiles: selectedTemplate.type === 'carousel' ? carouselFiles : null,
      processedMessage: processMessageWithVariables()
    };

    if (onTemplateSend && typeof onTemplateSend === 'function') {
      onTemplateSend(templateData);
      enqueueSnackbar("Template sent successfully!", {
        variant: "success",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
    } else {
      console.error('onTemplateSend is not a function');
      enqueueSnackbar("Error sending template", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
    }

    onClose();
  };

  const processMessageWithVariables = () => {
    if (!selectedTemplate) return "";

    let message = selectedTemplate.description;

    // Replace variables with actual values
    Object.keys(variableValues).forEach(variable => {
      const placeholder = `{{${variable}}}`;
      message = message.replace(placeholder, variableValues[variable] || `{{${variable}}}`);
    });

    return message;
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

  const getFileType = (file) => {
    if (!file) return null;
    if (file.type.startsWith('image/')) return "image";
    if (file.type.startsWith('video/')) return "video";
    return "document";
  };

  // Check if send button should be enabled
  const isSendEnabled = () => {
    if (!selectedTemplate) return false;

    switch (selectedTemplate.type) {
      case 'text':
        return true;
      case 'image':
      case 'video':
        return !!selectedFile;
      case 'carousel':
        return selectedTemplate.variables.every(variable => carouselFiles[variable]);
      default:
        return false;
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content template-gallery-modal"
        style={{ width: "1000px", maxHeight: "90vh" }}
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
          {/* Category Filter - Marketing, Utility, Authentication, E-commerce, Onboarding */}
          <div className="template-category-filter" style={{ marginBottom: "20px" }}>
            <div className="category-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="template-gallery-filters">
            <div className="template-search-container">
              <div className="position-relative" style={{ flex: 1 }}>
                <input
                  type="text"
                  className="form-control form-control-sm ps-5"
                  placeholder="Search by template name, description, category, or type..."
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

            {/* Type Filter - Text/Image/Video/Carousel Buttons */}
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

          <div className="template-send-container">
            {/* Templates List */}
            <div className="template-list-section">
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
                            style={{
                              fontSize: "32px",
                              color: template.type === 'carousel' ? "" : ""
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
                          <span className={`template-type-badge carousel-badge ${template.type === 'carousel' ? 'carousel-badge' : ''}`}>
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

            {/* Template Preview and Input Section */}
            {selectedTemplate && (
              <div className="template-preview-section">
                <div className="preview-header">
                  <h5>Template Preview</h5>
                  <span className="template-badge">{selectedTemplate.type}</span>
                </div>

                <div className="preview-content">

                  {/* MODIFIED: File Upload for image/video templates */}
                  {(selectedTemplate.type === 'image' || selectedTemplate.type === 'video') && (
                    <div className="file-upload-section">
                      <Form.Label className="fw-semibold color-change mb-2 d-flex">
                        <span>Attach File</span>
                      </Form.Label>

                      <div className="file-upload-area">
                        <input
                          type="file"
                          id="template-file"
                          accept={selectedTemplate.allowedFileTypes ? selectedTemplate.allowedFileTypes.map(type => `.${type}`).join(',') : '*'}
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                        />

                        <div style={{ marginBottom: "12px" }} className="d-flex align-items-center justify-content-start gap-3">
                          <label
                            htmlFor="template-file"
                            className="file-upload-label d-flex align-items-center gap-2 mb-2"
                            style={{
                              borderRadius: "10px",
                              border: "1px solid #ced4da",
                              backgroundColor: "white",
                              fontWeight: "500",
                              padding: "10px 15px",
                              cursor: "pointer",
                              margin: 0
                            }}
                          >
                            <Icon
                              style={{ fontSize: "20px" }}
                              icon="humbleicons:upload"
                            />
                            {getUploadButtonText()}
                          </label>
                          <OverlayTrigger
                            placement="bottom"
                            trigger="click"
                            overlay={renderSingleFileTooltip}
                            rootClose={true}
                          >
                            <Icon
                              icon="eva:info-outline"
                              style={{
                                fontSize: "20px",
                                color: "#6c757d",
                                cursor: "pointer",
                              }}
                            />
                          </OverlayTrigger>
                        </div>
                      </div>

                      {/* MODIFIED: File Preview to match SingleMsg style */}
                      {selectedFile && (
                        <div className="selected-file-info d-flex align-items-center gap-2 p-1 rounded bg-light mt-2" style={{ maxWidth: "fit-content" }}>
                          <Icon
                            icon={
                              selectedTemplate.type === "image"
                                ? "eva:image-fill"
                                : selectedTemplate.type === "video"
                                  ? "eva:video-fill"
                                  : "eva:file-text-fill"
                            }
                            style={{ color: "#6c757d" }}
                          />
                          <span
                            className=""
                            onClick={() => handleFileClick(selectedFile)}
                            style={{
                              cursor: selectedFile.type.startsWith("image/") ? "pointer" : "default",
                              textDecoration: selectedFile.type.startsWith("image/") ? "underline" : "none",
                              color: selectedFile.type.startsWith("image/") ? "#007bff" : "inherit",
                              fontSize: "12px",
                            }}
                            title={selectedFile.type.startsWith("image/") ? "Click to view image" : ""}
                          >
                            {selectedFile.name}
                          </span>
                          <button
                            className="btn btn-link text-danger p-0"
                            onClick={() => {
                              setSelectedFile(null);
                              setFilePreview(null);
                            }}
                            style={{ border: "none", background: "none" }}
                          >
                            <Icon icon="eva:close-fill" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODIFIED: Carousel Upload Section */}
                  {selectedTemplate.type === 'carousel' && (
                    <div className="carousel-upload-section">
                      <Form.Label className="fw-semibold color-change mb-2 d-flex justify-content-between align-items-center">
                        <span>
                          Carousel Media Upload (
                          {selectedTemplate.carouselMediaType || "image/video"})
                        </span>
                        <OverlayTrigger
                          placement="bottom"
                          trigger="click"
                          overlay={renderCarouselTooltip}
                          rootClose={true}
                        >
                          <Icon
                            icon="eva:info-outline"
                            style={{
                              fontSize: "20px",
                              color: "#6c757d",
                              cursor: "pointer",
                            }}
                          />
                        </OverlayTrigger>
                      </Form.Label>

                      <div className="carousel-variables-grid p-3 rounded">
                        {selectedTemplate.variables.map((variable) => (
                          <div key={variable} className="carousel-variable-upload mb-3">
                            <h6 className="fw-semibold mb-3">{variable}</h6>
                            <input
                              type="file"
                              id={`carousel-${variable}`}
                              accept={selectedTemplate.allowedFileTypes ? selectedTemplate.allowedFileTypes.map(type => `.${type}`).join(',') : '*'}
                              onChange={(e) => handleCarouselFileSelect(variable, e)}
                              style={{ display: 'none' }}
                            />

                            {!carouselFiles[variable] ? (
                              <label
                                htmlFor={`carousel-${variable}`}
                                className="carousel-upload-label d-flex align-items-center gap-2 w-100"
                                style={{
                                  borderRadius: "10px",
                                  border: "1px solid #ced4da",
                                  backgroundColor: "white",
                                  fontWeight: "500",
                                  padding: "10px 15px",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  margin: 0
                                }}
                              >
                                <Icon
                                  style={{ fontSize: "20px" }}
                                  icon="humbleicons:upload"
                                />
                                Upload {variable} ({selectedTemplate.carouselMediaType || "Image/Video"})
                              </label>
                            ) : (
                              <div className="selected-carousel-file d-flex align-items-center gap-2 p-1 rounded bg-light" style={{ maxWidth: "100%" }}>
                                <Icon
                                  icon={getFileType(carouselFiles[variable]) === 'image' ? "eva:image-fill" : "eva:video-fill"}
                                  style={{ color: "#6c757d" }}
                                />
                                <span
                                  className="small"
                                  onClick={() => handleFileClick(carouselFiles[variable])}
                                  style={{
                                    cursor: getFileType(carouselFiles[variable]) === 'image' ? "pointer" : "default",
                                    textDecoration: getFileType(carouselFiles[variable]) === 'image' ? "underline" : "none",
                                    color: getFileType(carouselFiles[variable]) === 'image' ? "#007bff" : "inherit",
                                  }}
                                  title={getFileType(carouselFiles[variable]) === 'image' ? "Click to view image" : ""}
                                >
                                  {carouselFiles[variable].name}
                                </span>
                                <button
                                  className="btn btn-link text-danger p-0"
                                  onClick={() => handleRemoveCarouselFile(variable)}
                                  style={{ border: "none", background: "none" }}
                                >
                                  <Icon icon="eva:close-fill" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Preview */}
                  <div className="message-preview">
                    <h6>Message Preview</h6>
                    <div className="preview-message">
                      {processMessageWithVariables()}
                    </div>
                  </div>
                </div>
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
            <button
              style={{ marginLeft: "10px" }}
              className="btn-primary"
              onClick={handleSendTemplate}
              disabled={!isSendEnabled()}
            >
              Send Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendTemplateModal;
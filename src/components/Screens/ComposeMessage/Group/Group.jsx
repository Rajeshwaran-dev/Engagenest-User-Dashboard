import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Alert,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useSnackbar } from "notistack";
import UseTemplateModal from "../Modules/UseTemplateModal";
import PreviewMessageModal from "../Modules/PreviewMessageModal";
import { Icon } from "@iconify/react/dist/iconify.js";

const Group = ({ formData, handleChange, handleSubmit, handleClear }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [showTemplateGalleryModal, setShowTemplateGalleryModal] =
    useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [templateVariables, setTemplateVariables] = useState([]);
  const [carouselFiles, setCarouselFiles] = useState({});
  const [carouselMediaType, setCarouselMediaType] = useState(null);
  const [variableMapping, setVariableMapping] = useState({});
  const fileInputRef = useRef(null);

  // Extract variables from template when message content changes
  useEffect(() => {
    if (formData.messageContent) {
      extractVariablesFromTemplate(formData.messageContent);
    } else {
      setTemplateVariables([]);
      setVariableMapping({});
    }
  }, [formData.messageContent]);

  // Function to extract variables from template - FIXED
  const extractVariablesFromTemplate = (template) => {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const matches = [...template.matchAll(variableRegex)];

    // FIXED: Properly extract unique variable names
    const variableNames = [...new Set(matches.map((match) => match[1]))];
    const variables = variableNames.map(name => ({ name }));

    setTemplateVariables(variables);

    // Initialize variableMapping for new variables - FIXED
    setVariableMapping(prev => {
      const newMapping = { ...prev };
      variables.forEach(v => {
        if (newMapping[v.name] === undefined) {
          newMapping[v.name] = ""; // Initialize with empty string
        }
      });
      return newMapping;
    });
  };

  const renderSingleFileTooltip = (props) => (
    <Tooltip id="file-info-tooltip-single" {...props}>
      Allowed types: {(formData.allowedFileTypes || []).join(", ")}
      <br />
      Max size: {formData.maxFileSize || 0}MB
    </Tooltip>
  );

  const renderCarouselTooltip = (props) => (
    <Tooltip id="file-info-tooltip-carousel" {...props}>
      Allowed types: {(formData.allowedFileTypes || []).join(", ")}
      <br />
      Max size: {formData.maxFileSize || 0}MB per file
      {carouselMediaType && ` • Media type: ${carouselMediaType}`}
    </Tooltip>
  );

  const handleUseTemplate = () => {
    setShowTemplateGalleryModal(true);
  };

  const isFormValid = () => {
    return (
      formData.groupName && formData.messageContent && formData.campaignName
    );
  };

  const getSampleDataForGroup = () => {
    // Use actual form data instead of hardcoded samples
    const sampleData = {};
    if (variableMapping) {
      Object.keys(variableMapping).forEach((variable) => {
        const column = variableMapping[variable];
        // Use actual form data if available, otherwise use sample
        sampleData[column] = formData[column] || getSampleValue(column);
      });
    }
    return sampleData;
  };

  const getSampleValue = (columnName) => {
    const samples = {
      name: "John Doe",
      email: "john@example.com",
      phone: "+91 9876543210",
      ticketid: "TKT-001",
      department: "Support",
      firstname: "John",
      lastname: "Doe",
      company: "ABC Corp",
    };
    return samples[columnName] || "Sample Value";
  };

  // Handle variable mapping change
  const handleVariableMappingChange = (variableName, csvColumn) => {
    const newMapping = {
      ...variableMapping,
      [variableName]: csvColumn,
    };
    setVariableMapping(newMapping);

    // Also update formData
    handleChange({
      target: {
        name: "variableMapping",
        value: newMapping,
      },
    });
  };

  // Replace variables in message content with sample data for preview - FIXED
  const generatePreviewMessage = () => {
    if (!formData.messageContent) return formData.messageContent;

    let message = formData.messageContent;

    if (templateVariables.length > 0 && variableMapping) {
      // Use actual form data instead of sample data
      templateVariables.forEach((variable) => {
        const csvColumn = variableMapping[variable.name];
        if (csvColumn && formData[csvColumn]) {
          const value = formData[csvColumn];
          const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, "g");
          message = message.replace(regex, value);
        } else if (csvColumn) {
          // If no value found, show the column name as placeholder
          const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, "g");
          message = message.replace(regex, `[${csvColumn}]`);
        }
      });
    }

    return message;
  };

  // Handle template selection - FIXED
  const handleTemplateSelect = (templateData) => {
    handleChange({
      target: {
        name: "messageContent",
        value: templateData.description,
      },
    });

    // Set template type and file restrictions
    handleChange({
      target: {
        name: "templateType",
        value: templateData.type,
      },
    });

    handleChange({
      target: {
        name: "allowedFileTypes",
        value: templateData.allowedFileTypes,
      },
    });

    handleChange({
      target: {
        name: "maxFileSize",
        value: templateData.maxFileSize,
      },
    });

    // Set carousel media type and variables with their specific media types
    setCarouselMediaType(templateData.carouselMediaType || null);

    // Extract variable names and their media types for carousel templates
    if (templateData.type === "carousel" && templateData.variables) {
      const variablesWithMediaTypes = templateData.variables.map(variable => {
        if (typeof variable === 'object') {
          return {
            name: variable.name,
            mediaType: variable.mediaType || templateData.carouselMediaType || 'image'
          };
        }
        return {
          name: variable,
          mediaType: templateData.carouselMediaType || 'image'
        };
      });
      setTemplateVariables(variablesWithMediaTypes);
    } else {
      // For non-carousel templates, extract variables from message content
      extractVariablesFromTemplate(templateData.description);
    }

    // Clear any existing file when template changes
    setSelectedFile(null);
    setCarouselFiles({});
    setFileError("");
  };

  // Carousel file handling functions - FIXED
  const handleCarouselFileSelect = (variableName, event, variableMediaType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Clear any previous errors first
    setFileError("");

    // Get the actual media type from the file
    const actualFileType = getFileType(file);

    // Validate media type for carousel variable
    if (variableMediaType === "image" && actualFileType !== "image") {
      setFileError(`Only image files are allowed for ${variableName}`);
      return;
    }

    if (variableMediaType === "video" && actualFileType !== "video") {
      setFileError(`Only video files are allowed for ${variableName}`);
      return;
    }

    // Validate file size only if maxFileSize is specified
    if (formData.maxFileSize && formData.maxFileSize > 0) {
      const maxSize = formData.maxFileSize * 1024 * 1024;
      if (file.size > maxSize) {
        setFileError(`File size must be less than ${formData.maxFileSize}MB`);
        return;
      }
    }

    // If we get here, the file is valid
    setCarouselFiles((prev) => ({
      ...prev,
      [variableName]: file,
    }));

    // Clear any file errors
    setFileError("");
  };

  const handleRemoveCarouselFile = (variableName) => {
    setCarouselFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[variableName];
      return newFiles;
    });
  };

  const getFileType = (file) => {
    if (!file) return null;

    // Check MIME type first
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("application/") || file.type.startsWith("text/")) return "document";

    // Fallback: check file extension
    const extension = file.name.split('.').pop().toLowerCase();
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];

    if (imageExtensions.includes(extension)) return "image";
    if (videoExtensions.includes(extension)) return "video";

    return "document";
  };

  const getAcceptedFileTypesForMedia = (mediaType) => {
    const baseTypes = formData.allowedFileTypes || [];
    const mediaSpecificTypes = baseTypes.map(type => `.${type}`).join(",");

    if (mediaType === 'image') {
      return mediaSpecificTypes.includes('.mp4') ? '.png,.jpg,.jpeg,.webp' : mediaSpecificTypes;
    } else if (mediaType === 'video') {
      return mediaSpecificTypes.includes('.png') ? '.mp4,.mov,.avi,.webm' : mediaSpecificTypes;
    }

    return mediaSpecificTypes;
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const allowedTypes = formData.allowedFileTypes || [];

    if (allowedTypes.length > 0 && !allowedTypes.includes(fileExtension)) {
      setFileError(`Only ${allowedTypes.join(", ")} files are allowed`);
      setSelectedFile(null);
      return;
    }

    // Validate file size
    const maxSize = (formData.maxFileSize || 0) * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      setFileError(`File size must be less than ${formData.maxFileSize}MB`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setFileError("");

    // Update form data with file
    handleChange({
      target: {
        name: "attachedFile",
        value: file,
      },
    });
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError("");
    handleChange({
      target: {
        name: "attachedFile",
        value: null,
      },
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ✅ Handle file click to open in new tab
  const handleFileClick = (file) => {
    if (file && file.type.startsWith("image/")) {
      const fileUrl = URL.createObjectURL(file);
      window.open(fileUrl, "_blank");
      // Clean up the object URL after some time
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    }
  };

  // Get upload button text based on template type
  const getUploadButtonText = () => {
    const templateType = formData.templateType;
    const maxSize = formData.maxFileSize;

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

  // Get accepted file types for input
  const getAcceptedFileTypes = () => {
    const allowedTypes = formData.allowedFileTypes || [];
    return allowedTypes.map((type) => `.${type}`).join(",");
  };

  const handleMainButtonClick = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.groupName || !formData.messageContent || !formData.campaignName) {
      enqueueSnackbar("Fill in all the required details before sending.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    // Variable mapping validation for non-carousel templates
    if (templateVariables.length > 0 && formData.templateType !== "carousel") {
      const unmappedVariables = templateVariables.filter(
        (variable) => !variableMapping[variable.name] || variableMapping[variable.name].trim() === ""
      );

      if (unmappedVariables.length > 0) {
        enqueueSnackbar(
          `Map all message variables to CSV Columns. Missing: ${unmappedVariables
            .map((v) => v.name)
            .join(", ")}`,
          {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          }
        );
        return;
      }
    }

    // Carousel file validation
    if (formData.templateType === "carousel" && templateVariables.length > 0) {
      const missingCarouselFiles = templateVariables.filter(
        (variable) => !carouselFiles[variable.name]
      );

      if (missingCarouselFiles.length > 0) {
        enqueueSnackbar(
          `Upload all the media files required for the carousel template. Missing: ${missingCarouselFiles
            .map((v) => v.name)
            .join(", ")}`,
          {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          }
        );
        return;
      }

      // Additional validation: Check if uploaded files match the required media types
      const invalidMediaFiles = templateVariables.filter((variable) => {
        const file = carouselFiles[variable.name];
        if (!file) return false;

        const fileType = getFileType(file);
        return variable.mediaType && fileType !== variable.mediaType;
      });

      if (invalidMediaFiles.length > 0) {
        enqueueSnackbar(
          `Some files don't match the required media type: ${invalidMediaFiles
            .map((v) => `${v.name} (expected ${v.mediaType})`)
            .join(", ")}`,
          {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          }
        );
        return;
      }
    }

    // Single file upload validation
    const showUploadSection = formData.allowedFileTypes &&
      formData.allowedFileTypes.length > 0 &&
      formData.templateType !== "carousel";

    if (showUploadSection && !selectedFile) {
      const type = formData.templateType || "file";
      enqueueSnackbar(`Upload the required ${type} file.`, {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    // Prepare preview data
    const previewData = {
      phoneNumber: "Sample Number",
      messageContent: generatePreviewMessage(),
      campaignName: formData.campaignName,
      messageType: formData.messageType,
      scheduledDateTime: formData.scheduledDateTime,
      timezone: formData.timezone,
      attachedFile: selectedFile,
      carouselFiles: formData.templateType === "carousel" ? carouselFiles : null,
      templateType: formData.templateType,
      templateVariables: templateVariables,
      variableMapping: variableMapping,
      csvData: [getSampleDataForGroup()],
      originalMessage: formData.messageContent,
    };

    setPreviewData(previewData);
    setShowPreviewModal(true);
  };

  // Add this function to handle actual sending from preview modal
  const handleSendFromPreview = () => {
    // Create a mock event object to prevent the error
    const mockEvent = {
      preventDefault: () => { },
    };
    handleSubmit(mockEvent);
  };

  // Add this function to handle scheduling from preview modal
  const handleScheduleFromPreview = () => {
    // Create a mock event object to prevent the error
    const mockEvent = {
      preventDefault: () => { },
    };
    handleSubmit(mockEvent);
  };

  // Handle preview modal close
  const handlePreviewModalClose = () => {
    setShowPreviewModal(false);
  };

  // Show upload section only for templates that support files AND are NOT carousel
  const showUploadSection =
    formData.allowedFileTypes &&
    formData.allowedFileTypes.length > 0 &&
    formData.templateType !== "carousel";

  return (
    <div className="col-xxl-9 col-xl-9">
      <Form onSubmit={handleMainButtonClick}>
        <Row className="g-3">
          {/* Group Selection */}
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold color-change mb-2">
                Select from Contact Groups
              </Form.Label>
              <Form.Select
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                className="form-select"
                style={{ borderColor: "#e0e0e0", borderRadius: "10px" }}
              >
                <option value="">Please Select</option>
                <option value="Group1">Group 1</option>
                <option value="Group2">Group 2</option>
                <option value="Group3">Group 3</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Message Content */}
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold color-change mb-2">
                Message Content
              </Form.Label>
              <Form.Control
                readOnly
                onClick={handleUseTemplate}
                as="textarea"
                rows={4}
                name="messageContent"
                value={formData.messageContent}
                onChange={handleChange}
                placeholder="Select a Template"
                className="border-2"
                style={{
                  borderColor: "#e0e0e0",
                  borderRadius: "10px",
                  resize: "vertical",
                  height: "200px",
                  cursor: "pointer",
                }}
              />
              <div className="text-muted small mt-1">
                Click to select a template
              </div>
            </Form.Group>
          </Col>

          {/* File Upload Section - Only shown for templates that support files AND are NOT carousel */}
          {showUploadSection && (
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold color-change mb-2">
                  Attach File
                </Form.Label>
                <div className="file-upload-section">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={getAcceptedFileTypes()}
                    style={{ display: "none" }}
                  />

                  <div
                    style={{ marginBottom: "12px" }}
                    className="d-flex align-items-center justify-content-start gap-3"
                  >
                    <Button
                      variant="secondary"
                      onClick={handleUploadClick}
                      className="d-flex align-items-center gap-2 mb-2"
                      style={{
                        borderRadius: "10px",
                        border: "1px solid #ced4da",
                        backgroundColor: "white",
                        fontWeight: "500",
                        padding: "10px 15px",
                      }}
                    >
                      <Icon
                        style={{ fontSize: "20px" }}
                        icon="humbleicons:upload"
                      />
                      {getUploadButtonText()}
                    </Button>

                    <div className="text-muted small mt-1 text-start d-flex align-items-center gap-1">
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
                            cursor: "pointer",
                            color: "#6c757d",
                          }}
                        />
                      </OverlayTrigger>
                    </div>
                  </div>

                  {selectedFile && (
                    <div
                      className="selected-file-info d-flex align-items-center gap-2 p-1 border rounded"
                      style={{ maxWidth: "fit-content" }}
                    >
                      <Icon
                        icon={
                          formData.templateType === "image"
                            ? "eva:image-fill"
                            : formData.templateType === "video"
                              ? "eva:video-fill"
                              : "eva:file-text-fill"
                        }
                        style={{ color: "#6c757d" }}
                      />
                      <span
                        className=""
                        onClick={() => handleFileClick(selectedFile)}
                        style={{
                          cursor: selectedFile.type.startsWith("image/")
                            ? "pointer"
                            : "default",
                          textDecoration: selectedFile.type.startsWith("image/")
                            ? "underline"
                            : "none",
                          color: selectedFile.type.startsWith("image/")
                            ? "#007bff"
                            : "inherit",
                          fontSize: "12px",
                        }}
                        title={
                          selectedFile.type.startsWith("image/")
                            ? "Click to view image"
                            : ""
                        }
                      >
                        {selectedFile.name}
                      </span>
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={handleRemoveFile}
                      >
                        <Icon icon="eva:close-fill" />
                      </Button>
                    </div>
                  )}

                  {fileError && (
                    <Alert variant="danger" className="py-2 mt-2 small">
                      {fileError}
                    </Alert>
                  )}
                </div>
              </Form.Group>
            </Col>
          )}

          {/* Carousel Upload Section - Only shown for carousel templates */}
          {formData.templateType === "carousel" && templateVariables.length > 0 && (
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold color-change mb-2 d-flex justify-content-between align-items-center">
                  <span>
                    Carousel Media Upload
                    {carouselMediaType && ` (${carouselMediaType})`}
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

                <div
                  className="carousel-upload-section p-3 rounded"
                  style={{ border: "1px #ced4da" }}
                >
                  <Row className="g-3">
                    {templateVariables.map((variable) => {
                      const currentFile = carouselFiles[variable.name];

                      return (
                        <Col md={6} key={variable.name}>
                          <div className="carousel-variable-upload">
                            <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                              {variable.name}
                              {currentFile && (
                                <Icon icon="eva:checkmark-circle-2-fill" style={{ color: "green", fontSize: "16px" }} />
                              )}
                            </h6>

                            <input
                              type="file"
                              id={`carousel-${variable.name}`}
                              onChange={(e) =>
                                handleCarouselFileSelect(variable.name, e, variable.mediaType)
                              }
                              accept={getAcceptedFileTypesForMedia(variable.mediaType)}
                              style={{ display: "none" }}
                            />

                            {!carouselFiles[variable.name] ? (
                              <Button
                                variant="secondary"
                                onClick={() =>
                                  document
                                    .getElementById(`carousel-${variable.name}`)
                                    .click()
                                }
                                className="d-flex align-items-center gap-2 w-100"
                                style={{
                                  borderRadius: "10px",
                                  border: "1px solid #ced4da",
                                  backgroundColor: "white",
                                  fontWeight: "500",
                                  padding: "10px 15px",
                                  justifyContent: "center",
                                }}
                              >
                                <Icon
                                  style={{ fontSize: "20px" }}
                                  icon="humbleicons:upload"
                                />
                                Upload {variable.name} ({variable.mediaType || "Image/Video"})
                              </Button>
                            ) : (
                              <div
                                className="selected-carousel-file d-flex align-items-center gap-2 p-1 border rounded bg-light"
                                style={{ maxWidth: "100%" }}
                              >
                                <Icon
                                  icon={
                                    getFileType(carouselFiles[variable.name]) === "image"
                                      ? "eva:image-fill"
                                      : "eva:video-fill"
                                  }
                                  style={{ color: "#6c757d" }}
                                />
                                <span
                                  className="small"
                                  onClick={() => handleFileClick(carouselFiles[variable.name])}
                                  style={{
                                    cursor: carouselFiles[variable.name].type.startsWith("image/")
                                      ? "pointer"
                                      : "default",
                                    textDecoration: carouselFiles[variable.name].type.startsWith("image/")
                                      ? "underline"
                                      : "none",
                                    color: carouselFiles[variable.name].type.startsWith("image/")
                                      ? "#007bff"
                                      : "inherit",
                                  }}
                                  title={
                                    carouselFiles[variable.name].type.startsWith("image/")
                                      ? "Click to view image"
                                      : ""
                                  }
                                >
                                  {carouselFiles[variable.name].name}
                                </span>
                                <Button
                                  variant="link"
                                  className="text-danger p-0"
                                  onClick={() =>
                                    handleRemoveCarouselFile(variable.name)
                                  }
                                >
                                  <Icon icon="eva:close-fill" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </Col>
                      );
                    })}
                  </Row>

                  {fileError && (
                    <Alert variant="danger" className="py-2 mt-2 small">
                      {fileError}
                    </Alert>
                  )}
                </div>
              </Form.Group>
            </Col>
          )}


          {/* Variable Mapping Section - GROUP: Show dropdowns for CSV data mapping */}
          {templateVariables.length > 0 &&
            formData.templateType !== "carousel" && (
              <Col md={12}>
                <div className="variable-mapping-section border rounded p-3 mb-3">
                  <h6 className="fw-semibold mb-3">
                    Map CSV Columns to Variables
                  </h6>
                  <Row className="g-3">
                    {templateVariables.map((variable, index) => (
                      <Col md={6} key={variable.name}>
                        <Form.Group>
                          <Form.Label className="fw-medium color-change mb-2">
                            {variable.name}
                          </Form.Label>
                          <Form.Select
                            value={variableMapping[variable.name] || ""}
                            onChange={(e) =>
                              handleVariableMappingChange(
                                variable.name,
                                e.target.value
                              )
                            }
                            className="form-select"
                            style={{
                              borderColor: "#e0e0e0",
                              borderRadius: "10px",
                            }}
                          >
                            <option value="">Select CSV Column</option>
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="ticketid">Ticket ID</option>
                            <option value="department">Department</option>
                            <option value="firstname">First Name</option>
                            <option value="lastname">Last Name</option>
                            <option value="company">Company</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Col>
            )}

          {/* Campaign Name */}
          <Col md={6}>
            <Form.Group className="mb-10">
              <Form.Label className="fw-semibold color-change mb-2">
                Campaign Name
              </Form.Label>
              <Form.Control
                type="text"
                name="campaignName"
                value={formData.campaignName}
                onChange={handleChange}
                className="py-2 bg-light"
                style={{
                  borderColor: "#e0e0e0",
                  borderRadius: "10px",
                }}
                readOnly
              />
            </Form.Group>
          </Col>

          {/* Select Type */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold color-change mb-2">
                Select Type
              </Form.Label>
              <Form.Select
                name="messageType"
                value={formData.messageType || "Immediate"}
                onChange={handleChange}
                className="form-select"
                style={{
                  borderColor: "#e0e0e0",
                  borderRadius: "10px",
                }}
              >
                <option value="Immediate">Immediate</option>
                <option value="Scheduled">Scheduled</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* FIXED: Changed to check for "Scheduled" instead of "scheduled" */}
          {formData.messageType === "Scheduled" && (
            <>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold color-change mb-2">
                    Select Timezone
                  </Form.Label>
                  <Form.Select
                    name="timezone"
                    value={formData.timezone || ""}
                    onChange={handleChange}
                    className="form-select"
                    style={{
                      borderColor: "#e0e0e0",
                      borderRadius: "10px",
                    }}
                  >
                    <option value="">Search or Select Timezone...</option>
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time (EST)</option>
                    <option value="PST">Pacific Time (PST)</option>
                    <option value="CST">Central Time (CST)</option>
                    <option value="IST">India Standard Time (IST)</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold color-change mb-2">
                    Date and Time
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="scheduledDateTime"
                    value={formData.scheduledDateTime || ""}
                    onChange={handleChange}
                    className="py-2"
                    style={{
                      borderColor: "#e0e0e0",
                      borderRadius: "10px",
                    }}
                  />
                </Form.Group>
              </Col>
            </>
          )}
        </Row>

        {/* Action Buttons */}
        <Row style={{ marginTop: "20px" }}>
          <Col className="d-flex gap-3 justify-content-end">
            <Button
              variant="btn-secondary"
              onClick={handleClear}
              className="btn-secondary"
            >
              Clear
            </Button>

            {/* Dynamic Main Button */}
            <Button
              className="btn-primary"
              type="submit"
              disabled={
                templateVariables.length > 0 &&
                Object.keys(variableMapping).length !== templateVariables.length
              }
            >
              {/* FIXED: Changed to check for "Scheduled" instead of "scheduled" */}
              {formData.messageType === "Scheduled" ? "Schedule" : "Next"}
            </Button>
          </Col>
        </Row>
      </Form>

      {showTemplateGalleryModal && (
        <UseTemplateModal
          onClose={() => setShowTemplateGalleryModal(false)}
          onTemplateSelect={handleTemplateSelect}
          messageType="group"
        />
      )}

      {/* Preview Message Modal - Opens when clicking Send Now/Schedule */}
      {showPreviewModal && (
        <PreviewMessageModal
          onClose={handlePreviewModalClose}
          previewData={previewData}
          onSendNow={handleSendFromPreview}
          onSchedule={handleScheduleFromPreview}
          messageType={formData.messageType}
        />
      )}
    </div>
  );
};

export default Group;
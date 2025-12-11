import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Dropdown,
  Alert,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useSnackbar } from "notistack";
import UseTemplateModal from "../Modules/UseTemplateModal";
import { Link } from "react-router-dom";
import PreviewMessageModal from "../Modules/PreviewMessageModal";
import DateTimePicker from "../../Calendar/DateTimePicker";
import { Icon } from "@iconify/react/dist/iconify.js";

const SingleMsg = ({
  formData,
  handleChange,
  handleSubmit,
  handleClear,
  countryCodes,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [showTemplateGalleryModal, setShowTemplateGalleryModal] =
    useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [templateVariables, setTemplateVariables] = useState([]);
  const [variableValues, setVariableValues] = useState({});
  const [carouselFiles, setCarouselFiles] = useState({});
  const [carouselMediaType, setCarouselMediaType] = useState(null);
  const fileInputRef = useRef(null);

  // Extract variables from template when message content changes
  useEffect(() => {
    if (formData.messageContent) {
      extractVariablesFromTemplate(formData.messageContent);
    } else {
      setTemplateVariables([]);
      setVariableValues({});
    }
  }, [formData.messageContent]);

  // Debug effect for carousel
  useEffect(() => {
    console.log('🔍 Carousel Debug:', {
      templateVariables,
      carouselFiles,
      carouselMediaType,
      fileError,
      formData: {
        templateType: formData.templateType,
        allowedFileTypes: formData.allowedFileTypes,
        maxFileSize: formData.maxFileSize
      }
    });
  }, [carouselFiles, fileError, templateVariables]);

  // Function to extract variables from template
  const extractVariablesFromTemplate = (template) => {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const matches = [...template.matchAll(variableRegex)];
    const variables = matches.map((match) => ({
      name: match[1],
      placeholder: match[0],
      // For existing templates without media type, default to template's carouselMediaType
      mediaType: carouselMediaType || 'image'
    }));

    // Remove duplicates
    const uniqueVariables = Array.from(
      new Map(variables.map((v) => [v.name, v])).values()
    );

    setTemplateVariables(uniqueVariables);

    // Initialize variable values
    const initialValues = {};
    uniqueVariables.forEach((variable) => {
      if (!variableValues[variable.name]) {
        initialValues[variable.name] = "";
      }
    });
    setVariableValues((prev) => ({ ...prev, ...initialValues }));
  };

  // Improved file type detection
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

  // Validate individual carousel file
  const validateCarouselFile = (file, variableName, expectedMediaType) => {
    if (!file) return "No file selected";

    const actualFileType = getFileType(file);

    if (expectedMediaType && actualFileType !== expectedMediaType) {
      return `Expected ${expectedMediaType} but got ${actualFileType}`;
    }

    if (formData.maxFileSize && formData.maxFileSize > 0) {
      const maxSize = formData.maxFileSize * 1024 * 1024;
      if (file.size > maxSize) {
        return `File size exceeds ${formData.maxFileSize}MB limit`;
      }
    }

    return null; // No error
  };

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

    // ✅ IMPORTANT FIX: For carousel files, store the actual file object reference
    // instead of just filename for proper preview
    setVariableValues((prev) => ({
      ...prev,
      [variableName]: file, // Store file object instead of filename
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

    // ✅ IMPORTANT FIX: Remove the variable value completely
    setVariableValues((prev) => {
      const newValues = { ...prev };
      delete newValues[variableName];
      return newValues;
    });
  };

  // Handle variable value change
  const handleVariableChange = (variableName, value) => {
    const newValues = {
      ...variableValues,
      [variableName]: value,
    };
    setVariableValues(newValues);

    // Also update formData if needed
    handleChange({
      target: {
        name: "variableValues",
        value: newValues,
      },
    });
  };

  // Replace variables in message content
  const getMessageWithVariables = () => {
    let message = formData.messageContent;
    templateVariables.forEach((variable) => {
      const placeholderRegex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');

      // Handle different types of variable values
      let value = variableValues[variable.name];

      if (value instanceof File) {
        // For file variables, use the filename for text replacement
        value = value.name;
      } else if (!value) {
        // If no value, keep the placeholder
        value = `{{${variable.name}}}`;
      }

      message = message.replace(placeholderRegex, value);
    });
    return message;
  };

  const handleUseTemplate = () => {
    setShowModal(false);
    setShowTemplateGalleryModal(true);
  };

  const isFormValid = () => {
    return (
      formData.countryCode &&
      formData.mobileNumber &&
      formData.messageContent &&
      formData.campaignName
    );
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

  // Handle template selection
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
      setTemplateVariables([]);
      setVariableValues({});
    }

    // Clear any existing file when template changes
    setSelectedFile(null);
    setCarouselFiles({});
    setFileError("");
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Clear previous errors
    setFileError("");

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

  // Get accepted file types for specific media type
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

  // Show upload section only for templates that support files AND are NOT carousel
  const showUploadSection =
    formData.allowedFileTypes &&
    formData.allowedFileTypes.length > 0 &&
    formData.templateType !== "carousel";

  // Modified to include file and variable values in preview data
  const handleSendNow = (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      enqueueSnackbar("Please fill all required fields before sending", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      return;
    }

    // Prepare preview data with variable replacements
    const previewData = {
      phoneNumber: `${formData.countryCode}${formData.mobileNumber}`,
      messageContent: getMessageWithVariables(),
      campaignName: formData.campaignName,
      messageType: formData.messageType,
      scheduledDateTime: formData.scheduledDateTime,
      timezone: formData.timezone,
      attachedFile: selectedFile,
      carouselFiles:
        formData.templateType === "carousel" ? carouselFiles : null,
      templateType: formData.templateType,
      originalMessage: formData.messageContent,
      variableValues: { ...variableValues },
    };

    setPreviewData(previewData);
    setShowPreviewModal(true);
  };

  // Handle main button click
  const handleMainButtonClick = (e) => {
  e.preventDefault();

  if (
    !formData.countryCode ||
    !formData.mobileNumber ||
    !formData.messageContent ||
    !formData.campaignName
  ) {
    enqueueSnackbar(
      "Fill in all the required details before sending.",
      {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      }
    );
    return;
  }

  // ✅ FIXED: Check if variables are filled (handle both strings and files)
  const unfilledVariables = templateVariables.filter(
    (variable) => {
      const value = variableValues[variable.name];
      
      // For carousel templates, check if file is uploaded
      if (formData.templateType === "carousel") {
        return !carouselFiles[variable.name];
      }
      
      // For regular text variables, check if string is empty
      if (typeof value === 'string') {
        return !value || value.trim() === "";
      }
      
      // For other types (like files in non-carousel), consider as filled
      return !value;
    }
  );

  if (unfilledVariables.length > 0) {
    if (formData.templateType === "carousel") {
      enqueueSnackbar(
        `Upload all the media files required for the carousel template: ${unfilledVariables
          .map((v) => v.name)
          .join(", ")}`,
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        }
      );
    } else {
      enqueueSnackbar(
        `Fill in the values for the message variables: ${unfilledVariables
          .map((v) => v.name)
          .join(", ")}`,
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        }
      );
    }
    return;
  }

  if (showUploadSection && !selectedFile) {
    const type = formData.templateType || "file";
    enqueueSnackbar(`Upload the required ${type} file`, {
      variant: "error",
      anchorOrigin: { vertical: "top", horizontal: "right" },
    });
    return;
  }

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

  const previewData = {
    phoneNumber: `${formData.countryCode}${formData.mobileNumber}`,
    messageContent: getMessageWithVariables(),
    campaignName: formData.campaignName,
    messageType: formData.messageType,
    scheduledDateTime: formData.scheduledDateTime,
    timezone: formData.timezone,
    attachedFile: selectedFile,
    carouselFiles: formData.templateType === "carousel" ? carouselFiles : null,
    templateType: formData.templateType,
    originalMessage: formData.messageContent,
    variableValues: { ...variableValues },
    // ✅ ADD THIS: Pass template variables for proper preview
    templateVariables: templateVariables,
  };

  setPreviewData(previewData);
  setShowPreviewModal(true);
};

  // Handle sending from preview modal
  const handleSendFromPreview = () => {
    const mockEvent = {
      preventDefault: () => { },
    };
    handleSubmit(mockEvent);
  };

  // Handle scheduling from preview modal
  const handleScheduleFromPreview = () => {
    const mockEvent = {
      preventDefault: () => { },
    };
    handleSubmit(mockEvent);
  };

  // Handle preview modal close
  const handlePreviewModalClose = () => {
    setShowPreviewModal(false);
  };

  // ------------------------------------------
  // TOOLTIP RENDER FUNCTIONS
  // ------------------------------------------
  // MODIFIED: Tooltip content updated to include Max size (based on image_3d0413.png style)
  const renderSingleFileTooltip = (props) => (
    <Tooltip id="file-info-tooltip-single" {...props}>
      Allowed types: **{(formData.allowedFileTypes || []).join(", ")}**
      <br />
      Max size: **{formData.maxFileSize || 0}MB**
    </Tooltip>
  );

  // MODIFIED: Carousel tooltip logic changed to include Max size and Media type
  const renderCarouselTooltip = (props) => (
    <Tooltip id="file-info-tooltip-carousel" {...props}>
      Allowed types: {(formData.allowedFileTypes || []).join(", ")}
      <br />
      Max size: {formData.maxFileSize || 0}MB per file
      {carouselMediaType && ` • Media type: ${carouselMediaType}`}
    </Tooltip>
  );
  // ------------------------------------------
  // ------------------------------------------

  return (
    <div className="col-xxl-9 col-xl-9">
      <Form onSubmit={handleMainButtonClick}>
        <Row className="g-3">
          {/* Country Code & Mobile Number */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold color-change mb-2">
                Country Code
              </Form.Label>
              <Form.Select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="form-select"
                style={{
                  borderColor: "#e0e0e0",
                  borderRadius: "10px",
                }}
              >
                <option value="">Select Country Code</option>
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} ({country.country})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold color-change mb-2">
                Mobile Number
              </Form.Label>

              <Form.Control
                type="text" // changed to text (number allows e, +, -, arrows)
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={(e) => {
                  const value = e.target.value;

                  // Allow only digits
                  if (/^\d*$/.test(value)) {
                    // Max 10 digits
                    if (value.length <= 10) {
                      handleChange(e);
                    }
                  }
                }}
                placeholder="Enter the Mobile Number"
                className="py-2"
                style={{
                  borderColor: "#e0e0e0",
                  borderRadius: "10px",
                }}
              />

              {/* Validation error */}
              {formData.mobileNumber && formData.mobileNumber.length !== 10 && (
                <small style={{ color: "red" }}>
                  Mobile number must be exactly 10 digits
                </small>
              )}
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

          {/* Variable Input Section - For manual variable entry */}
          {templateVariables.length > 0 &&
            formData?.templateType !== "carousel" && (
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold color-change">
                  Enter Variable Values
                </Form.Label>
                <div className="variable-input-section border rounded p-3">
                  <Row className="g-3">
                    {templateVariables.map((variable, index) => (
                      <Col md={6} key={variable.name}>
                        <Form.Group>
                          <Form.Label className="fw-medium color-change mb-2">
                            {variable.name}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={variableValues[variable.name] || ""}
                            onChange={(e) =>
                              handleVariableChange(
                                variable.name,
                                e.target.value
                              )
                            }
                            placeholder={`Enter value for ${variable.name}`}
                            className="form-control"
                            style={{
                              borderColor: "#e0e0e0",
                              borderRadius: "10px",
                            }}
                          />
                        </Form.Group>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Form.Group>
            )}

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
                      // ADDED: Styling to match screenshot
                      style={{
                        borderRadius: "10px",
                        border: "1px solid",
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
                        // Set trigger to 'click'
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
                    // ADDED: Simple style adjustment to selected file info to match screenshot
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
          {formData.templateType === "carousel" &&
            templateVariables.length > 0 && (
              <Col md={12}>
                <Form.Group className="mb-3">
                  {/* MODIFIED: Carousel Label now has Info Icon on the right */}
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
                  {/* END MODIFIED LABEL */}

                  {/* ADDED: Dashed border style to container */}
                  <div
                    className="carousel-upload-section p-3 rounded"
                    style={{ border: "1px #ced4da" }}
                  >
                    <Row className="g-3">
                      {templateVariables.map((variable) => {
                        const currentFile = carouselFiles[variable.name];
                        const fileError = currentFile ? validateCarouselFile(currentFile, variable.name, variable.mediaType) : null;

                        return (
                          <Col md={6} key={variable.name}>
                            <div className="carousel-variable-upload">
                              <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                                {variable.name}
                                {currentFile && !fileError && (
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
                                  // ADDED: Button styling to match screenshot
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
                                // UPDATED: Added click functionality for carousel files
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

                              {currentFile && fileError && (
                                <Alert variant="danger" className="py-1 mt-1 small">
                                  {fileError}
                                </Alert>
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

                    {/* REMOVED: Separate Info text div is removed as requested. Only the Tooltip Icon remains in the label */}
                  </div>
                </Form.Group>
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
                  <DateTimePicker
                    onDateTimeChange={({ date, time, datetime }) => {
                      console.log("Selected date:", date);
                      console.log("Selected time:", time);
                      console.log("Combined datetime:", datetime);
                    }}
                    placeholder="Select date and time"
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
              className="btn-primary d-flex align-items-center"
              type="submit"
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
          messageType="single"
        />
      )}

      {/* Preview Message Modal */}
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

export default SingleMsg;
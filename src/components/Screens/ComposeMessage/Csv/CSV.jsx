import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Alert,
  Table,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useSnackbar } from "notistack";
import UseTemplateModal from "../Modules/UseTemplateModal";
import PreviewMessageModal from "../Modules/PreviewMessageModal";
import { Icon } from "@iconify/react/dist/iconify.js";

const CSV = ({
  formData,
  handleChange,
  handleSubmit,
  handleClear,
  countryCodes = [],
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [showTemplateGalleryModal, setShowTemplateGalleryModal] =
    useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [csvFileError, setCsvFileError] = useState("");
  const [templateVariables, setTemplateVariables] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [variableMapping, setVariableMapping] = useState({});
  const [carouselFiles, setCarouselFiles] = useState({});
  const [carouselMediaType, setCarouselMediaType] = useState(null);
  const fileInputRef = useRef(null);

  // Extract variables from template when message content changes
  useEffect(() => {
    if (formData?.messageContent) {
      extractVariablesFromTemplate(formData.messageContent);
    } else {
      setTemplateVariables([]);
      setVariableMapping({});
    }
  }, [formData?.messageContent]);

  useEffect(() => {
    console.log('🔍 CSV File Debug:', {
      csvFile: formData?.csvFile,
      csvFileName: formData?.csvFile?.name,
      csvFileSize: formData?.csvFile?.size,
      csvFileType: formData?.csvFile?.type,
      csvHeaders: csvHeaders,
      csvDataLength: csvData.length,
      isFormValid: isFormValid()
    });
  }, [formData?.csvFile, csvHeaders, csvData]);

  // Function to extract variables from template
  const extractVariablesFromTemplate = (template) => {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const matches = [...template.matchAll(variableRegex)];
    const variables = matches.map((match) => ({
      name: match[1],
      placeholder: match[0],
    }));

    // Remove duplicates
    const uniqueVariables = Array.from(
      new Map(variables.map((v) => [v.name, v])).values()
    );

    setTemplateVariables(uniqueVariables);

    // Initialize variable mapping
    const initialMapping = {};
    uniqueVariables.forEach((variable) => {
      if (!variableMapping[variable.name]) {
        initialMapping[variable.name] = "";
      }
    });
    setVariableMapping((prev) => ({ ...prev, ...initialMapping }));
  };

  const handleUseTemplate = () => {
    setShowTemplateGalleryModal(true);
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

  const isFormValid = () => {
    // Check message content
    if (!formData?.messageContent || formData.messageContent.trim() === '') {
      return false;
    }

    // Check campaign name
    if (!formData?.campaignName || formData.campaignName.trim() === '') {
      return false;
    }

    // Check CSV file - only required for non-carousel templates
    if (formData?.templateType !== "carousel") {
      if (!formData?.csvFile && csvHeaders.length === 0) {
        return false;
      }
    }

    // Check country code
    if (!formData?.countryCode || formData.countryCode.trim() === '') {
      return false;
    }

    // Check mobile number
    if (!formData?.mobileNumber || formData.mobileNumber.length !== 10) {
      return false;
    }

    return true;
  };

  const getAcceptedFileTypesForMedia = (mediaType) => {
    const baseTypes = formData?.allowedFileTypes || [];
    const mediaSpecificTypes = baseTypes.map(type => `.${type}`).join(",");

    if (mediaType === 'image') {
      return mediaSpecificTypes.includes('.mp4') ? '.png,.jpg,.jpeg,.webp' : mediaSpecificTypes;
    } else if (mediaType === 'video') {
      return mediaSpecificTypes.includes('.png') ? '.mp4,.mov,.avi,.webm' : mediaSpecificTypes;
    }

    return mediaSpecificTypes;
  };

  // ✅ CSV file validation and parsing
  const validateCsvFile = (file) => {
    if (!file) return "Please select a file";

    const allowedTypes = [".csv", "text/csv", "application/vnd.ms-excel"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (
      !allowedTypes.includes(`.${fileExtension}`) &&
      !allowedTypes.includes(file.type)
    ) {
      return "Only CSV files are allowed";
    }

    const maxSize = 32 * 1024 * 1024; // 32 MB
    if (file.size > maxSize) {
      return "File size must be less than 32MB";
    }

    if (file.size === 0) {
      return "CSV file cannot be empty";
    }

    return "";
  };

  // ✅ Parse CSV file and extract headers and sample data
  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const lines = content
            .split("\n")
            .filter((line) => line.trim() !== "");

          if (lines.length === 0) {
            reject(new Error("CSV file is empty"));
            return;
          }

          // Extract headers
          const headers = lines[0]
            .split(",")
            .map((header) => header.trim().replace(/"/g, "").toLowerCase());

          // Extract sample data (first 5 rows)
          const sampleData = [];
          for (let i = 1; i < Math.min(6, lines.length); i++) {
            const values = lines[i]
              .split(",")
              .map((value) => value.trim().replace(/"/g, ""));
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || "";
            });
            sampleData.push(row);
          }

          resolve({ headers, sampleData });
        } catch (error) {
          reject(new Error("Error parsing CSV file"));
        }
      };

      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  };

  // ✅ Handle CSV file selection
  const handleCsvFileSelect = async (event) => {
    if (!event?.target?.files?.[0]) {
      setCsvFileError("");
      setCsvHeaders([]);
      setCsvData([]);
      setVariableMapping({});
      // FIX: Use the correct way to update formData
      handleChange({
        target: {
          name: "csvFile",
          value: null,
        },
      });
      return;
    }

    const file = event.target.files[0];
    const error = validateCsvFile(file);

    if (error) {
      setCsvFileError(error);
      setCsvHeaders([]);
      setCsvData([]);
      setVariableMapping({});
      // FIX: Use the correct way to update formData
      handleChange({
        target: { name: "csvFile", value: null },
      });
      event.target.value = ""; // Reset file input
    } else {
      try {
        setCsvFileError("");
        const { headers, sampleData } = await parseCSV(file);

        setCsvHeaders(headers);
        setCsvData(sampleData);

        // ✅ FIX: Properly set the csvFile in formData
        handleChange({
          target: {
            name: "csvFile",
            value: file, // Make sure this is the file object
          },
        });

        // Auto-map variables if possible
        const autoMapping = {};
        templateVariables.forEach((variable) => {
          const matchingHeader = headers.find(
            (header) =>
              header.toLowerCase().includes(variable.name.toLowerCase()) ||
              variable.name.toLowerCase().includes(header.toLowerCase())
          );
          if (matchingHeader) {
            autoMapping[variable.name] = matchingHeader;
          }
        });
        setVariableMapping(autoMapping);

        enqueueSnackbar("CSV file uploaded successfully", {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
      } catch (parseError) {
        setCsvFileError(parseError.message);
        setCsvHeaders([]);
        setCsvData([]);
        handleChange({
          target: { name: "csvFile", value: null },
        });
        event.target.value = ""; // Reset file input
      }
    }
  };

  // ✅ Handle template selection
  const handleTemplateSelect = (templateData) => {
    handleChange({
      target: {
        name: "messageContent",
        value: templateData?.description || "",
      },
    });
    handleChange({
      target: { name: "templateType", value: templateData?.type || "" },
    });
    handleChange({
      target: {
        name: "allowedFileTypes",
        value: templateData?.allowedFileTypes || [],
      },
    });
    handleChange({
      target: { name: "maxFileSize", value: templateData?.maxFileSize || 0 },
    });

    // Set carousel media type
    setCarouselMediaType(templateData.carouselMediaType || null);

    // FIXED: Properly handle template variables
    if (templateData.type === "carousel" && templateData.variables) {
      // For carousel templates, use the provided variables array
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
      extractVariablesFromTemplate(templateData?.description || "");
    }

    setSelectedFile(null);
    setCarouselFiles({});
    setFileError("");
  };

  // ✅ Handle variable mapping change
  const handleVariableMappingChange = (variable, csvColumn) => {
    const newMapping = {
      ...variableMapping,
      [variable]: csvColumn,
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

  // Carousel file handling functions
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
    if (formData?.maxFileSize && formData.maxFileSize > 0) {
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
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "document";
  };

  // ✅ Handle file selection for message attachment
  const handleFileSelect = (event) => {
    if (!event?.target?.files?.[0]) return;
    const file = event.target.files[0];

    const fileExtension = file.name.split(".").pop().toLowerCase();
    const allowedTypes = formData?.allowedFileTypes || [];

    if (allowedTypes.length > 0 && !allowedTypes.includes(fileExtension)) {
      setFileError(`Only ${allowedTypes.join(", ")} files are allowed`);
      setSelectedFile(null);
      return;
    }

    const maxSize = (formData?.maxFileSize || 0) * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError(`File size must be less than ${formData?.maxFileSize}MB`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setFileError("");

    handleChange({
      target: { name: "attachedFile", value: file },
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError("");
    handleChange({
      target: { name: "attachedFile", value: null },
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

  const getUploadButtonText = () => {
    const templateType = formData?.templateType;
    const maxSize = formData?.maxFileSize;
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

  const getAcceptedFileTypes = () => {
    const allowedTypes = formData?.allowedFileTypes || [];
    return allowedTypes.map((type) => `.${type}`).join(",");
  };

  // ✅ Generate preview message with actual data from CSV
  const generatePreviewMessage = () => {
    if (!formData?.messageContent || csvData.length === 0) {
      return formData?.messageContent || "";
    }

    let message = formData.messageContent;

    // Replace variables with actual data from first CSV row
    templateVariables.forEach((variable) => {
      const csvColumn = variableMapping[variable.name];
      if (csvColumn && csvData[0] && csvData[0][csvColumn]) {
        const value = csvData[0][csvColumn];
        // Replace all occurrences of the variable
        const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, "g");
        message = message.replace(regex, value);
      }
    });

    return message;
  };

  const handleMainButtonClick = (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      enqueueSnackbar(
        "Fill in all the required details before sending.",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        }
      );
      return;
    }

    // ✅ FIX: Only validate CSV column mapping for NON-carousel templates
    if (formData?.templateType !== "carousel") {
      const unmappedVariables = templateVariables.filter(
        (variable) =>
          !variableMapping[variable.name] ||
          variableMapping[variable.name].trim() === ""
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

    const showUploadSection =
      formData?.allowedFileTypes &&
      formData.allowedFileTypes.length > 0 &&
      formData?.templateType !== "carousel";

    if (showUploadSection && !selectedFile) {
      const type = formData?.templateType || "file";
      enqueueSnackbar(`Upload the required ${type} file.`, {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    // ✅ Carousel template validation (same as Group component)
    if (formData?.templateType === "carousel" && templateVariables.length > 0) {
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

      // ENHANCED: Check if uploaded files match the required media types
      const invalidMediaFiles = templateVariables.filter((variable) => {
        const file = carouselFiles[variable.name];
        if (!file) return false;

        const fileType = getFileType(file);
        const variableMediaType = variable.mediaType || carouselMediaType;
        return variableMediaType && fileType !== variableMediaType;
      });

      if (invalidMediaFiles.length > 0) {
        enqueueSnackbar(
          `Some files don't match the required media type: ${invalidMediaFiles
            .map((v) => `${v.name} (expected ${v.mediaType || carouselMediaType})`)
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
      fileName: formData?.csvFile?.name || "CSV File",
      messageContent: generatePreviewMessage(),
      campaignName: formData?.campaignName || "",
      messageType: formData?.messageType || "Immediate",
      scheduledDateTime: formData?.scheduledDateTime || "",
      timezone: formData?.timezone || "",
      attachedFile: selectedFile,
      carouselFiles:
        formData?.templateType === "carousel" ? carouselFiles : null,
      templateType: formData?.templateType || "",
      templateVariables: templateVariables,
      csvHeaders: csvHeaders,
      csvData: csvData,
      variableMapping: variableMapping,
      totalRecords: csvData.length,
      originalMessage: formData?.messageContent || "",
    };
    setPreviewData(previewData);
    setShowPreviewModal(true);
  };

  // ✅ Safe send/schedule handlers (no fake event targets)
  const handleSendFromPreview = () => {
    handleSubmit({ preventDefault: () => { } });
  };

  const handleScheduleFromPreview = () => {
    handleSubmit({ preventDefault: () => { } });
  };

  const handlePreviewModalClose = () => {
    setShowPreviewModal(false);
  };

  // Show upload section only for templates that support files AND are NOT carousel
  const showUploadSection =
    formData?.allowedFileTypes &&
    formData.allowedFileTypes.length > 0 &&
    formData?.templateType !== "carousel";

  const renderCountryCodes = () => {
    if (
      !countryCodes ||
      !Array.isArray(countryCodes) ||
      countryCodes.length === 0
    ) {
      return <option value="">No country codes available</option>;
    }

    return countryCodes.map((country, index) => (
      <option key={country?.code || index} value={country?.code || ""}>
        {country?.code} ({country?.country || "Unknown"})
      </option>
    ));
  };

  return (
    <div className="col-xxl-12 col-xl-12">
      <Form onSubmit={handleMainButtonClick}>
        <Row className="g-4 align-items-start">
          {/* LEFT COLUMN */}
          <Col lg={6} md={12} sm={12}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold color-change mb-3">
                Message Content
              </Form.Label>
              <Form.Control
                readOnly
                onClick={handleUseTemplate}
                as="textarea"
                rows={5}
                name="messageContent"
                value={formData?.messageContent || ""}
                onChange={handleChange}
                placeholder="Select a Template"
                className="border-2"
                style={{
                  borderColor: "#e0e0e0",
                  borderRadius: "10px",
                  resize: "none",
                  height: "180px",
                  cursor: "pointer",
                }}
              />
              <div className="text-muted small mt-1">
                Click to select a template
              </div>
            </Form.Group>

            {/* File Upload Section - Only shown for templates that support files AND are NOT carousel */}
            {showUploadSection && (
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold color-change mb-3">
                  Attach File to Message
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
                          formData?.templateType === "image"
                            ? "eva:image-fill"
                            : formData?.templateType === "video"
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
            )}

            {/* Carousel Upload Section - Only shown for carousel templates */}
            {formData?.templateType === "carousel" &&
              templateVariables.length > 0 && (
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold color-change mb-3 d-flex justify-content-between align-items-center">
                    <span>
                      Carousel Media Upload (
                      {carouselMediaType || "image/video"})
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
                        const variableMediaType = variable.mediaType || carouselMediaType;

                        return (
                          <Col md={6} key={variable.name}>
                            <div className="carousel-variable-upload">
                              <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                                {variable.name}
                                {currentFile && (
                                  <Icon
                                    icon="eva:checkmark-circle-2-fill"
                                    style={{ color: "green", fontSize: "16px" }}
                                  />
                                )}
                              </h6>

                              <input
                                type="file"
                                id={`carousel-${variable.name}`}
                                onChange={(e) =>
                                  handleCarouselFileSelect(variable.name, e, variableMediaType)
                                }
                                accept={getAcceptedFileTypesForMedia(variableMediaType)}
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
                                  Upload {variable.name} (
                                  {variableMediaType || "Image/Video"})
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
              )}


            {/* Variable Mapping Section - CSV: Show dropdowns for CSV column mapping */}
            {templateVariables.length > 0 &&
              formData?.templateType !== "carousel" && (
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold color-change mb-3">
                    Map CSV Columns to Variables
                  </Form.Label>
                  <div className="variable-mapping-section border rounded p-3">
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
                              {csvHeaders.map((header) => (
                                <option key={header} value={header}>
                                  {header.charAt(0).toUpperCase() +
                                    header.slice(1)}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      ))}
                    </Row>

                  </div>
                </Form.Group>
              )}

            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold color-change mb-3">
                    Campaign Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="campaignName"
                    value={formData?.campaignName || ""}
                    onChange={handleChange}
                    className="py-2 bg-light"
                    style={{ borderColor: "#e0e0e0", borderRadius: "10px" }}
                    readOnly
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold color-change mb-3">
                    Select Type
                  </Form.Label>
                  <Form.Select
                    name="messageType"
                    value={formData?.messageType || "Immediate"}
                    onChange={handleChange}
                    style={{ borderColor: "#e0e0e0", borderRadius: "10px" }}
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Scheduled">Scheduled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* FIXED: Changed to check for "Scheduled" instead of "scheduled" */}
            {formData?.messageType === "Scheduled" && (
              <Row className="g-3 mt-1">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold color-change mb-3">
                      Select Timezone
                    </Form.Label>
                    <Form.Select
                      name="timezone"
                      value={formData?.timezone || ""}
                      onChange={handleChange}
                      style={{ borderColor: "#e0e0e0", borderRadius: "10px" }}
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
                  <Form.Group>
                    <Form.Label className="fw-semibold color-change mb-3">
                      Date and Time
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="scheduledDateTime"
                      value={formData?.scheduledDateTime || ""}
                      onChange={handleChange}
                      className="py-2"
                      style={{ borderColor: "#e0e0e0", borderRadius: "10px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Col>

          {/* RIGHT COLUMN */}
          <Col lg={6} md={12} sm={12}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold color-change mb-3">
                Upload CSV only, Max file size : 32 MB
              </Form.Label>
              <Form.Control
                className="form-input"
                type="file"
                name="csvFile"
                accept=".csv"
                onChange={handleCsvFileSelect}
                style={{ borderColor: "#e0e0e0", borderRadius: "10px" }}
              />
              {csvFileError && (
                <Alert variant="danger" className="py-2 mt-2 small">
                  {csvFileError}
                </Alert>
              )}

              {/* File Info */}
              {formData?.csvFile && (
                <div className="mt-2 p-2 border rounded bg-light">
                  <div className="d-flex align-items-center gap-2">
                    <Icon
                      icon="eva:file-text-fill"
                      style={{ color: "#6c757d" }}
                    />
                    <span className="small">{formData.csvFile.name}</span>
                  </div>
                  <div className="text-muted extra-small mt-1">
                    Size: {(formData.csvFile.size / 1024 / 1024).toFixed(2)} MB
                    {csvData.length > 0 &&
                      ` • ${csvData.length + 1} rows detected`}
                  </div>
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold color-change mb-3">
                Country Code
              </Form.Label>
              <Form.Select
                name="countryCode"
                value={formData?.countryCode || ""}
                onChange={handleChange}
                style={{ borderColor: "#e0e0e0", borderRadius: "10px" }}
              >
                <option value="">Select Country Code</option>
                {renderCountryCodes()}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-semibold color-change mb-3">
                Mobile Number
              </Form.Label>
              <Form.Control
                type="text"
                name="mobileNumber"
                value={formData?.mobileNumber || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) && value.length <= 10) {
                    handleChange(e);
                  }
                }}
                placeholder="Enter the Mobile Number"
                style={{ borderColor: "#e0e0e0", borderRadius: "10px" }}
              />

              {/* Error Message */}
              {formData?.mobileNumber &&
                formData.mobileNumber.length !== 10 && (
                  <small style={{ color: "red" }}>
                    Mobile number must be exactly 10 digits
                  </small>
                )}
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button
            variant="btn-secondary"
            onClick={handleClear}
            className="btn-secondary"
          >
            Clear
          </Button>

          <Button
            type="submit"
            className="btn-primary"
          >
            {formData?.messageType === "Scheduled" ? "Schedule" : "Next"}
          </Button>
        </div>
      </Form>

      {showTemplateGalleryModal && (
        <UseTemplateModal
          onClose={() => setShowTemplateGalleryModal(false)}
          onTemplateSelect={handleTemplateSelect}
          messageType="csv"
        />
      )}

      {showPreviewModal && (
        <PreviewMessageModal
          onClose={handlePreviewModalClose}
          previewData={previewData}
          onSendNow={handleSendFromPreview}
          onSchedule={handleScheduleFromPreview}
          messageType={formData?.messageType || "Immediate"}
        />
      )}
    </div>
  );
};

export default CSV;

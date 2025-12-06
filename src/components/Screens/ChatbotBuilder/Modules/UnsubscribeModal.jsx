import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSnackbar, closeSnackbar } from "notistack";
import { OverlayTrigger, Tooltip, Alert, Form } from "react-bootstrap";

const UnsubscribeModal = ({ showKeyModal, setShowKeyModal }) => {
  const [formData, setFormData] = useState({
    keywords: [], // Array to store selected keywords
    response: "", // Start with empty response
    image: null
  });
  const [newKeyword, setNewKeyword] = useState(""); // For input field
  const [showDropdown, setShowDropdown] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileError, setFileError] = useState("");
  
  const fileInputRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();

  // Predefined keywords for dropdown suggestions
  const predefinedKeywords = ["stop", "unsubscribe", "cancel", "end", "quit"];

  // Default response message
  const defaultResponse = "You have successfully unsubscribe";

  // Set default values when modal opens
  useEffect(() => {
    if (showKeyModal) {
      setFormData({
        keywords: ["stop"], // Default keyword "stop"
        response: defaultResponse, // Default response
        image: null
      });
      setNewKeyword("");
      setShowDropdown(false);
      setImagePreview(null);
      setFileError("");
      setFormValid(true); // Form is valid with defaults
    }
  }, [showKeyModal]);

  // Validate form whenever formData changes
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const { keywords, response } = formData;

    // Basic validation - at least one keyword and response are required
    const isValid =
      keywords.length > 0 &&
      response.trim() !== "";

    setFormValid(isValid);
  };

  // Add keyword function (same as KeywordModal)
  const addKeyword = (value) => {
    const trimmed = String(value || "").trim().toLowerCase();
    if (!trimmed) return;

    const exists = formData.keywords.some(
      (k) => k.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setNewKeyword("");
      setShowDropdown(false);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, trimmed],
    }));
    setNewKeyword("");
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword(newKeyword);
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    const newKeywords = formData.keywords.filter(keyword => keyword !== keywordToRemove);

    // Check if after removal, ONLY "stop" keyword remains
    const hasOnlyStop = newKeywords.length === 1 && newKeywords[0].toLowerCase() === "stop";

    setFormData((prevState) => ({
      ...prevState,
      keywords: newKeywords,
      // Set default response only if ONLY "stop" keyword remains
      response: hasOnlyStop ? defaultResponse : prevState.response
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle file selection - Updated to match SingleMsg style
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Clear previous errors
    setFileError("");

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setFileError("Only image files are allowed");
      setFormData(prev => ({ ...prev, image: null }));
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size must be less than 5MB");
      setFormData(prev => ({ ...prev, image: null }));
      return;
    }

    // Validate file type
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const allowedTypes = ["jpg", "jpeg", "png", "gif"];
    
    if (!allowedTypes.includes(fileExtension)) {
      setFileError(`Only ${allowedTypes.join(", ")} files are allowed`);
      setFormData(prev => ({ ...prev, image: null }));
      return;
    }

    setFormData((prevState) => ({
      ...prevState,
      image: file,
    }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setFileError("");
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Remove selected file - Updated to match SingleMsg style
  const removeImage = () => {
    setFormData((prevState) => ({
      ...prevState,
      image: null,
    }));
    setImagePreview(null);
    setFileError("");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ✅ Handle file click to open in new tab - From SingleMsg
  const handleFileClick = (file) => {
    if (file && file.type.startsWith("image/")) {
      const fileUrl = URL.createObjectURL(file);
      window.open(fileUrl, "_blank");
      // Clean up the object URL after some time
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    }
  };

  const handleSubmit = () => {
    if (!formValid) {
      enqueueSnackbar("Please fill all required fields!", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    console.log("Unsubscribe Form Data:", formData);

    enqueueSnackbar("Unsubscribe settings saved successfully!", {
      variant: "success",
      autoHideDuration: 3000,
    });

    // Reset form and close modal
    resetForm();
    setShowKeyModal(false);
  };

  const handleCancel = () => {
    setShowKeyModal(false);
  };

  const resetForm = () => {
    setFormData({
      keywords: [],
      response: "",
      image: null
    });
    setNewKeyword("");
    setImagePreview(null);
    setFileError("");
    setFormValid(false);
  };

  // Filter dropdown suggestions based on typing (same as KeywordModal)
  const filteredSuggestions = predefinedKeywords.filter(
    (item) =>
      item.toLowerCase().includes(newKeyword.toLowerCase()) &&
      !formData.keywords.includes(item)
  );

  // ------------------------------------------
  // TOOLTIP RENDER FUNCTION - Similar to SingleMsg
  // ------------------------------------------
  const renderImageUploadTooltip = (props) => (
    <Tooltip id="image-upload-tooltip" {...props}>
      Supported formats: JPG, PNG, GIF
      <br />
      Max size: 5MB
    </Tooltip>
  );

  if (!showKeyModal) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content unsubscribe-modal"
        style={{ width: "600px" }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="d-flex align-items-center">
            <div>
              <Icon className="modal-icon-adjustments" icon="ri:seo-line" />
            </div>
            <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>Key Words</h3>
          </div>
          <button className="close-btn" onClick={handleCancel}>
            <Icon icon="mingcute:close-line" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Key Words Input with Tags - Same as KeywordModal */}
          <div className="form-group mb-3">
            <label className="form-label">Key Words *</label>

            {/* TAG + INPUT COMBINED BOX - Same styling as KeywordModal */}
            <div
              className="d-flex flex-wrap p-2 border rounded position-relative"
              style={{ 
                minHeight: "48px", 
                alignItems: "center", 
                gap: "3px",
                cursor: "text" 
              }}
              onClick={() => {
                document.getElementById("inlineKeywordInput").focus();
              }}
            >
              {/* Existing Tags - Same styling as KeywordModal */}
              {formData.keywords.length > 0 ? (
                formData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="contact-badge key-badge"
                  >
                    {keyword}
                    <Icon
                      icon="material-symbols:close-rounded"
                      style={{
                        fontSize: "18px",
                        marginLeft: "8px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleRemoveKeyword(keyword)}
                    />
                  </span>
                ))
              ) : (
                <span className="text-muted"></span>
              )}

              {/* Input - Same as KeywordModal */}
              <input
                id="inlineKeywordInput"
                type="text"
                className="form-control"
                value={newKeyword}
                onChange={(e) => {
                  setNewKeyword(e.target.value);
                  setShowDropdown(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type and press Enter"
                style={{
                  border: "none",
                  outline: "none",
                  minWidth: "160px",
                  flex: "1 1 160px",
                  background: "transparent",
                  padding: "6px",
                }}
              />

              {/* Dropdown - Same as KeywordModal */}
              {showDropdown && filteredSuggestions.length > 0 && (
                <ul
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginTop: "2px",
                    padding: "4px 0",
                    listStyle: "none",
                    maxHeight: "160px",
                    overflowY: "auto",
                    zIndex: 1000,
                  }}
                >
                  {filteredSuggestions.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => addKeyword(item)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#f2f2f2")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "transparent")
                      }
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <small className="text-muted">
              Press Enter to add keyword. Click × to remove.
            </small>
          </div>

          {/* Response Text */}
          <div className="form-group mb-3">
            <label className="form-label">Response *</label>
            <input
              type="text"
              className="form-control"
              name="response"
              value={formData.response}
              onChange={handleInputChange}
              placeholder="Enter unsubscribe response message"
              required
            />
          </div>

          {/* Image Upload - UPDATED to match SingleMsg style */}
          <div className="form-group">
            <Form.Label className="fw-semibold color-change mb-2">
              Image Upload
            </Form.Label>
            <div className="file-upload-section">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept=".jpg,.jpeg,.png,.gif"
                style={{ display: "none" }}
              />

              <div
                style={{ marginBottom: "12px" }}
                className="d-flex align-items-center justify-content-start gap-3"
              >
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="d-flex align-items-center gap-2 mb-2 btn btn-secondary"
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
                  Choose Image (Max 5MB)
                </button>

                <div className="text-muted small mt-1 text-start d-flex align-items-center gap-1">
                  <OverlayTrigger
                    placement="bottom"
                    trigger="click"
                    overlay={renderImageUploadTooltip}
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

              {/* Selected File Info - Similar to SingleMsg */}
              {formData.image && (
                <div
                  className="selected-file-info d-flex align-items-center gap-2 p-1 border rounded"
                  style={{ maxWidth: "fit-content" }}
                >
                  <Icon
                    icon="eva:image-fill"
                    style={{ color: "#6c757d" }}
                  />
                  <span
                    className=""
                    onClick={() => handleFileClick(formData.image)}
                    style={{
                      cursor: "pointer",
                      textDecoration: "underline",
                      color: "#007bff",
                      fontSize: "12px",
                    }}
                    title="Click to view image"
                  >
                    {formData.image.name}
                  </span>
                  <button
                    type="button"
                    className="btn btn-link text-danger p-0"
                    onClick={removeImage}
                  >
                    <Icon icon="eva:close-fill" />
                  </button>
                </div>
              )}

              {fileError && (
                <Alert variant="danger" className="py-2 mt-2 small">
                  {fileError}
                </Alert>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!formValid}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribeModal;
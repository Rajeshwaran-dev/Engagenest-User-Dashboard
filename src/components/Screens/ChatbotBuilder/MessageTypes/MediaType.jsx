import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSnackbar } from "notistack";
import { OverlayTrigger, Tooltip, Alert } from "react-bootstrap";

const MediaType = ({
  formData,
  handleInputChange,
  handleBodyTextChange,
  handleAddVariable,
}) => {
  const [variableName, setVariableName] = useState("");
  const fileInputRef = useRef(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const handleAddVariableClick = () => {
    if (variableName.trim()) {
      handleAddVariable(variableName);
      setVariableName("");
    }
  };

  // Close emoji picker when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormatText = (format) => {
    const textarea = document.querySelector("textarea");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.bodyText.substring(start, end);
    let newText = formData.bodyText;

    switch (format) {
      case "bold":
        newText =
          formData.bodyText.substring(0, start) +
          `**${selectedText}**` +
          formData.bodyText.substring(end);
        break;
      case "italic":
        newText =
          formData.bodyText.substring(0, start) +
          `*${selectedText}*` +
          formData.bodyText.substring(end);
        break;
      default:
        break;
    }

    handleBodyTextChange(newText);
  };

  // Add emoji to text
  const onEmojiClick = (emojiObject) => {
    const textarea = document.querySelector("textarea");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newText =
      formData.bodyText.substring(0, start) +
      emojiObject.emoji +
      formData.bodyText.substring(end);

    handleBodyTextChange(newText);
    setEmojiOpen(false);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file format first
    const formatError = validateFileFormat(file, formData.mediaType);
    if (formatError) {
      setFileError(formatError);
      setUploadedFile(null);
      return;
    }

    // Check file size
    const maxSize = getMaxFileSize(formData.mediaType);
    if (file.size > maxSize) {
      setFileError(`File size must be less than ${formatFileSize(maxSize)}`);
      setUploadedFile(null);
      return;
    }

    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    });

    setFileError("");

    enqueueSnackbar(
      `File "${file.name}" uploaded successfully (${formatFileSize(file.size)})`,
      {
        variant: "success",
        autoHideDuration: 2000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      }
    );
  };

  // Handle file click to open in new tab (for images)
  const handleFileClick = (file) => {
    if (file && file.type.startsWith("image/")) {
      const fileUrl = URL.createObjectURL(file);
      window.open(fileUrl, "_blank");
      // Clean up the object URL after some time
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    enqueueSnackbar("File removed!", {
      variant: "success",
      autoHideDuration: 2000,
      anchorOrigin: {
        vertical: "top",
        horizontal: "right",
      },
    });
  };

  // Validate file format based on media type
  const validateFileFormat = (file, mediaType) => {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();

    switch (mediaType) {
      case "Image":
        const allowedImageFormats = ['png', 'jpg', 'jpeg'];
        if (!allowedImageFormats.includes(fileExtension)) {
          return `Only PNG, JPG, JPEG files are allowed for images. Your file: .${fileExtension}`;
        }
        break;

      case "Video":
        const allowedVideoFormats = ['mp4'];
        if (!allowedVideoFormats.includes(fileExtension)) {
          return `Only MP4 files are allowed for videos. Your file: .${fileExtension}`;
        }
        break;

      case "Document":
        const allowedDocumentFormats = ['pdf', 'doc', 'docx', 'csv', 'xls', 'xlsx'];
        if (!allowedDocumentFormats.includes(fileExtension)) {
          return `Only PDF, DOC, DOCX, CSV, XLS, XLSX files are allowed for documents. Your file: .${fileExtension}`;
        }
        break;

      default:
        return null;
    }

    return null;
  };

  const getMaxFileSize = (fileType) => {
    switch (fileType) {
      case "Image":
        return 5 * 1024 * 1024; // 5 MB
      case "Video":
        return 16 * 1024 * 1024; // 16 MB
      case "Document":
        return 16 * 1024 * 1024; // 16 MB
      default:
        return 5 * 1024 * 1024; // Default 5 MB
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileAcceptType = (mediaType) => {
    switch (mediaType) {
      case "Image":
        return ".png,.jpg,.jpeg";
      case "Video":
        return ".mp4";
      case "Document":
        return ".pdf,.doc,.docx,.csv,.xls,.xlsx";
      default:
        return "*";
    }
  };

  const getUploadButtonText = () => {
    const mediaType = formData.mediaType;
    const maxSizeMB = mediaType === "Image" ? 5 : 16;

    switch (mediaType) {
      case "Image":
        return `Choose Image (Max ${maxSizeMB}MB)`;
      case "Video":
        return `Choose Video (Max ${maxSizeMB}MB)`;
      case "Document":
        return `Choose File (Max ${maxSizeMB}MB)`;
      default:
        return "Upload File";
    }
  };

  // Tooltip for file upload info
  const renderFileTooltip = (props) => (
    <Tooltip id="file-info-tooltip" {...props}>
      Allowed types: {(formData.mediaType === "Image" ? "PNG, JPG, JPEG" :
        formData.mediaType === "Video" ? "MP4" :
          "PDF, DOC, DOCX, CSV, XLS, XLSX")}
      <br />
      Max size: {formData.mediaType === "Image" ? "5MB" : "16MB"}
    </Tooltip>
  );

  const renderMediaOptions = () => {
    const isDynamicDisabled =
      (formData.mediaType === "Image" && formData.imageSubType === "Dynamic") ||
      (formData.mediaType === "Video" && formData.videoSubType === "Dynamic") ||
      (formData.mediaType === "Document" &&
        formData.documentSubType === "Dynamic");

    return (
      <div className="media-options">
        <div className="form-group">
          <div className="type-heading-wrapper">
            <h6 className="text-center type-heading">Sub type</h6>
          </div>
          <div className="new-flex">
            <label>
              <input
                className="form-check-input form-round"
                type="radio"
                name="imageSubType"
                value="Static"
                checked={formData.imageSubType === "Static"}
                onChange={(e) =>
                  handleInputChange("imageSubType", e.target.value)
                }
              />
              Static
            </label>
            <label>
              <input
                className="form-check-input form-round"
                type="radio"
                name="imageSubType"
                value="Dynamic"
                checked={formData.imageSubType === "Dynamic"}
                onChange={(e) =>
                  handleInputChange("imageSubType", e.target.value)
                }
              />
              Dynamic
            </label>
          </div>
        </div>

        {/* File Upload Section - Updated to match SingleMsg style */}
        <div className="d-flex justify-content-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept={getFileAcceptType(formData.mediaType)}
          />

          <div className="d-flex flex-column align-items-start">
            <div className="d-flex align-items-center gap-3 mb-2">
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isDynamicDisabled}
                className="d-flex align-items-center gap-2 btn btn-secondary"
                style={{
                  borderRadius: "10px",
                  border: "1px solid #ced4da",
                  backgroundColor: "white",
                  fontWeight: "500",
                  padding: "10px 15px",
                  opacity: isDynamicDisabled ? 0.6 : 1,
                  cursor: isDynamicDisabled ? "not-allowed" : "pointer"
                }}
              >
                <Icon
                  style={{ fontSize: "20px" }}
                  icon="humbleicons:upload"
                />
                {getUploadButtonText()}
              </button>

              <div className="text-muted small d-flex align-items-center gap-1">
                <OverlayTrigger
                  placement="bottom"
                  trigger="click"
                  overlay={renderFileTooltip}
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

            {/* Error message positioned right below the upload button */}
            {fileError && (
              <Alert variant="danger" className="py-2 small mt-2 w-100">
                {fileError}
              </Alert>
            )}

            {uploadedFile && (
              <div
                className="selected-file-info d-flex align-items-center gap-2 p-2 border rounded bg-light mt-2"
                style={{ maxWidth: "fit-content" }}
              >
                <Icon
                  icon={
                    formData.mediaType === "Image"
                      ? "eva:image-fill"
                      : formData.mediaType === "Video"
                        ? "eva:video-fill"
                        : "eva:file-text-fill"
                  }
                  style={{ color: "#6c757d" }}
                />
                <span
                  className=""
                  onClick={() => handleFileClick(uploadedFile.file)}
                  style={{
                    cursor: uploadedFile.file.type.startsWith("image/")
                      ? "pointer"
                      : "default",
                    textDecoration: uploadedFile.file.type.startsWith("image/")
                      ? "underline"
                      : "none",
                    color: uploadedFile.file.type.startsWith("image/")
                      ? "#007bff"
                      : "inherit",
                    fontSize: "14px",
                  }}
                  title={
                    uploadedFile.file.type.startsWith("image/")
                      ? "Click to view image"
                      : ""
                  }
                >
                  {uploadedFile.name}
                </span>
                <button
                  type="button"
                  className="text-danger p-0 btn btn-link"
                  onClick={handleRemoveFile}
                  style={{ border: "none", background: "none" }}
                >
                  <Icon icon="eva:close-fill" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleMediaTypeChange = (type) => {
    handleInputChange("mediaType", type);
    setUploadedFile(null); // Reset uploaded file when media type changes
    setFileError(""); // Clear any file errors

    if (type === "Image" && !formData.imageSubType) {
      handleInputChange("imageSubType", "Static");
    } else if (type === "Video" && !formData.videoSubType) {
      handleInputChange("videoSubType", "Static");
    } else if (type === "Document" && !formData.documentSubType) {
      handleInputChange("documentSubType", "Static");
    }
  };

  return (
    <>
      <div className="form-group">
        <div className="type-heading-wrapper">
          <h6 className="text-center type-heading">Media</h6>
        </div>
        <div className="new-flex">
          <label>
            <input
              className="form-check-input form-round"
              type="radio"
              name="mediaType"
              value="Image"
              checked={formData.mediaType === "Image"}
              onChange={(e) => handleMediaTypeChange(e.target.value)}
            />
            Image
          </label>
          <label>
            <input
              className="form-check-input form-round"
              type="radio"
              name="mediaType"
              value="Video"
              checked={formData.mediaType === "Video"}
              onChange={(e) => handleMediaTypeChange(e.target.value)}
            />
            Video
          </label>
          <label>
            <input
              className="form-check-input form-round"
              type="radio"
              name="mediaType"
              value="Document"
              checked={formData.mediaType === "Document"}
              onChange={(e) => handleMediaTypeChange(e.target.value)}
            />
            Document
          </label>
        </div>
      </div>

      {formData.mediaType && (
        <div className="media-additional-options">{renderMediaOptions()}</div>
      )}

      <div className="form-group">
        <div className="type-heading-wrapper">
          <h6 className="type-heading">Caption</h6>
        </div>
        <div className="textarea-container">
          <div className="new-row">
            <div className="formatting-toolbar">
              <button
                type="button"
                className="format-btn"
                onClick={() => handleFormatText("bold")}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                className="format-btn"
                onClick={() => handleFormatText("italic")}
                title="Italic"
              >
                <em>𝑰</em>
              </button>
              <div className="emoji-wrapper" ref={emojiRef}>
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => setEmojiOpen((prev) => !prev)}
                  title="Insert Emoji"
                >
                  😊
                </button>

                {/* Emoji Popup */}
                {emojiOpen && (
                  <div className="emoji-popup">
                    <div className="emoji-popup-content">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        width="100%"
                        height="350px"
                        searchDisabled={false}
                        skinTonesDisabled={true}
                        previewConfig={{
                          showPreview: false,
                        }}
                      />
                    </div>
                    <div className="emoji-popup-arrow"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Inline variable input section */}
            <div
              className="variable-input-container"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginLeft: "10px",
              }}
            >
              <input
                type="text"
                value={variableName}
                onChange={(e) => setVariableName(e.target.value)}
                placeholder="Variable name"
                className="variable-input"
                style={{
                  padding: "6px 8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "14px",
                  width: "150px",
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && variableName.trim()) {
                    handleAddVariableClick();
                  }
                }}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddVariableClick}
                disabled={!variableName.trim()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 12px",
                }}
              >
                <Icon style={{ fontSize: "18px" }} icon="ic:baseline-plus" />
                Add Variable
              </button>
            </div>
          </div>

          <textarea
            style={{ height: "150px" }}
            rows="4"
            value={formData.bodyText}
            onChange={(e) => {
              if (e.target.value.length <= 950) {
                handleBodyTextChange(e.target.value);
              }
            }}
            maxLength={950}
            className="form-control"
          ></textarea>

          <small>{formData.bodyText.length} / 950</small>
        </div>
      </div>
    </>
  );
};

export default MediaType;
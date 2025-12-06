import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSnackbar } from "notistack";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";

const FileUploadModal = ({ fileType = "Picture", onClose, onUpload, fileSizeLimits = {}, allowedFileTypes = {} }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();

  const mapFileTypeToKey = (label) => {
    const mapping = {
      Picture: "image",
      Document: "document",
      Video: "video",
      Audio: "audio",
    };
    return mapping[label] || label.toLowerCase();
  };

  const getFileTypeKey = () => mapFileTypeToKey(fileType || "Document");

  const getAcceptType = () => {
    const key = getFileTypeKey();
    const conf = allowedFileTypes[key];
    if (!conf) return "*/*";
    // include both mime types and extensions for better compatibility
    const accept = [...(conf.mimeTypes || []), ...(conf.extensions || [])];
    return accept.join(",");
  };

  const getMaxSizeBytes = () => {
    const max = fileSizeLimits[getFileTypeKey()];
    // fallback to 5MB if not provided
    return max || 5 * 1024 * 1024;
  };

  const getMaxSizeLabel = () => {
    const mb = Math.round(getMaxSizeBytes() / (1024 * 1024));
    return `${mb}MB`;
  };

  const getAllowedExtensionsLabel = () => {
    const conf = allowedFileTypes[getFileTypeKey()];
    return conf && conf.extensions ? conf.extensions.join(", ") : "All";
  };

  // Create image previews if images chosen
  const createImagePreviews = (files) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setImagePreviews([]);
      return;
    }
    const previews = [];
    let loaded = 0;
    imageFiles.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews[i] = { file, preview: e.target.result };
        loaded += 1;
        if (loaded === imageFiles.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const validateFile = (file) => {
    if (!file) return false;
    const max = getMaxSizeBytes();
    if (file.size > max) {
      enqueueSnackbar(`${fileType} size should be less than ${getMaxSizeLabel()}`, { variant: "error", autoHideDuration: 3000 });
      return false;
    }
    const conf = allowedFileTypes[getFileTypeKey()];
    if (!conf) return true; // if no config, accept
    const ext = "." + file.name.split(".").pop().toLowerCase();
    const isMimeOk = (conf.mimeTypes || []).includes(file.type.toLowerCase());
    const isExtOk = (conf.extensions || []).includes(ext.toLowerCase());
    if (!isMimeOk && !isExtOk) {
      enqueueSnackbar(`Invalid ${fileType} file type. Allowed: ${conf.extensions.join(", ")}`, { variant: "error", autoHideDuration: 3500 });
      return false;
    }
    return true;
  };

  const handleFileSelect = (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const files = Array.from(filesList);
    const valid = files.filter(validateFile);
    if (valid.length === 0) {
      enqueueSnackbar("No valid files selected", { variant: "warning", autoHideDuration: 2000 });
      return;
    }

    // For single-file templates (non-picture), keep only first
    if (getFileTypeKey() !== "image") {
      setSelectedFiles([valid[0]]);
      createImagePreviews([valid[0]]);
      enqueueSnackbar(`Selected ${valid[0].name}`, { variant: "success", autoHideDuration: 1500 });
      return;
    }

    // For images allow multiple selection
    setSelectedFiles(valid);
    createImagePreviews(valid);
    enqueueSnackbar(`Selected ${valid.length} file(s)`, { variant: "success", autoHideDuration: 1500 });
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const openFileManager = () => fileInputRef.current?.click();

  const handleRemoveFileAt = (index) => {
    if (index == null) {
      setSelectedFiles([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    // remove preview too if exists
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    if (fileInputRef.current && newFiles.length === 0) fileInputRef.current.value = "";
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      enqueueSnackbar("Please select a file first", { variant: "error", autoHideDuration: 2000 });
      return;
    }
    onUpload(selectedFiles, caption);
  };

  // Tooltip that appears when clicking the info icon
  const fileInfoTooltip = (props) => (
    <Tooltip id="file-info-tooltip" {...props}>
      Allowed: <strong>{getAllowedExtensionsLabel()}</strong>
      <br />
    </Tooltip>
  );

  // If fileType is missing, show nothing (defensive)
  useEffect(() => {
    if (!fileType) {
      enqueueSnackbar("File type not specified", { variant: "error", autoHideDuration: 3000 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content file-upload-modal" style={modalStyle}>
        <div className="modal-header d-flex align-items-center justify-content-between" style={{ paddingBottom: 8 }}>
          <div className="d-flex align-items-center">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={fileTypeIconBox(getFileColor(fileType))}>
                <Icon icon={fileTypeIcon(fileType)} width="20" height="20" color={getFileColor(fileType)} />
              </div>
              <h5 style={{ margin: 0 }}>Upload {fileType}</h5>
            </div>
          </div>

          <button className="close-btn" onClick={onClose} style={closeBtnStyle}>
            <Icon icon="mingcute:close-line" width="18" height="18" />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "10px 20px 18px" }}>
          {/* compact "Choose" button + info icon (screenshot style) */}
          <div className="d-flex align-items-center mb-3" style={{ gap: 12 }}>
            <Button
              variant="light"
              onClick={openFileManager}
              style={{
                borderRadius: 12,
                border: "1px solid #3f2d65",
                backgroundColor: "white",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                minHeight: 42,
              }}
            >
              <Icon icon="humbleicons:upload" style={{ fontSize: 18 }} />
              <span style={{ fontWeight: 600 }}>{`Choose ${fileType} (Max ${getMaxSizeLabel()})`}</span>
            </Button>

            <OverlayTrigger placement="bottom" trigger="click" overlay={fileInfoTooltip} rootClose>
              <div style={{ cursor: "pointer" }}>
                <Icon icon="eva:info-outline" width="18" height="18" color="#6c757d" />
              </div>
            </OverlayTrigger>
          </div>

          {/* Drop zone (hidden but clickable) */}
          <div>
            {selectedFiles.length === 0 ? (
              <>
                
              </>
            ) : (
              // Show selected file(s) as link + remove X (like screenshot 4)
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                {selectedFiles.map((file, idx) => {
                  const isImage = file.type && file.type.startsWith("image/");
                  const onNameClick = () => {
                    if (isImage) {
                      const url = URL.createObjectURL(file);
                      window.open(url, "_blank");
                      setTimeout(() => URL.revokeObjectURL(url), 1500);
                    }
                  };
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon icon={isImage ? "eva:image-fill" : "eva:file-text-fill"} width="18" height="18" />
                        <a
                          onClick={onNameClick}
                          style={{
                            cursor: isImage ? "pointer" : "default",
                            textDecoration: isImage ? "underline" : "none",
                            color: isImage ? "#0d6efd" : "#333",
                            fontSize: 14,
                          }}
                          title={isImage ? "Click to view image" : file.name}
                        >
                          {file.name}
                        </a>
                      </div>

                      <button
                        onClick={() => handleRemoveFileAt(idx)}
                        style={{
                          marginLeft: 8,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#d9534f",
                        }}
                        title="Remove file"
                      >
                        <Icon icon="mingcute:close-line" width="18" height="18" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept={getAcceptType()}
            onChange={handleFileInputChange}
            multiple={getFileTypeKey() === "image"}
          />

          {/* Caption */}
          <div style={{ marginTop: 12 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Caption (optional)</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              style={{ width: "100%", minHeight: 64, padding: 10, borderRadius: 8, border: "1px solid #e9ecef" }}
            />
          </div>
        </div>

        <div className="modal-footer d-flex justify-content-end" style={{ gap: 8, padding: "12px 20px" }}>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleUpload} className="btn-primary" disabled={selectedFiles.length === 0}>
            Upload {fileType}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;

/* ----------------------- Styles & small helpers ----------------------- */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1050,
};

const modalStyle = {
  width: 720,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  overflow: "hidden",
};

const closeBtnStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: 6,
};

const secondaryBtnStyle = {
  background: "#fff",
  color: "#333",
  border: "1px solid #e6e6e6",
  borderRadius: 10,
  padding: "8px 14px",
  cursor: "pointer",
};

const fileTypeIconBox = (bg) => ({
  width: 36,
  height: 36,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: bg + "18",
});

function fileTypeIcon(label) {
  switch (label) {
    case "Picture":
      return "mdi:image-outline";
    case "Video":
      return "mdi:play-circle-outline";
    case "Audio":
      return "mdi:microphone-outline";
    case "Document":
    default:
      return "mdi:file-document-outline";
  }
}

function getFileColor(label) {
  switch (label) {
    case "Picture":
      return "#211f60";
    case "Video":
      return "#211f60";
    case "Audio":
      return "#211f60";
    default:
      return "#211f60";
  }
}

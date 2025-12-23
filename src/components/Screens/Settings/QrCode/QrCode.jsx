import React, { useState, useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSnackbar } from "notistack";

const WhatsAppQRGenerator = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [message, setMessage] = useState("");
  const [format, setFormat] = useState("PNG");
  const [qrHistory, setQrHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isQRGenerated, setIsQRGenerated] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);

  const qrRef = useRef(null);

  const handleGenerateQR = () => {
    if (!message.trim()) {
      enqueueSnackbar("Please enter a message for the QR code", { variant: "error" });
      return;
    }

    setIsGenerating(true);

    // Simulate generation process
    setTimeout(() => {
      const newQR = {
        id: Date.now(),
        message,
        format,
        timestamp: new Date().toLocaleString(),
        qrValue: `https://wa.me/?text=${encodeURIComponent(message)}`,
      };

      setQrHistory((prev) => [newQR, ...prev]);
      setIsGenerating(false);
      setIsQRGenerated(true);
      enqueueSnackbar("QR code generated successfully!", { variant: "success", autoHideDuration: 2000 });
    }, 1000);
  };

  const downloadQRCode = (qrData = null) => {
    const currentMessage = qrData ? qrData.message : message;
    const currentFormat = qrData ? qrData.format : format;
    const qrValue = qrData
      ? qrData.qrValue
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    if (currentFormat === "SVG") {
      // Create a new QRCodeSVG for download
      const svgWrapper = document.createElement("div");

      // Use qrcode.react to create SVG directly
      const { QRCodeSVG } = require("qrcode.react");
      const { renderToString } = require("react-dom/server");

      const svgElement = (
        <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={true} />
      );

      // For React 18, we need to use different approach
      const svgString = `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#FFFFFF"/>
        ${document.querySelector(".qr-code-wrapper svg")?.innerHTML || ""}
      </svg>
    `;

      const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement("a");
      link.download = `whatsapp-qr-${Date.now()}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      enqueueSnackbar("QR code downloaded as SVG!", { variant: "success" });
    } else {
      // For PNG - Use the existing QRCodeCanvas component
      if (currentFormat === "PNG") {
        // Find the canvas element in the current QR code
        const canvas = document.querySelector(".qr-code-wrapper canvas");
        if (canvas) {
          try {
            // Create a new canvas to ensure it's clean
            const newCanvas = document.createElement("canvas");
            const ctx = newCanvas.getContext("2d");
            newCanvas.width = canvas.width;
            newCanvas.height = canvas.height;

            // Fill white background
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

            // Draw the QR code from the existing canvas
            ctx.drawImage(canvas, 0, 0);

            // Convert to data URL and download
            const url = newCanvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `whatsapp-qr-${Date.now()}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            enqueueSnackbar("QR code downloaded as PNG!", { variant: "success" });
          } catch (error) {
            console.error("Error downloading PNG:", error);
            enqueueSnackbar("Error downloading PNG. Please try again.", { variant: "error" });
          }
        }
      }
    }
  };

  const copyQRCodeLink = (qrData = null) => {
    const qrValue = qrData
      ? qrData.qrValue
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    navigator.clipboard
      .writeText(qrValue)
      .then(() => {
        if (qrData) {
          // For history items
          setCopiedId(qrData.id);
          setTimeout(() => setCopiedId(null), 2000);
          enqueueSnackbar("QR code link copied to clipboard!", { variant: "success" });
        } else {
          // For current QR code
          enqueueSnackbar("QR code link copied to clipboard!", { variant: "success" });
        }
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        enqueueSnackbar("Failed to copy QR code link", { variant: "error" });
      });
  };

  // Edit functions with modal
  const handleEdit = (qr) => {
    setSelectedQr(qr);
    setEditMessage(qr.message);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedQr) return;

    setQrHistory((prev) =>
      prev.map((qr) => (qr.id === selectedQr.id ? { ...qr, message: editMessage } : qr))
    );
    setShowEditModal(false);
    setSelectedQr(null);
    setEditMessage("");
    enqueueSnackbar("QR code message updated successfully!", { variant: "success" });
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setSelectedQr(null);
    setEditMessage("");
  };

  // Delete functions with modal
  const handleDelete = (qr) => {
    setSelectedQr(qr);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedQr) return;

    setQrHistory((prev) => prev.filter((qr) => qr.id !== selectedQr.id));
    setShowDeleteModal(false);
    setSelectedQr(null);
    enqueueSnackbar("QR code deleted successfully!", { variant: "success" });
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedQr(null);
  };

  const handleHistoryDownload = (qr) => {
    downloadQRCode(qr);
  };

  const renderQRCode = () => {
    if (!message || !isQRGenerated) return null;

    const qrValue = `https://wa.me/?text=${encodeURIComponent(message)}`;

    return (
      <div className="qr-code-wrapper">
        {format === "SVG" ? (
          <QRCodeSVG
            value={qrValue}
            size={200}
            level="H"
            includeMargin={true}
          />
        ) : (
          <QRCodeCanvas
            value={qrValue}
            size={200}
            level="H"
            includeMargin={true}
          />
        )}
      </div>
    );
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    setIsQRGenerated(false);
  };

  return (
    <>
      <Breadcrumb title="QR Code" />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this QR code?</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={cancelDelete}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={confirmDelete}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-backdrop show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Message</h5>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      rows="4"
                      placeholder="Enter your message here..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveEdit}
                    disabled={!editMessage.trim()}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container-fluid qr-generator-container">
        {/* First Row: Generation Form and QR Preview */}
        <div className="row">
          {/* Left Panel - QR Generation Form */}
          <div className="col-xxl-8 col-lg-8 col-md-7">
            <div className="card generation-card h-100">
              <div className="card-header">
                <h5 className="card-title">Generate WhatsApp QR Code</h5>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="messageInput" className="form-label color-change">
                    Enter Message
                  </label>
                  <input
                    id="messageInput"
                    className="form-control message-input"
                    placeholder="Enter message for QR"
                    value={message}
                    onChange={handleMessageChange}
                    rows="4"
                  />
                </div>

                {/* Format Selection */}
                <div className="form-group mt-3">
                  <label htmlFor="formatSelect" className="form-label color-change">
                    Select Format
                  </label>
                  <select
                    id="formatSelect"
                    className="form-select"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option value="PNG">PNG</option>
                    <option value="SVG">SVG</option>
                  </select>
                </div>

                {/* Generate Button for larger screens - hidden on medium and small */}
                <div className="text-center mt-4 d-none d-lg-block">
                  <button style={{ marginTop: "20px" }}
                    className="btn-primary"
                    onClick={handleGenerateQR}
                    disabled={isGenerating || !message.trim()}
                  >
                    <Icon
                      style={{ marginRight: "10px", fontSize: "20px" }}
                      icon="ic:baseline-qrcode"
                    />
                    {isGenerating ? "Generating..." : "Generate QR Code"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - QR Preview and Controls */}
          <div className="col-xxl-4 col-lg-4 col-md-5">
            <div className="card qr-preview-card h-100">
              <div className="card-header">
                <h5 className="card-title">Generated QR Code</h5>
              </div>
              <div className="card-body text-center">
                <div className="qr-preview-container" ref={qrRef}>
                  {isQRGenerated ? (
                    <div className="qr-code-wrapper">
                      {renderQRCode()}

                      {/* Download and Copy Buttons */}
                      <div className="mt-4">
                        <div className="row g-2 align-items-center justify-content-center">
                          <div className="col-8" style={{ width: "180px" }}>
                            <button
                              className="btn-secondary"
                              onClick={() => downloadQRCode()}
                            >
                              <Icon
                                icon="mdi:download"
                                style={{ marginRight: "5px", fontSize: "20px" }}
                              />
                              Download {format}
                            </button>
                          </div>
                          <div className="col-3">
                            <button
                              className="btn-primary w-100"
                              onClick={() => copyQRCodeLink()}
                            >
                              <Icon
                                icon="mdi:content-copy"
                                style={{ fontSize: "16px" }}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Icon
                        icon="icomoon-free:qrcode"
                        style={{
                          fontSize: "48px",
                          color: "#6c757d",
                          marginBottom: "16px",
                        }}
                      />
                      <div className="placeholder-text text-muted">
                        {message
                          ? "Click 'Generate QR Code' to create QR"
                          : "Generated QR code will appear here"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Generate Button for medium and small screens - hidden on large */}
                <div className="text-center mt-4 d-block d-lg-none">
                  <button
                    className="btn-primary"
                    onClick={handleGenerateQR}
                    disabled={isGenerating || !message.trim()}
                  >
                    <Icon
                      style={{ marginRight: "10px", fontSize: "20px" }}
                      icon="ic:baseline-qrcode"
                    />
                    {isGenerating ? "Generating..." : "Generate QR Code"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row: QR Code History - Full Width */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card history-card" style={{ marginTop: "20px" }}>
              <div className="card-header">
                <h5 className="card-title">QR Code History</h5>
              </div>
              <div className="card-body">
                {qrHistory.length === 0 ? (
                  <div className="empty-history text-center py-4">
                    <Icon
                      icon="mdi:history"
                      style={{
                        fontSize: "48px",
                        color: "#6c757d",
                        marginBottom: "16px",
                      }}
                    />
                    <p className="text-muted">No QR codes generated yet</p>
                  </div>
                ) : (
                  <div className="row">
                    {qrHistory.map((qr) => (
                      <div key={qr.id} className="col-lg-3 col-md-6 mb-4">
                        <div className="card history-item-card h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-subtitle text-primary small">
                                Message
                              </h6>
                              <span className="badge bg-secondary">
                                {qr.format}
                              </span>
                            </div>

                            <p className="card-text history-message">
                              {qr.message}
                            </p>

                            <div className="history-details mt-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted timestamp">
                                  {qr.timestamp}
                                </small>
                                {copiedId === qr.id && (
                                  <small className="text-success">
                                    Copied!
                                  </small>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 d-flex justify-content-between">
                              <button
                                style={{
                                  border: "1px solid",
                                  padding: "8px",
                                  fontSize: "14px",
                                }}
                                className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                onClick={() => copyQRCodeLink(qr)}
                                title="Copy QR Link"
                              >
                                <Icon style={{ fontSize: "18px" }} icon="mdi:content-copy" />
                              </button>
                              <button
                                style={{
                                  border: "1px solid",
                                  padding: "8px",
                                  fontSize: "14px",
                                }}
                                className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                onClick={() => handleEdit(qr)}
                                title="Edit"
                              >
                                <Icon style={{ fontSize: "18px" }} icon="mdi:pencil" />
                              </button>
                              <button
                                style={{
                                  border: "1px solid",
                                  padding: "8px",
                                  fontSize: "14px",
                                }}
                                className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                onClick={() => handleHistoryDownload(qr)}
                                title="Download"
                              >
                                <Icon style={{ fontSize: "18px" }} icon="mdi:download" />
                              </button>
                              <button
                                style={{
                                  border: "1px solid",
                                  padding: "8px",
                                  fontSize: "14px",
                                }}
                                className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                onClick={() => handleDelete(qr)}
                                title="Delete"
                              >
                                <Icon style={{ fontSize: "18px" }} icon="mdi:delete" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WhatsAppQRGenerator;
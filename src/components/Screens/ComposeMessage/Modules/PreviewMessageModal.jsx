import React, { useState, useEffect, useRef } from "react";
import { EyeSlash, X, ArrowsOutSimple } from "@phosphor-icons/react";
import "./../../ManageTemplate/ManageTemplate.css";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";
import { Eye } from "feather-icons-react";

export default function PreviewMessageModal({
  onClose,
  previewData = {},
  onSendNow,
  onSchedule,
  messageType = "immediate",
}) {
  const [videoLoading, setVideoLoading] = useState(false);
  const [currentCarouselSlide, setCurrentCarouselSlide] = useState(0);
  const videoRef = useRef(null);

  const handleVideoLoadStart = () => {
    setVideoLoading(true);
  };

  const handleVideoLoadedData = () => {
    setVideoLoading(false);
  };

  const handleVideoError = () => {
    setVideoLoading(false);
    console.error('Video failed to load');
  };

  const videoProps = {
    preload: "metadata",
    onLoadStart: handleVideoLoadStart,
    onLoadedData: handleVideoLoadedData,
    onError: handleVideoError,
    ref: videoRef
  };

  const { enqueueSnackbar } = useSnackbar();
  const [showMessageContent, setShowMessageContent] = useState(true);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [showFullScreenVideo, setShowFullScreenVideo] = useState(false);
  const [fullScreenVideo, setFullScreenVideo] = useState(null);
  const [estimatedCredits, setEstimatedCredits] = useState(0);
  const [recipientCount, setRecipientCount] = useState(1);

  // Create phone numbers array from preview data
  const phoneNumbers = [
    {
      id: 1,
      phone: previewData.phoneNumber || "91998477827",
      message: previewData.messageContent || "",
    },
  ];

  const creditConfig = {
    baseMessageCost: 1,
    mediaMultipliers: {
      text: 1,
      image: 2,
      video: 3,
      document: 1.5,
    },
    characterThreshold: 160,
    segmentMultiplier: 1,
  };

  const calculateEstimatedCredits = () => {
    if (!previewData) return 0;

    const messageContent = previewData.messageContent || "";
    const templateType = previewData.templateType || "text";

    let baseCost = creditConfig.baseMessageCost * creditConfig.mediaMultipliers[templateType] || creditConfig.mediaMultipliers.text;

    if (messageContent.length > 0) {
      const segments = Math.ceil(messageContent.length / creditConfig.characterThreshold);
      if (segments > 1) {
        baseCost += (segments - 1) * creditConfig.segmentMultiplier;
      }
    }

    const totalCost = baseCost * phoneNumbers.length;
    return Math.max(totalCost, creditConfig.baseMessageCost);
  };

  useEffect(() => {
    const credits = calculateEstimatedCredits();
    setEstimatedCredits(credits);
    setRecipientCount(phoneNumbers.length);
  }, [previewData, phoneNumbers.length]);

  // ✅ FIXED: Proper variable replacement for preview
  const getDisplayMessageContent = () => {
    return previewData.messageContent || "No message content available";
  };

  const displayMessageContent = getDisplayMessageContent();

  const renderCarouselPreview = () => {
    if (!previewData.carouselFiles || Object.keys(previewData.carouselFiles).length === 0) {
      return (
        <div className="placeholder-text">
          No carousel items uploaded
        </div>
      );
    }

    const carouselItems = Object.values(previewData.carouselFiles);
    const carouselVariableNames = Object.keys(previewData.carouselFiles);

    return (
      <div className="carousel-preview">
        <div className="carousel-container position-relative">
          <div className="carousel-slides">
            {carouselItems.map((file, index) => (
              <div
                key={index}
                className={`carousel-slide ${index === currentCarouselSlide ? 'active' : ''}`}
              >
                {file.type.startsWith('image/') ? (
                  <div className="carousel-image-container position-relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Carousel item ${index + 1}`}
                      className="carousel-image"
                      style={{
                        width: '100%',
                        borderRadius: '8px',
                        maxHeight: '300px',
                        objectFit: 'contain'
                      }}
                    />
                    <div
                      className="carousel-full-screen-icon"
                      onClick={() => openFullScreenImage(file)}
                    >
                      <ArrowsOutSimple size={16} color="white" />
                    </div>
                    <div className="carousel-slide-label">
                      {carouselVariableNames[index]}
                    </div>
                  </div>
                ) : file.type.startsWith('video/') ? (
                  <div className="carousel-video-container position-relative">
                    <video
                      loop
                      controls
                      className="carousel-video"
                      style={{
                        width: '100%',
                        borderRadius: '8px',
                        maxHeight: '300px',
                        backgroundColor: '#000'
                      }}
                    >
                      <source src={URL.createObjectURL(file)} type={file.type} />
                      Your browser does not support the video tag.
                    </video>
                    <div
                      className="carousel-full-screen-icon"
                      onClick={() => openFullScreenVideo(file)}
                    >
                      <ArrowsOutSimple size={16} color="white" />
                    </div>
                    <div className="carousel-slide-label">
                      {carouselVariableNames[index]}
                    </div>
                  </div>
                ) : (
                  <div className="carousel-unknown-file">
                    <Icon icon="eva:file-fill" style={{ fontSize: "48px", color: "#6c757d" }} />
                    <div className="carousel-slide-label">
                      {carouselVariableNames[index]}
                    </div>
                    <small>Unsupported file type</small>
                  </div>
                )}
              </div>
            ))}
          </div>

          {carouselItems.length > 1 && (
            <>
              <button
                className="carousel-nav carousel-prev"
                onClick={() => setCurrentCarouselSlide(prev =>
                  prev === 0 ? carouselItems.length - 1 : prev - 1
                )}
              >
                <Icon icon="eva:arrow-ios-back-fill" />
              </button>
              <button
                className="carousel-nav carousel-next"
                onClick={() => setCurrentCarouselSlide(prev =>
                  prev === carouselItems.length - 1 ? 0 : prev + 1
                )}
              >
                <Icon icon="eva:arrow-ios-forward-fill" />
              </button>

              <div className="carousel-indicators">
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    className={`carousel-indicator ${index === currentCarouselSlide ? 'active' : ''}`}
                    onClick={() => setCurrentCarouselSlide(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ✅ FIXED: Use the properly processed message content */}
        {displayMessageContent && (
          <div className="carousel-message-text mt-3 p-2 border rounded">
            <div className="message-text">
              {displayMessageContent
                .split("\n")
                .map((line, i) => (
                  <div key={i}>{line || "\u00A0"}</div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSendConfirm = () => {
    if (messageType === "scheduled") {
      onSchedule();
      enqueueSnackbar("Message scheduled successfully!", {
        variant: "success",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
    } else {
      onSendNow();
      enqueueSnackbar("Message sent successfully!", {
        variant: "success",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
    }
    onClose();
  };

  const toggleMessageContent = () => {
    setShowMessageContent(!showMessageContent);
  };

  const openFullScreenImage = (file) => {
    if (file && (file.type.startsWith('image/') || previewData.templateType === "image")) {
      setFullScreenImage(URL.createObjectURL(file));
      setShowFullScreenImage(true);
    }
  };

  const openFullScreenVideo = (file) => {
    if (file && (file.type.startsWith('video/') || previewData.templateType === "video")) {
      setFullScreenVideo(URL.createObjectURL(file));
      setShowFullScreenVideo(true);
    }
  };

  const closeFullScreenImage = () => {
    setShowFullScreenImage(false);
    setFullScreenImage(null);
  };

  const closeFullScreenVideo = () => {
    setShowFullScreenVideo(false);
    setFullScreenVideo(null);
  };

  const renderFilePreview = () => {
    if (!previewData.attachedFile) return null;

    const file = previewData.attachedFile;
    const fileType = previewData.templateType || getFileType(file);

    if (fileType === "image") {
      return (
        <div className="file-preview image-preview">
          <div className="image-preview-container position-relative">
            <img
              src={URL.createObjectURL(file)}
              alt="Attachment"
              className="preview-image"
              onClick={() => openFullScreenImage(file)}
              style={{ cursor: 'pointer' }}
            />
            <div
              className="full-screen-icon-overlay"
              onClick={() => openFullScreenImage(file)}
            >
              <ArrowsOutSimple size={20} color="white" />
            </div>
          </div>
          <div className="file-info d-flex justify-content-between align-items-center mt-2">
            <small>{file.name}</small>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => openFullScreenImage(file)}
            >
              <ArrowsOutSimple size={14} className="me-1" />
              Full Screen
            </button>
          </div>
        </div>
      );
    } else if (fileType === "video") {
      return (
        <div className="file-preview video-preview">
          <div className="video-preview-container position-relative">
            <video loop controls className="preview-video">
              <source src={URL.createObjectURL(file)} type={file.type} />
              Your browser does not support the video tag.
            </video>
            <div
              className="full-screen-icon-overlay"
              onClick={() => openFullScreenVideo(file)}
            >
              <ArrowsOutSimple size={20} color="white" />
            </div>
          </div>
          <div className="file-info d-flex justify-content-between align-items-center mt-2">
            <small>{file.name}</small>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => openFullScreenVideo(file)}
            >
              <ArrowsOutSimple size={14} className="me-1" />
              Full Screen
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="file-preview document-preview">
          <div className="document-icon">
            <Icon icon="eva:file-text-fill" style={{ fontSize: "48px", color: "#6c757d" }} />
          </div>
          <div className="file-info">
            <small>{file.name}</small>
            <br />
            <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
          </div>
        </div>
      );
    }
  };

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return "image";
    if (file.type.startsWith('video/')) return "video";
    return "document";
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "1200px" }}>
        <div className="modal-header">
          <div className="d-flex align-items-center justify-content-between w-100">
            <h3 className="modal-title align-items-center">
              <Icon
                className="modal-icon-adjustments"
                icon="tabler:template"
              />
              Message Preview
            </h3>

            <button onClick={onClose} className="modal-close-btn d-flex align-items-center">
              <div className="d-flex align-items-center" style={{ marginRight: "24px" }}>
                <strong style={{ fontSize: "18px" }}>Estimated Charge : </strong>
                <span className="ms-2 text-primary fw-bold">{estimatedCredits}</span>
              </div>
              <X size={24} />
            </button>

          </div>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            {/* Form Section */}
            <div className="form-section">
              <div className="form-card">
                <div className="card basic-data-table">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table bordered-table mb-0">
                        <thead>
                          <tr>
                            <th scope="col">
                              <div className="form-check style-check d-flex align-items-center">
                                <label className="form-check-label">
                                  S.No.
                                </label>
                              </div>
                            </th>
                            <th scope="col">Phone Number</th>
                            <th scope="col">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {phoneNumbers.map((item, index) => (
                            <tr key={item.id}>
                              <td>
                                <div className="form-check style-check d-flex align-items-center">
                                  <label className="form-check-label">
                                    {String(index + 1).padStart(2, "0")}
                                  </label>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {item.phone}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex">
                                  <button
                                    onClick={toggleMessageContent}
                                    className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                                    style={{ cursor: "pointer" }}
                                  >
                                    {showMessageContent ? (
                                      <EyeSlash size={16} />
                                    ) : (
                                      <Eye size={16} />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4 gap-3">
                      <div className="text-muted small" style={{ marginTop: "20px" }}>
                        <Icon style={{ fontSize: "24px", marginRight: "6px", color: "red" }} icon="fe:info" />
                        Cost will be deducted from your account balance
                      </div>
                      <button style={{ marginTop: "20px" }}
                        onClick={handleSendConfirm}
                        className="btn-primary"
                      >
                        {messageType === "scheduled"
                          ? "Confirm Schedule"
                          : "Send Now"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="preview-section">
              <div className="preview-header">
                <h5 className="preview-title">Preview</h5>
              </div>

              <div className="preview-container">
                <div className="phone-frame">
                  <div className="phone-notch" />
                  <div className="phone-screen">
                    <div className="phone-status-bar" />
                    <div className="phone-content">
                      {previewData.templateType === "carousel" ? (
                        renderCarouselPreview()
                      ) : showMessageContent ? (
                        displayMessageContent ? (
                          <>
                            {previewData.attachedFile && previewData.templateType === "image" && (
                              <div className="message-image-preview position-relative">
                                <img
                                  src={URL.createObjectURL(previewData.attachedFile)}
                                  alt="Attachment"
                                  className="message-image"
                                  style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px' }}
                                  onClick={() => openFullScreenImage(previewData.attachedFile)}
                                />
                                <div
                                  className="message-full-screen-icon"
                                  onClick={() => openFullScreenImage(previewData.attachedFile)}
                                >
                                  <ArrowsOutSimple size={16} color="white" />
                                </div>
                              </div>
                            )}

                            {previewData.attachedFile && previewData.templateType === "video" && (
                              <div className="message-video-preview position-relative">
                                <video loop {...videoProps}
                                  controls
                                  className="message-video"
                                  style={{
                                    maxWidth: '100%',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    backgroundColor: '#000'
                                  }}
                                >
                                  <source src={URL.createObjectURL(previewData.attachedFile)} type={previewData.attachedFile.type} />
                                  Your browser does not support the video tag.
                                </video>
                                <div
                                  className="message-full-screen-icon"
                                  onClick={() => openFullScreenVideo(previewData.attachedFile)}
                                >
                                  <ArrowsOutSimple size={16} color="white" />
                                </div>
                              </div>
                            )}

                            {/* ✅ FIXED: This will now show the message with variables replaced */}
                            <div className="message-text">
                              {displayMessageContent
                                .split("\n")
                                .map((line, i) => (
                                  <div key={i}>{line || "\u00A0"}</div>
                                ))}
                            </div>

                            {previewData.attachedFile && previewData.templateType === "document" && (
                              <div className="message-file-attachment">
                                <div className="file-attachment-info p-2 border rounded mt-2">
                                  <Icon
                                    icon="eva:file-text-fill"
                                    style={{ color: "#6c757d", marginRight: '8px' }}
                                  />
                                  <span className="small">{previewData.attachedFile.name}</span>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="placeholder-text">
                            Message preview appears here
                          </div>
                        )
                      ) : (
                        <div className="placeholder-text">
                          Message content is hidden
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {showFullScreenImage && (
        <div className="full-screen-image-modal">
          <div className="full-screen-image-overlay" onClick={closeFullScreenImage}>
            <button className="full-screen-close-btn" onClick={closeFullScreenImage}>
              <Icon icon="material-symbols:close-rounded" />
            </button>
            <div className="full-screen-image-container" onClick={(e) => e.stopPropagation()}>
              <img
                src={fullScreenImage}
                alt="Full screen preview"
                className="full-screen-image"
              />
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Video Modal */}
      {showFullScreenVideo && (
        <div className="full-screen-video-modal">
          <div className="full-screen-video-overlay" onClick={closeFullScreenVideo}>
            <button className="full-screen-close-btn" onClick={closeFullScreenVideo}>
              <Icon icon="material-symbols:close-rounded" />
            </button>
            <div className="full-screen-video-container" onClick={(e) => e.stopPropagation()}>
              <video loop
                controls
                autoPlay
                className="full-screen-video"
              >
                <source src={fullScreenVideo} type={previewData.attachedFile?.type} />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React from "react";
import { X } from "@phosphor-icons/react";
import "./../ManageTemplate.css";
import { Icon } from "@iconify/react/dist/iconify.js";

const ViewTemplateModal = ({ template, onClose }) => {
  // Function to render carousel preview
  const renderCarouselPreview = () => {
    if (!template.carouselItems || template.carouselItems.length === 0) {
      return null;
    }

    return (
      <div className="mobile-carousel-preview">

        {/* Carousel container with navigation */}
        <div className="carousel-container">
          {/* Left Arrow - Show only if there are multiple items */}
          {template.carouselItems.length > 1 && (
            <button
              className="carousel-arrow carousel-arrow-left"
              onClick={(e) => {
                e.stopPropagation();
                const container = e.target
                  .closest(".carousel-container")
                  .querySelector(".carousel-items-wrapper");
                container.scrollBy({ left: -188, behavior: "smooth" });
              }}
              title="Previous"
            >
              ‹
            </button>
          )}

          {/* Carousel Items Wrapper */}
          <div className="carousel-items-wrapper">
            {template.carouselItems.map((item, index) => (
              <div key={item.id || index} className="mobile-carousel-item">
                {template.carouselType === "Image" ||
                template.templateType === "Carousel" ? (
                  <img
                    src={item.preview || item.filePreview}
                    alt={`Carousel item ${index + 1}`}
                    className="mobile-preview-image"
                    onError={(e) => {
                      console.error(
                        "Carousel image failed to load:",
                        item.preview
                      );
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <video controls className="mobile-preview-video">
                    <source
                      src={item.preview || item.filePreview}
                      type={item.file?.type}
                    />
                    Your browser does not support the video tag.
                  </video>
                )}

                {/* Item details */}
                <div>
                  {/* {item.headerText && (
                    <div className="carousel-item-header">
                      {item.headerText}
                    </div>
                  )} */}
                  {item.body && (
                    <div className="carousel-item-description">{item.body}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow - Show only if there are multiple items */}
          {template.carouselItems.length > 1 && (
            <button
              className="carousel-arrow carousel-arrow-right"
              onClick={(e) => {
                e.stopPropagation();
                const container = e.target
                  .closest(".carousel-container")
                  .querySelector(".carousel-items-wrapper");
                container.scrollBy({ left: 188, behavior: "smooth" });
              }}
              title="Next"
            >
              ›
            </button>
          )}
        </div>

        {/* Carousel navigation dots */}
        {/* {template.carouselItems.length > 1 && (
          <div className="carousel-dots">
            {template.carouselItems.map((_, index) => (
              <div
                key={index}
                className={`carousel-dot ${index === 0 ? "active" : ""}`}
              />
            ))}
          </div>
        )} */}
      </div>
    );
  };

  // Improved function to render file preview for non-carousel templates
  const renderFilePreview = () => {
    console.log("=== VIEW MODAL FILE DATA ===", {
      templateType: template.templateType,
      type: template.type,
      fileType: template.fileType,
      filePreview: template.filePreview,
      selectedFile: template.selectedFile,
      carouselItems: template.carouselItems,
      carouselType: template.carouselType,
    });

    // If it's a carousel template, use the carousel preview
    if (
      template.templateType === "Carousel" &&
      template.carouselItems &&
      template.carouselItems.length > 0
    ) {
      return renderCarouselPreview();
    }

    // Determine file type with fallbacks for non-carousel templates
    const detectedFileType =
      template.fileType ||
      (template.templateType?.toLowerCase() === "image"
        ? "image"
        : template.templateType?.toLowerCase() === "video"
        ? "video"
        : template.templateType?.toLowerCase() === "file"
        ? "file"
        : template.type?.toLowerCase() === "image"
        ? "image"
        : template.type?.toLowerCase() === "video"
        ? "video"
        : template.type?.toLowerCase() === "file"
        ? "file"
        : "");

    console.log("Detected file type:", detectedFileType);

    // Check if we have any file data
    const hasFileData = template.filePreview || template.selectedFile;

    if (!hasFileData) {
      console.log("No file data available for preview");
      return null;
    }

    if (detectedFileType === "image" && template.filePreview) {
      return (
        <div className="mobile-file-preview">
          <img
            src={template.filePreview}
            alt="Attachment"
            className="mobile-preview-image"
            onError={(e) => {
              console.error("Image failed to load:", template.filePreview);
              e.target.style.display = "none";
            }}
          />
        </div>
      );
    }

    if (detectedFileType === "video" && template.filePreview) {
      return (
        <div className="mobile-file-preview">
          <video
            controls
            className="mobile-preview-video"
            onError={(e) => {
              console.error("Video failed to load:", template.filePreview);
              e.target.style.display = "none";
            }}
          >
            <source
              src={template.filePreview}
              type={template.selectedFile?.type || "video/mp4"}
            />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (
      detectedFileType === "file" &&
      (template.selectedFile || template.filePreview)
    ) {
      return (
        <div className="mobile-document-preview">
          <Icon
            icon="eva:file-text-fill"
            style={{ fontSize: "32px", color: "#6c757d" }}
          />
          <div className="mobile-file-name">
            {template.selectedFile?.name || "Document"}
          </div>
        </div>
      );
    }

    // Fallback: if we have filePreview but no specific type, try to display as image
    if (template.filePreview && !detectedFileType) {
      return (
        <div className="mobile-file-preview">
          <img
            src={template.filePreview}
            alt="Attachment"
            className="mobile-preview-image"
            onError={(e) => {
              console.error(
                "Fallback image failed to load:",
                template.filePreview
              );
              e.target.style.display = "none";
            }}
          />
        </div>
      );
    }

    return null;
  };

  // Render carousel interactive buttons
  const renderCarouselButtons = () => {
    if (!template.carouselInteractiveData || !template.carouselButtons) {
      return null;
    }

    const enabledButtons = template.carouselButtons.filter(
      (btn) => btn.enabled
    );

    return (
      <div style={{ padding: "12px 20px", borderTop: "1px solid #eee" }}>
        {enabledButtons.map((button, index) => {
          const data = template.carouselInteractiveData[button.type];
          if (!data) return null;

          let buttonContent = null;

          switch (button.type) {
            case "quickReply":
              buttonContent = (
                <div
                  style={{
                    padding: "10px",
                    backgroundColor: "#e8f5e8",
                    borderRadius: "6px",
                    marginBottom: "8px",
                    textAlign: "center",
                    color: "#2e7d32",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  💬 {data.title}
                </div>
              );
              break;

            case "callToAction":
              buttonContent = (
                <div
                  style={{
                    padding: "10px",
                    backgroundColor: "#e3f2fd",
                    borderRadius: "6px",
                    marginBottom: "8px",
                    textAlign: "center",
                    color: "#1976d2",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  📞 {data.title}
                </div>
              );
              break;

            case "url":
              buttonContent = (
                <div
                  style={{
                    padding: "10px",
                    backgroundColor: "#fff3e0",
                    borderRadius: "6px",
                    marginBottom: "8px",
                    textAlign: "center",
                    color: "#f57c00",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  🔗 {data.title}
                </div>
              );
              break;

            default:
              return null;
          }

          return <div key={index}>{buttonContent}</div>;
        })}
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: "500px" }}>
        <div className="modal-header">
          <h3 className="modal-title">Template Preview</h3>
          <button type="button" className="btn-close" onClick={onClose}>
            <Icon icon="mingcute:close-line" />
          </button>
        </div>
        <div className="modal-body">
          <div style={{ display: "flex", justifyContent: "center" }}>
            {/* Mobile Phone Frame */}
            <div className="phone-frame">
              <div className="phone-notch" />

              <div className="phone-screen1">
                <div className="phone-status-bar" />

                <div className="phone-content">
                  {/* File Preview - for both carousel and regular templates */}
                  {renderFilePreview()}

                  {/* Message Body */}
                  <div className="chat-back">
                    {template.body ? (
                      template.body
                        .split("\n")
                        .map((line, i) => <div key={i}>{line || "\u00A0"}</div>)
                    ) : (
                      <div className="placeholder-text">No message content</div>
                    )}
                  </div>

                  {/* Carousel Interactive Buttons */}
                  {template.templateType === "Carousel" &&
                    renderCarouselButtons()}

                  {/* Regular Interactive Elements for non-carousel templates */}
                  {template.templateType !== "Carousel" &&
                    template.ctaList &&
                    template.ctaList.length > 0 && (
                      <div
                        style={{
                          padding: "12px 20px",
                          borderTop: "1px solid #eee",
                        }}
                      >
                        {template.ctaList.map((cta, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: "10px",
                              backgroundColor: "#e3f2fd",
                              borderRadius: "6px",
                              marginBottom: "8px",
                              textAlign: "center",
                              color: "#1976d2",
                              fontSize: "14px",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                            }}
                          >
                            🔗 {cta.buttonName || cta.title}
                          </div>
                        ))}
                      </div>
                    )}

                  {template.templateType !== "Carousel" &&
                    template.quickReplies &&
                    template.quickReplies.length > 0 && (
                      <div
                        style={{
                          padding: "12px 20px",
                          borderTop: "1px solid #eee",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {template.quickReplies.map((reply, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#f5f5f5",
                              border: "1px solid #ddd",
                              borderRadius: "16px",
                              fontSize: "12px",
                              color: "#333",
                            }}
                          >
                            {reply}
                          </div>
                        ))}
                      </div>
                    )}

                  {template.templateFooter && (
                    <div className="phone-footer">
                      {template.templateFooter}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTemplateModal;

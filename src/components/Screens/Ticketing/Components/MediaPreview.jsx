import React, { useState } from "react";

// Static media URLs for testing
const STATIC_MEDIA_URLS = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
];

const MediaPreview = ({ url, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  const isImage = url => {
    if (!url) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    return imageExtensions.some(ext => 
      url.toLowerCase().includes(ext) || 
      url.toLowerCase().includes("unsplash") || 
      url.toLowerCase().includes("images.")
    );
  };

  const isVideo = url => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".avi", ".mov", ".webm"];
    return videoExtensions.some(ext => 
      url.toLowerCase().includes(ext) || 
      url.toLowerCase().includes("video") ||
      url.toLowerCase().includes("gtv-videos-bucket")
    );
  };

  const handleMouseMove = e => {
    setPreviewPosition({ 
      x: Math.min(e.clientX + 10, window.innerWidth - 320),
      y: Math.min(e.clientY + 10, window.innerHeight - 220)
    });
  };

  const getFileName = (url) => {
    if (!url) return "Media";
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const fileName = path.substring(path.lastIndexOf('/') + 1);
      return fileName || "Media";
    } catch {
      return "Media";
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block", margin: "4px" }}>
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        style={{
          fontSize: "12px",
          color: "#1890ff",
          textDecoration: "underline",
          cursor: "pointer",
          padding: "6px 12px",
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          backgroundColor: "#fafafa",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={e => {
          setIsHovered(true);
          handleMouseMove(e);
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsHovered(false)}
        onClick={e => {
          e.stopPropagation();
          console.log(`Opening media: ${url}`);
        }}
        onMouseOver={() => setIsHovered(true)}
      >
        <span>📁</span>
        {getFileName(url)} {index !== undefined ? `#${index + 1}` : ''}
      </a>

      {/* Hover Preview */}
      {isHovered && url && (
        <div
          style={{
            position: "fixed",
            left: previewPosition.x,
            top: previewPosition.y,
            zIndex: 9999,
            backgroundColor: "white",
            border: "1px solid #d9d9d9",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            maxWidth: "300px",
            maxHeight: "200px",
            overflow: "hidden",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div style={{ 
            fontSize: "11px", 
            color: "#666", 
            marginBottom: "8px",
            fontWeight: "500" 
          }}>
            Preview: {getFileName(url)}
          </div>
          
          {isImage(url) ? (
            <img
              src={url}
              alt='Preview'
              style={{
                width: "100%",
                height: "150px",
                objectFit: "contain",
                borderRadius: "4px",
                backgroundColor: "#f5f5f5",
              }}
              onError={e => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML = 
                  '<div style="padding: 20px; text-align: center; color: #999;">Image not available</div>';
              }}
            />
          ) : isVideo(url) ? (
            <video
              src={url}
              style={{
                width: "100%",
                height: "150px",
                borderRadius: "4px",
                backgroundColor: "#000",
              }}
              controls={false}
              muted
              autoPlay
              loop
              onError={e => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML = 
                  '<div style="padding: 20px; text-align: center; color: #999;">Video not available</div>';
              }}
            />
          ) : (
            <div
              style={{ 
                padding: "40px 20px", 
                textAlign: "center", 
                color: "#999",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px"
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>📄</div>
              <div>File preview not available</div>
              <div style={{ fontSize: "10px", marginTop: "4px" }}>{url ? new URL(url).hostname : 'Unknown source'}</div>
            </div>
          )}
          
          <div style={{ 
            fontSize: "10px", 
            color: "#999", 
            marginTop: "8px",
            textAlign: "center" 
          }}>
            Click to open in new tab
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// Export both the component and static data
export { MediaPreview as default, STATIC_MEDIA_URLS };
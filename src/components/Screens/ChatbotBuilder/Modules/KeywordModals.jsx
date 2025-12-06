import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const KeywordModal = ({
  showKeywordModal,
  setShowKeywordModal,
  initialKeywords = [],
  onSave,
  predefinedKeywords = [],
}) => {
  const [newKeyword, setNewKeyword] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (showKeywordModal) {
      setKeywords([...initialKeywords]);
      setNewKeyword("");
      setShowDropdown(false);
    }
  }, [showKeywordModal, initialKeywords]);

  if (!showKeywordModal) return null;


  const addKeyword = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;

    const exists = keywords.some(
      (k) => k.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setNewKeyword("");
      setShowDropdown(false);
      return;
    }

    setKeywords((prev) => [...prev, trimmed]);
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
    setKeywords((prev) =>
      prev.filter((keyword) => keyword !== keywordToRemove)
    );
  };

  const handleSave = () => {
    onSave(keywords);
    setShowKeywordModal(false);
  };

  const handleCancel = () => {
    setKeywords([...initialKeywords]);
    setShowKeywordModal(false);
  };

  // Filter dropdown suggestions based on typing
  const filteredSuggestions = predefinedKeywords.filter(
    (item) =>
      item.toLowerCase().includes(newKeyword.toLowerCase()) &&
      !keywords.includes(item)
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content unsubscribe-modal" style={{ width: "600px" }}>

        {/* Header */}
        <div className="modal-header">
          <div className="d-flex align-items-center">
            <Icon className="modal-icon-adjustments" icon="ri:seo-line" />
            <h3 style={{ marginTop: "2px", marginLeft: "10px" }}>
              Manage Keywords
            </h3>
          </div>
          <button className="close-btn" onClick={handleCancel}>
            <Icon icon="mingcute:close-line" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <label className="form-label">Current Keywords</label>

          <div
            className="d-flex flex-wrap p-2 border rounded position-relative"
            style={{ minHeight: "48px", alignItems: "center", cursor: "text", gap: "3px" }}
            onClick={() => {
              document.getElementById("inlineKeywordInput").focus();
            }}
          >
            {/* Existing Tags */}
            {keywords.length > 0 ? (
              keywords.map((keyword, index) => (
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

            {/* Input */}
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

            {/* Dropdown */}
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
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeywordModal;

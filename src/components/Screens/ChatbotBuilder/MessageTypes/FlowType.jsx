import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";

const FlowType = ({
  formData,
  handleInputChange,
  handleBodyTextChange,
  handleAddVariable,
}) => {
  const [variableName, setVariableName] = useState("");
  const [headerType, setHeaderType] = useState("Text");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiRef = useRef(null);

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

  const handleAddVariableClick = () => {
    if (variableName.trim()) {
      handleAddVariable(variableName);
      setVariableName("");
    }
  };

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

  return (
    <>
      <div className="form-group">
        <div className="type-heading-wrapper">
          <h6 className="type-heading">Header</h6>
        </div>
        <div className="new-flex">
          <label className="label-flex">
            <input
              className="form-check-input form-round"
              type="radio"
              name="headerType"
              value="Text"
              checked={headerType === "Text"}
              onChange={(e) => setHeaderType(e.target.value)}
            />
            Text
          </label>
          <label className="label-flex">
            <input
              className="form-check-input form-round"
              type="radio"
              name="headerType"
              value="None"
              checked={headerType === "None"}
              onChange={(e) => setHeaderType(e.target.value)}
            />
            None
          </label>
        </div>

        {formData.catalogHeaderType === "Text" && (
          <>
            <input
              type="text"
              value={formData.catalogHeaderText}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 60) {
                  handleInputChange("catalogHeaderText", value);
                }
              }}
              maxLength={60}
              placeholder="Header text"
            />

            <small>{formData.catalogHeaderText?.length || 0} / 60</small>
          </>
        )}

      </div>

      <div className="form-group">
        <div className="type-heading-wrapper">
          <h6 className="type-heading">Body</h6>
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

      <div className="form-group">
        <div className="type-heading-wrapper">
          <h6 className="type-heading">Footer (Optional)</h6>
        </div>

        <input
          type="text"
          value={formData.catalogFooterText}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 60) {
              handleInputChange("catalogFooterText", value);
            }
          }}
          maxLength={60}
          placeholder="Footer text"
        />

        <small>{formData.catalogFooterText?.length || 0} / 60</small>
      </div>
    </>
  );
};

export default FlowType;

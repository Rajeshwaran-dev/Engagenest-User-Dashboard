// FlowDetailsModal.jsx
import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import "./../WhatsappFlows.css";

const FlowDetailsModal = ({ flow, isOpen, onClose }) => {
  const [screens, setScreens] = useState(["Screen 1"]);
  const [minimizedItems, setMinimizedItems] = useState({});
  const [selectedScreen, setSelectedScreen] = useState("Screen 1");
  const [screenTitles, setScreenTitles] = useState({ "Screen 1": "Screen 1" });
  const [contentItems, setContentItems] = useState({ "Screen 1": [] });

  // Dropdown states
  const [showNestedDropdown, setShowNestedDropdown] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Content config state
  const [contentConfig, setContentConfig] = useState({});

  // ref for outside click detection
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNestedDropdown(false);
        setActiveSubmenu(null);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, { passive: true });

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  // Initialize content items when modal opens
  useEffect(() => {
    if (isOpen) {
      setContentItems(prev => ({
        ...prev,
        "Screen 1": prev["Screen 1"] || []
      }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- helper functions ---
  const toggleMinimize = (screen, index) => {
    const key = `${screen}-${index}`;
    setMinimizedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddNewScreen = () => {
    const nextIndex = screens.length + 1;
    const newScreenName = `Screen ${nextIndex}`;

    setScreens((prev) => {
      const updatedScreens = [...prev, newScreenName];
      setScreenTitles((prevTitles) => ({
        ...prevTitles,
        [newScreenName]: newScreenName,
      }));
      setContentItems((prevContent) => ({
        ...prevContent,
        [newScreenName]: [],
      }));
      setSelectedScreen(newScreenName);
      return updatedScreens;
    });
  };

  const handleDeleteScreen = (index) => {
    if (index === 0) return;

    setScreens((prevScreens) => {
      const removedScreen = prevScreens[index];
      const newScreens = prevScreens.filter((_, i) => i !== index);

      // Clean up related state
      setScreenTitles((prevTitles) => {
        const updated = { ...prevTitles };
        delete updated[removedScreen];
        return updated;
      });

      setContentItems((prevContent) => {
        const updated = { ...prevContent };
        delete updated[removedScreen];
        return updated;
      });

      setContentConfig((prevConfig) => {
        const updated = { ...prevConfig };
        Object.keys(updated).forEach((k) => {
          if (k.startsWith(`${removedScreen}-`)) delete updated[k];
        });
        return updated;
      });

      setMinimizedItems((prevMin) => {
        const updated = { ...prevMin };
        Object.keys(updated).forEach((k) => {
          if (k.startsWith(`${removedScreen}-`)) delete updated[k];
        });
        return updated;
      });

      // Select previous screen
      const candidateIndex = Math.max(0, index - 1);
      const newSelected = newScreens[candidateIndex] || "Screen 1";
      setSelectedScreen(newSelected);

      return newScreens;
    });
  };

  const getDefaultConfig = (type, specificType = null) => {
    const baseConfig = {
      label: "",
      instructions: "",
      initialValue: "",
      required: false,
      minChar: 0,
      maxChar: 0,
      options: ["Option 1"],
      fontStyle: "normal",
    };

    switch (type) {
      case "heading":
        return { ...baseConfig, maxChar: 80, fontStyle: "large" };
      case "subheading":
        return { ...baseConfig, maxChar: 80, fontStyle: "small" };
      case "body":
        return { ...baseConfig, maxChar: 4096, fontStyle: "normal" };
      case "caption":
        return { ...baseConfig, maxChar: 4096, fontStyle: "normal" };
      case "text-answer":
        switch (specificType) {
          case "short-answer":
            return {
              ...baseConfig,
              label: "Short Answer",
              minChar: 0,
              maxChar: 80,
              fieldType: "text",
            };
          case "paragraph":
            return {
              ...baseConfig,
              label: "Paragraph",
              minChar: 0,
              maxChar: 4096,
            };
          case "date-picker":
            return {
              ...baseConfig,
              label: "Date Picker",
              datePickerType: "single",
              instructions: "",
              required: false,
              startDate: "",
              endDate: "",
              unavailableDates: [],
            };
          default:
            return baseConfig;
        }
      case "selection":
        switch (specificType) {
          case "single-choice":
            return {
              ...baseConfig,
              label: "Single Choice",
              options: ["Option 1"],
            };
          case "multiple-choice":
            return {
              ...baseConfig,
              label: "Multiple Choice",
              options: ["Option 1"],
            };
          case "dropdown":
            return { ...baseConfig, label: "Dropdown", options: ["Option 1"] };
          default:
            return baseConfig;
        }
      default:
        return baseConfig;
    }
  };

  const getMaxChars = (type, specificType = null) => {
    switch (type) {
      case "heading":
      case "subheading":
        return 80;
      case "body":
      case "caption":
        return 4096;
      case "text-answer":
        return specificType === "paragraph" ? 4096 : 80;
      default:
        return 60;
    }
  };

  const getDefaultText = (type, specificType = null) => {
    switch (type) {
      case "heading":
        return "Large heading";
      case "subheading":
        return "Small heading";
      case "caption":
        return "Caption";
      case "body":
        return "Body";
      case "button":
        return "Button text";
      case "text-answer":
        switch (specificType) {
          case "short-answer":
            return "Short Answer";
          case "paragraph":
            return "Paragraph";
          case "date-picker":
            return "Date Picker";
          default:
            return "Text answer field";
        }
      case "selection":
        switch (specificType) {
          case "single-choice":
            return "Single Choice";
          case "multiple-choice":
            return "Multiple Choice";
          case "dropdown":
            return "Dropdown";
          default:
            return "Selection field";
        }
      default:
        return "New content";
    }
  };

  const handleAddContent = (contentType, specificType = null) => {
    if (!contentType) return;

    let finalType = contentType;
    let text = getDefaultText(contentType);
    let config = getDefaultConfig(contentType, specificType);

    if (specificType) {
      finalType = `${contentType}-${specificType}`;
      text = getDefaultText(contentType, specificType);
    }

    const newContent = {
      type: finalType,
      text: text,
      charCount: text.length,
      maxChars: getMaxChars(contentType, specificType),
      specificType: specificType,
      config: config,
    };

    setContentItems((prev) => {
      const currentScreenContent = prev[selectedScreen] || [];
      const updatedScreenContent = [...currentScreenContent, newContent];
      const newIndex = updatedScreenContent.length - 1;

      setContentConfig((prevConf) => ({
        ...prevConf,
        [`${selectedScreen}-${newIndex}`]: config,
      }));

      return {
        ...prev,
        [selectedScreen]: updatedScreenContent,
      };
    });

    // Close dropdown on add
    setShowNestedDropdown(false);
    setActiveSubmenu(null);
  };

  const handleDeleteContent = (index) => {
    setContentItems((prev) => {
      const currentContent = prev[selectedScreen] || [];
      return {
        ...prev,
        [selectedScreen]: currentContent.filter((_, i) => i !== index),
      };
    });

    setContentConfig((prev) => {
      const newConfig = { ...prev };
      const prefix = `${selectedScreen}-`;

      // Remove the deleted item's config
      delete newConfig[`${prefix}${index}`];

      // Reindex remaining configs
      const currentContent = contentItems[selectedScreen] || [];
      currentContent.forEach((_, i) => {
        if (i >= index) {
          const oldKey = `${prefix}${i + 1}`;
          const newKey = `${prefix}${i}`;
          if (prev[oldKey]) {
            newConfig[newKey] = prev[oldKey];
            delete newConfig[oldKey];
          }
        }
      });

      return newConfig;
    });
  };

  const handleScreenTitleChange = (newTitle) => {
    setScreenTitles((prev) => ({ ...prev, [selectedScreen]: newTitle }));
  };

  const handleContentChange = (index, newText) => {
    setContentItems((prev) => {
      const currentContent = prev[selectedScreen] || [];
      const updatedContent = [...currentContent];
      updatedContent[index] = {
        ...updatedContent[index],
        text: newText,
        charCount: newText.length,
      };
      return { ...prev, [selectedScreen]: updatedContent };
    });
  };

  const handleConfigChange = (screen, contentIndex, field, value) => {
    const configKey = `${screen}-${contentIndex}`;

    setContentConfig((prev) => ({
      ...prev,
      [configKey]: {
        ...prev[configKey],
        [field]: value
      },
    }));

    // If fontStyle is changing, update maxChars in content item
    if (field === "fontStyle") {
      const newMaxChars = getMaxCharsForFontStyle(value);

      setContentItems((prev) => {
        const currentContent = prev[screen] || [];
        const updatedContent = [...currentContent];
        if (updatedContent[contentIndex]) {
          updatedContent[contentIndex] = {
            ...updatedContent[contentIndex],
            maxChars: newMaxChars,
            charCount: Math.min(updatedContent[contentIndex].charCount, newMaxChars),
            text: updatedContent[contentIndex].text.slice(0, newMaxChars)
          };
        }
        return { ...prev, [screen]: updatedContent };
      });
    }
  };

  const handleAddOption = (screen, contentIndex) => {
    const configKey = `${screen}-${contentIndex}`;
    const currentConfig = contentConfig[configKey] || { options: ["Option 1"] };
    setContentConfig((prev) => ({
      ...prev,
      [configKey]: {
        ...currentConfig,
        options: [
          ...currentConfig.options,
          `Option ${currentConfig.options.length + 1}`,
        ],
      },
    }));
  };

  const handleOptionChange = (screen, contentIndex, optionIndex, newValue) => {
    const configKey = `${screen}-${contentIndex}`;
    const currentConfig = contentConfig[configKey] || { options: ["Option 1"] };
    const updatedOptions = [...currentConfig.options];
    updatedOptions[optionIndex] = newValue;
    setContentConfig((prev) => ({
      ...prev,
      [configKey]: { ...currentConfig, options: updatedOptions },
    }));
  };

  const handleRemoveOption = (screen, contentIndex, optionIndex) => {
    const configKey = `${screen}-${contentIndex}`;
    const currentConfig = contentConfig[configKey] || { options: ["Option 1"] };
    const updatedOptions = currentConfig.options.filter((_, i) => i !== optionIndex);
    setContentConfig((prev) => ({
      ...prev,
      [configKey]: {
        ...currentConfig,
        options: updatedOptions.length > 0 ? updatedOptions : ["Option 1"],
      },
    }));
  };

  const handleDateRangeChange = (screen, contentIndex, field, value) => {
    const configKey = `${screen}-${contentIndex}`;
    setContentConfig((prev) => ({
      ...prev,
      [configKey]: { ...prev[configKey], [field]: value },
    }));
  };

  const handleUnavailableDateChange = (screen, contentIndex, date) => {
    const configKey = `${screen}-${contentIndex}`;
    const currentConfig = contentConfig[configKey] || { unavailableDates: [] };
    if (date && !currentConfig.unavailableDates?.some((d) => d === date)) {
      const updatedDates = [...(currentConfig.unavailableDates || []), date];
      setContentConfig((prev) => ({
        ...prev,
        [configKey]: { ...currentConfig, unavailableDates: updatedDates },
      }));
    }
  };

  const handleRemoveUnavailableDate = (screen, contentIndex, dateIndex) => {
    const configKey = `${screen}-${contentIndex}`;
    const currentConfig = contentConfig[configKey] || { unavailableDates: [] };
    const updatedDates = currentConfig.unavailableDates?.filter((_, i) => i !== dateIndex) || [];
    setContentConfig((prev) => ({
      ...prev,
      [configKey]: { ...currentConfig, unavailableDates: updatedDates },
    }));
  };

  const getNestedDropdownOptions = () => [
    {
      label: "Text",
      children: [
        { label: "Large heading", value: "heading" },
        { label: "Small heading", value: "subheading" },
        { label: "Caption", value: "caption" },
        { label: "Body", value: "body" },
      ],
    },
    {
      label: "Text Answer",
      children: [
        {
          label: "Short answer",
          value: "text-answer",
          specificType: "short-answer",
        },
        { label: "Paragraph", value: "text-answer", specificType: "paragraph" },
        {
          label: "Date picker",
          value: "text-answer",
          specificType: "date-picker",
        },
      ],
    },
    {
      label: "Selection",
      children: [
        {
          label: "Single Choice",
          value: "selection",
          specificType: "single-choice",
        },
        {
          label: "Multiple Choice",
          value: "selection",
          specificType: "multiple-choice",
        },
        { label: "Drop-down", value: "selection", specificType: "dropdown" },
      ],
    },
  ];

  const renderContentConfig = (content, index) => {
    const configKey = `${selectedScreen}-${index}`;
    const config = contentConfig[configKey] || content.config || {};

    // Common text configuration for all text types
    const renderTextConfig = (placeholder, defaultFontStyle = "normal") => (
      <div className="content-config">
        {/* Heading Selection Dropdown for ALL text types */}
        <div className="config-section">
          <label className="form-label-small">Heading Selection</label>
          <select
            className="form-select"
            value={config.fontStyle || defaultFontStyle}
            onChange={(e) => {
              const newFontStyle = e.target.value;
              const newMaxChars = getMaxCharsForFontStyle(newFontStyle);

              // Update font style
              handleConfigChange(selectedScreen, index, "fontStyle", newFontStyle);

              // Also update maxChars in content item
              setContentItems((prev) => {
                const currentContent = prev[selectedScreen] || [];
                const updatedContent = [...currentContent];
                updatedContent[index] = {
                  ...updatedContent[index],
                  maxChars: newMaxChars,
                  // Also adjust charCount if it exceeds new limit
                  charCount: Math.min(updatedContent[index].charCount, newMaxChars),
                  text: updatedContent[index].text.slice(0, newMaxChars)
                };
                return { ...prev, [selectedScreen]: updatedContent };
              });
            }}
          >
            <option value="large">Large heading</option>
            <option value="small">Small heading</option>
            <option value="body">Body</option>
            <option value="caption">Caption</option>
          </select>
          <div className="char-counter1">
            {content.charCount}/{content.maxChars}
          </div>
        </div>

        <div className="config-section">
          <label className="form-label-small">Text</label>
          <textarea
            className="form-control"
            rows="2"
            value={content.text}
            onChange={(e) => handleContentChange(index, e.target.value)}
            maxLength={content.maxChars}
            placeholder={placeholder}
          />
        </div>
      </div>
    );

    switch (content.type) {
      case "heading":
        return renderTextConfig("Large heading text", "large");

      case "subheading":
        return renderTextConfig("Small heading text", "small");

      case "body":
        return renderTextConfig("Body text", "body");

      case "caption":
        return renderTextConfig("Caption text", "caption");

      case "text-answer-short-answer":
        return (
          <div className="content-config">
            <div className="config-section">
              <label className="form-label-small">Text Answer</label>
              <select
                className="form-select"
                value={config.fieldType || "text"}
                onChange={(e) =>
                  handleConfigChange(
                    selectedScreen,
                    index,
                    "fieldType",
                    e.target.value
                  )
                }
              >
                <option value="text">Text</option>
                <option value="password">Password</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="passcode">Passcode</option>
                <option value="phone">Phone</option>
              </select>
            </div>
            <div className="config-section">
              <label className="form-label-small">Label</label>
              <input
                type="text"
                className="form-control"
                value={config.label || ""}
                onChange={(e) =>
                  handleConfigChange(
                    selectedScreen,
                    index,
                    "label",
                    e.target.value
                  )
                }
                placeholder="Label"
              />
            </div>
            <div className="config-row">
              <div className="config-col">
                <label className="form-label-small">Min char</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.minChar || 0}
                  onChange={(e) =>
                    handleConfigChange(
                      selectedScreen,
                      index,
                      "minChar",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="config-col">
                <label className="form-label-small">Max char</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.maxChar || 80}
                  onChange={(e) =>
                    handleConfigChange(
                      selectedScreen,
                      index,
                      "maxChar",
                      parseInt(e.target.value) || 80
                    )
                  }
                />
              </div>
            </div>
            <div className="config-section">
              <label className="form-label-small">
                Instructions - Optional
              </label>
              <input
                type="text"
                className="form-control"
                value={config.instructions || ""}
                onChange={(e) =>
                  handleConfigChange(
                    selectedScreen,
                    index,
                    "instructions",
                    e.target.value
                  )
                }
                placeholder="Instructions"
              />
            </div>
            <div className="config-section">
              <label className="form-label-small">Initial value</label>
              <input
                type="text"
                className="form-control"
                value={config.initialValue || ""}
                onChange={(e) =>
                  handleConfigChange(
                    selectedScreen,
                    index,
                    "initialValue",
                    e.target.value
                  )
                }
                placeholder="Initial value"
              />
            </div>
          </div>
        );

      case "text-answer-paragraph":
        return (
          <div className="content-config">
            <div className="config-section">
              <label className="form-label-small">Label</label>
              <input
                type="text"
                className="form-control"
                value={config.label || ""}
                onChange={(e) =>
                  handleConfigChange(
                    selectedScreen,
                    index,
                    "label",
                    e.target.value
                  )
                }
                placeholder="Label"
              />
            </div>
            <div className="config-section">
              <label className="form-label-small">
                Instructions - Optional
              </label>
              <input
                type="text"
                className="form-control"
                value={config.instructions || ""}
                onChange={(e) =>
                  handleConfigChange(
                    selectedScreen,
                    index,
                    "instructions",
                    e.target.value
                  )
                }
                placeholder="Instructions"
              />
            </div>
            <div className="config-section">
              <label className="form-label-small">
                Initial value - Optional
              </label>
              <textarea
                className="form-control"
                rows="2"
                value={config.initialValue || ""}
                onChange={(e) =>
                  handleConfigChange(
                    selectedScreen,
                    index,
                    "initialValue",
                    e.target.value
                  )
                }
                placeholder="Initial value"
              />
            </div>
            <div className="config-section">
              <label className="form-label-small">Max char - optional</label>
              <input
                type="number"
                className="form-control"
                value={config.maxChar || 4096}
                onChange={(e) =>
                  handleConfigChange(
                    selectedScreen,
                    index,
                    "maxChar",
                    parseInt(e.target.value) || 4096
                  )
                }
              />
            </div>
          </div>
        );

      case "text-answer-date-picker":
        return (
          <div className="content-config">
            <div className="config-section">
              <label className="form-label-small">Label</label>
              <input
                type="text"
                className="form-control"
                value={config.label || "Date Picker"}
                onChange={(e) =>
                  handleConfigChange(
                    selectedScreen,
                    index,
                    "label",
                    e.target.value
                  )
                }
                placeholder="Label"
              />
            </div>
            <div className="config-section">
              <label className="form-label-small">
                Instructions - Optional
              </label>
              <input
                type="text"
                className="form-control"
                value={config.instructions || ""}
                onChange={(e) =>
                  handleConfigChange(
                    selectedScreen,
                    index,
                    "instructions",
                    e.target.value
                  )
                }
                placeholder="Instructions"
              />
            </div>
            <div className="config-section">
              <label className="form-label-small">Date Range</label>
              <div
                className="date-range-inputs"
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <input
                  type="date"
                  className="form-control"
                  value={config.startDate || ""}
                  onChange={(e) =>
                    handleDateRangeChange(
                      selectedScreen,
                      index,
                      "startDate",
                      e.target.value
                    )
                  }
                  placeholder="Start date"
                />
                <span>to</span>
                <input
                  type="date"
                  className="form-control"
                  value={config.endDate || ""}
                  onChange={(e) =>
                    handleDateRangeChange(
                      selectedScreen,
                      index,
                      "endDate",
                      e.target.value
                    )
                  }
                  placeholder="End date"
                />
              </div>
            </div>
            <div className="config-section">
              <label className="form-label-small">Unavailable dates</label>
              <div
                className="unavailable-date-input"
                style={{ display: "flex", gap: "8px" }}
              >
                <input
                  type="date"
                  className="form-control"
                  onChange={(e) =>
                    handleUnavailableDateChange(
                      selectedScreen,
                      index,
                      e.target.value
                    )
                  }
                  placeholder="Select unavailable date"
                />
              </div>
              
            </div>
          </div>
        );

      case "selection-single-choice":
      case "selection-multiple-choice":
      case "selection-dropdown":
        return (
          <div className="content-config">
            <div className="config-section">
              <label className="form-label-small">Label</label>
              <input
                type="text"
                className="form-control"
                value={config.label || ""}
                onChange={(e) =>
                  handleConfigChange(
                    selectedScreen,
                    index,
                    "label",
                    e.target.value
                  )
                }
                placeholder="Label"
              />
            </div>
            <div className="config-section">
              <label className="form-label-small">Options</label>
              {(config.options || ["Option 1"]).map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className="option-item"
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <input
                    type="text"
                    className="form-control"
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(
                        selectedScreen,
                        index,
                        optionIndex,
                        e.target.value
                      )
                    }
                    placeholder={`Option ${optionIndex + 1}`}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center d-flex justify-content-center align-items-center"
                    style={{ marginLeft: 8, minWidth: "32px", height: "32px", padding: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveOption(selectedScreen, index, optionIndex);
                    }}
                    title="Remove option"
                  >
                    <Icon icon="mi:delete" style={{ fontSize: "16px" }} />
                  </button>
                </div>
              ))}
              <button
                className="btn-primary mt-2 d-flex align-items-center gap-2"
                onClick={() => handleAddOption(selectedScreen, index)}
                style={{ padding: "8px 16px" }}
              >
                <Icon
                  icon="mingcute:add-line"
                  style={{ fontSize: "18px" }}
                />
                <span>Add option</span>
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="content-config">
            <div className="config-section">
              <label className="form-label-small">Content</label>
              <textarea
                className="form-control"
                rows="2"
                value={content.text}
                onChange={(e) => handleContentChange(index, e.target.value)}
                maxLength={content.maxChars}
                placeholder="Content text"
              />
              <div className="char-counter1">
                {content.charCount}/{content.maxChars}
              </div>
            </div>
          </div>
        );
    }
  };

  const getMaxCharsForFontStyle = (fontStyle) => {
    switch (fontStyle) {
      case "large":
      case "small":
        return 80; // Headings
      case "body":
      case "caption":
      case "normal":
        return 4096; // Body text
      default:
        return 4096;
    }
  };

  const renderContentPreview = (content, index) => {
    const configKey = `${selectedScreen}-${index}`;
    const config = contentConfig[configKey] || content.config || {};

    // Get the actual font style from config, fallback to content type
    const fontStyle = config.fontStyle ||
      (content.type === "heading" ? "large" :
        content.type === "subheading" ? "small" :
          content.type === "body" ? "body" :
            content.type === "caption" ? "caption" : "normal");

    // Common text preview rendering based on fontStyle
    const renderTextPreview = () => {
      switch (fontStyle) {
        case "large":
          return <div className="preview-heading large">{content.text}</div>;
        case "small":
          return <div className="preview-heading small">{content.text}</div>;
        case "body":
          return <div className="preview-body">{content.text}</div>;
        case "caption":
          return <div className="preview-caption">{content.text}</div>;
        default:
          return <div className="preview-body">{content.text}</div>;
      }
    };

    switch (content.type) {
      case "heading":
      case "subheading":
      case "body":
      case "caption":
        return renderTextPreview();

      case "text-answer-short-answer": {
        const inputType = config.fieldType || "text";
        return (
          <div className="preview-text-field">
            <div className="preview-label">
              {config.label || "Short Answer"}
            </div>
            <input
              type={inputType}
              className="form-control"
              placeholder="Enter your answer..."
              value={config.initialValue || ""}
              readOnly
            />
            {config.instructions && (
              <div className="preview-instructions">{config.instructions}</div>
            )}
          </div>
        );
      }
      case "text-answer-paragraph":
        return (
          <div className="preview-text-field">
            <div className="preview-label">{config.label || "Paragraph"}</div>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Enter your text..."
              value={config.initialValue || ""}
              readOnly
            />
            {config.instructions && (
              <div className="preview-instructions">{config.instructions}</div>
            )}
          </div>
        );
      case "text-answer-date-picker": {
        const startDate = config.startDate || "";
        const endDate = config.endDate || "";
        const unavailableDates = config.unavailableDates || [];
        return (
          <div className="preview-text-field">
            <div className="preview-label">{config.label || "Date Picker"}</div>
            <div className="preview-date-range">
              <div className="date-range-display">
                {startDate && endDate
                  ? `${startDate} - ${endDate}`
                  : "Start date → End date"}
              </div>
            </div>
            {unavailableDates.length > 0 && (
              <div className="preview-unavailable-dates mt-2">
                <div className="unavailable-dates-label">Unavailable dates</div>
                {unavailableDates.map((date, dateIndex) => (
                  <div key={dateIndex} className="unavailable-date-display">
                    {date}
                  </div>
                ))}
              </div>
            )}
            {config.instructions && (
              <div className="preview-instructions">{config.instructions}</div>
            )}
          </div>
        );
      }
      case "selection-single-choice":
        return (
          <div className="preview-selection">
            <div className="preview-label">
              {config.label || "Single Choice"}
            </div>
            {(config.options || ["Option 1"]).map((option, optionIndex) => (
              <div
                key={optionIndex}
                className="preview-option-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div style={{ flex: 1, fontSize: "14px" }}>{option}</div>
                <div style={{ marginLeft: 12 }}>
                  <input
                    type="radio"
                    name={`single-choice-${index}`}
                    readOnly
                    aria-label={option}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "2px solid #ccc",
                      appearance: "none",
                      position: "relative",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      case "selection-multiple-choice":
        return (
          <div className="preview-selection">
            <div className="preview-label">
              {config.label || "Multiple Choice"}
            </div>
            {(config.options || ["Option 1"]).map((option, optionIndex) => (
              <div
                key={optionIndex}
                className="preview-option-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div style={{ flex: 1, fontSize: "14px" }}>{option}</div>
                <div style={{ marginLeft: 12 }}>
                  <input
                    type="checkbox"
                    readOnly
                    aria-label={option}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      border: "2px solid #ccc",
                      appearance: "none",
                      position: "relative",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      case "selection-dropdown":
        return (
          <div className="preview-selection">
            <div className="preview-label">{config.label || "Dropdown"}</div>
            <select
              className="form-select"
              readOnly
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "14px",
                width: "100%",
              }}
            >
              <option>Select an option</option>
              {(config.options || ["Option 1"]).map((option, optionIndex) => (
                <option key={optionIndex} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      default:
        return <div className="preview-text">{content.text}</div>;
    }
  };

  const getContentTypeLabel = (type) => {
    if (type.includes("heading")) return "Heading";
    if (type.includes("subheading")) return "Subheading";
    if (type.includes("body")) return "Body";
    if (type.includes("caption")) return "Caption";
    if (type.includes("button")) return "Button";
    if (type.includes("text-answer")) return "Text Answer";
    if (type.includes("selection")) return "Selection";
    return "Content";
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: "1100px", maxWidth: "95vw" }}>
        <div className="modal-header border-bottom">
          <div className="d-flex align-items-center gap-3">
            <h5 className="modal-title">New Client</h5>
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <Icon icon="mingcute:close-line" />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "0" }}>
          <div className="row g-0">
            {/* Left panel */}
            <div className="col-xxl-3 col-md-6 border-end">
              <div className="modal-panel screens-panel">
                <h6 className="panel-title">Screens</h6>
                <div className="screens-list">
                  {screens.map((screen, index) => (
                    <div
                      key={screen}
                      className={`screen-item ${selectedScreen === screen ? "active" : ""
                        }`}
                      onClick={() => setSelectedScreen(screen)}
                    >
                      <span className="screen-text">
                        <span className="screen-number">{index + 1}</span>
                        {screenTitles[screen]}
                      </span>
                      {index > 0 && (
                        <button
                          className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScreen(index);
                          }}
                          title="Delete screen"
                          style={{ marginLeft: "auto" }}
                        >
                          <Icon icon="mdi:trash-can-outline" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    className="add-screen-btn"
                    onClick={handleAddNewScreen}
                  >
                    <Icon
                      icon="mingcute:add-line"
                      style={{ fontSize: "14px" }}
                    />
                    Add New Screen
                  </button>
                </div>
              </div>
            </div>

            {/* Middle panel */}
            <div className="col-xxl-5 col-md-6 border-end">
              <div className="modal-panel edit-content-panel">
                <h6 className="panel-title">Edit Content</h6>

                <div className="mb-4">
                  <label className="form-label-small">Screen Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={screenTitles[selectedScreen] || ""}
                    onChange={(e) => handleScreenTitleChange(e.target.value)}
                  />
                </div>

                <div className="content-items">
                  {(contentItems[selectedScreen] || []).map((content, index) => {
                    const isMinimized =
                      minimizedItems[`${selectedScreen}-${index}`];
                    return (
                      <div
                        key={index}
                        className={`content-item ${isMinimized ? "minimized" : ""
                          }`}
                      >
                        <div
                          className="content-item-header"
                          onClick={() => toggleMinimize(selectedScreen, index)}
                        >
                          <div className="content-item-left">
                            <span className="content-type-badge">
                              {getContentTypeLabel(content.type)}
                            </span>
                          </div>
                          <div className="content-item-center">
                            <button
                              className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteContent(index);
                              }}
                              title="Delete content"
                            >
                              <Icon icon="mi:delete" />
                            </button>
                          </div>
                          <div className="content-item-right">
                            <button
                              className="w-32-px h-32-px me-8 bg-gradient-start text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                              title={isMinimized ? "Expand" : "Minimize"}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMinimize(selectedScreen, index);
                              }}
                            >
                              <Icon
                                icon={
                                  isMinimized
                                    ? "mingcute:down-line"
                                    : "mingcute:up-line"
                                }
                              />
                            </button>
                          </div>
                        </div>
                        {!isMinimized && renderContentConfig(content, index)}
                      </div>
                    );
                  })}
                </div>

                {/* Add Content Dropdown */}
                <div className="add-content-section" ref={dropdownRef}>
                  {showNestedDropdown && isMobile && (
                    <div
                      className="dropdown-overlay active"
                      onClick={() => {
                        setShowNestedDropdown(false);
                        setActiveSubmenu(null);
                      }}
                    />
                  )}

                  <div className="position-relative" style={{ display: 'inline-block', width: '100%' }}>
                    <button
                      className="text-left add-content-btn w-100"
                      type="button"
                      aria-expanded={showNestedDropdown}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNestedDropdown((prev) => !prev);
                        setActiveSubmenu(null);
                      }}
                    >
                      Add Content
                      <span style={{ float: 'right', marginTop: "-6px" }}>
                        <Icon
                          icon={showNestedDropdown ? "mingcute:up-line" : "mingcute:down-line"}
                          className="dropdown-icon"
                        />
                      </span>
                    </button>

                    {showNestedDropdown && (
                      <div
                        className="nested-dropdown-menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isMobile && activeSubmenu && (
                          <button
                            className="nested-dropdown-back"
                            onClick={() => setActiveSubmenu(null)}
                          >
                            <Icon icon="mingcute:left-line" className="left-arrow-icon" />
                            Back to Categories
                          </button>
                        )}

                        {!activeSubmenu ? (
                          getNestedDropdownOptions().map((group, groupIndex) => (
                            <button
                              key={groupIndex}
                              className="nested-dropdown-item has-children"
                              onClick={() => {
                                setActiveSubmenu(group.label);
                              }}
                            >
                              {group.label}
                              <Icon
                                icon="mingcute:right-line"
                                className="right-arrow-icon"
                                style={{ marginLeft: 'auto' }}
                              />
                            </button>
                          ))
                        ) : (
                          (() => {
                            const activeGroup = getNestedDropdownOptions().find(
                              group => group.label === activeSubmenu
                            );

                            if (!activeGroup) return null;

                            return (
                              <>
                                <button
                                  className="nested-dropdown-back d-md-none"
                                  onClick={() => setActiveSubmenu(null)}
                                >
                                  <Icon icon="mingcute:left-line" className="left-arrow-icon" />
                                  Back to Categories
                                </button>

                                {activeGroup.children.map((child, childIndex) => (
                                  <button
                                    key={childIndex}
                                    className="nested-dropdown-item"
                                    onClick={() => {
                                      handleAddContent(child.value, child.specificType);
                                      setShowNestedDropdown(false);
                                      setActiveSubmenu(null);
                                    }}
                                  >
                                    {child.label}
                                  </button>
                                ))}
                              </>
                            );
                          })()
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="col-xxl-4 col-md-12">
              <div className="modal-panel mobile-preview-panel">
                <h6 className="panel-title">Mobile Preview</h6>
                <div className="preview-container">
                  <div className="phone-frame">
                    <div className="phone-notch" />
                    <div className="phone-screen">
                      <div className="phone-status-bar" />
                      <div className="phone-content">
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            marginBottom: "16px",
                            textAlign: "center",
                            paddingBottom: "8px",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {screenTitles[selectedScreen] || "Screen Title"}
                        </div>

                        {(contentItems[selectedScreen] || []).length > 0 ? (
                          (contentItems[selectedScreen] || []).map((content, index) => (
                            <div key={index} style={{ marginBottom: "16px" }}>
                              {renderContentPreview(content, index)}
                            </div>
                          ))
                        ) : (
                          <div className="placeholder-text">
                            Add content to see preview
                          </div>
                        )}

                        <div
                          className="action-buttons"
                          style={{ marginTop: "auto", paddingTop: "16px" }}
                        >
                          <button className="action-btn">
                            <Icon icon="mingcute:left-line" className="left-arrow-icon" />
                            Back
                          </button>
                          <button className="action-btn primary">
                            Next
                            <Icon icon="mingcute:right-line" className="right-arrow-icon" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <div className="d-flex justify-content-end gap-3 align-items-center">
              <div className="d-flex gap-2">
                <button className="btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn-primary">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowDetailsModal;
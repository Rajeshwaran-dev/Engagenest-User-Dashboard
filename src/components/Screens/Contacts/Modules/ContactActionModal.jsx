import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useGetUserAttrQuery } from "../../../../store/ApiFilesV2/UserApis";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const ContactActionModal = ({
  modalType,
  onClose,
  onSubmit,
  formData,
  moveData,
  copyData,
  onInputChange,
  onMoveChange,
  onCopyChange,
  availableGroups: propAvailableGroups = [],
  editingContact = null
}) => {
  // State for tags (tag input style)
  const [tagInput, setTagInput] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);

  // State for groups (tag input style)
  const [groupInput, setGroupInput] = useState("");
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);

  const [userAttributes, setUserAttributes] = useState({});

  // Fetch user attributes
  const { data: userAttributesData } = useGetUserAttrQuery();

  const predefinedTags = ["New", "Important", "VIP", "Regular", "Priority", "Urgent"];

  useEffect(() => {
    if (modalType === "add" || modalType === "edit") {
      // Initialize tags from formData
      const tagsArray = formData.tags
        ? formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
        : [];
      setAvailableTags(tagsArray);

      // Initialize groups from formData
      const groupsArray = formData.group
        ? formData.group.split(",").map(group => group.trim()).filter(group => group)
        : [];
      setSelectedGroups(groupsArray);

      // Process user attributes data
      if (userAttributesData) {
        const attributesObj = {};
        userAttributesData.forEach(attr => {
          attributesObj[attr.key] = {
            key: attr.key,
            name: attr.key.startsWith('$') ? attr.key : `$${attr.key}`,
            displayName: attr.val || attr.key,
            value: formData[attr.key] || ""
          };
        });
        setUserAttributes(attributesObj);
      }
    }
  }, [modalType, formData.tags, formData.group, userAttributesData, formData]);

  if (!modalType) return null;

  // ========== TAGS FUNCTIONS ==========
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    setShowTagDropdown(true);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;

    // Check if tag already exists
    const exists = availableTags.some(
      tag => tag.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setTagInput("");
      setShowTagDropdown(false);
      return;
    }

    // Add the new tag
    const newTags = [...availableTags, trimmed];
    setAvailableTags(newTags);

    // Update form data with comma-separated tags
    onInputChange({
      target: {
        name: "tags",
        value: newTags.join(", ")
      }
    });

    setTagInput("");
    setShowTagDropdown(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = availableTags.filter(tag => tag !== tagToRemove);
    setAvailableTags(newTags);

    onInputChange({
      target: {
        name: "tags",
        value: newTags.join(", ")
      }
    });
  };

  const filteredTagSuggestions = predefinedTags.filter(
    item => item.toLowerCase().includes(tagInput.toLowerCase()) &&
      !availableTags.includes(item)
  );

  // ========== GROUPS FUNCTIONS ==========
  const handleGroupKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addGroup(groupInput.trim());
    }
  };

  const addGroup = (groupName) => {
    if (!groupName) return;

    // Check if group already exists
    if (selectedGroups.includes(groupName)) {
      setGroupInput("");
      setShowGroupDropdown(false);
      return;
    }

    // Add the new group
    const newGroups = [...selectedGroups, groupName];
    setSelectedGroups(newGroups);

    // Update form data with comma-separated groups
    onInputChange({
      target: {
        name: "group",
        value: newGroups.join(", ")
      }
    });

    setGroupInput("");
    setShowGroupDropdown(false);
  };

  const removeGroup = (groupToRemove) => {
    const newGroups = selectedGroups.filter(g => g !== groupToRemove);
    setSelectedGroups(newGroups);

    onInputChange({
      target: {
        name: "group",
        value: newGroups.join(", ")
      }
    });
  };

  const selectExistingGroup = (groupName) => {
    if (!selectedGroups.includes(groupName)) {
      const newGroups = [...selectedGroups, groupName];
      setSelectedGroups(newGroups);

      onInputChange({
        target: {
          name: "group",
          value: newGroups.join(", ")
        }
      });
    }

    setGroupInput("");
    setShowGroupDropdown(false);
  };

  const filteredGroupSuggestions = propAvailableGroups.filter(
    group => group.toLowerCase().includes(groupInput.toLowerCase()) &&
      !selectedGroups.includes(group)
  );

  // ========== USER ATTRIBUTES FUNCTIONS ==========
  const handleUserAttributeChange = (attrKey, value) => {
    setUserAttributes(prev => ({
      ...prev,
      [attrKey]: {
        ...prev[attrKey],
        value: value
      }
    }));

    onInputChange({
      target: {
        name: attrKey,
        value: value
      }
    });
  };

  const renderUserAttributesSection = () => {
    if (!userAttributesData || userAttributesData.length === 0) return null;

    return (
      <div className="row mb-4">
        <div className="col-12 p-0">
          <h6 className="mb-3">Custom Attributes</h6>
          <div className="row">
            {userAttributesData.map((attr, index) => (
              <div className="col-md-6 mb-3" key={attr.key}>
                <label className="form-label fw-semibold text-dark">
                  {attr.key.startsWith('$') ? attr.key : `${attr.key}`}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={userAttributes[attr.key]?.value || ""}
                  onChange={(e) => handleUserAttributeChange(attr.key, e.target.value)}
                  placeholder={`Enter ${attr.key.startsWith('$') ? attr.key : `${attr.key}`}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ========== RENDER MODAL CONTENT ==========
  const renderModalContent = () => {
    switch (modalType) {
      case "add":
      case "edit":
        return (
          <div className="modal-content" style={{ width: "800px" }}>
            <div className="modal-header">
              <div className="d-flex align-items-center">
                <div>
                  <Icon
                    className="modal-icon-adjustments"
                    icon="hugeicons:contact-book"
                  />
                </div>
                <h3
                  className="modal-title"
                  style={{ marginTop: "2px", marginLeft: "10px" }}
                >
                  {modalType === "add" ? "Add Contact" : "Edit Contact"}
                </h3>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              >
                <Icon icon="mingcute:close-line" />
              </button>
            </div>
            <div className="modal-body p-30">
              <div>
                {/* ========== GROUPS FIELD ========== */}
                <div className="mb-4">
                  <label
                    style={{ color: "var(--text-secondary)" }}
                    htmlFor="group"
                    className="form-label fw-semibold text-dark d-flex align-items-center justify-content-between gap-2"
                  >
                    Group *

                    {/* Custom tooltip icon */}
                    <div className="custom-tooltip-container">
                      <Icon
                        icon="mdi:information-outline"
                        style={{
                          fontSize: "18px",
                          color: "#6c757d",
                          verticalAlign: "middle",
                          cursor: "pointer",
                        }}
                      />
                      <span className="custom-tooltip-text">
                        Type to add a new group or select from existing ones.
                      </span>
                    </div>
                  </label>

                  <div className="position-relative">

                    <div
                      className="d-flex flex-wrap p-2 border rounded position-relative"
                      style={{
                        minHeight: "48px",
                        alignItems: "center",
                        cursor: "text",
                        gap: "6px",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => {
                        document.getElementById("groupInput").focus();
                        setShowGroupDropdown(!showGroupDropdown);
                      }}
                    >
                      {/* Display selected groups as tags */}
                      {selectedGroups.length > 0 ? (
                        selectedGroups.map((group, index) => (
                          <span
                            key={index}
                            className="contact-badge group-badge d-flex align-items-center"
                          >
                            {group}
                            <Icon
                              icon="material-symbols:close-rounded"
                              style={{
                                fontSize: "18px",
                                marginLeft: "6px",
                                cursor: "pointer",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeGroup(group);
                              }}
                            />
                          </span>
                        ))
                      ) : (
                        <span className="text-muted"></span>
                      )}

                      {/* Input box */}
                      <input
                        id="groupInput"
                        type="text"
                        className="form-control"
                        value={groupInput}
                        onChange={(e) => {
                          setGroupInput(e.target.value);
                          setShowGroupDropdown(true);
                        }}
                        onKeyDown={(e) => handleGroupKeyDown(e)}
                        onFocus={() => setShowGroupDropdown(true)}
                        onBlur={() => setTimeout(() => setShowGroupDropdown(false), 200)}
                        placeholder=""
                        style={{
                          border: "none",
                          outline: "none",
                          minWidth: "160px",
                          flex: "1 1 160px",
                          background: "transparent",
                          padding: "6px",
                        }}
                      />

                      {/* Dropdown arrow icon */}
                      <Icon
                        icon={showGroupDropdown ? "mdi:chevron-up" : "mdi:chevron-down"}
                        width="22"
                        style={{
                          marginLeft: "auto",
                          color: "#6c757d",
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowGroupDropdown(!showGroupDropdown);
                        }}
                      />

                      {/* Dropdown menu */}
                      {showGroupDropdown && (
                        <ul
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            width: "100%",
                            background: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            marginTop: "4px",
                            padding: "4px 0",
                            listStyle: "none",
                            maxHeight: "180px",
                            overflowY: "auto",
                            zIndex: 1000,
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          {/* Option to add new group */}
                          {groupInput && !propAvailableGroups.includes(groupInput) && (
                            <li
                              onClick={() => addGroup(groupInput)}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                color: "#1f1750",
                              }}
                              onMouseEnter={(e) => (e.target.style.background = "#f2f2f2")}
                              onMouseLeave={(e) => (e.target.style.background = "transparent")}
                            >
                              <Icon icon="icon-park-outline:add" style={{ fontSize: "16px" }} />
                              Add “{groupInput}” as new group
                            </li>
                          )}

                          {/* Existing group suggestions */}
                          {filteredGroupSuggestions.map((group, index) => (
                            <li
                              key={index}
                              onClick={() => selectExistingGroup(group)}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontSize: "14px",
                              }}
                              onMouseEnter={(e) => (e.target.style.background = "#f2f2f2")}
                              onMouseLeave={(e) => (e.target.style.background = "transparent")}
                            >
                              {group}
                            </li>
                          ))}

                          {/* No results message */}
                          {filteredGroupSuggestions.length === 0 && !groupInput && (
                            <li
                              style={{
                                padding: "8px 12px",
                                color: "#999",
                                fontSize: "14px",
                                textAlign: "center",
                              }}
                            >
                              No groups available
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>

                </div>

                {/* ========== CONTACT DETAILS ========== */}
                <div className="row mb-4">
                  <div className="col-md-4 p-0">
                    <label
                      style={{ color: "var(--text-secondary)" }}
                      htmlFor="countryCode"
                      className="form-label fw-semibold text-dark"
                    >
                      Country Code <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="countryCode"
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={onInputChange}
                      required
                    >
                      <option value="+91">+91 (India)</option>
                      <option value="+1">+1 (USA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (Australia)</option>
                    </select>
                  </div>
                  <div className="col-md-8">
                    <label
                      style={{ color: "var(--text-secondary)" }}
                      htmlFor="mobileNumber"
                      className="form-label fw-semibold text-dark"
                    >
                      Mobile Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          if (value.length <= 10) {
                            onInputChange(e);
                          }
                        }
                      }}
                      placeholder="Mobile number"
                      required
                    />
                    {formData.mobileNumber &&
                      formData.mobileNumber.length !== 10 && (
                        <small style={{ color: "red" }}>
                          Mobile number must be exactly 10 digits
                        </small>
                      )}
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    style={{ color: "var(--text-secondary)" }}
                    htmlFor="contactName"
                    className="form-label fw-semibold text-dark"
                  >
                    Contact Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={onInputChange}
                    placeholder="Contact Name"
                    required
                  />
                </div>

                {/* ========== TAGS FIELD ========== */}
                <div className="mb-4">
                  <label
                    style={{ color: "var(--text-secondary)" }}
                    htmlFor="tags"
                    className="form-label fw-semibold text-dark d-flex align-items-center justify-content-between gap-1 flex-wrap"
                  >
                    Tag
                    <span className="d-flex align-items-center gap-1">
                      <div className="custom-tooltip-container">
                        <Icon
                          icon="mdi:information-outline"
                          style={{
                            fontSize: "18px",
                            color: "#6c757d",
                            verticalAlign: "middle",
                            cursor: "pointer",
                          }}
                        />
                        <div className="custom-tooltip-text">
                          Type to add a new tag or select from existing ones.
                          <div className="custom-tooltip-arrow"></div>
                        </div>
                      </div>
                    </span>
                  </label>
                  <div className="position-relative">
                    <div
                      className="d-flex flex-wrap p-2 border rounded position-relative"
                      style={{
                        minHeight: "48px",
                        alignItems: "center",
                        cursor: "text",
                        gap: "6px",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => {
                        document.getElementById("tagInput").focus();
                        setShowTagDropdown(!showTagDropdown);
                      }}
                    >
                      {/* Display added tags */}
                      {availableTags.length > 0 ? (
                        availableTags.map((tag, index) => (
                          <span
                            key={index}
                            className="contact-badge tag-badge d-flex align-items-center"
                          >
                            {tag}
                            <Icon
                              icon="material-symbols:close-rounded"
                              style={{
                                fontSize: "18px",
                                marginLeft: "6px",
                                cursor: "pointer",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTag(tag);
                              }}
                            />
                          </span>
                        ))
                      ) : (
                        <span className="text-muted"></span>
                      )}

                      {/* Input box for typing new tags */}
                      <input
                        id="tagInput"
                        type="text"
                        className="form-control"
                        value={tagInput}
                        onChange={handleTagInputChange}
                        onKeyDown={handleTagKeyDown}
                        onFocus={() => setShowTagDropdown(true)}
                        onBlur={() => setTimeout(() => setShowTagDropdown(false), 150)}
                        placeholder=""
                        style={{
                          border: "none",
                          outline: "none",
                          minWidth: "160px",
                          flex: "1 1 160px",
                          background: "transparent",
                          padding: "6px",
                        }}
                      />

                      {/* Dropdown toggle icon */}
                      <Icon
                        icon={showTagDropdown ? "mdi:chevron-up" : "mdi:chevron-down"}
                        width="22"
                        style={{
                          marginLeft: "auto",
                          color: "#6c757d",
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTagDropdown(!showTagDropdown);
                        }}
                      />

                      {/* Tag suggestions dropdown */}
                      {showTagDropdown && filteredTagSuggestions.length > 0 && (
                        <ul
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            width: "100%",
                            background: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            marginTop: "4px",
                            padding: "4px 0",
                            listStyle: "none",
                            maxHeight: "180px",
                            overflowY: "auto",
                            zIndex: 1000,
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          {filteredTagSuggestions.map((item, index) => (
                            <li
                              key={index}
                              onClick={() => addTag(item)}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                              }}
                              onMouseEnter={(e) => (e.target.style.background = "#f2f2f2")}
                              onMouseLeave={(e) => (e.target.style.background = "transparent")}
                            >
                              <Icon
                                icon="mdi:tag-outline"
                                style={{ fontSize: "16px", marginRight: "8px", color: "#555" }}
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Attributes Section */}
                {renderUserAttributesSection()}
              </div>
            </div>
            <div className="modal-footer border-0 bg-light">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={onSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        );

      case "move":
        return (
          <div className="modal-content" style={{ width: "500px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Move Contact</h3>
              <button type="button" className="btn-close" onClick={onClose}>
                <Icon icon="mingcute:close-line" />
              </button>
            </div>
            <div className="modal-body p-30">
              <div className="mb-4">
                <label style={{ color: "var(--text-secondary)" }} className="form-label fw-semibold text-dark">
                  Current Groups:
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={moveData.currentGroup}
                  readOnly
                  disabled
                />
              </div>
              <div className="mb-4">
                <label style={{ color: "var(--text-secondary)" }} className="form-label fw-semibold text-dark">
                  Available Groups:
                </label>
                <select
                  className="form-select"
                  name="availableGroups"
                  value={moveData.availableGroups}
                  onChange={onMoveChange}
                >
                  <option value="">Select Group</option>
                  {propAvailableGroups.map((group, index) => (
                    <option key={index} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer border-0 bg-light">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={onSubmit}>
                OK
              </button>
            </div>
          </div>
        );

      case "copy":
        return (
          <div className="modal-content" style={{ width: "500px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Copy Contact</h3>
              <button type="button" className="btn-close" onClick={onClose}>
                <Icon icon="mingcute:close-line" />
              </button>
            </div>
            <div className="modal-body p-30">
              <div className="mb-4">
                <label style={{ color: "var(--text-secondary)" }} className="form-label fw-semibold text-dark">
                  Current Groups:
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={copyData.currentGroups}
                  readOnly
                  disabled
                />
              </div>
              <div className="mb-4">
                <label style={{ color: "var(--text-secondary)" }} className="form-label fw-semibold text-dark">
                  Available Groups:
                </label>
                <select
                  className="form-select"
                  name="availableGroups"
                  value={copyData.availableGroups}
                  onChange={onCopyChange}
                >
                  <option value="">Select Group</option>
                  {propAvailableGroups.map((group, index) => (
                    <option key={index} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer border-0 bg-light">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={onSubmit}>
                OK
              </button>
            </div>
          </div>
        );

      case "delete":
        return (
          <div className="modal-content" style={{ width: "500px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Confirmation</h3>
              <button type="button" className="btn-close" onClick={onClose}>
                <Icon icon="mingcute:close-line" />
              </button>
            </div>
            <div className="modal-body">
              <div className="">
                <h6 className="mb-3 text-primary-2">
                  Are you sure you want to delete this contact?
                </h6>
              </div>
            </div>
            <div className="modal-footer justify-content-end">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={onSubmit}>
                Delete
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-content-wrapper">
        {renderModalContent()}
      </div>
    </div>
  );
};

export default ContactActionModal;
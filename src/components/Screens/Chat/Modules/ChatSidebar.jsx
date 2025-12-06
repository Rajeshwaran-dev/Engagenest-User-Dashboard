import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const AccordionItem = ({ title, isOpen, onToggle, children }) => (
  <div className="accordion-item">
    <div className="accordion-header" onClick={onToggle}>
      <h6 className="accordion-title">{title}</h6>
      <Icon
        icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
        className="accordion-icon"
      />
    </div>
    {isOpen && <div className="accordion-content">{children}</div>}
  </div>
);

const ChatSidebar = ({
  isSidebarOpen,
  toggleSidebar,
  accordionOpen,
  toggleAccordion,
  currentChat,
}) => {

  // ⭐ NEW HOOKS FOR AGENT TAG INPUT
  const [agentInput, setAgentInput] = useState("");
  const [assignedAgents, setAssignedAgents] = useState([]);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);

  // ⭐ NEW STATE FOR TAGS (similar to KeywordModal)
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState([]);

  const allAgents = [
    "Anandhu",
    "Rajesh",
    "Vignesh",
    "Boomi"
  ];

  const addTag = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;

    const exists = tags.some(
      (t) => t.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setNewTag("");
      return;
    }

    setTags((prev) => [...prev, trimmed]);
    setNewTag("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(newTag);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAgentDropdown(false); // CLOSE DROPDOWN
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dropdownRef = React.useRef(null);

  if (!isSidebarOpen) return null;

  const addAgent = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;

    const exists = assignedAgents.some(
      (a) => a.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setAgentInput("");
      setShowAgentDropdown(false);
      return;
    }

    setAssignedAgents((prev) => [...prev, trimmed]);
    setAgentInput("");
    setShowAgentDropdown(false);
  };

  const handleAgentKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAgent(agentInput);
    }
  };

  const removeAgent = (agent) => {
    setAssignedAgents((prev) => prev.filter((a) => a !== agent));
  };

  const filteredAgentList = allAgents.filter(
    (item) =>
      item.toLowerCase().includes(agentInput.toLowerCase()) &&
      !assignedAgents.includes(item)
  );

  return (
    <div className="chat-details-panel">
      <div className="panel-content">
        {/* Close Button */}
        <button
          type="button"
          className="panel-close-btn"
          onClick={toggleSidebar}
        >
          <Icon icon="material-symbols:close-rounded" width={20} height={20} />
        </button>

        {/* User Avatar and Info */}
        <div className="panel-user-info">
          <div className="user-avatar-wrapper">
            <div className="user-avatar">
              <Icon
                icon="qlementine-icons:user-24"
                width="50"
                height="50"
              />
            </div>
          </div>

          <h5 className="user-phone">{currentChat?.phone || "919786742563"}</h5>

          {/* ⭐ NEW TAG INPUT DROPDOWN FOR AGENTS */}
          <div className="mt-3">
            <label className="form-label fw-semibold">Assign Agent</label>

            <div
              ref={dropdownRef}
              className="d-flex flex-wrap p-2 border rounded position-relative"
              style={{ minHeight: "48px", cursor: "text", gap: "3px" }}
              onClick={() => document.getElementById("agentInputBox").focus()}
            >
              {/* Assigned Agent Tags */}
              {assignedAgents.map((agent, index) => (
                <span style={{ cursor: "pointer" }} className="contact-badge group-badge"
                  key={index}
                >
                  {agent}
                  <Icon
                    icon="material-symbols:close-rounded"
                    style={{ marginLeft: "8px", cursor: "pointer" }}
                    onClick={() => removeAgent(agent)}
                  />
                </span>
              ))}

              {/* Input */}
              <input
                id="agentInputBox"
                type="text"
                className="form-control"
                value={agentInput}
                onChange={(e) => {
                  setAgentInput(e.target.value);
                  setShowAgentDropdown(true); // show while typing
                }}
                onFocus={() => {
                  setShowAgentDropdown(true); // ⭐ CLICK pannaley dropdown show
                }}
                onKeyDown={handleAgentKeyDown}
                placeholder=""
                style={{
                  border: "none",
                  outline: "none",
                  minWidth: "140px",
                  flex: "1 1 140px",
                  background: "transparent",
                }}
              />

              {/* Dropdown */}
              {showAgentDropdown && filteredAgentList.length > 0 && (
                <ul
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "4px 0",
                    marginTop: "2px",
                    listStyle: "none",
                    maxHeight: "160px",
                    overflowY: "auto",
                    zIndex: 100,
                  }}
                >
                  {filteredAgentList.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => addAgent(item)}
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
        </div>

        {/* ACCORDION SECTIONS (same your code untouched) */}
        <div className="panel-accordion">
          {/* --- STATUS DETAILS --- */}
          <AccordionItem
            title="Status Details"
            isOpen={accordionOpen.statusDetails}
            onToggle={() => toggleAccordion("statusDetails")}
          >
            <div className="accordion-body">
              <div className="contact-details">
                <div className="detail-row">
                  <span className="detail-label">User Active Status :</span>
                  <span className="detail-value">21 hrs ago</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Last Active Conversation :</span>
                  <span className="detail-value">30-10-2025</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Template Messages :</span>
                  <span className="detail-value">363</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Session Messages :</span>
                  <span className="detail-value">243</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">First User Message :</span>
                  <span className="detail-value">catalog</span>
                </div>
              </div>
            </div>
          </AccordionItem>

          {/* --- ACTIVE SESSIONS --- */}
          <AccordionItem
            title="Active Sessions"
            isOpen={accordionOpen.activeSessions}
            onToggle={() => toggleAccordion("activeSessions")}
          >
            <div className="accordion-body text-center">
              <p className="text-sm text-muted text-center">
                User service window - Utility
              </p>
              <button
                style={{ cursor: "not-allowed" }}
                type="button"
                className="btn-primary"
              >
                00 : 00 : 00
              </button>
            </div>
          </AccordionItem>

          {/* --- CUSTOMER JOURNEY --- */}
          <AccordionItem
            title="Customer Journey"
            isOpen={accordionOpen.customerJourney}
            onToggle={() => toggleAccordion("customerJourney")}
          >
            <div className="accordion-body">
              <div className="journal-entry">
                <div className="journal-row">
                  <span className="detail-label">
                    Status :{" "}
                    <span className="journal-body">Assigned to Vignesh</span>
                  </span>
                  <span className="journal-mute">
                    Date : <span className="">Assigned to Vignesh</span>
                  </span>
                </div>
              </div>

              {/* Other rows remain same */}
            </div>
          </AccordionItem>

          {/* --- TAGS --- */}
          <AccordionItem
            title="Tags"
            isOpen={accordionOpen.tags}
            onToggle={() => toggleAccordion("tags")}
          >
            <div className="accordion-body">
              {/* Tags Input Section */}
              <div className="mb-3">
                <div
                  className="d-flex flex-wrap p-2 border rounded position-relative"
                  style={{ minHeight: "48px", alignItems: "center", cursor: "text", gap: "3px" }}
                  onClick={() => {
                    document.getElementById("tagInputBox").focus();
                  }}
                >
                  {/* Existing Tags */}
                  {tags.length > 0 ? (
                    tags.map((tag, index) => (
                      <span
                        key={index}
                        
                        style={{
                          fontSize: "14px",
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          background: "#1f1750",
                          color: "#fff",
                        }}
                      >
                        {tag}
                        <Icon
                          icon="material-symbols:close-rounded"
                          style={{
                            fontSize: "16px",
                            marginLeft: "8px",
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

                  {/* Input */}
                  <input
                    id="tagInputBox"
                    type="text"
                    className="form-control"
                    value={newTag}
                    onChange={(e) => {
                      setNewTag(e.target.value);
                    }}
                    onKeyDown={handleTagKeyDown}
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
                </div>
              </div>
            </div>
          </AccordionItem>

          {/* --- NOTES --- */}
          <AccordionItem
            title="Notes"
            isOpen={accordionOpen.notes}
            onToggle={() => toggleAccordion("notes")}
          >
            <div className="accordion-body">
              <textarea
                className="form-control"
                placeholder="Add your notes here..."
                rows="4"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              ></textarea>
              <div className="text-center mt-12">
                <button type="button" className="btn-primary">
                  Add Note
                </button>
              </div>
            </div>
          </AccordionItem>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;

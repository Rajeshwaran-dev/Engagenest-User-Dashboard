import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSnackbar } from "notistack";

export default function InteractiveActions({
  selectedActions,
  onActionSelection,
  ctaList,
  onAddCta,
  onRemoveCta,
  onUpdateCta,
  quickReplies,
  onAddQuickReply,
  onRemoveQuickReply,
  selectedFlow,
  onFlowChange,
  errors,
  isActionDropdownOpen,
  setIsActionDropdownOpen
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [ctaData, setCtaData] = useState({
    actionType: "",
    buttonName: "",
    url: "",
    phoneNumber: "",
    countryCode: "+91",
    urlType: "Static"
  });

  const [newQuickReply, setNewQuickReply] = useState("");

  // Create a ref for the dropdown
  const dropdownRef = useRef(null);

  // Calculate total actions count
  const totalActionsCount = ctaList.length + quickReplies.length;
  const maxTotalActions = 10;
  const actionsLeft = maxTotalActions - totalActionsCount;

  // Maximum CTAs allowed
  const maxCTAs = 3;
  const ctaLeft = maxCTAs - ctaList.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsActionDropdownOpen(false);
      }
    };

    if (isActionDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActionDropdownOpen, setIsActionDropdownOpen]);

  const handleActionSelection = (actionType) => {
    onActionSelection(actionType);
    setIsActionDropdownOpen(false); // Close dropdown after selection
  };

  const handleCtaChange = (field, value) => {
    setCtaData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addCallToAction = () => {
    // Check CTA limit (max 3)
    if (ctaList.length >= maxCTAs) {
      enqueueSnackbar(`Maximum ${maxCTAs} Call To Actions allowed`, {
        variant: 'error',
        autoHideDuration: 3000
      });
      return;
    }

    // Check total actions limit
    if (totalActionsCount >= maxTotalActions) {
      enqueueSnackbar(`Maximum ${maxTotalActions} total actions (Call To Action + Quick Replies) allowed`, {
        variant: 'error',
        autoHideDuration: 3000
      });
      return;
    }

    // Validate required fields
    if (!ctaData.actionType) {
      enqueueSnackbar('Please select Action Type', {
        variant: 'error',
        autoHideDuration: 3000
      });
      return;
    }

    if (!ctaData.buttonName?.trim()) {
      enqueueSnackbar('Please enter Button Name', {
        variant: 'error',
        autoHideDuration: 3000
      });
      return;
    }

    if (ctaData.actionType === "phone" && !ctaData.phoneNumber?.trim()) {
      enqueueSnackbar('Please enter Phone Number', {
        variant: 'error',
        autoHideDuration: 3000
      });
      return;
    }

    if (ctaData.actionType === "url" && !ctaData.url?.trim()) {
      enqueueSnackbar('Please enter URL', {
        variant: 'error',
        autoHideDuration: 3000
      });
      return;
    }

    // Add the CTA
    const ctaToAdd = {
      ...ctaData,
      id: Date.now(),
      title: ctaData.buttonName,
      url: ctaData.actionType === "phone"
        ? `${ctaData.countryCode}${ctaData.phoneNumber}`
        : ctaData.url
    };

    onAddCta(ctaToAdd);

    // Show success message
    enqueueSnackbar('Call To Action added successfully!', {
      variant: 'success',
      autoHideDuration: 2000
    });

    setCtaData({
      actionType: "",
      buttonName: "",
      url: "",
      phoneNumber: "",
      countryCode: "+91",
      urlType: "Static"
    });
  };

  const addQuickReply = () => {
    // Check total actions limit
    if (totalActionsCount >= maxTotalActions) {
      enqueueSnackbar(`Maximum ${maxTotalActions} total actions (Call To Action + Quick Replies) allowed`, {
        variant: 'error',
        autoHideDuration: 3000
      });
      return;
    }

    if (newQuickReply.trim() && quickReplies.length < 10) {
      onAddQuickReply(newQuickReply.trim());

      // Show success message
      enqueueSnackbar('Quick Reply added successfully!', {
        variant: 'success',
        autoHideDuration: 2000
      });

      setNewQuickReply("");
    } else if (!newQuickReply.trim()) {
      enqueueSnackbar('Please enter Quick Reply text', {
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  };

  const isFlowsSelected = selectedActions.includes("flows");
  const isOtherActionsSelected =
    selectedActions.includes("callToAction") ||
    selectedActions.includes("quickReply");

  return (
    <div className="interactive-actions-section">
      <div className="d-flex justify-content-between align-items-center">
        <label className="form-label">
          Interactive Actions (Optional)
        </label>

        {/* Add ref to the dropdown container */}
        <div className="action-dropdown" ref={dropdownRef}>
          <button
            style={{ width: "180px" }}
            type="button"
            className="action-dropdown-toggle d-flex align-items-center justify-content-between"
            onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)}
          >
            Select Action
            <Icon
              icon={isActionDropdownOpen ? "mingcute:up-line" : "mingcute:down-line"}
              style={{ fontSize: "16px", marginLeft: "8px" }}
            />
          </button>

          {isActionDropdownOpen && (
            <div className="action-dropdown-menu">
              <label className="action-dropdown-item">
                <input
                  className="form-check-input"
                  checked={selectedActions.includes("callToAction")}
                  onChange={() => handleActionSelection("callToAction")}
                  type="checkbox"
                  disabled={isFlowsSelected}
                />
                <span className={isFlowsSelected ? "disabled-text" : ""}>
                  Call To Action
                </span>
              </label>

              <label className="action-dropdown-item">
                <input
                  checked={selectedActions.includes("quickReply")}
                  onChange={() => handleActionSelection("quickReply")}
                  className="form-check-input"
                  type="checkbox"
                  disabled={isFlowsSelected}
                />
                <span className={isFlowsSelected ? "disabled-text" : ""}>
                  Quick Reply
                </span>
              </label>

              <label className="action-dropdown-item">
                <input
                  checked={selectedActions.includes("flows")}
                  onChange={() => handleActionSelection("flows")}
                  className="form-check-input"
                  type="checkbox"
                  disabled={isOtherActionsSelected}
                />
                <span className={isOtherActionsSelected ? "disabled-text" : ""}>
                  Flows
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Show selected action content */}
      <div className="action-content">
        {selectedActions.includes("callToAction") && (
          <CallToActionSection
            ctaList={ctaList}
            onRemoveCta={onRemoveCta}
            onUpdateCta={onUpdateCta}
            ctaData={ctaData}
            onCtaChange={handleCtaChange}
            onAddCta={addCallToAction}
            onRemoveAction={() => handleActionSelection("callToAction")}
            errors={errors}
            actionsLeft={actionsLeft}
            ctaLeft={ctaLeft}
            maxCTAs={maxCTAs}
          />
        )}

        {selectedActions.includes("quickReply") && (
          <QuickReplySection
            quickReplies={quickReplies}
            onRemoveQuickReply={onRemoveQuickReply}
            newQuickReply={newQuickReply}
            onNewQuickReplyChange={setNewQuickReply}
            onAddQuickReply={addQuickReply}
            onRemoveAction={() => handleActionSelection("quickReply")}
            errors={errors}
            actionsLeft={actionsLeft}
          />
        )}

        {selectedActions.includes("flows") && (
          <FlowsSection
            selectedFlow={selectedFlow}
            onFlowChange={onFlowChange}
            onRemoveAction={() => handleActionSelection("flows")}
            errors={errors}
          />
        )}
      </div>
    </div>
  );
}

// Call To Action Component - Editable Version
function CallToActionSection({
  ctaList,
  onRemoveCta,
  onUpdateCta,
  ctaData,
  onCtaChange,
  onAddCta,
  onRemoveAction,
  errors,
  actionsLeft,
  ctaLeft,
  maxCTAs
}) {
  const { enqueueSnackbar } = useSnackbar();

  const handleUpdateCta = (id, field, value) => {
    const updatedCtaList = ctaList.map(cta => {
      if (cta.id === id) {
        // If actionType is changing, reset relevant fields
        if (field === "actionType") {
          return {
            ...cta,
            actionType: value,
            // Reset fields based on new action type
            url: value === "url" ? "" : undefined,
            phoneNumber: value === "phone" ? "" : undefined,
            countryCode: value === "phone" ? "+91" : undefined,
            urlType: value === "url" ? "Static" : undefined
          };
        }
        return { ...cta, [field]: value };
      }
      return cta;
    });

    if (onUpdateCta) {
      onUpdateCta(updatedCtaList);
    }
  };

  const handlePhoneNumberUpdate = (id, countryCode, phoneNumber) => {
    const updatedCtaList = ctaList.map(cta =>
      cta.id === id ? {
        ...cta,
        countryCode,
        phoneNumber,
        url: `${countryCode}${phoneNumber}`
      } : cta
    );
    if (onUpdateCta) {
      onUpdateCta(updatedCtaList);
    }
  };

  const handleRemoveCta = (id) => {
    onRemoveCta(id);
    enqueueSnackbar('Call To Action removed', {
      variant: 'success',
      autoHideDuration: 2000
    });
  };

  return (
    <div className="action-section">
      <div className="action-section-header">
        <div className="action-section-title">Call To Action</div>
        <button
          type="button"
          onClick={onRemoveAction}
          className="delete-icon-btn"
          title="Remove Call To Action"
        >
          <Icon icon="material-symbols:close-rounded" />
        </button>
      </div>

      {/* Added CTAs List - Editable */}
      {ctaList.map((cta, index) => (
        <div key={cta.id} className="cta-item editable-cta-item">
          <div className="cta-header">
            <button
              type="button"
              onClick={() => handleRemoveCta(cta.id)}
              className="cta-remove"
            >
              ×
            </button>
          </div>
          <div className="cta-row-layout">
            <div className="action-input-group">
              <label>Action Type</label>
              <select
                value={cta.actionType}
                onChange={(e) => handleUpdateCta(cta.id, "actionType", e.target.value)}
                className="form-select"
              >
                <option value="url">URL</option>
                <option value="phone">Phone Number</option>
              </select>
            </div>

            {cta.actionType === "url" && (
              <div className="action-input-group">
                <label>URL Type</label>
                <select
                  value={cta.urlType || "Static"}
                  onChange={(e) => handleUpdateCta(cta.id, "urlType", e.target.value)}
                  className="form-select"
                >
                  <option value="Static">Static</option>
                  <option value="Dynamic">Dynamic</option>
                </select>
              </div>
            )}

            <div className="action-input-group">
              <label>Button Name</label>
              <input
                type="text"
                placeholder="Enter button name"
                value={cta.buttonName}
                onChange={(e) => handleUpdateCta(cta.id, "buttonName", e.target.value)}
                className="action-input"
              />
            </div>

            {cta.actionType === "phone" ? (
              <>
                <div className="action-input-group">
                  <label>Country Code</label>
                  <select
                    value={cta.countryCode || "+91"}
                    onChange={(e) => handlePhoneNumberUpdate(cta.id, e.target.value, cta.phoneNumber)}
                    className="form-select"
                  >
                    <option value="+91">+91 (India)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+86">+86 (China)</option>
                  </select>
                </div>
                <div className="action-input-group">
                  <label>Phone Number</label>

                  <input
                    type="text"   // changed to text to avoid e,+,-, scroll issues
                    placeholder="Enter phone number"
                    value={cta.phoneNumber || ""}
                    onChange={(e) => {
                      const value = e.target.value;

                      // Allow only numbers
                      if (/^\d*$/.test(value)) {
                        // Max 10 digits
                        if (value.length <= 10) {
                          handlePhoneNumberUpdate(
                            cta.id,
                            cta.countryCode || "+91",
                            value
                          );
                        }
                      }
                    }}
                    className="action-input"
                  />

                  {/* Error message */}
                  {cta.phoneNumber &&
                    cta.phoneNumber.length !== 10 && (
                      <small style={{ color: "red" }}>
                        Ph no exactly 10 digits
                      </small>
                    )}
                </div>

              </>
            ) : (
              <div className="action-input-group">
                <label>URL</label>
                <input
                  type="url"
                  placeholder="Enter URL"
                  value={cta.url}
                  onChange={(e) => handleUpdateCta(cta.id, "url", e.target.value)}
                  className="action-input"
                />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Current CTA Input Form - For adding new CTAs */}
      {ctaList.length < maxCTAs && (
        <div className="cta-input-section">
          <div className="cta-input-form">
            <div className="cta-row-layout">
              <div className="action-input-group">
                <label>Action Type</label>
                <select
                  className="form-select"
                  value={ctaData.actionType}
                  onChange={(e) => onCtaChange("actionType", e.target.value)}
                >
                  <option value="">Select Action</option>
                  <option value="url">URL</option>
                  <option value="phone">Phone Number</option>
                </select>
              </div>

              {ctaData.actionType === "url" && (
                <div className="action-input-group">
                  <label>URL Type</label>
                  <select
                    className="form-select"
                    value={ctaData.urlType}
                    onChange={(e) => onCtaChange("urlType", e.target.value)}
                  >
                    <option value="Static">Static</option>
                    <option value="Dynamic">Dynamic</option>
                  </select>
                </div>
              )}

              <div className="action-input-group">
                <label>Button Name</label>
                <input
                  type="text"
                  placeholder="Enter button name"
                  value={ctaData.buttonName}
                  onChange={(e) => onCtaChange("buttonName", e.target.value)}
                  className="action-input"
                />
              </div>

              {ctaData.actionType === "phone" ? (
                <>
                  <div className="action-input-group">
                    <label>Country Code</label>
                    <select
                      className="form-select"
                      value={ctaData.countryCode}
                      onChange={(e) => onCtaChange("countryCode", e.target.value)}
                    >
                      <option value="+91">+91 (India)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+86">+86 (China)</option>
                    </select>
                  </div>
                  <div className="action-input-group">
                    <label>Phone Number</label>

                    <input
                      type="text"  // changed to text (to prevent e,+,-, scroll issues)
                      placeholder="Enter phone number"
                      value={ctaData.phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value;

                        // allow only digits
                        if (/^\d*$/.test(value)) {
                          // limit to 10 digits
                          if (value.length <= 10) {
                            onCtaChange("phoneNumber", value);
                          }
                        }
                      }}
                      className="action-input"
                    />

                    {/* validation error */}
                    {ctaData.phoneNumber &&
                      ctaData.phoneNumber.length !== 10 && (
                        <small style={{ color: "red" }}>
                          Ph no exactly 10 digits
                        </small>
                      )}
                  </div>

                </>
              ) : ctaData.actionType === "url" ? (
                <div className="action-input-group">
                  <label>URL</label>
                  <input
                    type="url"
                    placeholder="Enter URL"
                    value={ctaData.url}
                    onChange={(e) => onCtaChange("url", e.target.value)}
                    className="action-input"
                  />
                </div>
              ) : (
                <>
                  <div className="action-input-group"></div>
                  <div className="action-input-group"></div>
                </>
              )}
            </div>

            <div className="d-flex justify-content-center">
              <button
                type="button"
                onClick={onAddCta}
                disabled={actionsLeft <= 0}
                className="btn-primary d-flex align-items-center gap-2 mt-3"
              >
                <Icon icon="mingcute:add-line" />
                Add Call To Action
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="cta-counter">
        {ctaList.length} / {maxCTAs} Call To Actions added | {ctaLeft} CTA slots left | {actionsLeft} total actions left
      </div>

      {ctaList.length >= maxCTAs && (
        <div className="text-center text-danger mt-2">
          Maximum {maxCTAs} Call To Actions reached
        </div>
      )}

      {errors.ctaList && (
        <div className="error-message">{errors.ctaList}</div>
      )}
    </div>
  );
}

// Quick Reply Component
function QuickReplySection({ quickReplies, onRemoveQuickReply, newQuickReply, onNewQuickReplyChange, onAddQuickReply, onRemoveAction, errors, actionsLeft }) {
  const { enqueueSnackbar } = useSnackbar();

  const handleRemoveQuickReply = (index) => {
    onRemoveQuickReply(index);
    enqueueSnackbar('Quick Reply removed', {
      variant: 'success',
      autoHideDuration: 2000
    });
  };

  return (
    <div className="action-section">
      <div className="action-section-header">
        <div className="action-section-title">Quick Reply</div>
        <button
          type="button"
          onClick={onRemoveAction}
          className="delete-icon-btn"
          title="Remove Quick Reply"
        >
          <Icon icon="material-symbols:close-rounded" />
        </button>
      </div>

      {quickReplies.map((reply, index) => (
        <div key={index} className="quick-reply-item">
          <div className="quick-reply-header">
            <span className="quick-reply-title">Button Title</span>
            <button
              type="button"
              onClick={() => handleRemoveQuickReply(index)}
              className="quick-reply-remove"
            >
              ×
            </button>
          </div>
          <input
            type="text"
            value={reply}
            readOnly
            className="action-input"
            style={{ background: "#f5f5f5" }}
          />
        </div>
      ))}

      <div className="quick-reply-item">
        <div className="quick-reply-header">
          <span className="quick-reply-title">Button Title</span>
        </div>

        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Enter quick reply text"
            value={newQuickReply}
            onChange={(e) => onNewQuickReplyChange(e.target.value)}
            className="action-input"
            maxLength={25}
          />

          <span className="char-inline">
            {newQuickReply.length} / 25
          </span>
        </div>
      </div>

      <div className="quick-reply-counter">
        {quickReplies.length} quick replies added | {actionsLeft} / 10 actions left
      </div>

      <div className="d-flex align-items-center justify-content-center">
        <button
          type="button"
          onClick={onAddQuickReply}
          disabled={!newQuickReply.trim() || actionsLeft <= 0}
          className="btn-primary d-flex align-items-center gap-2 mt-3"
        >
          <Icon icon="mingcute:add-line" />
          Add Quick Reply
        </button>
      </div>

      {errors.quickReplies && (
        <div className="error-message">{errors.quickReplies}</div>
      )}
    </div>
  );
}

// Flows Component
function FlowsSection({ selectedFlow, onFlowChange, onRemoveAction, errors }) {
  return (
    <div className="action-section">
      <div className="action-section-header">
        <div className="action-section-title">Flows</div>
        <button
          type="button"
          onClick={onRemoveAction}
          className="delete-icon-btn"
          title="Remove Flows"
        >
          <Icon icon="material-symbols:close-rounded" />
        </button>
      </div>

      <div className="flows-section">
        <div className="flows-input-group">
          <label>Select a Flow</label>
          <div className="flows-select-container">
            <select
              className="flows-select"
              value={selectedFlow}
              onChange={(e) => onFlowChange(e.target.value)}
            >
              <option value="">Select Flow...</option>
              <option value="Happy-street">Happy street</option>
              <option value="Welcome-flow">Welcome Flow</option>
              <option value="Support-flow">Support Flow</option>
            </select>
            {selectedFlow && (
              <div className="flows-checkmark">✔</div>
            )}
          </div>
        </div>

        {selectedFlow && (
          <div className="selected-flow-info">
            <span className="selected-flow-text">
              Selected Flow:{" "}
              {selectedFlow === "happy-street" ? "happy street" : selectedFlow}
            </span>
          </div>
        )}

        {!selectedFlow && (
          <div className="flows-not-selected">
            <span className="flows-not-selected-text">
              Flow not selected
            </span>
          </div>
        )}

        <div className="flows-actions">
          <input
            type="text"
            placeholder="Label"
            className="flows-label-input"
            disabled={!selectedFlow}
          />
          <button
            type="button"
            className="flows-action-btn flows-remove-btn"
          >
            Remove
          </button>
        </div>
      </div>

      {errors.flows && (
        <div className="error-message">{errors.flows}</div>
      )}
    </div>
  );
}
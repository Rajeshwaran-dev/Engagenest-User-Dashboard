// GroupActionModal.jsx
import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const GroupActionModal = ({
  modalType,
  onClose,
  onSubmit,
  formData,
  moveData,
  copyData,
  onInputChange,
  onMoveChange,
  onCopyChange,
  availableGroups = []
}) => {
  if (!modalType) return null;

  const renderModalContent = () => {
    switch (modalType) {
      case "edit":
        return (
          <div className="modal-content" style={{ width: "500px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ marginTop: "2px" }}>
                Edit Group
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              >
                <Icon icon="mingcute:close-line" />
              </button>
            </div>
            <div className="modal-body p-30">
              <div className="mb-4">
                <input
                  type="text"
                  className="form-control form-control-lg py-3"
                  id="groupName"
                  name="groupName"
                  value={formData.groupName}
                  onChange={onInputChange}
                  placeholder="New Group"
                  required
                  maxLength={30}
                />
                <div className="form-text text-end" style={{ fontSize: "12px", marginTop: "8px" }}>
                  {formData.groupName.length} / 30
                </div>
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
                OK
              </button>
            </div>
          </div>
        );

      case "move":
        return (
          <div className="modal-content" style={{ width: "500px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ marginTop: "2px" }}>
                Move Group
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              >
                <Icon icon="mingcute:close-line" />
              </button>
            </div>
            <div className="modal-body p-30">
              <div className="mb-4">
                <label
                  style={{ color: "var(--text-secondary)" }}
                  className="form-label fw-semibold text-dark"
                >
                  Current Group: <strong>{moveData.currentGroup}</strong>
                </label>
              </div>

              <div className="mb-4">
                <label
                  style={{ color: "var(--text-secondary)" }}
                  className="form-label fw-semibold text-dark"
                >
                  Select a group to move to:
                </label>
                <select
                  className="form-select form-select-lg py-3"
                  name="availableGroups"
                  value={moveData.availableGroups}
                  onChange={onMoveChange}
                  required
                >
                  <option value="">Select</option>
                  {availableGroups.map((group, index) => (
                    <option key={index} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
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
                Move
              </button>
            </div>
          </div>
        );

      case "copy":
        return (
          <div className="modal-content" style={{ width: "500px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ marginTop: "2px" }}>
                Copy Contacts to {moveData.currentGroup}
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              >
                <Icon icon="mingcute:close-line" />
              </button>
            </div>
            <div className="modal-body p-30">
              <div className="mb-4">
                <label
                  style={{ color: "var(--text-secondary)" }}
                  className="form-label fw-semibold text-dark"
                >
                  Copy contacts from:
                </label>
                <select
                  className="form-select form-select-lg py-3"
                  name="sourceGroup"
                  value={copyData.sourceGroup}
                  onChange={onCopyChange}
                  required
                >
                  <option value="">Select</option>
                  {availableGroups.map((group, index) => (
                    <option key={index} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
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
                OK
              </button>
            </div>
          </div>
        );

      case "delete":
        return (
          <div className="modal-content" style={{ width: "500px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ marginTop: "2px" }}>
                Delete Confirmation
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              >
                <Icon icon="mingcute:close-line" />
              </button>
            </div>
            <div className="modal-body p-30">
              <p className="text-primary-2" style={{ margin: 0, fontSize: "16px" }}>
                Are you sure you want to delete the group "{moveData.currentGroup}"?
              </p>
              <p className="text-muted mt-2">
                This will remove the group from all contacts but won't delete the contacts themselves.
              </p>
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
                OK
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

export default GroupActionModal;